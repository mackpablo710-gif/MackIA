import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth.middleware'
import { supabase } from '../lib/supabase'

export const CREDIT_COSTS: Record<string, number> = {
  ideas: 1,
  post: 2,
  carousel: 3,
  image: 5,
  video_script: 3,
  video: 10,
  analysis: 0,
  questions: 0,
}

export function creditsMiddleware(action: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const cost = CREDIT_COSTS[action] ?? 1

    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', req.user!.id)
      .single()

    if (!profile || profile.credits < cost) {
      return res.status(402).json({ error: 'Insufficient credits', credits: profile?.credits ?? 0, required: cost })
    }

    req.body._creditCost = cost
    req.body._action = action
    next()
  }
}

export async function deductCredits(userId: string, action: string, contentId?: string) {
  const cost = CREDIT_COSTS[action] ?? 1
  if (cost === 0) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single()

  if (!profile) return

  const newBalance = profile.credits - cost

  await supabase.from('profiles').update({ credits: newBalance }).eq('id', userId)

  await supabase.from('credit_transactions').insert({
    user_id: userId,
    type: 'consume',
    amount: -cost,
    action,
    content_id: contentId ?? null,
    balance_after: newBalance,
  })
}
