import type { LedgerEntry } from '@/lib/types'

interface LedgerRowProps {
  entry: LedgerEntry
}

export default function LedgerRow({ entry }: LedgerRowProps) {
  const isEarn = entry.type === 'earn'
  
  return (
    <div className="flex items-center gap-4 p-4 border-b border-outline-variant/20 hover:bg-surface-variant/30 transition-colors">
      {/* Icon */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
        isEarn 
          ? 'bg-secondary/10 text-secondary border border-secondary/20' 
          : 'bg-error/10 text-error border border-error/20'
      }`}>
        <span className="material-symbols-outlined text-lg">{entry.icon}</span>
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col">
        <span className="font-body-md text-on-surface leading-tight mb-0.5 line-clamp-1">{entry.title}</span>
        <span className="font-label-mono text-xs text-on-surface-variant uppercase tracking-wider">
          {isEarn ? 'Earned on' : 'Claimed on'} {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Amount */}
      <div className={`font-label-mono font-bold text-base shrink-0 ${
        isEarn ? 'text-secondary' : 'text-error'
      }`}>
        {isEarn ? '+' : '-'}{entry.amount} GP
      </div>
    </div>
  )
}
