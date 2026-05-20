import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStudioStore } from '../store/studioStore'
import type { Campaign } from '../types'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Upload, Sparkles, Calendar, Loader2,
  Building2, Palette, Image, ChevronDown, ChevronUp, RefreshCw, Zap
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import type { Brand } from '../types'

interface CampaignIdea {
  id: number
  title: string
  concept: string
  angle: string
  hook: string
  emotion: string
  viral_potential: string
  best_format: string
}

interface CampaignSummary {
  id: string
  objective: string
  platforms: string[]
  status: string
  created_at: string
  ideas?: CampaignIdea[]
}

export function BrandDashboard() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [brand, setBrand] = useState<Brand | null>(null)
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  useEffect(() => {
    if (id) fetchBrand()
  }, [id])

  async function fetchBrand() {
    try {
      const { data } = await api.get(`/brands/${id}`)
      setBrand(data.brand)
      setCampaigns(data.campaigns ?? [])
    } catch {
      toast.error('No se pudo cargar la marca')
      navigate('/brands')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('El logo debe pesar menos de 5MB'); return }

    setUploadingLogo(true)
    const toastId = toast.loading('Analizando identidad visual del logo...')
    try {
      const formData = new FormData()
      formData.append('logo', file)
      const { data } = await api.post(`/brands/${id}/logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setBrand(prev => prev ? {
        ...prev,
        avatar_url: data.logo_url,
        brand_identity: data.brand_identity,
      } : prev)
      toast.success('Logo subido · Identidad visual extraída', { id: toastId })
    } catch (err: unknown) {
      toast.error((err as Error).message, { id: toastId })
    } finally {
      setUploadingLogo(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleNewCampaign() {
    navigate(`/studio?brandId=${id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    )
  }

  if (!brand) return null

  const identity = brand.brand_identity
  const colors = identity?.primary_colors ?? []

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/brands')} className="text-text-muted hover:text-text-main transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-4 flex-1">
            <div className="relative">
              <div
                className="w-16 h-16 rounded-2xl overflow-hidden bg-surface border border-border flex items-center justify-center cursor-pointer hover:border-primary/40 transition-colors group"
                onClick={() => fileInputRef.current?.click()}
              >
                {brand.avatar_url ? (
                  <img src={brand.avatar_url} alt={brand.name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={24} className="text-text-muted group-hover:text-primary transition-colors" />
                )}
                {uploadingLogo && (
                  <div className="absolute inset-0 bg-bg/70 flex items-center justify-center rounded-2xl">
                    <Loader2 size={20} className="text-primary animate-spin" />
                  </div>
                )}
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={12} className="text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-main">{brand.name}</h1>
              <p className="text-xs text-text-muted mt-0.5">
                {brand.avatar_url ? 'Haz clic en el logo para cambiarlo' : 'Sube un logo para extraer la identidad visual'}
              </p>
            </div>
          </div>
          <Button onClick={handleNewCampaign} icon={<Sparkles size={16} />} size="lg">
            Nueva campaña
          </Button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />

        <div className="grid grid-cols-3 gap-6">
          {/* Left: Brand identity */}
          <div className="col-span-1 space-y-4">
            <Card>
              <h3 className="font-semibold text-text-main text-sm mb-4 flex items-center gap-2">
                <Palette size={15} className="text-primary" /> Identidad Visual
              </h3>

              {!identity ? (
                <div className="text-center py-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Image size={18} className="text-primary" />
                  </div>
                  <p className="text-xs text-text-muted mb-3">Sube el logo para que la IA analice los colores y estilo de tu marca</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary/10 hover:bg-primary/15 border border-primary/30 rounded-xl text-xs text-primary transition-colors"
                  >
                    <Upload size={13} /> Subir logo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {colors.length > 0 && (
                    <div>
                      <p className="text-[10px] text-text-muted mb-2 uppercase tracking-wider">Colores primarios</p>
                      <div className="flex gap-2 flex-wrap">
                        {colors.map(c => (
                          <div key={c} className="flex flex-col items-center gap-1">
                            <div className="w-8 h-8 rounded-lg border border-border" style={{ backgroundColor: c }} />
                            <span className="text-[9px] text-text-muted font-mono">{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {identity.style && (
                    <div>
                      <p className="text-[10px] text-text-muted mb-1 uppercase tracking-wider">Estilo</p>
                      <span className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-lg capitalize">{identity.style}</span>
                    </div>
                  )}

                  {identity.mood && (
                    <div>
                      <p className="text-[10px] text-text-muted mb-1 uppercase tracking-wider">Mood</p>
                      <span className="text-xs px-2.5 py-1 bg-surface border border-border text-text-main rounded-lg capitalize">{identity.mood}</span>
                    </div>
                  )}

                  {identity.brand_personality && (
                    <div>
                      <p className="text-[10px] text-text-muted mb-1 uppercase tracking-wider">Personalidad</p>
                      <p className="text-xs text-text-main">{identity.brand_personality}</p>
                    </div>
                  )}

                  {identity.image_style_recommendation && (
                    <div>
                      <p className="text-[10px] text-text-muted mb-1 uppercase tracking-wider">Prompt IA</p>
                      <p className="text-xs text-text-muted italic">{identity.image_style_recommendation}</p>
                    </div>
                  )}

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-2 border border-border rounded-xl text-[11px] text-text-muted hover:text-text-main hover:border-primary/30 transition-colors"
                  >
                    <RefreshCw size={11} /> Actualizar logo
                  </button>
                </div>
              )}
            </Card>

            {brand.description && (
              <Card>
                <h3 className="font-semibold text-text-main text-sm mb-2">Descripción</h3>
                <p className="text-xs text-text-muted leading-relaxed">{brand.description}</p>
              </Card>
            )}
          </div>

          {/* Right: Campaigns */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text-main">Campañas ({campaigns.length})</h2>
              {campaigns.length > 0 && (
                <Button onClick={handleNewCampaign} icon={<Sparkles size={14} />} size="sm">
                  Nueva campaña
                </Button>
              )}
            </div>

            {campaigns.length === 0 ? (
              <div className="border border-dashed border-border rounded-2xl p-12 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Sparkles size={20} className="text-primary" />
                </div>
                <h3 className="font-semibold text-text-main mb-2">Sin campañas aún</h3>
                <p className="text-xs text-text-muted mb-5 max-w-xs mx-auto">
                  Crea tu primera campaña para esta marca. La IA usará la identidad visual del logo.
                </p>
                <Button onClick={handleNewCampaign} icon={<Sparkles size={15} />}>
                  Crear primera campaña
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {campaigns.map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}>
                    <CampaignRow campaign={c} brandId={id!} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function CampaignRow({ campaign, brandId }: { campaign: CampaignSummary; brandId: string }) {
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()
  const store = useStudioStore()
  const date = new Date(campaign.created_at).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
  const ideas: CampaignIdea[] = Array.isArray(campaign.ideas) ? campaign.ideas : []
  const firstIdea = ideas[0]

  const statusColor: Record<string, string> = {
    draft: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    ideas_generated: 'bg-primary/10 text-primary border-primary/20',
    active: 'bg-green-500/10 text-green-400 border-green-500/20',
    completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  }

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden transition-all duration-200 hover:border-primary/30">
      {/* Header row */}
      <button onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${statusColor[campaign.status] ?? statusColor.draft}`}>
              {campaign.status === 'ideas_generated' ? `${ideas.length} ideas` : campaign.status ?? 'borrador'}
            </span>
            <span className="text-[10px] text-text-muted capitalize">{campaign.objective}</span>
            {campaign.platforms?.map(p => (
              <span key={p} className="text-[10px] text-text-muted capitalize">· {p}</span>
            ))}
          </div>
          <p className="text-sm font-medium text-text-main">
            {firstIdea?.title ?? 'Campaña generada'}
          </p>
          {firstIdea?.concept && (
            <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{firstIdea.concept}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="flex items-center gap-1 text-[10px] text-text-muted">
            <Calendar size={10} /> {date}
          </span>
          {expanded ? <ChevronUp size={15} className="text-text-muted" /> : <ChevronDown size={15} className="text-text-muted" />}
        </div>
      </button>

      {/* Expanded ideas */}
      <AnimatePresence>
        {expanded && ideas.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="border-t border-border overflow-hidden">
            <div className="p-4 space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-text-muted mb-3 font-medium">
                Ideas generadas por la agencia IA
              </p>
              {ideas.map((idea, i) => (
                <div key={idea.id ?? i}
                  className="p-3 bg-bg border border-border rounded-xl hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-sm font-semibold text-text-main">{idea.title}</p>
                    <div className="flex gap-1 flex-shrink-0">
                      {idea.viral_potential && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded-full capitalize">
                          {idea.viral_potential}
                        </span>
                      )}
                      {idea.best_format && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full capitalize">
                          {idea.best_format}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-text-muted mb-2">{idea.concept}</p>
                  {idea.hook && (
                    <div className="p-2 bg-primary/5 border border-primary/15 rounded-lg mb-2">
                      <p className="text-[10px] text-primary mb-0.5 font-medium">Hook</p>
                      <p className="text-xs text-text-main italic">"{idea.hook}"</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-2">
                      {idea.angle && <span className="text-[10px] text-text-muted">Ángulo: {idea.angle}</span>}
                      {idea.emotion && <span className="text-[10px] text-text-muted">· {idea.emotion}</span>}
                    </div>
                    <button
                      onClick={() => {
                        const campaignObj: Campaign = {
                          id: idea.id ?? i,
                          title: idea.title,
                          concept: idea.concept,
                          angle: idea.angle,
                          hook: idea.hook,
                          headline: idea.title,
                          subheadline: idea.concept,
                          body_preview: idea.concept,
                          why_it_works: '',
                          viral_potential: idea.viral_potential,
                          best_format: idea.best_format,
                          emotion: idea.emotion,
                          weakness: '',
                        }
                        store.loadIdea(campaignObj, campaign.id)
                        navigate(`/studio?brandId=${brandId}`)
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 bg-primary text-white text-[10px] font-medium rounded-lg hover:bg-primary/80 transition-colors"
                    >
                      <Zap size={10} /> Usar esta idea
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        {expanded && ideas.length === 0 && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="border-t border-border p-4 text-center">
            <p className="text-xs text-text-muted">No hay ideas guardadas en esta campaña</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
