'use client'

import { useEffect } from 'react'
import { applyDailyCheck } from '@/app/actions/dailyCheck'

export default function DailyCheckTrigger() {
  useEffect(() => {
    // Run the daily check lazily in the background when the app is opened
    // The server action is idempotent per day because it inserts daily_logs records
    applyDailyCheck().catch(console.error)
  }, [])

  return null
}
