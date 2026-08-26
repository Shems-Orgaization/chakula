import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ✅ Add fallback function
function getRecipeImage(recipe: any): string {
  if (recipe.image_url) {
    return recipe.image_url;
  }
  
  // Colored placeholder with recipe name
  const colors = ['#f97316', '#8b5cf6', '#ec4899', '#06b6d4', '#22c55e', '#eab308'];
  const color = colors[(recipe.id?.length || 0) % colors.length];
  
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='${color.replace('#', '%23')}'/%3E%3Ctext x='200' y='150' text-anchor='middle' font-family='system-ui' font-size='24' fill='white' font-weight='bold'%3E${encodeURIComponent(recipe.name || 'Recipe')}%3C/text%3E%3C/svg%3E`;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const params = request.nextUrl.searchParams;
  const query = params.get("q")?.trim() ?? "";
  const category = params.get("category")?.trim();
  const mealType = params.get("mealType")?.trim();
  const maxTime = Number(params.get("maxTime"));
  const maxCost = Number(params.get("maxCost"));
  const limit = Math.min(Math.max(Number(params.get("limit") ?? 50), 1), 100);
  const offset = Math.max(Number(params.get("offset") ?? 0), 0);

  let builder = supabase
    .from("recipes")
    .select("*", { count: "exact" })
    .eq("is_published", true);
  if (query)
    builder = builder.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
  if (category && category !== "All")
    builder = builder.eq("category", category);
  if (mealType) builder = builder.eq("meal_type", mealType);
  if (Number.isFinite(maxTime) && maxTime > 0)
    builder = builder.lte("total_time_minutes", maxTime);
  if (Number.isFinite(maxCost) && maxCost > 0)
    builder = builder.lte("cost_min_kes", maxCost);

  const { data, error, count } = await builder
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error)
    return NextResponse.json(
      { error: "Unable to load recipes." },
      { status: 500 },
    );

  const recipes = (data ?? []).map((recipe) => ({
    id: recipe.id,
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
    // ✅ FIXED: Uses real image or fallback
    image: getRecipeImage(recipe),
    tags: recipe.tags ?? [],
    dietaryInfo: recipe.dietary_tags ?? [],
    popularity: recipe.popularity ?? 0,
  }));

  return NextResponse.json({
    recipes,
    total: count ?? recipes.length,
    limit,
    offset,
  });
}