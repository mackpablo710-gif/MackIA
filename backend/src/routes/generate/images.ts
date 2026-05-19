import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../../middleware/auth.middleware'
import { creditsMiddleware, deductCredits } from '../../middleware/credits.middleware'
import { generateWithOpenAI } from '../../services/openai.service'
import { generateImage, mapDimensionsToSize } from '../../services/imageGen.service'
import { buildImagePrompt } from '../../prompts/imageBuilder.prompt'
import { supabase } from '../../lib/supabase'

const router = Router()

router.post('/prompt', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { campaign, headline, subheadline, cta, platform, format, tone } = req.body

  try {
    const result = await generateWithOpenAI<Record<string, unknown>>(
      buildImagePrompt(campaign, headline, subheadline, cta, platform, format ?? 'post', tone ?? 'moderno')
    )
    res.json({ image_data: result })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Image prompt generation failed' })
  }
})

router.post('/generate', authMiddleware, creditsMiddleware('image'), async (req: AuthRequest, res: Response) => {
  const { image_prompt, dimensions, campaign_id, content_id } = req.body

  if (!image_prompt) return res.status(400).json({ error: 'image_prompt required' })

  try {
    const size = mapDimensionsToSize(dimensions ?? '1:1')
    const imageUrl = await generateImage(image_prompt, size)

    if (content_id) {
      await supabase.from('content_pieces').update({ image_url: imageUrl, image_prompt }).eq('id', content_id)
    } else {
      const { data: content } = await supabase.from('content_pieces').insert({
        user_id: req.user!.id,
        campaign_id: campaign_id ?? null,
        type: 'image',
        image_prompt,
        image_url: imageUrl,
      }).select().single()

      await deductCredits(req.user!.id, 'image', content?.id)
      return res.json({ image_url: imageUrl, content_id: content?.id })
    }

    await deductCredits(req.user!.id, 'image', content_id)
    res.json({ image_url: imageUrl })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Image generation failed' })
  }
})

export default router
