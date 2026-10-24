// app/api/surprise/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ID_RE = /^[A-Za-z0-9_-]{1,80}$/;
const ACTIONS = ["shown", "cooked", "saved", "skipped"] as const;

async function context() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

function errJson(message: string, code: string, status: number) {
  return NextResponse.json({ error: message, code }, { status });
}

export async function GET(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return errJson("Unauthorized", "unauthorized", 401);

  const params = request.nextUrl.searchParams;

  let budget = 300;
  const rawBudget = params.get("budget");
  if (rawBudget !== null) {
    const n = Number(rawBudget);
    if (!Number.isFinite(n) || n < 0 || n > 1_000_000) return errJson("budget invalid", "budget_invalid", 400);
    budget = n;
  }

  let maxTime = 60;
  const rawMaxTime = params.get("maxTime");
  if (rawMaxTime !== null) {
    const n = Number(rawMaxTime);
    if (!Number.isFinite(n) || n < 1 || n > 1440) return errJson("maxTime invalid", "max_time_invalid", 400);
    maxTime = n;
  }

  let count = 6;
  const rawCount = params.get("count");
  if (rawCount !== null) {
    const n = Number(rawCount);
    if (!Number.isFinite(n) || n < 1 || n > 12) return errJson("count invalid", "count_invalid", 400);
    count = Math.floor(n);
  }

  const mealType = params.get("mealType");
  if (mealType !== null && mealType.length > 40) return errJson("mealType invalid", "meal_type_invalid", 400);
  const difficulty = params.get("difficulty");
  if (difficulty !== null && difficulty.length > 20) return errJson("difficulty invalid", "difficulty_invalid", 400);
  const category = params.get("category");
  if (category !== null && category.length > 60) return errJson("category invalid", "category_invalid", 400);

  const { data: recentSurprises, error: rhErr } = await supabase
    .from("user_surprise_history")
    .select("recipe_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  if (rhErr) return errJson("Unable to load.", "db_error", 500);

  const excludeIds = new Set(
    (recentSurprises ?? [])
      .map((r) => r.recipe_id)
      .filter((x): x is string => typeof x === "string")
  );

  const [prefRes, logRes] = await Promise.all([
    supabase.from("user_preferences").select("favorites, pantry").eq("user_id", user.id).maybeSingle(),
    supabase.from("user_cooking_log").select("recipe_id").eq("user_id", user.id).order("cooked_at", { ascending: false }).limit(30),
  ]);
  if (prefRes.error || logRes.error) return errJson("Unable to load.", "db_error", 500);

  const pantry: string[] = Array.isArray(prefRes.data?.pantry)
    ? (prefRes.data!.pantry as unknown[]).filter((x): x is string => typeof x === "string")
    : [];
  const recentlyCooked = new Set(
    (logRes.data ?? [])
      .map((l) => l.recipe_id)
      .filter((x): x is string => typeof x === "string")
  );

  let builder = supabase
    .from("recipes")
    .select("*")
    .eq("is_published", true)
    .eq("is_comrade_friendly", true)
    .lte("total_time_minutes", maxTime)
    .lte("cost_min_kes", budget)
    .limit(80);
  if (mealType) builder = builder.eq("meal_type", mealType);
  if (difficulty) builder = builder.eq("difficulty", difficulty.toLowerCase());
  if (category) builder = builder.eq("category", category);

  const { data: recipes, error } = await builder;
  if (error) return errJson("Unable to load.", "db_error", 500);

  const scored = (recipes ?? [])
    .filter((r) => !recentlyCooked.has(r.id))
    .map((r) => {
      const ingredients: { name: string }[] = Array.isArray(r.ingredients) ? r.ingredients : [];
      const pantryMatches = ingredients.filter((ing) =>
        typeof ing?.name === "string" &&
        pantry.some((p) => ing.name.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(ing.name.toLowerCase()))
      );
      const pantryScore = ingredients.length > 0 ? (pantryMatches.length / ingredients.length) * 100 : 0;

      const budgetScore = r.cost_min_kes <= budget ? 100 : Math.max(0, 100 - ((r.cost_min_kes - budget) / Math.max(budget, 1)) * 100);
      const timeScore = r.total_time_minutes <= maxTime ? 100 : Math.max(0, 100 - (r.total_time_minutes - maxTime) * 3);
      const freshnessScore = excludeIds.has(r.id) ? 20 : 100;
      const comradeScore = r.comrade_score ?? 0;

      const score = Math.round(pantryScore * 0.3 + budgetScore * 0.2 + timeScore * 0.2 + freshnessScore * 0.15 + comradeScore * 0.15);

      const reasons: string[] = [];
      if (pantryMatches.length >= 3) reasons.push(`${pantryMatches.length} ingredients in pantry`);
      if (r.total_time_minutes <= 30) reasons.push("Quick to cook");
      if (r.cost_min_kes <= 150) reasons.push("Budget-friendly");
      if (excludeIds.has(r.id)) reasons.push("Fresh pick");

      return {
        recipe: {
          id: r.id, slug: r.slug, name: r.name, description: r.description, category: r.category,
          mealType: r.meal_type, ingredients: r.ingredients, instructions: r.instructions,
          prepTime: Math.max(5, r.total_time_minutes - 10), cookTime: r.total_time_minutes,
          totalTime: r.total_time_minutes, servings: r.servings,
          difficulty: r.difficulty === "medium" ? "Medium" : "Easy",
          estimatedCost: { min: r.cost_min_kes, max: r.cost_max_kes },
          equipment: ["Sufuria", "Wooden spoon"], image: r.image_url ?? "",
          tags: r.tags ?? [], dietaryInfo: r.dietary_tags ?? [], allergens: r.allergens ?? [],
          popularity: r.comrade_score ?? 0, budgetTier: r.budget_tier ?? 500,
        },
        score, pantryMatches: pantryMatches.map((p) => p.name), reasons, isNew: !excludeIds.has(r.id),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, count);

  if (scored.length > 0) {
    const { error: insErr } = await supabase.from("user_surprise_history").insert(
      scored.map((s) => ({
        user_id: user.id,
        recipe_id: s.recipe.id,
        action: "shown",
        filters: { budget, maxTime, mealType, difficulty, category },
      }))
    );
    if (insErr) return errJson("Unable to record.", "db_error", 500);
  }

  return NextResponse.json({ suggestions: scored });
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return errJson("Unauthorized", "unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return errJson("recipe_id and action required", "invalid_body", 400);
  }
  if (typeof body.recipe_id !== "string" || !ID_RE.test(body.recipe_id)) {
    return errJson("recipe_id and action required", "recipe_id_invalid", 400);
  }
  if (typeof body.action !== "string" || !(ACTIONS as readonly string[]).includes(body.action)) {
    return errJson("Invalid action", "action_invalid", 400);
  }

  let filters: Record<string, unknown> = {};
  if (body.filters !== undefined && body.filters !== null) {
    if (typeof body.filters !== "object" || Array.isArray(body.filters)) {
      return errJson("filters invalid", "filters_invalid", 400);
    }
    const raw = JSON.stringify(body.filters);
    if (raw.length > 2000) return errJson("filters too large", "filters_too_large", 413);
    filters = body.filters as Record<string, unknown>;
  }

  const { error } = await supabase.from("user_surprise_history").insert({
    user_id: user.id,
    recipe_id: body.recipe_id,
    action: body.action,
    filters,
  });
  if (error) return errJson("Unable to record.", "db_error", 500);
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const { supabase, user } = await context();
  if (!user) return errJson("Unauthorized", "unauthorized", 401);
  const { error } = await supabase.from("user_surprise_history").delete().eq("user_id", user.id);
  if (error) return errJson("Unable to clear.", "db_error", 500);
  return NextResponse.json({ success: true });
}