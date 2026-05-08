"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (oauthError) {
      setError("Something didn't work. Try again, or come back later.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="w-full rounded-sm bg-ink text-paper py-4 px-6 font-sans font-medium text-base hover:bg-accent transition-colors disabled:opacity-60"
      >
        {loading ? "One moment" : "Continue with Google"}
      </button>
      {error ? (
        <p className="mt-3 text-sm text-muted" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
