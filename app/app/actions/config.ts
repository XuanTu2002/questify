'use server'

import { revalidatePath } from 'next/cache'
import { supabase, USER_ID } from '@/lib/supabase'
import type { ActionResult } from '@/lib/types'

/* ─── Config Settings (Toggles & Sliders) ────────────────────────────────── */

export async function updateConfig(
  updates: Partial<{
    penalize_missed_recurring: boolean
    min_daily_gp_for_streak: number
    default_gp_value: number
    default_gp_step: number
  }>
): Promise<ActionResult> {
  const { error } = await supabase
    .from('config')
    .update(updates)
    .eq('user_id', USER_ID)

  if (error) return { success: false, error: 'Failed to update configuration.' }
  
  revalidatePath('/config')
  return { success: true }
}

/* ─── Categories CRUD ────────────────────────────────────────────────────── */

export async function createCategory(data: { name: string; color_token: string }): Promise<ActionResult> {
  const { error } = await supabase
    .from('categories')
    .insert({
      user_id: USER_ID,
      name: data.name,
      color_token: data.color_token,
      icon: 'category'
    })

  if (error) return { success: false, error: 'Failed to create category.' }
  
  revalidatePath('/config')
  // Categories are fetched in layout.tsx, which invalidates globally when needed
  return { success: true }
}

export async function deleteCategory(categoryId: string): Promise<ActionResult> {
  // Option: check if tasks are using it first
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)
    .eq('user_id', USER_ID)

  if (error) return { success: false, error: 'Failed to delete category.' }
  
  revalidatePath('/config')
  return { success: true }
}

/* ─── Rewards (Milestones) CRUD ──────────────────────────────────────────── */

export async function createReward(data: {
  title: string
  description?: string
  gp_cost: number
  required_level?: number
  is_repeatable?: boolean
  tier?: 'low' | 'medium' | 'high'
}): Promise<ActionResult> {
  const { error } = await supabase
    .from('rewards')
    .insert({
      user_id: USER_ID,
      title: data.title,
      description: data.description || null,
      gp_cost: data.gp_cost,
      required_level: data.required_level || 1,
      icon: 'workspace_premium',
      is_repeatable: data.is_repeatable ?? true,
      tier: data.tier ?? 'medium',
      is_system: false,
    })

  if (error) return { success: false, error: 'Failed to create shop item.' }
  
  revalidatePath('/config')
  revalidatePath('/rewards')
  return { success: true }
}

export async function deleteReward(rewardId: string): Promise<ActionResult> {
  const { error } = await supabase
    .from('rewards')
    .delete()
    .eq('id', rewardId)
    .eq('user_id', USER_ID)

  if (error) return { success: false, error: 'Failed to delete milestone. (It might have claims tied to it).' }
  
  revalidatePath('/config')
  revalidatePath('/rewards')
  return { success: true }
}

export async function updateReward(
  rewardId: string,
  data: {
    title: string
    description?: string
    gp_cost: number
    required_level?: number
    is_repeatable?: boolean
    tier?: 'low' | 'medium' | 'high'
  }
): Promise<ActionResult> {
  // Block edits on system items
  const { data: reward } = await supabase
    .from('rewards')
    .select('is_system')
    .eq('id', rewardId)
    .single()

  if ((reward as any)?.is_system) {
    return { success: false, error: 'Cannot edit system items.' }
  }

  const { error } = await supabase
    .from('rewards')
    .update({
      title: data.title,
      description: data.description || null,
      gp_cost: data.gp_cost,
      required_level: data.required_level || 1,
      is_repeatable: data.is_repeatable ?? true,
      tier: data.tier ?? 'medium',
    })
    .eq('id', rewardId)
    .eq('user_id', USER_ID)

  if (error) return { success: false, error: 'Failed to update shop item.' }

  revalidatePath('/config')
  revalidatePath('/rewards')
  return { success: true }
}
