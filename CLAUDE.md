# Questify — Claude Code Project Brief

> Personal learning gamification web app. RPG-themed productivity tool where the
> user earns XP, gold points (GP), completes quests, defeats boss fights, and
> claims real-life rewards. Single-user, mobile-first, deployed on Vercel with
> Supabase as the backend.

---

## 1. Project Overview

**Name:** Questify
**Owner:** Lucas (single user — no auth in v1, all data scoped to a hardcoded `user_id`)
**Stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase (Postgres)
**Deploy:** Vercel for the frontend, Supabase hosted for the DB.

**Aesthetic:** "Glassmorphic-Brutalist" — dark abyssal background, legendary gold accents, teal for success, mystic purple for quests, corruption red for danger. Translucent glass panels with neon borders on active states.

**The product loop:**
1. User adds Quests (tasks) with self-defined GP + XP value and category.
2. Completing a Quest → +GP, +XP, streak extended.
3. XP accumulates into Levels (never decreases).
4. GP is currency — spent to claim real-life rewards or buy streak freezes.
5. Quests can chain into Epic Quests (multi-step) ending in a Boss Fight.
6. Missing recurring Quests or deadlines drains GP (XP untouched).
7. Stats page shows weekly output, intensity heatmap, skill distribution, and milestone projection.

---

## 2. Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 14, App Router | TypeScript, React Server Components where it helps |
| Styling | Tailwind CSS | Custom theme from `DESIGN.md` |
| Fonts | Space Grotesk + Geist + JetBrains Mono | Loaded via `next/font/google` |
| Icons | Material Symbols Outlined | Google Fonts CSS link in `app/layout.tsx` |
| Database | Supabase (Postgres) | Direct from server components using `@supabase/supabase-js` |
| Auth | None in v1 | Hardcode `USER_ID="lucas"` in env. Architect schema for multi-user. |
| State | React Server Components + Server Actions | Minimize client-side state; use `useState` only for ephemeral UI (modal open, tab selected) |
| Charts | Recharts | For Weekly Output bar chart, Skill Distribution donut, all-time XP line |
| Deploy | Vercel | Connect repo, set env vars |

**No:** Redux, Zustand, tRPC, ORM (Prisma/Drizzle). Keep it lean — Supabase JS client is enough.

---

## 3. Existing Assets (Đừng đụng vào trừ khi tham khảo)

Trong repo có:
- `DESIGN.md` — design tokens (colors, typography, spacing) generated from Stitch
- `code.html` — full Stitch output HTML for Config + Add Quest modal. Use as reference for exact Tailwind classes, glass panel CSS, and modal layout. **Do not import this file**; recreate as React components.
- 4 screen.png files — visual references for Home (mobile), Quests page, Rewards Treasury, and Combat Analytics (Stats)

**First step before coding:** open `DESIGN.md` and `code.html`. Extract the Tailwind config from `code.html` lines 11–96 verbatim into `tailwind.config.ts`. Extract the `.glass-panel` and `.neon-border-active` CSS into `app/globals.css`.

---

## 4. Target File Structure

