"use client";

import { motion } from "framer-motion";

export function FadeLine({
  children,
  delaySec = 0,
}: {
  children: React.ReactNode;
  delaySec?: number;
}) {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: delaySec }}
      className="font-display italic text-2xl md:text-3xl text-ink text-center leading-relaxed"
    >
      {children}
    </motion.p>
  );
}

export function FinalText({ children }: { children: React.ReactNode }) {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.0 }}
      className="font-display italic text-xl md:text-2xl text-muted text-center leading-relaxed"
    >
      {children}
    </motion.p>
  );
}
