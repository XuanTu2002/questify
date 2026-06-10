'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { completeTask, deleteTask } from '@/app/actions/tasks'
import type { TaskWithCategory } from '@/lib/types'
import { CATEGORY_COLOR_MAP, CATEGORY_BG_MAP } from '@/lib/constants'
import { useModals } from '@/components/modals/ModalsProvider'

interface TaskRowProps {
  task: TaskWithCategory
  onCompleteOpt?: (taskId: string) => void
  onDeleteOpt?: (taskId: string) => void
}

export default function TaskRow({ task, onCompleteOpt, onDeleteOpt }: TaskRowProps) {
  const { showToast, openLevelUp, openForgeQuest } = useModals()
  const [, startTransition] = useTransition()
  // Local done state → row visually completes instantly on click, before server responds
  const [isDone, setIsDone] = useState(false)
  // Kebab menu state
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const color = CATEGORY_COLOR_MAP[task.category?.color_token ?? 'outline'] ?? '#99907c'
  const bg = CATEGORY_BG_MAP[task.category?.color_token ?? 'outline'] ?? 'rgba(153,144,124,0.1)'

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
        setConfirmingDelete(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  function handleComplete() {
    if (isDone) return
    setIsDone(true)
    if (onCompleteOpt) onCompleteOpt(task.id)

    startTransition(async () => {
      const res = await completeTask(task.id)
      if (res.success && res.data) {
        showToast(`+${res.data.gpAwarded} GP earned, +${res.data.xpAwarded} XP gained`)
        if (res.data.leveledUp) openLevelUp(res.data.newLevel)
      } else if (!res.success) {
        setIsDone(false)
        showToast(res.error ?? 'Failed to complete task')
      }
    })
  }

  function handleEdit() {
    setMenuOpen(false)
    openForgeQuest(task)
  }

  function handleDeleteConfirm() {
    setMenuOpen(false)
    setConfirmingDelete(false)
    if (onDeleteOpt) onDeleteOpt(task.id)
    startTransition(async () => {
      const res = await deleteTask(task.id)
      if (!res.success) {
        showToast(res.error ?? 'Failed to delete task')
      }
    })
  }

  return (
    <div
      className={`p-4 flex flex-col gap-2 border border-transparent border-b-outline-variant/20 transition-[background-color,opacity] duration-150 ${
        isDone
          ? 'opacity-40 pointer-events-none'
          : 'hover:bg-surface-variant/30 hover:border-outline-variant/30'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox — clicking it completes the task */}
        <button
          id={`quests-task-check-${task.id}`}
          aria-label={`Complete task: ${task.title}`}
          className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center shrink-0 transition-[border-color,background-color] duration-100 active:scale-90 cursor-pointer ${
            isDone
              ? 'border-primary bg-primary/20'
              : 'border-outline-variant hover:border-primary'
          }`}
          onClick={handleComplete}
        >
          {isDone && (
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '12px', fontVariationSettings: "'FILL' 1" }}>
              check
            </span>
          )}
        </button>

        {/* Task Details — clicking title area completes the task */}
        <div className="flex-1 flex flex-col cursor-pointer" onClick={handleComplete}>
          <span className={`font-body-md text-body-md line-clamp-2 transition-colors duration-100 ${isDone ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
            {task.title}
          </span>
          {task.deadline && (
            <span className="text-xs text-error/80 mt-1 font-label-mono">
              Due: {new Date(task.deadline).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Right side: GP/XP pills + kebab menu */}
        <div className="flex items-start gap-2 shrink-0">
          {/* GP/XP Pills */}
          <div className="flex flex-col gap-1 items-end">
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

          {/* Kebab menu */}
          <div className="relative" ref={menuRef}>
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

            {/* Dropdown */}
            {menuOpen && (
              <div className="absolute right-0 top-8 z-50 w-44 bg-surface-container-high border border-outline-variant/40 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] overflow-hidden">
                {!confirmingDelete ? (
                  <>
                    <button
                      onClick={handleEdit}
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
      </div>
    </div>
  )
}
