// app/api/recipes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .or(`slug.eq.${id},id.eq.${id}`)
    .eq("is_published", true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

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
    // ✅ Pass through real image (may be null)
    image: data.image_url ?? null,
    tags: data.tags ?? [],
    dietaryInfo: data.dietary_tags ?? [],
    popularity: data.comrade_score ?? 0,
    isComradeFriendly: data.is_comrade_friendly ?? false,
  };

  return NextResponse.json(recipe);
}