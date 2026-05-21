import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, ArrowRight, Loader2, ChevronLeft,
  Instagram, Linkedin, Facebook, Video, FileText, Image, Layers, Building2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useStudioStore } from '../store/studioStore'
import { useCreditsStore } from '../store/creditsStore'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { CampaignCard } from '../components/creative/CampaignCard'
import { PostPreview } from '../components/creative/PostPreview'
import { CarouselPreview } from '../components/creative/CarouselPreview'
import { ImageCanvas } from '../components/creative/ImageCanvas'
import { VideoStoryboard } from '../components/creative/VideoStoryboard'
import api from '../lib/api'
import type { Platform, Tone, Objective, ContentFormat, Campaign } from '../types'

const PLATFORMS: { id: Platform; label: string; icon: React.ReactNode }[] = [
  { id: 'instagram', label: 'Instagram', icon: <Instagram size={16} /> },
  { id: 'tiktok', label: 'TikTok', icon: <Video size={16} /> },
  { id: 'linkedin', label: 'LinkedIn', icon: <Linkedin size={16} /> },
  { id: 'facebook', label: 'Facebook', icon: <Facebook size={16} /> },
]

const TONES: Tone[] = ['premium', 'emocional', 'corporativo', 'agresivo', 'divertido', 'juvenil', 'elegante', 'cercano']
const OBJECTIVES: { id: Objective; label: string }[] = [
  { id: 'ventas', label: '💰 Ventas' },
  { id: 'trafico', label: '🚀 Tráfico' },
  { id: 'marca', label: '✨ Marca' },
  { id: 'leads', label: '📋 Leads' },
  { id: 'engagement', label: '❤️ Engagement' },
]

const FORMATS: { id: ContentFormat; label: string; icon: React.ReactNode; credits: number }[] = [
  { id: 'post', label: 'Post', icon: <FileText size={15} />, credits: 2 },
  { id: 'carrusel', label: 'Carrusel', icon: <Layers size={15} />, credits: 3 },
  { id: 'story', label: 'Story', icon: <Instagram size={15} />, credits: 2 },
  { id: 'reel', label: 'Reel', icon: <Video size={15} />, credits: 2 },
]

