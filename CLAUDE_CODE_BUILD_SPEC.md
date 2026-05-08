# OCD2Now — Claude Code Build Spec (MVP, Single Session)

**Owner:** Dr. Carlos Yu, Ajax Harwood Clinic / Presence Therapy Institute
**Build target:** Production MVP, deployable to Vercel, in one Claude Code session
**Deploy URL target:** ocd2now.vercel.app

---

## 1. What this app is, in one paragraph

OCD2Now is a longitudinal somatic companion app for people with OCD. When a user is absorbed in an obsessive loop, they open the app and are guided through a 60–90 second sensory experience that breaks attentional capture by the loop and returns them to the present moment. The app is explicitly designed to *resist becoming a compulsion* — sessions are short, end definitively, have no completion states, and the app actively notices and reflects high-frequency use back to the user. Over weeks, the app earns the right to invite users into in-person Presence Therapy at Ajax Harwood Clinic. The therapeutic claim of the name is the entire arc: from being absorbed in OCD, back to now.

---

## 2. Therapeutic principles (these drive every design decision)

These are non-negotiable. If a UX choice violates one of these, the choice is wrong.

1. **All tendencies are involuntary brain processes.** The thoughts, the urges, the not-acting, even the reaching for the app — all unfolding on their own. Language throughout reflects this. Avoid: "without judgment," "let go," "choose to," "decide to." Use: "involuntary," "observe," "unfolds," "is here," "is happening."

2. **Words are minimized at the moment of acute use.** A user in a loop has 2 seconds before they bounce. The app must drop them into a sensory experience immediately, not a screen of instructions.

3. **The app cannot be done correctly.** No streaks. No badges. No completion states. No graphs. No "you finished today's practice." Every variable that could be optimized by an OCD mind is removed.

4. **Sessions end definitively, not gradually.** After ~60–90s the experience closes itself with a clear "go back to your life" message. The user must deliberately re-open. This structurally prevents staying-in-the-app.

5. **The app names its own compulsion risk.** During onboarding and at usage thresholds, the app honestly tells the user: this can become another compulsion, and we've designed against that, but you should know.

6. **The app gets quieter as the relationship deepens.** Week 1 has more orienting language. Week 12 has almost none. The deeper the practice, the more the app gets out of the way.

7. **The app's purpose is to graduate the user, not retain them.** Eventual on-ramp to in-person Presence Therapy is the success state, not engagement metrics.

---

## 3. Stack and architecture

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Deployed to Vercel
- PWA-installable (manifest + service worker)
- Works offline for core sensory experiences

**Backend:**
- Supabase project: `ajax-harwood-clinic` (existing)
- URL: `https://ankuggxttctidyuupesp.supabase.co`
- All tables prefixed `ocd_`
- Supabase Auth: Google OAuth primary, magic link fallback
- Row-Level Security (RLS) on every table

**Repo:**
- New GitHub repo, public or private at user's choice
- Standard `.gitignore` for Next.js
- Deploy via Vercel GitHub integration

**Environment variables (Vercel):**
```
NEXT_PUBLIC_SUPABASE_URL=https://ankuggxttctidyuupesp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_lnkgjIPvkTCPQbzYLx3nyw_La0gcpCt
NEXT_PUBLIC_APP_URL=https://ocd2now.vercel.app
```

---

## 4. Visual design

**Aesthetic:** Quiet, warm, paper-like. Shares the visual language of presencetherapy.ca and the OCD landing pages already built.

**Palette:**
- Paper background: `#f4f0e8`
- Ink (primary text): `#1a1815`
- Muted text: `#6b6358`
- Accent (used sparingly): `#7a3b2e` (warm rust)
- Soft accent background: `rgba(122, 59, 46, 0.08)`

**Typography:**
- Display/headings: Cormorant Garamond (Google Fonts) — light weight, italic for emphasis
- Body/UI: Inter Tight (Google Fonts) — light to medium weights
- Body text generally 16–17px, line-height 1.6, max-width ~620px for readability

