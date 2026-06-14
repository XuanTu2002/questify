import { supabase, USER_ID } from '@/lib/supabase'
import type { UserStats, Reward, RewardClaim, TaskCompletion, LedgerEntry, RewardWithStatus } from '@/lib/types'
import TreasuryHero from '@/components/rewards/TreasuryHero'
import MilestoneCard from '@/components/rewards/MilestoneCard'
import LedgerRow from '@/components/rewards/LedgerRow'
import FreezeTokenShopCard from '@/components/rewards/FreezeTokenShopCard'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 10

async function getRewardsData(page: number) {
  const offset = (page - 1) * PAGE_SIZE

  // 1. Fetch user stats
  const { data: stats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', USER_ID)
    .single<UserStats>()

  const safeStats = stats ?? { gp_balance: 0, current_level: 1, total_xp: 0 } as UserStats
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

    return { ...reward, state, claimedAt: claimMap.get(reward.id) }
  })

  // 5. Fetch ALL task completions (all-time, no date filter) for unified ledger
  const { data: taskCompletions } = await supabase
    .from('task_completions')
    .select('id, gp_awarded, completed_at, tasks(title)')
    .eq('user_id', USER_ID)
    .order('completed_at', { ascending: false })

  // Build unified ledger
  const ledger: LedgerEntry[] = []

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

  // Sort all entries newest-first then paginate in-memory
  ledger.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const totalEntries = ledger.length
  const totalPages = Math.max(1, Math.ceil(totalEntries / PAGE_SIZE))
  const pagedLedger = ledger.slice(offset, offset + PAGE_SIZE)

  return {
    stats: safeStats,
    heroClass,
    rewards: rewardsWithStatus,
    ledger: pagedLedger,
    page,
    totalPages,
    totalEntries,
  }
}

export default async function RewardsPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1)
  const { stats, heroClass, rewards, ledger, totalPages, totalEntries } = await getRewardsData(page)

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

      {/* System Shop Section */}
      <section className="mb-12">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">System Shop</h2>
            <p className="font-label-mono text-label-mono text-on-surface-variant mt-1 uppercase tracking-wider">
              Essential utility items
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FreezeTokenShopCard
            freezeTokens={stats.freeze_tokens}
            gpBalance={stats.gp_balance}
          />
        </div>
      </section>

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
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="font-headline-lg text-2xl text-on-surface">Treasury Ledger</h2>
            <p className="font-label-mono text-xs text-on-surface-variant mt-1 uppercase tracking-wider">
              {totalEntries} total transactions
            </p>
          </div>
          {totalPages > 1 && (
            <span className="font-label-mono text-xs text-on-surface-variant uppercase tracking-wider">
              Page {page} of {totalPages}
            </span>
          )}
        </div>

        <div className="glass-panel rounded-xl overflow-hidden">
          {ledger.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant font-label-mono">
              No transactions yet.
            </div>
          ) : (
            <div className="flex flex-col">
              {ledger.map(entry => (
                <LedgerRow key={entry.id} entry={entry} />
              ))}
            </div>
          )}

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="p-4 bg-surface-container-low border-t border-outline-variant/20 flex items-center justify-between gap-4">
              {page > 1 ? (
                <Link
                  href={`/rewards?page=${page - 1}`}
                  className="flex items-center gap-1.5 font-label-mono text-sm text-primary uppercase tracking-wider hover:text-primary-container transition-colors"
                >
                  <span className="material-symbols-outlined text-base leading-none">arrow_back</span>
                  Prev
                </Link>
              ) : (
                <span className="font-label-mono text-sm text-on-surface-variant/30 uppercase tracking-wider flex items-center gap-1.5 cursor-not-allowed">
                  <span className="material-symbols-outlined text-base leading-none">arrow_back</span>
                  Prev
                </span>
              )}

              {/* Page indicator dots — capped at 10 to avoid overflow */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(p => (
                  <Link
                    key={p}
                    href={`/rewards?page=${p}`}
                    className={`rounded-full transition-all duration-200 ${
                      p === page
                        ? 'bg-primary w-4 h-2'
                        : 'bg-outline-variant hover:bg-primary/50 w-2 h-2'
                    }`}
                    aria-label={`Page ${p}`}
                  />
                ))}
                {totalPages > 10 && (
                  <span className="font-label-mono text-xs text-on-surface-variant">…</span>
                )}
              </div>

              {page < totalPages ? (
                <Link
                  href={`/rewards?page=${page + 1}`}
                  className="flex items-center gap-1.5 font-label-mono text-sm text-primary uppercase tracking-wider hover:text-primary-container transition-colors"
                >
                  Next
                  <span className="material-symbols-outlined text-base leading-none">arrow_forward</span>
                </Link>
              ) : (
                <span className="font-label-mono text-sm text-on-surface-variant/30 uppercase tracking-wider flex items-center gap-1.5 cursor-not-allowed">
                  Next
                  <span className="material-symbols-outlined text-base leading-none">arrow_forward</span>
                </span>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
