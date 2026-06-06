'use client'

import { useState, useTransition } from 'react'
import { completeTask } from '@/app/actions/tasks'
import type { TaskWithCategory } from '@/lib/types'
import { CATEGORY_COLOR_MAP, CATEGORY_BG_MAP } from '@/lib/constants'
import { useModals } from '@/components/modals/ModalsProvider'

interface TaskRowProps {
  task: TaskWithCategory
  onCompleteOpt?: (taskId: string) => void
}

export default function TaskRow({ task, onCompleteOpt }: TaskRowProps) {
  const { showToast, openLevelUp } = useModals()
  const [, startTransition] = useTransition()
  // Local done state → row visually completes instantly on click, before server responds
  const [isDone, setIsDone] = useState(false)

  const color = CATEGORY_COLOR_MAP[task.category?.color_token ?? 'outline'] ?? '#99907c'
  const bg = CATEGORY_BG_MAP[task.category?.color_token ?? 'outline'] ?? 'rgba(153,144,124,0.1)'

  function handleComplete() {
    if (isDone) return

    // Instant visual feedback — no server round-trip wait
    setIsDone(true)
    if (onCompleteOpt) onCompleteOpt(task.id)

    startTransition(async () => {
      const res = await completeTask(task.id)

      if (res.success && res.data) {
        showToast(`+${res.data.gpAwarded} GP earned, +${res.data.xpAwarded} XP gained`)
        if (res.data.leveledUp) {
          openLevelUp(res.data.newLevel)
        }
      } else if (!res.success) {
        setIsDone(false) // revert on server error
        showToast(res.error ?? 'Failed to complete task')
      }
    })
  }

  return (
    <div
      className={`p-4 flex flex-col gap-2 cursor-pointer group border border-transparent border-b-outline-variant/20 transition-[background-color,opacity] duration-150 ${
        isDone
          ? 'opacity-40 pointer-events-none'
          : 'hover:bg-surface-variant/30 hover:border-outline-variant/30'
      }`}
      onClick={handleComplete}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox — shows check instantly when isDone */}
        <button
          id={`quests-task-check-${task.id}`}
          aria-label={`Complete task: ${task.title}`}
          className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center shrink-0 transition-[border-color,background-color] duration-100 active:scale-90 ${
            isDone
              ? 'border-primary bg-primary/20'
              : 'border-outline-variant group-hover:border-primary'
          }`}
          onClick={(e) => {
            e.stopPropagation()
            handleComplete()
          }}
        >
          {isDone && (
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '12px', fontVariationSettings: "'FILL' 1" }}>
              check
            </span>
          )}
        </button>

        {/* Task Details */}
        <div className="flex-1 flex flex-col">
          <span className={`font-body-md text-body-md line-clamp-2 transition-colors duration-100 ${isDone ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
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