**Mobile-first.** This will be used primarily on phones. All layouts work in 375px width minimum.

**Generous whitespace.** Padding 24–32px around content. Never cramped.

**No emojis. No icons except a single "back/home" affordance and the bottom-corner crisis link.**

---

## 5. App map (screens)

### 5.1 Routes

```
/                  Marketing landing (logged-out home) + sign-in
/auth/callback     OAuth callback handler
/welcome           First-time onboarding (3 screens)
/now               Authenticated home — the "open the app in a loop" entry
/session           The active sensory experience (60–90s)
/end               Session closing screen
/settings          Account, sign out, delete data, crisis resources
/why               One-page explainer (linked sparingly)
```

### 5.2 Screen-by-screen behavior

#### `/` — Logged-out landing

A single screen. Quiet. Mobile-first.

**Header:** "OCD2Now"
**Sub:** "From the loop, back to here."
**Body:** Three short paragraphs (see exact copy in §7).
**CTAs:** "Continue with Google" (primary, large), "Email me a sign-in link" (secondary).
**Bottom corner:** Small "I need help right now" link → opens crisis modal.
**Footer:** "Presence Therapy Institute · Ajax Harwood Clinic"

#### `/welcome` — Onboarding (3 screens, swipe-style or sequential)

**Screen 1: Acknowledgment**
"This app was built for people with OCD. If that's you, you're in the right place. If you're not sure but the loops feel like they own you sometimes — also the right place."

**Screen 2: The honest disclosure**
"OCD turns helpful things into compulsions. This app is no exception. We've designed it to resist that — short sessions, no streaks, no things to do correctly. But if you find yourself opening this many times a day, that's not the app working. That's the OCD finding the app. We'll notice it together."
[Continue]

**Screen 3: The one question**
"Are you here because of OCD?"
[ Yes ] [ Not sure ] [ No, anxiety / something else ]
This sets `ocd_users.user_type` and shifts language for OCD users throughout.

After these three screens, route to `/now`.

#### `/now` — The home screen for authenticated users

This is what the user sees when they open the app in a loop. **It must drop them into action in under 2 seconds.**

Layout:
- Top: small "Now" wordmark, top-left
- Center: a single, large, soft button — "Begin"
- Below the button, in muted text: a single rotating line of orienting language. Examples: "Whatever is here, is here." / "You don't have to fix this." / "The reaching for this is also unfolding."
- Bottom-left corner: small "Why this app" link → `/why`
- Bottom-right corner: small "Help right now" link → crisis modal
- Top-right: small gear icon → `/settings`

**Frequency-aware behavior on `/now`:**
- Sessions today < 4 → standard "Begin" button as above
- Sessions today = 4–6 → before "Begin" appears, a soft pause screen for ~3 seconds: "Your hand reached for this. That reaching is also unfolding on its own. Sit a moment before what's next." Then "Begin" appears.
- Sessions today = 7–12 → longer pause screen with text: "You've come here many times today. This is information, not failure. Consider texting one person you trust, or stepping outside, before opening another session." Two buttons: "Continue anyway" / "Step away for now."
- Sessions today = 13+ → screen says: "This is more than this app was built for. The deeper version of this work is in person. When you're ready, here's the door." Two buttons: "Tell me about Presence Therapy" / "I just need to ground right now." Continuing to session is allowed but the framing shifts.

#### `/session` — The active experience

When user taps "Begin," route here. The session has three phases.

**Phase 1 (0–10s) — Arrival:**
A single line fades in slowly: *"You're here. Whatever brought you here is here too."*
After ~5 seconds, a sensory invitation is randomly selected (see §6) and begins.

**Phase 2 (10–75s) — The invitation:**
The selected sensory experience plays out. See §6 for the library.

**Phase 3 (75–90s) — The return:**
The invitation completes. A new screen fades in: *"Enough for now."*
After ~3 seconds: *"Whatever you were doing before — go do that next."*
A single button: "I'm done." → `/end`

The user can tap to skip ahead at any time. They cannot extend.

#### `/end` — Session close

