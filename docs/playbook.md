# OCD2Now — Developer Master Playbook

**Status:** Authoritative. This document supersedes the original `CLAUDE_CODE_BUILD_SPEC.md` on every engineering question. The build spec defines *what the app is and why*; this playbook defines *how to build it*. When the two disagree, the playbook wins on stack, schema mechanics, auth, deployment, and conventions. The build spec wins on therapeutic principles, copy, and product behavior.

**Audience:** Claude Code (web) — the agent that will build OCD2Now to completion in a single session, then hand it back for testing.

**Source of authority:** This playbook draws its engineering decisions from the Harwood Studio build (a sibling app for Ajax Harwood Clinic that shipped to production using this same stack). Every "pitfall already paid for" in §11 cost real hours on that build. Don't re-discover them.

---

## 0. The non-negotiables (read this first, every session)

Before touching code, internalize these. They override convenience, framework defaults, and your own instincts.

### Therapeutic non-negotiables (from build spec §2)

1. **All tendencies are involuntary.** The thoughts, urges, not-acting, even reaching for the app — unfolding on their own. Language never says "without judgment," "let go," "choose to," "decide to." It says "involuntary," "observe," "unfolds," "is here," "is happening."
2. **No completion states. No streaks. No badges. No graphs. No progress bars.** Anything an OCD mind could optimize is removed.
3. **Sessions end definitively, not gradually.** ~60–90s, then closed. Re-opening is deliberate.
4. **The app names its own compulsion risk** during onboarding and at frequency thresholds.
5. **The app gets quieter over time**, not louder.
6. **The app's purpose is to graduate the user**, not retain them.
7. **No emojis. No icons** except a single back/home affordance and the bottom-corner crisis link.

If a UX choice violates one of these, the choice is wrong. Push back rather than ship it.

### Engineering non-negotiables

8. **No streak counter, ever.** Not even "for the user's own information." Not in settings. Not in the DB schema (the `total_sessions` field on `ocd_users` is a soft marker the app uses internally; it is **never rendered to the user as a number to optimize**).
9. **Crisis modal opens are NEVER logged.** No row, no count, no analytic event. This is a privacy commitment.
10. **No analytics packages.** No PostHog, Mixpanel, GA, Amplitude. Not even "anonymous" ones.
11. **Server actions for mutations.** API routes only for OAuth callbacks and webhooks.
12. **Hand-write the database types from the migration SQL.** Never run `supabase gen types` from an AI session.

---

## 1. Stack and version pins

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14 App Router** (NOT 15) | Stability. RSCs + server actions are mature on 14. |
| Language | TypeScript, `strict: true` | Catches schema drift early. |
| Styling | **Tailwind v3** (NOT v4) | v4 is a breaking rewrite; every Next.js 14 recipe assumes v3. |
| Auth + DB | Supabase (`ajax-harwood-clinic` project) | Same project as Harwood Studio + AHC clinical hub. |
| SSR auth glue | **`@supabase/ssr` ^0.10.3** | The 0.5.x line imports `@supabase/supabase-js/dist/module/lib/types`, a path that no longer exists in modern supabase-js. Pin 0.10+. |
| supabase-js | `^2.45.4` (resolves to ^2.105) | Compatible with `@supabase/ssr` 0.10+. |
| Animation | `framer-motion` | For the slow fades. Keep durations 300–800ms. |
| QR / extras | none in v1 | The build spec is text-and-fade only. Resist adding chart/icon libs. |
| Hosting | Vercel | Frictionless Next.js deploy. |
| Fonts | **Cormorant Garamond** (display) + **Inter Tight** (body) via `next/font/google` | Loaded at build, no FOUT. |
| Tests | Vitest | Faster than Jest, native ESM, no transform setup. |

**Hard rules**
- No state library. `useState` / `useReducer` + RSC composition.
- No CSS-in-JS. Tailwind utilities only. Design tokens in `tailwind.config.ts`.
- Server actions for mutations. `revalidatePath()` after each.
- No `headers().get('x-pathname')` for layout-level routing decisions — that header isn't set by Next.js by default. Use route groups.

