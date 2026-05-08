"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function MagicLinkForm() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setStatus(error ? "error" : "sent");
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-muted hover:text-ink underline-offset-4 hover:underline"
      >
        Email me a sign-in link instead
      </button>
    );
  }

  if (status === "sent") {
    return (
      <p className="text-sm text-ink">
        Sent. Check your inbox. The link works once.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full space-y-3">
      <label className="block text-sm text-muted" htmlFor="magic-email">
        Your email
      </label>
      <input
        id="magic-email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-sm border border-muted/40 bg-paper px-4 py-3 text-ink focus:border-accent focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-sm border border-ink py-3 px-6 font-sans font-medium text-ink hover:bg-accent-soft transition-colors disabled:opacity-60"
      >
        {status === "sending" ? "Sending" : "Send the link"}
      </button>
      {status === "error" ? (
        <p className="text-sm text-muted" role="alert">
          Something didn&rsquo;t work. Try again, or come back later.
        </p>
      ) : null}
    </form>
  );
}
