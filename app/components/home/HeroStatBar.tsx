import HexBadge from '@/components/shared/HexBadge'
import XPBar from '@/components/shared/XPBar'
import type { UserStats } from '@/lib/types'
import { xpProgressInLevel } from '@/lib/game/xp'

interface HeroStatBarProps {
  stats: UserStats
}

/** Top bar showing level hex, XP progress, and GP balance with corner accents */
export default function HeroStatBar({ stats }: HeroStatBarProps) {
  const { current, needed, level } = xpProgressInLevel(stats.total_xp)

  return (
    <section className="glass-panel rounded-xl p-4 flex items-center gap-4 relative overflow-hidden">
      {/* L-shaped corner accents — decorative, Hero Stat Bar only */}
      <div className="corner-accent-tl" />
      <div className="corner-accent-tr" />
      <div className="corner-accent-bl" />
      <div className="corner-accent-br" />

      {/* Hex level badge */}
      <HexBadge level={level} size="md" />

      {/* XP track */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex justify-between items-end">
          <span className="font-body-md text-body-md text-on-surface-variant">XP</span>
          <span className="font-label-mono text-label-mono text-primary">
            {current.toLocaleString()} / {needed.toLocaleString()}
          </span>
        </div>
        <XPBar current={current} needed={needed} />
      </div>

      {/* GP balance */}
      <div className="shrink-0 flex flex-col items-center justify-center pl-3 border-l border-outline-variant/30 gap-0.5">
        <span
          className="material-symbols-outlined text-secondary-container text-2xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          diamond
        </span>
        <span className="font-label-mono text-label-mono text-on-surface">
          {stats.gp_balance.toLocaleString()}
        </span>
      </div>
    </section>
  )
}
