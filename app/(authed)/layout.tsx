import Link from "next/link";
import { CrisisModal } from "@/components/CrisisModal";

export default function AuthedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-paper text-ink relative">
      {children}
      <div className="fixed bottom-4 right-4 z-40">
        <CrisisModal trigger={<span>Help right now</span>} />
      </div>
      <div className="fixed bottom-4 left-4 z-40">
        <Link
          href="/why"
          className="text-sm text-muted hover:text-ink underline-offset-4 hover:underline"
        >
          Why this app
        </Link>
      </div>
    </div>
  );
}
