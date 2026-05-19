import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import { getCredits, getTransactionHistory } from '../services/credits.service'

const router = Router()

router.get('/balance', authMiddleware, async (req: AuthRequest, res: Response) => {
  const credits = await getCredits(req.user!.id)
  res.json({ credits })
})

router.get('/history', authMiddleware, async (req: AuthRequest, res: Response) => {
  const history = await getTransactionHistory(req.user!.id)
  res.json({ transactions: history })
})

export default router
