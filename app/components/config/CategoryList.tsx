'use client'

import { useState, useTransition } from 'react'
import type { Category } from '@/lib/types'
import { CATEGORY_COLOR_MAP } from '@/lib/constants'
import { createCategory, deleteCategory } from '@/app/actions/config'
import { useModals } from '@/components/modals/ModalsProvider'

interface CategoryListProps {
  categories: Category[]
}

const colorOptions = [
  { token: 'error', hex: CATEGORY_COLOR_MAP['error'] },
  { token: 'secondary', hex: CATEGORY_COLOR_MAP['secondary'] },
  { token: 'tertiary', hex: CATEGORY_COLOR_MAP['tertiary'] },
  { token: 'primary', hex: CATEGORY_COLOR_MAP['primary'] },
  { token: 'outline', hex: CATEGORY_COLOR_MAP['outline'] },
]

export default function CategoryList({ categories }: CategoryListProps) {
  const { showToast } = useModals()
  const [isPending, startTransition] = useTransition()
  
  // State for inline creation form
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('secondary')

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim() || isPending) return

    startTransition(async () => {
      const res = await createCategory({ name: newName.trim(), color_token: newColor })
      if (res.success) {
        setNewName('')
        setIsAdding(false)
        showToast('Category created')
      } else {
        showToast(res.error || 'Error creating category')
      }
    })
  }

  function handleDelete(id: string) {
    if (isPending) return
    if (!confirm('Are you sure? Tasks using this category might lose their styling.')) return

    startTransition(async () => {
      const res = await deleteCategory(id)
      if (res.success) {
        showToast('Category deleted')
      } else {
        showToast(res.error || 'Error deleting category')
      }
    })
  }

  return (
    <section className="glass-panel rounded-xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
      
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/30 relative z-10">
        <h3 className="font-body-md text-body-md font-bold text-on-background flex items-center uppercase tracking-wider">
          <span className="material-symbols-outlined mr-2 text-secondary">category</span>
          Categories
        </h3>
      </div>

      <ul className="space-y-3 relative z-10">
        {categories.map(cat => {
          const colorHex = CATEGORY_COLOR_MAP[cat.color_token] ?? '#99907c'
          return (
            <li 
              key={cat.id} 
              className="flex justify-between items-center p-3 bg-surface-container-low rounded-lg border border-white/5 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ backgroundColor: colorHex }} />
                <span className="font-body-md text-on-surface">{cat.name}</span>
              </div>
              <button 
                onClick={() => handleDelete(cat.id)}
                disabled={isPending}
                className="text-on-surface-variant hover:text-error transition-colors disabled:opacity-50"
                title="Delete category"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </li>
          )
        })}

        {/* Inline Add Form */}
        {isAdding && (
          <li className="p-3 bg-surface-container-low rounded-lg border border-primary/40">
            <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                autoFocus
                placeholder="Category Name" 
                value={newName}
                onChange={e => setNewName(e.target.value)}
                disabled={isPending}
                className="flex-1 bg-surface-dim border-none rounded p-2 text-on-surface text-sm focus:ring-1 focus:ring-primary outline-none"
              />
              <div className="flex gap-2 items-center">
                {colorOptions.map(opt => (
                  <button
                    key={opt.token}
                    type="button"
                    onClick={() => setNewColor(opt.token)}
                    className={`w-6 h-6 rounded-full transition-transform ${newColor === opt.token ? 'scale-125 ring-2 ring-primary ring-offset-2 ring-offset-surface-container-low' : 'hover:scale-110'}`}
                    style={{ backgroundColor: opt.hex }}
                    aria-label={`Select color ${opt.token}`}
                  />
                ))}
              </div>
              <div className="flex gap-1 ml-auto">
                <button type="button" onClick={() => setIsAdding(false)} className="p-1.5 text-on-surface-variant hover:text-on-surface rounded">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
                <button type="submit" disabled={isPending || !newName.trim()} className="p-1.5 text-primary hover:bg-primary/10 rounded disabled:opacity-50">
                  <span className="material-symbols-outlined text-sm">check</span>
                </button>
              </div>
            </form>
          </li>
        )}
      </ul>

      {!isAdding && (
        <button 
          onClick={() => setIsAdding(true)}
          className="mt-4 w-full py-2 border border-dashed border-outline-variant text-on-surface-variant rounded-lg hover:border-primary hover:text-primary transition-colors flex items-center justify-center font-label-mono text-label-mono relative z-10"
        >
          <span className="material-symbols-outlined mr-2 text-sm">add</span> 
          ADD NEW CATEGORY
        </button>
      )}
    </section>
  )
}
