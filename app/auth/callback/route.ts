// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Only allow paths on our own site.
// Blocks "//evil.com" and "/\evil.com", which start with "/" but leave the site.
function safeNext(next: string | null, origin: string): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return "/";
  }
  try {
    const target = new URL(next, origin);
    return target.origin === origin ? target.pathname + target.search + target.hash : "/";
  } catch {
    return "/";
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"), url.origin);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    // Expired link, or opened in a different browser than the one that asked for it.
    if (error) {
      return NextResponse.redirect(new URL("/login?error=auth", url.origin));
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}