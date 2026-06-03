import type { DailyLog } from '@/lib/types'

interface ConsistencyHeatmapProps {
  logs: DailyLog[] // Should be the last 30 days
}

export default function ConsistencyHeatmap({ logs }: ConsistencyHeatmapProps) {
  // Generate the last 30 days
  const today = new Date()
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (29 - i))
    return d.toISOString().slice(0, 10)
  })

  // Map to heatmap data
  const data = last30Days.map(dateStr => {
    const log = logs.find(l => l.log_date === dateStr)
    return {
      date: dateStr,
      streakKept: log ? log.streak_kept : false,
      isToday: dateStr === today.toISOString().slice(0, 10)
    }
  })

  // Split into rows of 10 for a nice 3x10 grid, or just wrap
  return (
    <section className="glass-panel rounded-xl p-6 relative overflow-hidden h-full">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/30">
        <h3 className="font-body-md font-bold text-on-surface flex items-center uppercase tracking-wider">
          <span className="material-symbols-outlined mr-2 text-secondary">calendar_view_month</span>
          Consistency Array
        </h3>
        <span className="font-label-mono text-xs text-on-surface-variant">Last 30 Days</span>
      </div>

      <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
        {data.map(day => (
          <div 
            key={day.date}
            className={`w-6 h-6 md:w-8 md:h-8 rounded-[4px] border group relative transition-colors ${
              day.streakKept 
                ? 'bg-secondary border-secondary shadow-[0_0_8px_rgba(68,226,205,0.4)]' 
                : 'bg-transparent border-outline-variant/40'
            } ${day.isToday && !day.streakKept ? 'border-primary border-dashed' : ''}`}
          >
            {/* Tooltip on hover */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest text-on-surface text-[10px] font-label-mono px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              {day.date} {day.streakKept ? '✅' : '❌'}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-between items-center text-xs font-label-mono text-on-surface-variant uppercase tracking-wider">
        <span>Missed</span>
        <div className="flex items-center gap-2">
          <span>Kept</span>
          <div className="w-3 h-3 bg-secondary rounded-[2px]" />
        </div>
      </div>
    </section>
  )
}
