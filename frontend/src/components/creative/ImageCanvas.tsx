import { useState } from 'react'
import { Download, RefreshCw, Loader2, Image } from 'lucide-react'
import type { ImageData } from '../../types'
import { Button } from '../ui/Button'

interface ImageCanvasProps {
  imageData: ImageData | null
  imageUrl: string | null
  onGenerate: () => void
  onRegenerate: () => void
  isLoading: boolean
}

export function ImageCanvas({ imageData, imageUrl, onGenerate, onRegenerate, isLoading }: ImageCanvasProps) {
  const [showPrompt, setShowPrompt] = useState(false)

  const handleDownload = async () => {
    if (!imageUrl) return
    const a = document.createElement('a')
    a.href = imageUrl
    a.download = 'adgenius-image.png'
    a.target = '_blank'
    a.click()
  }

  return (
    <div className="space-y-4">
      <div className="relative bg-bg border border-border rounded-2xl overflow-hidden" style={{ aspectRatio: '1/1' }}>
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="text-primary animate-spin" />
            <p className="text-sm text-text-muted">Generando imagen premium...</p>
            <p className="text-xs text-text-muted/60">Esto puede tomar 15-30 segundos</p>
          </div>
        ) : imageUrl ? (
          <img src={imageUrl} alt="Generated ad" className="w-full h-full object-cover" />
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
          <Button onClick={handleDownload} variant="secondary" size="sm" icon={<Download size={15} />} className="flex-1">
            Descargar
          </Button>
          <Button onClick={onRegenerate} variant="secondary" size="sm" icon={<RefreshCw size={15} />} loading={isLoading}>
            Regenerar
          </Button>
        </div>
      )}

      {imageData && (
        <button
          onClick={() => setShowPrompt(!showPrompt)}
          className="text-xs text-text-muted hover:text-text-main transition-colors w-full text-left"
        >
          {showPrompt ? '▼' : '▶'} Ver prompt generado
        </button>
      )}

      {showPrompt && imageData && (
        <div className="p-3 bg-surface border border-border rounded-xl">
          <p className="text-xs font-mono text-text-muted leading-relaxed">{imageData.image_prompt}</p>
        </div>
      )}
    </div>
  )
}
