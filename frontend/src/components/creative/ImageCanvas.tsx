import { useRef, useState } from 'react'
import { Download, RefreshCw, Loader2, Image, ChevronDown, ChevronUp } from 'lucide-react'
import type { ImageData } from '../../types'
import { Button } from '../ui/Button'
import toast from 'react-hot-toast'

interface ImageCanvasProps {
  imageData: ImageData | null
  imageUrl: string | null
  onGenerate: () => void
  onRegenerate: () => void
  isLoading: boolean
  headline?: string
  subheadline?: string
  cta?: string
}

export function ImageCanvas({ imageData, imageUrl, onGenerate, onRegenerate, isLoading, headline, subheadline, cta }: ImageCanvasProps) {
  const [showPrompt, setShowPrompt] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const handleDownload = async () => {
    if (!imageUrl) return
    setDownloading(true)
    try {
      // Load the image into a canvas and bake in text overlay
      const img = new window.Image()
      img.crossOrigin = 'anonymous'

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('load failed'))
        img.src = imageUrl
      })

      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth || img.width
      canvas.height = img.naturalHeight || img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const hasOverlay = headline || subheadline || cta
      if (hasOverlay) {
        const W = canvas.width
        const H = canvas.height
        const overlayH = Math.round(H * 0.28)

        // Dark gradient at bottom
        const grad = ctx.createLinearGradient(0, H - overlayH, 0, H)
        grad.addColorStop(0, 'rgba(0,0,0,0)')
        grad.addColorStop(0.4, 'rgba(0,0,0,0.6)')
        grad.addColorStop(1, 'rgba(0,0,0,0.88)')
        ctx.fillStyle = grad
        ctx.fillRect(0, H - overlayH, W, overlayH)

        const pad = Math.round(W * 0.05)
        let y = H - overlayH + Math.round(overlayH * 0.25)

        if (headline) {
          const fontSize = Math.max(20, Math.round(W * 0.048))
          ctx.font = `bold ${fontSize}px Inter, Arial, sans-serif`
          ctx.fillStyle = '#ffffff'
          ctx.shadowColor = 'rgba(0,0,0,0.5)'
          ctx.shadowBlur = 8
          ctx.fillText(headline, pad, y, W - pad * 2)
          y += Math.round(fontSize * 1.4)
        }

        if (subheadline) {
          const fontSize = Math.max(14, Math.round(W * 0.028))
          ctx.font = `${fontSize}px Inter, Arial, sans-serif`
          ctx.fillStyle = 'rgba(255,255,255,0.82)'
          ctx.shadowBlur = 4
          ctx.fillText(subheadline, pad, y, W - pad * 2)
          y += Math.round(fontSize * 1.6)
        }

        if (cta) {
          const fontSize = Math.max(13, Math.round(W * 0.026))
          ctx.font = `bold ${fontSize}px Inter, Arial, sans-serif`
          const pillH = Math.round(fontSize * 1.9)
          const pillW = Math.min(ctx.measureText(cta).width + Math.round(W * 0.06), W - pad * 2)
          const pillY = y - Math.round(fontSize * 1.1)
          // Pill background
          ctx.shadowBlur = 0
          ctx.fillStyle = '#7c3aed'
          ctx.beginPath()
          ctx.roundRect(pad, pillY, pillW, pillH, Math.round(pillH / 2))
          ctx.fill()
          ctx.fillStyle = '#ffffff'
          ctx.fillText(cta, pad + Math.round(W * 0.03), pillY + Math.round(pillH * 0.66), pillW - Math.round(W * 0.04))
        }

        ctx.shadowBlur = 0
      }

      // Export
      const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/png'))
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `adgenius-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Imagen descargada con texto')
    } catch {
      // Fallback: direct blob download (no canvas text)
      try {
        const res = await fetch(imageUrl)
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `adgenius-${Date.now()}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch {
        toast.error('No se pudo descargar la imagen')
      }
    } finally {
      setDownloading(false)
    }
  }

  const aspectRatio = imageData?.dimensions === '9:16' ? '9/16' : imageData?.dimensions === '16:9' ? '16/9' : '1/1'
  const hasOverlay = imageUrl && (headline || subheadline || cta)

  return (
    <div className="space-y-4">
      <div
        className="relative bg-bg border border-border rounded-2xl overflow-hidden w-full"
        style={{ aspectRatio }}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="text-primary animate-spin" />
            <p className="text-sm text-text-muted">Generando imagen premium...</p>
            <p className="text-xs text-text-muted/60">Esto puede tomar 20-40 segundos</p>
          </div>
        ) : imageUrl ? (
          <>
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Generated ad"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            {/* Text overlay — CSS layer visible on screen */}
            {hasOverlay && (
              <div className="absolute inset-0 flex flex-col justify-end pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 35%, transparent 65%)' }}>
                <div className="px-5 pb-5 space-y-1.5">
                  {headline && (
                    <p className="text-white font-bold leading-tight drop-shadow-lg"
                      style={{ fontSize: 'clamp(14px, 3.5vw, 22px)', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
                      {headline}
                    </p>
                  )}
                  {subheadline && (
                    <p className="text-white/80 leading-snug drop-shadow"
                      style={{ fontSize: 'clamp(11px, 2.2vw, 15px)' }}>
                      {subheadline}
                    </p>
                  )}
                  {cta && (
                    <span className="inline-block mt-1 px-4 py-1.5 bg-primary text-white font-semibold rounded-full drop-shadow-lg"
                      style={{ fontSize: 'clamp(10px, 1.8vw, 13px)' }}>
                      {cta}
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Image size={28} className="text-primary/60" />
            </div>
            <p className="text-sm text-text-muted text-center px-4">
              La imagen se generará aquí
            </p>
            {imageData && (
              <Button onClick={onGenerate} size="sm" icon={<Image size={15} />}>
                Generar imagen (5 créditos)
              </Button>
            )}
          </div>
        )}
      </div>

      {imageUrl && (
        <div className="flex gap-2">
          <Button
            onClick={handleDownload}
            loading={downloading}
            variant="secondary"
            size="sm"
            icon={<Download size={15} />}
            className="flex-1"
          >
            {hasOverlay ? 'Descargar con texto' : 'Descargar PNG'}
          </Button>
          <Button
            onClick={onRegenerate}
            variant="secondary"
            size="sm"
            icon={<RefreshCw size={15} />}
            loading={isLoading}
          >
            Regenerar
          </Button>
        </div>
      )}

      {imageData && (
        <>
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-text-main transition-colors w-full"
          >
            {showPrompt ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            Ver prompt generado
          </button>
          {showPrompt && (
            <div className="p-3 bg-surface border border-border rounded-xl">
              <p className="text-xs font-mono text-text-muted leading-relaxed">{imageData.image_prompt}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
