'use client'

import { useTransition, useState } from 'react'
import type { Config } from '@/lib/types'
import { updateConfig } from '@/app/actions/config'
import { useModals } from '@/components/modals/ModalsProvider'

interface ConfigPanelsProps {
  config: Config
}

export default function ConfigPanels({ config }: ConfigPanelsProps) {
  const { showToast } = useModals()
  const [isPending, startTransition] = useTransition()

  // Local state for optimistic UI on toggles
  const [missedPenalty, setMissedPenalty] = useState(config.penalize_missed_recurring)
  const [latePenalty, setLatePenalty] = useState(config.penalize_overdue_deadline)
  const [hardcoreMode, setHardcoreMode] = useState(false)
  
  // Local state for sliders
  const [streakBase, setStreakBase] = useState(config.min_daily_gp_for_streak)
  const [defaultGpValue, setDefaultGpValue] = useState(config.default_gp_value ?? 50)
  const [defaultGpStep, setDefaultGpStep] = useState(config.default_gp_step ?? 50)
  const [sliderTimeout, setSliderTimeout] = useState<NodeJS.Timeout | null>(null)

  function handleToggleChange(field: 'penalize_missed_recurring' | 'penalize_overdue_deadline', val: boolean) {
    if (field === 'penalize_missed_recurring') setMissedPenalty(val)
    if (field === 'penalize_overdue_deadline') setLatePenalty(val)

    startTransition(async () => {
      const res = await updateConfig({ [field]: val })
      if (res.success) {
        showToast('Settings saved')
      } else {
        showToast(res.error || 'Failed to save settings')
        // Revert on error
        if (field === 'penalize_missed_recurring') setMissedPenalty(!val)
        if (field === 'penalize_overdue_deadline') setLatePenalty(!val)
      }
    })
  }

  function handleSliderChange(field: 'min_daily_gp_for_streak' | 'default_gp_value' | 'default_gp_step', val: number) {
    if (field === 'min_daily_gp_for_streak') setStreakBase(val)
    if (field === 'default_gp_value') setDefaultGpValue(val)
    if (field === 'default_gp_step') setDefaultGpStep(val)

    // Debounce the save
    if (sliderTimeout) clearTimeout(sliderTimeout)
    const timeout = setTimeout(() => {
      startTransition(async () => {
        const res = await updateConfig({ [field]: val })
        if (res.success) showToast('Settings saved')
      })
    }, 1000)
    setSliderTimeout(timeout)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Penalty Protocols */}
      <section className="glass-panel rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-error/5 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
        
        <div className="flex items-center mb-6 pb-4 border-b border-error/20 relative z-10">
          <span className="material-symbols-outlined mr-2 text-error">skull</span>
          <h3 className="font-body-md text-body-md font-bold text-error uppercase tracking-wider">
            Penalty Protocols
          </h3>
        </div>

        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-body-md text-on-surface mb-0.5">HP Drain on Missed Daily</div>
              <div className="text-xs text-on-surface-variant">Penalize recurring tasks not done today.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={missedPenalty}
                onChange={e => handleToggleChange('penalize_missed_recurring', e.target.checked)}
                disabled={isPending}
              />
              <div className="w-11 h-6 bg-surface-dim rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-error"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-body-md text-on-surface mb-0.5">Overdue Deadline Penalty</div>
              <div className="text-xs text-on-surface-variant">Gradual XP drain for late tasks.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={latePenalty}
                onChange={e => handleToggleChange('penalize_overdue_deadline', e.target.checked)}
                disabled={isPending}
              />
              <div className="w-11 h-6 bg-surface-dim rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-error"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-body-md text-on-surface mb-0.5">Hardcore Mode</div>
              <div className="text-xs text-error/80">Extreme: longest streak reset to 0 on any miss.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={hardcoreMode}
                onChange={e => setHardcoreMode(e.target.checked)}
                disabled={isPending}
              />
              <div className="w-11 h-6 bg-surface-dim rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-error"></div>
            </label>
          </div>
        </div>
      </section>

      {/* Streak Multipliers */}
      <section className="glass-panel rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/5 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
        
        <div className="flex items-center mb-6 pb-4 border-b border-tertiary/20 relative z-10">
          <span className="material-symbols-outlined mr-2 text-tertiary">local_fire_department</span>
          <h3 className="font-body-md text-body-md font-bold text-tertiary uppercase tracking-wider">
            Streak Multipliers
          </h3>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="font-body-md text-on-surface">Base Streak Points</span>
              <span className="font-label-mono text-tertiary font-bold text-lg">{streakBase} GP</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="10"
              value={streakBase}
              onChange={e => handleSliderChange('min_daily_gp_for_streak', Number(e.target.value))}
              className="w-full h-2 bg-surface-dim rounded-lg appearance-none cursor-pointer accent-tertiary"
            />
            <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
              Sets the minimum GP needed daily to maintain streak. Multiplier increases by 1.1x every 7 consecutive days of logging.
            </p>
          </div>

          <div className="border-t border-white/10 pt-5">
            <div className="flex justify-between items-end mb-2">
              <span className="font-body-md text-on-surface">Default GP Value</span>
              <span className="font-label-mono text-primary font-bold text-lg">{defaultGpValue} GP</span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={defaultGpValue}
              onChange={e => handleSliderChange('default_gp_value', Number(e.target.value))}
              className="w-full h-2 bg-surface-dim rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
              Starting GP value when Forge Quest modal opens for a new task.
            </p>
          </div>

          <div className="border-t border-white/10 pt-5">
            <div className="flex justify-between items-end mb-2">
              <span className="font-body-md text-on-surface">GP Spinner Step</span>
              <span className="font-label-mono text-primary font-bold text-lg">+{defaultGpStep} GP</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="10"
              value={defaultGpStep}
              onChange={e => handleSliderChange('default_gp_step', Number(e.target.value))}
              className="w-full h-2 bg-surface-dim rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
              How much each arrow click increments/decrements GP in Forge Quest modal.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
