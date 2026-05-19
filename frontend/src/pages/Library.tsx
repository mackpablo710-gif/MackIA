import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Image, FileText, Video, Layers, Trash2, Copy, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import type { ContentPiece } from '../types'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'

const TYPE_ICONS: Record<string, React.ReactNode> = {
  post: <FileText size={14} className="text-green-400" />,
  carrusel: <Layers size={14} className="text-blue-400" />,
  story: <Image size={14} className="text-yellow-400" />,
  reel: <Video size={14} className="text-accent" />,
  video_script: <Video size={14} className="text-accent" />,
  image: <Image size={14} className="text-yellow-400" />,
}

export function Library() {
  const [content, setContent] = useState<ContentPiece[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const loadContent = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/library?limit=50')
      setContent(data.content ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadContent() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este contenido?')) return
    await api.delete(`/library/${id}`)
    setContent(prev => prev.filter(c => c.id !== id))
    toast.success('Eliminado')
  }

  const handleCopy = async (item: ContentPiece) => {
    const text = item.caption ?? item.headline ?? ''
    await navigator.clipboard.writeText(text)
    toast.success('Copiado')
  }

  const filtered = filter === 'all' ? content : content.filter(c => c.type === filter)
  const types = ['all', ...new Set(content.map(c => c.type))]

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-main">Biblioteca</h1>
          <p className="text-sm text-text-muted">{content.length} piezas de contenido generadas</p>
        </div>
        <div className="flex gap-2">
          {types.map((type) => (
            <button key={type} onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${filter === type ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-surface border border-border text-text-muted hover:border-primary/30'}`}>
              {type === 'all' ? 'Todo' : type}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <FileText size={40} className="text-border mx-auto mb-3" />
          <p className="text-text-muted">No hay contenido todavía</p>
          <p className="text-xs text-text-muted mt-1">Ve al Studio y crea tu primera campaña</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {TYPE_ICONS[item.type] ?? <FileText size={14} />}
                    <Badge variant="muted">{item.type}</Badge>
                    <Badge variant="muted">{item.platform}</Badge>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleCopy(item)} className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-main transition-all">
                      <Copy size={13} />
                    </button>
                    {item.image_url && (
                      <a href={item.image_url} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-main transition-all">
                        <ExternalLink size={13} />
                      </a>
                    )}
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {item.image_url ? (
                  <img src={item.image_url} alt="" className="w-full aspect-square object-cover rounded-xl mb-3" />
                ) : null}

                {item.headline && <p className="text-sm font-semibold text-text-main mb-1 line-clamp-2">{item.headline}</p>}
                {item.caption && <p className="text-xs text-text-muted line-clamp-3">{item.caption}</p>}

                {item.quality_score && (
                  <div className="mt-3 flex items-center gap-1">
                    <div className="flex-1 bg-border rounded-full h-1">
                      <div className="bg-primary h-1 rounded-full" style={{ width: `${item.quality_score}%` }} />
                    </div>
                    <span className="text-xs text-text-muted">{item.quality_score}</span>
                  </div>
                )}

                <p className="text-xs text-text-muted mt-2">
                  {new Date(item.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
