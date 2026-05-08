"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { createClient as createServiceClient } from "@/lib/supabase/service";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { ActionResult } from "./_result";

export async function deleteAccount(): Promise<ActionResult> {
  const me = await getCurrentUser();
  if (!me) return { ok: false, error: "Not signed in." };

  const service = createServiceClient();
  const { error } = await service.auth.admin.deleteUser(me.authId);

  if (error) {
    return { ok: false, error: "Something didn't work. Try again, or come back later." };
  }

  // Sign out of the current browser session too.
  const server = createServerClient();
  await server.auth.signOut();

  redirect("/");
}
