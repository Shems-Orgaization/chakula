// app/api/reminders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ID_RE = /^[A-Za-z0-9_-]{1,80}$/;
const MEAL_TYPES = ["morning", "lunch", "evening"] as const;
const HHMM_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

async function context() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

function errJson(message: string, code: string, status: number) {
  return NextResponse.json({ error: message, code }, { status });
}

// GET — fetch reminder settings + history
export async function GET() {
  const { supabase, user } = await context();
  if (!user) return errJson("Unauthorized", "unauthorized", 401);

  const [settingsRes, historyRes] = await Promise.all([
    supabase
      .from("user_reminders")
      .select("*")
      .eq("user_id", user.id)
      .order("meal_type")
      .limit(10),
    supabase
      .from("user_reminder_history")
      .select("*")
      .eq("user_id", user.id)
      .order("fired_at", { ascending: false })
      .limit(20),
  ]);

  if (settingsRes.error || historyRes.error) {
    return errJson("Unable to load.", "db_error", 500);
  }

  return NextResponse.json({
    settings: settingsRes.data ?? [],
    history: historyRes.data ?? [],
  });
}

// POST — update settings (upsert)
export async function POST(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return errJson("Unauthorized", "unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return errJson("Valid meal_type required", "invalid_body", 400);
  }
  if (typeof body.meal_type !== "string" || !(MEAL_TYPES as readonly string[]).includes(body.meal_type)) {
    return errJson("Valid meal_type required", "meal_type_invalid", 400);
  }

  const updates: Record<string, unknown> = {
    user_id: user.id,
    meal_type: body.meal_type,
    updated_at: new Date().toISOString(),
  };

  if (body.enabled !== undefined) {
    if (typeof body.enabled !== "boolean") return errJson("enabled invalid.", "enabled_invalid", 400);
    updates.enabled = body.enabled;
  }
  if (body.reminder_time !== undefined) {
    if (typeof body.reminder_time !== "string" || !HHMM_RE.test(body.reminder_time)) {
      return errJson("reminder_time must be HH:MM.", "reminder_time_invalid", 400);
    }
    updates.reminder_time = body.reminder_time;
  }
  if (body.days_of_week !== undefined) {
    if (!Array.isArray(body.days_of_week) || body.days_of_week.length > 7) {
      return errJson("days_of_week invalid.", "days_of_week_invalid", 400);
    }

    const days: number[] = body.days_of_week.map((d: unknown) => Number(d));
    if (days.some((d: number) => !Number.isInteger(d) || d < 0 || d > 6)) {
      return errJson("days_of_week invalid.", "days_of_week_invalid", 400);
    }
    updates.days_of_week = Array.from(new Set(days));
  }
  if (body.quiet_hours_start !== undefined) {
    if (typeof body.quiet_hours_start !== "string" || !HHMM_RE.test(body.quiet_hours_start)) {
      return errJson("quiet_hours_start must be HH:MM.", "quiet_hours_start_invalid", 400);
    }
    updates.quiet_hours_start = body.quiet_hours_start;
  }
  if (body.quiet_hours_end !== undefined) {
    if (typeof body.quiet_hours_end !== "string" || !HHMM_RE.test(body.quiet_hours_end)) {
      return errJson("quiet_hours_end must be HH:MM.", "quiet_hours_end_invalid", 400);
    }
    updates.quiet_hours_end = body.quiet_hours_end;
  }

  const { data, error } = await supabase
    .from("user_reminders")
    .upsert(updates, { onConflict: "user_id,meal_type" })
    .select()
    .single();

  if (error) return errJson("Unable to save.", "db_error", 500);
  return NextResponse.json({ setting: data });
}

// PATCH — mark history items as read
export async function PATCH(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return errJson("Unauthorized", "unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return errJson("Missing params", "invalid_body", 400);
  }

  if (body.mark_all_read === true) {
    const { error } = await supabase
      .from("user_reminder_history")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
    if (error) return errJson("Unable to update.", "db_error", 500);
    return NextResponse.json({ success: true });
  }

  if (typeof body.id === "string" && ID_RE.test(body.id)) {
    const { error } = await supabase
      .from("user_reminder_history")
      .update({ read: true })
      .eq("id", body.id)
      .eq("user_id", user.id);
    if (error) return errJson("Unable to update.", "db_error", 500);
    return NextResponse.json({ success: true });
  }

  return errJson("Missing params", "missing_params", 400);
}

// DELETE — clear history
export async function DELETE() {
  const { supabase, user } = await context();
  if (!user) return errJson("Unauthorized", "unauthorized", 401);

  const { error } = await supabase
    .from("user_reminder_history")
    .delete()
    .eq("user_id", user.id);

  if (error) return errJson("Unable to clear.", "db_error", 500);
  return NextResponse.json({ success: true });
}