import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../../middleware/auth.middleware'
import { creditsMiddleware, deductCredits } from '../../middleware/credits.middleware'
import { generateWithAI } from '../../services/gemini.service'
import { buildCampaignsPrompt } from '../../prompts/campaigns.prompt'
import { supabase } from '../../lib/supabase'

const router = Router()

router.post('/', authMiddleware, creditsMiddleware('ideas'), async (req: AuthRequest, res: Response) => {
  const { analysis, objective, platforms, tone, business_id } = req.body

  // ── 1. Validate required fields ──────────────────────────────
  console.log('[campaigns] payload:', JSON.stringify({ objective, platforms, tone, hasAnalysis: !!analysis }))

  if (!analysis) return res.status(400).json({ error: 'Falta el análisis del negocio. Vuelve al paso anterior.' })
  if (!objective) return res.status(400).json({ error: 'Falta el objetivo de campaña.' })

  try {
    // ── 2. Generate with Gemini (more tokens for 10 campaigns) ──
    const prompt = buildCampaignsPrompt(
      analysis,
      objective,
      platforms ?? ['instagram'],
      tone ?? 'profesional'
    )
    console.log('[campaigns] calling Gemini 2.5 Flash...')

    const result = await generateWithAI<{ campaigns: unknown[] }>(prompt, 'Procede.', 24000)

    if (!result?.campaigns?.length) {
      console.error('[campaigns] Gemini returned empty campaigns')
      return res.status(500).json({ error: 'La IA no generó campañas. Intenta de nuevo.' })
    }

    console.log(`[campaigns] generated ${result.campaigns.length} campaigns OK`)

    // ── 3. Save to DB ──────────────────────────────────────────
    const { data: campaign, error: dbErr } = await supabase.from('campaigns').insert({
      user_id: req.user!.id,
      business_id: business_id ?? null,
      objective,
      platforms: platforms ?? ['instagram'],
      brief: { tone },
      analysis,
      ideas: result.campaigns,
      status: 'ideas_generated',
    }).select().single()

    if (dbErr) console.error('[campaigns] DB error:', dbErr.message)

    await deductCredits(req.user!.id, 'ideas', campaign?.id)

    res.json({ campaigns: result.campaigns, campaign_id: campaign?.id })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[campaigns] ERROR:', message)

    if (message.includes('JSON') || message.includes('Unexpected') || message.includes('Unterminated')) {
      return res.status(500).json({ error: 'La IA generó una respuesta incompleta. Intenta de nuevo.' })
    }
    if (message.includes('429') || message.includes('quota')) {
      return res.status(429).json({ error: 'Límite de IA alcanzado. Espera unos segundos e intenta de nuevo.' })
    }
    res.status(500).json({ error: 'Error generando campañas.', detail: message })
  }
})

export default router
