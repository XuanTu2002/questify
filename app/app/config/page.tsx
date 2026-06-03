import { supabase, USER_ID } from '@/lib/supabase'
import type { Category, Reward, Config } from '@/lib/types'
import CategoryList from '@/components/config/CategoryList'
import MilestoneEditor from '@/components/config/MilestoneEditor'
import ConfigPanels from '@/components/config/ConfigPanels'

export const dynamic = 'force-dynamic'

async function getConfigData() {
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', USER_ID)
    .order('sort_order', { ascending: true })

  const { data: rewards } = await supabase
    .from('rewards')
    .select('*')
    .eq('user_id', USER_ID)
    .order('sort_order', { ascending: true })

  let { data: config } = await supabase
    .from('config')
    .select('*')
    .eq('user_id', USER_ID)
    .single<Config>()

  // Fallback default config if missing
  if (!config) {
    config = {
      user_id: USER_ID,
      min_daily_gp_for_streak: 30,
      streak_freeze_cost: 100,
      max_freeze_tokens: 3,
      penalize_missed_recurring: true,
      penalize_overdue_deadline: false,
      recurring_penalty_pct: 0.1,
      deadline_late_penalty_pct: 0.2,
      deadline_very_late_penalty_pct: 0.5,
    }
  }

  return {
    categories: (categories as Category[]) || [],
    rewards: (rewards as Reward[]) || [],
    config
  }
}

export default async function ConfigPage() {
  const { categories, rewards, config } = await getConfigData()

  return (
    <main
      className="flex-1 px-gutter py-gutter space-y-stack-lg max-w-4xl w-full mx-auto md:py-8 pb-28 md:pb-8"
      id="config-main"
    >
      <div className="mb-8">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Codex Configuration</h1>
        <p className="font-label-mono text-label-mono text-on-surface-variant mt-1 uppercase tracking-wider">
          Calibrate your questing parameters and penalty thresholds.
        </p>
      </div>

      <div className="space-y-6">
        <CategoryList categories={categories} />
        
        <MilestoneEditor rewards={rewards} />
        
        <ConfigPanels config={config} />
      </div>
    </main>
  )
}
