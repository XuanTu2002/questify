import { supabase, USER_ID } from '@/lib/supabase'
import type { UserStats, Reward, RewardClaim, LedgerEntry, RewardWithStatus } from '@/lib/types'
import TreasuryHero from '@/components/rewards/TreasuryHero'
import ShopItemCard from '@/components/rewards/ShopItemCard'
import LedgerRow from '@/components/rewards/LedgerRow'
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

  const safeStats = stats ?? { gp_balance: 0, current_level: 1, total_xp: 0, freeze_tokens: 0 } as UserStats
  const heroClass = 'Shadow Walker'

  // 2. Fetch all shop items ordered by tier desc then gp_cost desc
  const { data: rewards } = await supabase
    .from('rewards')
    .select('*')
    .eq('user_id', USER_ID)
    .order('gp_cost', { ascending: false })

  const typedRewards = (rewards as Reward[]) ?? []

  // 3. Fetch all purchase records
  const { data: claims } = await supabase
    .from('reward_claims')
    .select('*')
    .eq('user_id', USER_ID)
    .order('claimed_at', { ascending: false })

  const typedClaims = (claims as RewardClaim[]) ?? []
  const purchasedRewardIds = new Set(typedClaims.map(c => c.reward_id))

  // 4. Build shop items with computed state — hide purchased one-time items
  const shopItems: RewardWithStatus[] = typedRewards
    .filter(reward => {
      // One-time items already purchased are removed from shop view
      if (!reward.is_repeatable && purchasedRewardIds.has(reward.id)) return false
      return true
    })
    .map(reward => {
      let state: RewardWithStatus['state'] = 'locked'

      const meetsLevel = safeStats.current_level >= reward.required_level
      const hasGP = safeStats.gp_balance >= reward.gp_cost

      if (meetsLevel && hasGP) {
        state = 'buyable'
      }

      // System Freeze Token: locked when at cap
      if (reward.is_system && reward.icon === 'ac_unit' && safeStats.freeze_tokens >= 3) {
        state = 'locked'
      }

      return {
        ...reward,
        state,
        currentCount: reward.is_system && reward.icon === 'ac_unit' ? safeStats.freeze_tokens : undefined,
      }
    })

  // Group by tier for display: Epic → Rare → Common
  const highTier = shopItems.filter(i => i.tier === 'high')
  const mediumTier = shopItems.filter(i => i.tier === 'medium')
  const lowTier = shopItems.filter(i => i.tier === 'low')

  // 5. Build unified ledger (all-time)
  const { data: taskCompletions } = await supabase
    .from('task_completions')
    .select('id, gp_awarded, completed_at, tasks(title)')
    .eq('user_id', USER_ID)
    .order('completed_at', { ascending: false })

  const ledger: LedgerEntry[] = []

  for (const claim of typedClaims) {
    const reward = typedRewards.find(r => r.id === claim.reward_id)
    ledger.push({
      id: claim.id,
      title: reward?.title || 'Unknown Item',
      type: 'purchase',
      amount: claim.gp_spent,
      date: claim.claimed_at,
      icon: 'shopping_bag'
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

  ledger.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const totalEntries = ledger.length
  const totalPages = Math.max(1, Math.ceil(totalEntries / PAGE_SIZE))
  const pagedLedger = ledger.slice(offset, offset + PAGE_SIZE)

  return {
    stats: safeStats,
    heroClass,
    highTier,
    mediumTier,
    lowTier,
    ledger: pagedLedger,
    page,
    totalPages,
    totalEntries,
  }
}

function TierSection({
  label,
  icon,
  colorClass,
  items,
}: {
  label: string
  icon: string
  colorClass: string
  items: RewardWithStatus[]
}) {
  if (items.length === 0) return null
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className={`material-symbols-outlined text-lg ${colorClass}`}>{icon}</span>
        <h3 className={`font-label-mono text-sm uppercase tracking-wider ${colorClass}`}>{label}</h3>
        <div className="flex-1 h-px bg-outline-variant/30" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map(item => (
          <ShopItemCard key={item.id} reward={item} />
        ))}
      </div>
    </div>
  )
}

export default async function RewardsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const { stats, heroClass, highTier, mediumTier, lowTier, ledger, totalPages, totalEntries } = await getRewardsData(page)

  const isEmpty = highTier.length === 0 && mediumTier.length === 0 && lowTier.length === 0

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

      {/* ── Merchant's Wares Shop Section ── */}
      <section className="mb-12">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Merchant&apos;s Wares</h2>
            <p className="font-label-mono text-label-mono text-on-surface-variant mt-1 uppercase tracking-wider">
              Spend your hard-earned GP
            </p>
          </div>
        </div>

        <TierSection label="Epic" icon="local_fire_department" colorClass="text-error" items={highTier} />
        <TierSection label="Rare" icon="bolt" colorClass="text-primary" items={mediumTier} />
        <TierSection label="Common" icon="eco" colorClass="text-secondary" items={lowTier} />

        {isEmpty && (
          <div className="p-12 text-center text-on-surface-variant border border-dashed border-outline-variant rounded-xl font-label-mono">
            No items in shop. Go to Codex to add some!
          </div>
        )}
      </section>

      {/* ── Treasury Ledger Section ── */}
      <section id="ledger">
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
                  href={`/rewards?page=${page - 1}#ledger`}
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

              <div className="flex items-center gap-1.5">
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(p => (
                  <Link
                    key={p}
                    href={`/rewards?page=${p}#ledger`}
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
                  href={`/rewards?page=${page + 1}#ledger`}
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
