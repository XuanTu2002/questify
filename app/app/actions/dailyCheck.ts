'use server'

import { supabase, USER_ID } from '@/lib/supabase'
import { recurringMissPenalty, deadlineLatePenalty } from '@/lib/game/penalty'
import type { UserStats, Config, Task } from '@/lib/types'
import { todayVN, toVNDateStr } from '@/lib/utils'

/**
 * Runs lazily to process missed days, consume freeze tokens, break streaks,
 * and apply penalties for missed recurring tasks or overdue deadlines.
 */
export async function applyDailyCheck() {
  const today = todayVN()
  
  // 1. Fetch user stats and config
  const { data: stats } = await supabase.from('user_stats').select('*').eq('user_id', USER_ID).single<UserStats>()
  const { data: config } = await supabase.from('config').select('*').eq('user_id', USER_ID).single<Config>()
  
  if (!stats || !config) return { success: false, reason: 'missing_data' }

  // Narrow type: config is guaranteed non-null from here
  const cfg = config

  // 2. Check if we already ran today by looking for today's log
  const { data: todayLog } = await supabase
    .from('daily_logs')
    .select('id')
    .eq('user_id', USER_ID)
    .eq('log_date', today)
    .single()

  if (todayLog) {
    // Already processed today
    return { success: true, processedDays: 0 }
  }

  // 3. Find the last logged day BEFORE today
  const { data: lastLog } = await supabase
    .from('daily_logs')
    .select('log_date, streak_kept')
    .eq('user_id', USER_ID)
    .lt('log_date', today)
    .order('log_date', { ascending: false })
    .limit(1)
    .single()

  // lastLog can be null if the user has no history (first-ever open)
  const lastLogDateStr = lastLog?.log_date ?? null
  const todayDate = new Date(today)

  let currentStreak = stats.current_streak
  let freezeTokens = stats.freeze_tokens
  let gpBalance = stats.gp_balance

  // Fetch active recurring tasks (for penalties)
  const { data: recurringTasks } = await supabase
    .from('tasks')
    .select('id, gp_value')
    .eq('user_id', USER_ID)
    .eq('status', 'active')
    .eq('is_recurring', true)

  const rTasks = recurringTasks || []

  // Fetch active deadline tasks that are overdue
  const { data: deadlineTasks } = await supabase
    .from('tasks')
    .select('id, gp_value, deadline')
    .eq('user_id', USER_ID)
    .eq('status', 'active')
    .not('deadline', 'is', null)

  const dTasks = deadlineTasks || []

  // Helper to compute penalty GP for a given day
  function computePenalty(processDateStr: string) {
    let penalty = 0
    if (cfg.penalize_missed_recurring) {
      rTasks.forEach(t => penalty += recurringMissPenalty(t.gp_value, cfg.recurring_penalty_pct))
    }
    if (cfg.penalize_overdue_deadline) {
      const procTime = new Date(processDateStr).getTime()
      dTasks.forEach(t => {
        const due = new Date(t.deadline!).getTime()
        if (procTime > due) {
          const late = Math.floor((procTime - due) / 86400000)
          penalty += deadlineLatePenalty(t.gp_value, late, cfg.deadline_late_penalty_pct, cfg.deadline_very_late_penalty_pct)
        }
      })
    }
    return penalty
  }

  if (!lastLogDateStr) {
    // Brand-new user, no history — create today's placeholder and exit
    await supabase.from('daily_logs').insert({
      user_id: USER_ID,
      log_date: today,
      gp_earned: 0, xp_earned: 0, tasks_completed: 0,
      streak_kept: false, freeze_used: false
    })
    return { success: true, processedDays: 0 }
  }

  const lastDate = new Date(lastLogDateStr)
  const diffTime = todayDate.getTime() - lastDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  // --- Step A: Process the LAST LOGGED day if it failed the streak ---
  // This covers the case where the user completed some tasks but didn't hit
  // the GP threshold (streak_kept === false in the existing row).
  if (lastLog && lastLog.streak_kept === false) {
    if (freezeTokens > 0) {
      freezeTokens -= 1
      await supabase
        .from('daily_logs')
        .update({ streak_kept: true, freeze_used: true })
        .eq('user_id', USER_ID)
        .eq('log_date', lastLogDateStr)
    } else {
      currentStreak = 0
      gpBalance = Math.max(0, gpBalance - computePenalty(lastLogDateStr))
    }
  }

  // --- Step B: Process every FULLY MISSED day between lastLog and today ---
  // When diffDays === 1 this loop runs 0 times (only yesterday was the lastLog, handled above).
  // When diffDays === 2+, yesterday and earlier were fully missed (no row in daily_logs).
  for (let i = 1; i < diffDays; i++) {
    const processDate = new Date(lastDate)
    processDate.setDate(processDate.getDate() + i)
    const processDateStr = toVNDateStr(processDate)

    let streakKept = false
    let freezeUsed = false

    if (freezeTokens > 0) {
      freezeTokens -= 1
      streakKept = true
      freezeUsed = true
    } else {
      currentStreak = 0
      gpBalance = Math.max(0, gpBalance - computePenalty(processDateStr))
    }

    await supabase.from('daily_logs').insert({
      user_id: USER_ID,
      log_date: processDateStr,
      gp_earned: 0, xp_earned: 0, tasks_completed: 0,
      streak_kept: streakKept, freeze_used: freezeUsed
    })
  }

  // --- Step C: Create today's placeholder log ---
  await supabase.from('daily_logs').insert({
    user_id: USER_ID,
    log_date: today,
    gp_earned: 0, xp_earned: 0, tasks_completed: 0,
    streak_kept: false, freeze_used: false
  })

  // Persist the updated streak/tokens/balance
  await supabase
    .from('user_stats')
    .update({ current_streak: currentStreak, freeze_tokens: freezeTokens, gp_balance: gpBalance })
    .eq('user_id', USER_ID)

  return { success: true, processedDays: diffDays }
}
