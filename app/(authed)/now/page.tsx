import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { dailySessionCount, classifyBand } from "@/lib/frequency";
import { BeginButton } from "@/components/BeginButton";
import { RotatingLine } from "@/components/RotatingLine";
import { PauseScreen } from "@/components/PauseScreen";
import { ThresholdScreen } from "@/components/ThresholdScreen";

export const dynamic = "force-dynamic";

export default async function NowPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/");
  if (!me.ocdUser.onboarded_at) redirect("/welcome");

  const count = await dailySessionCount(me.authId);
  const band = classifyBand(count);

  return (
    <main className="min-h-dvh flex flex-col">
      <header className="px-6 pt-6 flex items-center justify-between">
        <span className="font-display text-xl text-ink">Now</span>
        <Link
          href="/settings"
          className="text-sm text-muted hover:text-ink underline-offset-4 hover:underline"
        >
          Settings
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        {band === "standard" ? (
          <div className="w-full max-w-prose space-y-12">
            <BeginButton />
            <RotatingLine />
          </div>
        ) : null}

        {band === "pause-soft" ? <PauseScreen variant="soft" /> : null}
        {band === "pause-firm" ? <PauseScreen variant="firm" /> : null}
        {band === "threshold" ? <ThresholdScreen /> : null}
      </div>
    </main>
  );
}
