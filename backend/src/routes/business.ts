import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import { supabase } from '../lib/supabase'
import { z } from 'zod'

const router = Router()

const BusinessSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(10),
  industry: z.string().optional(),
  target_audience: z.string().optional(),
  tone: z.string().optional(),
  value_prop: z.string().optional(),
  website: z.string().optional(),
})

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', req.user!.id)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json({ businesses: data })
})

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const parsed = BusinessSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { data, error } = await supabase
    .from('businesses')
    .insert({ ...parsed.data, user_id: req.user!.id })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json({ business: data })
})

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id)
    .single()

  if (error || !data) return res.status(404).json({ error: 'Business not found' })
  res.json({ business: data })
})

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('businesses')
    .update(req.body)
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json({ business: data })
})

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { error } = await supabase
    .from('businesses')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

export default router
