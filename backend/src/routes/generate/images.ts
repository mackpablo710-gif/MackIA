import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../../middleware/auth.middleware'
import { creditsMiddleware, deductCredits } from '../../middleware/credits.middleware'
import { generateWithAI } from '../../services/gemini.service'
import { generateImageBuffer } from '../../services/imageGen.service'
import { buildImagePrompt } from '../../prompts/imageBuilder.prompt'
import { supabase } from '../../lib/supabase'

const router = Router()

router.post('/prompt', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { campaign, headline, subheadline, cta, platform, format, tone, brandIdentity, logoUrl, visualStyle } = req.body

  try {
    const result = await generateWithAI<Record<string, unknown>>(
      buildImagePrompt(campaign, headline, subheadline, cta, platform, format ?? 'post', tone ?? 'moderno', brandIdentity, logoUrl, visualStyle)
    )
    res.json({ image_data: result })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[image-prompt]', message)
    res.status(500).json({ error: 'Image prompt generation failed', detail: message })
  }
})

router.post('/generate', authMiddleware, creditsMiddleware('image'), async (req: AuthRequest, res: Response) => {
  const { image_prompt, dimensions, campaign_id, content_id } = req.body

  if (!image_prompt) return res.status(400).json({ error: 'image_prompt required' })

  try {
    console.log('[image] generating from Pollinations...')
    const imageBuffer = await generateImageBuffer(image_prompt, dimensions ?? '1:1')

    const fileName = `generated/${req.user!.id}/${Date.now()}.png`
    const { error: uploadErr } = await supabase.storage
      .from('brand-assets')
      .upload(fileName, imageBuffer, { contentType: 'image/png', upsert: true })

    if (uploadErr) throw new Error('Storage upload failed: ' + uploadErr.message)

    const { data: { publicUrl } } = supabase.storage.from('brand-assets').getPublicUrl(fileName)
    console.log('[image] stored at:', publicUrl)

    if (content_id) {
      await supabase.from('content_pieces').update({ image_url: publicUrl, image_prompt }).eq('id', content_id)
      await deductCredits(req.user!.id, 'image', content_id)
      return res.json({ image_url: publicUrl })
    }

    const { data: content } = await supabase.from('content_pieces').insert({
      user_id: req.user!.id,
      campaign_id: campaign_id ?? null,
      type: 'image',
      image_prompt,
      image_url: publicUrl,
    }).select().single()

    await deductCredits(req.user!.id, 'image', content?.id)
    res.json({ image_url: publicUrl, content_id: content?.id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[image-generate]', message)
    res.status(500).json({ error: 'Image generation failed', detail: message })
  }
})

export default router
