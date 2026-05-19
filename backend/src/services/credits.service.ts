import { supabase } from '../lib/supabase'

export async function getCredits(userId: string): Promise<number> {
  const { data } = await supabase.from('profiles').select('credits').eq('id', userId).single()
  return data?.credits ?? 0
}

export async function getTransactionHistory(userId: string, limit = 20) {
  const { data } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function addCredits(userId: string, amount: number, paymentId?: string) {
  const { data: profile } = await supabase.from('profiles').select('credits').eq('id', userId).single()
  const newBalance = (profile?.credits ?? 0) + amount

  await supabase.from('profiles').update({ credits: newBalance }).eq('id', userId)

  await supabase.from('credit_transactions').insert({
    user_id: userId,
    type: 'purchase',
    amount,
    action: 'purchase',
    balance_after: newBalance,
    mp_payment_id: paymentId ?? null,
  })

  return newBalance
}