A quiet screen with a single line: *"That was here. Now this is here."*
Below: a single button — "Close." Tapping closes the PWA or returns to `/now`.
**No "you completed a session." No counter. No streak.**

#### `/settings`

Minimal:
- Email address (read-only)
- Sign out
- "How often have I opened this?" — shows ONLY a 7-day count, not a graph or history. Includes a line: "This number is here so you can notice patterns. It is not a score."
- "Delete my account" — fully erases user from `ocd_users` and all related rows. Confirms with a single check.
- Crisis resources (always visible)
- Tiny credit line: "Built by Presence Therapy Institute · Ajax Harwood Clinic"

#### `/why`

A single-page essay-style explainer. ~400 words. Explains the design philosophy (involuntariness, not-doing, the compulsion-resistance design). Ends with a soft link to presencetherapy.ca/ocd. This page is intentionally not promoted; users find it via the bottom-corner link. The content matches the OCD landing page voice (already built).

#### Crisis modal (accessible from any screen)

Triggered by the "Help right now" link. Overlay, dark background. Lists, in plain text:
- 988 — Suicide Crisis Helpline (call or text)
- 1-800-742-1890 — Durham Mental Health Crisis Line
- "If you are in immediate danger, call 911 or go to your nearest ER"
- "Dr. Yu's clinic: 905-683-0690 (Monday–Friday business hours)"

Single "Close" button. No tracking, no logging of crisis modal opens.

---

## 6. The sensory invitation library (v1)

Eight invitations. The app rotates through them with weighted randomization (see §8). Each is 60–75 seconds of pure sensory-attentional experience. **No instructions during the experience itself — only minimal text cues.**

### Invitation 1: "Three sounds"
- Black background, single line of text fades in: "Three sounds in the room you didn't notice."
- 60 seconds of silence (well, of the user listening).
- Three soft chimes mark roughly 20-second intervals (subtle audio, optional/togglable).
- Final text: "Sounds were happening. They didn't need you."

### Invitation 2: "Cold water"
- Text: "If there's a sink near you, run cold water on your hands or wrist."
- Below: "If not, this works too." (acknowledges they may be away from water)
- A simple visual: slow-moving abstract water-like animation (looped, low CPU)
- 60 seconds.
- Final text: "Sensation arrived. The brain noticed. That's all that's needed."

### Invitation 3: "Five contacts"
- Text fades in line by line, one every ~10 seconds:
  - "Feet on the ground."
  - "Hips in the chair (or wherever they are)."
  - "Hands wherever your hands are."
  - "Breath, wherever it's happening."
  - "Weight pulling down."
- Final text: "All of that was already here."

### Invitation 4: "One slow exhale"
- Visual: a soft circle expands and contracts very slowly. Inhale ~4s, exhale ~6s. No counting numbers shown — just the visual.
- No instruction. Just the breathing visual for 60 seconds.
- Optional small line below in muted text: "Follow if you like. Or don't. The breathing was already happening."
- Final text: "The body breathes itself."

### Invitation 5: "Eyes around the room"
- Text: "Let your eyes move around the room. Don't look for anything. Just see what they land on."
- 45 seconds of silence on screen.
- Final text: "The eyes moved on their own. The seeing was involuntary."

### Invitation 6: "Bilateral tap"
- Text: "Cross your arms over your chest. Tap your shoulders, alternating. Slow."
- Visual: a soft pulsing dot, alternating left and right at ~1Hz.
- 60 seconds.
- Final text: "The rhythm was here. The taps were happening. Notice."

### Invitation 7: "What's hottest, what's coolest"
- Text: "Find one place on your body that feels warmer than the rest. And one that feels cooler."
- 45 seconds of stillness on screen.
- Final text: "Sensation was unfolding all along. The brain just turned to look."

### Invitation 8: "The next sound"
- Text: "Wait for the next sound."
- Black screen. Silent (no chimes).
- After ~30 seconds, even if nothing happens: text fades in: "Whether a sound came or not, the waiting was happening."
- 60 seconds total.
- Final text: "You were here, listening. That's enough."

