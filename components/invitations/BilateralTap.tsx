"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FadeLine, FinalText } from "./Shared";
import type { InvitationProps } from "./types";

export function BilateralTap({ userType }: InvitationProps) {
  const [phase, setPhase] = useState<"prompt" | "final">("prompt");

  useEffect(() => {
    const t = setTimeout(() => setPhase("final"), 52_000);
    return () => clearTimeout(t);
  }, []);

  const finalText =
    userType === "ocd"
      ? "The rhythm was here. The taps were happening. The noticing was involuntary."
      : "The rhythm was here. The taps were happening. Notice.";

  return (
    <div className="flex flex-col items-center gap-10">
      <AnimatePresence mode="wait">
        {phase === "prompt" ? (
          <FadeLine key="prompt">
            Cross your arms over your chest. Tap your shoulders, alternating.
            Slow.
          </FadeLine>
        ) : (
          <FinalText key="final">{finalText}</FinalText>
        )}
      </AnimatePresence>

      <BilateralPulse />
    </div>
  );
}

function BilateralPulse() {
  return (
    <div className="relative w-64 h-12">
      <motion.div
        className="absolute top-1/2 left-0 -translate-y-1/2 w-4 h-4 rounded-full bg-accent"
        animate={{ x: [0, 240, 0], opacity: [0.3, 1, 0.3] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
