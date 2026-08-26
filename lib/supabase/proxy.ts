import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

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

  const pathname = request.nextUrl.pathname;

  const isApiPath = pathname.startsWith("/api/");

  const isAuthPage = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ].includes(pathname);

  const isPublicPath =
    pathname === "/auth/callback" ||
    pathname.startsWith("/_next");

  // API requests return JSON 401 instead of redirecting to HTML login page
  if (!user && isApiPath) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  // Protect application pages
  if (!user && !isAuthPage && !isPublicPath) {
    const redirect = request.nextUrl.clone();

    redirect.pathname = "/login";
    redirect.searchParams.set("next", pathname);

    return NextResponse.redirect(redirect);
  }

  // Logged-in users should not revisit auth pages
  if (user && isAuthPage) {
    const redirect = request.nextUrl.clone();

    redirect.pathname = "/";
    redirect.search = "";

    return NextResponse.redirect(redirect);
  }

  return response;
}