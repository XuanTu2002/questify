import HexBadge from '@/components/shared/HexBadge'

interface TreasuryHeroProps {
  gpBalance: number
  level: number
  heroClass: string
}

export default function TreasuryHero({ gpBalance, level, heroClass }: TreasuryHeroProps) {
  return (
    <div className="glass-panel rounded-xl p-8 flex flex-col items-center text-center relative overflow-hidden mb-8">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />

      {/* Title */}
      <h2 className="font-label-mono text-primary uppercase tracking-[0.2em] text-xs mb-4 font-bold relative z-10">
        Available Bounty
      </h2>

      {/* Huge GP Number */}
      <div className="flex items-baseline justify-center gap-2 mb-8 relative z-10">
        <span className="font-display-hero text-6xl md:text-[80px] text-primary drop-shadow-[0_0_15px_rgba(242,202,80,0.5)] leading-none tracking-tighter">
          {gpBalance.toLocaleString()}
        </span>
        <span className="font-display-hero text-2xl md:text-3xl text-primary/70 font-bold mb-2">
          GP
        </span>
      </div>

      {/* User Level and Class */}
      <div className="flex flex-col items-center gap-2 relative z-10">
        <HexBadge level={level} size="lg" />
        <span className="font-label-mono text-on-surface-variant uppercase tracking-widest text-xs mt-1">
          {heroClass}
        </span>
      </div>
    </div>
  )
}
