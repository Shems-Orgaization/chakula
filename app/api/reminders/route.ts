// app/api/reminders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function context() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

// GET — fetch reminder settings + history
export async function GET() {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [settingsRes, historyRes] = await Promise.all([
    supabase
      .from("user_reminders")
      .select("*")
      .eq("user_id", user.id)
      .order("meal_type"),
    supabase
      .from("user_reminder_history")
      .select("*")
      .eq("user_id", user.id)
      .order("fired_at", { ascending: false })
      .limit(20),
  ]);

  return NextResponse.json({
    settings: settingsRes.data ?? [],
    history: historyRes.data ?? [],
  });
}

// POST — update settings (upsert)
export async function POST(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.meal_type || !["morning", "lunch", "evening"].includes(body.meal_type)) {
    return NextResponse.json({ error: "Valid meal_type required" }, { status: 400 });
  }

  const updates: Record<string, any> = {
    user_id: user.id,
    meal_type: body.meal_type,
    updated_at: new Date().toISOString(),
  };

  if (typeof body.enabled === "boolean") updates.enabled = body.enabled;
  if (typeof body.reminder_time === "string") updates.reminder_time = body.reminder_time;
  if (Array.isArray(body.days_of_week)) updates.days_of_week = body.days_of_week;
  if (typeof body.quiet_hours_start === "string") updates.quiet_hours_start = body.quiet_hours_start;
  if (typeof body.quiet_hours_end === "string") updates.quiet_hours_end = body.quiet_hours_end;

  const { data, error } = await supabase
    .from("user_reminders")
    .upsert(updates, { onConflict: "user_id,meal_type" })
    .select()
    .single();

  if (error) {
    console.error("Reminder POST error:", error);
    return NextResponse.json({ error: "Unable to save." }, { status: 500 });
  }

  return NextResponse.json({ setting: data });
}

// PATCH — mark history items as read
export async function PATCH(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);

  // Mark all as read
  if (body?.mark_all_read) {
    await supabase
      .from("user_reminder_history")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
    return NextResponse.json({ success: true });
  }

  // Mark one as read
  if (body?.id) {
    await supabase
      .from("user_reminder_history")
      .update({ read: true })
      .eq("id", body.id)
      .eq("user_id", user.id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Missing params" }, { status: 400 });
}

// DELETE — clear history
export async function DELETE() {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await supabase
    .from("user_reminder_history")
    .delete()
    .eq("user_id", user.id);

  return NextResponse.json({ success: true });
}