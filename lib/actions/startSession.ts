"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { selectFragment } from "@/lib/fragments-select";
import { dailySessionCount } from "@/lib/frequency";
import type { ActionResult } from "./_result";

export type StartSessionData = {
  session_id: string;
  fragment_id: number;
  daily_count_at_start: number;
};

export async function startSession(): Promise<ActionResult<StartSessionData>> {
  const me = await getCurrentUser();
  if (!me) return { ok: false, error: "Not signed in." };

  const supabase = createClient();

  // Idempotency: if there's an open session within the last 90 seconds, reuse it.
  const cutoff = new Date(Date.now() - 90_000).toISOString();
  const { data: open } = await supabase
    .from("ocd_sessions")
    .select("id, invitation_id, daily_session_count_at_start")
    .eq("user_id", me.authId)
    .is("ended_at", null)
    .gte("started_at", cutoff)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (open && open.invitation_id != null) {
    return {
      ok: true,
      data: {
        session_id: open.id,
        fragment_id: open.invitation_id,
        daily_count_at_start: open.daily_session_count_at_start ?? 0,
      },
    };
  }

  const dailyCount = await dailySessionCount(me.authId);
  const fragment = await selectFragment(me.authId);

  // The DB column is named `invitation_id` for historical reasons; it now
  // stores any fragment id (1–8 = invitations, 100+ = code-only fragments).
  // No FK constraint, so non-invitation ids are fine.
  const { data: inserted, error } = await supabase
    .from("ocd_sessions")
    .insert({
      user_id: me.authId,
      invitation_id: fragment.id,
      daily_session_count_at_start: dailyCount,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    return { ok: false, error: "Something didn't work. Try again, or come back later." };
  }

  await supabase
    .from("ocd_users")
    .update({ last_invitation_id: fragment.id })
    .eq("id", me.authId);

  revalidatePath("/now");

  return {
    ok: true,
    data: {
      session_id: inserted.id,
      fragment_id: fragment.id,
      daily_count_at_start: dailyCount,
    },
  };
}
