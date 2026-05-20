import { useState } from 'react'
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
}

export function ImageCanvas({ imageData, imageUrl, onGenerate, onRegenerate, isLoading }: ImageCanvasProps) {
  const [showPrompt, setShowPrompt] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (!imageUrl) return
    setDownloading(true)
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
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
    } finally {
      setDownloading(false)
    }
  }

  const aspectRatio = imageData?.dimensions === '9:16' ? '9/16' : imageData?.dimensions === '16:9' ? '16/9' : '1/1'

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
          <img
            src={imageUrl}
            alt="Generated ad"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
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
            Descargar PNG
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