**Do NOT install:** PostHog, Mixpanel, GA, Amplitude, Sentry-with-breadcrumbs, push-notification SDKs, payment SDKs, translation libraries, native shells (Capacitor/Expo). The PWA is the mobile app.

---

## 2. Repository layout

```
app/
├── (public)/                       # logged-out routes, paper bg
│   ├── layout.tsx                  # bare wrapper, no auth-aware chrome
│   ├── page.tsx                    # / — landing + sign-in
│   └── why/
│       └── page.tsx                # /why — single-page essay (linked sparingly)
├── (authed)/                       # member route group
│   ├── layout.tsx                  # paper bg, mounts CrisisModal
│   ├── welcome/
│   │   └── page.tsx                # /welcome — 3-screen onboarding
│   ├── now/
│   │   └── page.tsx                # /now — frequency-aware home
│   ├── session/
│   │   └── page.tsx                # /session — active sensory invitation
│   ├── end/
│   │   └── page.tsx                # /end — close screen
│   └── settings/
│       └── page.tsx                # /settings
├── auth/callback/route.ts          # OAuth code exchange
├── layout.tsx                      # root: fonts, manifest, sw register
└── globals.css                     # tailwind directives + design tokens

components/
├── CrisisModal.tsx                 # mounted in (authed) layout, also accessible from /
├── BeginButton.tsx                 # the single large soft button on /now
├── PauseScreen.tsx                 # used at 4–6 / 7–12 daily session bands
├── ThresholdScreen.tsx             # 13+ daily sessions
├── GoogleSignInButton.tsx
├── MagicLinkForm.tsx               # secondary sign-in, fallback only
└── invitations/
    ├── index.ts                    # registry: id → component, slug, duration
    ├── ThreeSounds.tsx
    ├── ColdWater.tsx
    ├── FiveContacts.tsx
    ├── OneExhale.tsx
    ├── EyesAround.tsx
    ├── BilateralTap.tsx
    ├── HotCool.tsx
    └── NextSound.tsx

lib/
├── supabase/
│   ├── client.ts                   # browser createBrowserClient
│   ├── server.ts                   # server createServerClient (cookies)
│   ├── service.ts                  # service-role, must declare `import "server-only"`
│   └── middleware.ts               # session refresh + auth gate
├── actions/
│   ├── startSession.ts             # creates ocd_sessions row, picks invitation
│   ├── endSession.ts               # marks ended_at, completed
│   ├── completeOnboarding.ts       # sets user_type, onboarded_at
│   ├── deleteAccount.ts            # cascading delete via auth.users
│   └── _result.ts                  # ActionResult<T> type
├── auth/
│   └── getCurrentUser.ts           # reads session, returns ocd_users row
├── invitations.ts                  # selectInvitation() — server-side picker
├── frequency.ts                    # daily count + band classifier
├── types/database.ts               # hand-written mirror of migration SQL
└── utils/
    ├── format.ts                   # America/Toronto formatters (settings only)
    └── tz.ts                       # day-boundary in user local TZ

db/
└── migrations/
    ├── 0001_ocd2now_schema.sql     # tables, RLS, trigger, seed invitations
    └── 0002_ocd_users_self_insert.sql  # see §3 — RLS gotcha

public/
├── manifest.json
├── icon-192.png                    # placeholder
├── icon-512.png                    # placeholder
└── sw.js                           # minimal app-shell + invitations cache

middleware.ts                       # delegates to lib/supabase/middleware
tailwind.config.ts
next.config.js
```

**Why `(public)` and `(authed)` route groups** — so the middleware-enforced redirect logic and the crisis-modal mount happen on `(authed)` layouts only, without runtime path checks. The Harwood Studio build tried path-detection in a layout via `headers()` and it silently failed. Don't repeat that.

---

## 3. Database conventions

