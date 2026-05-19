import { useState } from 'react'
import { Copy, Check, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import type { PostContent } from '../../types'
import { Badge } from '../ui/Badge'

interface PostPreviewProps {
  content: PostContent
  platform: string
}

export function PostPreview({ content, platform }: PostPreviewProps) {
  const [copied, setCopied] = useState(false)

  const copyCaption = async () => {
    await navigator.clipboard.writeText(content.full_caption)
    setCopied(true)
    toast.success('Caption copiado')
    setTimeout(() => setCopied(false), 2000)
  }

  const score = content.conversion_score ?? 0
  const scoreColor = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="space-y-4">
      <div className="bg-bg border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{platform[0]?.toUpperCase()}</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-text-main">Tu Marca</p>
              <p className="text-xs text-text-muted capitalize">{platform}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1 text-sm font-bold ${scoreColor}`}>
            <Star size={13} />
            {score}
          </div>
        </div>

        <h2 className="text-base font-bold text-text-main mb-1">{content.headline}</h2>
        {content.subheadline && <p className="text-sm text-text-muted mb-3">{content.subheadline}</p>}
        <p className="text-sm text-text-main leading-relaxed whitespace-pre-wrap mb-4">{content.body_copy}</p>

        <div className="bg-primary/10 border border-primary/30 rounded-xl px-4 py-2.5 text-center">
          <p className="text-sm font-semibold text-primary">{content.cta}</p>
        </div>

        {content.hashtags?.length > 0 && (
          <p className="mt-3 text-xs text-primary/70 leading-relaxed">
            {content.hashtags.map(h => `#${h.replace('#', '')}`).join(' ')}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {content.best_time && <Badge variant="muted">⏰ {content.best_time}</Badge>}
          {content.character_count > 0 && <Badge variant="muted">{content.character_count} chars</Badge>}
        </div>
        <button
          onClick={copyCaption}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs font-medium text-text-muted hover:text-text-main hover:border-primary/40 transition-all"
        >
          {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
          {copied ? 'Copiado' : 'Copiar caption'}
        </button>
      </div>

      {content.director_feedback && (
        <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
          <p className="text-xs font-semibold text-yellow-400 mb-1.5">🎬 Director Creativo dice:</p>
          <p className="text-xs text-text-muted leading-relaxed">{content.director_feedback}</p>
        </div>
      )}

      {content.platform_tips && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <p className="text-xs font-semibold text-primary mb-1.5">💡 Tip para {platform}:</p>
          <p className="text-xs text-text-muted leading-relaxed">{content.platform_tips}</p>
        </div>
      )}
    </div>
  )
}
