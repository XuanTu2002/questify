import { supabase, USER_ID } from '@/lib/supabase'
import type { DailyLog, UserStats, Reward, Category } from '@/lib/types'
import WeeklyOutput from '@/components/stats/WeeklyOutput'
import ConsistencyHeatmap from '@/components/stats/ConsistencyHeatmap'
import SkillDistribution, { SkillXP } from '@/components/stats/SkillDistribution'
import MilestoneProjection from '@/components/stats/MilestoneProjection'

export const dynamic = 'force-dynamic'

async function getStatsData() {
  // 1. Fetch user stats
  const { data: stats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', USER_ID)
    .single<UserStats>()

  const safeStats = stats ?? { gp_balance: 0, current_level: 1, total_xp: 0 } as UserStats

  // 2. Fetch last 30 days of daily logs
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const { data: logs } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', USER_ID)
    .gte('log_date', thirtyDaysAgo)
    .order('log_date', { ascending: false })

  const typedLogs = (logs as DailyLog[]) || []

  // 3. Fetch rewards for projection
  const { data: rewards } = await supabase
    .from('rewards')
    .select('*')
    .eq('user_id', USER_ID)
  
  const typedRewards = (rewards as Reward[]) || []

  // 4. Fetch categories and task_completions to compute skill distribution
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', USER_ID)
  
  const typedCategories = (categories as Category[]) || []

  const { data: completions } = await supabase
    .from('task_completions')
    .select('xp_awarded, tasks(category_id)')
    .eq('user_id', USER_ID)
  
  // Aggregate XP by category_id
  const xpByCat: Record<string, number> = {}
  if (completions) {
    completions.forEach((comp: any) => {
      const catId = comp.tasks?.category_id
      if (catId) {
        xpByCat[catId] = (xpByCat[catId] || 0) + (comp.xp_awarded || 0)
      }
    })
  }

  // Format into SkillXP array
  const skills: SkillXP[] = typedCategories.map(cat => ({
    categoryId: cat.id,
    name: cat.name,
    colorToken: cat.color_token,
    xp: xpByCat[cat.id] || 0
  })).filter(s => s.xp > 0) // only show categories with XP

  return {
    stats: safeStats,
    logs: typedLogs,
    rewards: typedRewards,
    skills
  }
}

export default async function StatsPage() {
  const { stats, logs, rewards, skills } = await getStatsData()

  // For WeeklyOutput and MilestoneProjection, we need exactly the last 7 days of logs from our dataset
  const sevenDaysAgoStr = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const last7Logs = logs.filter(l => l.log_date > sevenDaysAgoStr)

  return (
    <main
      className="flex-1 px-gutter py-gutter space-y-stack-lg max-w-5xl w-full mx-auto md:py-8 pb-28 md:pb-8"
      id="stats-main"
    >
      <div className="mb-8">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Character Sheet</h1>
        <p className="font-label-mono text-label-mono text-on-surface-variant mt-1 uppercase tracking-wider">
          Metrics, mastery, and milestones
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <WeeklyOutput logs={last7Logs} />
          <SkillDistribution skills={skills} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <ConsistencyHeatmap logs={logs} />
          <MilestoneProjection logs={last7Logs} rewards={rewards} stats={stats} />
        </div>
      </div>
    </main>
  )
}
