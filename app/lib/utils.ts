/* ─── Shared utility helpers ──────────────────────────────────────────────── */

/**
 * Returns today's date string in YYYY-MM-DD format adjusted to Vietnam time (UTC+7).
 * Using UTC+7 ensures that midnight VN-time is treated as a new day, not as
 * 17:00 of the previous UTC day.
 *
 * @param offsetMs - Optional additional millisecond offset (for relative date math).
 */
export function todayVN(offsetMs = 0): string {
  const VN_OFFSET_MS = 7 * 60 * 60 * 1000
  return new Date(Date.now() + VN_OFFSET_MS + offsetMs).toISOString().slice(0, 10)
}

/**
 * Converts any Date object to a YYYY-MM-DD string in Vietnam time (UTC+7).
 */
export function toVNDateStr(date: Date): string {
  const VN_OFFSET_MS = 7 * 60 * 60 * 1000
  return new Date(date.getTime() + VN_OFFSET_MS).toISOString().slice(0, 10)
}
