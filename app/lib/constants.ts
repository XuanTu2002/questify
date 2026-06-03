/* ─── Application-wide constants ─────────────────────────────────────────── */

/** Single user ID for v1 — resolved at runtime from env via lib/supabase.ts */
export const USER_ID = process.env.USER_ID || 'lucas'

/** Hardcoded hero class for v1 — editable via DB, no UI yet */
export const HERO_CLASS = 'Shadow Walker'

/* ─── Category color token → Tailwind color mapping ────────────────────── */

/** Maps a category color_token to the Tailwind CSS color name for text/border */
export const CATEGORY_COLOR_MAP: Record<string, string> = {
  error: '#ffb4ab',
  secondary: '#44e2cd',
  tertiary: '#e3c2ff',
  primary: '#f2ca50',
  outline: '#99907c',
}

/** Maps a category color_token to a background with low opacity for pills */
export const CATEGORY_BG_MAP: Record<string, string> = {
  error: 'rgba(255, 180, 171, 0.1)',
  secondary: 'rgba(68, 226, 205, 0.1)',
  tertiary: 'rgba(227, 194, 255, 0.1)',
  primary: 'rgba(242, 202, 80, 0.1)',
  outline: 'rgba(153, 144, 124, 0.1)',
}

/* ─── Chart color tokens — used by Recharts components ─────────────────── */

export const CHART_COLORS = {
  /** Gold bars — current week / primary data series */
  currentWeek: '#f2ca50',
  /** Dim purple bars — previous week / secondary data series */
  previousWeek: '#A855F7',
  /** Heatmap intensity ramp — 4 buckets from dim to vibrant purple */
  heatmap: ['#1c2b3c', '#4d2a8a', '#7c3aed', '#a855f7'],
  /** Grid lines */
  grid: 'rgba(255, 255, 255, 0.05)',
  /** Axis labels */
  axis: '#d0c5af',
}

/* ─── Default seed data ─────────────────────────────────────────────────── */

export const DEFAULT_CATEGORIES = [
  { name: 'Fitness & Vitality', color_token: 'error', icon: 'fitness_center' },
  { name: 'Arcane Studies (Deep Work)', color_token: 'secondary', icon: 'science' },
  { name: 'Life Maintenance', color_token: 'tertiary', icon: 'home' },
]

export const DEFAULT_CONFIG = {
  min_daily_gp_for_streak: 30,
  streak_freeze_cost: 200,
  max_freeze_tokens: 3,
  penalize_missed_recurring: true,
  penalize_overdue_deadline: true,
  recurring_penalty_pct: 50,
  deadline_late_penalty_pct: 25,
  deadline_very_late_penalty_pct: 50,
}

/* ─── Navigation routes ─────────────────────────────────────────────────── */

export const ROUTES = {
  home: '/',
  quests: '/quests',
  rewards: '/rewards',
  stats: '/stats',
  config: '/config',
  comingSoon: '/coming-soon',
} as const
