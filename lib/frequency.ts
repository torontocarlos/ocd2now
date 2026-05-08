import { createClient } from "@/lib/supabase/server";
import { torontoDayStart, torontoDaysAgoStart } from "@/lib/utils/tz";

export type FrequencyBand = "standard" | "pause-soft" | "pause-firm" | "threshold";

export function classifyBand(count: number): FrequencyBand {
  if (count < 4) return "standard";
  if (count < 7) return "pause-soft"; // 4–6
  if (count < 13) return "pause-firm"; // 7–12
  return "threshold"; // 13+
}

export async function dailySessionCount(userId: string): Promise<number> {
  const supabase = createClient();
  const dayStart = torontoDayStart();

  const { count } = await supabase
    .from("ocd_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("started_at", dayStart.toISOString());

  return count ?? 0;
}

export async function sevenDaySessionCount(userId: string): Promise<number> {
  const supabase = createClient();
  const since = torontoDaysAgoStart(6); // today + previous 6 = 7-day window

  const { count } = await supabase
    .from("ocd_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("started_at", since.toISOString());

  return count ?? 0;
}
