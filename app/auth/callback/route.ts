import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin: localOrigin } = new URL(request.url);
  const code = searchParams.get("code");

  // Behind a reverse proxy (Coolify/Cloudflare tunnel) request.url's origin is the
  // internal http://localhost:3000, which would bounce users off-site after login.
  // Reconstruct the real public origin from the forwarded headers. On Vercel these
  // headers already equal the public host, so this is a no-op there (Vercel-safe).
  const fwdHost = request.headers.get("x-forwarded-host");
  const fwdProto = request.headers.get("x-forwarded-proto") ?? "https";
  const origin = fwdHost ? `${fwdProto}://${fwdHost}` : localOrigin;

  if (!code) {
    return NextResponse.redirect(`${origin}/`);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/?auth_error=1`);
  }

  // Middleware will route signed-in users to /welcome (if not onboarded)
  // or /now (if onboarded) when they hit /.
  return NextResponse.redirect(`${origin}/`);
}
