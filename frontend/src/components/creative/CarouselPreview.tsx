import { useState } from 'react'
import { ChevronLeft, ChevronRight, Copy, Check, Hash, Layers } from 'lucide-react'
import toast from 'react-hot-toast'
import type { CarouselContent } from '../../types'

interface CarouselPreviewProps {
  content: CarouselContent
  platform: string
}

const SLIDE_STYLES: Record<string, string> = {
  portada: 'from-primary/20 to-primary/5 border-primary/30',
  contenido: 'from-surface to-bg border-border',
  cta: 'from-green-500/15 to-green-500/5 border-green-500/30',
}

export function CarouselPreview({ content, platform }: CarouselPreviewProps) {
  const [current, setCurrent] = useState(0)
  const [copied, setCopied] = useState(false)

  const slides = content.slides ?? []
  const slide = slides[current]

  const prev = () => setCurrent(c => Math.max(0, c - 1))
  const next = () => setCurrent(c => Math.min(slides.length - 1, c + 1))

  const copyCaption = async () => {
    await navigator.clipboard.writeText(content.full_caption ?? '')
    setCopied(true)
    toast.success('Caption copiado')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Slide viewer */}
      <div className="bg-bg border border-border rounded-2xl overflow-hidden">
        {/* Navigation header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-primary" />
            <span className="text-xs font-semibold text-text-main">Carrusel · {slides.length} slides</span>
            <span className="text-xs text-text-muted capitalize">· {platform}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prev} disabled={current === 0}
              className="p-1 rounded-lg hover:bg-surface disabled:opacity-30 transition-all text-text-muted hover:text-text-main">
              <ChevronLeft size={15} />
            </button>
            <span className="text-xs text-text-muted font-medium">{current + 1} / {slides.length}</span>
            <button onClick={next} disabled={current === slides.length - 1}
              className="p-1 rounded-lg hover:bg-surface disabled:opacity-30 transition-all text-text-muted hover:text-text-main">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-1.5 pb-3">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${i === current ? 'w-4 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-border hover:bg-primary/50'}`} />
          ))}
        </div>

        {/* Slide content */}
        {slide && (
          <div className={`mx-4 mb-4 rounded-2xl bg-gradient-to-br border p-5 min-h-[160px] flex flex-col justify-center ${SLIDE_STYLES[slide.type] ?? SLIDE_STYLES.contenido}`}>
            {/* Slide badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize
                ${slide.type === 'portada' ? 'bg-primary/20 text-primary' :
                  slide.type === 'cta' ? 'bg-green-500/20 text-green-400' :
                  'bg-surface border border-border text-text-muted'}`}>
                {slide.type === 'portada' ? '🎯 Portada' : slide.type === 'cta' ? '🚀 CTA' : `📄 Slide ${slide.number}`}
              </span>
            </div>

            {/* Headline */}
            <h3 className="text-lg font-bold text-text-main leading-tight mb-2">
              {slide.headline}
            </h3>

            {/* Subtext */}
            {slide.subtext && (
              <p className="text-sm text-text-muted leading-relaxed">{slide.subtext}</p>
            )}

            {/* Visual description */}
            {slide.visual_description && (
              <div className="mt-3 p-2.5 bg-bg/60 border border-border/50 rounded-xl">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">Visual sugerido</p>
                <p className="text-xs text-text-muted italic">{slide.visual_description}</p>
              </div>
            )}

            {/* Design notes */}
            {slide.design_notes && (
              <p className="mt-2 text-[10px] text-primary/70 italic">💡 {slide.design_notes}</p>
            )}
          </div>
        )}
      </div>

      {/* All slides summary */}
      <div className="bg-surface border border-border rounded-2xl p-4">
        <p className="text-xs font-semibold text-text-main mb-3">Estructura completa</p>
        <div className="space-y-1.5">
          {slides.map((s, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all
                ${i === current ? 'bg-primary/10 border border-primary/20' : 'hover:bg-bg border border-transparent'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0
                ${i === current ? 'bg-primary text-white' : 'bg-surface border border-border text-text-muted'}`}>
                {s.number}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-text-main truncate">{s.headline}</p>
                {s.subtext && <p className="text-[10px] text-text-muted truncate">{s.subtext}</p>}
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full capitalize flex-shrink-0
                ${s.type === 'portada' ? 'bg-primary/10 text-primary' :
                  s.type === 'cta' ? 'bg-green-500/10 text-green-400' :
                  'bg-surface text-text-muted'}`}>
                {s.type}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Caption + hashtags */}
      {content.full_caption && (
        <div className="bg-bg border border-border rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-text-main">Caption listo para publicar</p>
            <button onClick={copyCaption}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-text-muted hover:text-text-main hover:border-primary/40 transition-all">
              {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <p className="text-sm text-text-main leading-relaxed whitespace-pre-wrap">{content.full_caption}</p>
          {content.hashtags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {content.hashtags.map(h => (
                <span key={h} className="flex items-center gap-0.5 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                  <Hash size={9} />{h.replace('#', '')}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hook analysis */}
      {content.hook_analysis && (
        <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
          <p className="text-xs font-semibold text-yellow-400 mb-1.5">🎯 Análisis del hook</p>
          <p className="text-xs text-text-muted leading-relaxed">{content.hook_analysis}</p>
        </div>
      )}

      {/* Director feedback */}
      {content.director_feedback && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <p className="text-xs font-semibold text-primary mb-1.5">🎬 Director Creativo dice:</p>
          <p className="text-xs text-text-muted leading-relaxed">{content.director_feedback}</p>
        </div>
      )}
    </div>
  )
}
