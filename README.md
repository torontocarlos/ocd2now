# OCD2Now

A somatic companion app for people with OCD. Built by Presence Therapy
Institute / Ajax Harwood Clinic.

OCD2Now is a small app for the moments when the loop has you. Open it. Sit
through one short experience. Go back to your life. No streaks. No badges. No
things to do correctly. Just a way back to here.

Before touching code, read in this order:

1. `docs/playbook.md` — the developer master playbook (authoritative on
   engineering decisions)
2. `CLAUDE_CODE_BUILD_SPEC.md` — the original product spec (authoritative on
   therapeutic principles, copy, and product behavior)

When the two conflict, the playbook wins on stack/schema/auth/deployment, and
the spec wins on copy and what the user experiences.

## Therapeutic principles (do not violate)

Summarized from the playbook §0 and the build spec §2. If a UX choice
violates one of these, the choice is wrong.

1. All tendencies are involuntary. Language never says "without judgment,"
   "let go," "choose to," "decide to." It says "involuntary," "observe,"
   "unfolds," "is here," "is happening."
2. No completion states. No streaks. No badges. No graphs. No progress bars.
3. Sessions end definitively, not gradually.
4. The app names its own compulsion risk during onboarding and at frequency
   thresholds.
5. The app gets quieter over time, not louder.
6. The app's purpose is to graduate the user, not retain them.
7. No emojis. No icons except a single back/home affordance and the
   bottom-corner crisis link.
8. No streak counter, ever. `total_sessions` on `ocd_users` is a soft
   internal marker; it is **never** rendered to the user as a number to
   optimize.
9. Crisis modal opens are NEVER logged.
10. No analytics packages. Not even "anonymous" ones.

## Stack

- Next.js 14 (App Router), TypeScript strict
- Tailwind v3 (NOT v4)
- Supabase Auth + Postgres (`ajax-harwood-clinic` project)
- `@supabase/ssr` ^0.10.3, `@supabase/supabase-js` ^2.45.4
- `framer-motion`
- Vercel hosting, PWA (`manifest.json` + `sw.js`)

## Local development

```sh
npm install
cp .env.local.example .env.local
# fill in real keys (see "Environment variables" below)
npm run dev
```

Then `http://localhost:3000`.

```sh
npm run typecheck
npm run build
npm test
```

## Environment variables

Three variables, all set in Vercel → Project Settings → Environment Variables
(Production AND Preview), and locally in `.env.local`:

| Variable | Public? | Used in |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | client + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | client + server |
| `SUPABASE_SERVICE_ROLE_KEY` | **no** | `lib/supabase/service.ts` only — `deleteAccount` |

The service-role key never appears in client code. `lib/supabase/service.ts`
declares `import "server-only"` at the top, which hard-fails the build if
anything client-side imports it.

## One-time setup (Carlos)

These steps require Supabase, Google Cloud, and Vercel access — they are
done by hand, not by the AI session.

### 1. Apply the database migration

The schema lives at `db/migrations/0001_ocd2now_schema.sql`. Apply it via
Supabase Studio:

1. Open <https://supabase.com/dashboard/project/ankuggxttctidyuupesp/sql>
2. Paste the contents of `0001_ocd2now_schema.sql` into a new query
3. Run

The migration is idempotent — safe to re-run if you need to.

It creates:

- `ocd_users` (extends `auth.users` via FK)
- `ocd_sessions`
- `ocd_invitations` (seeded with the 8 v1 invitations)
- RLS policies (`auth.uid() = id` for users, `auth.uid() = user_id` for
  sessions, public-read for invitations)
- Trigger `ocd_handle_new_user` on `auth.users` INSERT (SECURITY DEFINER) —
  auto-creates the `ocd_users` row on first sign-in.

After applying, sign in once with Google to confirm the trigger fires and an
`ocd_users` row appears. If a brand-new user appears as "signed-out" on
`/now` after sign-in, the trigger didn't fire — re-run the migration.

### 2. Set up Google OAuth

OCD2Now uses Google OAuth as the primary sign-in method. Magic link is the
secondary fallback (already enabled by default in Supabase Auth).

**a. Google Cloud Console**

