"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FinalText } from "./Shared";
import type { InvitationProps } from "./types";

const LINES = [
  "Feet on the ground.",
  "Hips in the chair (or wherever they are).",
  "Hands wherever your hands are.",
  "Breath, wherever it's happening.",
  "Weight pulling down.",
];

export function FiveContacts({ userType }: InvitationProps) {
  const [shown, setShown] = useState(1);
  const [final, setFinal] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShown((s) => Math.min(s + 1, LINES.length));
    }, 8000);
    const finalTimer = setTimeout(() => setFinal(true), 42_000);
    return () => {
      clearInterval(interval);
      clearTimeout(finalTimer);
    };
  }, []);

  const finalText =
    userType === "ocd"
      ? "All of that was already here. The noticing was involuntary."
      : "All of that was already here.";

  return (
    <div className="w-full max-w-prose space-y-6">
      <AnimatePresence>
        {final ? (
          <FinalText key="final">{finalText}</FinalText>
        ) : (
          LINES.slice(0, shown).map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="font-display italic text-xl md:text-2xl text-ink text-center"
            >
              {line}
            </motion.p>
          ))
        )}
      </AnimatePresence>
    </div>
  );
}
