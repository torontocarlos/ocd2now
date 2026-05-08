import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { WelcomeFlow } from "./WelcomeFlow";

export default async function WelcomePage() {
  const me = await getCurrentUser();
  if (!me) redirect("/");
  if (me.ocdUser.onboarded_at) redirect("/now");

  return <WelcomeFlow />;
}
