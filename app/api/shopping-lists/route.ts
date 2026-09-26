// app/api/shopping-lists/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function context() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

// GET — list all shopping lists
export async function GET(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = request.nextUrl.searchParams;
  const includeArchived = params.get("archived") === "true";

  let query = supabase
    .from("shopping_lists")
    .select("*")
    .eq("user_id", user.id);

  if (!includeArchived) {
    query = query.eq("archived", false);
  }

  const { data, error } = await query.order("start_date", { ascending: false });

  if (error) {
    console.error("Lists GET error:", error);
    return NextResponse.json({ error: "Unable to load lists." }, { status: 500 });
  }

  return NextResponse.json({ lists: data ?? [] });
}

// POST — create a new list
export async function POST(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || !body.name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  // Auto-compute end_date based on period_type
  const start = body.start_date || new Date().toISOString().split("T")[0];
  let end = body.end_date || null;

  if (!end) {
    const startDate = new Date(start);
    const periodType = body.period_type || "custom";

    if (periodType === "today") {
      end = start;
    } else if (periodType === "week") {
      const d = new Date(startDate);
      d.setDate(d.getDate() + 6);
      end = d.toISOString().split("T")[0];
    } else if (periodType === "month") {
      const d = new Date(startDate);
      d.setMonth(d.getMonth() + 1);
      d.setDate(d.getDate() - 1);
      end = d.toISOString().split("T")[0];
    }
  }

  const { data, error } = await supabase
    .from("shopping_lists")
    .insert({
      user_id: user.id,
      name: body.name.trim().slice(0, 80),
      period_type: body.period_type || "custom",
      start_date: start,
      end_date: end,
      budget: typeof body.budget === "number" ? body.budget : 0,
      notes: body.notes?.slice(0, 500) || null,
      color: body.color || "orange",
    })
    .select()
    .single();

  if (error) {
    console.error("Lists POST error:", error);
    return NextResponse.json({ error: "Unable to create list." }, { status: 500 });
  }

  return NextResponse.json({ list: data }, { status: 201 });
}

// PATCH — update list
export async function PATCH(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const updates: Record<string, any> = { updated_at: new Date().toISOString() };
  if (body.name) updates.name = body.name.trim().slice(0, 80);
  if (body.period_type) updates.period_type = body.period_type;
  if (body.start_date) updates.start_date = body.start_date;
  if (body.end_date !== undefined) updates.end_date = body.end_date;
  if (typeof body.budget === "number") updates.budget = body.budget;
  if (body.notes !== undefined) updates.notes = body.notes?.slice(0, 500) || null;
  if (typeof body.archived === "boolean") updates.archived = body.archived;
  if (body.color) updates.color = body.color;

  const { data, error } = await supabase
    .from("shopping_lists")
    .update(updates)
    .eq("id", body.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Unable to update." }, { status: 500 });
  return NextResponse.json({ list: data });
}

// DELETE
export async function DELETE(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = request.nextUrl.searchParams;
  const id = params.get("id");
  const archive = params.get("archive") === "true";

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (archive) {
    const { error } = await supabase
      .from("shopping_lists")
      .update({ archived: true })
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) return NextResponse.json({ error: "Unable to archive." }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  const { error } = await supabase
    .from("shopping_lists")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: "Unable to delete." }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}