// app/api/recipes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const params = request.nextUrl.searchParams;
  const query = params.get("q")?.trim() ?? "";
  const category = params.get("category")?.trim();
  const mealType = params.get("mealType")?.trim();
  const maxTime = Number(params.get("maxTime"));
  const maxCost = Number(params.get("maxCost"));
  const includeAll = params.get("includeAll") === "true";
  const page = Math.max(Number(params.get("page") ?? 1), 1);
  const limit = Math.min(Math.max(Number(params.get("limit") ?? 50), 1), 100);
  const offset = (page - 1) * limit;

  let builder = supabase
    .from("recipes")
    .select("*", { count: "exact" })
    .eq("is_published", true);

  if (!includeAll && !query) {
    builder = builder.eq("is_comrade_friendly", true);
  }

  if (query)
    builder = builder.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
  if (category && category !== "All" && category !== "Comrade Favorites")
    builder = builder.eq("category", category);
  if (mealType) builder = builder.eq("meal_type", mealType);
  if (Number.isFinite(maxTime) && maxTime > 0)
    builder = builder.lte("total_time_minutes", maxTime);
  if (Number.isFinite(maxCost) && maxCost > 0)
    builder = builder.lte("cost_min_kes", maxCost);

  const { data, error, count } = await builder
    .order("comrade_score", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error)
    return NextResponse.json(
      { error: "Unable to load recipes." },
      { status: 500 },
    );

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
    // ✅ Pass through real image (may be null)
    image: recipe.image_url ?? null,
    tags: recipe.tags ?? [],
    dietaryInfo: recipe.dietary_tags ?? [],
    popularity: recipe.comrade_score ?? 0,
    isComradeFriendly: recipe.is_comrade_friendly ?? false,
  }));

  const total = count ?? recipes.length;
  const hasMore = offset + recipes.length < total;

  return NextResponse.json({
    recipes,
    total,
    page,
    limit,
    hasMore,
    nextPage: hasMore ? page + 1 : null,
  });
}