- All tables prefixed `ocd_*` (distinct from `pob_*`, `grp_*`, `ahc_book_*` on the same Supabase project).
- All triggers/functions prefixed `ocd_*` (snake_case).
- Migrations are **numbered and idempotent**:
  - `create table if not exists ...`
  - `where not exists (select 1 ...)` for inserts
  - `drop policy if exists ... ; create policy ...` for policy changes
  - `create or replace function ...` for functions
- **No PHI in this app.** No HCN, no DOB, no clinical notes. Email is the only PII, and it lives in `auth.users` already.

### The schema (verbatim from build spec §8, with one addition)

The build spec's `0001_ocd2now_schema.sql` is correct as written. Apply it as-is. **One addition is required** (see RLS gotcha below):

```sql
-- 0002_ocd_users_self_insert.sql
-- The trigger on auth.users INSERT is SECURITY DEFINER, so it bypasses RLS.
-- That works for the auto-create path. But if a user ever needs to upsert
-- their own row (e.g., during onboarding from a client component), the
-- single FOR ALL policy in 0001 covers SELECT/UPDATE/DELETE/INSERT for
-- auth.uid() = id. Verify this end-to-end before assuming it works.
--
-- If a brand-new user appears as "signed-out" on /now after Google sign-in,
-- the trigger didn't fire. Check the Supabase logs for the trigger and
-- re-run 0001 if needed; do not patch it client-side.
```

The Harwood Studio build hit a near-identical bug: a missing INSERT policy made the bootstrap insert fail silently and made new users appear signed-out. The OCD2Now schema avoids it by using a `SECURITY DEFINER` trigger on `auth.users` instead of a client-side bootstrap. **This is the correct pattern.** Do not rewrite it to bootstrap from the client.

### RLS checklist when you touch any table

- [ ] `select` policy
- [ ] `insert` policy with a `with check` clause (or a trigger that bypasses RLS for auto-create)
- [ ] `update` policy with both `using` and `with check`
- [ ] `delete` policy if applicable (cascade from `auth.users` is fine for OCD2Now)
- [ ] Smoke-test by creating a row as an authenticated user, not just as service role

The `FOR ALL USING (auth.uid() = id)` policies in the v1 migration cover all four operations. That's intentional and correct.

### Hand-written database types — the rule that bit Harwood Studio

`lib/types/database.ts` is a hand-written mirror of `0001_ocd2now_schema.sql`. **We do not run `supabase gen types`.** Two reasons:

1. The credential-handling rule for AI sessions: the service role key never enters a prompt. Generating types requires DB access we don't grant.
2. The schema is small enough (3 tables) that hand-writing is faster than the round-trip.

**Critical detail — read this twice:** Declare each Row shape as a **`type` alias, not an `interface`**. TypeScript interfaces don't structurally satisfy postgrest-js's `Record<string, unknown>` constraint, and using `interface` causes every `.select()` result to resolve to `never`. The Harwood Studio build lost an hour to this. Do not re-discover it.

```ts
// ✅ Correct
export type OcdUserRow = {
  id: string;
  email: string;
  user_type: 'ocd' | 'unsure' | 'other' | 'unset';
  onboarded_at: string | null;
  created_at: string;
  total_sessions: number;
  weeks_active: number;
  last_invitation_id: number | null;
  on_ramp_shown_at: string | null;
};

// ❌ Causes data: never on every query
export interface OcdUserRow { id: string; /* ... */ }
```

The `Database` type must include all five top-level keys to satisfy the constraint:

```ts
export type Database = {
  public: {
    Tables: {
      ocd_users: { Row: OcdUserRow; Insert: ...; Update: ... };
      ocd_sessions: { Row: OcdSessionRow; Insert: ...; Update: ... };
      ocd_invitations: { Row: OcdInvitationRow; Insert: ...; Update: ... };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
```

---

## 4. Authentication

### Auth method

**Primary: Google OAuth.** **Secondary: email magic link**, kept because the build spec calls for it as a fallback. Both flow through Supabase Auth.

