"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { completeOnboarding } from "@/lib/actions/completeOnboarding";
import type { UserType } from "@/lib/types/database";

type Step = 0 | 1 | 2;

export function WelcomeFlow() {
  const [step, setStep] = useState<Step>(0);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function pick(userType: UserType) {
    setError(null);
    startTransition(async () => {
      const result = await completeOnboarding(userType);
      if (result && !result.ok) setError(result.error);
    });
  }

  return (
    <main className="min-h-dvh flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-prose">
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.section
              key="step-0"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <p className="font-display text-2xl md:text-3xl text-ink leading-snug">
                This app was built for people with OCD. If that&rsquo;s you,
                you&rsquo;re in the right place. If you&rsquo;re not sure but
                the loops feel like they own you sometimes &mdash; also the
                right place.
              </p>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-sm bg-ink text-paper py-3 px-6 font-sans font-medium hover:bg-accent transition-colors"
              >
                Continue
              </button>
            </motion.section>
          ) : null}

          {step === 1 ? (
            <motion.section
              key="step-1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <p className="font-display text-2xl md:text-3xl text-ink leading-snug">
                OCD turns helpful things into compulsions. This app is no
                exception. We&rsquo;ve designed it to resist that &mdash; short
                sessions, no streaks, no things to do correctly. But if you
                find yourself opening this many times a day, that&rsquo;s not
                the app working. That&rsquo;s the OCD finding the app.
                We&rsquo;ll notice it together.
              </p>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-sm bg-ink text-paper py-3 px-6 font-sans font-medium hover:bg-accent transition-colors"
              >
                Continue
              </button>
            </motion.section>
          ) : null}

          {step === 2 ? (
            <motion.section
              key="step-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
              className="space-y-10"
            >
              <p className="font-display text-2xl md:text-3xl text-ink leading-snug">
                Are you here because of OCD?
              </p>
              <div className="flex flex-col gap-3">
                <ChoiceButton onClick={() => pick("ocd")} disabled={pending}>
                  Yes
                </ChoiceButton>
                <ChoiceButton onClick={() => pick("unsure")} disabled={pending}>
                  Not sure
                </ChoiceButton>
                <ChoiceButton onClick={() => pick("other")} disabled={pending}>
                  No, anxiety or something else
                </ChoiceButton>
              </div>
              {error ? (
                <p className="text-sm text-muted" role="alert">
                  {error}
                </p>
              ) : null}
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>
    </main>
  );
}

function ChoiceButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-sm border border-ink/40 bg-paper py-4 px-6 text-left font-sans text-ink hover:bg-accent-soft transition-colors disabled:opacity-60"
    >
      {children}
    </button>
  );
}
