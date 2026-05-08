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

  const { data: ocdUser } = await supabase
    .from("ocd_users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!ocdUser) return null;

  return {
    authId: user.id,
    email: user.email ?? ocdUser.email,
    ocdUser,
  };
}
