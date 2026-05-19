# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Reading order before changing code

1. `docs/playbook.md` — authoritative on stack, schema, auth, deployment, conventions, and pitfalls already paid for. §0 (non-negotiables), §11/§13 (pitfalls), and §17 (where things live) are the most-referenced sections.
2. `CLAUDE_CODE_BUILD_SPEC.md` — authoritative on therapeutic principles, copy, and product behavior.
3. When the two conflict, the playbook wins on engineering; the spec wins on copy and UX.

This is an unusual codebase: it intentionally optimizes *against* retention. Industry defaults (streaks, progress bars, badges, completion language, analytics) are wrong here. If a "normal" pattern violates §0 of the playbook, the principle wins — push back rather than ship it.

## Commands

```sh
npm run dev          # next dev — localhost:3000
npm run build        # production build, all routes
npm run typecheck    # tsc --noEmit (strict)
npm run lint         # next lint (eslint-config-next)
npm test             # vitest run (one-shot)
npm run test:watch   # vitest watch mode
```

Run a single test file or filter by name:

```sh
npx vitest run lib/frequency.test.ts
npx vitest run -t "classifyBand"
```

Vitest config: `node` environment, `**/*.test.ts` only, `@/*` path alias mirrors tsconfig. Tests sit next to the code they cover (e.g. `lib/frequency.test.ts`, `lib/auth/getCurrentUser.test.ts`).

There is no DB or browser in CI — tests cover pure logic (frequency bands, TZ math, fragment selection, redirect behavior). UI changes you can't visually verify, say so explicitly rather than claim success.

## Architecture

### Route groups gate auth — never `headers()` in a layout

`app/(public)/` and `app/(authed)/` are Next.js route groups. The `(authed)` segment mounts `CrisisModal` and the "Why this app" link in its layout; the gate is enforced in `middleware.ts` → `lib/supabase/middleware.ts`, which:

- Refreshes the Supabase session cookie on every request.
- Redirects unauthenticated hits on `(authed)` paths to `/`.
- Redirects authenticated hits on `/` to `/welcome` (not onboarded) or `/now` (onboarded), reading `ocd_users.onboarded_at`.
- Copies refreshed cookies onto every redirect response — without this, supabase-ssr's refreshed session is dropped and the browser oscillates (the `ERR_TOO_MANY_REDIRECTS` on `/welcome` was this bug; see `lib/supabase/middleware.ts:52-62`).

Do NOT path-detect from a layout via `headers().get('x-pathname')` — that header isn't set by default and silently fails.

### Three Supabase clients, three contexts

- `lib/supabase/client.ts` — browser `createBrowserClient`.
- `lib/supabase/server.ts` — RSC/server-action `createServerClient` reading Next.js `cookies()`.
- `lib/supabase/service.ts` — service-role client. Top of the file is `import "server-only"` — leave it. The only legitimate caller is `lib/actions/deleteAccount.ts` (which needs `auth.admin.deleteUser`). One stray import from a client component leaks the key into the bundle.

### Server actions are the mutation surface

API routes exist only for OAuth (`app/auth/callback/route.ts`). Everything else mutates through `lib/actions/*`, which returns `ActionResult<T>` from `lib/actions/_result.ts`. Conventions:

- Authorize at the top via `getCurrentUser()` (`lib/auth/getCurrentUser.ts`) — bail before touching the DB.
- `startSession` is idempotent within a 90s window — returns the existing open session rather than creating a duplicate.
- `revalidatePath()` after mutations.
- Never log user content. Crisis modal opens are NEVER persisted (privacy commitment, playbook §0.9).

### `ocd_users` auto-create via `SECURITY DEFINER` trigger

The trigger `ocd_handle_new_user` on `auth.users` INSERT creates the `ocd_users` row, bypassing RLS. `getCurrentUser` also bootstraps the row defensively under user RLS if the trigger hasn't propagated (`lib/auth/getCurrentUser.ts:25-32`). If a brand-new Google user lands on `/now` as signed-out, the trigger didn't fire — re-apply `db/migrations/0001_ocd2now_schema.sql` in Supabase Studio; do not move the bootstrap into a client component.

### Frequency-aware `/now` (server-decided, client-rendered)

`/now` is a server component. It calls `dailySessionCount(userId)` then `classifyBand(count)` (`lib/frequency.ts`) to pick `standard | pause-soft | pause-firm | threshold`, and renders the matching screen. Bands: `<4` standard, `4–6` pause-soft, `7–12` pause-firm, `13+` threshold. **Day boundary is `America/Toronto` midnight via `lib/utils/tz.ts`, not UTC.** The user never sees the count in the main flow; settings shows a 7-day count with the explicit "This number is here so you can notice patterns. It is not a score." framing.

