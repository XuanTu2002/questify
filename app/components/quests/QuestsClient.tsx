'use client'

import { useEffect, useState } from 'react'
import TaskRow from './TaskRow'
import EpicQuestCard from './EpicQuestCard'
import BossFightCard from './BossFightCard'
import type { TaskWithCategory, QuestWithSteps } from '@/lib/types'
import { completeTask } from '@/app/actions/tasks'
import { useModals } from '@/components/modals/ModalsProvider'

interface QuestsClientProps {
  tasks: TaskWithCategory[]
  quests: QuestWithSteps[]
  bossFights: TaskWithCategory[]
}

export default function QuestsClient({ tasks, quests, bossFights }: QuestsClientProps) {
  // Determine default tab based on which has the most active items
  const activeTasksCount = tasks.filter(t => t.status === 'active').length
  const activeQuestsCount = quests.filter(q => q.status === 'active').length
  const activeBossCount = bossFights.filter(b => b.status === 'active').length

  const maxCount = Math.max(activeTasksCount, activeQuestsCount, activeBossCount)
  let defaultTab: 'tasks' | 'quests' | 'bosses' = 'tasks'
  if (maxCount === activeBossCount && maxCount > 0) defaultTab = 'bosses'
  else if (maxCount === activeQuestsCount && maxCount > 0) defaultTab = 'quests'

  const [activeTab, setActiveTab] = useState<'tasks' | 'quests' | 'bosses'>(defaultTab)

  // Modals for Boss Fights completion
  const { showToast, openLevelUp } = useModals()

  // Local optimistic lists — synced from server props when revalidation brings fresh data
  const [localTasks, setLocalTasks] = useState(tasks)
  const [localBosses, setLocalBosses] = useState(bossFights)

  useEffect(() => { setLocalTasks(tasks) }, [tasks])
  useEffect(() => { setLocalBosses(bossFights) }, [bossFights])

  function handleTaskCompleteOpt(taskId: string) {
    setLocalTasks(prev => prev.filter(t => t.id !== taskId))
  }

  function handleTaskDeleteOpt(taskId: string) {
    setLocalTasks(prev => prev.filter(t => t.id !== taskId))
  }

  async function handleBossComplete(taskId: string) {
    setLocalBosses(prev => prev.filter(b => b.id !== taskId))
    const res = await completeTask(taskId)
    if (res.success && res.data) {
      showToast(`+${res.data.gpAwarded} GP earned, +${res.data.xpAwarded} XP gained`)
      if (res.data.leveledUp) {
        openLevelUp(res.data.newLevel)
      }
    } else if (!res.success) {
      showToast(res.error ?? 'Failed to slay boss')
    }
  }

  return (
    <div className="w-full flex flex-col h-full">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Active Log</h1>
        <p className="font-label-mono text-label-mono text-on-surface-variant mt-1 uppercase tracking-wider">
          Campaigns & Objectives
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 p-1 bg-surface-container-high rounded-xl mb-6 w-full max-w-md mx-auto sm:mx-0">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 py-2 rounded-lg font-label-mono text-xs uppercase tracking-wider font-bold transition-all ${
            activeTab === 'tasks' 
              ? 'bg-surface-dim text-on-surface shadow-sm' 
              : 'text-on-surface-variant/70 hover:text-on-surface'
          }`}
        >
          Tasks
        </button>
        <button
          onClick={() => setActiveTab('quests')}
          className={`flex-1 py-2 rounded-lg font-label-mono text-xs uppercase tracking-wider font-bold transition-all ${
            activeTab === 'quests' 
              ? 'bg-surface-dim text-tertiary shadow-sm' 
              : 'text-on-surface-variant/70 hover:text-tertiary/70'
          }`}
        >
          Quests
        </button>
        <button
          onClick={() => setActiveTab('bosses')}
          className={`flex-1 py-2 rounded-lg font-label-mono text-xs uppercase tracking-wider font-bold transition-all ${
            activeTab === 'bosses' 
              ? 'bg-error/10 text-error shadow-sm border border-error/20' 
              : 'text-on-surface-variant/70 hover:text-error/70'
          }`}
        >
          Boss Fights
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 pb-24 md:pb-0">
        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
          <div className="glass-panel rounded-xl">
            {localTasks.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant font-label-mono">
                No active tasks. Forge a new quest to begin!
              </div>
            ) : (
              <div className="flex flex-col">
                {localTasks.map(task => (
                  <TaskRow key={task.id} task={task} onCompleteOpt={handleTaskCompleteOpt} onDeleteOpt={handleTaskDeleteOpt} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* QUESTS TAB */}
        {activeTab === 'quests' && (
          <div>
            {quests.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant font-label-mono glass-panel rounded-xl">
                No active epic quests.
              </div>
            ) : (
              quests.map(quest => (
                <EpicQuestCard key={quest.id} quest={quest} />
              ))
            )}
          </div>
        )}

        {/* BOSS FIGHTS TAB */}
        {activeTab === 'bosses' && (
          <div>
            {localBosses.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant font-label-mono glass-panel rounded-xl">
                No active boss fights. The realm is safe... for now.
              </div>
            ) : (
              localBosses.map(boss => (
                <BossFightCard 
                  key={boss.id} 
                  task={boss} 
                  onComplete={handleBossComplete}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
