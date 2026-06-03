/* ─── Reward claim eligibility helpers ───────────────────────────────────── */

import type { Reward, RewardClaim, UserStats } from '@/lib/types'

/**
 * Determines whether a reward can be claimed.
 * Conditions: sufficient GP balance, sufficient level, and not already claimed.
 */
export const isRewardClaimable = (
  reward: Reward,
  stats: UserStats,
  claims: RewardClaim[]
): boolean => {
  const alreadyClaimed = claims.some((c) => c.reward_id === reward.id)
  if (alreadyClaimed) return false
  if (stats.gp_balance < reward.gp_cost) return false
  if (stats.current_level < reward.required_level) return false
  return true
}

/**
 * Determines the display state for a reward card.
 * Returns 'claimed' | 'claimable' | 'locked'.
 */
export const rewardDisplayState = (
  reward: Reward,
  stats: UserStats,
  claims: RewardClaim[]
): 'claimed' | 'claimable' | 'locked' => {
  if (claims.some((c) => c.reward_id === reward.id)) return 'claimed'
  if (isRewardClaimable(reward, stats, claims)) return 'claimable'
  return 'locked'
}
