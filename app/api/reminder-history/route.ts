// app/api/reminder-history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MEAL_TYPES = ["morning", "lunch", "evening"] as const;
const MAX_HISTORY = 500;

function errJson(message: string, code: string, status: number) {
  return NextResponse.json({ error: message, code }, { status });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return errJson("Unauthorized", "unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return errJson("Invalid body.", "invalid_body", 400);
  }

  const mealType = body.meal_type;
  if (typeof mealType !== "string" || !(MEAL_TYPES as readonly string[]).includes(mealType)) {
    return errJson("Invalid meal_type.", "meal_type_invalid", 400);
  }
  if (typeof body.title !== "string" || !body.title.trim()) {
    return errJson("title required.", "title_required", 400);
  }
  if (body.message !== undefined && body.message !== null && typeof body.message !== "string") {
    return errJson("message must be a string.", "message_invalid", 400);
  }

  // Cap history size per user
  const { count, error: countErr } = await supabase
    .from("user_reminder_history")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  if (countErr) return errJson("Failed", "db_error", 500);
  if ((count ?? 0) >= MAX_HISTORY) {
    // best-effort prune oldest to keep growing unbounded? No — reject to be safe.
    return errJson("History limit reached.", "limit_reached", 403);
  }

  const { error } = await supabase.from("user_reminder_history").insert({
    user_id: user.id,
    meal_type: mealType,
    title: body.title.trim().slice(0, 200),
    message: typeof body.message === "string" ? body.message.slice(0, 2000) : null,
  });

  if (error) return errJson("Failed", "db_error", 500);
  return NextResponse.json({ success: true });
}