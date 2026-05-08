"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getInvitation } from "@/components/invitations";
import { endSession } from "@/lib/actions/endSession";
import type { UserType } from "@/lib/types/database";

type Phase = "arrival" | "invitation" | "return";

const ARRIVAL_MS = 10_000;
const RETURN_MS = 15_000;

type Props = {
  sessionId: string;
  invitationId: number;
  userType: UserType;
};

export function SessionPlayer({ sessionId, invitationId, userType }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("arrival");
  const [showSecondReturnLine, setShowSecondReturnLine] = useState(false);

  const invitation = getInvitation(invitationId);
  const invitationMs = invitation?.durationMs ?? 60_000;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("invitation"), ARRIVAL_MS);
    const t2 = setTimeout(() => setPhase("return"), ARRIVAL_MS + invitationMs);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [invitationMs]);

  useEffect(() => {
    if (phase !== "return") return;
    const t = setTimeout(() => setShowSecondReturnLine(true), 4000);
    return () => clearTimeout(t);
  }, [phase]);

  function close(completed: boolean) {
    // Fire-and-forget: never block the user on a network write.
    void endSession(sessionId, completed);
    router.push("/end");
  }

  function skip() {
    if (phase === "arrival") setPhase("invitation");
    else if (phase === "invitation") setPhase("return");
    else close(true);
  }

  if (!invitation) {
    return (
      <main className="min-h-dvh flex items-center justify-center px-6 text-center">
        <p className="font-display italic text-xl text-muted">
          Something didn&rsquo;t work. Try again, or come back later.
        </p>
      </main>
    );
  }

  const InvitationComponent = invitation.component;

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

          {phase === "invitation" ? (
            <motion.div
              key="invitation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full"
            >
              <InvitationComponent userType={userType} />
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
              <button
                type="button"
                onClick={() => close(true)}
                className="mt-8 rounded-sm bg-ink text-paper py-3 px-8 font-sans font-medium hover:bg-accent transition-colors"
              >
                I&rsquo;m done.
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {phase !== "return" ? (
        <button
          type="button"
          onClick={skip}
          className="fixed top-4 right-4 text-xs text-muted hover:text-ink underline-offset-4 hover:underline"
        >
          Skip
        </button>
      ) : null}
    </main>
  );
}