```
/questify/
├── app/
│   ├── layout.tsx              ← fonts, global CSS, side nav + bottom nav wrapper
│   ├── globals.css             ← Tailwind directives, .glass-panel, .neon-border-active, .shimmer
│   ├── page.tsx                ← Home (Dashboard)
│   ├── quests/
│   │   └── page.tsx            ← Active Log: Tasks | Quests | Boss Fights tabs
│   ├── rewards/
│   │   └── page.tsx            ← Rewards Treasury
│   ├── stats/
│   │   └── page.tsx            ← Combat Analytics
│   ├── config/
│   │   └── page.tsx            ← Codex Configuration (Categories, Milestones, Penalties, Streak)
│   └── actions/
│       ├── tasks.ts            ← server actions: createTask, completeTask, deleteTask
│       ├── quests.ts           ← createQuest, addStepToQuest, completeQuestStep
│       ├── rewards.ts          ← createMilestone, claimReward
│       ├── streak.ts           ← buyFreezeToken, applyDailyCheck
│       └── stats.ts            ← getWeeklyOutput, getHeatmap, getSkillDistribution
├── components/
│   ├── nav/
│   │   ├── DesktopSideNav.tsx  ← left rail, fixed, 256px wide
│   │   └── MobileBottomNav.tsx ← bottom fixed bar, 5 icons
│   ├── shared/
│   │   ├── GlassPanel.tsx      ← reusable wrapper with .glass-panel class
│   │   ├── HexBadge.tsx        ← level badge (hexagonal SVG)
│   │   ├── XPBar.tsx           ← gold gradient progress bar with shimmer
│   │   ├── ProgressBar.tsx     ← generic, recolorable
│   │   └── StatPill.tsx        ← outlined pill (+50 GP, +120 XP)
│   ├── home/
│   │   ├── HeroStatBar.tsx     ← LV hex + XP bar + GP balance
│   │   ├── StreakCards.tsx     ← streak + freeze tokens
│   │   ├── TodaysQuests.tsx    ← top 3 tasks
│   │   └── ActiveQuestCard.tsx ← in-progress epic quest mini-card
│   ├── quests/
│   │   ├── TabSwitcher.tsx     ← Tasks | Quests | Boss Fights
│   │   ├── TaskRow.tsx         ← single task row with check button
│   │   ├── EpicQuestCard.tsx   ← chain card with step list
│   │   └── BossFightCard.tsx   ← dramatic card with countdown
│   ├── rewards/
│   │   ├── TreasuryHero.tsx    ← Available Bounty number + level hex
│   │   ├── MilestoneCard.tsx   ← locked/claimable/claimed states
│   │   └── LedgerRow.tsx       ← treasury ledger entry
│   ├── stats/
│   │   ├── WeeklyOutputChart.tsx
│   │   ├── HeatmapMatrix.tsx
│   │   ├── SkillDistribution.tsx
│   │   └── MilestoneProjection.tsx
│   ├── config/
│   │   ├── CategoryList.tsx
│   │   ├── MilestoneEditor.tsx
│   │   ├── PenaltyToggles.tsx
│   │   └── StreakSlider.tsx
│   └── modals/
│       ├── ForgeQuestModal.tsx ← Add/Edit Task — see code.html lines 317–383
│       ├── LevelUpOverlay.tsx  ← full-screen celebration on level-up
│       └── ClaimRewardDialog.tsx
├── lib/
│   ├── supabase.ts             ← createClient() helper
│   ├── game/
│   │   ├── xp.ts               ← level math, XP curve
│   │   ├── streak.ts           ← streak bonus calc, freeze logic
│   │   ├── penalty.ts          ← penalty rules
│   │   └── reward.ts           ← claim eligibility check
│   ├── types.ts                ← shared TypeScript types (Task, Quest, Milestone, etc.)
│   └── constants.ts            ← USER_ID, default values, color tokens for chart data
├── tailwind.config.ts
├── next.config.ts
├── .env.local                  ← Supabase URL + anon key (gitignored)
├── .env.example
└── package.json
```

---

## 5. Design System

Read `DESIGN.md` first. Key points repeated here:

### Colors (from `code.html` Tailwind extension — use these exact names)

| Token | Hex | Used for |
|-------|-----|----------|
| `background` | `#051424` | Page background (deep abyssal navy, NOT pure black) |
| `surface-container-lowest` | `#010f1f` | Deepest layer |
| `surface-container-low` | `#0d1c2d` | Card alt backgrounds |
| `surface-container` | `#122131` | Mobile bottom nav bg, default panels |
| `surface-container-high` | `#1c2b3c` | Sidebar bg, modal bg |
| `surface-container-highest` | `#273647` | Milestone card bg |
| `primary` | `#f2ca50` | Legendary Gold — XP, GP, primary CTAs, active nav |
| `primary-container` | `#d4af37` | Darker gold for hover/secondary fills |
| `secondary` | `#44e2cd` | Vitality Teal — streak, success, completed states |
| `tertiary` | `#e3c2ff` | Mystic Purple — quests, magic, special abilities |
| `tertiary-fixed-dim` | `#ddb7ff` | XP value text (purple) |
| `error` | `#ffb4ab` | Corruption Red — penalties, missed, danger, boss fight border |
| `on-background` | `#d4e4fa` | Primary text |
| `on-surface-variant` | `#d0c5af` | Muted/secondary text (warm tone, NOT cool gray) |
| `outline` | `#99907c` | Borders |
| `outline-variant` | `#4d4635` | Subtle dividers |

### Typography (use `next/font/google`)

```ts
import { Space_Grotesk, Geist, JetBrains_Mono } from 'next/font/google'
// Map to CSS vars: --font-display, --font-body, --font-mono
```

Sizes (in Tailwind config):
- `text-display-hero` — 48px / 700 / lh 1.1 / letter-spacing -0.02em (huge GP number on Rewards page)
- `text-headline-lg` — 32px / 600 / lh 1.2 (desktop page titles)
- `text-headline-lg-mobile` — 24px / 600 / lh 1.2
- `text-body-md` — 16px / 400 / lh 1.6
- `text-label-mono` — 12px / 500 / lh 1.4 (JetBrains Mono — all stat labels, level numbers, IDs)

