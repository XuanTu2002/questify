'use client'

import { useTransition } from 'react'
import type { RewardWithStatus } from '@/lib/types'
import { claimReward } from '@/app/actions/rewards'
import { useModals } from '@/components/modals/ModalsProvider'

interface MilestoneCardProps {
  reward: RewardWithStatus
}

export default function MilestoneCard({ reward }: MilestoneCardProps) {
  const { showToast } = useModals()
  const [isPending, startTransition] = useTransition()

  const handleClaim = () => {
    if (reward.state !== 'claimable' || isPending) return

    startTransition(async () => {
      const res = await claimReward(reward.id)
      if (res.success) {
        showToast(`Successfully claimed: ${reward.title}`)
      } else {
        showToast(res.error || 'Failed to claim reward')
      }
    })
  }

  // Styles based on state
  const isClaimable = reward.state === 'claimable'
  const isClaimed = reward.state === 'claimed'
  const isLocked = reward.state === 'locked'

  return (
    <div
      className={`relative rounded-xl p-5 flex flex-col justify-between h-48 transition-all ${
        isClaimable
          ? 'bg-surface-container-high border border-primary neon-border-active shadow-[0_0_20px_rgba(242,202,80,0.15)]'
          : isClaimed
          ? 'bg-surface-container border border-secondary shadow-[0_0_15px_rgba(68,226,205,0.1)]'
          : 'bg-surface-dim border border-dashed border-outline-variant opacity-60'
      }`}
    >
      {/* Top section: Icon + GP Cost */}
      <div className="flex justify-between items-start mb-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            isClaimable
              ? 'bg-primary/20 text-primary border border-primary/40'
              : isClaimed
              ? 'bg-secondary/20 text-secondary border border-secondary/40'
              : 'bg-surface-container-highest text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-xl">
            {isClaimed ? 'check' : reward.icon || 'workspace_premium'}
          </span>
        </div>

        <div
          className={`font-label-mono text-lg font-bold ${
            isClaimable ? 'text-primary' : isClaimed ? 'text-on-surface-variant line-through' : 'text-on-surface-variant'
          }`}
        >
          {reward.gp_cost} GP
        </div>
      </div>

      {/* Middle section: Title & Description */}
      <div className="flex-1">
        <h3
          className={`font-headline-lg-mobile text-lg leading-tight mb-1 ${
            isClaimable ? 'text-on-surface' : isClaimed ? 'text-on-surface-variant line-through' : 'text-on-surface-variant'
          }`}
        >
          {reward.title}
        </h3>
        {reward.description && (
          <p className="text-xs text-on-surface-variant line-clamp-2">{reward.description}</p>
        )}
      </div>

      {/* Bottom section: Action/Status */}
      <div className="mt-4 flex items-center justify-between">
        {isLocked ? (
          <div className="flex items-center gap-1.5 text-on-surface-variant font-label-mono text-xs uppercase tracking-wider">
            <span className="material-symbols-outlined text-sm">lock</span>
            REQ LVL {reward.required_level}
          </div>
        ) : isClaimed ? (
          <div className="flex items-center gap-1.5 text-secondary font-label-mono text-xs uppercase tracking-wider">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Claimed
          </div>
        ) : (
          <div className="w-full flex justify-end">
            <button
              onClick={handleClaim}
              disabled={isPending}
              className="px-6 py-2 bg-primary text-on-primary font-bold text-sm rounded-lg hover:shadow-[0_0_15px_rgba(242,202,80,0.4)] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isPending ? (
                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-sm">star</span>
              )}
              CLAIM
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
