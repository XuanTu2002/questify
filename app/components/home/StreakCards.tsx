import type { UserStats } from '@/lib/types'

interface StreakCardsProps {
  stats: UserStats
}

/**
 * Two-column row showing current streak (teal) and freeze tokens (gold).
 * Renders as a plain server component — no interactivity needed here.
 */
export default function StreakCards({ stats }: StreakCardsProps) {
  return (
    <section className="grid grid-cols-2 gap-gutter">
      {/* Current streak card */}
      <div className="glass-panel rounded-xl p-4 flex flex-col items-center gap-2 hover:shadow-[0_0_15px_rgba(68,226,205,0.25)] transition-shadow border border-secondary/20">
        <span className="material-symbols-outlined text-secondary text-3xl">
          local_fire_department
        </span>
        <div className="text-center">
          <div className="font-headline-lg-mobile text-headline-lg-mobile text-secondary font-bold leading-none">
            {stats.current_streak}
          </div>
          <div className="font-label-mono text-label-mono text-on-surface-variant uppercase mt-1 tracking-wider">
            Day Streak
          </div>
        </div>
      </div>

      {/* Freeze token card */}
      <div className="glass-panel rounded-xl p-4 flex flex-col items-center gap-2 hover:shadow-[0_0_15px_rgba(242,202,80,0.25)] transition-shadow border border-primary/20">
        <span className="material-symbols-outlined text-primary text-3xl">
          ac_unit
        </span>
        <div className="text-center">
          <div className="font-headline-lg-mobile text-headline-lg-mobile text-primary font-bold leading-none">
            {stats.freeze_tokens}
          </div>
          <div className="font-label-mono text-label-mono text-on-surface-variant uppercase mt-1 tracking-wider">
            Tokens
          </div>
        </div>
      </div>
    </section>
  )
}
