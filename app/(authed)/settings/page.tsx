import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { sevenDaySessionCount } from "@/lib/frequency";
import { signOut } from "@/lib/actions/signOut";
import { DeleteAccount } from "./DeleteAccount";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/");

  const sevenDay = await sevenDaySessionCount(me.authId);

  return (
    <main className="min-h-dvh px-6 py-12">
      <div className="w-full max-w-prose mx-auto space-y-12">
        <header className="space-y-2">
          <Link
            href="/now"
            className="text-sm text-muted hover:text-ink underline-offset-4 hover:underline"
          >
            Back
          </Link>
          <h1 className="font-display text-3xl text-ink">Settings</h1>
        </header>

        <section className="space-y-2">
          <p className="text-sm text-muted">Signed in as</p>
          <p className="text-ink">{me.email}</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-ink">
            How often have I opened this?
          </h2>
          <p className="text-ink">
            {sevenDay} {sevenDay === 1 ? "session" : "sessions"} in the last 7
            days.
          </p>
          <p className="text-sm text-muted italic max-w-prose">
            This number is here so you can notice patterns. It is not a score.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-ink">If things are acute</h2>
          <ul className="space-y-2 text-ink text-sm">
            <li>
              <a href="tel:988" className="underline-offset-4 hover:underline">
                988
              </a>{" "}
              &mdash; Suicide Crisis Helpline (call or text)
            </li>
            <li>
              <a
                href="tel:18007421890"
                className="underline-offset-4 hover:underline"
              >
                1-800-742-1890
              </a>{" "}
              &mdash; Durham Mental Health Crisis Line
            </li>
            <li>
              In immediate danger:{" "}
              <a href="tel:911" className="underline-offset-4 hover:underline">
                911
              </a>{" "}
              or your nearest ER
            </li>
            <li>
              Dr. Yu&rsquo;s clinic:{" "}
              <a
                href="tel:9056830690"
                className="underline-offset-4 hover:underline"
              >
                905-683-0690
              </a>{" "}
              (Mon&ndash;Fri, business hours)
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-sm border border-ink/40 py-3 px-6 font-sans font-medium text-ink hover:bg-accent-soft transition-colors"
            >
              Sign out
            </button>
          </form>

          <DeleteAccount />
        </section>

        <footer className="pt-12 text-xs text-muted">
          Built by Presence Therapy Institute &middot; Ajax Harwood Clinic
        </footer>
      </div>
    </main>
  );
}
