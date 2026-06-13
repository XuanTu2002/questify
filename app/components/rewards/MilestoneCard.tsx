'use client'

import { useState, useTransition } from 'react'
import type { RewardWithStatus } from '@/lib/types'
import { claimReward } from '@/app/actions/rewards'
import { useModals } from '@/components/modals/ModalsProvider'

interface MilestoneCardProps {
  reward: RewardWithStatus
}

export default function MilestoneCard({ reward }: MilestoneCardProps) {
  const { showToast } = useModals()
  const [, startTransition] = useTransition()
  // Local optimistic state — card flips to "claimed" instantly on click
  const [optimisticClaimed, setOptimisticClaimed] = useState(false)

  const handleClaim = () => {
    if (reward.state !== 'claimable' || optimisticClaimed) return

    setOptimisticClaimed(true) // instant visual flip

    startTransition(async () => {
      const res = await claimReward(reward.id)
      if (res.success) {
        showToast(`Successfully claimed: ${reward.title}`)
      } else {
        setOptimisticClaimed(false) // revert on server error
        showToast(res.error || 'Failed to claim reward')
      }
    })
  }

  // Effective state — local optimistic overrides server state
  const isClaimable = reward.state === 'claimable' && !optimisticClaimed
  const isClaimed = reward.state === 'claimed' || optimisticClaimed
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
              className="px-6 py-2 bg-primary text-on-primary font-bold text-sm rounded-lg hover:shadow-[0_0_15px_rgba(242,202,80,0.4)] active:scale-95 transition-[transform,box-shadow] duration-75 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">star</span>
              CLAIM
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