### Reusable CSS classes (in `globals.css`)

```css
.glass-panel {
  background-color: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.neon-border-active {
  border-color: #f2ca50;
  box-shadow: 0 0 15px rgba(242, 202, 80, 0.5);
}
.boss-fight-pulse {
  border: 2px solid #ffb4ab;
  box-shadow: 0 0 30px rgba(255, 180, 171, 0.4), inset 0 0 20px rgba(255, 180, 171, 0.2);
  animation: pulse-red 2s infinite;
}
@keyframes pulse-red { /* see code.html lines 112–116 */ }
.xp-shimmer {
  /* Linear gradient gold fill + white shimmer travelling left-to-right every 3s */
  background: linear-gradient(90deg, #B48A1B, #D4AF37, #f2ca50);
  position: relative; overflow: hidden;
}
.xp-shimmer::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: shimmer 3s infinite;
}
@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
```

### Shapes

- **Cards / panels:** `rounded-xl` (12px) per Tailwind config (which maps `xl: "0.75rem"` per `code.html` line 68)
- **Pills, badges, buttons:** `rounded-full` (99px)
- **Level badge:** hexagonal SVG (NOT a div with `clip-path`, since stroke matters). See section 9 for SVG.
- **Dividers inside cards:** `border-b border-white/10`, NOT a flat hex color

### Spacing

Base unit 4px. Use Tailwind utilities: `gap-stack-sm` (8), `gap-gutter` (16), `gap-stack-lg` (32), `px-container-margin` (24).

---

## 6. Database Schema (Supabase)

Schema designed for future multi-user. For v1, hardcode `user_id = 'lucas'` from env.

### `users`
```sql
id              text primary key      -- 'lucas' for v1
display_name    text
hero_class      text                  -- 'Shadow Walker' (cosmetic)
created_at      timestamptz default now()
```

### `user_stats` (denormalized snapshot for fast reads)
```sql
user_id            text primary key references users(id)
total_xp           integer not null default 0   -- never decreases
current_level      integer not null default 1   -- derived from total_xp
gp_balance         integer not null default 0   -- current spendable points (≥ 0)
gp_lifetime_earned integer not null default 0   -- never decreases (for stats)
current_streak     integer not null default 0   -- consecutive days
longest_streak     integer not null default 0
freeze_tokens      integer not null default 0
last_active_date   date
updated_at         timestamptz default now()
```

### `categories`
```sql
id          uuid primary key default gen_random_uuid()
user_id     text not null references users(id)
name        text not null               -- e.g. 'Arcane Studies'
color_token text not null               -- one of: error, secondary, tertiary, primary, outline
icon        text                        -- material symbol name e.g. 'science'
sort_order  integer default 0
```

Seed 3 default categories on first run: Fitness & Vitality (error), Arcane (Deep Work) (secondary), Life Maintenance (tertiary).

### `tasks`
```sql
id              uuid primary key default gen_random_uuid()
user_id         text not null references users(id)
title           text not null
category_id     uuid references categories(id)
gp_value        integer not null default 0   -- equals xp_value by default
xp_value        integer not null default 0
deadline        timestamptz                  -- nullable
is_recurring    boolean default false
recurrence      text                         -- 'daily' | 'weekly' (null if not recurring)
is_boss_fight   boolean default false
quest_id        uuid references quests(id)   -- nullable, if part of an epic quest
step_order      integer                      -- only for quest steps
status          text default 'active'        -- 'active' | 'completed' | 'failed' | 'archived'
created_at      timestamptz default now()
completed_at    timestamptz
```

### `task_completions` (event log — for stats and undo)
```sql
id              uuid primary key default gen_random_uuid()
user_id         text not null references users(id)
task_id         uuid not null references tasks(id)
gp_awarded      integer not null
xp_awarded      integer not null
streak_bonus_multiplier numeric(3,2)         -- e.g. 1.10
completed_at    timestamptz default now()
```

### `quests` (Epic Chain Quests)
```sql
id              uuid primary key default gen_random_uuid()
user_id         text not null references users(id)
title           text not null
description     text
icon            text                          -- material symbol
boss_fight_task_id uuid references tasks(id) -- the final task in the chain
status          text default 'active'         -- 'active' | 'completed' | 'failed'
bonus_xp        integer default 0             -- awarded on full completion
bonus_gp        integer default 0
created_at      timestamptz default now()
completed_at    timestamptz
```

Note: quest steps are just `tasks` rows with `quest_id` set and `step_order` ordered 1, 2, 3...

