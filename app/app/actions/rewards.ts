'use server'

import { revalidatePath } from 'next/cache'
import { supabase, USER_ID } from '@/lib/supabase'
import type { ActionResult, Reward } from '@/lib/types'

/** Claims a reward — deducts GP, inserts claim record */
export async function claimReward(rewardId: string): Promise<ActionResult> {
  // 1. Fetch reward details
  const { data: reward, error: rewardErr } = await supabase
    .from('rewards')
    .select('*')
    .eq('id', rewardId)
    .single<Reward>()

  if (rewardErr || !reward) {
    return { success: false, error: 'Reward not found.' }
  }

  // 2. Fetch user stats to check GP balance and level
  const { data: stats, error: statsErr } = await supabase
    .from('user_stats')
    .select('gp_balance, current_level')
    .eq('user_id', USER_ID)
    .single()

  if (statsErr || !stats) {
    return { success: false, error: 'Failed to fetch user stats.' }
  }

  if (stats.current_level < reward.required_level) {
    return { success: false, error: 'Level requirement not met.' }
  }

  if (stats.gp_balance < reward.gp_cost) {
    return { success: false, error: 'Insufficient GP.' }
  }

  // 3. Verify not already claimed
  const { data: existingClaim } = await supabase
    .from('reward_claims')
    .select('id')
    .eq('user_id', USER_ID)
    .eq('reward_id', rewardId)
    .single()

  if (existingClaim) {
    return { success: false, error: 'Reward already claimed.' }
  }

  // 4. Insert claim and deduct GP
  // Since we don't have Supabase RPC setup here, we'll do two sequential queries.
  // (In production with concurrent users, use an RPC for atomic deduction).
  const { error: claimErr } = await supabase
    .from('reward_claims')
    .insert({
      user_id: USER_ID,
      reward_id: rewardId,
      gp_spent: reward.gp_cost,
    })

  if (claimErr) {
    return { success: false, error: 'Failed to process claim.' }
  }

  const { error: updateErr } = await supabase
    .from('user_stats')
    .update({ gp_balance: stats.gp_balance - reward.gp_cost })
    .eq('user_id', USER_ID)

  if (updateErr) {
    return { success: false, error: 'Failed to deduct GP.' }
  }

  // 5. Invalidate paths
  revalidatePath('/rewards')
  revalidatePath('/')

  return { success: true }
}
