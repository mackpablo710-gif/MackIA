import { Copy, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import type { VideoScript } from '../../types'

interface VideoStoryboardProps {
  script: VideoScript
}

export function VideoStoryboard({ script }: VideoStoryboardProps) {
  const copyScript = async () => {
    const text = buildScriptText(script)
    await navigator.clipboard.writeText(text)
    toast.success('Guion copiado')
  }

  const downloadScript = () => {
    const text = buildScriptText(script)
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `guion-video-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Guion descargado')
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
              {scene.music_note && (
                <div className="flex gap-2">
                  <span className="text-text-muted w-12 flex-shrink-0">Música:</span>
                  <span className="text-text-muted/70">{scene.music_note}</span>
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
        {script.total_duration && (
          <div className="p-2.5 bg-surface border border-border rounded-lg">
            <p className="text-text-muted mb-0.5">Duración total</p>
            <p className="text-text-main">{script.total_duration}</p>
          </div>
        )}
        {script.casting_notes && (
          <div className="p-2.5 bg-surface border border-border rounded-lg">
            <p className="text-text-muted mb-0.5">Casting</p>
            <p className="text-text-main">{script.casting_notes}</p>
          </div>
        )}
      </div>

      {script.director_notes && (
        <div className="p-3 bg-surface border border-border rounded-xl text-xs">
          <p className="text-text-muted mb-1 font-medium">Notas del director</p>
          <p className="text-text-muted italic">{script.director_notes}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={copyScript}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-surface border border-border rounded-lg text-xs font-medium text-text-muted hover:text-text-main transition-all"
        >
          <Copy size={13} /> Copiar guion
        </button>
        <button
          onClick={downloadScript}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary/10 border border-primary/30 rounded-lg text-xs font-medium text-primary hover:bg-primary/15 transition-all"
        >
          <Download size={13} /> Descargar .txt
        </button>
      </div>

      <p className="text-[10px] text-text-muted text-center">
        Usa este guion para grabar tu video y súbelo directamente a TikTok o Instagram Reels.
      </p>
    </div>
  )
}

function buildScriptText(script: VideoScript): string {
  const lines: string[] = [
    '═══════════════════════════════════════',
    '           GUION DE VIDEO - AdGenius AI',
    '═══════════════════════════════════════',
    '',
    `HOOK (primeros 3 segundos):`,
    `"${script.hook}"`,
    '',
    script.hook_analysis ? `Análisis del hook: ${script.hook_analysis}` : '',
    '',
    '───────────────────────────────────────',
    '                  ESCENAS',
    '───────────────────────────────────────',
    '',
  ]

  script.scenes?.forEach(scene => {
    lines.push(`ESCENA ${scene.id} | ${scene.duration}`)
    if (scene.visual) lines.push(`  Visual: ${scene.visual}`)
    if (scene.text_overlay) lines.push(`  Texto en pantalla: "${scene.text_overlay}"`)
    if (scene.voiceover) lines.push(`  Voz en off: ${scene.voiceover}`)
    if (scene.music_note) lines.push(`  Música: ${scene.music_note}`)
    if (scene.transition) lines.push(`  Transición: ${scene.transition}`)
    lines.push('')
  })

  lines.push('───────────────────────────────────────')
  lines.push(`CTA FINAL: ${script.cta_final}`)
  lines.push('')
  lines.push('───────────────────────────────────────')
  if (script.total_duration) lines.push(`Duración total: ${script.total_duration}`)
  if (script.music_style) lines.push(`Estilo musical: ${script.music_style}`)
  if (script.casting_notes) lines.push(`Casting: ${script.casting_notes}`)
  if (script.estimated_hook_rate) lines.push(`Retención estimada: ${script.estimated_hook_rate}`)
  if (script.director_notes) {
    lines.push('')
    lines.push(`Notas del director: ${script.director_notes}`)
  }
  lines.push('')
  lines.push('═══════════════════════════════════════')
  lines.push('Generado con AdGenius AI')

  return lines.filter(l => l !== null).join('\n')
}