### Session fragments (the wider vocabulary)

`/session` plays a "fragment" through a three-phase fade: arrival (0–10s) → invitation/text/silence (mid) → return (last 15s) → `/end`. Transitions are driven by `setTimeout` on a fixed clock — the session ends on time, not on user action.

Fragment kinds live in `lib/fragments.ts` (client-safe, pure data):

- `invitation` (ids 1–8) — interactive sensory exercises. Components in `components/invitations/`, registered in `components/invitations/index.ts`. **Must match the seed in `db/migrations/0001_ocd2now_schema.sql` exactly** — change both in the same commit.
- `still-text` (ids 100+) — a held line on paper bg. Has `textDefault` and optional `textOcd` variant.
- `silence` (ids 200+) — paper bg, no text. Closing comes from the standard return phase.
- `redirect-out` (ids 300+) — short, skips arrival/return; the line *is* the session (e.g. "Not now. Step outside if you can.").

`ocd_sessions.invitation_id` is the column name for historical reasons but stores any fragment id; there is no FK on it, so 100+ ids are safe.

Selection lives in `lib/fragments-select.ts` (server-only — queries Supabase). Algorithm: exclude the user's `last_invitation_id`, sort remaining fragments by 7-day usage ascending, pick uniformly from the least-used third. After picking, the action writes `ocd_users.last_invitation_id`.

### Hand-written database types

`lib/types/database.ts` is a hand-written mirror of `db/migrations/0001_ocd2now_schema.sql`. Do NOT run `supabase gen types` from this repo. When you change the SQL, update this file in the same PR.

**Use `type` aliases, not `interface`, for Row/Insert/Update shapes.** `interface` makes postgrest-js `.select()` results resolve to `never`. The `Database` type must include all five top-level keys (`Tables`, `Views`, `Functions`, `Enums`, `CompositeTypes`) to satisfy the constraint.

### Design tokens are intentionally tiny

`tailwind.config.ts` defines five colors (`paper`, `ink`, `muted`, `accent`, `accent-soft`) and two font families (`font-display` = Cormorant Garamond, `font-sans` = Inter Tight). Do not introduce new color values, do not add an icon library, do not add a chart/state/CSS-in-JS library. The single back/home affordance is hand-drawn inline SVG.

## Conventions specific to this codebase

- **No analytics packages.** Not PostHog, Mixpanel, GA, Amplitude, Sentry-with-breadcrumbs — not even "anonymous" ones (playbook §0.10).
- **No streak counter, ever.** `ocd_users.total_sessions` is a soft internal marker — never rendered as a number to optimize against.
- **Crisis modal opens are never logged.** Pure client overlay, no telemetry, no row.
- **Copy rules** (playbook §7): no exclamation marks, no emojis, no completion language ("you did it" / "great job"), no "without judgment" / "let go" — use "involuntary," "observe," "unfolds," "is here." Errors are quiet: "Something didn't work. Try again, or come back later." Crisis copy is direct, never euphemistic.
- **Animation timing matters.** Session phase transitions are 600–800ms on purpose. Don't "speed them up."
- **One branch per logical change.** Conventional commit messages.
- **OAuth redirects use `window.location.origin`** — no `NEXT_PUBLIC_APP_URL` needed.

## Environment variables

Three only, set in Vercel (Production + Preview) and `.env.local`:

| Variable | Public? | Used in |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | client + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | client + server |
| `SUPABASE_SERVICE_ROLE_KEY` | **no** | `lib/supabase/service.ts` only |

`DATABASE_URL` is not used. `NEXT_PUBLIC_APP_URL` is not used.

## Telephony (SMS, voice)

This app does NOT talk to Twilio, Retell, or any telephony provider directly.
All SMS and voice flows through `ahc-switchboard`.

**Before writing any messaging code, read:**
https://github.com/torontocarlos/ahc-switchboard/blob/main/docs/integration-guide.md

**Specifically you must:**
- Use `SWITCHBOARD_TOKEN` (issued at app registration) — not Twilio credentials
- Call `POST /api/sms/send` on switchboard for outbound SMS
- Implement an HMAC-signed inbound webhook if this app needs to receive replies
- Treat `status: "blocked"` (200 OK) as a normal response, not an error
- Pass `idempotency_key` for any cron-driven sends

If you find the Twilio SDK installed in this app's package.json or `TWILIO_*` env
vars in this app's Vercel project, that's a bug — they should not be here.
