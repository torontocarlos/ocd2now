import { createClient } from "@/lib/supabase/server";
import type { OcdUserRow } from "@/lib/types/database";

export async function getCurrentUser(): Promise<{
  authId: string;
  email: string;
  ocdUser: OcdUserRow;
} | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  let { data: ocdUser } = await supabase
    .from("ocd_users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // The auth.users INSERT trigger usually creates this row. If it didn't
  // (or hasn't propagated yet on a fresh sign-in), bootstrap it ourselves
  // under the user's RLS so the UI doesn't bounce between / and /welcome.
  if (!ocdUser) {
    const { data: inserted } = await supabase
      .from("ocd_users")
      .insert({ id: user.id, email: user.email ?? "" })
      .select("*")
      .maybeSingle();
    ocdUser = inserted ?? null;
  }

  if (!ocdUser) return null;

  return {
    authId: user.id,
    email: user.email ?? ocdUser.email,
    ocdUser,
  };
}
