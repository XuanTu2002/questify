import 'server-only'
import { createClient } from '@supabase/supabase-js'

/* ─── Supabase server-side client — service role key, never exposed to client ─ */

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

/** Hardcoded single user ID for v1 — reads from env, falls back to 'lucas' */
export const USER_ID = process.env.USER_ID || 'lucas'
