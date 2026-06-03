import type { DailyLog } from '@/lib/types'

interface ConsistencyHeatmapProps {
  logs: DailyLog[] // Should contain enough history (up to 56 days)
}

export default function ConsistencyHeatmap({ logs }: ConsistencyHeatmapProps) {
  // Generate the last 56 days (8 weeks * 7 days)
  const today = new Date()
  // Generate days so that today is the last element (bottom-right if we just flow column, but wait:
  // GitHub heatmap: top to bottom is Sun-Sat. The columns are weeks.
  // If we just generate last 56 days, today might be on a Wednesday.
  // To keep it simple and match standard arrays, we just flow columns from past to present.
  const daysCount = 56
  const lastDays = Array.from({ length: daysCount }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (daysCount - 1 - i))
    return d.toISOString().slice(0, 10)
  })

  // Map to heatmap data
  const data = lastDays.map(dateStr => {
    const log = logs.find(l => l.log_date === dateStr)
    const xp = log?.xp_earned || 0
    
    // 4 intensity buckets (purple ramp)
    let intensity = 0
    if (xp > 0) intensity = 1
    if (xp >= 50) intensity = 2
    if (xp >= 150) intensity = 3
    if (xp >= 300) intensity = 4

    return {
      date: dateStr,
      xp,
      intensity,
      isToday: dateStr === today.toISOString().slice(0, 10)
    }
  })

  const getBucketClasses = (intensity: number) => {
    switch (intensity) {
      case 4: return 'bg-[#c084fc] border-[#d8b4fe] shadow-[0_0_8px_rgba(192,132,252,0.6)]' // purple-400
      case 3: return 'bg-[#a855f7] border-[#c084fc] shadow-[0_0_6px_rgba(168,85,247,0.4)]' // purple-500
      case 2: return 'bg-[#7e22ce] border-[#9333ea]' // purple-700
      case 1: return 'bg-[#4c1d95] border-[#581c87]' // purple-900
      default: return 'bg-transparent border-outline-variant/30' // Empty
    }
  }

  return (
    <section className="glass-panel rounded-xl p-6 relative overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/30 shrink-0">
        <h3 className="font-body-md font-bold text-on-surface flex items-center uppercase tracking-wider">
          <span className="material-symbols-outlined mr-2 text-tertiary">calendar_view_month</span>
          Consistency Array
        </h3>
        <span className="font-label-mono text-xs text-on-surface-variant">Last 8 Weeks</span>
      </div>

      <div className="flex-1 flex items-center justify-center overflow-x-auto pb-2">
        {/* grid-flow-col and grid-rows-7 creates the week-by-week layout */}
        <div className="grid grid-rows-7 grid-flow-col gap-1.5 md:gap-2 w-max">
          {data.map(day => (
            <div 
              key={day.date}
              className={`w-4 h-4 md:w-5 md:h-5 rounded-sm border group relative transition-colors ${getBucketClasses(day.intensity)} ${day.isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-surface-container' : ''}`}
            >
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-surface-container-highest text-on-surface text-[10px] font-label-mono px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {day.date} • {day.xp} XP
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center text-[10px] md:text-xs font-label-mono text-on-surface-variant uppercase tracking-wider shrink-0">
        <span>Less</span>
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="w-3 h-3 rounded-sm border border-outline-variant/30 bg-transparent" />
          <div className="w-3 h-3 rounded-sm border border-[#581c87] bg-[#4c1d95]" />
          <div className="w-3 h-3 rounded-sm border border-[#9333ea] bg-[#7e22ce]" />
          <div className="w-3 h-3 rounded-sm border border-[#c084fc] bg-[#a855f7]" />
          <div className="w-3 h-3 rounded-sm border border-[#d8b4fe] bg-[#c084fc]" />
        </div>
        <span>More</span>
      </div>
    </section>
  )
}
