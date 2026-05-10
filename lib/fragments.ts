// Session fragments: the wider vocabulary of what a session can be.
//
// A "fragment" is whatever the app delivers when the user opens a session.
// v1 had only sensory invitations (the 8 in db/migrations/0001 / build
// spec §6). This file generalizes: a fragment is either an invitation
// OR a held line of text that just sits with the user. Future kinds
// (image, silence, redirection, recorded voice) plug in here without
// touching the session player or the selection algorithm.
//
// This module is **client-safe**: pure data + lookup functions, no DB
// imports. Selection logic lives in lib/fragments-select.ts (server-only)
// because it queries Supabase. SessionPlayer (a client component) imports
// from here only.
//
// ID space: 1–8 are the DB-backed invitations (must match the seed in
// db/migrations/0001_ocd2now_schema.sql). 100+ are code-only fragments.
// `ocd_sessions.invitation_id` has no FK so writing 101+ is fine.

export type FragmentKind =
  | "invitation"
  | "still-text"
  | "silence"
  | "redirect-out";

export type InvitationFragment = {
  id: number;
  slug: string;
  kind: "invitation";
  durationMs: number;
};

export type StillTextFragment = {
  id: number;
  slug: string;
  kind: "still-text";
  durationMs: number;
  // Author/source attribution shown quietly at the end of the hold.
  // Empty string for fragments authored anonymously.
  attribution?: string;
  // Two text variants — same therapeutic spine, slightly different
  // landing for users who selected `user_type === "ocd"` in onboarding.
  // If only one is given, both user types see it.
  textDefault: string;
  textOcd?: string;
};

// A silence fragment is paper background and time. No prompt, no
// instruction, no closing line of its own — the standard return phase
// in SessionPlayer provides the closing frame ("Enough for now.").
// For the spirals where even a still-text is too much.
export type SilenceFragment = {
  id: number;
  slug: string;
  kind: "silence";
  durationMs: number;
};

// A redirect-out fragment is the app gently sending the user out.
// Sometimes the right answer is "not the app." Skips the arrival and
// return phases — the line *is* the experience. SessionPlayer special-
// cases this kind so the user sees only the redirect text and then the
// session ends.
export type RedirectOutFragment = {
  id: number;
  slug: string;
  kind: "redirect-out";
  // Total time the line is on screen (from first fade-in to /end). Short
  // by design — this isn't a held experience, it's a redirect.
  durationMs: number;
  textDefault: string;
  textOcd?: string;
};

export type Fragment =
  | InvitationFragment
  | StillTextFragment
  | SilenceFragment
  | RedirectOutFragment;

// Invitation fragments — these mirror db/migrations/0001 exactly. If you
// change either side, change both. (playbook §9)
const INVITATION_FRAGMENTS: InvitationFragment[] = [
  { id: 1, slug: "three-sounds", kind: "invitation", durationMs: 60_000 },
  { id: 2, slug: "cold-water", kind: "invitation", durationMs: 60_000 },
  { id: 3, slug: "five-contacts", kind: "invitation", durationMs: 50_000 },
  { id: 4, slug: "one-exhale", kind: "invitation", durationMs: 60_000 },
  { id: 5, slug: "eyes-around", kind: "invitation", durationMs: 45_000 },
  { id: 6, slug: "bilateral-tap", kind: "invitation", durationMs: 60_000 },
  { id: 7, slug: "hot-cool", kind: "invitation", durationMs: 45_000 },
  { id: 8, slug: "next-sound", kind: "invitation", durationMs: 60_000 },
];

// Still-text fragments — authored seeds. These are AI-drafted in the
// voice of the build spec; replace with human-authored lines (yours, or
// sourced from public-domain texts you'd want — Tao Te Ching, classical
// Rumi translations, anonymous, etc.) as the library grows. The medicine
// is partly that someone sat down and wrote this for the user.
const STILL_TEXT_FRAGMENTS: StillTextFragment[] = [
  {
    id: 101,
    slug: "still-here",
    kind: "still-text",
    durationMs: 40_000,
    textDefault: "Whatever is here, is here. The brain is doing what brains do.",
  },
  {
    id: 102,
    slug: "still-arriving",
    kind: "still-text",
    durationMs: 40_000,
    textDefault:
      "You arrived. The arriving was involuntary. Whatever brought you was also involuntary.",
  },
  {
    id: 103,
    slug: "still-reaching",
    kind: "still-text",
    durationMs: 40_000,
    textDefault:
      "The reaching for something to hold is itself unfolding. So is the not-finding.",
    textOcd:
      "The reaching for something to hold is itself unfolding. The not-finding is also unfolding. The wanting-it-to-stop is also unfolding.",
  },
  {
    id: 104,
    slug: "still-river",
    kind: "still-text",
    durationMs: 45_000,
    textDefault:
      "Sound. Light. Weight. Breath. None asked for permission. None can be stopped.",
  },
];

// Silence fragments — paper bg, no instruction, no exercise, no text.
// The standard return phase ("Enough for now.") provides the closing.
const SILENCE_FRAGMENTS: SilenceFragment[] = [
  { id: 201, slug: "silence-short", kind: "silence", durationMs: 35_000 },
  { id: 202, slug: "silence-long", kind: "silence", durationMs: 50_000 },
];

// Redirect-out fragments — the app sending the user out. Skip arrival
// and return phases (handled in SessionPlayer). The line *is* the
// session. Use sparingly — for the user in real distress this can read
// as rejection if the wording isn't right. One seed for v1; Carlos can
// add more.
const REDIRECT_OUT_FRAGMENTS: RedirectOutFragment[] = [
  {
    id: 301,
    slug: "redirect-outside",
    kind: "redirect-out",
    durationMs: 10_000,
    textDefault:
      "Not now. Step outside if you can. Or close this and stop reading.",
  },
];

const ALL_FRAGMENTS: Fragment[] = [
  ...INVITATION_FRAGMENTS,
  ...STILL_TEXT_FRAGMENTS,
  ...SILENCE_FRAGMENTS,
  ...REDIRECT_OUT_FRAGMENTS,
];

export function getFragment(id: number): Fragment | null {
  return ALL_FRAGMENTS.find((f) => f.id === id) ?? null;
}

export function listFragments(): readonly Fragment[] {
  return ALL_FRAGMENTS;
}
