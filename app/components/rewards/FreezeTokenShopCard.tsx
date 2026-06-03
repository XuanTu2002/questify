'use client'

import { useState } from 'react'
import { buyFreezeToken } from '@/app/actions/rewards'

interface FreezeTokenShopCardProps {
  freezeTokens: number
  gpBalance: number
}

export default function FreezeTokenShopCard({ freezeTokens, gpBalance }: FreezeTokenShopCardProps) {
  const [isBuying, setIsBuying] = useState(false)
  
  const canBuy = gpBalance >= 200 && freezeTokens < 3
  
  const handleBuy = async () => {
    if (!canBuy) return
    setIsBuying(true)
    
    const result = await buyFreezeToken()
    if (!result.success) {
      alert(result.error)
    }
    
    setIsBuying(false)
  }

  return (
    <div className="glass-panel p-6 rounded-2xl border-2 border-transparent transition-all flex flex-col justify-between h-full bg-surface-container-low/50 relative overflow-hidden">
      
      {/* Background Icon */}
      <div className="absolute -right-6 -bottom-6 text-[120px] material-symbols-outlined text-primary/5 select-none pointer-events-none">
        ac_unit
      </div>

      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="h-12 w-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">ac_unit</span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className={`h-2 w-6 rounded-full ${i <= freezeTokens ? 'bg-primary' : 'bg-surface-container-highest'}`}
              />
            ))}
          </div>
        </div>
        
        <h3 className="font-headline-sm text-on-surface mb-1">Streak Freeze Token</h3>
        <p className="font-body-md text-on-surface-variant line-clamp-3">
          Automatically protects your streak if you miss a day. You can hold up to 3 tokens at once.
        </p>
      </div>

      <div className="mt-6 pt-6 border-t border-outline-variant/30 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-secondary">
          <span className="material-symbols-outlined text-xl">monetization_on</span>
          <span className="font-label-mono font-bold tracking-widest text-lg">200</span>
        </div>
        
        <button 
          onClick={handleBuy}
          disabled={!canBuy || isBuying}
          className={`
            px-4 py-2 rounded-lg font-label-mono font-bold uppercase tracking-wider transition-all
            ${canBuy 
              ? 'bg-primary text-on-primary hover:bg-primary/90 active:scale-95' 
              : 'bg-surface-container text-on-surface-variant/50 cursor-not-allowed'}
          `}
        >
          {isBuying ? 'Buying...' : (freezeTokens >= 3 ? 'Max Reached' : 'Buy')}
        </button>
      </div>
    </div>
  )
}
