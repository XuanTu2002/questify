'use client'

import { useEffect, useState } from 'react'

interface LevelUpOverlayProps {
  newLevel: number
  onClose: () => void
}

export default function LevelUpOverlay({ newLevel, onClose }: LevelUpOverlayProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Slight delay to allow CSS transitions to pop in
    requestAnimationFrame(() => setMounted(true))

    // Optional: play sound here if we had one
    const timer = setTimeout(() => {
      // Auto-close after 5 seconds if not clicked
      onClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md transition-opacity duration-500"
      style={{ opacity: mounted ? 1 : 0 }}
      onClick={onClose}
    >
      {/* Radiant glow behind */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Hex Badge (scaled up) */}
      <div
        className="relative w-48 h-48 mb-8 transform transition-transform duration-1000 ease-out"
        style={{ transform: mounted ? 'scale(1) rotate(0deg)' : 'scale(0.5) rotate(-30deg)' }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(242,202,80,0.8)]">
          <polygon
            points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
            fill="#051424"
            stroke="#f2ca50"
            strokeWidth="2"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-label-mono text-5xl text-primary font-bold drop-shadow-[0_0_10px_rgba(242,202,80,0.8)]"
          >
            {newLevel}
          </span>
        </div>
      </div>

      {/* Text Content */}
      <h2
        className="font-display-hero text-display-hero text-on-background tracking-tight mb-2 uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all duration-700 delay-300"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        }}
      >
        Level Up!
      </h2>
      <p
        className="font-label-mono text-label-mono text-primary uppercase tracking-widest mb-12 transition-all duration-700 delay-500"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        }}
      >
        You have reached Level {newLevel}
      </p>

      {/* CTA */}
      <button
        className="px-8 py-3 bg-primary text-on-primary font-bold text-lg rounded-full hover:shadow-[0_0_30px_rgba(242,202,80,0.8)] active:scale-95 transition-all transition-all duration-700 delay-700"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        }}
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
      >
        CONTINUE QUESTING
      </button>
    </div>
  )
}
