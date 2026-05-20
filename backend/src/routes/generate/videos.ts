import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../../middleware/auth.middleware'
import { creditsMiddleware, deductCredits } from '../../middleware/credits.middleware'
import { generateWithAI } from '../../services/gemini.service'
import { buildVideoScriptPrompt } from '../../prompts/videoScripter.prompt'
import { supabase } from '../../lib/supabase'

const router = Router()

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
        storyboard: result.storyboard_summary ? { summary: result.storyboard_summary } : null,
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

export default router
