'use client'

import { useState, useTransition } from 'react'
import type { RewardWithStatus } from '@/lib/types'
import { purchaseItem } from '@/app/actions/rewards'
import { useModals } from '@/components/modals/ModalsProvider'

/** Tier visual configuration */
const TIER_CONFIG = {
  low: {
    label: 'Common',
    borderColor: 'border-secondary/40',
    bgAccent: 'bg-secondary/10',
    textColor: 'text-secondary',
    icon: 'eco',
  },
  medium: {
    label: 'Rare',
    borderColor: 'border-primary/40',
    bgAccent: 'bg-primary/10',
    textColor: 'text-primary',
    icon: 'bolt',
  },
  high: {
    label: 'Epic',
    borderColor: 'border-error/40',
    bgAccent: 'bg-error/10',
    textColor: 'text-error',
    icon: 'local_fire_department',
  },
} as const

interface ShopItemCardProps {
  reward: RewardWithStatus
}

export default function ShopItemCard({ reward }: ShopItemCardProps) {
  const { showToast } = useModals()
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)

  const tier = TIER_CONFIG[reward.tier] || TIER_CONFIG.medium
  const isBuyable = reward.state === 'buyable'
  const isPurchased = reward.state === 'purchased'
  const isLocked = reward.state === 'locked'
  const isSystemFreeze = reward.is_system && reward.icon === 'ac_unit'

  function handleBuy() {
    if (!isBuyable || isPending) return
    setShowConfirm(true)
  }

  function confirmPurchase() {
    setShowConfirm(false)
    startTransition(async () => {
      const res = await purchaseItem(reward.id)
      if (res.success) {
        showToast(`Purchased: ${reward.title}`)
      } else {
        showToast(res.error || 'Purchase failed')
      }
    })
  }

  return (
    <>
      <button
        onPointerDown={handleBuy}
        disabled={!isBuyable || isPending}
        className={`
          relative p-4 rounded-xl text-left transition-all duration-150
          border-l-4 flex flex-col gap-2 w-full
          ${isBuyable
            ? `bg-surface-container-low hover:bg-surface-container-high ${tier.borderColor} hover:shadow-lg active:scale-[0.98] cursor-pointer`
            : isPurchased
            ? 'bg-surface-dim border-secondary/20 opacity-50 cursor-not-allowed'
            : 'bg-surface-dim border-outline-variant/30 opacity-40 cursor-not-allowed'
          }
        `}
      >
        {/* Top row: icon + tier badge */}
        <div className="flex items-center justify-between">
          <div className={`w-8 h-8 rounded-lg ${tier.bgAccent} ${tier.textColor} flex items-center justify-center`}>
            <span className="material-symbols-outlined text-lg">
              {isSystemFreeze ? 'ac_unit' : reward.icon || 'workspace_premium'}
            </span>
          </div>
          <span className={`font-label-mono text-[10px] uppercase tracking-wider ${tier.textColor}`}>
            {tier.label}
          </span>
        </div>

        {/* Title */}
        <h4 className={`font-body-md font-bold leading-tight line-clamp-2 ${
          isBuyable ? 'text-on-surface' : 'text-on-surface-variant'
        }`}>
          {reward.title}
        </h4>

        {/* Description if exists */}
        {reward.description && (
          <p className="text-xs text-on-surface-variant line-clamp-1">{reward.description}</p>
        )}

        {/* Bottom row: GP cost + status */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-outline-variant/20">
          <span className={`font-label-mono font-bold text-sm ${
            isBuyable ? tier.textColor : 'text-on-surface-variant'
          }`}>
            {reward.gp_cost} GP
          </span>

          {isLocked && (
            <span className="font-label-mono text-[10px] text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">lock</span>
              LVL {reward.required_level}
            </span>
          )}

          {isPurchased && !reward.is_repeatable && (
            <span className="font-label-mono text-[10px] text-secondary uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              Owned
            </span>
          )}

          {isSystemFreeze && reward.currentCount !== undefined && (
            <div className="flex gap-0.5">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`h-1.5 w-3 rounded-full ${i <= reward.currentCount! ? 'bg-primary' : 'bg-surface-container-highest'}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* One-time badge */}
        {!reward.is_repeatable && !isPurchased && (
          <div className="absolute top-2 right-2">
            <span className="font-label-mono text-[8px] text-on-surface-variant/60 uppercase tracking-wider bg-surface-container-highest px-1.5 py-0.5 rounded">
              One-time
            </span>
          </div>
        )}
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-panel rounded-2xl p-6 max-w-sm w-full mx-4 border border-outline-variant/30 shadow-2xl">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 rounded-2xl ${tier.bgAccent} ${tier.textColor} flex items-center justify-center mx-auto mb-4`}>
                <span className="material-symbols-outlined text-3xl">
                  {isSystemFreeze ? 'ac_unit' : reward.icon || 'workspace_premium'}
                </span>
              </div>
              <h3 className="font-headline-lg text-lg text-on-surface mb-1">Confirm Purchase</h3>
              <p className="text-on-surface-variant text-sm">
                Buy <strong className="text-on-surface">{reward.title}</strong> for{' '}
                <strong className={tier.textColor}>{reward.gp_cost} GP</strong>?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-lg border border-outline-variant text-on-surface-variant font-label-mono uppercase tracking-wider text-sm hover:bg-surface-variant transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmPurchase}
                className="flex-1 py-2.5 rounded-lg bg-primary text-on-primary font-label-mono uppercase tracking-wider text-sm font-bold hover:bg-primary/90 active:scale-95 transition-[transform,background-color] duration-75"
              >
                Buy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
