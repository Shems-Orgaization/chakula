// app/api/user-recipes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_RECIPES_PER_USER = 200;
const INVALID = Symbol("invalid");

// ---------- Field rules ----------
// Each rule returns the cleaned value, or INVALID when the type is wrong.
// null / undefined are treated as "not sent" and handled by the caller.

const text = (max: number) => (v: unknown) =>
  typeof v === "string" ? v.slice(0, max) : INVALID;

const name = (v: unknown) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, 120) : INVALID;

const num = (min: number, max: number) => (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : INVALID;
};

// Array with a cap on item count and total size, so one request cannot store megabytes.
const list = (maxItems: number, maxChars: number) => (v: unknown) => {
  if (!Array.isArray(v)) return INVALID;
  const items = v.slice(0, maxItems);
  return JSON.stringify(items).length <= maxChars ? items : INVALID;
};

const imageUrl = (v: unknown) =>
  typeof v === "string" && v.length <= 2048 ? v : INVALID;

const RULES: Record<string, (v: unknown) => unknown> = {
  name,
  description: text(500),
  category: text(50),
  meal_type: text(30),
  difficulty: text(30),
  total_time_minutes: num(1, 1440),
  servings: num(1, 100),
  cost_min_kes: num(0, 1_000_000),
  cost_max_kes: num(0, 1_000_000),
  ingredients: list(100, 20_000),
  instructions: list(100, 20_000),
  image_url: imageUrl,
  tags: list(20, 2_000),
  dietary_tags: list(20, 2_000),
};

function clean(body: Record<string, unknown>) {
  const values: Record<string, unknown> = {};
  for (const key of Object.keys(RULES)) {
    const raw = body[key];
    if (raw === undefined || raw === null) continue;
    const value = RULES[key](raw);
    if (value === INVALID) return { error: `Invalid ${key}` as string };
    values[key] = value;
  }
  return { values };
}

function isObject(body: unknown): body is Record<string, unknown> {
  return typeof body === "object" && body !== null && !Array.isArray(body);
}

async function context() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function GET() {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("user_recipes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Unable to load." }, { status: 500 });
  return NextResponse.json({ recipes: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!isObject(body) || !body.name) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }

  const { values, error: invalid } = clean(body);
  if (!values) return NextResponse.json({ error: invalid }, { status: 400 });

  const { count } = await supabase
    .from("user_recipes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  if ((count ?? 0) >= MAX_RECIPES_PER_USER) {
    return NextResponse.json({ error: "Recipe limit reached." }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("user_recipes")
    .insert({
      user_id: user.id,
      name: values.name,
      description: values.description || "",
      category: values.category || "Other",
      meal_type: values.meal_type || "Dinner",
      difficulty: values.difficulty || "easy",
      total_time_minutes: values.total_time_minutes || 30,
      servings: values.servings || 2,
      cost_min_kes: values.cost_min_kes || 0,
      cost_max_kes: values.cost_max_kes || 0,
      ingredients: values.ingredients ?? [],
      instructions: values.instructions ?? [],
      image_url: values.image_url || null,
      tags: values.tags ?? [],
      dietary_tags: values.dietary_tags ?? [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Unable to create." }, { status: 500 });
  return NextResponse.json({ recipe: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (
    !isObject(body) ||
    !(typeof body.id === "string" || typeof body.id === "number") ||
    String(body.id).length > 64
  ) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const { values, error: invalid } = clean(body);
  if (!values) return NextResponse.json({ error: invalid }, { status: 400 });

  const updates: Record<string, unknown> = {
    ...values,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("user_recipes")
    .update(updates)
    .eq("id", body.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Unable to update." }, { status: 500 });
  return NextResponse.json({ recipe: data });
}

export async function DELETE(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id || id.length > 64) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase
    .from("user_recipes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: "Unable to delete." }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}