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

export type FragmentKind = "invitation" | "still-text";

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

export type Fragment = InvitationFragment | StillTextFragment;

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

const ALL_FRAGMENTS: Fragment[] = [
  ...INVITATION_FRAGMENTS,
  ...STILL_TEXT_FRAGMENTS,
];

export function getFragment(id: number): Fragment | null {
  return ALL_FRAGMENTS.find((f) => f.id === id) ?? null;
}

export function listFragments(): readonly Fragment[] {
  return ALL_FRAGMENTS;
}
