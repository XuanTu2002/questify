import { ReactNode } from 'react'

interface GlassPanelProps {
  children: ReactNode
  className?: string
  id?: string
}

/** Reusable wrapper applying the .glass-panel translucent surface style */
export default function GlassPanel({ children, className = '', id }: GlassPanelProps) {
  return (
    <div id={id} className={`glass-panel rounded-xl ${className}`}>
      {children}
    </div>
  )
}
