/* ─── Penalty calculation helpers ────────────────────────────────────────── */

/**
 * GP deducted when a recurring task is missed.
 * XP is NEVER deducted — only GP.
 */
export const recurringMissPenalty = (
  gpValue: number,
  pct: number = 50
): number => Math.floor(gpValue * pct / 100)

/**
 * GP deducted when a deadline task is completed late.
 * - 1 day late → lateCfg% deduction
 * - 2+ days late → veryLateCfg% deduction
 * - On time → 0
 *
 * The result is clamped externally with Math.max(0, balance - penalty).
 */
export const deadlineLatePenalty = (
  gpValue: number,
  daysLate: number,
  lateCfg: number,
  veryLateCfg: number
): number => {
  if (daysLate >= 2) return Math.floor(gpValue * veryLateCfg / 100)
  if (daysLate >= 1) return Math.floor(gpValue * lateCfg / 100)
  return 0
}

/**
 * Computes the number of days a task is overdue relative to now.
 * Returns 0 if no deadline or not yet late.
 */
export const daysLate = (deadline: string | null): number => {
  if (!deadline) return 0
  const now = Date.now()
  const due = new Date(deadline).getTime()
  if (now <= due) return 0
  return Math.floor((now - due) / (1000 * 60 * 60 * 24))
}
