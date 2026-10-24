// app/api/shopping-lists/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ID_RE = /^[A-Za-z0-9_-]{1,80}$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const COLOR_RE = /^[a-zA-Z]{1,20}$/;
const PERIOD_TYPES = ["today", "week", "month", "custom"] as const;
const MAX_LISTS = 100;
const MAX_BUDGET = 10_000_000;

async function context() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

function errJson(message: string, code: string, status: number) {
  return NextResponse.json({ error: message, code }, { status });
}

function isIsoDate(s: string): boolean {
  if (!ISO_DATE_RE.test(s)) return false;
  return !Number.isNaN(new Date(s + "T00:00:00Z").getTime());
}

// GET — list all shopping lists
export async function GET(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return errJson("Unauthorized", "unauthorized", 401);

  const params = request.nextUrl.searchParams;
  const includeArchived = params.get("archived") === "true";

  let query = supabase
    .from("shopping_lists")
    .select("*")
    .eq("user_id", user.id);

  if (!includeArchived) query = query.eq("archived", false);

  const { data, error } = await query
    .order("start_date", { ascending: false })
    .limit(MAX_LISTS);

  if (error) return errJson("Unable to load lists.", "db_error", 500);
  return NextResponse.json({ lists: data ?? [] });
}

// POST — create a new list
export async function POST(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return errJson("Unauthorized", "unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return errJson("name is required", "invalid_body", 400);
  }
  if (typeof body.name !== "string" || !body.name.trim()) {
    return errJson("name is required", "name_required", 400);
  }

  const { count, error: cErr } = await supabase
    .from("shopping_lists")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  if (cErr) return errJson("Unable to create list.", "db_error", 500);
  if ((count ?? 0) >= MAX_LISTS) {
    return errJson("List limit reached.", "limit_reached", 403);
  }

  // Dates
  const todayIso = new Date().toISOString().split("T")[0];
  let start = todayIso;
  if (body.start_date !== undefined && body.start_date !== null) {
    if (typeof body.start_date !== "string" || !isIsoDate(body.start_date)) {
      return errJson("start_date invalid", "start_date_invalid", 400);
    }
    start = body.start_date;
  }
  let end: string | null = null;
  if (body.end_date !== undefined && body.end_date !== null) {
    if (typeof body.end_date !== "string" || !isIsoDate(body.end_date)) {
      return errJson("end_date invalid", "end_date_invalid", 400);
    }
    end = body.end_date;
  }

  let periodType: typeof PERIOD_TYPES[number] = "custom";
  if (body.period_type !== undefined) {
    if (typeof body.period_type !== "string" || !(PERIOD_TYPES as readonly string[]).includes(body.period_type)) {
      return errJson("period_type invalid", "period_type_invalid", 400);
    }
    periodType = body.period_type as typeof PERIOD_TYPES[number];
  }

  if (!end) {
    const d = new Date(start + "T00:00:00Z");
    if (periodType === "today") end = start;
    else if (periodType === "week") {
      d.setUTCDate(d.getUTCDate() + 6);
      end = d.toISOString().split("T")[0];
    } else if (periodType === "month") {
      d.setUTCMonth(d.getUTCMonth() + 1);
      d.setUTCDate(d.getUTCDate() - 1);
      end = d.toISOString().split("T")[0];
    }
  }

  let budget = 0;
  if (body.budget !== undefined && body.budget !== null) {
    if (typeof body.budget !== "number" || !Number.isFinite(body.budget) || body.budget < 0 || body.budget > MAX_BUDGET) {
      return errJson("budget invalid", "budget_invalid", 400);
    }
    budget = body.budget;
  }

  let notes: string | null = null;
  if (body.notes !== undefined && body.notes !== null) {
    if (typeof body.notes !== "string") return errJson("notes invalid", "notes_invalid", 400);
    notes = body.notes.slice(0, 500) || null;
  }

  let color = "orange";
  if (body.color !== undefined) {
    if (typeof body.color !== "string" || !COLOR_RE.test(body.color)) {
      return errJson("color invalid", "color_invalid", 400);
    }
    color = body.color;
  }

  const { data, error } = await supabase
    .from("shopping_lists")
    .insert({
      user_id: user.id,
      name: body.name.trim().slice(0, 80),
      period_type: periodType,
      start_date: start,
      end_date: end,
      budget,
      notes,
      color,
    })
    .select()
    .single();

  if (error) return errJson("Unable to create list.", "db_error", 500);
  return NextResponse.json({ list: data }, { status: 201 });
}

// PATCH — update list
export async function PATCH(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return errJson("Unauthorized", "unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return errJson("id required", "invalid_body", 400);
  }
  if (typeof body.id !== "string" || !ID_RE.test(body.id)) {
    return errJson("id required", "id_invalid", 400);
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) return errJson("name invalid", "name_invalid", 400);
    updates.name = body.name.trim().slice(0, 80);
  }
  if (body.period_type !== undefined) {
    if (typeof body.period_type !== "string" || !(PERIOD_TYPES as readonly string[]).includes(body.period_type)) {
      return errJson("period_type invalid", "period_type_invalid", 400);
    }
    updates.period_type = body.period_type;
  }
  if (body.start_date !== undefined) {
    if (typeof body.start_date !== "string" || !isIsoDate(body.start_date)) return errJson("start_date invalid", "start_date_invalid", 400);
    updates.start_date = body.start_date;
  }
  if (body.end_date !== undefined) {
    if (body.end_date === null) updates.end_date = null;
    else if (typeof body.end_date === "string" && isIsoDate(body.end_date)) updates.end_date = body.end_date;
    else return errJson("end_date invalid", "end_date_invalid", 400);
  }
  if (body.budget !== undefined) {
    if (typeof body.budget !== "number" || !Number.isFinite(body.budget) || body.budget < 0 || body.budget > MAX_BUDGET) {
      return errJson("budget invalid", "budget_invalid", 400);
    }
    updates.budget = body.budget;
  }
  if (body.notes !== undefined) {
    if (body.notes === null) updates.notes = null;
    else if (typeof body.notes === "string") updates.notes = body.notes.slice(0, 500) || null;
    else return errJson("notes invalid", "notes_invalid", 400);
  }
  if (body.archived !== undefined) {
    if (typeof body.archived !== "boolean") return errJson("archived invalid", "archived_invalid", 400);
    updates.archived = body.archived;
  }
  if (body.color !== undefined) {
    if (typeof body.color !== "string" || !COLOR_RE.test(body.color)) return errJson("color invalid", "color_invalid", 400);
    updates.color = body.color;
  }

  if (Object.keys(updates).length === 1) {
    return errJson("Nothing to update.", "nothing_to_update", 400);
  }

  const { data, error } = await supabase
    .from("shopping_lists")
    .update(updates)
    .eq("id", body.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return errJson("Unable to update.", "db_error", 500);
  return NextResponse.json({ list: data });
}

// DELETE
export async function DELETE(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return errJson("Unauthorized", "unauthorized", 401);

  const params = request.nextUrl.searchParams;
  const id = params.get("id");
  const archive = params.get("archive") === "true";

  if (!id || !ID_RE.test(id)) return errJson("id required", "id_invalid", 400);

  if (archive) {
    const { error } = await supabase
      .from("shopping_lists")
      .update({ archived: true })
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) return errJson("Unable to archive.", "db_error", 500);
    return NextResponse.json({ success: true });
  }

  const { error } = await supabase
    .from("shopping_lists")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return errJson("Unable to delete.", "db_error", 500);
  return new NextResponse(null, { status: 204 });
}