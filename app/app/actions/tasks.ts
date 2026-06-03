'use server'

import { revalidatePath } from 'next/cache'
import { supabase, USER_ID } from '@/lib/supabase'
import { levelFromTotalXP } from '@/lib/game/xp'
import { streakBonus, freezeTokensAtMilestone, streakMilestoneBonus } from '@/lib/game/streak'
import { applyDailyCheck } from './dailyCheck'
import type { ActionResult, Task, UserStats } from '@/lib/types'

/** Completes a task — awards GP/XP, updates streak, logs daily record */
export async function completeTask(
  taskId: string
): Promise<ActionResult<{ gpAwarded: number; xpAwarded: number; leveledUp: boolean; newLevel: number }>> {
  // 0. Run daily check to ensure state (penalties, gaps) is perfectly up to date
  await applyDailyCheck()

  // 1. Fetch task and verify ownership + active status
  const { data: task, error: taskErr } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .eq('user_id', USER_ID)
    .eq('status', 'active')
    .single<Task>()

  if (taskErr || !task) {
    return { success: false, error: 'Task not found or already completed.' }
  }

  // 2. Fetch current user stats
  const { data: stats, error: statsErr } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', USER_ID)
    .single<UserStats>()

  if (statsErr || !stats) {
    return { success: false, error: 'User stats not found.' }
  }

  // 3. Fetch config for streak threshold
  const { data: config } = await supabase
    .from('config')
    .select('min_daily_gp_for_streak')
    .eq('user_id', USER_ID)
    .single()
    
  const streakThreshold = config?.min_daily_gp_for_streak || 30

  // 4. Compute awards using streak bonus (streak multiplier only affects GP)
  const multiplier = streakBonus(stats.current_streak)
  let gpAwarded = Math.floor(task.gp_value * multiplier)
  let xpAwarded = task.xp_value

  // 4.5. Check if this task completes its parent quest
  let completedQuestId: string | null = null
  if (task.quest_id) {
    const { data: questSteps } = await supabase
      .from('tasks')
      .select('id, status')
      .eq('quest_id', task.quest_id)
      .eq('user_id', USER_ID)

    const allDone = questSteps?.every((s) => s.status === 'completed' || s.id === taskId)

    if (allDone) {
      const { data: quest } = await supabase
        .from('quests')
        .select('bonus_gp, bonus_xp')
        .eq('id', task.quest_id)
        .single()

      if (quest) {
        gpAwarded += quest.bonus_gp
        xpAwarded += quest.bonus_xp
        completedQuestId = task.quest_id
      }
    }
  }

  // 5. Compute new XP and derived level
  const newTotalXP = stats.total_xp + xpAwarded
  const newLevel = levelFromTotalXP(newTotalXP)
  const leveledUp = newLevel > stats.current_level

  // 6. Compute today date
  const today = new Date().toISOString().slice(0, 10)

  // 7. Check daily log and threshold
  const { data: existingLog } = await supabase
    .from('daily_logs')
    .select('gp_earned, xp_earned, tasks_completed, streak_kept')
    .eq('user_id', USER_ID)
    .eq('log_date', today)
    .single()

  const todayGP = (existingLog?.gp_earned || 0) + gpAwarded
  const thresholdReached = todayGP >= streakThreshold
  
  // Did we JUST reach the threshold with this task?
  const justMetThreshold = thresholdReached && (!existingLog || existingLog.streak_kept === false)

  let newStreak = stats.current_streak
  if (justMetThreshold) {
    newStreak += 1
  }

  let newLongest = Math.max(stats.longest_streak, newStreak)
  let newFreezeTokens = stats.freeze_tokens

  // 8. Check milestone bonuses at streak milestones
  const milestoneGP = streakMilestoneBonus(newStreak)
  const milestoneTokens = freezeTokensAtMilestone(newStreak)
  const totalGP = gpAwarded + (justMetThreshold ? milestoneGP : 0)
  if (justMetThreshold) {
    newFreezeTokens = Math.min(3, newFreezeTokens + milestoneTokens)
  }

  // 9. Update user_stats atomically
  const { error: updateErr } = await supabase
    .from('user_stats')
    .update({
      total_xp: newTotalXP,
      current_level: newLevel,
      gp_balance: stats.gp_balance + totalGP,
      gp_lifetime_earned: stats.gp_lifetime_earned + totalGP,
      current_streak: newStreak,
      longest_streak: newLongest,
      freeze_tokens: newFreezeTokens,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', USER_ID)

  if (updateErr) {
    return { success: false, error: 'Failed to update user stats.' }
  }

  // 10. Mark task as completed
  await supabase
    .from('tasks')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', taskId)
    .eq('user_id', USER_ID)

  // 11. Insert task_completions event record
  await supabase.from('task_completions').insert({
    user_id: USER_ID,
    task_id: taskId,
    gp_awarded: totalGP,
    xp_awarded: xpAwarded,
    streak_bonus_multiplier: multiplier,
  })

  // 12. Upsert daily_logs row for today
  if (existingLog) {
    await supabase
      .from('daily_logs')
      .update({
        gp_earned: existingLog.gp_earned + totalGP,
        xp_earned: existingLog.xp_earned + xpAwarded,
        tasks_completed: existingLog.tasks_completed + 1,
        streak_kept: thresholdReached,
      })
      .eq('user_id', USER_ID)
      .eq('log_date', today)
  } else {
    await supabase.from('daily_logs').insert({
      user_id: USER_ID,
      log_date: today,
      gp_earned: totalGP,
      xp_earned: xpAwarded,
      tasks_completed: 1,
      streak_kept: thresholdReached,
    })
  }

  // 13. Mark quest as completed if applicable
  if (completedQuestId) {
    await supabase
      .from('quests')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', completedQuestId)
  }

  // 12. Invalidate all pages that display quest/stat data
  revalidatePath('/')
  revalidatePath('/quests')
  revalidatePath('/stats')

  return {
    success: true,
    data: { gpAwarded: totalGP, xpAwarded, leveledUp, newLevel },
    leveledUp,
    newLevel,
  }
}

/** Creates a new task owned by the current user */
export async function createTask(formData: {
  title: string
  category_id: string | null
  gp_value: number
  xp_value: number
  is_boss_fight: boolean
  quest_id?: string | null
  is_recurring?: boolean
  recurrence?: 'daily' | 'weekly' | null
  deadline?: string | null
}): Promise<ActionResult<{ id: string }>> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: USER_ID,
      title: formData.title,
      category_id: formData.category_id,
      gp_value: formData.gp_value,
      xp_value: formData.xp_value,
      is_boss_fight: formData.is_boss_fight,
      quest_id: formData.quest_id ?? null,
      is_recurring: formData.is_recurring ?? false,
      recurrence: formData.recurrence ?? null,
      deadline: formData.deadline ?? null,
      status: 'active',
    })
    .select('id')
    .single()

  if (error || !data) {
    return { success: false, error: 'Failed to create task.' }
  }

  revalidatePath('/')
  revalidatePath('/quests')

  return { success: true, data: { id: data.id } }
}

/** Archives (soft-deletes) a task by setting status to archived */
export async function deleteTask(taskId: string): Promise<ActionResult> {
  const { error } = await supabase
    .from('tasks')
    .update({ status: 'archived' })
    .eq('id', taskId)
    .eq('user_id', USER_ID)

  if (error) {
    return { success: false, error: 'Failed to archive task.' }
  }

  revalidatePath('/')
  revalidatePath('/quests')

  return { success: true }
}
