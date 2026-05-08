"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { startSession } from "@/lib/actions/startSession";

export function BeginButton({ label = "Begin" }: { label?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    setError(null);
    startTransition(async () => {
      const result = await startSession();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const params = new URLSearchParams({
        s: result.data!.session_id,
        i: String(result.data!.invitation_id),
      });
      router.push(`/session?${params.toString()}`);
    });
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="w-full rounded-sm bg-ink text-paper py-5 md:py-6 px-6 font-display text-2xl md:text-3xl tracking-wide hover:bg-accent transition-colors disabled:opacity-60"
      >
        {pending ? "One moment" : label}
      </button>
      {error ? (
        <p className="mt-3 text-sm text-muted text-center" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
