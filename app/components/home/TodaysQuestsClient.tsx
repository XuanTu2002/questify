'use client'

import { useEffect, useOptimistic, useRef, useState, useTransition } from 'react'
import { completeTask, deleteTask } from '@/app/actions/tasks'
import type { TaskWithCategory } from '@/lib/types'
import { CATEGORY_COLOR_MAP, CATEGORY_BG_MAP } from '@/lib/constants'
import { useModals } from '@/components/modals/ModalsProvider'

/* ── Per-row component with its own menu state ───────────────────────────── */

interface HomeTaskRowProps {
  task: TaskWithCategory
  isLast: boolean
  onComplete: () => void
  onRemove: () => void
}

function HomeTaskRow({ task, isLast, onComplete, onRemove }: HomeTaskRowProps) {
  const { openForgeQuest } = useModals()
  const [, startDeleteTransition] = useTransition()
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const color = CATEGORY_COLOR_MAP[task.category?.color_token ?? 'outline'] ?? '#99907c'
  const bg   = CATEGORY_BG_MAP[task.category?.color_token ?? 'outline'] ?? 'rgba(153,144,124,0.1)'

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
        setConfirmingDelete(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [menuOpen])

  function handleDeleteConfirm() {
    setMenuOpen(false)
    setConfirmingDelete(false)
    onRemove() // optimistic — removes from list immediately
    startDeleteTransition(async () => {
      await deleteTask(task.id)
    })
  }

  return (
    <div
      className={`p-4 flex items-center gap-3 hover:bg-surface-variant/30 transition-colors group ${
        !isLast ? 'border-b border-outline-variant/20' : ''
      }`}
    >
      {/* Checkbox — fires on pointer-down for instant feedback */}
      <button
        id={`task-check-${task.id}`}
        aria-label={`Complete task: ${task.title}`}
        className="w-6 h-6 rounded border border-outline-variant flex items-center justify-center shrink-0 group-hover:border-primary transition-[border-color,background-color,transform] duration-75 active:scale-75 active:bg-primary/20"
        onPointerDown={onComplete}
      />

      {/* Task title */}
      <span
        className="flex-1 font-body-md text-body-md text-on-surface cursor-pointer select-none"
        onPointerDown={onComplete}
      >
        {task.title}
      </span>

      {/* GP pill */}
      <div
        className="px-2 py-1 rounded font-label-mono text-label-mono flex items-center gap-1 border shrink-0"
        style={{ color, backgroundColor: bg, borderColor: `${color}33` }}
      >
        <span>+{task.gp_value}</span>
        <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>star</span>
      </div>

      {/* Kebab menu */}
      <div className="relative shrink-0" ref={menuRef}>
        <button
          aria-label="Task options"
          onClick={(e) => {
            e.stopPropagation()
            setMenuOpen((v) => !v)
            setConfirmingDelete(false)
          }}
          className="p-1 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 transition-[background-color,color] duration-100 active:scale-90"
        >
          <span className="material-symbols-outlined text-base leading-none">more_vert</span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-8 z-50 w-44 bg-surface-container-high border border-outline-variant/40 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] overflow-hidden">
            {!confirmingDelete ? (
              <>
                <button
                  onClick={() => { setMenuOpen(false); openForgeQuest(task) }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-on-surface hover:bg-surface-variant/50 transition-colors duration-75 font-body-md"
                >
                  <span className="material-symbols-outlined text-base">edit</span>
                  Edit
                </button>
                <div className="border-t border-outline-variant/20" />
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-error hover:bg-error/10 transition-colors duration-75 font-body-md"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                  Delete
                </button>
              </>
            ) : (
              <div className="p-3 flex flex-col gap-2">
                <p className="font-label-mono text-[11px] text-on-surface-variant uppercase tracking-wider text-center">
                  Delete this quest?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold text-on-surface-variant bg-surface-container hover:bg-surface-variant/50 transition-colors duration-75"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold text-on-error bg-error hover:bg-error/80 active:scale-95 transition-[transform,background-color] duration-75"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Parent list component ───────────────────────────────────────────────── */

interface TodaysQuestsClientProps {
  tasks: TaskWithCategory[]
}

export default function TodaysQuestsClient({ tasks }: TodaysQuestsClientProps) {
  const { showToast, openLevelUp } = useModals()
  const [optimisticTasks, removeTask] = useOptimistic(
    tasks,
    (state, removedId: string) => state.filter((t) => t.id !== removedId)
  )
  const [, startTransition] = useTransition()

  function handleComplete(taskId: string) {
    startTransition(async () => {
      removeTask(taskId)
      const res = await completeTask(taskId)
      if (res.success && res.data) {
        showToast(`+${res.data.gpAwarded} GP earned, +${res.data.xpAwarded} XP gained`)
        if (res.data.leveledUp) openLevelUp(res.data.newLevel)
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
    <div className="flex flex-col overflow-visible">
      {optimisticTasks.map((task, idx) => (
        <HomeTaskRow
          key={task.id}
          task={task}
          isLast={idx === optimisticTasks.length - 1}
          onComplete={() => handleComplete(task.id)}
          onRemove={() => { startTransition(() => { removeTask(task.id) }) }}
        />
      ))}
    </div>
  )
}