### `rewards` (milestones)
```sql
id               uuid primary key default gen_random_uuid()
user_id          text not null references users(id)
title            text not null               -- 'Weekend Gaming Pass'
description      text
gp_cost          integer not null            -- subtracted on claim
required_level   integer not null default 1
icon             text default 'workspace_premium'
sort_order       integer default 0
```

### `reward_claims` (history — the Treasury Ledger)
```sql
id          uuid primary key default gen_random_uuid()
user_id     text not null references users(id)
reward_id   uuid not null references rewards(id)
gp_spent    integer not null
claimed_at  timestamptz default now()
```

### `daily_logs` (for streak + heatmap — one row per day per user)
```sql
user_id        text not null references users(id)
log_date       date not null
gp_earned      integer not null default 0
xp_earned      integer not null default 0
tasks_completed integer not null default 0
streak_kept    boolean not null default false
freeze_used    boolean not null default false
primary key (user_id, log_date)
```

This table is the source of truth for the Heatmap and Weekly Output chart.

### `config` (user-tunable game rules)
```sql
user_id                       text primary key references users(id)
min_daily_gp_for_streak       integer default 30
streak_freeze_cost            integer default 200
max_freeze_tokens             integer default 3
penalize_missed_recurring     boolean default true
penalize_overdue_deadline     boolean default true
recurring_penalty_pct         integer default 50
deadline_late_penalty_pct     integer default 25
deadline_very_late_penalty_pct integer default 50
```

Seed defaults on first user creation.

### Row-Level Security (RLS)

Enable RLS on all tables. For v1 with no auth, write a permissive policy: `USING (user_id = current_setting('app.current_user_id', true))`. Set `app.current_user_id` in a Postgres function called from server actions. For a single-user MVP this is overkill; you can also use the `service_role` key from server actions and skip RLS until auth is added. Choose the simpler path for v1: **service_role key on server-only, RLS disabled, all queries filtered by `user_id = USER_ID` explicitly**.

---

## 7. Pages Specification

For each page, use the matching `screen.png` as the visual source of truth. Wherever the screenshot and this spec disagree, the screenshot wins for layout; this spec wins for data/logic.

### Page 1: Home (`/`)

**Layout (desktop):** Side nav left (256px) + main content (max-w-2xl, centered).
**Layout (mobile):** Top bar + content + bottom nav. See `screen.png` (mobile shot).

**Sections (top to bottom):**

1. **Hero Stat Bar** — glass panel with L-shaped corner accents (4px). Contains:
   - Hex level badge (gold border, dark fill, level number in JetBrains Mono inside)
   - "XP" label + `3,450 / 5,000` (JetBrains Mono)
   - Gold XP shimmer bar (use `.xp-shimmer`)
   - Gem icon + GP balance on the right

2. **Two metric cards side by side** — `grid-cols-2 gap-gutter`:
   - Streak: flame icon (teal), large teal number, `DAY STREAK` label
   - Freeze tokens: snowflake icon (gold), large number, `TOKENS` label

