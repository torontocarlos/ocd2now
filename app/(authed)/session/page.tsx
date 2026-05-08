import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { SessionPlayer } from "./SessionPlayer";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: { s?: string; f?: string };
};

export default async function SessionPage({ searchParams }: Props) {
  const me = await getCurrentUser();
  if (!me) redirect("/");
  if (!me.ocdUser.onboarded_at) redirect("/welcome");

  const sessionId = searchParams.s;
  const fragmentId = searchParams.f ? parseInt(searchParams.f, 10) : NaN;

  if (!sessionId || !Number.isFinite(fragmentId)) {
    redirect("/now");
  }

  return (
    <SessionPlayer
      sessionId={sessionId}
      fragmentId={fragmentId}
      userType={me.ocdUser.user_type}
    />
  );
}