1. Go to <https://console.cloud.google.com/apis/credentials>
2. Create or select a project (e.g., "OCD2Now")
3. Click **Create credentials → OAuth client ID**
4. Application type: **Web application**
5. Name: `OCD2Now`
6. **Authorized JavaScript origins:**
   - `https://ocd2now.vercel.app`
   - `http://localhost:3000`
7. **Authorized redirect URIs:**
   - `https://ankuggxttctidyuupesp.supabase.co/auth/v1/callback`
8. Click **Create**. Copy the Client ID and Client Secret.

**b. Supabase Studio**

1. Open <https://supabase.com/dashboard/project/ankuggxttctidyuupesp/auth/providers>
2. **Google** → toggle on, paste Client ID and Secret, save.
3. Open <https://supabase.com/dashboard/project/ankuggxttctidyuupesp/auth/url-configuration>
4. Under **Redirect URLs**, add:
   - `https://ocd2now.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback`
5. Save.

### 3. Deploy to Vercel

1. Push the repo to GitHub.
2. Open <https://vercel.com/new> and import the repo.
3. Framework preset: **Next.js**. Leave build/install commands as defaults.
4. Under **Environment Variables**, add the three variables from the table
   above. Set them on **both** Production and Preview.
5. Deploy.
6. Vercel → Project → Settings → Domains → add `ocd2now.vercel.app` (or your
   custom domain). If you change the domain, update the Google Cloud
   "Authorized JavaScript origins" and the Supabase redirect-URL allow-list
   to match.

If magic-link emails hit Supabase's ~30/hr rate limit in production,
configure custom SMTP via Resend or SendGrid (Authentication → Email
Templates → SMTP Settings) before disabling magic link.

### 4. (Optional) Regenerate the PWA icons

`public/icon.svg` is the source of truth for the brand mark. Browser
favicons and the PWA manifest reference it directly. The PNG fallbacks
in `public/icon-192.png` and `public/icon-512.png` are committed and
should be regenerated from the SVG whenever it changes:

```sh
npm run icons
```

This rasterizes `public/icon.svg` into both PNG sizes via `sharp`. Run
it once locally after editing the SVG; the output is byte-stable.

The Open Graph share image (`/opengraph-image`) and apple-touch icon
(`/apple-icon`) are generated dynamically by Next at request time and
cached at the edge — no manual step needed.

## Project layout

See `docs/playbook.md` §2 for the full layout. Highlights:

```
app/
├── (public)/                  logged-out routes
│   ├── page.tsx               / — landing + sign-in
│   └── why/page.tsx           /why — single-page essay
├── (authed)/                  member routes (gated by middleware)
│   ├── welcome/               /welcome — 3-screen onboarding
│   ├── now/                   /now — frequency-aware home
│   ├── session/               /session — 3-phase sensory invitation
│   ├── end/                   /end — close screen
│   └── settings/              /settings
└── auth/callback/route.ts     OAuth code exchange

lib/
├── supabase/                  client / server / service / middleware
├── actions/                   server actions (start/end/onboard/delete/signOut)
├── auth/                      getCurrentUser
├── invitations.ts             selection algorithm
├── frequency.ts               daily / 7-day count + band classifier
├── types/database.ts          hand-written mirror of the migration SQL
└── utils/tz.ts                America/Toronto day boundary

components/
├── CrisisModal.tsx
├── BeginButton.tsx
├── PauseScreen.tsx            4–6 / 7–12 daily session bands
├── ThresholdScreen.tsx        13+ daily sessions
├── GoogleSignInButton.tsx
├── MagicLinkForm.tsx
├── RotatingLine.tsx
└── invitations/               1 file per invitation + index.ts registry

db/migrations/0001_ocd2now_schema.sql
public/manifest.json
public/sw.js
middleware.ts
```

## Conventions

- Server actions for mutations. API routes only for OAuth callbacks.
- Hand-written database types (`lib/types/database.ts`). Never run
  `supabase gen types` from an AI session.
- `type` aliases, not `interface`, for DB Row shapes. Using `interface`
  causes postgrest-js results to resolve to `never`.
- One branch per logical change. Conventional commits.
- No analytics, ever. No icon library, no chart library, no state library.
- See `docs/playbook.md` §0, §11, §13 for the full list of pitfalls already
  paid for.

## Out of scope for v1

Streaks, badges, journaling, AI chat, push, native shells, social, payments,
multi-language. See playbook §16 / build spec §13.
