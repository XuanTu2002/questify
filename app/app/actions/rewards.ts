'use server'

import { revalidatePath } from 'next/cache'
import { supabase, USER_ID } from '@/lib/supabase'
import type { ActionResult, Reward } from '@/lib/types'

/**
 * Purchases a shop item — deducts GP, inserts purchase record.
 * Handles both repeatable and one-time items.
 * For system freeze token: enforces max 3 cap.
 */
export async function purchaseItem(rewardId: string): Promise<ActionResult> {
  // 1. Fetch reward details
  const { data: reward, error: rewardErr } = await supabase
    .from('rewards')
    .select('*')
    .eq('id', rewardId)
    .single<Reward>()

  if (rewardErr || !reward) {
    return { success: false, error: 'Item not found.' }
  }

  // 2. Fetch user stats
  const { data: stats, error: statsErr } = await supabase
    .from('user_stats')
    .select('gp_balance, current_level, freeze_tokens')
    .eq('user_id', USER_ID)
    .single()

  if (statsErr || !stats) {
    return { success: false, error: 'Failed to fetch user stats.' }
  }

  // 3. Level check
  if (stats.current_level < reward.required_level) {
    return { success: false, error: `Requires Level ${reward.required_level}.` }
  }

  // 4. Balance check
  if (stats.gp_balance < reward.gp_cost) {
    return { success: false, error: 'Insufficient GP.' }
  }

  // 5. One-time purchase check (skip for repeatable items)
  if (!reward.is_repeatable) {
    const { data: existingClaim } = await supabase
      .from('reward_claims')
      .select('id')
      .eq('user_id', USER_ID)
      .eq('reward_id', rewardId)
      .single()

    if (existingClaim) {
      return { success: false, error: 'Already purchased (one-time item).' }
    }
  }

  // 6. System Freeze Token: enforce max 3
  if (reward.is_system && reward.icon === 'ac_unit') {
    if (stats.freeze_tokens >= 3) {
      return { success: false, error: 'Maximum freeze tokens (3) reached.' }
    }
  }

  // 7. Insert purchase record
  const { error: claimErr } = await supabase
    .from('reward_claims')
    .insert({
      user_id: USER_ID,
      reward_id: rewardId,
      gp_spent: reward.gp_cost,
    })

  if (claimErr) {
    return { success: false, error: 'Failed to process purchase.' }
  }

  // 8. Deduct GP (and increment freeze_tokens if system freeze token)
  const updatePayload: Record<string, number> = {
    gp_balance: stats.gp_balance - reward.gp_cost
  }

  if (reward.is_system && reward.icon === 'ac_unit') {
    updatePayload.freeze_tokens = stats.freeze_tokens + 1
  }

  const { error: updateErr } = await supabase
    .from('user_stats')
    .update(updatePayload)
    .eq('user_id', USER_ID)

  if (updateErr) {
    return { success: false, error: 'Failed to deduct GP.' }
  }

  revalidatePath('/rewards')
  revalidatePath('/')

  return { success: true }
}
