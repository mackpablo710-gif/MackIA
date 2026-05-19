import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../../middleware/auth.middleware'
import { creditsMiddleware, deductCredits } from '../../middleware/credits.middleware'
import { generateWithOpenAI } from '../../services/openai.service'
import { buildPostPrompt, buildCarouselPrompt } from '../../prompts/copywriter.prompt'
import { supabase } from '../../lib/supabase'

const router = Router()

router.post('/post', authMiddleware, creditsMiddleware('post'), async (req: AuthRequest, res: Response) => {
  const { campaign, platform, format, tone, campaign_id } = req.body

  if (!campaign || !platform) return res.status(400).json({ error: 'campaign and platform required' })

  try {
    const result = await generateWithOpenAI<Record<string, unknown>>(
      buildPostPrompt(campaign, platform, format ?? 'post', tone ?? 'profesional')
    )

    const { data: content } = await supabase.from('content_pieces').insert({
      user_id: req.user!.id,
      campaign_id: campaign_id ?? null,
      type: format ?? 'post',
      platform,
      headline: result.headline as string,
      body: result.body_copy as string,
      cta: result.cta as string,
      caption: result.full_caption as string,
      hashtags: result.hashtags as string[],
      quality_score: result.conversion_score as number,
      feedback: result.director_feedback as string,
    }).select().single()

    await deductCredits(req.user!.id, 'post', content?.id)

    res.json({ content: result, content_id: content?.id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Post generation failed' })
  }
})

router.post('/carousel', authMiddleware, creditsMiddleware('carousel'), async (req: AuthRequest, res: Response) => {
  const { campaign, platform, tone, campaign_id } = req.body

  if (!campaign || !platform) return res.status(400).json({ error: 'campaign and platform required' })

  try {
    const result = await generateWithOpenAI<Record<string, unknown>>(
      buildCarouselPrompt(campaign, platform, tone ?? 'profesional')
    )

    const { data: content } = await supabase.from('content_pieces').insert({
      user_id: req.user!.id,
      campaign_id: campaign_id ?? null,
      type: 'carrusel',
      platform,
      caption: result.full_caption as string,
      hashtags: result.hashtags as string[],
      video_script: result,
      feedback: result.director_feedback as string,
    }).select().single()

    await deductCredits(req.user!.id, 'carousel', content?.id)

    res.json({ content: result, content_id: content?.id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Carousel generation failed' })
  }
})

export default router
