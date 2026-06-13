import type { Metadata } from 'next'
import { Space_Grotesk, Geist, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import DesktopSideNav from '@/components/nav/DesktopSideNav'
import MobileBottomNav from '@/components/nav/MobileBottomNav'
import ModalsProvider from '@/components/modals/ModalsProvider'
import DailyCheckTrigger from '@/components/shared/DailyCheckTrigger'
import { supabase, USER_ID } from '@/lib/supabase'
import type { Category } from '@/lib/types'

/* ─── Font declarations — mapped to CSS vars for Tailwind font-family tokens ─ */

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const geist = Geist({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-geist',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Questify — Gamified Productivity',
  description:
    'RPG-themed productivity app. Earn XP, collect Gold Points, complete quests, defeat boss fights, and claim real-life rewards.',
  keywords: ['productivity', 'gamification', 'RPG', 'tasks', 'quests'],
}

/** Fetches categories and forge-quest config defaults */
async function getLayoutData() {
  const [{ data: cats }, { data: cfg }] = await Promise.all([
    supabase.from('categories').select('*').eq('user_id', USER_ID).order('sort_order', { ascending: true }),
    supabase.from('config').select('default_gp_value, default_gp_step').eq('user_id', USER_ID).single(),
  ])
  return {
    categories: (cats as Category[]) ?? [],
    defaultGpValue: (cfg as any)?.default_gp_value ?? 50,
    defaultGpStep: (cfg as any)?.default_gp_step ?? 50,
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { categories, defaultGpValue, defaultGpStep } = await getLayoutData()

  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${geist.variable} ${jetbrainsMono.variable} h-full dark`}
    >
      {/* Material Symbols icon font — outlined style */}
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-background text-on-background antialiased flex flex-col md:flex-row">
        <DailyCheckTrigger />
        {/* ModalsProvider — wraps full app so any component can openForgeQuest() */}
        <ModalsProvider categories={categories} defaultGpValue={defaultGpValue} defaultGpStep={defaultGpStep}>
          {/* Desktop side nav — hidden on mobile */}
          <DesktopSideNav />

          {/* Page content area — offset by side nav on desktop */}
          <div className="flex-1 flex flex-col min-h-screen overflow-y-auto md:ml-64">
            {children}
          </div>

          {/* Mobile bottom nav — hidden on desktop */}
          <MobileBottomNav />
        </ModalsProvider>
      </body>
    </html>
  )
}
