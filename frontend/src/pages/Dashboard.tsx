import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Sparkles, Image, FileText, Video, Zap, TrendingUp } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useCreditsStore } from '../store/creditsStore'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import api from '../lib/api'
import type { ContentPiece } from '../types'

const CREDIT_COSTS = { ideas: 1, post: 2, carrusel: 3, image: 5, video_script: 3, video: 10 }

export function Dashboard() {
  const { user } = useAuthStore()
  const { credits, refresh } = useCreditsStore()
  const navigate = useNavigate()
  const [recentContent, setRecentContent] = useState<ContentPiece[]>([])

  useEffect(() => {
    refresh()
    api.get('/library?limit=6').then(({ data }) => setRecentContent(data.content ?? []))
  }, [])

  const firstName = user?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'Creativo'

  return (
    <div className="p-8 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-text-main">
          Hola, {firstName} 👋
        </h1>
        <p className="text-text-muted mt-1">Tu agencia de IA está lista para crear.</p>
      </motion.div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Créditos disponibles', value: credits, icon: Zap, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Posts generados', value: recentContent.filter(c => c.type === 'post').length, icon: FileText, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Imágenes creadas', value: recentContent.filter(c => c.image_url).length, icon: Image, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Scripts de video', value: recentContent.filter(c => c.type === 'video_script').length, icon: Video, color: 'text-accent', bg: 'bg-accent/10' },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={20} className={color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-main">{value}</p>
                <p className="text-xs text-text-muted">{label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="col-span-2"
        >
          <Card className="h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-text-main">Nueva campaña</h2>
                <p className="text-xs text-text-muted mt-0.5">Describe tu negocio y la IA hará el resto</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Sparkles size={20} className="text-primary" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {Object.entries(CREDIT_COSTS).map(([action, cost]) => (
                <div key={action} className="flex items-center justify-between p-2 bg-bg rounded-lg border border-border">
                  <span className="text-xs text-text-muted capitalize">{action.replace('_', ' ')}</span>
                  <span className="text-xs font-mono text-primary">{cost} crd</span>
                </div>
              ))}
            </div>

            <Button onClick={() => navigate('/studio')} size="lg" className="w-full" icon={<Plus size={18} />}>
              Crear nueva campaña
            </Button>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }}>
          <Card className="h-full">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-primary" />
              <h2 className="font-semibold text-text-main text-sm">Tu plan</h2>
            </div>
            <div className="space-y-3">
              <div className="text-center py-4">
                <span className="text-3xl font-bold text-text-main capitalize">{user?.plan ?? 'free'}</span>
                <p className="text-xs text-text-muted mt-1">Plan actual</p>
              </div>
              <div className="w-full bg-border rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all"
                  style={{ width: `${Math.min((credits / (user?.plan === 'free' ? 20 : 200)) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-text-muted text-center">{credits} créditos restantes</p>
            </div>
          </Card>
        </motion.div>
      </div>

      {recentContent.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-text-main">Contenido reciente</h2>
            <button onClick={() => navigate('/library')} className="text-xs text-primary hover:text-primary-hover transition-colors">
              Ver todo →
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {recentContent.slice(0, 6).map((item) => (
              <Card key={item.id} hover className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {item.image_url ? <Image size={14} className="text-yellow-400" /> :
                   item.type === 'video_script' ? <Video size={14} className="text-accent" /> :
                   <FileText size={14} className="text-green-400" />}
                  <span className="text-xs text-text-muted capitalize">{item.type}</span>
                  <span className="text-xs text-text-muted ml-auto capitalize">{item.platform}</span>
                </div>
                {item.image_url ? (
                  <img src={item.image_url} alt="" className="w-full aspect-square object-cover rounded-lg" />
                ) : (
                  <p className="text-xs text-text-main line-clamp-3">{item.headline ?? item.caption ?? 'Contenido generado'}</p>
                )}
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
