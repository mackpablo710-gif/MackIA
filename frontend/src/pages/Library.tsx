import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Image, FileText, Video, Layers, Trash2, Copy, X,
  Hash, Clock, Star, ChevronRight, Download, Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import type { ContentPiece, VideoScript } from '../types'
import { VideoStoryboard } from '../components/creative/VideoStoryboard'

const TYPE_META: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  post:         { icon: <FileText size={14} />,  label: 'Post',        color: 'text-green-400 bg-green-400/10' },
  carrusel:     { icon: <Layers size={14} />,    label: 'Carrusel',    color: 'text-blue-400 bg-blue-400/10' },
  story:        { icon: <Image size={14} />,     label: 'Story',       color: 'text-yellow-400 bg-yellow-400/10' },
  reel:         { icon: <Video size={14} />,     label: 'Reel',        color: 'text-purple-400 bg-purple-400/10' },
  video_script: { icon: <Video size={14} />,     label: 'Video',       color: 'text-purple-400 bg-purple-400/10' },
  image:        { icon: <Image size={14} />,     label: 'Imagen',      color: 'text-yellow-400 bg-yellow-400/10' },
}

const FILTER_LABELS: Record<string, string> = {
  all: 'Todo', post: 'Post', carrusel: 'Carrusel',
  story: 'Story', reel: 'Reel', video_script: 'Video', image: 'Imagen',
}

