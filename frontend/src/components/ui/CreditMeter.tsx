import { Zap } from 'lucide-react'
import { useCreditsStore } from '../../store/creditsStore'
import { useAuthStore } from '../../store/authStore'

export function CreditMeter() {
  const credits = useCreditsStore((s) => s.credits)
  const user = useAuthStore((s) => s.user)
  const max = user?.plan === 'free' ? 20 : user?.plan === 'starter' ? 200 : user?.plan === 'pro' ? 800 : 3000
  const pct = Math.min((credits / max) * 100, 100)
  const color = pct > 50 ? 'bg-primary' : pct > 20 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-xl">
      <Zap size={14} className="text-primary" />
      <div className="flex flex-col gap-1 min-w-[80px]">
        <div className="flex justify-between items-center">
          <span className="text-xs text-text-muted">Créditos</span>
          <span className="text-xs font-mono font-medium text-text-main">{credits}</span>
        </div>
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  )
}
