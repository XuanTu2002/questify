'use client'

import { useState, useTransition } from 'react'
import type { Reward } from '@/lib/types'
import { createReward, deleteReward, updateReward } from '@/app/actions/config'
import { useModals } from '@/components/modals/ModalsProvider'

interface MilestoneEditorProps {
  rewards: Reward[]
  claimedIds: Set<string>
}

/** Inline edit form embedded in each milestone card */
function MilestoneEditForm({
  reward,
  onDone,
}: {
  reward: Reward
  onDone: () => void
}) {
  const { showToast } = useModals()
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState(reward.title)
  const [description, setDescription] = useState(reward.description ?? '')
  const [gpCost, setGpCost] = useState<number | ''>(reward.gp_cost)
  const [reqLevel, setReqLevel] = useState<number | ''>(reward.required_level ?? 1)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || gpCost === '' || isPending) return

    startTransition(async () => {
      const res = await updateReward(reward.id, {
        title: title.trim(),
        description: description.trim(),
        gp_cost: Number(gpCost),
        required_level: reqLevel ? Number(reqLevel) : 1,
      })
      if (res.success) {
        showToast('Milestone updated')
        onDone()
      } else {
        showToast(res.error || 'Failed to update milestone')
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="col-span-full md:col-span-1 p-4 bg-surface-container-low rounded-lg border border-primary/40 flex flex-col gap-3"
    >
      <input
        type="text"
        placeholder="Milestone Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
        disabled={isPending}
        className="w-full bg-surface-dim border-none rounded p-2 text-on-surface text-sm focus:ring-1 focus:ring-primary outline-none"
      />
      <input
        type="text"
        placeholder="Description (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
        disabled={isPending}
        className="w-full bg-surface-dim border-none rounded p-2 text-on-surface text-sm focus:ring-1 focus:ring-primary outline-none"
      />
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="GP Cost"
          value={gpCost}
          onChange={e => setGpCost(e.target.value === '' ? '' : Number(e.target.value))}
          required
          min={0}
          disabled={isPending}
          className="w-1/2 bg-surface-dim border-none rounded p-2 text-on-surface text-sm focus:ring-1 focus:ring-primary outline-none"
        />
        <input
          type="number"
          placeholder="Req Lvl (opt)"
          value={reqLevel}
          onChange={e => setReqLevel(e.target.value === '' ? '' : Number(e.target.value))}
          min={1}
          disabled={isPending}
          className="w-1/2 bg-surface-dim border-none rounded p-2 text-on-surface text-sm focus:ring-1 focus:ring-primary outline-none"
        />
      </div>
      <div className="flex justify-end gap-2 mt-1">
        <button
          type="button"
          onClick={onDone}
          disabled={isPending}
          className="px-4 py-1.5 text-on-surface-variant hover:bg-surface-variant rounded font-label-mono text-xs uppercase"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending || !title.trim() || gpCost === ''}
          className="px-4 py-1.5 bg-primary text-on-primary rounded font-label-mono text-xs uppercase font-bold disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}

export default function MilestoneEditor({ rewards, claimedIds }: MilestoneEditorProps) {
  const { showToast } = useModals()
  const [isPending, startTransition] = useTransition()

  // Tracks which reward id is currently being edited (null = none)
  const [editingId, setEditingId] = useState<string | null>(null)

  // State for inline creation form
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newGpCost, setNewGpCost] = useState<number | ''>('')
  const [newReqLevel, setNewReqLevel] = useState<number | ''>('')

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim() || newGpCost === '' || isPending) return

    startTransition(async () => {
      const res = await createReward({
        title: newTitle.trim(),
        description: newDescription.trim(),
        gp_cost: Number(newGpCost),
        required_level: newReqLevel ? Number(newReqLevel) : 1,
      })

      if (res.success) {
        setNewTitle('')
        setNewDescription('')
        setNewGpCost('')
        setNewReqLevel('')
        setIsAdding(false)
        showToast('Milestone defined')
      } else {
        showToast(res.error || 'Error creating milestone')
      }
    })
  }

  function handleDelete(id: string) {
    if (isPending) return
    if (!confirm('Are you sure you want to delete this milestone? (It might break history if claimed).')) return

    startTransition(async () => {
      const res = await deleteReward(id)
      if (res.success) {
        showToast('Milestone deleted')
      } else {
        showToast(res.error || 'Error deleting milestone')
      }
    })
  }

  return (
    <section className="glass-panel rounded-xl p-6 relative overflow-hidden">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/30 relative z-10">
        <h3 className="font-body-md text-body-md font-bold text-on-background flex items-center uppercase tracking-wider">
          <span className="material-symbols-outlined mr-2 text-primary">workspace_premium</span>
          Reward Milestones
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {rewards.map(reward => {
          const isClaimed = claimedIds.has(reward.id)
          const isEditing = editingId === reward.id

          // Swap the card for the edit form when editing
          if (isEditing) {
            return (
              <MilestoneEditForm
                key={reward.id}
                reward={reward}
                onDone={() => setEditingId(null)}
              />
            )
          }

          return (
            <div
              key={reward.id}
              className="p-4 bg-surface-container-low rounded-lg border border-white/5 flex flex-col relative group"
            >
              {/* Action buttons — delete always visible on hover; edit only for unclaimed */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!isClaimed && (
                  <button
                    onClick={() => setEditingId(reward.id)}
                    disabled={isPending}
                    title="Edit milestone"
                    className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                )}
                <button
                  onClick={() => handleDelete(reward.id)}
                  disabled={isPending}
                  title="Delete milestone"
                  className="p-1 rounded text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>

              <div className="flex justify-between items-start mb-2 pr-16">
                <h4 className="font-body-md font-bold text-on-surface">{reward.title}</h4>
                <span className="font-label-mono text-primary font-bold text-sm shrink-0">{reward.gp_cost} GP</span>
              </div>
              {reward.description && (
                <p className="text-xs text-on-surface-variant mb-3 flex-1">{reward.description}</p>
              )}
              <div className="mt-auto flex items-center gap-2">
                <span className="font-label-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                  Req Lvl {reward.required_level}
                </span>
                {isClaimed && (
                  <span className="font-label-mono text-[10px] text-secondary uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    Claimed
                  </span>
                )}
              </div>
            </div>
          )
        })}

        {/* Inline Add Form */}
        {isAdding && (
          <form
            onSubmit={handleAdd}
            className="col-span-full md:col-span-1 p-4 bg-surface-container-low rounded-lg border border-primary/40 flex flex-col gap-3"
          >
            <input
              type="text"
              placeholder="Milestone Title"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              required
              disabled={isPending}
              className="w-full bg-surface-dim border-none rounded p-2 text-on-surface text-sm focus:ring-1 focus:ring-primary outline-none"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              disabled={isPending}
              className="w-full bg-surface-dim border-none rounded p-2 text-on-surface text-sm focus:ring-1 focus:ring-primary outline-none"
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="GP Cost"
                value={newGpCost}
                onChange={e => setNewGpCost(e.target.value === '' ? '' : Number(e.target.value))}
                required
                min={0}
                disabled={isPending}
                className="w-1/2 bg-surface-dim border-none rounded p-2 text-on-surface text-sm focus:ring-1 focus:ring-primary outline-none"
              />
              <input
                type="number"
                placeholder="Req Lvl (opt)"
                value={newReqLevel}
                onChange={e => setNewReqLevel(e.target.value === '' ? '' : Number(e.target.value))}
                min={1}
                disabled={isPending}
                className="w-1/2 bg-surface-dim border-none rounded p-2 text-on-surface text-sm focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-1.5 text-on-surface-variant hover:bg-surface-variant rounded font-label-mono text-xs uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !newTitle.trim() || newGpCost === ''}
                className="px-4 py-1.5 bg-primary text-on-primary rounded font-label-mono text-xs uppercase font-bold disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </form>
        )}
      </div>

      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="mt-4 w-full py-2 border border-dashed border-outline-variant text-on-surface-variant rounded-lg hover:border-primary hover:text-primary transition-colors flex items-center justify-center font-label-mono text-label-mono relative z-10"
        >
          <span className="material-symbols-outlined mr-2 text-sm">add</span>
          DEFINE NEW MILESTONE
        </button>
      )}
    </section>
  )
}
