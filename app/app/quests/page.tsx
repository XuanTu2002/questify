import { supabase, USER_ID } from '@/lib/supabase'
import type { TaskWithCategory, QuestWithSteps } from '@/lib/types'
import QuestsClient from '@/components/quests/QuestsClient'

export const dynamic = 'force-dynamic'

async function getTasks(): Promise<TaskWithCategory[]> {
  const { data } = await supabase
    .from('tasks')
    .select('*, category:categories(*)')
    .eq('user_id', USER_ID)
    .eq('status', 'active')
    .eq('is_boss_fight', false)
    .is('quest_id', null)
    .order('created_at', { ascending: false })

  return (data as TaskWithCategory[]) ?? []
}

async function getBossFights(): Promise<TaskWithCategory[]> {
  const { data } = await supabase
    .from('tasks')
    .select('*, category:categories(*)')
    .eq('user_id', USER_ID)
    .eq('status', 'active')
    .eq('is_boss_fight', true)
    .is('quest_id', null)
    .order('created_at', { ascending: false })

  return (data as TaskWithCategory[]) ?? []
}

async function getQuests(): Promise<QuestWithSteps[]> {
  const { data: quests } = await supabase
    .from('quests')
    .select('*')
    .eq('user_id', USER_ID)
    // include active and recently completed (limit to active for now)
    // .in('status', ['active', 'completed', 'failed'])
    .order('created_at', { ascending: false })

  if (!quests || quests.length === 0) return []

  const questIds = quests.map(q => q.id)

  const { data: steps } = await supabase
    .from('tasks')
    .select('*, category:categories(*)')
    .eq('user_id', USER_ID)
    .in('quest_id', questIds)
    .order('step_order', { ascending: true })

  const typedSteps = (steps as TaskWithCategory[]) ?? []

  return quests.map(quest => {
    const questSteps = typedSteps.filter(s => s.quest_id === quest.id)
    const completedSteps = questSteps.filter(s => s.status === 'completed').length

    return {
      ...quest,
      steps: questSteps,
      completedSteps,
      totalSteps: questSteps.length,
    }
  })
}

export default async function QuestsPage() {
  const [tasks, quests, bossFights] = await Promise.all([
    getTasks(),
    getQuests(),
    getBossFights(),
  ])

  return (
    <main
      className="flex-1 px-gutter py-gutter space-y-stack-lg max-w-2xl w-full mx-auto md:mx-auto md:py-8"
      id="quests-main"
    >
      <QuestsClient tasks={tasks} quests={quests} bossFights={bossFights} />
    </main>
  )
}
