'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { createTask, updateTask } from '@/app/actions/tasks'
import type { Category, Task } from '@/lib/types'
import { CATEGORY_COLOR_MAP } from '@/lib/constants'

/* ─── Helpers ────────────────────────────────────────────────────────────── */

/** Generates a random 6-char alphanumeric quest ID suffix */
function randomQuestId(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

/* ─── Props ──────────────────────────────────────────────────────────────── */

interface ForgeQuestModalProps {
  categories: Category[]
  onClose: () => void
  /** When provided, the modal opens in edit mode pre-filled with this task's data */
  initialTask?: Task
}

/**
 * Bottom-sheet modal for creating or editing a task (quest).
 * In create mode (no initialTask): calls createTask.
 * In edit mode (initialTask set): pre-fills all fields and calls updateTask.
 */
export default function ForgeQuestModal({ categories, onClose, initialTask }: ForgeQuestModalProps) {
  const [isPending, startTransition] = useTransition()
  const isEditMode = !!initialTask

  /* ── Form state — seeded from initialTask when editing ── */
  const [title, setTitle] = useState(initialTask?.title ?? '')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    initialTask?.category_id ?? categories[0]?.id ?? null
  )
  const [gpValue, setGpValue] = useState(initialTask?.gp_value ?? 50)
  const [xpValue, setXpValue] = useState(initialTask?.xp_value ?? 50)
  const [isBossFight, setIsBossFight] = useState(initialTask?.is_boss_fight ?? false)
  const [isRecurring, setIsRecurring] = useState(initialTask?.is_recurring ?? false)
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly'>(
    initialTask?.recurrence ?? 'daily'
  )
  const [deadline, setDeadline] = useState(
    initialTask?.deadline ? initialTask.deadline.slice(0, 10) : ''
  )
  /** Tracks which field was last manually edited so mirroring works correctly */
  const [gpManual, setGpManual] = useState(isEditMode)
  const [xpManual, setXpManual] = useState(isEditMode)
  const [error, setError] = useState<string | null>(null)
  const [questId] = useState(() => initialTask?.id.slice(-6).toUpperCase() ?? randomQuestId())
  const inputRef = useRef<HTMLInputElement>(null)

  /* ── Auto-focus title on open ── */
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  /* ── Close on Escape key ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  /* ── GP / XP mirroring: values stay equal until user edits one ── */
  const handleGpChange = useCallback((v: number) => {
    setGpValue(v)
    setGpManual(true)
    if (!xpManual) setXpValue(v)
  }, [xpManual])

  const handleXpChange = useCallback((v: number) => {
    setXpValue(v)
    setXpManual(true)
    if (!gpManual) setGpValue(v)
  }, [gpManual])

  /* ── Submit ── */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Quest title is required.')
      inputRef.current?.focus()
      return
    }

    const payload = {
      title: title.trim(),
      category_id: selectedCategoryId,
      gp_value: gpValue,
      xp_value: xpValue,
      is_boss_fight: isBossFight,
      is_recurring: isRecurring,
      recurrence: isRecurring ? recurrenceType : null,
      deadline: deadline || null,
    }

    startTransition(async () => {
      const result = isEditMode && initialTask
        ? await updateTask(initialTask.id, payload)
        : await createTask(payload)

      if (result.success) {
        onClose()
      } else {
        setError(result.error ?? (isEditMode ? 'Failed to update quest.' : 'Failed to create quest.'))
      }
    })
  }

  /* ─────────────────────────────────────────────────────────────────────── */

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-background/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="forge-quest-title"
    >
      {/* Modal panel */}
      <div
        className={[
          'w-full max-w-2xl bg-surface-container-high rounded-t-3xl sm:rounded-2xl',
          'border-t sm:border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]',
          'relative overflow-hidden transition-all duration-300',
          isBossFight ? 'boss-fight-pulse' : '',
        ].join(' ')}
        id="add-task-modal"
      >
        {/* Mobile drag handle */}
        <div className="w-12 h-1.5 bg-outline-variant rounded-full mx-auto mt-4 mb-2 sm:hidden" />

        <div className="p-6 sm:p-8">
          {/* ── Header ── */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2
                id="forge-quest-title"
                className="font-headline-lg-mobile sm:font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-on-background font-bold tracking-tight"
              >
                {isEditMode ? 'Edit Quest' : 'Forge New Quest'}
              </h2>
              <p className="font-label-mono text-label-mono text-on-surface-variant mt-1">
                ID: #QST-{questId}
              </p>
            </div>
            <button
              id="forge-quest-close"
              aria-label="Close modal"
              onClick={onClose}
              className="text-on-surface-variant hover:text-error transition-colors p-2 rounded-full hover:bg-surface-variant"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ── Title input ── */}
            <div>
              <input
                id="forge-quest-title-input"
                ref={inputRef}
                type="text"
                placeholder="What is your objective, hero?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isPending}
                className="w-full bg-surface-dim border-none rounded-xl p-4 text-xl text-on-background placeholder-on-surface-variant/50 focus:ring-2 focus:ring-primary focus:outline-none transition-shadow font-bold"
              />
            </div>

            {/* ── Category pills ── */}
            <div>
              <label className="block text-xs font-label-mono text-label-mono text-on-surface-variant mb-3 uppercase tracking-wider">
                Classification
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const color = CATEGORY_COLOR_MAP[cat.color_token] ?? '#99907c'
                  const isSelected = selectedCategoryId === cat.id
                  return (
                    <button
                      key={cat.id}
                      id={`category-pill-${cat.id}`}
                      type="button"
                      onClick={() =>
                        setSelectedCategoryId(isSelected ? null : cat.id)
                      }
                      className="px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-200"
                      style={{
                        border: `1px solid ${color}`,
                        color,
                        backgroundColor: isSelected ? `${color}20` : 'transparent',
                        boxShadow: isSelected
                          ? `0 0 10px ${color}33`
                          : 'none',
                      }}
                    >
                      {cat.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── GP + XP inputs side by side ── */}
            <div className="flex gap-4">
              {/* GP / Points Yield */}
              <div className="flex-1 bg-surface-dim rounded-lg p-3 border border-white/5 focus-within:border-primary/50 transition-colors relative">
                <label
                  htmlFor="forge-gp-input"
                  className="block text-[10px] font-label-mono text-label-mono text-on-surface-variant uppercase absolute top-2 left-3"
                >
                  Points Yield
                </label>
                <input
                  id="forge-gp-input"
                  type="number"
                  min={1}
                  max={9999}
                  value={gpValue}
                  onChange={(e) => handleGpChange(Math.max(1, Number(e.target.value)))}
                  disabled={isPending}
                  className="w-full bg-transparent border-none text-right text-lg text-primary font-bold mt-4 focus:ring-0 p-0 focus:outline-none"
                />
              </div>

              {/* XP Reward */}
              <div className="flex-1 bg-surface-dim rounded-lg p-3 border border-white/5 focus-within:border-tertiary/50 transition-colors relative">
                <label
                  htmlFor="forge-xp-input"
                  className="block text-[10px] font-label-mono text-label-mono text-on-surface-variant uppercase absolute top-2 left-3"
                >
                  XP Reward
                </label>
                <input
                  id="forge-xp-input"
                  type="number"
                  min={1}
                  max={9999}
                  value={xpValue}
                  onChange={(e) => handleXpChange(Math.max(1, Number(e.target.value)))}
                  disabled={isPending}
                  className="w-full bg-transparent border-none text-right text-lg text-tertiary-fixed-dim font-bold mt-4 focus:ring-0 p-0 focus:outline-none"
                />
              </div>
            </div>

            {/* ── Recurrence & Deadline ── */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 bg-surface-dim rounded-lg p-3 border border-white/5 transition-colors">
                <label className="block text-[10px] font-label-mono text-label-mono text-on-surface-variant uppercase mb-2">
                  Recurrence
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-body-md text-on-surface">
                    <input 
                      type="checkbox"
                      checked={isRecurring}
                      onChange={e => setIsRecurring(e.target.checked)}
                      disabled={isPending}
                      className="w-4 h-4 rounded bg-background border-outline-variant text-primary focus:ring-primary focus:ring-offset-surface-dim"
                    />
                    Recurring
                  </label>
                  {isRecurring && (
                    <select
                      value={recurrenceType}
                      onChange={e => setRecurrenceType(e.target.value as 'daily' | 'weekly')}
                      disabled={isPending}
                      className="bg-background border border-outline-variant/30 text-on-surface text-sm rounded px-2 py-1 focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="flex-1 bg-surface-dim rounded-lg p-3 border border-white/5 transition-colors relative">
                <label
                  htmlFor="forge-deadline-input"
                  className="block text-[10px] font-label-mono text-label-mono text-on-surface-variant uppercase mb-2"
                >
                  Deadline (Optional)
                </label>
                <input
                  id="forge-deadline-input"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  disabled={isPending}
                  className="w-full bg-background border border-outline-variant/30 rounded text-on-surface text-sm px-2 py-1 focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            </div>

            {/* ── Boss Fight toggle ── */}
            <div
              className={`rounded-lg p-4 flex items-center justify-between transition-colors duration-300 ${
                isBossFight
                  ? 'bg-error-container/30 border border-error/50'
                  : 'bg-error-container/10 border border-error/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${
                    isBossFight
                      ? 'bg-error/30 border-error text-error'
                      : 'bg-error/10 border-error/40 text-error/70'
                  }`}
                >
                  <span className="material-symbols-outlined">swords</span>
                </div>
                <div>
                  <h4 className="font-bold text-error">Mark as Boss Fight</h4>
                  <p className="text-xs text-on-surface-variant">
                    High stakes. Triple XP. Heavy penalty on failure.
                  </p>
                </div>
              </div>

              {/* Toggle */}
              <button
                id="forge-boss-fight-toggle"
                type="button"
                role="switch"
                aria-checked={isBossFight}
                onClick={() => setIsBossFight((v) => !v)}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 flex items-center shrink-0 ${
                  isBossFight ? 'bg-error' : 'bg-surface-container-highest'
                }`}
              >
                <span
                  className={`absolute w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    isBossFight ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* ── Error message ── */}
            {error && (
              <p className="font-label-mono text-label-mono text-error flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </p>
            )}

            {/* ── Footer: submit ── */}
            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                id="forge-quest-submit"
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto px-8 py-3 bg-primary text-on-primary font-bold text-lg rounded-xl hover:shadow-[0_0_20px_rgba(242,202,80,0.6)] active:scale-95 transition-all flex justify-center items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-xl">
                      progress_activity
                    </span>
                    Forging…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">
                      {isEditMode ? 'save' : 'add'}
                    </span>
                    {isEditMode ? 'SAVE CHANGES' : 'ADD QUEST'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
