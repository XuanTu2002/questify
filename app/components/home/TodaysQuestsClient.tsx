'use client'

import { useOptimistic, useTransition } from 'react'
import { completeTask } from '@/app/actions/tasks'
import type { TaskWithCategory } from '@/lib/types'
import { CATEGORY_COLOR_MAP, CATEGORY_BG_MAP } from '@/lib/constants'
import { useModals } from '@/components/modals/ModalsProvider'

interface TodaysQuestsClientProps {
  tasks: TaskWithCategory[]
}

/**
 * Client component handling optimistic task completion.
 * Renders the interactive task row list inside TodaysQuests.
 */
export default function TodaysQuestsClient({ tasks }: TodaysQuestsClientProps) {
  const { showToast, openLevelUp } = useModals()
  const [optimisticTasks, removeTask] = useOptimistic(
    tasks,
    (state, completedId: string) => state.filter((t) => t.id !== completedId)
  )
  const [, startTransition] = useTransition()

  function handleComplete(taskId: string) {
    startTransition(async () => {
      removeTask(taskId)
      const res = await completeTask(taskId)
      
      if (res.success && res.data) {
        showToast(`+${res.data.gpAwarded} GP earned, +${res.data.xpAwarded} XP gained`)
        if (res.data.leveledUp) {
          openLevelUp(res.data.newLevel)
        }
      }
    })
  }

  if (optimisticTasks.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center gap-2 text-center">
        <span
          className="material-symbols-outlined text-secondary text-4xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          check_circle
        </span>
        <p className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">
          All quests cleared today!
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {optimisticTasks.map((task, idx) => {
        const color = CATEGORY_COLOR_MAP[task.category?.color_token ?? 'outline'] ?? '#99907c'
        const bg = CATEGORY_BG_MAP[task.category?.color_token ?? 'outline'] ?? 'rgba(153,144,124,0.1)'
        const isLast = idx === optimisticTasks.length - 1

        return (
          <div
            key={task.id}
            className={`p-4 flex items-center gap-3 hover:bg-surface-variant/30 transition-colors cursor-pointer group ${
              !isLast ? 'border-b border-outline-variant/20' : ''
            }`}
            onClick={() => handleComplete(task.id)}
          >
            {/* Checkbox */}
            <button
              id={`task-check-${task.id}`}
              aria-label={`Complete task: ${task.title}`}
              className="w-6 h-6 rounded border border-outline-variant flex items-center justify-center shrink-0 group-hover:border-primary transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                handleComplete(task.id)
              }}
            />

            {/* Task title */}
            <span className="flex-1 font-body-md text-body-md text-on-surface">
              {task.title}
            </span>

            {/* GP pill */}
            <div
              className="px-2 py-1 rounded font-label-mono text-label-mono flex items-center gap-1 border shrink-0"
              style={{
                color,
                backgroundColor: bg,
                borderColor: `${color}33`,
              }}
            >
              <span>+{task.gp_value}</span>
              <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>
                star
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
