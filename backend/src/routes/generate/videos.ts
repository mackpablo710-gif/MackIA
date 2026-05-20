import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../../middleware/auth.middleware'
import { creditsMiddleware, deductCredits } from '../../middleware/credits.middleware'
import { generateWithAI } from '../../services/gemini.service'
import { buildVideoQuestionsPrompt, buildVideoScriptPrompt } from '../../prompts/videoScripter.prompt'
import { supabase } from '../../lib/supabase'

const router = Router()

router.post('/questions', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { campaign } = req.body
  if (!campaign) return res.status(400).json({ error: 'campaign required' })

  try {
    const result = await generateWithAI<{ questions: unknown[] }>(buildVideoQuestionsPrompt(campaign))
    res.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[video-questions]', message)
    res.status(500).json({ error: 'Video questions failed', detail: message })
  }
})

router.post('/script', authMiddleware, creditsMiddleware('video_script'), async (req: AuthRequest, res: Response) => {
  const { campaign, video_type, duration, style, platform, campaign_id } = req.body

  if (!campaign || !video_type) return res.status(400).json({ error: 'campaign and video_type required' })

  try {
    const result = await generateWithAI<Record<string, unknown>>(
      buildVideoScriptPrompt(campaign, video_type, duration ?? '30 segundos', style ?? 'Dinámico y rápido', platform ?? 'instagram')
    )

    const { data: content } = await supabase.from('content_pieces').insert({
      user_id: req.user!.id,
      campaign_id: campaign_id ?? null,
      type: 'video_script',
      platform: platform ?? 'instagram',
      video_script: result,
      storyboard: result.storyboard_summary ?? null,
    }).select().single()

    await deductCredits(req.user!.id, 'video_script', content?.id)

    res.json({ script: result, content_id: content?.id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[video-script]', message)
    res.status(500).json({ error: 'Video script generation failed', detail: message })
  }
})

export default router
