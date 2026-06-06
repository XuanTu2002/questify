'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useModals } from '@/components/modals/ModalsProvider'

/* ─── Nav item definition ─────────────────────────────────────────────────── */

interface NavItem {
  href: string
  icon: string
  label: string
  /** v2 features are rendered greyed-out / non-interactive */
  comingSoon?: boolean
}

/** Primary nav routes — always visible and functional */
const primaryItems: NavItem[] = [
  { href: '/', icon: 'home', label: 'Home' },
  { href: '/quests', icon: 'swords', label: 'Active Log' },
  { href: '/rewards', icon: 'workspace_premium', label: 'Treasury' },
  { href: '/stats', icon: 'monitoring', label: 'Analytics' },
  { href: '/config', icon: 'manufacturing', label: 'Codex' },
]

/** v2 backlog items — shown for visual fidelity but non-interactive */
const v2Items: NavItem[] = [
  { href: '/coming-soon', icon: 'person', label: 'Character', comingSoon: true },
  { href: '/coming-soon', icon: 'backpack', label: 'Inventory', comingSoon: true },
  { href: '/coming-soon', icon: 'account_tree', label: 'Skill Tree', comingSoon: true },
  { href: '/coming-soon', icon: 'groups', label: 'Guilds', comingSoon: true },
]

/* ─── Desktop Side Nav component ─────────────────────────────────────────── */

export default function DesktopSideNav() {
  const pathname = usePathname()
  const { openForgeQuest } = useModals()

  return (
    <nav
      className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 z-40"
      style={{ background: '#1c2b3c', borderRight: '1px solid #4d4635' }}
      aria-label="Desktop navigation"
    >
      {/* ── Logo ── */}
      <div className="px-6 py-6 border-b border-white/10">
        <span
          className="text-primary font-display-hero text-headline-lg tracking-tight"
          style={{ textShadow: '0 0 20px rgba(242, 202, 80, 0.4)' }}
        >
          Questify
        </span>
        <p className="font-label-mono text-label-mono text-on-surface-variant mt-1">
          Shadow Walker
        </p>
      </div>

      {/* ── Primary navigation ── */}
      <ul className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
        {primaryItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                className={[
                  'flex items-center gap-3 px-4 py-3 rounded-xl font-label-mono text-label-mono uppercase tracking-wider transition-all duration-200',
                  isActive
                    ? 'bg-primary/15 text-primary neon-border-active border'
                    : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-background border border-transparent',
                ].join(' ')}
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {/* Gold indicator bar on active item */}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(242,202,80,0.8)]" />
                )}
              </Link>
            </li>
          )
        })}

        {/* ── Divider ── */}
        <li className="my-2">
          <div className="divider-beam" />
        </li>

        {/* ── v2 coming-soon items ── */}
        {v2Items.map((item) => (
          <li key={item.label}>
            <span
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-label-mono text-label-mono uppercase tracking-wider text-on-surface-variant/30 cursor-not-allowed select-none"
              title="Coming soon"
              aria-disabled="true"
            >
              <span className="material-symbols-outlined text-xl opacity-30">
                {item.icon}
              </span>
              <span>{item.label}</span>
              <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded border border-outline-variant/40 text-outline tracking-widest">
                SOON
              </span>
            </span>
          </li>
        ))}
      </ul>

      {/* ── Footer — Forge Quest CTA + v2 placeholder ── */}
      <div className="px-4 pb-6 pt-4 border-t border-white/10 flex flex-col gap-3">
        {/* Primary CTA — opens ForgeQuestModal */}
        <button
          id="desktop-nav-forge-quest"
          onClick={() => openForgeQuest()}
          className="w-full py-2.5 px-4 rounded-xl font-label-mono text-label-mono uppercase tracking-widest bg-primary/15 text-primary border border-primary/40 hover:bg-primary/25 hover:border-primary/70 hover:shadow-[0_0_15px_rgba(242,202,80,0.2)] transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add_circle</span>
          Forge Quest
        </button>
        {/* v2 placeholder — non-interactive */}
        <button
          className="w-full py-2.5 px-4 rounded-xl font-label-mono text-label-mono uppercase tracking-widest text-on-surface-variant/30 border border-outline-variant/20 cursor-not-allowed"
          disabled
          title="Coming in v2"
        >
          Upgrade to Legend
        </button>
      </div>
    </nav>
  )
}
