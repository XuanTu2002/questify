import type { DailyLog } from '@/lib/types'

interface WeeklyOutputProps {
  logs: DailyLog[] // Should be the last 7 days, including today
}

export default function WeeklyOutput({ logs }: WeeklyOutputProps) {
  // Generate the last 7 days (YYYY-MM-DD)
  const today = new Date()
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })

  // Map logs to days
  const data = last7Days.map(dateStr => {
    const log = logs.find(l => l.log_date === dateStr)
    return {
      date: dateStr,
      dayName: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
      xp: log ? log.xp_earned : 0,
      isToday: dateStr === today.toISOString().slice(0, 10)
    }
  })

  // Find max XP for scaling
  const maxXP = Math.max(...data.map(d => d.xp), 100) // minimum scale 100

  return (
    <section className="glass-panel rounded-xl p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/30">
        <h3 className="font-body-md font-bold text-on-surface flex items-center uppercase tracking-wider">
          <span className="material-symbols-outlined mr-2 text-primary">bar_chart</span>
          Weekly Output
        </h3>
        <span className="font-label-mono text-xs text-on-surface-variant">XP Earned</span>
      </div>

      <div className="flex items-end justify-between h-40 gap-2">
        {data.map((day) => {
          const heightPct = Math.max((day.xp / maxXP) * 100, 2) // min 2% height for empty days
          return (
            <div key={day.date} className="flex flex-col items-center gap-2 flex-1 group">
              <div 
                className="w-full max-w-[40px] rounded-t-sm transition-all relative"
                style={{ 
                  height: `${heightPct}%`, 
                  backgroundColor: day.isToday ? '#f2ca50' : 'rgba(255, 255, 255, 0.1)',
                  boxShadow: day.isToday ? '0 0 10px rgba(242,202,80,0.5)' : 'none'
                }}
              >
                {/* Tooltip on hover */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest text-on-surface text-[10px] font-label-mono px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {day.xp} XP
                </div>
              </div>
              <span className={`font-label-mono text-[10px] uppercase tracking-wider ${day.isToday ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                {day.dayName}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
