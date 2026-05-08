"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { StillTextFragment } from "@/lib/fragments";
import type { UserType } from "@/lib/types/database";

// A fragment that is just held text. No instruction, no exercise.
// The line fades in slowly, sits, and fades to the (optional) attribution
// near the end. This is the simplest fragment kind and the one closest
// to "the unsought arrives" — there is nothing for the user to do.

type Props = {
  fragment: StillTextFragment;
  userType: UserType;
};

export function StillText({ fragment, userType }: Props) {
  const [showAttribution, setShowAttribution] = useState(false);

  useEffect(() => {
    if (!fragment.attribution) return;
    // Reveal attribution in the last ~6s of the hold.
    const t = setTimeout(
      () => setShowAttribution(true),
      Math.max(fragment.durationMs - 6000, 0),
    );
    return () => clearTimeout(t);
  }, [fragment.attribution, fragment.durationMs]);

  const text =
    userType === "ocd" && fragment.textOcd ? fragment.textOcd : fragment.textDefault;

  return (
    <div className="w-full max-w-prose flex flex-col items-center gap-8 text-center">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4 }}
        className="font-display italic text-2xl md:text-3xl text-ink leading-relaxed"
      >
        {text}
      </motion.p>

      <AnimatePresence>
        {showAttribution && fragment.attribution ? (
          <motion.p
            key="attribution"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.0 }}
            className="font-sans text-xs text-muted"
          >
            &mdash; {fragment.attribution}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
