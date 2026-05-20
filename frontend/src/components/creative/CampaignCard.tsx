import { motion } from 'framer-motion'
import { TrendingUp, Zap, AlertTriangle, ChevronRight } from 'lucide-react'
import type { Campaign } from '../../types'
import { Badge } from '../ui/Badge'

interface CampaignCardProps {
  campaign: Campaign
  index: number
  selected: boolean
  onSelect: (c: Campaign) => void
}

const archetypeEmoji: Record<string, string> = {
  PROBLEMA: '😤', MIEDO: '😰', CURIOSIDAD: '🤔', COMPARACIÓN: '⚖️',
  SOCIAL_PROOF: '⭐', ERROR: '❌', URGENCIA: '⏰', HISTORIA: '📖',
}

const angleColors: Record<string, string> = {
  miedo: 'danger', aspiración: 'primary', curiosidad: 'warning',
  social_proof: 'success', humor: 'warning', urgencia: 'danger',
  identidad: 'primary', dolor: 'danger',
}

export function CampaignCard({ campaign, index, selected, onSelect }: CampaignCardProps) {
  const archEmoji = archetypeEmoji[campaign.archetype ?? ''] ?? '💡'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onSelect(campaign)}
      className={`
        p-5 rounded-2xl border cursor-pointer transition-all duration-200 group
        ${selected
          ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
          : 'border-border bg-surface hover:border-primary/40 hover:bg-white/3'}
      `}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg flex-shrink-0">{archEmoji}</span>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm text-text-main truncate">{campaign.title}</h3>
            {campaign.archetype && (
              <p className="text-[10px] text-text-muted capitalize">{campaign.archetype.toLowerCase().replace('_', ' ')}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Badge variant={(angleColors[campaign.angle] as 'primary' | 'success' | 'warning' | 'danger' | 'muted') ?? 'muted'}>
            {campaign.angle}
          </Badge>
          <ChevronRight size={14} className={`text-text-muted transition-transform ${selected ? 'rotate-90 text-primary' : 'group-hover:translate-x-0.5'}`} />
        </div>
      </div>

      <p className="text-sm text-text-muted mb-3 leading-relaxed">{campaign.concept}</p>

      {/* Hook */}
      <div className="bg-bg/60 border border-border rounded-xl p-3 mb-3">
        <p className="text-xs text-text-muted mb-1 font-medium">🎯 Hook</p>
        <p className="text-sm text-text-main font-medium italic">"{campaign.hook}"</p>
      </div>

      {/* Visual concept — only when available */}
      {campaign.visual_concept?.scene && (
        <div className="bg-primary/5 border border-primary/15 rounded-xl p-3 mb-3">
          <p className="text-xs text-primary mb-1 font-medium">🎨 Concepto visual</p>
          <p className="text-xs text-text-muted leading-relaxed line-clamp-2">{campaign.visual_concept.scene}</p>
          {campaign.visual_concept.text_on_image && (
            <p className="text-xs text-text-main font-medium mt-1.5">"{campaign.visual_concept.text_on_image}"</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-start gap-1.5">
          <TrendingUp size={12} className="text-green-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-text-muted line-clamp-2">{campaign.why_it_works}</p>
        </div>
        <div className="flex items-start gap-1.5">
          <Zap size={12} className="text-yellow-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-text-muted line-clamp-2">{campaign.viral_potential}</p>
        </div>
      </div>

      {campaign.weakness && (
        <div className="mt-3 flex items-start gap-1.5 p-2.5 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
          <AlertTriangle size={11} className="text-yellow-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-yellow-400/80">{campaign.weakness}</p>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <Badge variant="muted">{campaign.best_format}</Badge>
        <Badge variant="muted">{campaign.emotion}</Badge>
      </div>
    </motion.div>
  )
}
