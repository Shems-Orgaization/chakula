// app/api/recipes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Reads a whole number from the URL. Bad or missing values fall back to `fallback`.
function intParam(value: string | null, fallback: number, min: number, max: number): number {
  const n = Number(value);
  if (value === null || !Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.trunc(n), min), max);
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const params = request.nextUrl.searchParams;
  // Characters that mean something inside a PostgREST `or(...)` filter are removed.
  const query = (params.get("q") ?? "").trim().slice(0, 80).replace(/[%,()]/g, "");
  const category = params.get("category")?.trim();
  const mealType = params.get("mealType")?.trim();
  const maxTime = Number(params.get("maxTime"));
  const maxCost = Number(params.get("maxCost"));
  const page = intParam(params.get("page"), 1, 1, 1000);
  const limit = intParam(params.get("limit"), 50, 1, 200);
  const offset = (page - 1) * limit;

  let builder = supabase
    .from("recipes")
    .select("*", { count: "exact" })
    .eq("is_published", true);

  if (query) builder = builder.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
  if (category && category !== "All" && category !== "Comrade Favorites") builder = builder.eq("category", category);
  if (mealType) builder = builder.eq("meal_type", mealType);
  if (Number.isFinite(maxTime) && maxTime > 0) builder = builder.lte("total_time_minutes", maxTime);
  if (Number.isFinite(maxCost) && maxCost > 0) builder = builder.lte("cost_min_kes", maxCost);

  const { data, error, count } = await builder
    .order("comrade_score", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: "Unable to load recipes." }, { status: 500 });

  const recipes = (data ?? []).map((recipe) => ({
    id: recipe.id,
    slug: recipe.slug,
    name: recipe.name,
    description: recipe.description,
    category: recipe.category,
    mealType: recipe.meal_type,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    prepTime: Math.max(5, recipe.total_time_minutes - 10),
    cookTime: recipe.total_time_minutes,
    totalTime: recipe.total_time_minutes,
    servings: recipe.servings,
    difficulty: recipe.difficulty === "medium" ? "Medium" : "Easy",
    estimatedCost: { min: recipe.cost_min_kes, max: recipe.cost_max_kes },
    equipment: ["Sufuria", "Wooden spoon"],
    image: recipe.image_url ?? null,
    tags: recipe.tags ?? [],
    dietaryInfo: recipe.dietary_tags ?? [],
    allergens: recipe.allergens ?? [],
    popularity: recipe.comrade_score ?? 0,
    budgetTier: recipe.budget_tier ?? 500,
    isComradeFriendly: recipe.is_comrade_friendly ?? false,
  }));

  const total = count ?? recipes.length;
  const hasMore = offset + recipes.length < total;

  return NextResponse.json({ recipes, total, page, limit, hasMore, nextPage: hasMore ? page + 1 : null });
}