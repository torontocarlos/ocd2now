"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { FadeLine, FinalText } from "./Shared";
import type { InvitationProps } from "./types";

export function EyesAround({ userType }: InvitationProps) {
  const [phase, setPhase] = useState<"prompt" | "final">("prompt");

  useEffect(() => {
    const t = setTimeout(() => setPhase("final"), 37_000);
    return () => clearTimeout(t);
  }, []);

  const finalText =
    userType === "ocd"
      ? "The eyes moved on their own. The seeing was involuntary. The looking-for was also involuntary."
      : "The eyes moved on their own. The seeing was involuntary.";

  return (
    <AnimatePresence mode="wait">
      {phase === "prompt" ? (
        <FadeLine key="prompt">
          Let your eyes move around the room. Don&rsquo;t look for anything.
          Just see what they land on.
        </FadeLine>
      ) : (
        <FinalText key="final">{finalText}</FinalText>
      )}
    </AnimatePresence>
  );
}
