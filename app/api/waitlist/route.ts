// app/api/waitlist/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_HITS;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Accepts 0712345678, 712345678, 254712345678, +254 712 345 678 and returns +254712345678. */
function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  let local: string;
  if (digits.startsWith("254")) local = digits.slice(3);
  else if (digits.startsWith("0")) local = digits.slice(1);
  else local = digits;
  return /^[71]\d{8}$/.test(local) ? `+254${local}` : null;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    contact?: unknown;
    source?: unknown;
    company?: unknown;
  } | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real people never fill this hidden field. Pretend success to bots.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  const contact = typeof body.contact === "string" ? body.contact.trim() : "";
  const source =
    typeof body.source === "string" ? body.source.slice(0, 40) : "unknown";

  if (!contact || contact.length > 254) {
    return NextResponse.json(
      { error: "Enter your email or phone number." },
      { status: 400 },
    );
  }

  let email: string | null = null;
  let phone: string | null = null;

  if (contact.includes("@")) {
    if (!EMAIL_PATTERN.test(contact)) {
      return NextResponse.json(
        { error: "That email doesn't look right." },
        { status: 400 },
      );
    }
    email = contact.toLowerCase();
  } else {
    phone = normalizePhone(contact);
    if (!phone) {
      return NextResponse.json(
        { error: "Enter a valid Kenyan number, e.g. 0712 345 678." },
        { status: 400 },
      );
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json(
      { error: "Sign-ups are not available right now." },
      { status: 500 },
    );
  }

  // Service role key stays on the server. The table has RLS on with no public policies.
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  const { error } = await supabase
    .from("waitlist")
    .insert({ email, phone, source });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "You're already on the list." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}