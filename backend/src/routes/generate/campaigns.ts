import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../../middleware/auth.middleware'
import { creditsMiddleware, deductCredits } from '../../middleware/credits.middleware'
import { generateWithOpenAI } from '../../services/openai.service'
import { buildCampaignsPrompt } from '../../prompts/campaigns.prompt'
import { supabase } from '../../lib/supabase'

const router = Router()

router.post('/', authMiddleware, creditsMiddleware('ideas'), async (req: AuthRequest, res: Response) => {
  const { analysis, objective, platforms, tone, business_id } = req.body

  if (!analysis || !objective) {
    return res.status(400).json({ error: 'analysis and objective are required' })
  }

  try {
    const result = await generateWithOpenAI<{ campaigns: unknown[] }>(
      buildCampaignsPrompt(analysis, objective, platforms ?? ['instagram'], tone ?? 'profesional')
    )

    const { data: campaign } = await supabase.from('campaigns').insert({
      user_id: req.user!.id,
      business_id: business_id ?? null,
      objective,
      platforms: platforms ?? ['instagram'],
      brief: { analysis, tone },
      analysis,
      ideas: result.campaigns,
      status: 'ideas_generated',
    }).select().single()

    await deductCredits(req.user!.id, 'ideas', campaign?.id)

    res.json({ campaigns: result.campaigns, campaign_id: campaign?.id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Campaign generation failed' })
  }
})

export default router
