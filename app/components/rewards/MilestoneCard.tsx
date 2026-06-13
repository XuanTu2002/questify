'use client'

import { useState, useTransition } from 'react'
import type { RewardWithStatus } from '@/lib/types'
import { claimReward } from '@/app/actions/rewards'
import { updateReward } from '@/app/actions/config'
import { useModals } from '@/components/modals/ModalsProvider'

interface MilestoneCardProps {
  reward: RewardWithStatus
}

export default function MilestoneCard({ reward }: MilestoneCardProps) {
  const { showToast } = useModals()
  const [, startTransition] = useTransition()

  // Local optimistic claim state
  const [optimisticClaimed, setOptimisticClaimed] = useState(false)

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(reward.title)
  const [editDescription, setEditDescription] = useState(reward.description ?? '')
  const [editGpCost, setEditGpCost] = useState<number | ''>(reward.gp_cost)
  const [editReqLevel, setEditReqLevel] = useState<number | ''>(reward.required_level ?? 1)
  const [isSaving, startSaveTransition] = useTransition()

  const handleClaim = () => {
    if (reward.state !== 'claimable' || optimisticClaimed) return
    setOptimisticClaimed(true)
    startTransition(async () => {
      const res = await claimReward(reward.id)
      if (res.success) {
        showToast(`Successfully claimed: ${reward.title}`)
      } else {
        setOptimisticClaimed(false)
        showToast(res.error || 'Failed to claim reward')
      }
    })
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editTitle.trim() || editGpCost === '' || isSaving) return

    startSaveTransition(async () => {
      const res = await updateReward(reward.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        gp_cost: Number(editGpCost),
        required_level: editReqLevel ? Number(editReqLevel) : 1,
      })
      if (res.success) {
        showToast('Milestone updated')
        setIsEditing(false)
      } else {
        showToast(res.error || 'Failed to update milestone')
      }
    })
  }

  // Effective state
  const isClaimable = reward.state === 'claimable' && !optimisticClaimed
  const isClaimed = reward.state === 'claimed' || optimisticClaimed
  const isLocked = reward.state === 'locked'

  // Edit form overlay
  if (isEditing) {
    return (
      <form
        onSubmit={handleEditSubmit}
        className="relative rounded-xl p-5 flex flex-col gap-3 bg-surface-container-high border border-primary/60 shadow-[0_0_20px_rgba(242,202,80,0.15)]"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="font-label-mono text-xs text-primary uppercase tracking-widest">Edit Milestone</span>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="p-1 rounded text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <input
          type="text"
          placeholder="Milestone Title"
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          required
          disabled={isSaving}
          className="w-full bg-surface-dim border-none rounded p-2 text-on-surface text-sm focus:ring-1 focus:ring-primary outline-none"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={editDescription}
          onChange={e => setEditDescription(e.target.value)}
          disabled={isSaving}
          className="w-full bg-surface-dim border-none rounded p-2 text-on-surface text-sm focus:ring-1 focus:ring-primary outline-none"
        />
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="GP Cost"
            value={editGpCost}
            onChange={e => setEditGpCost(e.target.value === '' ? '' : Number(e.target.value))}
            required
            min={0}
            disabled={isSaving}
            className="w-1/2 bg-surface-dim border-none rounded p-2 text-on-surface text-sm focus:ring-1 focus:ring-primary outline-none"
          />
          <input
            type="number"
            placeholder="Req Lvl"
            value={editReqLevel}
            onChange={e => setEditReqLevel(e.target.value === '' ? '' : Number(e.target.value))}
            min={1}
            disabled={isSaving}
            className="w-1/2 bg-surface-dim border-none rounded p-2 text-on-surface text-sm focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
        <div className="flex justify-end gap-2 mt-1">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            disabled={isSaving}
            className="px-4 py-1.5 text-on-surface-variant hover:bg-surface-variant rounded font-label-mono text-xs uppercase"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || !editTitle.trim() || editGpCost === ''}
            className="px-4 py-1.5 bg-primary text-on-primary rounded font-label-mono text-xs uppercase font-bold disabled:opacity-50"
          >
            {isSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    )
  }

  return (
    <div
      className={`relative rounded-xl p-5 flex flex-col justify-between h-48 transition-all group ${
        isClaimable
          ? 'bg-surface-container-high border border-primary neon-border-active shadow-[0_0_20px_rgba(242,202,80,0.15)]'
          : isClaimed
          ? 'bg-surface-container border border-secondary shadow-[0_0_15px_rgba(68,226,205,0.1)]'
          : 'bg-surface-dim border border-dashed border-outline-variant opacity-60'
      }`}
    >
      {/* Edit button — only for unclaimed milestones, visible on hover */}
      {!isClaimed && (
        <button
          onClick={() => setIsEditing(true)}
          title="Edit milestone"
          className="absolute top-3 right-3 p-1.5 rounded-lg text-on-surface-variant opacity-0 group-hover:opacity-100 hover:text-primary hover:bg-primary/10 transition-all duration-150 z-10"
        >
          <span className="material-symbols-outlined text-base leading-none">edit</span>
        </button>
      )}

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
