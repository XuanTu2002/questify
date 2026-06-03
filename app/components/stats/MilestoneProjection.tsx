import type { Reward, DailyLog, UserStats } from '@/lib/types'

interface MilestoneProjectionProps {
  logs: DailyLog[] // Last 7 days
  rewards: Reward[]
  stats: UserStats
}

export default function MilestoneProjection({ logs, rewards, stats }: MilestoneProjectionProps) {
  // Find the next locked milestone based on GP required
  // (Filter out ones we already have enough GP for, or ones we don't have level for? Let's just project based on GP cost)
  const gpNeededRewards = rewards.filter(r => r.gp_cost > stats.gp_balance)
  const nextMilestone = gpNeededRewards.sort((a, b) => a.gp_cost - b.gp_cost)[0]

  // Calculate avg GP/day over the last 7 days
  const totalGP7Days = logs.reduce((sum, log) => sum + log.gp_earned, 0)
  // Ensure we don't divide by zero if no logs
  const avgGPPDay = logs.length > 0 ? totalGP7Days / 7 : 0

  let daysUntil = -1
  let targetDateStr = 'Unknown'

  if (nextMilestone && avgGPPDay > 0) {
    const gpShortfall = nextMilestone.gp_cost - stats.gp_balance
    daysUntil = Math.ceil(gpShortfall / avgGPPDay)
    
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + daysUntil)
    targetDateStr = targetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <section className="glass-panel rounded-xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/30 relative z-10">
        <h3 className="font-body-md font-bold text-on-surface flex items-center uppercase tracking-wider">
          <span className="material-symbols-outlined mr-2 text-secondary">explore</span>
          Milestone Projection
        </h3>
      </div>

      <div className="relative z-10">
        {!nextMilestone ? (
          <div className="text-sm font-label-mono text-on-surface-variant text-center py-4">
            No future milestones defined. You've reached the peak!
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <div className="font-label-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
                Next Target
              </div>
              <div className="font-headline-lg-mobile text-on-surface">{nextMilestone.title}</div>
              <div className="font-label-mono text-sm text-primary mt-1">{nextMilestone.gp_cost} GP Needed</div>
            </div>

            <div className="bg-surface-container-low p-4 rounded-lg border border-white/5 flex items-center justify-between">
              <div>
                <div className="font-label-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
                  7-Day Avg Velocity
                </div>
                <div className="font-label-mono text-secondary text-lg">{Math.round(avgGPPDay)} GP / Day</div>
              </div>
              <div className="text-right">
                <div className="font-label-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
                  Est. Acquisition
                </div>
                <div className="font-body-md font-bold text-on-surface">
                  {daysUntil > 0 ? `${daysUntil} Days` : 'Stagnant'}
                </div>
                {daysUntil > 0 && (
                  <div className="font-label-mono text-[10px] text-on-surface-variant mt-1">
                    {targetDateStr}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
