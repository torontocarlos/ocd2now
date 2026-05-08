"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BeginButton } from "./BeginButton";

type PauseScreenProps = {
  variant: "soft" | "firm";
};

const SOFT_TEXT =
  "Your hand reached for this. That reaching is also unfolding on its own. Sit a moment before what's next.";

const FIRM_TEXT =
  "You've come here many times today. This is information, not failure. Consider texting one person you trust, or stepping outside, before opening another session.";

export function PauseScreen({ variant }: PauseScreenProps) {
  const [revealed, setRevealed] = useState(variant === "firm");

  useEffect(() => {
    if (variant !== "soft") return;
    const t = setTimeout(() => setRevealed(true), 3500);
    return () => clearTimeout(t);
  }, [variant]);

  return (
    <div className="w-full max-w-prose space-y-10 text-center">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="font-display italic text-2xl md:text-3xl text-ink leading-relaxed"
      >
        {variant === "soft" ? SOFT_TEXT : FIRM_TEXT}
      </motion.p>

      <AnimatePresence>
        {revealed ? (
          <motion.div
            key="actions"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {variant === "firm" ? (
              <FirmActions />
            ) : (
              <BeginButton />
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function FirmActions() {
  return (
    <div className="flex flex-col gap-3">
      <BeginButton label="Continue anyway" />
      <a
        href="/end"
        className="rounded-sm border border-ink/40 py-4 px-6 font-sans font-medium text-ink hover:bg-accent-soft transition-colors"
      >
        Step away for now
      </a>
    </div>
  );
}
