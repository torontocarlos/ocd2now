import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { SessionPlayer } from "./SessionPlayer";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: { s?: string; i?: string };
};

export default async function SessionPage({ searchParams }: Props) {
  const me = await getCurrentUser();
  if (!me) redirect("/");
  if (!me.ocdUser.onboarded_at) redirect("/welcome");

  const sessionId = searchParams.s;
  const invitationId = searchParams.i ? parseInt(searchParams.i, 10) : NaN;

  if (!sessionId || !Number.isFinite(invitationId)) {
    redirect("/now");
  }

  return (
    <SessionPlayer
      sessionId={sessionId}
      invitationId={invitationId}
      userType={me.ocdUser.user_type}
    />
  );
}