3. **Today's Quests panel** — glass panel with `Today's Quests` headline + lightning icon. List of up to 3 today's task rows: empty checkbox, task name, GP pill on right (color-coded by category: teal for Vitality, purple for Arcane, etc.). Tap checkbox → completes the task with a server action.

4. **Active Quest mini-card** — glass panel with `ACTIVE` purple chip top-right. Book icon + quest title + "Epic Quest Series" subtitle. Progress text "3/5 Completed" + purple progress bar at 60%.

5. **Floating Action Button** (mobile only, bottom-right above nav) — gold circle, plus icon, opens Forge Quest modal.

**Data fetched (server component):**
- `user_stats` row
- Today's incomplete tasks (limit 3, ordered by created_at)
- Active quest (status='active'), if any, with completion percentage

### Page 2: Quests (`/quests`) — "Active Log"

Three tab pills: `TASKS` | `QUESTS` | `BOSS FIGHTS`. Default to whichever has the most active items.

**Tasks tab:** flat list of all active non-quest, non-boss-fight tasks. Filter dropdown (category) + sort dropdown (deadline / GP value / newest). Each row uses the `TaskRow` component.

**Quests tab:** vertical list of `EpicQuestCard`. Each card shows:
- Icon (purple bg, swords or book icon)
- Tag: `EPIC CHAIN QUEST` (teal, mono, uppercase)
- Title + description
- Reward in top-right: `+1500 XP` (gold mono), `-500 if failed` (red mono below)
- Steps list: completed steps get strikethrough + teal check, current step shows progress bar (`Step 2 of 4`, 50%), future steps are muted with a number circle
- If completed: gold-border banner saying `QUEST COMPLETE!` with bonus pills

**Boss Fights tab:** list of boss-fight cards with `.boss-fight-pulse` red glow border. Skull icon, dramatic title, countdown timer (`4H LEFT`), high reward number, ACCEPT/DECLINE buttons.

### Page 3: Rewards (`/rewards`) — "Rewards Treasury"

**Hero block** (glass panel, large):
- `AVAILABLE BOUNTY` label (gold mono uppercase, centered, tracked wide)
- Huge `2,840` number in Space Grotesk display-hero, with smaller `GP` suffix in gold
- Below: hex level badge with current level inside + hero class name underneath ("Shadow Walker")

**Milestone Spoils section:**
- Section title + `Filter` link in top-right
- Grid of milestone cards (1 col mobile, 3 col desktop):
  - **Claimable** (user has enough GP AND level): gold neon border + glow, star icon top-right, `CLAIM` button bottom-right
  - **Locked** (insufficient level): dashed outline-variant border, faded text, padlock icon next to required level
  - **Claimed**: teal border, strikethrough title and cost, teal check + claim date instead of CLAIM button

**Treasury Ledger** section:
- List of entries: trophy/crossed-swords icon, title, "Claimed on May 12" or "Earned on May 04"
- Right side: `-800 GP` (red) for claims, `+150 GP` (teal) for earnings
- "View Full Ledger" link at bottom

**Logic:**
- Eligibility = `user.gp_balance >= reward.gp_cost AND user.current_level >= reward.required_level AND not yet claimed`
- Claim action: insert `reward_claims` row, decrement `user_stats.gp_balance`, return updated state
- Ledger merges `reward_claims` (negative) and `task_completions` over the last 7 days (positive)

### Page 4: Stats (`/stats`) — "Combat Analytics"

Page title `Combat Analytics` + subtitle "Tracking performance metrics across all active campaigns." in mono.

**4-card grid (2x2 on desktop, stacked on mobile):**

1. **Weekly Output** (top-left, larger card)
   - Grouped bar chart: gold bars = current week, dim purple = previous week
   - X axis: Mon–Sun, Y axis: GP earned per day
   - Legend top-right
   - Pull data: `daily_logs` for last 14 days, group into two 7-day windows

2. **Milestone Projection** (top-right, smaller card)
   - "At this pace, you'll unlock Milestone X in ~N days"
   - Progress bar at bottom showing % toward next claimable milestone
   - Calc: `(next_milestone.gp_cost - current_gp_balance) / avg_daily_gp_last_7_days`

3. **Quest Intensity Matrix** (bottom-left)
   - 7×8 grid heatmap (rows = day of week, cols = last 8 weeks)
   - Cell color intensity = activity level (4 buckets, purple ramp)
   - Less | More legend at bottom
   - Data: `daily_logs` last 56 days, mapped to grid

4. **Skill Distribution** (bottom-right)
   - Horizontal bar chart by category
   - Each bar shows: category icon + name + % + length bar
   - Colors match category color_token
   - Data: sum of GP earned per category over selected window (default: last 30 days)

### Page 5: Config (`/config`) — "Codex Configuration"

Page title `Codex Configuration` + subtitle "Calibrate your questing parameters and penalty thresholds."

**Sections (stacked, each in its own glass panel):**

1. **Categories** — list of category rows (color dot + name + 3-dot menu). `+ ADD NEW CATEGORY` dashed-outline button at bottom.

2. **Reward Milestones** — grid of 2 columns, each cell shows: title, description, GP cost in top-right (gold mono). `+ Define New Milestone` button at bottom.

3. **Penalty Protocols** (2-column grid with Streak Multipliers):
   - Title in red with skull icon
   - Toggle: "HP Drain on Missed Daily" (controls `penalize_missed_recurring`)
   - Toggle: "Hardcore Mode" (extreme: longest_streak reset to 0 on any miss — OFF by default, dangerous)

4. **Streak Multipliers** (right column of grid):
   - Title in teal with flame icon
   - Slider: Base Streak Points (10–100, default 30) — sets `min_daily_gp_for_streak`
   - Subtext: "Multiplier increases by 1.1x every 7 consecutive days of logging."

All edits save via server actions on blur or toggle change. No "Save" button needed.

### Forge Quest Modal (overlay, accessible from FAB and Quests page)

See `code.html` lines 317–383 for exact layout. Key fields:

- Title input (large): "What is your objective, hero?"
- Generated quest ID under title: `#QST-{random6chars}` in mono
- Category pills (multi-color outlined; selected has filled bg + glow). Pulled from `categories` table.
- Two number inputs side by side: `POINTS YIELD` (gold) and `XP REWARD` (purple). Default to equal values; auto-mirror when user types in one until the other is manually edited.
- Boss Fight toggle: red-bordered panel with `swords` icon. When ON, modal gets `.boss-fight-pulse` border animation.
- (For v1.1, hidden in v1) Deadline picker, Recurring toggle, Quest assignment dropdown
- Footer: `+ ADD QUEST` gold button (right-aligned on desktop, full-width on mobile)

