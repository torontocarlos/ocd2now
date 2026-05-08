"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import type { ActionResult } from "./_result";

export async function endSession(
  sessionId: string,
  completed: boolean,
): Promise<ActionResult> {
  const me = await getCurrentUser();
  if (!me) return { ok: false, error: "Not signed in." };

  const supabase = createClient();
  const { error } = await supabase
    .from("ocd_sessions")
    .update({
      ended_at: new Date().toISOString(),
      completed,
    })
    .eq("id", sessionId)
    .eq("user_id", me.authId);

  if (error) {
    return { ok: false, error: "Something didn't work." };
  }

  if (completed) {
    // total_sessions is a soft internal marker — never rendered as a score.
    // playbook §0.8.
    const { data: current } = await supabase
      .from("ocd_users")
      .select("total_sessions")
      .eq("id", me.authId)
      .single();

    if (current) {
      await supabase
        .from("ocd_users")
        .update({ total_sessions: (current.total_sessions ?? 0) + 1 })
        .eq("id", me.authId);
    }
  }

  revalidatePath("/now");
  return { ok: true };
}
