import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../../middleware/auth.middleware'
import { generateWithAI } from '../../services/gemini.service'
import { buildAnalystPrompt, buildQuestionsPrompt } from '../../prompts/analyst.prompt'
import { supabase } from '../../lib/supabase'

const router = Router()

router.post('/analyze', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { description, business_id } = req.body
  if (!description) return res.status(400).json({ error: 'Description required' })

  try {
    const analysis = await generateWithAI<Record<string, unknown>>(buildAnalystPrompt(description))

    if (business_id) {
      await supabase.from('businesses').update({
        industry: analysis.industry as string,
        target_audience: (analysis.target_audience as Record<string, string>)?.primary,
        value_prop: analysis.value_proposition as string,
        pain_points: analysis.pain_points as string[],
        benefits: analysis.benefits as string[],
        differentiators: analysis.differentiators as string[],
      }).eq('id', business_id).eq('user_id', req.user!.id)
    }

    res.json({ analysis })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[analyze]', message)
    res.status(500).json({ error: 'Analysis failed', detail: message })
  }
})

router.post('/questions', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { description, missing_context } = req.body
  if (!description) return res.status(400).json({ error: 'Description required' })

  try {
    const result = await generateWithAI<{ questions: unknown[] }>(
      buildQuestionsPrompt(description, missing_context ?? [])
    )
    res.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[questions]', message)
    res.status(500).json({ error: 'Questions generation failed', detail: message })
  }
})

export default router