---

## 8. Core Game Logic — implement in `lib/game/`

### `xp.ts`

```ts
// Cumulative XP needed to REACH level N
export const xpForLevel = (n: number): number => 50 * n * n
// Lv1: 50, Lv2: 200, Lv5: 1250, Lv10: 5000, Lv20: 20000, Lv30: 45000

export const levelFromTotalXP = (totalXP: number): number => {
  // Largest N such that 50*N² <= totalXP
  return Math.max(1, Math.floor(Math.sqrt(totalXP / 50)))
}

export const xpProgressInLevel = (totalXP: number) => {
  const level = levelFromTotalXP(totalXP)
  const floor = xpForLevel(level)
  const ceiling = xpForLevel(level + 1)
  return { current: totalXP - floor, needed: ceiling - floor, level }
}
```

### `streak.ts`

```ts
// Bonus multiplier applied to GP earned per task
export const streakBonus = (streak: number): number => {
  if (streak >= 100) return 1.50
  if (streak >= 60)  return 1.35
  if (streak >= 30)  return 1.25
  if (streak >= 14)  return 1.15
  if (streak >= 7)   return 1.10
  if (streak >= 3)   return 1.05
  return 1.00
}

// Returns extra freeze tokens granted at this streak milestone (one-time)
export const freezeTokensAtMilestone = (streak: number): number => {
  if (streak === 30) return 2
  if (streak === 14) return 1
  return 0
}

// One-time bonus GP at streak milestones
export const streakMilestoneBonus = (streak: number): number => {
  if (streak === 30) return 150
  return 0
}
```

### `penalty.ts`

```ts
export const recurringMissPenalty = (gpValue: number, pct: number = 50): number =>
  Math.floor(gpValue * pct / 100)

export const deadlineLatePenalty = (gpValue: number, daysLate: number, lateCfg: number, veryLateCfg: number): number => {
  if (daysLate >= 2) return Math.floor(gpValue * veryLateCfg / 100)
  if (daysLate >= 1) return Math.floor(gpValue * lateCfg / 100)
  return 0
}

// Applied to user_stats.gp_balance with Math.max(0, ...) — GP never goes negative
// XP is NEVER deducted — period.
```

### Streak update logic (run inside `completeTask` server action and a nightly cron — for now, run lazily on every page load via `applyDailyCheck`)

```ts
// Called from middleware / root layout / server actions
// 1. Get user_stats.last_active_date
// 2. Compute daysSinceLastActive
// 3. If today: nothing
// 4. If yesterday: streak preserved (extend if completing a task today)
// 5. If 2 days ago: try auto-consume a freeze_token → streak preserved
// 6. If 3+ days or no freeze tokens: reset current_streak to 0
// 7. After task completion today: if min_daily_gp_for_streak met OR any task completed → increment streak, set last_active_date = today, mark daily_logs.streak_kept = true
// 8. If new streak triggers freezeTokensAtMilestone or streakMilestoneBonus → grant
```

### Task completion flow (most important transaction)

```
completeTask(taskId):
  1. Fetch task (verify status='active', user owns it)
  2. Fetch user_stats and current_streak
  3. multiplier = streakBonus(current_streak)
  4. gpAwarded = floor(task.gp_value * multiplier)
  5. xpAwarded = task.xp_value  -- XP not affected by streak multiplier (XP is pure)
  6. UPDATE user_stats SET
       gp_balance = gp_balance + gpAwarded,
       gp_lifetime_earned = gp_lifetime_earned + gpAwarded,
       total_xp = total_xp + xpAwarded,
       current_level = levelFromTotalXP(total_xp + xpAwarded)
  7. INSERT task_completions row
  8. UPDATE tasks SET status='completed', completed_at=now()
  9. UPDATE daily_logs (upsert today's row): increment gp_earned, xp_earned, tasks_completed
 10. Call streak update logic (see above)
 11. If task.quest_id: check if all quest steps complete → mark quest completed, award bonus
 12. If level increased: return { leveledUp: true, newLevel } → trigger LevelUpOverlay on client
```

Wrap steps 6–11 in a Postgres transaction. Use a `complete_task` RPC function in Supabase for atomicity, OR run them via Supabase JS client in sequence inside a server action (acceptable for v1 single-user).

---

## 9. Component Notes

### `HexBadge.tsx`