The Harwood Studio build started with magic link and migrated to Google because:
- Corporate email scanners (SafeLinks, Mimecast, Proofpoint) prefetch the link and burn the one-time token.
- Supabase's default email rate limit (~30/hr) blocks dev iteration.

For OCD2Now, **leave magic link enabled** — the user base is consumer, not corporate, so SafeLinks is less of an issue, and the build spec is explicit about wanting it as an option. But default the UI emphasis to Google. Use the build-spec copy: "Continue with Google" (primary), "Email me a sign-in link instead" (secondary).

If magic-link rate limits become a problem in production, switch to a custom SMTP via Resend or SendGrid before disabling magic link entirely.

### How the gate is enforced

`middleware.ts` runs on every request. Its job is narrow:

- Refresh the session cookie via `@supabase/ssr`.
- For paths in `(authed)` (`/welcome`, `/now`, `/session`, `/end`, `/settings`): if no session, redirect to `/`.
- For `/`: if a session exists and the user is onboarded, redirect to `/now`. If a session exists and they are not onboarded, redirect to `/welcome`.
- For `/why` and `/auth/callback`: pass through.

Do NOT do path detection inside layouts via `headers()`. Use the route-group structure in §2 and let middleware do the gating.

### OAuth setup (one-time per environment)

1. **Google Cloud Console** → Credentials → OAuth client ID, "Web application".
   - Authorized JavaScript origins: `https://ocd2now.vercel.app` + `http://localhost:3000`
   - Authorized redirect URI: `https://ankuggxttctidyuupesp.supabase.co/auth/v1/callback`
2. **Supabase Studio → Authentication → Providers → Google** → paste Client ID + Secret, toggle on.
3. **Supabase Studio → Authentication → URL Configuration** → add to "Redirect URLs" allow-list:
   - `https://ocd2now.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback`

Document these steps in the README so the user (Carlos) can do them himself — Claude Code does not have console access.

### First-sign-in onboarding

The trigger `ocd_handle_new_user` on `auth.users` INSERT creates the `ocd_users` row automatically. After OAuth callback:

- If `ocd_users.onboarded_at IS NULL` → middleware sends them to `/welcome`.
- After welcome screen 3 (the `user_type` question), the `completeOnboarding` server action sets `user_type` and `onboarded_at = NOW()`, then redirects to `/now`.

---

## 5. Server actions

All live in `lib/actions/*` and return:

```ts
type ActionResult<T> =
  | { ok: true; data?: T }
  | { ok: false; error: string };
```

Conventions:

- **Authorize at the top.** Every action calls `getCurrentUser()` first; bail before touching the DB.
- **Idempotent where reasonable.** `startSession` won't create a second active row if one is already open within the last 90 seconds — return the existing one.
- **Validate at the boundary.** `user_type` must match the enum check on the column; `invitation_id` must exist in `ocd_invitations`.
- **`revalidatePath()` after mutations** so RSCs re-fetch.
- **Never log user content.** Crisis modal opens are NOT a server action — they are pure client-side overlays with no telemetry.
- **No API routes** unless there's a real reason (`/auth/callback` is the only one in v1).

### The action surface for v1

| Action | Inputs | Effect |
|---|---|---|
| `completeOnboarding` | `user_type` | Sets `ocd_users.user_type` + `onboarded_at` |
| `startSession` | (server selects invitation) | Inserts `ocd_sessions` row, returns `{session_id, invitation_id, daily_count_at_start}` |
| `endSession` | `session_id`, `completed` | Updates `ended_at` + `completed` |
| `deleteAccount` | (none) | `auth.admin.deleteUser(uid)` — cascades to `ocd_users` and `ocd_sessions` via FK ON DELETE CASCADE |

`deleteAccount` is the one place that must use the **service-role client** (`lib/supabase/service.ts`). That file is marked `import "server-only"` at the top — leave it that way. One stray import from a client component leaks the key.

---

## 6. Visual design tokens

Defined in `tailwind.config.ts`. Do not introduce new color values; the palette is intentionally tiny.

