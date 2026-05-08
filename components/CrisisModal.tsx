"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Crisis modal opens are NEVER logged. No telemetry. No row, no count.
// (playbook §0.9)

type CrisisModalProps = {
  trigger?: React.ReactNode;
};

export function CrisisModal({ trigger }: CrisisModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-muted hover:text-ink underline-offset-4 hover:underline"
      >
        {trigger ?? "I need help right now"}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Crisis resources"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 px-6"
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-prose rounded-sm bg-paper p-8 md:p-10"
            >
              <h2 className="font-display text-2xl md:text-3xl text-ink mb-6">
                If things are acute right now
              </h2>
              <ul className="space-y-4 text-ink">
                <li>
                  <a
                    href="tel:988"
                    className="underline-offset-4 hover:underline"
                  >
                    988
                  </a>{" "}
                  — Suicide Crisis Helpline (call or text)
                </li>
                <li>
                  <a
                    href="tel:18007421890"
                    className="underline-offset-4 hover:underline"
                  >
                    1-800-742-1890
                  </a>{" "}
                  — Durham Mental Health Crisis Line
                </li>
                <li>
                  If you are in immediate danger, call{" "}
                  <a
                    href="tel:911"
                    className="underline-offset-4 hover:underline"
                  >
                    911
                  </a>{" "}
                  or go to your nearest ER.
                </li>
                <li>
                  Dr. Yu&rsquo;s clinic:{" "}
                  <a
                    href="tel:9056830690"
                    className="underline-offset-4 hover:underline"
                  >
                    905-683-0690
                  </a>{" "}
                  (Monday&ndash;Friday, business hours)
                </li>
              </ul>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-8 inline-block text-sm font-medium text-muted hover:text-ink"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
