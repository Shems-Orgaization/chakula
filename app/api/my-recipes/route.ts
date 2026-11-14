// app/api/my-recipes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ID_RE = /^[A-Za-z0-9_-]{1,80}$/;
const MEALS = ["Breakfast", "Lunch", "Dinner", "Snack"];
const MAX_ROWS = 200;

const err = (message: string, code: string, status: number) => NextResponse.json({ error: message, code }, { status });
const str = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");
const int = (v: unknown, min: number, max: number, d: number) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(Math.max(Math.round(v), min), max) : d;

async function ctx() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function GET() {
  const { supabase, user } = await ctx();
  if (!user) return err("Unauthorized", "unauthorized", 401);
  const { data, error } = await supabase
    .from("user_recipes").select("*").eq("user_id", user.id)
    .order("created_at", { ascending: false }).limit(MAX_ROWS);
  if (error) return err("Unable to load.", "db_error", 500);
  return NextResponse.json({ recipes: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await ctx();
  if (!user) return err("Unauthorized", "unauthorized", 401);
  const b = await request.json().catch(() => null);
  if (!b || typeof b !== "object" || Array.isArray(b)) return err("Invalid body", "invalid_body", 400);

  const name = str(b.name, 120);
  if (!name) return err("name required", "name_required", 400);

  const ingredients = (Array.isArray(b.ingredients) ? b.ingredients : []).slice(0, 40).flatMap((i: unknown) => {
    const x = i as Record<string, unknown>;
    const n = str(x?.name, 80);
    if (!n) return [];
    return [{
      name: n,
      amount: str(x.amount, 40),
      qty: typeof x.qty === "number" && Number.isFinite(x.qty) && x.qty >= 0 && x.qty <= 100000 ? x.qty : null,
      unit: str(x.unit, 24),
      optional: x.optional === true,
    }];
  });
  const instructions = (Array.isArray(b.instructions) ? b.instructions : [])
    .slice(0, 30).map((s: unknown) => str(s, 500)).filter(Boolean);
  if (!ingredients.length || !instructions.length) return err("ingredients and instructions required", "content_required", 400);

  let baseId: string | null = null;
  if (b.base_recipe_id !== undefined && b.base_recipe_id !== null) {
    if (typeof b.base_recipe_id !== "string" || !ID_RE.test(b.base_recipe_id)) return err("base_recipe_id invalid", "base_invalid", 400);
    const { data } = await supabase.from("recipes").select("id").eq("id", b.base_recipe_id).maybeSingle();
    if (!data) return err("Recipe not found", "recipe_not_found", 404);
    baseId = b.base_recipe_id;
  }

  const { count } = await supabase.from("user_recipes").select("id", { count: "exact", head: true }).eq("user_id", user.id);
  if ((count ?? 0) >= MAX_ROWS) return err("My recipes limit reached.", "limit_reached", 403);

  const min = int(b.cost_min_kes, 0, 1_000_000, 0);
  const { data, error } = await supabase.from("user_recipes").insert({
    user_id: user.id,
    base_recipe_id: baseId,
    name,
    description: str(b.description, 500),
    category: str(b.category, 40) || "Other",
    meal_type: MEALS.includes(b.meal_type as string) ? b.meal_type : "Dinner",
    difficulty: b.difficulty === "medium" ? "medium" : "easy",
    total_time_minutes: int(b.total_time_minutes, 1, 600, 30),
    cost_min_kes: min,
    cost_max_kes: Math.max(min, int(b.cost_max_kes, 0, 1_000_000, min)),
    servings: int(b.servings, 1, 20, 2),
    ingredients,
    instructions,
    is_ai: b.is_ai === true,
  }).select().single();
  if (error) return err("Unable to save.", "db_error", 500);
  return NextResponse.json({ recipe: data }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { supabase, user } = await ctx();
  if (!user) return err("Unauthorized", "unauthorized", 401);
  const id = request.nextUrl.searchParams.get("id");
  if (!id || !ID_RE.test(id)) return err("id invalid", "id_invalid", 400);
  const { error } = await supabase.from("user_recipes").delete().eq("id", id).eq("user_id", user.id);
  if (error) return err("Unable to delete.", "db_error", 500);
  return new NextResponse(null, { status: 204 });
}