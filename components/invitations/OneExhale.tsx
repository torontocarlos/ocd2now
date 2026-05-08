"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FinalText } from "./Shared";
import type { InvitationProps } from "./types";

export function OneExhale({ userType }: InvitationProps) {
  const [phase, setPhase] = useState<"breath" | "final">("breath");

  useEffect(() => {
    const t = setTimeout(() => setPhase("final"), 52_000);
    return () => clearTimeout(t);
  }, []);

  const finalText =
    userType === "ocd"
      ? "The body breathes itself. The breathing was involuntary."
      : "The body breathes itself.";

  return (
    <div className="flex flex-col items-center gap-8">
      <AnimatePresence mode="wait">
        {phase === "breath" ? (
          <motion.div
            key="breath"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-6"
          >
            <BreathCircle />
            <p className="text-sm text-muted text-center max-w-xs">
              Follow if you like. Or don&rsquo;t. The breathing was already
              happening.
            </p>
          </motion.div>
        ) : (
          <FinalText key="final">{finalText}</FinalText>
        )}
      </AnimatePresence>
    </div>
  );
}

function BreathCircle() {
  return (
    <motion.div
      className="rounded-full bg-accent-soft border border-accent/30"
      style={{ width: 160, height: 160 }}
      animate={{ scale: [1, 1.4, 1.4, 1, 1] }}
      transition={{
        duration: 10,
        times: [0, 0.4, 0.45, 0.95, 1],
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}
