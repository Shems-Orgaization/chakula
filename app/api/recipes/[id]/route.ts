// app/api/recipes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ID_RE = /^[A-Za-z0-9_-]{1,80}$/;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (typeof id !== "string" || !ID_RE.test(id)) {
    return NextResponse.json({ error: "Recipe not found", code: "not_found" }, { status: 404 });
  }
  const supabase = await createClient();

  // Sanitize the `or` filter input — PostgREST or-strings treat , ( ) as syntax.
  const safeId = id.replace(/[%,()]/g, "");

  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .or(`slug.eq.${safeId},id.eq.${safeId}`)
    .eq("is_published", true)
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: "Recipe not found", code: "not_found" }, { status: 404 });
  if (!data) return NextResponse.json({ error: "Recipe not found", code: "not_found" }, { status: 404 });

  const recipe = {
    id: data.id,
    slug: data.slug,
    name: data.name,
    description: data.description,
    category: data.category,
    mealType: data.meal_type,
    ingredients: data.ingredients,
    instructions: data.instructions,
    prepTime: Math.max(5, data.total_time_minutes - 10),
    cookTime: data.total_time_minutes,
    totalTime: data.total_time_minutes,
    servings: data.servings,
    difficulty: data.difficulty === "medium" ? "Medium" : "Easy",
    estimatedCost: { min: data.cost_min_kes, max: data.cost_max_kes },
    equipment: ["Sufuria", "Wooden spoon"],
    image: data.image_url ?? null,
    tags: data.tags ?? [],
    dietaryInfo: data.dietary_tags ?? [],
    allergens: data.allergens ?? [],
    popularity: data.comrade_score ?? 0,
    budgetTier: data.budget_tier ?? 500,
    isComradeFriendly: data.is_comrade_friendly ?? false,
  };

  return NextResponse.json(recipe);
}