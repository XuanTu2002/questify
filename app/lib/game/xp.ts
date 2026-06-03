/* ─── XP curve and level math — from CLAUDE.md § 8 ──────────────────────── */

/**
 * Cumulative XP needed to REACH level N.
 * Lv1: 50  |  Lv2: 200  |  Lv5: 1250  |  Lv10: 5000  |  Lv20: 20000
 */
export const xpForLevel = (n: number): number => 50 * n * n

/**
 * Returns the current level from a total XP value.
 * The largest N such that 50*N² <= totalXP.
 */
export const levelFromTotalXP = (totalXP: number): number =>
  Math.max(1, Math.floor(Math.sqrt(totalXP / 50)))

/**
 * Returns progress within the current level:
 * - current: XP earned since the current level floor
 * - needed: total XP required to advance to next level
 * - level: the current level number
 */
export const xpProgressInLevel = (
  totalXP: number
): { current: number; needed: number; level: number } => {
  const level = levelFromTotalXP(totalXP)
  const floor = xpForLevel(level)
  const ceiling = xpForLevel(level + 1)
  return { current: totalXP - floor, needed: ceiling - floor, level }
}

/**
 * Returns a human-readable "X / Y XP" string for the current level progress.
 */
export const xpProgressLabel = (totalXP: number): string => {
  const { current, needed } = xpProgressInLevel(totalXP)
  return `${current.toLocaleString()} / ${needed.toLocaleString()}`
}