**Implementation note:** Each invitation should be its own React component, in `/components/invitations/`. The `/session` page imports them and renders one based on the weighted selection.

**OCD-aware language variants:** For users who selected "Yes, OCD" in onboarding, the final text of each invitation has a slightly different version that emphasizes involuntariness more strongly. Example: Invitation 1's standard ending is "Sounds were happening. They didn't need you." For OCD users: "Sounds were happening. The hearing was involuntary. The not-acting on what you heard was also involuntary."

---

## 7. Exact copy library

**Landing page (`/`) body:**

> OCD2Now is a small app for the moments when the loop has you.
>
> Open it. Sit through one short experience. Go back to your life.
>
> No streaks. No badges. No things to do correctly. Just a way back to here.

**Sign-in CTA primary:** "Continue with Google"
**Sign-in CTA secondary:** "Email me a sign-in link instead"

**Magic link sent confirmation:** "Sent. Check your inbox. The link works once."

**Welcome screen 1:** (see §5.2)
**Welcome screen 2:** (see §5.2)
**Welcome screen 3:** (see §5.2)

**Now screen rotating lines:**
- "Whatever is here, is here."
- "You don't have to fix this."
- "The reaching for this is also unfolding."
- "Nothing to do correctly."
- "The brain is braining. That's what brains do."
- "You arrived. That's what mattered."

**Pause screen (4–6 sessions):** "Your hand reached for this. That reaching is also unfolding on its own. Sit a moment before what's next."

**Pause screen (7–12 sessions):** "You've come here many times today. This is information, not failure. Consider texting one person you trust, or stepping outside, before opening another session."

**Threshold screen (13+):** "This is more than this app was built for. The deeper version of this work is in person. When you're ready, here's the door."

**Session phase 1:** "You're here. Whatever brought you here is here too."

**Session phase 3 line 1:** "Enough for now."
**Session phase 3 line 2:** "Whatever you were doing before — go do that next."

**End screen:** "That was here. Now this is here."

**`/why` page** (~400 words, write to match presencetherapy.ca voice):

