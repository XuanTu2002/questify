'use server'

import { supabase, USER_ID } from '@/lib/supabase'
import { recurringMissPenalty, deadlineLatePenalty, daysLate } from '@/lib/game/penalty'
import type { UserStats, Config, Task } from '@/lib/types'

/**
 * Runs lazily to process missed days, consume freeze tokens, break streaks,
 * and apply penalties for missed recurring tasks or overdue deadlines.
 */
export async function applyDailyCheck() {
  const today = new Date().toISOString().slice(0, 10)
  
  // 1. Fetch user stats and config
  const { data: stats } = await supabase.from('user_stats').select('*').eq('user_id', USER_ID).single<UserStats>()
  const { data: config } = await supabase.from('config').select('*').eq('user_id', USER_ID).single<Config>()
  
  if (!stats || !config) return { success: false, reason: 'missing_data' }

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

  const lastLogDateStr = lastLog?.log_date || today
  const lastDate = new Date(lastLogDateStr)
  const todayDate = new Date(today)
  
  const diffTime = todayDate.getTime() - lastDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  let currentStreak = stats.current_streak
  let freezeTokens = stats.freeze_tokens
  let gpBalance = stats.gp_balance
  
  // Fetch active recurring tasks
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

  // Process each missed day sequentially up to yesterday
  // If diffDays === 1, we only process yesterday.
  // If diffDays === 0, it means lastLog was today (which we already caught) or they are brand new.
  // Re-evaluating logic to correctly handle the "logged but failed" scenario.
  
  // Step A: Did the last logged day fail the streak?
  // If diffDays === 1, yesterday was the last log. Did it fail?
  let startingI = 1
  if (lastLog && lastLog.streak_kept === false && lastLogDateStr !== today) {
    // We need to apply penalties for the last logged day!
    // Because they didn't meet the GP threshold.
    if (freezeTokens > 0) {
      freezeTokens -= 1
      await supabase.from('daily_logs').update({ streak_kept: true, freeze_used: true }).eq('user_id', USER_ID).eq('log_date', lastLogDateStr)
    } else {
      currentStreak = 0
      let dailyPenalty = 0
      if (config.penalize_missed_recurring) rTasks.forEach(t => dailyPenalty += recurringMissPenalty(t.gp_value, config.recurring_penalty_pct))
      if (config.penalize_overdue_deadline) {
        dTasks.forEach(t => {
          const due = new Date(t.deadline!).getTime()
          const procTime = new Date(lastLogDateStr).getTime()
          if (procTime > due) {
            const late = Math.floor((procTime - due) / (86400000))
            dailyPenalty += deadlineLatePenalty(t.gp_value, late, config.deadline_late_penalty_pct, config.deadline_very_late_penalty_pct)
          }
        })
      }
      gpBalance = Math.max(0, gpBalance - dailyPenalty)
    }
  }

  // Step B: Loop through all FULLY MISSED days (where NO log exists)
  for (let i = 1; i < diffDays; i++) {
    const processDate = new Date(lastDate)
    processDate.setDate(processDate.getDate() + i)
    const processDateStr = processDate.toISOString().slice(0, 10)
    
    let streakKept = false
    let freezeUsed = false
    let dailyPenalty = 0

    if (freezeTokens > 0) {
      freezeTokens -= 1
      streakKept = true
      freezeUsed = true
    } else {
      currentStreak = 0
      if (config.penalize_missed_recurring) rTasks.forEach(t => dailyPenalty += recurringMissPenalty(t.gp_value, config.recurring_penalty_pct))
      if (config.penalize_overdue_deadline) {
        dTasks.forEach(t => {
          const due = new Date(t.deadline!).getTime()
          const procTime = processDate.getTime()
          if (procTime > due) {
            const late = Math.floor((procTime - due) / (86400000))
            dailyPenalty += deadlineLatePenalty(t.gp_value, late, config.deadline_late_penalty_pct, config.deadline_very_late_penalty_pct)
          }
        })
      }
    }

    gpBalance = Math.max(0, gpBalance - dailyPenalty)

    await supabase.from('daily_logs').insert({
      user_id: USER_ID,
      log_date: processDateStr,
      gp_earned: 0, xp_earned: 0, tasks_completed: 0,
      streak_kept: streakKept, freeze_used: freezeUsed
    })
  }

  // 4. Create TODAY's empty log to mark applyDailyCheck as complete
  await supabase.from('daily_logs').insert({
    user_id: USER_ID,
    log_date: today,
    gp_earned: 0, xp_earned: 0, tasks_completed: 0,
    streak_kept: false, freeze_used: false
  })

  // Final update to user_stats
  await supabase.from('user_stats').update({
    current_streak: currentStreak,
    freeze_tokens: freezeTokens,
    gp_balance: gpBalance,
  }).eq('user_id', USER_ID)

  return { success: true, processedDays: diffDays - 1 }
}
