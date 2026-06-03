'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/* ─── Mobile bottom nav — exactly 5 items per spec ───────────────────────── */

interface MobileNavItem {
  href: string
  icon: string
  label: string
}

const mobileItems: MobileNavItem[] = [
  { href: '/', icon: 'home', label: 'Home' },
  { href: '/quests', icon: 'swords', label: 'Quests' },
  { href: '/rewards', icon: 'workspace_premium', label: 'Rewards' },
  { href: '/stats', icon: 'monitoring', label: 'Stats' },
  { href: '/config', icon: 'manufacturing', label: 'Config' },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 px-4 rounded-t-xl border-t border-outline-variant backdrop-blur-xl"
      style={{ background: 'rgba(18, 33, 49, 0.85)' }}
      aria-label="Mobile navigation"
    >
      {mobileItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            id={`mobile-nav-${item.label.toLowerCase()}`}
            className={[
              'flex flex-col items-center justify-center gap-0.5 relative transition-all duration-200',
              isActive
                ? 'text-primary scale-110'
                : 'text-on-surface-variant/70 hover:text-primary',
            ].join(' ')}
            aria-current={isActive ? 'page' : undefined}
          >
            {/* Active indicator — gold underline glow bar */}
            {isActive && (
              <span
                className="absolute -top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary"
                style={{ boxShadow: '0 0 8px rgba(242, 202, 80, 0.8)' }}
              />
            )}

            <span
              className="material-symbols-outlined text-2xl"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span
              className="font-label-mono text-label-mono leading-none"
              style={{ fontSize: '10px' }}
            >
              {isActive ? <strong>{item.label}</strong> : item.label}
            </span>

            {/* Drop shadow glow on active icon */}
            {isActive && (
              <span
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{ filter: 'drop-shadow(0 0 8px rgba(242, 202, 80, 0.6))' }}
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
