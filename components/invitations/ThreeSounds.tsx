"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { FadeLine, FinalText } from "./Shared";
import type { InvitationProps } from "./types";

export function ThreeSounds({ userType }: InvitationProps) {
  const [phase, setPhase] = useState<"prompt" | "final">("prompt");

  useEffect(() => {
    const t = setTimeout(() => setPhase("final"), 50_000);
    return () => clearTimeout(t);
  }, []);

  const finalText =
    userType === "ocd"
      ? "Sounds were happening. The hearing was involuntary. The not-acting on what you heard was also involuntary."
      : "Sounds were happening. They didn't need you.";

  return (
    <AnimatePresence mode="wait">
      {phase === "prompt" ? (
        <FadeLine key="prompt">
          Sounds you didn&rsquo;t notice are happening in the room.
        </FadeLine>
      ) : (
        <FinalText key="final">{finalText}</FinalText>
      )}
    </AnimatePresence>
  );
}
