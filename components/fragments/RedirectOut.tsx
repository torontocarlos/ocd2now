"use client";

import { motion } from "framer-motion";
import type { RedirectOutFragment } from "@/lib/fragments";
import type { UserType } from "@/lib/types/database";

// Redirect-out fragment: a single line gently sending the user away.
// SessionPlayer skips the arrival and return phases for this kind —
// the line *is* the session. The user sees it fade in, sit, fade out,
// then lands on /end without the standard "Enough for now."
//
// Sometimes the medicine is the redirect itself.

type Props = {
  fragment: RedirectOutFragment;
  userType: UserType;
};

export function RedirectOut({ fragment, userType }: Props) {
  const text =
    userType === "ocd" && fragment.textOcd
      ? fragment.textOcd
      : fragment.textDefault;

  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="font-display italic text-2xl md:text-3xl text-ink text-center leading-relaxed max-w-prose"
    >
      {text}
    </motion.p>
  );
}
