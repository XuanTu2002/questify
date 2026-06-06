'use client'

import {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactNode,
} from 'react'
import ForgeQuestModal from './ForgeQuestModal'
import LevelUpOverlay from './LevelUpOverlay'
import type { Category, Task } from '@/lib/types'

/* ─── Context shape ──────────────────────────────────────────────────────── */

interface ModalsContextValue {
  /** Pass a task to open in edit mode; omit to open in create mode */
  openForgeQuest: (task?: Task) => void
  closeForgeQuest: () => void
  openLevelUp: (level: number) => void
  showToast: (message: string) => void
}

const ModalsContext = createContext<ModalsContextValue>({
  openForgeQuest: () => {},
  closeForgeQuest: () => {},
  openLevelUp: () => {},
  showToast: () => {},
})

export const useModals = () => useContext(ModalsContext)

/* ─── Provider ───────────────────────────────────────────────────────────── */

interface ModalsProviderProps {
  children: ReactNode
  /** Pre-fetched categories — passed from a server component in layout */
  categories: Category[]
}

/**
 * Root-level modal provider — wraps the entire app so any page or component
 * can call openForgeQuest() without prop-drilling.
 */
export default function ModalsProvider({ children, categories }: ModalsProviderProps) {
  const [forgeOpen, setForgeOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
  const [levelUpData, setLevelUpData] = useState<number | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const openForgeQuest = useCallback((task?: Task) => {
    setEditingTask(task)
    setForgeOpen(true)
  }, [])
  const closeForgeQuest = useCallback(() => {
    setForgeOpen(false)
    setEditingTask(undefined)
  }, [])

  const openLevelUp = useCallback((level: number) => setLevelUpData(level), [])
  const closeLevelUp = useCallback(() => setLevelUpData(null), [])

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }, [])

  return (
    <ModalsContext.Provider value={{ openForgeQuest, closeForgeQuest, openLevelUp, showToast }}>
      {children}
      {forgeOpen && (
        <ForgeQuestModal
          categories={categories}
          onClose={closeForgeQuest}
          initialTask={editingTask}
        />
      )}
      {levelUpData !== null && (
        <LevelUpOverlay
          newLevel={levelUpData}
          onClose={closeLevelUp}
        />
      )}
      {/* Simple Toast UI */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[150] px-4 py-2 bg-surface-container-highest border border-primary/30 text-on-surface rounded-full shadow-[0_5px_20px_rgba(0,0,0,0.5)] font-label-mono text-sm tracking-wider flex items-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <span className="material-symbols-outlined text-primary text-sm">star</span>
          {toastMessage}
        </div>
      )}
    </ModalsContext.Provider>
  )
}
