import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { EndScreen } from "./EndScreen";

export const dynamic = "force-dynamic";

export default async function EndPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/");
  return <EndScreen />;
}
