'use client'

import { useState, useTransition } from 'react'
import type { Reward } from '@/lib/types'
import { createReward, deleteReward, updateReward } from '@/app/actions/config'
import { useModals } from '@/components/modals/ModalsProvider'

interface ShopItemEditorProps {
  rewards: Reward[]
}

const TIER_LABELS = { low: 'Common', medium: 'Rare', high: 'Epic' } as const
const TIER_COLORS = {
  low: 'text-secondary',
  medium: 'text-primary',
  high: 'text-error',
} as const

/** Inline edit form embedded in each item card */
function ItemEditForm({
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
  const [tier, setTier] = useState<'low' | 'medium' | 'high'>(reward.tier)
  const [isRepeatable, setIsRepeatable] = useState(reward.is_repeatable)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || gpCost === '' || isPending) return

    startTransition(async () => {
      const res = await updateReward(reward.id, {
        title: title.trim(),
        description: description.trim(),
        gp_cost: Number(gpCost),
        required_level: reqLevel ? Number(reqLevel) : 1,
        tier,
        is_repeatable: isRepeatable,
      })
      if (res.success) {
        showToast('Item updated')
        onDone()
      } else {
        showToast(res.error || 'Failed to update item')
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
        placeholder="Item Name"
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
          placeholder="Req Lvl"
          value={reqLevel}
          onChange={e => setReqLevel(e.target.value === '' ? '' : Number(e.target.value))}
          min={1}
          disabled={isPending}
          className="w-1/2 bg-surface-dim border-none rounded p-2 text-on-surface text-sm focus:ring-1 focus:ring-primary outline-none"
        />
      </div>
      <div className="flex gap-2 items-center">
        <select
          value={tier}
          onChange={e => setTier(e.target.value as 'low' | 'medium' | 'high')}
          disabled={isPending}
          className="flex-1 bg-surface-dim border-none rounded p-2 text-on-surface text-sm focus:ring-1 focus:ring-primary outline-none"
        >
          <option value="low">🟢 Common (Low dopamine)</option>
          <option value="medium">🟡 Rare (Medium dopamine)</option>
          <option value="high">🔴 Epic (High dopamine)</option>
        </select>
        <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={isRepeatable}
            onChange={e => setIsRepeatable(e.target.checked)}
            disabled={isPending}
            className="accent-primary"
          />
          <span className="font-label-mono text-xs text-on-surface-variant uppercase">Repeatable</span>
        </label>
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

export default function ShopItemEditor({ rewards }: ShopItemEditorProps) {
  const { showToast } = useModals()
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  // New item form state
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newGpCost, setNewGpCost] = useState<number | ''>('')
  const [newReqLevel, setNewReqLevel] = useState<number | ''>('')
  const [newTier, setNewTier] = useState<'low' | 'medium' | 'high'>('medium')
  const [newIsRepeatable, setNewIsRepeatable] = useState(true)

  // System items are not editable in this panel
  const userItems = rewards.filter(r => !r.is_system)

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim() || newGpCost === '' || isPending) return

    startTransition(async () => {
      const res = await createReward({
        title: newTitle.trim(),
        description: newDescription.trim(),
        gp_cost: Number(newGpCost),
        required_level: newReqLevel ? Number(newReqLevel) : 1,
        tier: newTier,
        is_repeatable: newIsRepeatable,
      })

      if (res.success) {
        setNewTitle('')
        setNewDescription('')
        setNewGpCost('')
        setNewReqLevel('')
        setNewTier('medium')
        setNewIsRepeatable(true)
        setIsAdding(false)
        showToast('Shop item created')
      } else {
        showToast(res.error || 'Error creating item')
      }
    })
  }

  function handleDelete(id: string) {
    if (isPending) return
    if (!confirm('Delete this shop item?')) return

    startTransition(async () => {
      const res = await deleteReward(id)
      if (res.success) {
        showToast('Item deleted')
      } else {
        showToast(res.error || 'Error deleting item')
      }
    })
  }

  return (
    <section className="glass-panel rounded-xl p-6 relative overflow-hidden">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/30 relative z-10">
        <h3 className="font-body-md text-body-md font-bold text-on-background flex items-center uppercase tracking-wider">
          <span className="material-symbols-outlined mr-2 text-primary">storefront</span>
          Shop Items
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {userItems.map(reward => {
          if (editingId === reward.id) {
            return (
              <ItemEditForm
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
              {/* Action buttons — visible on hover */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingId(reward.id)}
                  disabled={isPending}
                  title="Edit item"
                  className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
                <button
                  onClick={() => handleDelete(reward.id)}
                  disabled={isPending}
                  title="Delete item"
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
              <div className="mt-auto flex items-center gap-2 flex-wrap">
                <span className={`font-label-mono text-[10px] uppercase tracking-wider ${TIER_COLORS[reward.tier]}`}>
                  {TIER_LABELS[reward.tier]}
                </span>
                <span className="font-label-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                  {reward.is_repeatable ? '↻ Repeatable' : '① One-time'}
                </span>
                {reward.required_level > 1 && (
                  <span className="font-label-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                    Req Lvl {reward.required_level}
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
              placeholder="Item Name"
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
                placeholder="Req Lvl"
                value={newReqLevel}
                onChange={e => setNewReqLevel(e.target.value === '' ? '' : Number(e.target.value))}
                min={1}
                disabled={isPending}
                className="w-1/2 bg-surface-dim border-none rounded p-2 text-on-surface text-sm focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div className="flex gap-2 items-center">
              <select
                value={newTier}
                onChange={e => setNewTier(e.target.value as 'low' | 'medium' | 'high')}
                disabled={isPending}
                className="flex-1 bg-surface-dim border-none rounded p-2 text-on-surface text-sm focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="low">🟢 Common (Low dopamine)</option>
                <option value="medium">🟡 Rare (Medium dopamine)</option>
                <option value="high">🔴 Epic (High dopamine)</option>
              </select>
              <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={newIsRepeatable}
                  onChange={e => setNewIsRepeatable(e.target.checked)}
                  disabled={isPending}
                  className="accent-primary"
                />
                <span className="font-label-mono text-xs text-on-surface-variant uppercase">Repeatable</span>
              </label>
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
          ADD NEW SHOP ITEM
        </button>
      )}
    </section>
  )
}
