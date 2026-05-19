import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import { supabase } from '../lib/supabase'

const router = Router()

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { type, platform, limit = 20, offset = 0 } = req.query

  let query = supabase
    .from('content_pieces')
    .select('*')
    .eq('user_id', req.user!.id)
    .order('created_at', { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1)

  if (type) query = query.eq('type', type)
  if (platform) query = query.eq('platform', platform)

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json({ content: data })
})

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('content_pieces')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id)
    .single()

  if (error || !data) return res.status(404).json({ error: 'Content not found' })
  res.json({ content: data })
})

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { error } = await supabase
    .from('content_pieces')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

export default router
