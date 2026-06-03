import type { TaskWithCategory } from '@/lib/types'
import TodaysQuestsClient from './TodaysQuestsClient'

interface TodaysQuestsProps {
  tasks: TaskWithCategory[]
}

/** Glass panel wrapping the interactive today's quest list */
export default function TodaysQuests({ tasks }: TodaysQuestsProps) {
  return (
    <section className="glass-panel rounded-xl overflow-hidden">
      {/* Panel header */}
      <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-high/50">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
          Today&apos;s Quests
        </h2>
        <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>
          bolt
        </span>
      </div>

      {/* Interactive task list rendered on client for optimistic updates */}
      <TodaysQuestsClient tasks={tasks} />
    </section>
  )
}
