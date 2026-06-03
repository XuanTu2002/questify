interface XPBarProps {
  current: number
  needed: number
}

/** Gold gradient XP progress bar with white shimmer travelling left-to-right */
export default function XPBar({ current, needed }: XPBarProps) {
  const pct = needed > 0 ? Math.min(100, Math.round((current / needed) * 100)) : 0

  return (
    <div className="w-full h-3 bg-surface-container-highest rounded-full shadow-inner overflow-hidden">
      <div
        className="h-full xp-shimmer rounded-full transition-all duration-700 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
