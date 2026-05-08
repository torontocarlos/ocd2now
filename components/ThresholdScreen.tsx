"use client";

import { motion } from "framer-motion";
import { BeginButton } from "./BeginButton";

export function ThresholdScreen() {
  return (
    <div className="w-full max-w-prose space-y-10 text-center">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="font-display italic text-2xl md:text-3xl text-ink leading-relaxed"
      >
        This is more than this app was built for. The deeper version of this
        work is in person. When you&rsquo;re ready, here&rsquo;s the door.
      </motion.p>

      <div className="flex flex-col gap-3">
        <a
          href="https://presencetherapy.ca/ocd"
          target="_blank"
          rel="noreferrer"
          className="rounded-sm bg-ink text-paper py-4 px-6 font-sans font-medium hover:bg-accent transition-colors"
        >
          Tell me about Presence Therapy
        </a>
        <BeginButton label="I just need to ground right now" />
      </div>
    </div>
  );
}
