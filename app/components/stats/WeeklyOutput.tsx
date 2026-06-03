'use client'

import type { DailyLog } from '@/lib/types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'

interface WeeklyOutputProps {
  logs: DailyLog[] // Should be the last 7 days, including today
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-container-highest text-on-surface text-[10px] md:text-xs font-label-mono px-3 py-2 rounded-lg border border-outline-variant/30 shadow-lg">
        <p className="font-bold mb-1 text-on-surface-variant uppercase tracking-wider">{label}</p>
        <p className="text-primary font-bold">{payload[0].value} XP</p>
      </div>
    )
  }
  return null
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
      dayName: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      xp: log ? log.xp_earned : 0,
      isToday: dateStr === today.toISOString().slice(0, 10)
    }
  })

  return (
    <section className="glass-panel rounded-xl p-6 relative overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/30 shrink-0">
        <h3 className="font-body-md font-bold text-on-surface flex items-center uppercase tracking-wider">
          <span className="material-symbols-outlined mr-2 text-primary">bar_chart</span>
          Weekly Output
        </h3>
        <span className="font-label-mono text-xs text-on-surface-variant">XP Earned</span>
      </div>

      <div className="flex-1 w-full min-h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComponentTransfer in="blur" result="glow">
                  <feFuncA type="linear" slope="0.5" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <XAxis 
              dataKey="dayName" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#99907c', fontSize: 10, fontFamily: 'var(--font-jetbrains-mono), monospace' }}
              dy={10}
            />
            <YAxis hide={true} />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} 
            />
            <Bar dataKey="xp" radius={[4, 4, 0, 0]} minPointSize={4}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isToday ? '#f2ca50' : 'rgba(255, 255, 255, 0.1)'} 
                  filter={entry.isToday ? 'url(#goldGlow)' : undefined}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
