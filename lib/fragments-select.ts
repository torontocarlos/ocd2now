import "server-only";

import { createClient } from "@/lib/supabase/server";
import { listFragments, type Fragment } from "@/lib/fragments";

// Select a fragment for `userId`. Same shape as build spec §9 — avoid
// the user's last_invitation_id, prefer the least-used third over the
// past 7 days — but the pool is now the union of every fragment kind,
// not just DB-backed invitations.
//
// Server-only because it queries Supabase. Client code imports from
// `lib/fragments` for the registry and types.
export async function selectFragment(userId: string): Promise<Fragment> {
  const supabase = createClient();
  const all = listFragments();

  const { data: user } = await supabase
    .from("ocd_users")
    .select("last_invitation_id")
    .eq("id", userId)
    .single();

  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 3600 * 1000,
  ).toISOString();
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

  let eligible = all
    .filter((f) => f.id !== user?.last_invitation_id)
    .map((f) => ({ fragment: f, count: recentCounts.get(f.id) ?? 0 }))
    .sort((a, b) => a.count - b.count);

  if (eligible.length === 0) {
    eligible = all.map((f) => ({
      fragment: f,
      count: recentCounts.get(f.id) ?? 0,
    }));
  }

  const cutoff = Math.max(1, Math.floor(eligible.length / 3));
  const pool = eligible.slice(0, cutoff);
  return pool[Math.floor(Math.random() * pool.length)].fragment;
}
