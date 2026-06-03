/* ─── Streak bonus multipliers and milestone rewards ─────────────────────── */

/**
 * GP bonus multiplier applied per completed task based on current streak.
 * XP is never multiplied — XP is always awarded at face value.
 */
export const streakBonus = (streak: number): number => {
  if (streak >= 100) return 1.50
  if (streak >= 60)  return 1.35
  if (streak >= 30)  return 1.25
  if (streak >= 14)  return 1.15
  if (streak >= 7)   return 1.10
  if (streak >= 3)   return 1.05
  return 1.00
}

/**
 * Extra freeze tokens granted once when a streak milestone is hit.
 * Returns 0 if this streak value has no bonus.
 */
export const freezeTokensAtMilestone = (streak: number): number => {
  if (streak === 30) return 2
  if (streak === 14) return 1
  return 0
}

/**
 * One-time bonus GP awarded at specific streak milestones.
 * Returns 0 if this streak value has no bonus.
 */
export const streakMilestoneBonus = (streak: number): number => {
  if (streak === 30) return 150
  return 0
}

/**
 * Human-readable multiplier label — e.g. "1.15x" or empty string for 1.00.
 * Used in task-completion toasts to surface the streak bonus to the user.
 */
export const streakBonusLabel = (streak: number): string => {
  const mult = streakBonus(streak)
  return mult > 1 ? `${mult.toFixed(2)}x streak bonus` : ''
}