> ## Why this app is the way it is
>
> Most apps want you to stay. We want you to leave.
>
> OCD lives in loops. The thought arrives. The discomfort follows. The brain offers a way to neutralize the discomfort — wash, check, count, review, reassure. The compulsion is brain activity, doing what brains do. None of it was chosen.
>
> Anything you *do* to feel better in response to an intrusive thought can be absorbed by the OCD logic and turned into another compulsion. This is the central trap, and it's why so many self-help tools, mindfulness practices, and grounding apps quietly worsen OCD over time. The user starts opening the app every time the thought comes. Doing the exercise correctly. Feeling relief. The brain learns: thought → app → relief. The compulsion has just changed costume.
>
> We built OCD2Now to resist this.
>
> Sessions are short — 60 to 90 seconds. They end definitively. There is nothing to complete. There are no streaks, no badges, no graphs. The app does not get more elaborate as you use it more — it gets quieter. If you open it many times in a day, the app will gently notice that with you. If you cross a threshold, it will suggest you reach out to a person, not the app.
>
> The experiences inside are not techniques. They are sensory invitations. Sounds were already happening. Your eyes were already moving. The breath was already breathing itself. The app is just a quiet space to turn and notice.
>
> The framing matters. All tendencies — to do, to not do, to try, to control, even the reaching for this app — are involuntary brain processes. The brain is braining. Awareness unfolds on its own. The not-acting on a thought is also involuntary. There is nothing to do correctly because there is nothing being done.
>
> This app cannot replace evidence-based OCD treatment. Exposure and Response Prevention (ERP) and, in many cases, medication remain first-line care. If you have not had access to ERP, you should — and the bottom of this page links to resources.
>
> What this app *is* is a small piece of a larger practice called Presence Therapy. If something here lands for you, there's a fuller version — group sessions, in person, in Ajax, OHIP-covered. The link below opens that door, when you're ready.
>
> [Learn more about Presence Therapy →](https://presencetherapy.ca/ocd)
> [ERP and OCD resources →](https://presencetherapy.ca/ocd-for-clinicians)

---

## 8. Database schema

Run as migration against `ajax-harwood-clinic` Supabase project. All tables RLS-enabled.

```sql
-- =====================================================================
-- OCD2Now schema — ocd_ prefix tables in ajax-harwood-clinic project
-- =====================================================================

-- 1. Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS ocd_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  user_type TEXT CHECK (user_type IN ('ocd', 'unsure', 'other', 'unset')) DEFAULT 'unset',
  onboarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Soft markers for the app to know its user, not shown back to user
  total_sessions INT DEFAULT 0,
  weeks_active INT DEFAULT 0,
  last_invitation_id INT,
  on_ramp_shown_at TIMESTAMPTZ
);

-- 2. Sessions table — every app session logged
CREATE TABLE IF NOT EXISTS ocd_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES ocd_users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  invitation_id INT,
  completed BOOLEAN DEFAULT FALSE,
  -- Frequency band at the time the session was started
  -- (helpful for understanding which sessions were under what pressure)
  daily_session_count_at_start INT
);

-- 3. Invitation library (sensory experiences)
CREATE TABLE IF NOT EXISTS ocd_invitations (
  id INT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  duration_seconds INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- Seed the 8 v1 invitations
INSERT INTO ocd_invitations (id, slug, title, duration_seconds) VALUES
  (1, 'three-sounds', 'Three sounds', 60),
  (2, 'cold-water', 'Cold water', 60),
  (3, 'five-contacts', 'Five contacts', 50),
  (4, 'one-exhale', 'One slow exhale', 60),
  (5, 'eyes-around', 'Eyes around the room', 45),
  (6, 'bilateral-tap', 'Bilateral tap', 60),
  (7, 'hot-cool', 'What''s hottest, what''s coolest', 45),
  (8, 'next-sound', 'The next sound', 60)
ON CONFLICT (id) DO NOTHING;

-- 4. Crisis modal opens — NOT logged. Intentional. Privacy.

-- =====================================================================
-- Row-level security
-- =====================================================================

ALTER TABLE ocd_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocd_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocd_invitations ENABLE ROW LEVEL SECURITY;

-- Users can only see/modify their own row
CREATE POLICY "Users see own row" ON ocd_users
  FOR ALL USING (auth.uid() = id);

-- Users can only see/modify their own sessions
CREATE POLICY "Users see own sessions" ON ocd_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Invitations are read-only public
CREATE POLICY "Invitations readable" ON ocd_invitations
  FOR SELECT USING (TRUE);

-- =====================================================================
-- Trigger: create ocd_users row when auth.users row is created
-- =====================================================================

CREATE OR REPLACE FUNCTION ocd_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO ocd_users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS ocd_on_auth_user_created ON auth.users;
CREATE TRIGGER ocd_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION ocd_handle_new_user();

-- =====================================================================
-- Useful index
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_ocd_sessions_user_started
  ON ocd_sessions (user_id, started_at DESC);
```

---

## 9. Invitation selection logic

When the user begins a session, select an invitation server-side (or in a Server Component) using this logic:

```typescript
async function selectInvitation(userId: string): Promise<number> {
  // 1. Get all active invitations
  const { data: invitations } = await supabase
    .from('ocd_invitations')
    .select('id')
    .eq('is_active', true);

  // 2. Get user's last invitation to avoid immediate repeat
  const { data: user } = await supabase
    .from('ocd_users')
    .select('last_invitation_id')
    .eq('id', userId)
    .single();

  // 3. Get user's recent invitation history (last 7 days)
  const { data: recent } = await supabase
    .from('ocd_sessions')
    .select('invitation_id')
    .eq('user_id', userId)
    .gte('started_at', new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString());

  // 4. Filter: not last_invitation_id, prefer least-used in past 7 days
  const recentCounts = new Map<number, number>();
  recent?.forEach((r) => {
    recentCounts.set(r.invitation_id, (recentCounts.get(r.invitation_id) || 0) + 1);
  });

  const eligible = invitations
    .filter((i) => i.id !== user?.last_invitation_id)
    .map((i) => ({ id: i.id, count: recentCounts.get(i.id) || 0 }))
    .sort((a, b) => a.count - b.count);

  // 5. Pick from the least-used third, randomly
  const cutoff = Math.max(1, Math.floor(eligible.length / 3));
  const pool = eligible.slice(0, cutoff);
  return pool[Math.floor(Math.random() * pool.length)].id;
}
```

This keeps invitations varied (preventing routinization) while still rotating through the full library over time.

---

## 10. File structure to generate

```
ocd2now/
├── .env.local.example
├── .gitignore
├── README.md
├── next.config.js
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── icon-192.png           # placeholder, user will replace
│   ├── icon-512.png           # placeholder
│   └── sw.js                  # service worker for offline
├── app/
│   ├── layout.tsx             # root layout, fonts, theme
│   ├── globals.css            # Tailwind + design tokens
│   ├── page.tsx               # / — landing/sign-in
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts       # OAuth callback handler
│   ├── welcome/
│   │   └── page.tsx           # 3-screen onboarding
│   ├── now/
│   │   └── page.tsx           # authenticated home
│   ├── session/
│   │   └── page.tsx           # active session
│   ├── end/
│   │   └── page.tsx           # session close
│   ├── settings/
│   │   └── page.tsx
│   └── why/
│       └── page.tsx
├── components/
│   ├── CrisisModal.tsx
│   ├── BeginButton.tsx
│   ├── PauseScreen.tsx
│   ├── ThresholdScreen.tsx
│   ├── invitations/
│   │   ├── ThreeSounds.tsx
│   │   ├── ColdWater.tsx
│   │   ├── FiveContacts.tsx
│   │   ├── OneExhale.tsx
│   │   ├── EyesAround.tsx
│   │   ├── BilateralTap.tsx
│   │   ├── HotCool.tsx
│   │   └── NextSound.tsx
│   └── invitations/index.ts   # registry mapping id → component
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # browser client
│   │   ├── server.ts          # server client
│   │   └── middleware.ts      # session handling
│   ├── invitations.ts         # selection logic from §9
│   └── frequency.ts           # daily session count helpers
├── middleware.ts              # Next.js middleware for auth
└── supabase/
    └── migrations/
        └── 001_ocd2now_schema.sql  # the schema from §8
```

---

## 11. Implementation notes for Claude Code

### Auth setup (Supabase + Google OAuth)

1. In the Supabase dashboard for `ajax-harwood-clinic`, go to Authentication → Providers
2. Enable Google. (The user will need to set up a Google Cloud OAuth credential — provide instructions in README.)
3. Magic link is enabled by default in Supabase Auth; nothing extra needed.
4. Set redirect URL: `https://ocd2now.vercel.app/auth/callback`
5. For local dev, also allow `http://localhost:3000/auth/callback`

Use `@supabase/ssr` package for Next.js 14 App Router auth. Reference: https://supabase.com/docs/guides/auth/server-side/nextjs

### PWA setup

- `public/manifest.json` with name "Now", short_name "Now", display "standalone", theme_color "#f4f0e8", background_color "#f4f0e8"
- Simple service worker (`public/sw.js`) caching the core app shell + invitation components for offline use
- Register service worker in root layout

### Frequency tracking

The `daily_session_count_at_start` should be calculated when a session begins, by counting `ocd_sessions` rows for that user with `started_at >= today_at_midnight_user_local_time`. The `/now` page reads this count and chooses which screen to show (standard, pause, threshold).

### Crisis modal

A simple React component, mounted in the root layout, accessible via context or a global state. Triggered by any "Help right now" link. **Crisis modal opens are NOT logged** — this is deliberate for privacy.

### Animation library

Use Framer Motion (`framer-motion`) for the fade transitions. Keep animations slow (300–800ms) and subtle. The app should feel calm, not snappy.

### What NOT to install

- No analytics packages (no Posthog, no Mixpanel, no Google Analytics)
- No error tracking that captures user content (Sentry is fine but configure to NOT capture state/breadcrumbs that contain user text)
- No marketing/email tools beyond Supabase Auth's magic link emails
- No social login except Google in v1

### README content

The README should include:
- What this is (one paragraph)
- Local dev setup
- Environment variables required
- Supabase setup steps including Google OAuth credential creation
- Vercel deployment steps
- The therapeutic principles from §2 (so future contributors don't add a streak counter)

---

## 12. Build order in this Claude Code session

Suggested sequence — Claude Code can adapt:

1. **Bootstrap**: `npx create-next-app@latest ocd2now --typescript --tailwind --app`, init git, push to new GitHub repo
2. **Install deps**: `@supabase/supabase-js`, `@supabase/ssr`, `framer-motion`
3. **Tailwind config**: design tokens, fonts via Google Fonts in layout.tsx
4. **Supabase clients**: `lib/supabase/client.ts`, `lib/supabase/server.ts`, middleware
5. **Schema**: write the migration file, then RUN it against the Supabase project (Claude Code can use the Supabase CLI or psql with the connection string the user provides)
6. **Landing page** (`/`) with Google sign-in + magic link fallback
7. **Auth callback** route handler
8. **Welcome/onboarding** flow
9. **Now page** with frequency-aware logic
10. **Session page** + the 8 invitation components
11. **End page**
12. **Settings + Why + Crisis modal**
13. **PWA manifest + service worker**
14. **README**
15. **Deploy to Vercel**, hook up domain `ocd2now.vercel.app`
16. **Smoke test the full flow**: sign in → onboard → begin → session → end → reopen, all working

---

## 13. Things explicitly NOT in v1 (defer to v2+)

For Claude Code: do **not** build any of these in this session.

- Reflections / journaling / text input of any kind
- AI chat layer (no Claude API calls inside the app)
- Push notifications
- Streaks, badges, completion states, progress bars, graphs
- Social features (sharing, groups)
- Symptom tracking (no anxiety-rate-1-to-10)
- Usage statistics dashboards shown to user (only the simple 7-day count in settings)
- Accounts that allow username/profile customization
- Multi-language support
- Native iOS/Android apps (PWA only)
- Stripe / payments
- Admin dashboard
- Integration with the Presence Therapy intake form (a single soft link to presencetherapy.ca/ocd is sufficient in v1)

---

## 14. Success criteria for this session

The session is successful when:

1. The repo is pushed to GitHub
2. The schema is applied to `ajax-harwood-clinic`
3. The app is deployed to `ocd2now.vercel.app`
4. A user can sign in with Google (or magic link)
5. A user can complete onboarding
6. A user can run through a full session with at least one of the 8 invitations rendering correctly
7. A user can see the settings page and sign out
8. The crisis modal works from any screen
9. The PWA installs to home screen on mobile
10. The README is complete enough that someone else could understand and contribute

If any of these fail, prioritize fixing them over adding polish or additional invitations.

---

## 15. Post-session — for Carlos

After this Claude Code session completes, you'll have a working MVP. Test it yourself for a week. Things to watch for:

- Does the "Begin" feel fast enough on a phone?
- Do the invitations actually feel different from each other, or do they blur?
- Does the session feel too short, too long, or right?
- Does the pause screen at 4–6 sessions feel caring or annoying?
- Does the language ever drift toward instructional/technique-y? (If yes, it needs editing.)

Then decide what v2 adds — most likely candidates:
- More invitations (grow the library to 15–20 over time)
- Subtle audio (chimes, low ambient drones — only if they feel like ground rather than entertainment)
- Reflection layer (with end-to-end encryption if added)
- A real on-ramp integration with the Presence Therapy intake form
- An admin view for you to see, in aggregate (no individual data), how the app is being used — to inform the in-person practice

Iterate slowly. The slowness is the practice.

---

## End of build spec.

This document is a single Claude Code prompt. Paste it. Let it run. Ask clarifying questions only if a step in §12 is genuinely blocked.