```tsx
// SVG hexagon, configurable size and color. Place a span with the level number inside.
<svg viewBox="0 0 100 100">
  <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
           fill="none" stroke="#f2ca50" strokeWidth="2"
           filter="drop-shadow(0 0 6px rgba(242,202,80,0.4))" />
</svg>
```

### `XPBar.tsx`

Wrapper div with `.glass-panel` inner shadow look, inside a child div with width % set to (current/needed)*100 and `.xp-shimmer` class.

### `TaskRow.tsx` (used on Home and Quests page)

Single row: empty/checked checkbox (16px), task title, far-right GP pill. Pill background is category color at 10% opacity, border at full color, text at full color, +50 with star icon (or +XP with sparkle icon if displaying XP).

When checked: optimistic UI fades the row to 50% opacity, calls `completeTask` server action, on success shows a toast `+50 GP earned, +50 XP gained` with the streak multiplier appended if > 1.0x.

### `ForgeQuestModal.tsx`

This is the centerpiece. Reuse `code.html` lines 317–383 layout exactly. Make it a controlled component opened by a Zustand-free signal: lift `isOpen` state up to a layout-level provider OR pass an `open` prop and use a context. Use `useTransition` for the submit action.

### Charts

Use Recharts. For the Weekly Output bar chart:

```tsx
<BarChart data={data}>
  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
  <XAxis dataKey="day" stroke="#d0c5af" tick={{ fontFamily: 'JetBrains Mono', fontSize: 12 }} />
  <YAxis stroke="#d0c5af" tick={{ fontFamily: 'JetBrains Mono', fontSize: 12 }} />
  <Bar dataKey="current" fill="#f2ca50" radius={[4,4,0,0]} />
  <Bar dataKey="previous" fill="#A855F7" opacity={0.4} radius={[4,4,0,0]} />
</BarChart>
```

For the heatmap, manual SVG grid (28 cols × 7 rows). Don't use a library — it's a 5-line render.

---

## 10. State Management

- **Server data:** Supabase via server components. Use `revalidatePath` after server actions to refresh.
- **Modal open/close:** local `useState` in a `<ModalsProvider>` at root, exposing `openForgeQuest()`, `openClaimReward(rewardId)`, `openLevelUp(newLevel)`.
- **Optimistic UI on task complete:** `useOptimistic` from React 19, fallback to `useTransition` + manual UI nudge.
- **No global store needed.** If something gets messy, lift state, don't reach for Zustand yet.

---

## 11. Environment Setup

`.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
USER_ID=lucas
```

For v1 use the service_role key on server only — never expose it to the client. All Supabase calls happen in server components or server actions. Do not import the service-role client into any `'use client'` file.

`lib/supabase.ts`:

```ts
import 'server-only'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export const USER_ID = process.env.USER_ID || 'lucas'
```

---

## 12. Local Dev → Vercel Deploy

### Local

1. `npx create-next-app@latest questify --typescript --tailwind --app --no-src-dir`
2. `cd questify && npm i @supabase/supabase-js recharts`
3. Copy `tailwind.config.ts` content from `code.html` lines 11–96 — careful to preserve all the color names verbatim.
4. Set up `app/globals.css` with Tailwind directives + the three custom classes from section 5.
5. Create a Supabase project at supabase.com. Run the SQL from section 6 in the SQL editor. Disable RLS for now (or set permissive policy).
6. Seed one row in `users` (`id='lucas'`) and one in `user_stats` (`user_id='lucas'`, defaults), one row in `config`, plus 3 default categories.
7. Fill `.env.local`, run `npm run dev`.

### Vercel

1. Push to GitHub.
2. Import the repo on Vercel.
3. Set env vars: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `USER_ID`.
4. Deploy. Vercel auto-detects Next.js.

---

## 13. v1 Scope — Must Ship

| # | Feature | Status |
|---|---------|--------|
| 1 | Home page with hero stat bar, streak cards, today's quests, active quest preview | TODO |
| 2 | Quests page with all 3 tabs functional | TODO |
| 3 | Forge Quest modal (create task, optional boss fight toggle, optional quest assignment) | TODO |
| 4 | Complete task action with streak update + level up detection | TODO |
| 5 | Rewards page with milestones (locked/claimable/claimed) + Treasury Ledger | TODO |
| 6 | Claim reward action with GP deduction + history insert | TODO |
| 7 | Stats page with all 4 cards using real data | TODO |
| 8 | Config page with category CRUD, milestone CRUD, penalty toggles, streak slider | TODO |
| 9 | XP curve + level math correct | TODO |
| 10 | Streak bonus + freeze token logic | TODO |
| 11 | Penalty logic for missed recurring + late deadlines | TODO |
| 12 | LevelUpOverlay shown on level-up | TODO |
| 13 | Responsive: mobile bottom nav + desktop side nav both work | TODO |
| 14 | Deploy to Vercel with Supabase connected | TODO |

