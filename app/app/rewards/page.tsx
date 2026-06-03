import { supabase, USER_ID } from '@/lib/supabase'
import type { UserStats, Reward, RewardClaim, TaskCompletion, LedgerEntry, RewardWithStatus } from '@/lib/types'
import TreasuryHero from '@/components/rewards/TreasuryHero'
import MilestoneCard from '@/components/rewards/MilestoneCard'
import LedgerRow from '@/components/rewards/LedgerRow'

export const dynamic = 'force-dynamic'

async function getRewardsData() {
  // 1. Fetch user stats
  const { data: stats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', USER_ID)
    .single<UserStats>()

  const safeStats = stats ?? { gp_balance: 0, current_level: 1, total_xp: 0 } as UserStats
  // For the hero class, we'll hardcode "Shadow Walker" or fetch from users if we had it joined
  const heroClass = 'Shadow Walker'

  // 2. Fetch all milestones
  const { data: rewards } = await supabase
    .from('rewards')
    .select('*')
    .order('sort_order', { ascending: true })

  const typedRewards = (rewards as Reward[]) ?? []

  // 3. Fetch user's claims
  const { data: claims } = await supabase
    .from('reward_claims')
    .select('*')
    .eq('user_id', USER_ID)
    .order('claimed_at', { ascending: false })

  const typedClaims = (claims as RewardClaim[]) ?? []
  
  // Create quick lookup for claims
  const claimedRewardIds = new Set(typedClaims.map(c => c.reward_id))
  const claimMap = new Map(typedClaims.map(c => [c.reward_id, c.claimed_at]))

  // 4. Enrich rewards with status
  const rewardsWithStatus: RewardWithStatus[] = typedRewards.map(reward => {
    let state: RewardWithStatus['state'] = 'locked'
    
    if (claimedRewardIds.has(reward.id)) {
      state = 'claimed'
    } else if (safeStats.current_level >= reward.required_level && safeStats.gp_balance >= reward.gp_cost) {
      state = 'claimable'
    }

    return {
      ...reward,
      state,
      claimedAt: claimMap.get(reward.id)
    }
  })

  // 5. Fetch recent task completions (last 30 days) to interleave with claims for Ledger
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: taskCompletions } = await supabase
    .from('task_completions')
    .select('id, gp_awarded, completed_at, tasks(title)')
    .eq('user_id', USER_ID)
    .gte('completed_at', thirtyDaysAgo)
    .order('completed_at', { ascending: false })
    .limit(20)

  // 6. Build the Ledger
  const ledger: LedgerEntry[] = []

  // Add claims to ledger
  for (const claim of typedClaims) {
    const reward = typedRewards.find(r => r.id === claim.reward_id)
    ledger.push({
      id: claim.id,
      title: reward?.title || 'Unknown Reward',
      type: 'claim',
      amount: claim.gp_spent,
      date: claim.claimed_at,
      icon: 'workspace_premium'
    })
  }

  // Add earns to ledger
  if (taskCompletions) {
    for (const tc of taskCompletions) {
      const title = tc.tasks ? (tc.tasks as any).title : 'Completed Task'
      ledger.push({
        id: tc.id,
        title,
        type: 'earn',
        amount: tc.gp_awarded,
        date: tc.completed_at,
        icon: 'swords'
      })
    }
  }

  // Sort ledger by date descending, take top 10
  ledger.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const topLedger = ledger.slice(0, 10)

  return {
    stats: safeStats,
    heroClass,
    rewards: rewardsWithStatus,
    ledger: topLedger
  }
}

export default async function RewardsPage() {
  const { stats, heroClass, rewards, ledger } = await getRewardsData()

  return (
    <main
      className="flex-1 px-gutter py-gutter space-y-stack-lg max-w-5xl w-full mx-auto md:py-8 pb-28 md:pb-8"
      id="rewards-main"
    >
      <TreasuryHero 
        gpBalance={stats.gp_balance} 
        level={stats.current_level} 
        heroClass={heroClass} 
      />

      {/* Milestone Spoils Section */}
      <section className="mb-12">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Milestone Spoils</h2>
            <p className="font-label-mono text-label-mono text-on-surface-variant mt-1 uppercase tracking-wider">
              Exchange GP for real-life rewards
            </p>
          </div>
          <button className="hidden md:flex items-center gap-1 font-label-mono text-sm text-primary hover:text-primary-container transition-colors">
            <span className="material-symbols-outlined text-sm">filter_list</span>
            Filter
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map(reward => (
            <MilestoneCard key={reward.id} reward={reward} />
          ))}
          {rewards.length === 0 && (
            <div className="col-span-full p-12 text-center text-on-surface-variant border border-dashed border-outline-variant rounded-xl font-label-mono">
              No milestones defined. Go to Config to add some!
            </div>
          )}
        </div>
      </section>

      {/* Treasury Ledger Section */}
      <section>
        <h2 className="font-headline-lg text-2xl text-on-surface mb-6">Treasury Ledger</h2>
        
        <div className="glass-panel rounded-xl overflow-hidden">
          {ledger.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant font-label-mono">
              No recent transactions.
            </div>
          ) : (
            <div className="flex flex-col">
              {ledger.map(entry => (
                <LedgerRow key={entry.id} entry={entry} />
              ))}
            </div>
          )}
          
          {ledger.length > 0 && (
            <div className="p-4 bg-surface-container-low text-center border-t border-outline-variant/20">
              <button className="font-label-mono text-sm text-primary uppercase tracking-wider hover:underline">
                View Full Ledger
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
