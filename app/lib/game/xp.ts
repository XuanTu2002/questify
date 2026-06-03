/* ─── XP curve and level math — from CLAUDE.md § 8 ──────────────────────── */

/**
 * Cumulative XP needed to REACH level N.
 * Lv1: 0  |  Lv2: 50  |  Lv3: 200  |  Lv5: 800  |  Lv10: 4050
 */
export const xpForLevel = (n: number): number => 50 * (n - 1) * (n - 1)

/**
 * Returns the current level from a total XP value.
 */
export const levelFromTotalXP = (totalXP: number): number =>
  Math.floor(Math.sqrt(Math.max(0, totalXP) / 50)) + 1

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
