import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../../middleware/auth.middleware'
import { creditsMiddleware, deductCredits } from '../../middleware/credits.middleware'
import { generateWithAI } from '../../services/gemini.service'
import { renderAdDesign, type AdDesignSpec } from '../../services/adRenderer.service'
import { buildAdDesignPrompt } from '../../prompts/adDesigner.prompt'
import { supabase } from '../../lib/supabase'

const router = Router()

router.post('/design', authMiddleware, creditsMiddleware('image'), async (req: AuthRequest, res: Response) => {
  const {
    campaign, headline, subheadline, cta,
    platform, format, tone, visualStyle,
    brandIdentity, brandName, brandTagline, logoUrl,
    campaign_id, content_id,
  } = req.body

  if (!headline && !campaign) return res.status(400).json({ error: 'headline or campaign required' })

  try {
    // Step 1: Gemini generates the design spec
    console.log('[design] generating spec with Gemini...')
    const spec = await generateWithAI<AdDesignSpec>(
      buildAdDesignPrompt(
        campaign ?? {}, headline ?? '', subheadline ?? '', cta ?? '',
        platform ?? 'instagram', format ?? 'post', tone ?? 'moderno',
        visualStyle ?? 'dark-power',
        brandIdentity, brandName, brandTagline
      )
    )

    // Inject logo URL if provided
    if (logoUrl) spec.logoUrl = logoUrl

    // Ensure dimensions match the requested format
    const dimMap: Record<string, AdDesignSpec['dimensions']> = {
      instagram_post: '4:5', instagram_story: '9:16', instagram_reel: '9:16',
      tiktok_post: '9:16', tiktok_reel: '9:16', tiktok_story: '9:16',
      linkedin_post: '16:9', facebook_post: '1:1', facebook_story: '9:16',
    }
    const dimKey = `${platform}_${format}`.toLowerCase()
    if (dimMap[dimKey]) spec.dimensions = dimMap[dimKey]

    console.log('[design] rendering with Puppeteer — template:', spec.template, 'dims:', spec.dimensions)

    // Step 2: Puppeteer renders to PNG buffer
    const imageBuffer = await renderAdDesign(spec)
    console.log('[design] rendered OK —', imageBuffer.length, 'bytes')

    // Step 3: Upload to Supabase Storage
    const fileName = `generated/${req.user!.id}/${Date.now()}-design.png`
    const { error: uploadErr } = await supabase.storage
      .from('brand-assets')
      .upload(fileName, imageBuffer, { contentType: 'image/png', upsert: true })

    if (uploadErr) throw new Error('Storage upload failed: ' + uploadErr.message)

    const { data: { publicUrl } } = supabase.storage.from('brand-assets').getPublicUrl(fileName)
    console.log('[design] stored at:', publicUrl)

    // Step 4: Save to content_pieces
    if (content_id) {
      await supabase.from('content_pieces').update({ image_url: publicUrl }).eq('id', content_id)
    } else {
      const { data: content } = await supabase.from('content_pieces').insert({
        user_id: req.user!.id,
        campaign_id: campaign_id ?? null,
        type: format ?? 'post',
        platform: platform ?? 'instagram',
        headline: spec.headline ?? headline,
        body: spec.subheadline ?? subheadline,
        cta: spec.cta ?? cta,
        image_url: publicUrl,
        feedback: spec.art_director_notes,
      }).select().single()

      await deductCredits(req.user!.id, 'image', content?.id)
      return res.json({ image_url: publicUrl, content_id: content?.id, design_spec: spec })
    }

    await deductCredits(req.user!.id, 'image', content_id)
    res.json({ image_url: publicUrl, design_spec: spec })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[design]', message)
    res.status(500).json({ error: 'Ad design generation failed', detail: message })
  }
})

export default router
