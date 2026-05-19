import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  selected?: boolean
}

export function Card({ children, className = '', hover, onClick, selected }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.01, borderColor: 'rgba(108,71,255,0.5)' } : undefined}
      onClick={onClick}
      className={`
        bg-surface border rounded-2xl p-5 transition-all duration-200
        ${selected ? 'border-primary shadow-lg shadow-primary/20' : 'border-border'}
        ${hover || onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}
