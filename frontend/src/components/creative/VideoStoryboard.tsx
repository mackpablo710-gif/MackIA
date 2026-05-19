import { Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import type { VideoScript } from '../../types'

interface VideoStoryboardProps {
  script: VideoScript
}

export function VideoStoryboard({ script }: VideoStoryboardProps) {
  const copyScript = async () => {
    const text = script.scenes.map(s =>
      `ESCENA ${s.id} (${s.duration})\nVisual: ${s.visual}\nVoz: ${s.voiceover}\nTexto: ${s.text_overlay}`
    ).join('\n\n')
    await navigator.clipboard.writeText(text)
    toast.success('Guion copiado')
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
        <p className="text-xs font-semibold text-primary mb-1">Hook (primeros 3 seg)</p>
        <p className="text-sm font-medium text-text-main italic">"{script.hook}"</p>
        {script.hook_analysis && (
          <p className="text-xs text-text-muted mt-1.5">{script.hook_analysis}</p>
        )}
      </div>

      <div className="space-y-2">
        {script.scenes?.map((scene) => (
          <div key={scene.id} className="p-3.5 bg-surface border border-border rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono bg-primary/15 text-primary px-2 py-0.5 rounded-md">
                Escena {scene.id}
              </span>
              <span className="text-xs text-text-muted">{scene.duration}</span>
              {scene.transition && (
                <span className="text-xs text-text-muted/60">→ {scene.transition}</span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-1.5 text-xs">
              {scene.visual && (
                <div className="flex gap-2">
                  <span className="text-text-muted w-12 flex-shrink-0">Visual:</span>
                  <span className="text-text-main">{scene.visual}</span>
                </div>
              )}
              {scene.text_overlay && (
                <div className="flex gap-2">
                  <span className="text-text-muted w-12 flex-shrink-0">Texto:</span>
                  <span className="text-text-main font-medium">"{scene.text_overlay}"</span>
                </div>
              )}
              {scene.voiceover && (
                <div className="flex gap-2">
                  <span className="text-text-muted w-12 flex-shrink-0">Voz:</span>
                  <span className="text-text-muted italic">{scene.voiceover}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-surface border border-border rounded-xl">
        <p className="text-xs font-semibold text-accent mb-1">CTA Final</p>
        <p className="text-sm font-medium text-text-main">{script.cta_final}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {script.music_style && (
          <div className="p-2.5 bg-surface border border-border rounded-lg">
            <p className="text-text-muted mb-0.5">Música</p>
            <p className="text-text-main">{script.music_style}</p>
          </div>
        )}
        {script.estimated_hook_rate && (
          <div className="p-2.5 bg-surface border border-border rounded-lg">
            <p className="text-text-muted mb-0.5">Retención estimada</p>
            <p className="text-green-400 font-medium">{script.estimated_hook_rate}</p>
          </div>
        )}
      </div>

      <button
        onClick={copyScript}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs font-medium text-text-muted hover:text-text-main transition-all w-full justify-center"
      >
        <Copy size={13} />
        Copiar guion completo
      </button>
    </div>
  )
}
