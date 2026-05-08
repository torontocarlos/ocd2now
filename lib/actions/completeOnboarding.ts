"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import type { ActionResult } from "./_result";
import type { UserType } from "@/lib/types/database";

const VALID_TYPES: UserType[] = ["ocd", "unsure", "other"];

export async function completeOnboarding(
  userType: UserType,
): Promise<ActionResult> {
  if (!VALID_TYPES.includes(userType)) {
    return { ok: false, error: "Invalid selection." };
  }

  const me = await getCurrentUser();
  if (!me) return { ok: false, error: "Not signed in." };

  const supabase = createClient();
  const { error } = await supabase
    .from("ocd_users")
    .update({
      user_type: userType,
      onboarded_at: new Date().toISOString(),
    })
    .eq("id", me.authId);

  if (error) {
    return { ok: false, error: "Something didn't work. Try again, or come back later." };
  }

  revalidatePath("/now");
  redirect("/now");
}
