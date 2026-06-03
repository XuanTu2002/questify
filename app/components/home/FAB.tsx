'use client'

import { useModals } from '@/components/modals/ModalsProvider'

/**
 * Floating action button — visible only on mobile, anchored above the bottom nav.
 * Calls openForgeQuest() from the global ModalsProvider context.
 */
export default function FAB() {
  const { openForgeQuest } = useModals()

  return (
    <button
      id="fab-forge-quest"
      aria-label="Forge new quest"
      onClick={openForgeQuest}
      className="fixed bottom-24 right-4 w-14 h-14 bg-primary text-on-primary rounded-full shadow-[0_0_20px_rgba(242,202,80,0.6)] flex items-center justify-center z-40 hover:scale-105 active:scale-95 transition-all md:hidden"
    >
      <span className="material-symbols-outlined text-3xl font-bold">add</span>
    </button>
  )
}