export function Library() {
  const [content, setContent]       = useState<ContentPiece[]>([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState('all')
  const [selected, setSelected]     = useState<ContentPiece | null>(null)

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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('¿Eliminar este contenido?')) return
    await api.delete(`/library/${id}`)
    setContent(prev => prev.filter(c => c.id !== id))
    if (selected?.id === id) setSelected(null)
    toast.success('Eliminado')
  }

  const handleCopy = async (item: ContentPiece, e: React.MouseEvent) => {
    e.stopPropagation()
    const text = [item.headline, item.caption, item.cta].filter(Boolean).join('\n\n')
    await navigator.clipboard.writeText(text || '')
    toast.success('Copiado al portapapeles')
  }

  const handleDownloadImage = async (url: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `adgenius-${Date.now()}.png`
      a.click()
    } catch { toast.error('Error al descargar') }
  }

  const filtered = filter === 'all' ? content : content.filter(c => c.type === filter)
  const types = ['all', ...new Set(content.map(c => c.type))]

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-main">Biblioteca</h1>
          <p className="text-sm text-text-muted">{content.length} piezas de contenido generadas</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {types.map((type) => (
            <button key={type} onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${filter === type ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-surface border border-border text-text-muted hover:border-primary/30'}`}>
              {FILTER_LABELS[type] ?? type}
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
          <Sparkles size={40} className="text-border mx-auto mb-3" />
          <p className="text-text-muted">No hay contenido todavía</p>
          <p className="text-xs text-text-muted mt-1">Ve al Studio y crea tu primera campaña</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((item, i) => (
            <motion.div key={item.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}>
              <ContentCard
                item={item}
                onClick={() => setSelected(item)}
                onDelete={handleDelete}
                onCopy={handleCopy}
                onDownload={handleDownloadImage}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <ContentModal
            item={selected}
            onClose={() => setSelected(null)}
            onDelete={(e) => handleDelete(selected.id, e)}
            onCopy={(e) => handleCopy(selected, e)}
            onDownload={handleDownloadImage}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Card ──────────────────────────────────────────────────── */
function ContentCard({ item, onClick, onDelete, onCopy, onDownload }: {
  item: ContentPiece
  onClick: () => void
  onDelete: (id: string, e: React.MouseEvent) => void
  onCopy: (item: ContentPiece, e: React.MouseEvent) => void
  onDownload: (url: string, e: React.MouseEvent) => void
}) {
  const meta = TYPE_META[item.type] ?? TYPE_META.post
  const date = new Date(item.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short' })

  return (
    <div onClick={onClick}
      className="group bg-surface border border-border rounded-2xl overflow-hidden hover:border-primary/40 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-primary/5">

      {/* Image preview */}
      {item.image_url ? (
        <div className="relative aspect-video overflow-hidden">
          <img src={item.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 gap-2">
            <button onClick={(e) => onDownload(item.image_url!, e)}
              className="p-1.5 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 text-white transition-all">
              <Download size={13} />
            </button>
          </div>
        </div>
      ) : item.type === 'video_script' ? (
        <div className="aspect-video bg-gradient-to-br from-purple-500/10 to-primary/10 flex items-center justify-center">
          <Video size={32} className="text-purple-400/60" />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-primary/5 to-surface flex items-center justify-center">
          <div className={`p-3 rounded-xl ${meta.color}`}>{meta.icon}</div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${meta.color}`}>
            {meta.icon} {meta.label}
          </span>
          <span className="text-[10px] text-text-muted capitalize">{item.platform}</span>
          {item.quality_score && (
            <span className="ml-auto flex items-center gap-0.5 text-[10px] text-yellow-400">
              <Star size={10} fill="currentColor" /> {item.quality_score}
            </span>
          )}
        </div>

        {item.headline && (
          <p className="text-sm font-semibold text-text-main line-clamp-2 mb-1">{item.headline}</p>
        )}
        {!item.headline && item.caption && (
          <p className="text-sm font-semibold text-text-main line-clamp-2 mb-1">{item.caption}</p>
        )}
        {item.caption && item.headline && (
          <p className="text-xs text-text-muted line-clamp-2">{item.caption}</p>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <span className="flex items-center gap-1 text-[10px] text-text-muted">
            <Clock size={10} /> {date}
          </span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={(e) => onCopy(item, e)}
              className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-main transition-all">
              <Copy size={12} />
            </button>
            <button onClick={(e) => onDelete(item.id, e)}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-all">
              <Trash2 size={12} />
            </button>
            <ChevronRight size={12} className="text-text-muted self-center" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Modal ──────────────────────────────────────────────────── */
function ContentModal({ item, onClose, onDelete, onCopy, onDownload }: {
  item: ContentPiece
  onClose: () => void
  onDelete: (e: React.MouseEvent) => void
  onCopy: (e: React.MouseEvent) => void
  onDownload: (url: string, e: React.MouseEvent) => void
}) {
  const meta = TYPE_META[item.type] ?? TYPE_META.post
  const date = new Date(item.created_at).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })
  const isVideo = item.type === 'video_script'

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl w-full ${isVideo ? 'max-w-4xl' : 'max-w-3xl'}`}
        onClick={e => e.stopPropagation()}>

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${meta.color}`}>
              {meta.icon} {meta.label}
            </span>
            <span className="text-xs text-text-muted capitalize">{item.platform}</span>
            {item.quality_score && (
              <span className="flex items-center gap-1 text-xs text-yellow-400">
                <Star size={12} fill="currentColor" /> {item.quality_score}/100
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-lg text-xs text-primary hover:bg-primary/15 transition-all">
              <Copy size={12} /> Copiar
            </button>
            {item.image_url && (
              <button onClick={(e) => onDownload(item.image_url!, e)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-text-muted hover:text-text-main transition-all">
                <Download size={12} /> Descargar
              </button>
            )}
            <button onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-all">
              <Trash2 size={15} />
            </button>
            <button onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-main transition-all">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className={`overflow-y-auto max-h-[75vh] ${isVideo ? 'grid grid-cols-2' : ''}`}>
          {/* Image */}
          {item.image_url && (
            <div className={`${isVideo ? '' : 'flex justify-center p-5 bg-bg/50'}`}>
              <img src={item.image_url} alt="" className={`${isVideo ? 'w-full h-full object-cover' : 'max-h-80 rounded-xl object-contain'}`} />
            </div>
          )}

          {/* Video Script */}
          {isVideo && item.video_script && (
            <div className="p-5 overflow-y-auto max-h-[75vh]">
              <VideoStoryboard script={item.video_script as unknown as VideoScript} />
            </div>
          )}

          {/* Text content */}
          {!isVideo && (
            <div className="p-5 space-y-4">
              {item.headline && (
                <div>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Titular</p>
                  <p className="text-lg font-bold text-text-main">{item.headline}</p>
                </div>
              )}
              {item.body && (
                <div>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Cuerpo</p>
                  <p className="text-sm text-text-main leading-relaxed whitespace-pre-line">{item.body}</p>
                </div>
              )}
              {item.cta && (
                <div>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">CTA</p>
                  <span className="inline-block px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg">
                    {item.cta}
                  </span>
                </div>
              )}
              {item.caption && (
                <div>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Caption completo</p>
                  <div className="p-3 bg-bg border border-border rounded-xl text-sm text-text-main leading-relaxed whitespace-pre-line">
                    {item.caption}
                  </div>
                </div>
              )}
              {item.hashtags && item.hashtags.length > 0 && (
                <div>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Hashtags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.hashtags.map(h => (
                      <span key={h} className="flex items-center gap-0.5 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                        <Hash size={9} />{h.replace('#', '')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {item.feedback && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl">
                  <p className="text-[10px] text-primary uppercase tracking-wider mb-1">Director creativo</p>
                  <p className="text-xs text-text-muted italic">{item.feedback}</p>
                </div>
              )}
              <p className="text-[10px] text-text-muted pt-2 border-t border-border flex items-center gap-1">
                <Clock size={10} /> {date}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
