'use client'

import { useState } from 'react'
import type { TaskWithCategory } from '@/lib/types'

interface BossFightCardProps {
  task: TaskWithCategory
  onAccept?: (taskId: string) => void
  onDecline?: (taskId: string) => void
  onComplete?: (taskId: string) => void
}

export default function BossFightCard({ task, onAccept, onDecline, onComplete }: BossFightCardProps) {
  // Simple local state for UI demonstration (accepted vs pending)
  const [accepted, setAccepted] = useState(task.status === 'active')

  return (
    <div className={`rounded-xl overflow-hidden mb-6 bg-surface-container-high transition-all ${
      accepted ? 'boss-fight-pulse' : 'border border-error/30 shadow-lg shadow-error/5'
    }`}>
      {/* Header Area */}
      <div className="p-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-error/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
        
        <div className="flex justify-between items-start relative z-10">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-full bg-error/20 border border-error/50 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,180,171,0.2)]">
              <span className="material-symbols-outlined text-3xl text-error">skull</span>
            </div>
            <div>
              <div className="font-label-mono text-error tracking-widest uppercase text-xs mb-1 font-bold">
                BOSS FIGHT
              </div>
              <h3 className="font-headline-lg-mobile text-on-surface tracking-tight leading-tight">{task.title}</h3>
            </div>
          </div>
        </div>

        {/* Rewards and Time */}
        <div className="mt-6 flex flex-wrap gap-4 items-center">
          <div className="flex flex-col">
            <span className="text-xs text-on-surface-variant font-label-mono uppercase tracking-wider mb-1">Rewards</span>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded font-label-mono text-sm text-primary bg-primary/10 border border-primary/30">
                +{task.gp_value} GP
              </span>
              <span className="px-3 py-1 rounded font-label-mono text-sm text-tertiary-fixed-dim bg-tertiary/10 border border-tertiary/30">
                +{task.xp_value} XP
              </span>
            </div>
          </div>
          
          <div className="flex flex-col ml-auto text-right">
            <span className="text-xs text-error/80 font-label-mono uppercase tracking-wider mb-1">Time Remaining</span>
            <span className="font-label-mono text-xl text-error font-bold">
              {task.deadline ? (
                // Simple placeholder, real app would compute delta
                new Date(task.deadline).getTime() > Date.now() ? '4H LEFT' : 'EXPIRED'
              ) : 'NO TIME LIMIT'}
            </span>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="bg-surface-dim border-t border-error/20 p-4 flex justify-end gap-3">
        {!accepted ? (
          <>
            <button 
              onClick={() => onDecline && onDecline(task.id)}
              className="px-6 py-2.5 rounded-lg font-label-mono text-sm uppercase tracking-wider text-on-surface-variant border border-outline-variant hover:bg-surface-variant transition-colors"
            >
              Decline
            </button>
            <button 
              onClick={() => {
                setAccepted(true)
                if (onAccept) onAccept(task.id)
              }}
              className="px-6 py-2.5 rounded-lg font-label-mono text-sm font-bold uppercase tracking-wider text-error bg-error/10 border border-error/40 hover:bg-error/20 hover:shadow-[0_0_15px_rgba(255,180,171,0.3)] transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">swords</span>
              Accept Challenge
            </button>
          </>
        ) : (
          <button 
            onClick={() => onComplete && onComplete(task.id)}
            className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-lg uppercase tracking-wider text-on-primary bg-primary hover:shadow-[0_0_20px_rgba(242,202,80,0.6)] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">check_circle</span>
            Slay Boss
          </button>
        )}
      </div>
    </div>
  )
}