**Palette (paper-and-rust, single mode — no dark mode in v1):**
- `bg-paper` `#F4F0E8` — page bg
- `text-ink` `#1A1815` — primary text
- `text-muted` `#6B6358` — secondary text
- `accent` `#7A3B2E` — warm rust, used sparingly (focus rings, the Begin button hover)
- `bg-accent-soft` `rgba(122, 59, 46, 0.08)` — soft accent bg (the only "highlight" surface)

**Typography:**
- `font-display` (Cormorant Garamond, light + light italic) — headlines, hero lines, the rotating `/now` line, all phase text in `/session`
- `font-sans` (Inter Tight, light + medium) — buttons, labels, small UI text
- Body text 16–17px, line-height 1.6, max-width ~620px.
- Buttons are Inter Tight medium, not Cormorant.

**Layout:**
- Mobile-first. Test at 375px width.
- Padding 24–32px around content. Never cramped.
- The `/now` "Begin" button is centered, large (~56–64px tall), full-width minus side padding.
- Generous vertical rhythm. White space is the design.

**Animation:**
- All transitions use `framer-motion`.
- Fade durations: 300ms (UI), 600–800ms (session phase transitions).
- Easing: `ease-out` for entries, `ease-in` for exits.
- The session phase 1 → phase 2 → phase 3 transitions are slow on purpose. Don't speed them up.

---

## 7. Copy tone — what the build spec already gave us, plus rules

The build spec §7 contains the canonical copy. Use it verbatim. Do not paraphrase. The copy is the product.

Rules for any copy you have to write that the build spec didn't anticipate (error messages, edge cases, settings labels):

- **No exclamation marks.** Anywhere.
- **No emojis.** Anywhere.
- **No "you did it" / "great job" / "well done".** No completion language.
- **No "without judgment" / "let go" / "just be present".** Replace with "involuntary," "observe," "is here," "unfolds."
- **No "your practice" / "your journey" / "your progress".** No language that constructs a thing-being-built.
- **No "every day" / "consistency" / "daily habit".** This app is not a habit-builder.
- **Errors are quiet.** "Something didn't work. Try again, or come back later." Not "Oops!" or "Uh oh."
- **Crisis copy is direct, never euphemistic.** "If you are in immediate danger, call 911 or go to your nearest ER." Not "If things feel really hard..."

When in doubt, the voice is presencetherapy.ca's voice. Read it before writing copy.

---

## 8. The frequency-aware `/now` page — implementation notes

The build spec §5.2 specifies four bands by `daily_session_count`. Implement them as follows:

```ts
// lib/frequency.ts
export type FrequencyBand = 'standard' | 'pause-soft' | 'pause-firm' | 'threshold';

export function classifyBand(count: number): FrequencyBand {
  if (count < 4) return 'standard';
  if (count < 7) return 'pause-soft';   // 4–6
  if (count < 13) return 'pause-firm';  // 7–12
  return 'threshold';                    // 13+
}
```

The day boundary is **the user's local midnight, in `America/Toronto`** (the AHC catchment). Do not use UTC midnight. `lib/utils/tz.ts` has the helper.

`/now` is a server component. It:
1. Calls `getCurrentUser()`.
2. Counts `ocd_sessions` for that user with `started_at >= today_start_toronto()`.
3. Calls `classifyBand(count)`.
4. Renders the band-appropriate component (`StandardNow`, `PauseSoftScreen`, `PauseFirmScreen`, `ThresholdScreen`).

Each band screen is a client component (it has interactive buttons). The decision of *which* to render is made on the server. This is correct App Router idiom — keep it that way.

**Do NOT** show the user the count. The count drives the screen choice; the user does not see "you've opened this 8 times today" in the UI flow. The settings page shows a 7-day count with the explicit framing "This number is here so you can notice patterns. It is not a score." That is the only place a number appears.

---

## 9. The session experience — implementation notes

`/session` is the most important screen in the app. Three phases, each rendered with `framer-motion` fade transitions.

**State machine (client component):**
```
phase: 'arrival' (0–10s) → 'invitation' (10–75s) → 'return' (75–90s) → done
```

