interface HexBadgeProps {
  level: number
  size?: 'sm' | 'md' | 'lg'
}

/** Hexagonal level badge — clip-path hex shape with gold glow border */
export default function HexBadge({ level, size = 'md' }: HexBadgeProps) {
  const dimensions = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  }

  const textSize = {
    sm: 'text-xs',
    md: 'text-headline-lg-mobile font-bold',
    lg: 'text-2xl font-bold',
  }

  return (
    <div
      className={`hex-badge bg-primary/20 border-2 border-primary ${dimensions[size]} flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(242,202,80,0.5)]`}
    >
      <div className="flex flex-col items-center leading-none">
        <span className="font-label-mono text-label-mono text-primary/80 uppercase tracking-widest">
          LV
        </span>
        <span className={`font-label-mono text-primary ${textSize[size]}`}>
          {level}
        </span>
      </div>
    </div>
  )
}
