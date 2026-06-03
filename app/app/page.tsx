import { supabase, USER_ID } from '@/lib/supabase'
import type { UserStats, TaskWithCategory, QuestWithSteps } from '@/lib/types'
import HeroStatBar from '@/components/home/HeroStatBar'
import StreakCards from '@/components/home/StreakCards'
import TodaysQuests from '@/components/home/TodaysQuests'
import ActiveQuestCard from '@/components/home/ActiveQuestCard'
import FAB from '@/components/home/FAB'

export const dynamic = 'force-dynamic'

/** Fetches user stats — falls back to zeroed defaults if row is missing */
async function getUserStats(): Promise<UserStats> {
  const { data } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', USER_ID)
    .single<UserStats>()

  return (
    data ?? {
      user_id: USER_ID,
      total_xp: 0,
      current_level: 1,
      gp_balance: 0,
      gp_lifetime_earned: 0,
      current_streak: 0,
      longest_streak: 0,
      freeze_tokens: 0,
      last_active_date: null,
      updated_at: new Date().toISOString(),
    }
  )
}

/** Fetches today's top 3 active non-quest, non-boss-fight tasks with their category */
async function getTodaysTasks(): Promise<TaskWithCategory[]> {
  const { data } = await supabase
    .from('tasks')
    .select('*, category:categories(*)')
    .eq('user_id', USER_ID)
    .eq('status', 'active')
    .eq('is_boss_fight', false)
    .is('quest_id', null)
    .order('created_at', { ascending: false })
    .limit(3)

  return (data as TaskWithCategory[]) ?? []
}

/** Fetches the first active epic quest with its step counts */
async function getActiveQuest(): Promise<QuestWithSteps | null> {
  const { data: quest } = await supabase
    .from('quests')
    .select('*')
    .eq('user_id', USER_ID)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!quest) return null

  const { data: steps } = await supabase
    .from('tasks')
    .select('*, category:categories(*)')
    .eq('user_id', USER_ID)
    .eq('quest_id', quest.id)
    .order('step_order', { ascending: true })

  const typedSteps = (steps as TaskWithCategory[]) ?? []
  const completedSteps = typedSteps.filter((s) => s.status === 'completed').length

  return {
    ...quest,
    steps: typedSteps,
    completedSteps,
    totalSteps: typedSteps.length,
  }
}

/** Home page — server component, all data fetched in parallel */
export default async function HomePage() {
  const [stats, todaysTasks, activeQuest] = await Promise.all([
    getUserStats(),
    getTodaysTasks(),
    getActiveQuest(),
  ])

  return (
    <>
      {/* Mobile top app bar — hidden on desktop */}
      <header className="md:hidden sticky top-0 z-40 bg-background border-b border-outline-variant/20 flex justify-between items-center px-container-margin py-4">
        <span className="font-display-hero text-2xl text-primary drop-shadow-[0_0_10px_rgba(242,202,80,0.5)]">
          Questify
        </span>
        <div className="flex gap-2">
          <button
            id="btn-notifications"
            aria-label="Notifications"
            className="text-on-surface-variant hover:bg-surface-variant/50 transition-colors p-2 rounded-full"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </header>

      {/* Main content area */}
      <main
        id="home-main"
        className="flex-1 px-gutter py-gutter space-y-stack-lg pb-28 md:pb-gutter max-w-2xl w-full md:mx-auto"
      >
        {/* Desktop page title — only visible on desktop */}
        <div className="hidden md:flex items-center justify-between">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Command Center</h1>
            <p className="font-label-mono text-label-mono text-on-surface-variant mt-1 uppercase tracking-wider">
              Shadow Walker · Active
            </p>
          </div>
        </div>

        {/* Section 1: Hero stat bar */}
        <HeroStatBar stats={stats} />

        {/* Section 2: Streak + Freeze tokens */}
        <StreakCards stats={stats} />

        {/* Section 3: Today's quests */}
        <TodaysQuests tasks={todaysTasks} />

        {/* Section 4: Active epic quest preview (hidden when no active quest) */}
        <ActiveQuestCard quest={activeQuest} />
      </main>

      {/* Mobile floating action button */}
      <FAB />
    </>
  )
}
