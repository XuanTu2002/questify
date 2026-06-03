'use client'

import { useTransition } from 'react'
import { completeTask } from '@/app/actions/tasks'
import type { TaskWithCategory } from '@/lib/types'
import { CATEGORY_COLOR_MAP, CATEGORY_BG_MAP } from '@/lib/constants'
import { useModals } from '@/components/modals/ModalsProvider'

interface TaskRowProps {
  task: TaskWithCategory
  onCompleteOpt?: (taskId: string) => void
}

/**
 * Single task row for the Tasks tab.
 * Displays checkbox, title, and GP/XP pill.
 * Calls completeTask on check and triggers optimistic UI if onCompleteOpt provided.
 */
export default function TaskRow({ task, onCompleteOpt }: TaskRowProps) {
  const { showToast, openLevelUp } = useModals()
  const [isPending, startTransition] = useTransition()

  const color = CATEGORY_COLOR_MAP[task.category?.color_token ?? 'outline'] ?? '#99907c'
  const bg = CATEGORY_BG_MAP[task.category?.color_token ?? 'outline'] ?? 'rgba(153,144,124,0.1)'

  function handleComplete() {
    if (isPending) return

    startTransition(async () => {
      // Optimistic visual update in parent
      if (onCompleteOpt) onCompleteOpt(task.id)

      const res = await completeTask(task.id)

      if (res.success && res.data) {
        showToast(`+${res.data.gpAwarded} GP earned, +${res.data.xpAwarded} XP gained`)
        if (res.data.leveledUp) {
          openLevelUp(res.data.newLevel)
        }
      } else if (!res.success) {
        showToast(res.error ?? 'Failed to complete task')
      }
    })
  }

  return (
    <div
      className={`p-4 flex flex-col gap-2 hover:bg-surface-variant/30 transition-all cursor-pointer group border border-transparent border-b-outline-variant/20 hover:border-outline-variant/30 ${
        isPending ? 'opacity-50 pointer-events-none' : ''
      }`}
      onClick={handleComplete}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          id={`quests-task-check-${task.id}`}
          aria-label={`Complete task: ${task.title}`}
          className="w-5 h-5 mt-0.5 rounded border-2 border-outline-variant flex items-center justify-center shrink-0 group-hover:border-primary transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            handleComplete()
          }}
        />

        {/* Task Details */}
        <div className="flex-1 flex flex-col">
          <span className="font-body-md text-body-md text-on-surface line-clamp-2">
            {task.title}
          </span>
          {task.deadline && (
            <span className="text-xs text-error/80 mt-1 font-label-mono">
              Due: {new Date(task.deadline).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* GP/XP Pills */}
        <div className="flex flex-col gap-1 items-end shrink-0">
          <div
            className="px-2 py-0.5 rounded font-label-mono text-[10px] uppercase tracking-wider flex items-center gap-1 border"
            style={{ color, backgroundColor: bg, borderColor: `${color}33` }}
          >
            <span>+{task.gp_value}</span>
            <span className="material-symbols-outlined text-[10px]">star</span>
          </div>
          {task.xp_value !== task.gp_value && (
            <div
              className="px-2 py-0.5 rounded font-label-mono text-[10px] uppercase tracking-wider flex items-center gap-1 border"
              style={{ color: '#ddb7ff', backgroundColor: 'rgba(221,183,255,0.1)', borderColor: 'rgba(221,183,255,0.3)' }}
            >
              <span>+{task.xp_value}</span>
              <span className="material-symbols-outlined text-[10px]">sparkles</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