export function Studio() {
  const store = useStudioStore()
  const { refresh } = useCreditsStore()
  const [searchParams] = useSearchParams()
  const [videoAnswers, setVideoAnswers] = useState<Record<string, string>>({})
  const [videoQuestions, setVideoQuestions] = useState<Array<{ id: string; question: string; options?: string[] }>>([])
  const [editableTexts, setEditableTexts] = useState({ headline: '', subheadline: '', cta: '' })
  const [editingTexts, setEditingTexts] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [visualStyle, setVisualStyle] = useState<string>('moderno')
  const [imageMode, setImageMode] = useState<'design' | 'photo'>('design')
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null)
  const [videoRenderError, setVideoRenderError] = useState<string | null>(null)

  useEffect(() => {
    const brandId = searchParams.get('brandId')
    if (brandId && (!store.activeBrand || store.activeBrand.id !== brandId)) {
      api.get(`/brands/${brandId}`).then(({ data }) => {
        store.setActiveBrand(data.brand)
      }).catch(() => {})
    }
  }, [searchParams])

  // Handle "Usar esta idea" from BrandDashboard
  useEffect(() => {
    if (store.pendingIdeaLoad) {
      store.setSelectedCampaign(store.pendingIdeaLoad.campaign)
      store.setCampaignId(store.pendingIdeaLoad.campaignId)
      store.setStep('content')
      store.clearPendingIdea()
    }
  }, [])

  useEffect(() => {
    if (store.postContent) {
      setEditableTexts({
        headline: store.postContent.headline,
        subheadline: store.postContent.subheadline,
        cta: store.postContent.cta,
      })
    } else if (store.carouselContent?.slides?.length) {
      const first = store.carouselContent.slides[0]
      const last = store.carouselContent.slides[store.carouselContent.slides.length - 1]
      setEditableTexts({
        headline: first.headline,
        subheadline: first.subtext,
        cta: last.headline,
      })
    }
  }, [store.postContent, store.carouselContent])

  async function handleAnalyze() {
    if (!store.businessDescription.trim()) {
      toast.error('Describe tu negocio primero')
      return
    }
    store.setLoading(true, 'Analizando tu negocio...')
    try {
      const { data } = await api.post('/generate/analyze', { description: store.businessDescription })
      store.setAnalysis(data.analysis)
      store.setStep('campaigns')
      toast.success('Análisis completado')
    } catch (err: unknown) {
      toast.error((err as Error).message)
    } finally {
      store.setLoading(false)
    }
  }

  async function handleGenerateCampaigns() {
    store.setLoading(true, 'Generando 5 ideas de campaña...')
    try {
      const { data } = await api.post('/generate/campaigns', {
        analysis: store.analysis,
        objective: store.selectedObjective,
        platforms: [store.selectedPlatform],
        tone: store.selectedTone,
        business_id: store.activeBrand?.id ?? undefined,
      })
      store.setCampaigns(data.campaigns)
      store.setCampaignId(data.campaign_id)
      await refresh()
    } catch (err: unknown) {
      toast.error((err as Error).message)
    } finally {
      store.setLoading(false)
    }
  }

  async function handleGeneratePost() {
    if (!store.selectedCampaign) return
    const isCarousel = store.selectedFormat === 'carrusel'
    store.setLoading(true, isCarousel ? 'Diseñando slides del carrusel...' : 'Escribiendo el copy perfecto...')
    try {
      if (isCarousel) {
        const { data } = await api.post('/generate/carousel', {
          campaign: store.selectedCampaign,
          platform: store.selectedPlatform,
          tone: store.selectedTone,
          campaign_id: store.campaignId,
        })
        store.setCarouselContent(data.content)
        store.setContentId(data.content_id)
        store.setStep('image')
      } else {
        const { data } = await api.post('/generate/post', {
          campaign: store.selectedCampaign,
          platform: store.selectedPlatform,
          format: store.selectedFormat,
          tone: store.selectedTone,
          campaign_id: store.campaignId,
        })
        store.setPostContent(data.content)
        store.setContentId(data.content_id)
        store.setStep('image')
      }
      await refresh()
    } catch (err: unknown) {
      toast.error((err as Error).message)
    } finally {
      store.setLoading(false)
    }
  }

  async function handleGenerateImagePrompt() {
    if (!store.postContent) return
    store.setLoading(true, 'Construyendo prompt visual premium...')
    try {
      const activeContent = store.postContent ?? (store.carouselContent?.slides?.length ? { headline: editableTexts.headline, subheadline: editableTexts.subheadline, cta: editableTexts.cta } : null)
      const { data } = await api.post('/generate/images/prompt', {
        campaign: store.selectedCampaign,
        headline: editableTexts.headline || activeContent?.headline || '',
        subheadline: editableTexts.subheadline || activeContent?.subheadline || '',
        cta: editableTexts.cta || activeContent?.cta || '',
        platform: store.selectedPlatform,
        format: store.selectedFormat,
        tone: store.selectedTone,
        visualStyle,
        brandIdentity: store.brandIdentity ?? undefined,
        logoUrl: store.brandLogoUrl ?? undefined,
      })
      store.setImageData(data.image_data)
    } catch (err: unknown) {
      toast.error((err as Error).message)
    } finally {
      store.setLoading(false)
    }
  }

  async function handleGenerateImage() {
    if (!store.imageData) return
    store.setLoading(true, 'Generando imagen tipo agencia...')
    try {
      const { data } = await api.post('/generate/images/generate', {
        image_prompt: store.imageData.image_prompt,
        dimensions: store.imageData.dimensions,
        campaign_id: store.campaignId,
        content_id: store.contentId,
      })
      store.setGeneratedImageUrl(data.image_url)
      await refresh()
    } catch (err: unknown) {
      toast.error((err as Error).message)
    } finally {
      store.setLoading(false)
    }
  }

  async function handleGenerateDesign() {
    store.setLoading(true, 'Diseñando anuncio con IA...')
    try {
      const { data } = await api.post('/generate/images/design', {
        campaign: store.selectedCampaign,
        headline: editableTexts.headline || store.postContent?.headline || '',
        subheadline: editableTexts.subheadline || store.postContent?.subheadline || '',
        cta: editableTexts.cta || store.postContent?.cta || '',
        platform: store.selectedPlatform,
        format: store.selectedFormat,
        tone: store.selectedTone,
        visualStyle,
        brandIdentity: store.brandIdentity ?? undefined,
        brandName: store.activeBrand?.name,
        brandTagline: store.activeBrand?.description,
        logoUrl: store.brandLogoUrl ?? undefined,
        campaign_id: store.campaignId,
        content_id: store.contentId,
      })
      store.setGeneratedImageUrl(data.image_url)
      if (data.design_spec) store.setImageData(data.design_spec)
      await refresh()
      toast.success('¡Diseño generado!')
    } catch (err: unknown) {
      toast.error((err as Error).message)
    } finally {
      store.setLoading(false)
    }
  }

  async function handleRenderVideo() {
    setVideoRenderError(null)
    store.setLoading(true, 'Generando video real con IA (2-3 min)...')
    try {
      const { data } = await api.post('/generate/videos/render', {
        script: store.videoScript,
        campaign: store.selectedCampaign,
        platform: store.selectedPlatform,
        duration_seconds: videoAnswers.duration === '15 segundos' ? 5 : 10,
        campaign_id: store.campaignId,
      })
      setGeneratedVideoUrl(data.video_url)
      await refresh()
      toast.success('¡Video generado!')
    } catch (err: unknown) {
      const msg = (err as Error).message
      setVideoRenderError(msg)
      toast.error(msg)
    } finally {
      store.setLoading(false)
    }
  }

  async function handleVideoQuestions() {
    // Preguntas hardcodeadas — eliminamos llamada extra a Gemini
    setVideoQuestions([
      {
        id: 'video_type',
        question: '¿Qué tipo de video quieres crear?',
        options: ['Persona hablando a cámara', 'Video de producto', 'UGC (User Generated Content)', 'Animado / Motion Graphics', 'Narrado con imágenes', 'TikTok viral', 'Corporativo / Presentación'],
      },
      {
        id: 'duration',
        question: '¿Cuánto durará el video?',
        options: ['15 segundos', '30 segundos', '45 segundos', '60 segundos'],
      },
      {
        id: 'style',
        question: '¿Cuál es el estilo visual?',
        options: ['Dinámico y rápido', 'Emocional y lento', 'Educativo / Explicativo', 'Divertido y casual', 'Premium y elegante'],
      },
    ])
    store.setStep('video')
  }

  async function handleGenerateVideoScript() {
    setVideoError(null)
    store.setLoading(true, 'Escribiendo el guion viral...')
    try {
      const payload = {
        campaign: store.selectedCampaign,
        video_type: videoAnswers.video_type ?? 'Persona hablando a cámara',
        duration: videoAnswers.duration ?? '30 segundos',
        style: videoAnswers.style ?? 'Dinámico y rápido',
        platform: store.selectedPlatform,
        campaign_id: store.campaignId,
      }
      console.log('[video] sending payload:', JSON.stringify(payload).slice(0, 200))
      const { data } = await api.post('/generate/videos/script', payload)
      console.log('[video] response:', JSON.stringify(data).slice(0, 200))
      if (!data.script) throw new Error('La IA no devolvió un guion válido')
      store.setVideoScript(data.script)
      await refresh()
    } catch (err: unknown) {
      const msg = (err as Error).message
      setVideoError(msg)
      toast.error(msg)
      console.error('[video] error:', msg)
    } finally {
      store.setLoading(false)
    }
  }

  const stepBack: Record<string, () => void> = {
    campaigns: () => store.setStep('brief'),
    content: () => store.setStep('campaigns'),
    image: () => store.setStep('content'),
    video: () => store.setStep('content'),
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          {stepBack[store.step] && (
            <button onClick={stepBack[store.step]} className="text-text-muted hover:text-text-main transition-colors">
              <ChevronLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold text-text-main">Studio</h1>
            <p className="text-xs text-text-muted">Agencia de IA · Director Creativo</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {store.activeBrand && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-xl">
                {store.activeBrand.avatar_url ? (
                  <img src={store.activeBrand.avatar_url} alt="" className="w-5 h-5 rounded object-cover" />
                ) : (
                  <Building2 size={13} className="text-primary" />
                )}
                <span className="text-xs font-medium text-primary">{store.activeBrand.name}</span>
              </div>
            )}
            {['brief', 'campaigns', 'content', 'image'].map((s) => (
              <div key={s} className={`w-2 h-2 rounded-full transition-all ${store.step === s ? 'bg-primary scale-125' : 'bg-border'}`} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* ─── PASO 1: BRIEF ─── */}
          {store.step === 'brief' && (
            <motion.div key="brief" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-5 gap-6">
              <div className="col-span-3 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-text-main mb-1">¿Qué estás promocionando?</h2>
                  <p className="text-sm text-text-muted">Describe tu negocio, producto o servicio. Cuanto más detalle, mejor el resultado.</p>
                </div>
                <textarea
                  value={store.businessDescription}
                  onChange={(e) => store.setBusinessDescription(e.target.value)}
                  placeholder="Ejemplo: CVJob es una plataforma que ayuda a personas a optimizar su CV para superar filtros de IA y ATS. Nuestro cliente es alguien que lleva semanas enviando CVs sin respuesta..."
                  className="w-full h-48 bg-surface border border-border rounded-2xl p-5 text-sm text-text-main placeholder-text-muted resize-none focus:outline-none focus:border-primary transition-colors"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-text-muted mb-2 font-medium">Objetivo principal</p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {OBJECTIVES.map(({ id, label }) => (
                        <button key={id} onClick={() => store.setObjective(id)}
                          className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${store.selectedObjective === id ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-surface border border-border text-text-muted hover:border-primary/30'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-text-muted mb-2 font-medium">Plataforma</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {PLATFORMS.map(({ id, label, icon }) => (
                          <button key={id} onClick={() => store.setPlatform(id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${store.selectedPlatform === id ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-surface border border-border text-text-muted hover:border-primary/30'}`}>
                            {icon} {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-text-muted mb-2 font-medium">Tono de comunicación</p>
                      <div className="flex flex-wrap gap-1.5">
                        {TONES.map((tone) => (
                          <button key={tone} onClick={() => store.setTone(tone as Tone)}
                            className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-all ${store.selectedTone === tone ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-surface border border-border text-text-muted hover:border-primary/30'}`}>
                            {tone}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Button onClick={handleAnalyze} loading={store.isLoading} size="lg" className="w-full" icon={<Sparkles size={18} />}>
                  {store.isLoading ? store.loadingMessage : 'Analizar y generar ideas'}
                </Button>
              </div>

              <div className="col-span-2">
                <Card className="sticky top-8">
                  <h3 className="font-semibold text-text-main text-sm mb-4">Lo que hará la IA</h3>
                  <div className="space-y-3">
                    {[
                      { icon: '🧠', title: 'Análisis profundo', desc: 'Detecta propuesta de valor, dolores del cliente y diferenciadores' },
                      { icon: '💡', title: '5 ideas de campaña', desc: 'Conceptos únicos con hooks, ángulos y potencial viral' },
                      { icon: '✍️', title: 'Copy completo', desc: 'Headline, caption, CTA y hashtags listos para publicar' },
                      { icon: '🎨', title: 'Imagen premium', desc: 'Creatividad visual estilo agencia de nivel internacional' },
                    ].map(({ icon, title, desc }) => (
                      <div key={title} className="flex gap-3">
                        <span className="text-lg">{icon}</span>
                        <div>
                          <p className="text-xs font-semibold text-text-main">{title}</p>
                          <p className="text-xs text-text-muted">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {/* ─── PASO 2: CAMPAÑAS ─── */}
          {store.step === 'campaigns' && (
            <motion.div key="campaigns" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {store.analysis && !store.campaigns.length && (
                <div className="max-w-2xl mx-auto">
                  <div className="mb-6 p-5 bg-surface border border-border rounded-2xl">
                    <h3 className="font-semibold text-text-main mb-3 flex items-center gap-2">
                      <Sparkles size={16} className="text-primary" /> Análisis completado
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-text-muted mb-1">Propuesta de valor</p>
                        <p className="text-text-main">{store.analysis.value_proposition}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted mb-1">Insight clave</p>
                        <p className="text-text-main italic">"{store.analysis.quick_insight}"</p>
                      </div>
                    </div>
                    {store.analysis.pain_points?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-text-muted mb-1.5">Dolores del cliente detectados</p>
                        <div className="flex flex-wrap gap-1.5">
                          {store.analysis.pain_points.map((p) => (
                            <span key={p} className="text-xs px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full">{p}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button onClick={handleGenerateCampaigns} loading={store.isLoading} size="lg" className="w-full" icon={<Sparkles size={18} />}>
                    {store.isLoading ? store.loadingMessage : 'Generar 5 ideas de campaña (1 crédito)'}
                  </Button>
                </div>
              )}

              {store.campaigns.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-text-main">Elige tu campaña</h2>
                      <p className="text-sm text-text-muted">El director creativo generó {store.campaigns.length} conceptos únicos</p>
                    </div>
                    {store.selectedCampaign && (
                      <Button onClick={() => store.setStep('content')} icon={<ArrowRight size={16} />}>
                        Crear contenido
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {store.campaigns.map((campaign, i) => (
                      <CampaignCard
                        key={campaign.id}
                        campaign={campaign}
                        index={i}
                        selected={store.selectedCampaign?.id === campaign.id}
                        onSelect={(c: Campaign) => store.setSelectedCampaign(c)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ─── PASO 3: CONTENIDO ─── */}
          {store.step === 'content' && (
            <motion.div key="content" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-5 gap-6">
              <div className="col-span-2 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-text-main mb-1">Crear contenido</h2>
                  <p className="text-sm text-text-muted">Selecciona el formato y genera el copy</p>
                </div>

                <div>
                  <p className="text-xs text-text-muted mb-2 font-medium">Formato</p>
                  <div className="grid grid-cols-2 gap-2">
                    {FORMATS.map(({ id, label, icon, credits }) => (
                      <button key={id} onClick={() => store.setFormat(id)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs transition-all border ${store.selectedFormat === id ? 'bg-primary/15 text-primary border-primary/30' : 'bg-surface border-border text-text-muted hover:border-primary/30'}`}>
                        {icon}
                        <span className="font-medium">{label}</span>
                        <span className="text-[10px] opacity-60">{credits} crd</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-surface border border-border rounded-xl">
                  <p className="text-xs font-semibold text-text-main mb-2">Campaña seleccionada</p>
                  <p className="text-sm font-medium text-primary">{store.selectedCampaign?.title}</p>
                  <p className="text-xs text-text-muted mt-1">{store.selectedCampaign?.concept}</p>
                </div>

                <Button onClick={handleGeneratePost} loading={store.isLoading} size="lg" className="w-full" icon={<FileText size={16} />}>
                  {store.isLoading ? store.loadingMessage : `Generar ${store.selectedFormat}`}
                </Button>

                <button onClick={handleVideoQuestions} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-muted hover:border-primary/30 hover:text-text-main transition-all">
                  <Video size={15} />
                  Crear video en su lugar
                </button>
              </div>

              <div className="col-span-3">
                {store.isLoading ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <Loader2 size={32} className="text-primary animate-spin" />
                    <p className="text-sm text-text-muted">{store.loadingMessage}</p>
                  </div>
                ) : store.carouselContent ? (
                  <CarouselPreview content={store.carouselContent} platform={store.selectedPlatform} />
                ) : store.postContent ? (
                  <PostPreview content={store.postContent} platform={store.selectedPlatform} />
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-sm text-text-muted">El contenido aparecerá aquí</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ─── PASO 4: IMAGEN ─── */}
          {store.step === 'image' && (
            <motion.div key="image" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-5 gap-6">
              <div className="col-span-2 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-text-main mb-1">Generar imagen</h2>
                  <p className="text-sm text-text-muted">Elige el tipo de imagen que quieres crear</p>
                </div>

                {/* Mode selector */}
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setImageMode('design')}
                    className={`p-3 rounded-xl border text-left transition-all ${imageMode === 'design' ? 'bg-primary/15 border-primary/40 text-primary' : 'bg-surface border-border text-text-muted hover:border-primary/30'}`}>
                    <div className="text-base mb-1">🎨</div>
                    <div className="text-xs font-semibold">Diseño publicitario</div>
                    <div className="text-[10px] opacity-70 mt-0.5">Tipografía, layout, marca</div>
                  </button>
                  <button onClick={() => setImageMode('photo')}
                    className={`p-3 rounded-xl border text-left transition-all ${imageMode === 'photo' ? 'bg-primary/15 border-primary/40 text-primary' : 'bg-surface border-border text-text-muted hover:border-primary/30'}`}>
                    <div className="text-base mb-1">📸</div>
                    <div className="text-xs font-semibold">Escena fotorrealista</div>
                    <div className="text-[10px] opacity-70 mt-0.5">Personas, ambientes, emociones</div>
                  </button>
                </div>

                {/* Campaign context */}
                {store.selectedCampaign && (
                  <div className="p-4 bg-surface border border-border rounded-xl space-y-3">
                    <p className="text-xs font-semibold text-text-main">Campaña seleccionada</p>
                    <p className="text-sm font-medium text-primary">{store.selectedCampaign.title}</p>
                    {store.selectedCampaign.hook && (
                      <div className="p-2 bg-primary/5 border border-primary/15 rounded-lg">
                        <p className="text-[10px] text-primary mb-0.5 font-medium">Hook</p>
                        <p className="text-xs text-text-main italic">"{store.selectedCampaign.hook}"</p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {store.selectedCampaign.angle && (
                        <span className="text-[10px] px-2 py-0.5 bg-surface border border-border text-text-muted rounded-full capitalize">Ángulo: {store.selectedCampaign.angle}</span>
                      )}
                      {store.selectedCampaign.emotion && (
                        <span className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full capitalize">{store.selectedCampaign.emotion}</span>
                      )}
                      {store.selectedCampaign.best_format && (
                        <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full capitalize">{store.selectedCampaign.best_format}</span>
                      )}
                    </div>
                    {store.selectedCampaign.concept && (
                      <p className="text-xs text-text-muted">{store.selectedCampaign.concept}</p>
                    )}
                  </div>
                )}

                {/* Textos editables */}
                {(store.postContent || store.carouselContent) && (
                  <div className="p-4 bg-surface border border-border rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-text-main">Textos del anuncio</p>
                      <button onClick={() => setEditingTexts(!editingTexts)}
                        className="text-[10px] text-primary hover:text-primary/80 transition-colors">
                        {editingTexts ? 'Listo' : 'Editar'}
                      </button>
                    </div>
                    {editingTexts ? (
                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] text-text-muted block mb-1">Titular</label>
                          <input value={editableTexts.headline}
                            onChange={e => setEditableTexts(p => ({ ...p, headline: e.target.value }))}
                            className="w-full bg-bg border border-border rounded-lg px-3 py-1.5 text-xs text-text-main focus:outline-none focus:border-primary" />
                        </div>
                        <div>
                          <label className="text-[10px] text-text-muted block mb-1">Secundario</label>
                          <input value={editableTexts.subheadline}
                            onChange={e => setEditableTexts(p => ({ ...p, subheadline: e.target.value }))}
                            className="w-full bg-bg border border-border rounded-lg px-3 py-1.5 text-xs text-text-main focus:outline-none focus:border-primary" />
                        </div>
                        <div>
                          <label className="text-[10px] text-text-muted block mb-1">CTA</label>
                          <input value={editableTexts.cta}
                            onChange={e => setEditableTexts(p => ({ ...p, cta: e.target.value }))}
                            className="w-full bg-bg border border-border rounded-lg px-3 py-1.5 text-xs text-text-main focus:outline-none focus:border-primary" />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-xs">
                        <p className="text-text-muted"><span className="text-text-main font-medium">Titular:</span> {editableTexts.headline}</p>
                        <p className="text-text-muted"><span className="text-text-main font-medium">Secundario:</span> {editableTexts.subheadline}</p>
                        <p className="text-text-muted"><span className="text-text-main font-medium">CTA:</span> {editableTexts.cta}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Estilo visual */}
                <div className="p-4 bg-surface border border-border rounded-xl space-y-2">
                  <p className="text-xs font-semibold text-text-main">Estilo visual</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'corporativo', emoji: '🏢' },
                      { id: 'startup', emoji: '🚀' },
                      { id: 'lujo', emoji: '💎' },
                      { id: 'minimalista', emoji: '⬜' },
                      { id: 'agresivo', emoji: '⚡' },
                      { id: 'emocional', emoji: '❤️' },
                      { id: 'moderno', emoji: '✨' },
                      { id: 'tecnológico', emoji: '🤖' },
                      { id: 'tiktok_viral', emoji: '🎵' },
                      { id: 'elegante', emoji: '🎩' },
                      { id: 'premium', emoji: '👑' },
                    ].map(({ id, emoji }) => (
                      <button key={id} onClick={() => setVisualStyle(id)}
                        className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-all ${visualStyle === id ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-bg border border-border text-text-muted hover:border-primary/30'}`}>
                        {emoji} {id.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {imageMode === 'design' ? (
                  /* ── DISEÑO PUBLICITARIO ── */
                  <Button onClick={handleGenerateDesign} loading={store.isLoading} size="lg" className="w-full" icon={<Sparkles size={16} />}>
                    {store.isLoading ? store.loadingMessage : 'Generar diseño (5 créditos)'}
                  </Button>
                ) : (
                  /* ── ESCENA FOTORREALISTA ── */
                  !store.imageData ? (
                    <Button onClick={handleGenerateImagePrompt} loading={store.isLoading} size="lg" className="w-full" icon={<Image size={16} />}>
                      {store.isLoading ? store.loadingMessage : 'Preparar concepto visual'}
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 bg-surface border border-border rounded-xl">
                        <p className="text-xs text-text-muted mb-2">Estilo detectado</p>
                        <p className="text-sm text-text-main">{store.imageData.style}</p>
                      </div>
                      {store.imageData.color_palette?.length > 0 && (
                        <div className="flex gap-2">
                          {store.imageData.color_palette.map((color) => (
                            <div key={color} className="w-8 h-8 rounded-lg border border-border" style={{ backgroundColor: color }} title={color} />
                          ))}
                        </div>
                      )}
                      {!store.generatedImageUrl && (
                        <Button onClick={handleGenerateImage} loading={store.isLoading} size="lg" className="w-full" icon={<Sparkles size={16} />}>
                          {store.isLoading ? store.loadingMessage : 'Generar foto (5 créditos)'}
                        </Button>
                      )}
                      {store.generatedImageUrl && (
                        <Button onClick={handleGenerateImagePrompt}
                          variant="secondary" size="sm" className="w-full" icon={<Sparkles size={14} />}>
                          Regenerar concepto
                        </Button>
                      )}
                    </div>
                  )
                )}

                {store.generatedImageUrl && (
                  <Button onClick={imageMode === 'design' ? handleGenerateDesign : handleGenerateImagePrompt}
                    variant="secondary" size="sm" className="w-full" icon={<Sparkles size={14} />}>
                    Regenerar
                  </Button>
                )}
              </div>

              <div className="col-span-3">
                <ImageCanvas
                  imageData={store.imageData}
                  imageUrl={store.generatedImageUrl}
                  onGenerate={handleGenerateImage}
                  onRegenerate={handleGenerateImage}
                  isLoading={store.isLoading && store.loadingMessage.includes('imagen')}
                  headline={editableTexts.headline || store.postContent?.headline}
                  subheadline={editableTexts.subheadline || store.postContent?.subheadline}
                  cta={editableTexts.cta || store.postContent?.cta}
                />
              </div>
            </motion.div>
          )}

          {/* ─── PASO 5: VIDEO ─── */}
          {store.step === 'video' && (
            <motion.div key="video" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-5 gap-6">
              <div className="col-span-2 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-text-main mb-1">Guion de video</h2>
                  <p className="text-sm text-text-muted">Configura el video antes de generar el guion</p>
                </div>

                <div className="space-y-4">
                  {videoQuestions.map((q) => (
                    <div key={q.id}>
                      <p className="text-xs text-text-muted mb-2 font-medium">{q.question}</p>
                      <div className="grid grid-cols-1 gap-1.5">
                        {q.options?.map((opt) => (
                          <button key={opt} onClick={() => setVideoAnswers(prev => ({ ...prev, [q.id]: opt }))}
                            className={`text-left px-3 py-2 rounded-lg text-xs transition-all border ${videoAnswers[q.id] === opt ? 'bg-primary/15 text-primary border-primary/30' : 'bg-surface border-border text-text-muted hover:border-primary/30'}`}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <Button onClick={handleGenerateVideoScript} loading={store.isLoading} size="lg" className="w-full" icon={<Video size={16} />}>
                  {store.isLoading ? store.loadingMessage : 'Generar guion (3 créditos)'}
                </Button>

                {store.videoScript && (
                  <div className="space-y-2">
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl">
                      <p className="text-[10px] text-primary uppercase font-medium mb-1">¿Quieres el video real?</p>
                      <p className="text-xs text-text-muted mb-3">Genera el video con IA (persona moviéndose y gesticulando según el guion). Requiere API de Replicate.</p>
                      <Button onClick={handleRenderVideo} loading={store.isLoading} size="sm" className="w-full" icon={<Sparkles size={14} />}>
                        {store.isLoading ? store.loadingMessage : 'Generar video real (15 créditos)'}
                      </Button>
                    </div>
                    {videoRenderError && (
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                        <p className="text-xs font-semibold text-yellow-400 mb-1">⚙️ Configuración requerida</p>
                        <p className="text-xs text-yellow-300">{videoRenderError}</p>
                        <a href="https://replicate.com/account/api-tokens" target="_blank" rel="noreferrer"
                          className="inline-block mt-2 text-xs text-primary underline">
                          Obtén tu API key gratis en Replicate →
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {videoError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <p className="text-xs font-semibold text-red-400 mb-1">Error al generar</p>
                    <p className="text-xs text-red-300">{videoError}</p>
                  </div>
                )}
              </div>

              <div className="col-span-3">
                {store.isLoading ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <Loader2 size={32} className="text-primary animate-spin" />
                    <p className="text-sm text-text-muted">{store.loadingMessage}</p>
                    {store.loadingMessage.includes('video real') && (
                      <p className="text-xs text-text-muted/60 text-center max-w-xs">
                        La IA genera el video cuadro por cuadro. Este proceso toma 2-3 minutos.
                      </p>
                    )}
                  </div>
                ) : generatedVideoUrl ? (
                  <div className="space-y-4">
                    <video controls className="w-full rounded-2xl border border-border" src={generatedVideoUrl}>
                      Tu navegador no soporta video.
                    </video>
                    <a href={generatedVideoUrl} download className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-muted hover:text-text-main hover:border-primary/30 transition-all">
                      ⬇️ Descargar video
                    </a>
                    {store.videoScript && <VideoStoryboard script={store.videoScript} />}
                  </div>
                ) : store.videoScript ? (
                  <VideoStoryboard script={store.videoScript} />
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-sm text-text-muted">El guion aparecerá aquí</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
