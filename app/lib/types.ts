/* ─── Shared TypeScript types for Questify ───────────────────────────────── */

/** Database row types — mirror the schema from CLAUDE.md § 6 */

export interface User {
  id: string
  display_name: string
  hero_class: string
  created_at: string
}

export interface UserStats {
  user_id: string
  total_xp: number
  current_level: number
  gp_balance: number
  gp_lifetime_earned: number
  current_streak: number
  longest_streak: number
  freeze_tokens: number
  last_active_date: string | null
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  /** One of: error | secondary | tertiary | primary | outline */
  color_token: string
  icon: string
  sort_order: number
}

export interface Task {
  id: string
  user_id: string
  title: string
  category_id: string | null
  gp_value: number
  xp_value: number
  deadline: string | null
  is_recurring: boolean
  recurrence: 'daily' | 'weekly' | null
  is_boss_fight: boolean
  quest_id: string | null
  step_order: number | null
  status: 'active' | 'completed' | 'failed' | 'archived'
  created_at: string
  completed_at: string | null
}

export interface TaskCompletion {
  id: string
  user_id: string
  task_id: string
  gp_awarded: number
  xp_awarded: number
  streak_bonus_multiplier: number
  completed_at: string
}

export interface Quest {
  id: string
  user_id: string
  title: string
  description: string | null
  icon: string | null
  boss_fight_task_id: string | null
  status: 'active' | 'completed' | 'failed'
  bonus_xp: number
  bonus_gp: number
  created_at: string
  completed_at: string | null
}

export interface Reward {
  id: string
  user_id: string
  title: string
  description: string | null
  gp_cost: number
  required_level: number
  icon: string
  sort_order: number
  is_repeatable: boolean
  tier: 'low' | 'medium' | 'high'
  is_system: boolean
}

export interface RewardClaim {
  id: string
  user_id: string
  reward_id: string
  gp_spent: number
  claimed_at: string
}

export interface DailyLog {
  user_id: string
  log_date: string
  gp_earned: number
  xp_earned: number
  tasks_completed: number
  streak_kept: boolean
  freeze_used: boolean
}

export interface Config {
  user_id: string
  min_daily_gp_for_streak: number
  streak_freeze_cost: number
  max_freeze_tokens: number
  penalize_missed_recurring: boolean
  penalize_overdue_deadline: boolean
  recurring_penalty_pct: number
  deadline_late_penalty_pct: number
  deadline_very_late_penalty_pct: number
  /** Default GP value when opening Forge Quest modal (default: 50) */
  default_gp_value: number
  /** Step size for GP spinner arrows in Forge Quest modal (default: 50) */
  default_gp_step: number
}

/* ─── Derived / composite types used in UI ──────────────────────────────── */

/** Task enriched with its category for display */
export interface TaskWithCategory extends Task {
  category: Category | null
}

/** Quest enriched with its steps (tasks) for display */
export interface QuestWithSteps extends Quest {
  steps: TaskWithCategory[]
  completedSteps: number
  totalSteps: number
}

/** Reward with computed eligibility state for shop display */
export interface RewardWithStatus extends Reward {
  state: 'buyable' | 'locked' | 'purchased'
  /** For one-time items only: timestamp of purchase. Undefined for repeatable. */
  purchasedAt?: string
  /** For system freeze token: current count held */
  currentCount?: number
}

/** Ledger entry merging reward_claims and task_completions */
export interface LedgerEntry {
  id: string
  title: string
  type: 'claim' | 'earn' | 'purchase'
  amount: number
  date: string
  icon: string
}

/** Server action result — used for optimistic UI signalling */
export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
  /** Signals the client to show the LevelUpOverlay */
  leveledUp?: boolean
  newLevel?: number
}
