import { Router, Response } from 'express'
import multer from 'multer'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import { supabase } from '../lib/supabase'
import { generateWithVision, generateWithAI } from '../services/gemini.service'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

// ── GET all brands ────────────────────────────────────────────
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*, campaigns(id, status, created_at, ideas)')
    .eq('user_id', req.user!.id)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json({ brands: data })
})

// ── GET single brand with campaigns ──────────────────────────
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { data: brand } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id)
    .single()

  if (!brand) return res.status(404).json({ error: 'Brand not found' })

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, objective, platforms, status, created_at, ideas')
    .eq('business_id', req.params.id)
    .eq('user_id', req.user!.id)
    .order('created_at', { ascending: false })

  res.json({ brand, campaigns: campaigns ?? [] })
})

// ── POST create brand ─────────────────────────────────────────
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { name, description, website } = req.body
  if (!name) return res.status(400).json({ error: 'name is required' })

  const { data, error } = await supabase
    .from('businesses')
    .insert({ user_id: req.user!.id, name, description: description ?? '', website })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json({ brand: data })
})

// ── POST upload logo + analyze brand identity ─────────────────
router.post('/:id/logo', authMiddleware, upload.single('logo'), async (req: AuthRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

  const { id } = req.params
  const file = req.file
  const ext = file.originalname.split('.').pop()?.toLowerCase() ?? 'png'
  const path = `logos/${req.user!.id}/${id}.${ext}`

  // Upload to Supabase Storage
  const { error: uploadErr } = await supabase.storage
    .from('brand-assets')
    .upload(path, file.buffer, { contentType: file.mimetype, upsert: true })

  if (uploadErr) {
    console.error('[logo upload]', uploadErr.message)
    return res.status(500).json({ error: 'Upload failed: ' + uploadErr.message })
  }

  const { data: { publicUrl } } = supabase.storage.from('brand-assets').getPublicUrl(path)

  // Analyze logo with Gemini Vision
  let brandIdentity: Record<string, unknown> = {}
  try {
    const imageBase64 = file.buffer.toString('base64')
    brandIdentity = await generateWithVision<Record<string, unknown>>(
      `Analiza este logo de marca y extrae su identidad visual para usar en campañas publicitarias.

Devuelve ÚNICAMENTE JSON válido:
{
  "primary_colors": ["#hex1", "#hex2"],
  "secondary_colors": ["#hex3"],
  "style": "moderno|minimalista|corporativo|juvenil|elegante|etc",
  "mood": "confiable|innovador|divertido|premium|etc",
  "typography_style": "sans-serif|serif|display|etc",
  "visual_elements": ["elemento1", "elemento2"],
  "brand_personality": "descripción en 1 oración",
  "color_palette_description": "descripción de la paleta para prompts de imagen",
  "image_style_recommendation": "instrucciones específicas para prompts de IA con esta marca"
}`,
      imageBase64,
      file.mimetype
    )
    console.log('[logo] brand identity extracted OK')
  } catch (err) {
    console.error('[logo vision]', (err as Error).message)
    brandIdentity = { style: 'moderno', mood: 'profesional', primary_colors: ['#6C47FF'] }
  }

  // Save logo_url and brand identity to business
  await supabase.from('businesses')
    .update({ avatar_url: publicUrl, brand_identity: brandIdentity } as Record<string, unknown>)
    .eq('id', id)
    .eq('user_id', req.user!.id)

  res.json({ logo_url: publicUrl, brand_identity: brandIdentity })
})

// ── GET campaigns for a brand ─────────────────────────────────
router.get('/:id/campaigns', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { data } = await supabase
    .from('campaigns')
    .select('*')
    .eq('business_id', req.params.id)
    .eq('user_id', req.user!.id)
    .order('created_at', { ascending: false })

  res.json({ campaigns: data ?? [] })
})

export default router
