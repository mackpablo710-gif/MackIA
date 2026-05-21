import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../../middleware/auth.middleware'
import { creditsMiddleware, deductCredits } from '../../middleware/credits.middleware'
import { generateWithAI } from '../../services/gemini.service'
import { buildVideoScriptPrompt } from '../../prompts/videoScripter.prompt'
import { generateVideoWithReplicate, downloadVideoBuffer } from '../../services/videoGen.service'
import { supabase } from '../../lib/supabase'

const router = Router()

// ── Script generation ──────────────────────────────────────────────────────
router.post('/script', authMiddleware, creditsMiddleware('video_script'), async (req: AuthRequest, res: Response) => {
  const { campaign, video_type, duration, style, platform, campaign_id } = req.body

  if (!campaign) return res.status(400).json({ error: 'campaign required' })

  const vtype = video_type ?? 'Persona hablando a cámara'
  const dur = duration ?? '30 segundos'
  const sty = style ?? 'Dinámico y rápido'
  const plat = platform ?? 'instagram'

  try {
    console.log('[video-script] generating for campaign:', (campaign as Record<string, unknown>).title ?? 'unknown')

    const result = await generateWithAI<Record<string, unknown>>(
      buildVideoScriptPrompt(campaign, vtype, dur, sty, plat),
      undefined,
      8000
    )

    console.log('[video-script] AI response OK, saving to DB...')

    let contentId: string | undefined
    try {
      const { data: content, error: dbErr } = await supabase.from('content_pieces').insert({
        user_id: req.user!.id,
        campaign_id: campaign_id ?? null,
        type: 'video_script',
        platform: plat,
        video_script: result,
      }).select('id').single()

      if (dbErr) console.error('[video-script] DB insert error:', dbErr.message)
      else contentId = content?.id
    } catch (dbErr) {
      console.error('[video-script] DB insert failed (non-fatal):', (dbErr as Error).message)
    }

    if (contentId) {
      await deductCredits(req.user!.id, 'video_script', contentId).catch(e =>
        console.error('[video-script] deduct credits failed:', e.message)
      )
    }

    res.json({ script: result, content_id: contentId })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[video-script] FAILED:', message)
    res.status(500).json({ error: 'Video script generation failed', detail: message })
  }
})

// ── Actual video generation (Replicate / Kling) ────────────────────────────
router.post('/render', authMiddleware, creditsMiddleware('video_render'), async (req: AuthRequest, res: Response) => {
  const { script, campaign, platform, duration_seconds, campaign_id } = req.body

  if (!script && !campaign) return res.status(400).json({ error: 'script or campaign required' })

  // Check if Replicate is configured
  if (!process.env.REPLICATE_API_TOKEN) {
    return res.status(503).json({
      error: 'Video generation not configured',
      detail: 'Add REPLICATE_API_TOKEN to your .env file. Get your free API key at replicate.com',
      setup_url: 'https://replicate.com/account/api-tokens',
    })
  }

  try {
    // Build a high-quality video prompt from the script
    const videoPrompt = buildVideoGenPrompt(script, campaign, platform)
    const aspectRatio = (platform === 'linkedin') ? '16:9' : '9:16'
    const durationSec: 5 | 10 = (duration_seconds ?? 5) >= 8 ? 10 : 5

    console.log('[video-render] generating', durationSec, 'sec video...')
    const videoUrl = await generateVideoWithReplicate(videoPrompt, durationSec, aspectRatio)

    // Download and upload to Supabase
    console.log('[video-render] downloading video...')
    const videoBuffer = await downloadVideoBuffer(videoUrl)
    const fileName = `videos/${req.user!.id}/${Date.now()}.mp4`

    const { error: uploadErr } = await supabase.storage
      .from('brand-assets')
      .upload(fileName, videoBuffer, { contentType: 'video/mp4', upsert: true })

    if (uploadErr) {
      console.warn('[video-render] storage upload failed, returning direct URL')
      return res.json({ video_url: videoUrl, source: 'direct' })
    }

    const { data: { publicUrl } } = supabase.storage.from('brand-assets').getPublicUrl(fileName)

    // Save to DB
    const { data: content } = await supabase.from('content_pieces').insert({
      user_id: req.user!.id,
      campaign_id: campaign_id ?? null,
      type: 'video_render',
      platform: platform ?? 'instagram',
      video_url: publicUrl,
      video_script: script ?? null,
    }).select('id').single()

    await deductCredits(req.user!.id, 'video_render', content?.id).catch(() => {})
    res.json({ video_url: publicUrl, content_id: content?.id })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[video-render] FAILED:', message)
    res.status(500).json({ error: 'Video rendering failed', detail: message })
  }
})

function buildVideoGenPrompt(script: Record<string, unknown> | null, campaign: Record<string, unknown> | null, platform: string): string {
  if (script) {
    // Extract visual elements from the script
    const scenes = (script.scenes as Array<{ visual?: string; voiceover?: string }>) ?? []
    const firstScene = scenes[0]
    const castingNotes = script.casting_notes as string ?? ''
    const musicStyle = script.music_style as string ?? ''
    const hook = script.hook as string ?? ''

    return [
      castingNotes ? `Person: ${castingNotes}` : 'Young professional, authentic look, casual business attire',
      firstScene?.visual ? `Scene: ${firstScene.visual}` : `Person speaking to camera with genuine emotion about: ${campaign?.concept ?? 'the product'}`,
      `Action: Natural gestures, expressive facial expressions, dynamic movement, making eye contact with camera`,
      `Speaking about: "${hook}"`,
      castingNotes ? '' : 'Confident posture, hand gestures that emphasize points',
      musicStyle ? `Mood: ${musicStyle}` : 'Energetic, authentic, relatable',
      `Platform: ${platform === 'tiktok' ? 'TikTok vertical video' : 'Instagram Reels vertical'}`,
      'High quality, good lighting, sharp focus, cinematic look, no text overlays',
    ].filter(Boolean).join('. ')
  }

  return `Professional person speaking directly to camera with natural gestures and expression,
    authentic style, good lighting, ${platform === 'linkedin' ? 'professional setting' : 'modern casual environment'},
    dynamic movement, cinematic quality, no text overlays`
}

export default router
