import { createClient } from "@/lib/supabase/server";

// Selection algorithm from build spec §9. Filters out the most recently
// served invitation, then picks randomly from the least-used third over
// the past 7 days. Keeps invitations varied (preventing routinization)
// while still rotating through the full library.
export async function selectInvitation(userId: string): Promise<number> {
  const supabase = createClient();

  const { data: invitations } = await supabase
    .from("ocd_invitations")
    .select("id")
    .eq("is_active", true);

  if (!invitations || invitations.length === 0) {
    throw new Error("No active invitations.");
  }

  const { data: user } = await supabase
    .from("ocd_users")
    .select("last_invitation_id")
    .eq("id", userId)
    .single();

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
  const { data: recent } = await supabase
    .from("ocd_sessions")
    .select("invitation_id")
    .eq("user_id", userId)
    .gte("started_at", sevenDaysAgo);

  const recentCounts = new Map<number, number>();
  recent?.forEach((r) => {
    if (r.invitation_id == null) return;
    recentCounts.set(r.invitation_id, (recentCounts.get(r.invitation_id) ?? 0) + 1);
  });

  let eligible = invitations
    .filter((i) => i.id !== user?.last_invitation_id)
    .map((i) => ({ id: i.id, count: recentCounts.get(i.id) ?? 0 }))
    .sort((a, b) => a.count - b.count);

  // If we filtered out the only invitation, fall back to the full set.
  if (eligible.length === 0) {
    eligible = invitations.map((i) => ({
      id: i.id,
      count: recentCounts.get(i.id) ?? 0,
    }));
  }

  const cutoff = Math.max(1, Math.floor(eligible.length / 3));
  const pool = eligible.slice(0, cutoff);
  return pool[Math.floor(Math.random() * pool.length)].id;
}
