"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { FadeLine, FinalText } from "./Shared";
import type { InvitationProps } from "./types";

export function HotCool({ userType }: InvitationProps) {
  const [phase, setPhase] = useState<"prompt" | "final">("prompt");

  useEffect(() => {
    const t = setTimeout(() => setPhase("final"), 37_000);
    return () => clearTimeout(t);
  }, []);

  const finalText =
    userType === "ocd"
      ? "Sensation was unfolding all along. The brain just turned to look. That turning was involuntary."
      : "Sensation was unfolding all along. The brain just turned to look.";

  return (
    <AnimatePresence mode="wait">
      {phase === "prompt" ? (
        <FadeLine key="prompt">
          Find one place on your body that feels warmer than the rest. And one
          that feels cooler.
        </FadeLine>
      ) : (
        <FinalText key="final">{finalText}</FinalText>
      )}
    </AnimatePresence>
  );
}