Drive transitions with `setTimeout` inside `useEffect`, not by listening for invitation completion. The session ends on a clock, not on user action. The user can tap "Skip" at any time to advance the phase, but they cannot extend.

**Invitation registry (`components/invitations/index.ts`):**

```ts
import { ThreeSounds } from './ThreeSounds';
// ... etc

export const INVITATIONS = {
  1: { slug: 'three-sounds', component: ThreeSounds, durationMs: 60_000 },
  2: { slug: 'cold-water', component: ColdWater, durationMs: 60_000 },
  3: { slug: 'five-contacts', component: FiveContacts, durationMs: 50_000 },
  4: { slug: 'one-exhale', component: OneExhale, durationMs: 60_000 },
  5: { slug: 'eyes-around', component: EyesAround, durationMs: 45_000 },
  6: { slug: 'bilateral-tap', component: BilateralTap, durationMs: 60_000 },
  7: { slug: 'hot-cool', component: HotCool, durationMs: 45_000 },
  8: { slug: 'next-sound', component: NextSound, durationMs: 60_000 },
} as const;
```

This must match the seed in `0001_ocd2now_schema.sql` exactly. If you change the seed, change this file in the same commit.

**OCD-aware language variants:** The build spec §6 specifies that users with `user_type = 'ocd'` see slightly different final-text strings on each invitation. Each invitation component takes a prop `userType: 'ocd' | 'unsure' | 'other' | 'unset'` and renders the appropriate variant. Keep both variants in the same component file — colocation makes them easy to compare.

**Selection logic:** Use the algorithm in build spec §9 verbatim. Place it in `lib/invitations.ts`. Call it from the `startSession` server action, not from the client.

---

## 10. PWA setup

```json
// public/manifest.json
{
  "name": "Now",
  "short_name": "Now",
  "description": "From the loop, back to here.",
  "start_url": "/now",
  "display": "standalone",
  "theme_color": "#F4F0E8",
  "background_color": "#F4F0E8",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Note the `name`: "Now", not "OCD2Now".** Once installed to home screen, the user sees "Now" — discreet. The "OCD2Now" name only appears on the marketing landing.

**Service worker:** Cache the app shell + all 8 invitation components for offline use. The session experience must work offline (a user in a loop on the subway needs it). Auth and the start/end of sessions can fail gracefully — queue an `endSession` write and replay when back online, or skip logging entirely if offline. **Never block the sensory experience on network.**

Register the SW in `app/layout.tsx` via a small client component that runs on mount.

---

## 11. Vercel deployment

Three env vars. Set in Vercel → Project Settings → Environment Variables, on Production AND Preview:

| Variable | Public? | Used in |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | client + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | client + server |
| `SUPABASE_SERVICE_ROLE_KEY` | **no** | `lib/supabase/service.ts` only |

The build spec uses the older variable name `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The Supabase publishable key (`sb_publishable_...`) goes here. That's correct — Supabase has been transitioning naming conventions and both work.

**`NEXT_PUBLIC_APP_URL`** is in the build spec but not required if OAuth redirects use `window.location.origin`. Use the latter — it's the pattern from Harwood Studio and works on any deployed URL without per-environment config.

`DATABASE_URL` is not needed for v1. Add it later only if you migrate to Drizzle or run direct psql migrations.

---

## 12. Branch + PR workflow

- One branch per logical change. Naming: `feat/`, `fix/`, `docs/`, `chore/`.
- Conventional commit messages.
- One PR per logical change. PR descriptions are durable context — write them as if the next AI session will read them (it will).
- Don't push to `main` directly.

```sh
npm install
npm run dev          # localhost:3000
npm run typecheck
npm run build        # production build, all routes
npm test             # vitest
```

---

## 13. Pitfalls already paid for (don't pay again)

