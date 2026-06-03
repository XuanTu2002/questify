import type { QuestWithSteps } from '@/lib/types'

interface ActiveQuestCardProps {
  quest: QuestWithSteps | null
}

/**
 * Mini card showing the currently active epic quest with a purple progress bar.
 * Returns null when no active quest exists.
 */
export default function ActiveQuestCard({ quest }: ActiveQuestCardProps) {
  if (!quest) return null

  const pct =
    quest.totalSteps > 0
      ? Math.round((quest.completedSteps / quest.totalSteps) * 100)
      : 0

  return (
    <section className="glass-panel rounded-xl p-4 border border-tertiary-container/30 relative overflow-hidden">
      {/* ACTIVE chip — top-right corner */}
      <div className="absolute top-0 right-0 bg-tertiary/20 text-tertiary font-label-mono text-[10px] px-2 py-1 rounded-bl-lg uppercase tracking-wider border-b border-l border-tertiary-container/30">
        Active
      </div>

      {/* Icon + title row */}
      <div className="flex items-start gap-4 mb-4 mt-2">
        <div className="p-3 bg-surface-container-high rounded-lg border border-outline-variant shrink-0">
          <span className="material-symbols-outlined text-tertiary text-2xl">
            {quest.icon ?? 'menu_book'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-body-md text-body-md font-bold text-on-surface truncate">
            {quest.title}
          </h3>
          <p className="font-label-mono text-label-mono text-on-surface-variant mt-1">
            Epic Quest Series
          </p>
        </div>
      </div>

      {/* Progress text */}
      <div className="flex justify-between items-end mb-2">
        <span className="font-label-mono text-label-mono text-tertiary">
          {quest.completedSteps}/{quest.totalSteps} Completed
        </span>
        <span className="font-label-mono text-label-mono text-on-surface-variant">
          {pct}%
        </span>
      </div>

      {/* Purple progress bar */}
      <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-tertiary-container to-tertiary shimmer rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </section>
  )
}
