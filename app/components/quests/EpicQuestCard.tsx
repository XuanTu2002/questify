import type { QuestWithSteps } from '@/lib/types'

interface EpicQuestCardProps {
  quest: QuestWithSteps
}

export default function EpicQuestCard({ quest }: EpicQuestCardProps) {
  const isComplete = quest.status === 'completed'
  const isFailed = quest.status === 'failed'

  return (
    <div className={`glass-panel rounded-xl overflow-hidden mb-4 transition-all ${
      isComplete ? 'border-primary shadow-[0_0_15px_rgba(242,202,80,0.15)]' : 
      isFailed ? 'border-error shadow-[0_0_15px_rgba(255,180,171,0.15)]' : ''
    }`}>
      {/* Complete/Failed Banner */}
      {isComplete && (
        <div className="bg-primary/10 border-b border-primary/30 px-4 py-2 flex justify-between items-center">
          <span className="font-label-mono text-primary font-bold tracking-widest uppercase text-xs">
            QUEST COMPLETE!
          </span>
          <div className="flex gap-2">
            <span className="px-2 py-0.5 rounded font-label-mono text-[10px] text-primary bg-primary/20">+{quest.bonus_gp} GP</span>
            <span className="px-2 py-0.5 rounded font-label-mono text-[10px] text-tertiary-fixed-dim bg-tertiary/20">+{quest.bonus_xp} XP</span>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
              isComplete ? 'bg-primary/20 text-primary' : 'bg-tertiary/20 text-tertiary'
            }`}>
              <span className="material-symbols-outlined text-2xl">{quest.icon || 'menu_book'}</span>
            </div>
            <div>
              <div className="font-label-mono text-[10px] tracking-widest uppercase mb-1" style={{ color: isComplete ? '#f2ca50' : '#44e2cd' }}>
                EPIC CHAIN QUEST
              </div>
              <h3 className="font-headline-lg-mobile text-on-surface tracking-tight mb-1">{quest.title}</h3>
              {quest.description && (
                <p className="text-sm text-on-surface-variant max-w-md">{quest.description}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end text-right hidden sm:flex">
            <span className="font-label-mono text-primary font-bold text-sm tracking-wider">+{quest.bonus_xp} XP</span>
            <span className="font-label-mono text-error/80 text-xs mt-1">-500 if failed</span>
          </div>
        </div>

        {/* Steps List */}
        <div className="mt-6 space-y-3">
          {quest.steps.map((step, idx) => {
            const stepIsComplete = step.status === 'completed'
            const stepIsActive = step.status === 'active' && idx === quest.completedSteps
            const stepIsFuture = !stepIsComplete && !stepIsActive

            return (
              <div key={step.id} className="flex items-center gap-3">
                {stepIsComplete ? (
                  <div className="w-6 h-6 rounded-full bg-secondary/20 text-secondary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </div>
                ) : stepIsFuture ? (
                  <div className="w-6 h-6 rounded-full border border-outline-variant text-outline-variant flex items-center justify-center shrink-0 font-label-mono text-[10px]">
                    {idx + 1}
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-primary text-primary flex items-center justify-center shrink-0 font-label-mono text-[10px] bg-primary/10">
                    {idx + 1}
                  </div>
                )}
                
                <span className={`font-body-md text-sm ${
                  stepIsComplete ? 'text-on-surface-variant/50 line-through' :
                  stepIsFuture ? 'text-on-surface-variant/70' : 'text-on-surface font-bold'
                }`}>
                  {step.title}
                </span>
                
                {stepIsActive && (
                  <span className="ml-auto font-label-mono text-[10px] text-primary px-2 py-0.5 rounded border border-primary/30 bg-primary/10">
                    ACTIVE
                  </span>
                )}
              </div>
            )
          })}
        </div>
        
        {/* Progress bar for currently active quest */}
        {!isComplete && !isFailed && quest.totalSteps > 0 && (
          <div className="mt-6">
            <div className="flex justify-between font-label-mono text-xs mb-2">
              <span className="text-on-surface-variant">Step {quest.completedSteps + 1} of {quest.totalSteps}</span>
              <span className="text-tertiary-fixed-dim">{Math.round((quest.completedSteps / quest.totalSteps) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]">
              <div 
                className="h-full bg-gradient-to-r from-[#A855F7] to-[#d09eff] shadow-[0_0_10px_rgba(208,158,255,0.5)] transition-all duration-500" 
                style={{ width: `${Math.round((quest.completedSteps / quest.totalSteps) * 100)}%` }} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
