"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getInvitation } from "@/components/invitations";
import { StillText } from "@/components/fragments/StillText";
import { getFragment, type Fragment } from "@/lib/fragments";
import { endSession } from "@/lib/actions/endSession";
import type { UserType } from "@/lib/types/database";

type Phase = "arrival" | "fragment" | "return";

const ARRIVAL_MS = 10_000;
// Time the user sits with the closing lines before the app advances itself.
// No "I'm done" button — every interactive element inside a session is a
// hook for a doing-it-correctly compulsion. The clock owns the close.
const RETURN_MS = 12_000;
// Skip exists for the rare case the user truly needs to bail (phone call,
// crisis), but it must not be a fast-path through the experience. Hidden
// for the first 30s so it isn't a moment-by-moment compulsion target.
const SKIP_AVAILABLE_AFTER_MS = 30_000;

type Props = {
  sessionId: string;
  fragmentId: number;
  userType: UserType;
};

export function SessionPlayer({ sessionId, fragmentId, userType }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("arrival");
  const [showSecondReturnLine, setShowSecondReturnLine] = useState(false);
  const [skipVisible, setSkipVisible] = useState(false);

  const fragment = getFragment(fragmentId);
  const fragmentMs = fragment?.durationMs ?? 60_000;

  // Phase transitions on a clock.
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("fragment"), ARRIVAL_MS);
    const t2 = setTimeout(() => setPhase("return"), ARRIVAL_MS + fragmentMs);
    const totalMs = ARRIVAL_MS + fragmentMs + RETURN_MS;
    const t3 = setTimeout(() => closeOnClock(), totalMs);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fragmentMs]);

  // Skip becomes available after a delay measured from session start.
  useEffect(() => {
    const t = setTimeout(() => setSkipVisible(true), SKIP_AVAILABLE_AFTER_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== "return") return;
    const t = setTimeout(() => setShowSecondReturnLine(true), 4000);
    return () => clearTimeout(t);
  }, [phase]);

  function closeOnClock() {
    // Fire-and-forget: never block the user on a network write.
    void endSession(sessionId, true);
    router.push("/end");
  }

  function skip() {
    void endSession(sessionId, false);
    router.push("/end");
  }

  if (!fragment) {
    return (
      <main className="min-h-dvh flex items-center justify-center px-6 text-center">
        <p className="font-display italic text-xl text-muted">
          Something didn&rsquo;t work. Try again, or come back later.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-dvh flex items-center justify-center px-6 py-16 relative">
      <div className="w-full max-w-prose flex items-center justify-center">
        <AnimatePresence mode="wait">
          {phase === "arrival" ? (
            <motion.div
              key="arrival"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <p className="font-display italic text-2xl md:text-3xl text-ink leading-relaxed">
                You&rsquo;re here. Whatever brought you here is here too.
              </p>
            </motion.div>
          ) : null}

          {phase === "fragment" ? (
            <motion.div
              key="fragment"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full flex items-center justify-center"
            >
              <FragmentRenderer fragment={fragment} userType={userType} />
            </motion.div>
          ) : null}

          {phase === "return" ? (
            <motion.div
              key="return"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center space-y-4"
            >
              <p className="font-display italic text-2xl md:text-3xl text-ink">
                Enough for now.
              </p>
              {showSecondReturnLine ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="font-display italic text-xl md:text-2xl text-muted"
                >
                  Whatever you were doing before &mdash; go do that next.
                </motion.p>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {skipVisible && phase !== "return" ? (
        <button
          type="button"
          onClick={skip}
          aria-label="Leave the session"
          className="fixed top-4 right-4 text-xs text-muted hover:text-ink underline-offset-4 hover:underline"
        >
          Leave
        </button>
      ) : null}
    </main>
  );
}

function FragmentRenderer({
  fragment,
  userType,
}: {
  fragment: Fragment;
  userType: UserType;
}) {
  if (fragment.kind === "still-text") {
    return <StillText fragment={fragment} userType={userType} />;
  }

  // Invitation fragments still render via the existing component registry.
  const invitationDef = getInvitation(fragment.id);
  if (!invitationDef) {
    // Should not happen — the invitation registry is the source of truth
    // for ids 1–8. If it does, fail soft.
    return null;
  }
  const InvitationComponent = invitationDef.component;
  return <InvitationComponent userType={userType} />;
}