---

## 14. v2 Backlog — DO NOT BUILD IN v1

These appear in the Stitch screenshots as visual placeholders. Do not implement; either hide entirely from the nav, or render greyed-out "coming soon" labels.

- **Character** page (avatar customization, hero class)
- **Inventory** page (cosmetic items, badges collection)
- **Skill Tree** page (a graph of unlocked study domains)
- **Guilds** page (multi-user, social — explicitly out of scope for single-user v1)
- **Upgrade to Legend** button (no premium tier exists)
- **PWA + push notifications** (no service worker yet — Lucas will manually self-remind)
- **Email reminders** (no Resend integration in v1)
- **AI-generated essay questions** from task name (LLM integration)
- **Per-category badges** (YOLO Slayer etc.)
- **Hardcore Mode toggle** functional behavior (UI placeholder only — does nothing if toggled)
- **Auth + multi-user** (schema is ready, but Supabase Auth not wired)

Render Character, Inventory, Skill Tree, Guilds, and "Upgrade to Legend" in the desktop side nav for visual fidelity, but make them non-interactive (or route to a `coming-soon` page). Do not show them in the mobile bottom nav — mobile nav has exactly 5 items: Home, Quests, Rewards, Stats, Config.

---

## 15. UI Naming Convention (Important — Don't Generic-ify)

The Stitch theming uses RPG flavor for everything. Preserve it in UI copy, but in code, use plain names.

| UI Label (preserve) | Code/DB name (use) |
|---------------------|-------------------|
| "Gold Points" / "GP" | `gp_balance`, `gp_value` |
| "Available Bounty" | (just the GP balance — UI label only) |
| "Forge New Quest" | `createTask()` server action |
| "Codex Configuration" | `/config` route |
| "Combat Analytics" | `/stats` route |
| "Rewards Treasury" | `/rewards` route |
| "Milestone Spoils" | `rewards` table |
| "Treasury Ledger" | combined `reward_claims` + recent `task_completions` |
| "Active Log" | `/quests` route |
| "Epic Chain Quest" | `quests` table (single row) |
| "Quest Intensity Matrix" | heatmap from `daily_logs` |
| "Skill Distribution" | GP by category breakdown |
| "Penalty Protocols" | `config.penalize_*` fields |
| "Streak Multipliers" | `config.min_daily_gp_for_streak` |
| "Mark as Boss Fight" | `tasks.is_boss_fight` |

**Hero class is cosmetic only.** "Shadow Walker" is hardcoded for v1. Stored in `users.hero_class` so it can be edited later, but no UI to edit it.

---

## 16. Build Order (suggested)

1. Tailwind config + global CSS + fonts + base layout (side nav + bottom nav). Verify the dark abyssal background and gold typography feels right.
2. Supabase schema + seed data. Verify queries work from a server component.
3. Home page — read-only first, then wire up Today's Quests checkbox.
4. Forge Quest modal — get task creation working end-to-end.
5. Complete task action with XP/GP/streak logic. Add LevelUpOverlay.
6. Quests page — Tasks tab first, then Quests, then Boss Fights.
7. Rewards page + claim flow.
8. Config page (categories CRUD first, then milestones, then toggles).
9. Stats page (Weekly Output → Heatmap → Skill Dist → Projection).
10. Polish: animations, toasts, loading states, error boundaries.
11. Vercel deploy.

After each step, run the dev server and verify the screen matches the corresponding `screen.png` reference within reason.

---

## 17. Things to Avoid

- Don't use `localStorage` for game state — all state is in Supabase.
- Don't introduce client-side data fetching libraries (SWR, React Query). Server components + server actions are enough.
- Don't fake the data with hardcoded values past step 2 — pull real data from Supabase.
- Don't reproduce the L-shaped corner accents on every panel — they're decorative on `screen.png` Image 3 only. Use them on the Hero Stat Bar (Home) and Weekly Output card (Stats).
- Don't change the color names from `code.html` — the Tailwind classes throughout assume those exact names.
- Don't add gradients to the page background. It's a flat `#051424` everywhere except inside shimmer bars.
- Don't put real images of people. The avatar slot on Home/Quests pages uses the Stitch-generated hero portrait URL — keep it or replace with a neutral SVG silhouette.
- Don't skip the `pulse-red` animation on the boss-fight modal — it's the entire point of the dramatic styling.

---

Good luck. Read `DESIGN.md` and the four `screen.png` files before writing any code.
