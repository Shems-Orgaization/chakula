// supabase/proxy.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const INACTIVITY_COOKIE = "chakula-last-active";
// 30 Days in milliseconds
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
// 30 Days in seconds (for the cookie maxAge)
const THIRTY_DAYS_SECONDS = 30 * 24 * 60 * 60;

// Public endpoints that MUST bypass auth — exact match on pathname + method.
const PUBLIC_GET_PATHS = new Set<string>(["/api/shared-plans"]);

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
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
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const withSessionCookies = (res: NextResponse) => {
    response.cookies.getAll().forEach((cookie) => res.cookies.set(cookie));
    return res;
  };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const method = request.method.toUpperCase();
  const isApiPath = pathname.startsWith("/api/");

  // (9) Public shared-plan lookup — exact token only, GET only.
  if (method === "GET" && PUBLIC_GET_PATHS.has(pathname)) {
    return response;
  }

  const isAuthPage = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ].includes(pathname);

  const isPublicPath =
    pathname === "/" ||
    pathname === "/auth/callback" ||
    pathname.startsWith("/_next");

  // ---------- INACTIVITY CHECK ----------
  if (user) {
    const lastActive = request.cookies.get(INACTIVITY_COOKIE)?.value;
    const now = Date.now();

    // Note on Auth logic: 
    // Supabase keeps the user logged in via the refresh token. 
    // This custom cookie is the ONLY thing enforcing the inactivity timeout.
    if (lastActive && now - Number(lastActive) > THIRTY_DAYS_MS) {
      await supabase.auth.signOut();

      if (isApiPath) {
        return withSessionCookies(
          NextResponse.json({ error: "Session expired due to inactivity" }, { status: 401 }),
        );
      }

      const redirect = request.nextUrl.clone();
      redirect.pathname = "/login";
      redirect.search = "";
      redirect.searchParams.set("reason", "idle");

      const res = withSessionCookies(NextResponse.redirect(redirect));
      res.cookies.delete(INACTIVITY_COOKIE);
      return res;
    }

    // Refresh the inactivity timer on every request
    response.cookies.set(INACTIVITY_COOKIE, String(now), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: THIRTY_DAYS_SECONDS,
    });
  }

  // API requests return JSON 401 instead of redirecting to HTML login page
  if (!user && isApiPath) {
    return withSessionCookies(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );
  }

  // Protect application pages
  if (!user && !isAuthPage && !isPublicPath) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    redirect.searchParams.set("next", pathname);
    return withSessionCookies(NextResponse.redirect(redirect));
  }

  // Logged-in users should not revisit auth pages (except password reset)
  if (user && isAuthPage && pathname !== "/reset-password") {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/dashboard";
    redirect.search = "";
    return withSessionCookies(NextResponse.redirect(redirect));
  }

  return response;
}