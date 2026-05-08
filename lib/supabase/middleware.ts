import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/types/database";

const AUTHED_PATHS = ["/welcome", "/now", "/session", "/end", "/settings"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthedPath = AUTHED_PATHS.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );

  // Redirect helper. Two responsibilities:
  //   1. Don't redirect to the path we're already on (defends against any
  //      future redirect-target drift causing a self-loop).
  //   2. Copy the auth cookies that `setAll` wrote onto `response` so they
  //      survive the redirect. Without this, supabase-ssr's refreshed
  //      session is dropped on every redirect and the browser oscillates
  //      between paths — that was the ERR_TOO_MANY_REDIRECTS we hit on
  //      /welcome after Google sign-in.
  function redirectTo(toPath: string) {
    if (path === toPath) return response;
    const url = request.nextUrl.clone();
    url.pathname = toPath;
    url.search = "";
    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c);
    });
    return redirectResponse;
  }

  if (isAuthedPath && !user) {
    return redirectTo("/");
  }

  if (path === "/" && user) {
    const { data: ocdUser } = await supabase
      .from("ocd_users")
      .select("onboarded_at")
      .eq("id", user.id)
      .maybeSingle();

    return redirectTo(ocdUser?.onboarded_at ? "/now" : "/welcome");
  }

  return response;
}
