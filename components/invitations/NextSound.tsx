"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { FadeLine, FinalText } from "./Shared";
import type { InvitationProps } from "./types";

export function NextSound({ userType }: InvitationProps) {
  const [phase, setPhase] = useState<"prompt" | "midline" | "final">("prompt");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("midline"), 28_000);
    const t2 = setTimeout(() => setPhase("final"), 52_000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const finalText =
    userType === "ocd"
      ? "You were here, listening. The listening was involuntary. That's enough."
      : "You were here, listening. That's enough.";

  return (
    <AnimatePresence mode="wait">
      {phase === "prompt" ? (
        <FadeLine key="prompt">Wait for the next sound.</FadeLine>
      ) : null}
      {phase === "midline" ? (
        <FadeLine key="midline">
          Whether a sound came or not, the waiting was happening.
        </FadeLine>
      ) : null}
      {phase === "final" ? (
        <FinalText key="final">{finalText}</FinalText>
      ) : null}
    </AnimatePresence>
  );
}