| Pitfall | What happens | Fix |
|---|---|---|
| `interface` for DB Row types | Every `.select()` resolves to `never`. | Use `type` aliases. |
| `@supabase/ssr` v0.5.x | Imports a path that no longer exists in modern supabase-js → broken types. | Pin `@supabase/ssr ^0.10.3`. |
| Magic-link sign-in in corporate environments | Email scanners prefetch and burn the OTP. | Default to Google OAuth; keep magic link as visible secondary. |
| Supabase email rate limit | ~30 emails/hour blocks dev iteration. | If hit in prod, configure custom SMTP (Resend/SendGrid). |
| Client-side bootstrap of `ocd_users` row | Needs an INSERT RLS policy and silently fails without it. | Use the `SECURITY DEFINER` trigger on `auth.users` (already in 0001). |
| Single `layout.tsx` wraps the landing page | Auth-aware chrome shows on logged-out `/`. | Route groups: `(public)/` and `(authed)/`. |
| `headers().get('x-pathname')` in a layout | This header isn't set by Next.js by default; layout-level path detection silently fails. | Use route groups, not runtime path checks. |
| Service-role import from a client component | Leaks the service key into the client bundle. | `import "server-only"` at the top of `lib/supabase/service.ts`. |
| Touching the live DB from the AI session | Leaks credentials, generates types from prod. | Hand-write `database.ts` from migration SQL. Never run `supabase gen types`. |
| Animating session phase transitions too fast | The session feels like an app, not a sit. | Keep phase transitions 600–800ms minimum. |
| Counting sessions in UTC | Day boundary is wrong for users in Toronto. | Use `America/Toronto` midnight. `lib/utils/tz.ts`. |
| Showing a session count anywhere prominent | OCD mind optimizes it. | Settings only, with the explicit "not a score" framing. |
| Adding an icon library "for affordances" | Iconography drifts toward typical-app feel; breaks the paper aesthetic. | No icon library. The one back/home affordance is hand-drawn SVG inline. |

---

## 14. Build order for this session

This order minimizes rework. Deviate only if blocked.

