"use client";

import { useState, useTransition } from "react";
import { deleteAccount } from "@/lib/actions/deleteAccount";

export function DeleteAccount() {
  const [confirmed, setConfirmed] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onDelete() {
    if (!confirmed) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteAccount();
      if (result && !result.ok) setError(result.error);
    });
  }

  return (
    <div className="space-y-3">
      <label className="flex items-start gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-1"
        />
        <span>
          Yes, delete my account and all related data. This cannot be undone.
        </span>
      </label>
      <button
        type="button"
        onClick={onDelete}
        disabled={!confirmed || pending}
        className="rounded-sm border border-accent text-accent py-3 px-6 font-sans font-medium hover:bg-accent-soft transition-colors disabled:opacity-40"
      >
        {pending ? "Deleting" : "Delete my account"}
      </button>
      {error ? (
        <p className="text-sm text-muted" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
