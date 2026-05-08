import Link from "next/link";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { MagicLinkForm } from "@/components/MagicLinkForm";
import { CrisisModal } from "@/components/CrisisModal";

export default function LandingPage() {
  return (
    <main className="min-h-dvh flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-prose space-y-12">
          <header className="space-y-3">
            <h1 className="font-display text-4xl md:text-5xl text-ink">OCD2Now</h1>
            <p className="font-display italic text-xl md:text-2xl text-muted">
              From the loop, back to here.
            </p>
          </header>

          <div className="space-y-5 text-ink text-base md:text-lg">
            <p>OCD2Now is a small app for the moments when the loop has you.</p>
            <p>Open it. Sit through one short experience. Go back to your life.</p>
            <p>No streaks. No badges. No things to do correctly. Just a way back to here.</p>
          </div>

          <div className="space-y-5">
            <GoogleSignInButton />
            <MagicLinkForm />
          </div>

          <div className="pt-4">
            <Link
              href="/why"
              className="text-sm text-muted hover:text-ink underline-offset-4 hover:underline"
            >
              Why this app
            </Link>
          </div>
        </div>
      </div>

      <footer className="px-6 py-6 flex items-center justify-between text-sm text-muted">
        <span>Presence Therapy Institute &middot; Ajax Harwood Clinic</span>
        <CrisisModal />
      </footer>
    </main>
  );
}
