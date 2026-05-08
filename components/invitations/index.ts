// Registry mapping invitation id → component, slug, duration.
// MUST match the seed in db/migrations/0001_ocd2now_schema.sql exactly.
// If you change the seed, change this file in the same commit. (playbook §9)

import type { ComponentType } from "react";
import { ThreeSounds } from "./ThreeSounds";
import { ColdWater } from "./ColdWater";
import { FiveContacts } from "./FiveContacts";
import { OneExhale } from "./OneExhale";
import { EyesAround } from "./EyesAround";
import { BilateralTap } from "./BilateralTap";
import { HotCool } from "./HotCool";
import { NextSound } from "./NextSound";
import type { InvitationProps } from "./types";

export type InvitationDef = {
  slug: string;
  component: ComponentType<InvitationProps>;
  durationMs: number;
};

export const INVITATIONS: Record<number, InvitationDef> = {
  1: { slug: "three-sounds", component: ThreeSounds, durationMs: 60_000 },
  2: { slug: "cold-water", component: ColdWater, durationMs: 60_000 },
  3: { slug: "five-contacts", component: FiveContacts, durationMs: 50_000 },
  4: { slug: "one-exhale", component: OneExhale, durationMs: 60_000 },
  5: { slug: "eyes-around", component: EyesAround, durationMs: 45_000 },
  6: { slug: "bilateral-tap", component: BilateralTap, durationMs: 60_000 },
  7: { slug: "hot-cool", component: HotCool, durationMs: 45_000 },
  8: { slug: "next-sound", component: NextSound, durationMs: 60_000 },
};

export function getInvitation(id: number): InvitationDef | null {
  return INVITATIONS[id] ?? null;
}
