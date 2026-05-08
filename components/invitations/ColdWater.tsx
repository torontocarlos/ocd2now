"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FadeLine, FinalText } from "./Shared";
import type { InvitationProps } from "./types";

export function ColdWater({ userType }: InvitationProps) {
  const [phase, setPhase] = useState<"prompt" | "final">("prompt");

  useEffect(() => {
    const t = setTimeout(() => setPhase("final"), 50_000);
    return () => clearTimeout(t);
  }, []);

  const finalText =
    userType === "ocd"
      ? "Sensation arrived. The brain noticed. The noticing was involuntary. That's all that's needed."
      : "Sensation arrived. The brain noticed. That's all that's needed.";

  return (
    <div className="space-y-10 flex flex-col items-center">
      <AnimatePresence mode="wait">
        {phase === "prompt" ? (
          <motion.div
            key="prompt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-3 text-center"
          >
            <FadeLine>
              If there&rsquo;s a sink near you, run cold water on your hands or
              wrist.
            </FadeLine>
            <p className="text-sm text-muted">If not, this works too.</p>
          </motion.div>
        ) : (
          <FinalText key="final">{finalText}</FinalText>
        )}
      </AnimatePresence>

      <WaterRipple />
    </div>
  );
}

function WaterRipple() {
  return (
    <div className="relative w-40 h-40">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border border-accent/30"
          initial={{ scale: 0.4, opacity: 0.6 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 1.3,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
