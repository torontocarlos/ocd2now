"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const LINES = [
  "Whatever is here, is here.",
  "You don't have to fix this.",
  "The reaching for this is also unfolding.",
  "Nothing to do correctly.",
  "The brain is braining. That's what brains do.",
  "You arrived. That's what mattered.",
];

export function RotatingLine() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * LINES.length));

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % LINES.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-12 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="font-display italic text-base md:text-lg text-muted text-center"
        >
          {LINES[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