1. **Bootstrap.** `npx create-next-app@latest ocd2now --typescript --tailwind --app --src-dir=false --import-alias="@/*"`. Init git, push to a new GitHub repo.
2. **Install deps.** `@supabase/supabase-js@^2.45.4`, `@supabase/ssr@^0.10.3`, `framer-motion`, `server-only`. Pin Tailwind to `^3`.
3. **Tailwind config.** Design tokens from §6. Fonts via `next/font/google` in `app/layout.tsx`.
4. **Supabase clients.** `lib/supabase/{client,server,service,middleware}.ts`. `middleware.ts` at the repo root delegating to the lib.
5. **Database types.** Hand-write `lib/types/database.ts` from the schema in build spec §8. `type` aliases, not `interface`.
6. **Migration.** Write `db/migrations/0001_ocd2now_schema.sql` (verbatim from build spec §8). Hand it to Carlos to apply via Supabase Studio SQL editor — do NOT attempt to run it from the AI session.
7. **Landing page (`/`).** Build-spec copy verbatim. Google sign-in primary, magic link secondary. Crisis link in bottom corner.
8. **Auth callback** route handler.
9. **Welcome / onboarding flow.** Three screens, the third writes `user_type` via `completeOnboarding`.
10. **`/now`** with the four frequency bands.
11. **`/session`** with all 8 invitation components and the three-phase state machine.
12. **`/end`**.
13. **`/settings`.** 7-day count with the "not a score" line. Delete-account flow.
14. **`/why`.** Single-page essay, build-spec copy.
15. **Crisis modal.** Mounted in `(authed)/layout.tsx` and on `/`. No logging.
16. **PWA.** `manifest.json`, `sw.js`, registration.
17. **README.** Setup steps + the therapeutic principles from §0 (so future contributors don't add a streak counter).
18. **Deploy to Vercel.** Hook up `ocd2now.vercel.app`.
19. **Smoke test.** Sign in → onboard → begin → session → end → reopen. All 8 invitations render. PWA installs. Crisis modal works from every screen.

If you finish early, **do not add features.** Spend the time tightening copy and the fade timing.

---

## 15. Working with Claude Code in this repo

Conventions for this and future sessions:

1. **`CLAUDE_CODE_BUILD_SPEC.md` and this playbook are the entry context.** Read both before touching code. The build spec is the *what* and *why*; this playbook is the *how*.
2. **Hand-write Supabase types from the migration SQL.** Never run `supabase gen types` from an AI session.
3. **Never include real credentials in prompts.** The four env vars live in Vercel and Carlos's password manager. The Supabase URL and publishable key in the build spec are public; the service-role key is not and never appears in any AI conversation.
4. **Branch + PR for each change.** AI sessions are good at scoped diffs; resist bundling unrelated changes.
5. **PR descriptions are durable context.** Write them for the next session.
6. **For UI changes the agent can't visually verify**, say so explicitly rather than claim success. Carlos will test on a phone and report back.
7. **If a therapeutic principle and an engineering convenience conflict, the principle wins.** This codebase is unusual — most apps optimize for retention; this one optimizes against it. Don't default to industry patterns when they violate §0.

---

## 16. What's deferred (don't re-debate in v1.x)

Explicitly out of scope, from build spec §13. Do not build any of these in this session:

- Reflections / journaling / any text input from the user
- AI chat layer inside the app (no Claude API calls)
- Push notifications
- Streaks, badges, completion states, progress bars, graphs
- Social features (sharing, groups)
- Symptom tracking (no anxiety-rate-1-to-10)
- Usage statistics dashboards beyond the 7-day count in settings
- Username / profile customization
- Multi-language support
- Native iOS/Android (PWA only)
- Stripe / payments
- Admin dashboard
- Integration with the Presence Therapy intake form (a soft link to `presencetherapy.ca/ocd` in `/why` is sufficient)

When picking up v1.1+, the highest-leverage additions are likely: more invitations (grow to 15–20 over time), subtle audio (only if it feels like ground rather than entertainment), and an integrated on-ramp to Presence Therapy intake. **Do not add any of these in v1.**

---

## 17. Quick reference: where things live

| Looking for... | File |
|---|---|
| Product intent + therapeutic principles | `CLAUDE_CODE_BUILD_SPEC.md` §1–§2 |
| Exact copy | `CLAUDE_CODE_BUILD_SPEC.md` §7 |
| Invitation specs | `CLAUDE_CODE_BUILD_SPEC.md` §6 |
| Schema | `db/migrations/0001_ocd2now_schema.sql` |
| TypeScript schema mirror | `lib/types/database.ts` |
| Auth flow | `lib/supabase/middleware.ts` + `app/auth/callback/route.ts` |
| Frequency-band logic | `lib/frequency.ts` |
| Invitation selection | `lib/invitations.ts` |
| Server actions | `lib/actions/` |
| Design tokens | `tailwind.config.ts` |
| This playbook | `docs/playbook.md` |

---

## 18. Success criteria for this session

Adapted from build spec §14. The session is successful when all of the following are true:

1. The repo is pushed to GitHub.
2. The schema SQL is in the repo and Carlos has been told (in the README or session log) to apply it via Supabase Studio.
3. The app is deployed to `ocd2now.vercel.app`.
4. A user can sign in with Google. Magic link is wired and works (or fails gracefully with a clear message).
5. A user can complete the 3-screen onboarding and land on `/now`.
6. A user can run a full session with at least one invitation rendering correctly. Ideally all 8.
7. `/settings` shows the 7-day count with the "not a score" framing and the delete-account flow works.
8. The crisis modal works from `/`, `/now`, `/session`, `/end`, `/settings`.
9. The PWA installs to home screen on iOS and Android.
10. The README is complete enough that a future contributor — human or AI — could understand and extend the app.
11. **Nothing in the deployed app violates §0.** No streaks. No badges. No completion language. No emojis. No analytics. No icon library.

If any of these fail, prioritize fixing them over adding polish.

---

If something in this playbook is wrong or outdated, **update it in the same PR that proves it wrong.** Stale playbooks are worse than missing ones.
