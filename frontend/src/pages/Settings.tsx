import { useAuthStore } from '../store/authStore'
import { useCreditsStore } from '../store/creditsStore'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Zap, User, CreditCard, Shield } from 'lucide-react'

const PLANS = [
  { id: 'free', name: 'Free', price: '$0', credits: 20, features: ['Solo texto', '20 créditos', 'Posts y carruseles'] },
  { id: 'starter', name: 'Starter', price: '$9/mes', credits: 200, features: ['Texto + imágenes', '200 créditos/mes', 'Soporte email'] },
  { id: 'pro', name: 'Pro', price: '$29/mes', credits: 800, features: ['Todo incluido', '800 créditos/mes', 'Generación de videos', 'Soporte prioritario'] },
  { id: 'agency', name: 'Agency', price: '$79/mes', credits: 3000, features: ['Todo ilimitado', '3000 créditos/mes', 'API access', 'Multi-negocio'] },
]

export function Settings() {
  const { user } = useAuthStore()
  const { credits } = useCreditsStore()

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-xl font-bold text-text-main mb-6">Configuración</h1>

      <div className="space-y-6">
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <User size={16} className="text-primary" />
            <h2 className="font-semibold text-text-main">Perfil</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-text-muted mb-1">Email</p>
              <p className="text-sm text-text-main">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">Plan</p>
              <Badge variant="primary">{user?.plan ?? 'free'}</Badge>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Zap size={16} className="text-primary" />
            <h2 className="font-semibold text-text-main">Créditos</h2>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-3xl font-bold text-text-main">{credits}</div>
            <div>
              <p className="text-sm text-text-main">créditos disponibles</p>
              <p className="text-xs text-text-muted">Plan {user?.plan}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-text-muted">
            {[['Ideas de campaña', '1'], ['Post completo', '2'], ['Carrusel', '3'], ['Imagen', '5'], ['Guion de video', '3'], ['Video', '10']].map(([action, cost]) => (
              <div key={action} className="flex justify-between p-2 bg-bg rounded-lg border border-border">
                <span>{action}</span>
                <span className="text-primary font-mono">{cost} crd</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <CreditCard size={16} className="text-primary" />
            <h2 className="font-semibold text-text-main">Planes</h2>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {PLANS.map((plan) => (
              <div key={plan.id} className={`p-4 rounded-xl border ${user?.plan === plan.id ? 'border-primary bg-primary/10' : 'border-border bg-bg'}`}>
                <p className="font-bold text-text-main text-sm">{plan.name}</p>
                <p className="text-primary font-semibold mt-1">{plan.price}</p>
                <p className="text-xs text-text-muted mt-0.5">{plan.credits} créditos</p>
                <ul className="mt-3 space-y-1">
                  {plan.features.map((f) => (
                    <li key={f} className="text-xs text-text-muted flex items-center gap-1">
                      <span className="text-green-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
                {user?.plan === plan.id ? (
                  <p className="mt-3 text-xs text-primary font-semibold">Plan actual</p>
                ) : (
                  <p className="mt-3 text-xs text-text-muted">Pagos próximamente</p>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-2">
            <Shield size={16} className="text-text-muted" />
            <h2 className="font-semibold text-text-main">Supabase Project</h2>
          </div>
          <p className="text-xs text-text-muted font-mono">aflgbaedasmivsectzvh.supabase.co</p>
        </Card>
      </div>
    </div>
  )
}
