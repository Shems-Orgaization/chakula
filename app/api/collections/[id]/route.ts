// app/api/collections/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function context() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

// GET — collection details with full recipes
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get collection
  const { data: collection } = await supabase
    .from("user_collections")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!collection) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Get items
  const { data: items } = await supabase
    .from("user_collection_items")
    .select("*")
    .eq("collection_id", id)
    .order("added_at", { ascending: false });

  // Enrich with recipe data
  const recipeIds = (items ?? [])
    .map((i) => i.recipe_id)
    .filter((id): id is string => Boolean(id));

  const { data: recipes } = recipeIds.length
    ? await supabase.from("recipes").select("*").in("id", recipeIds)
    : { data: [] };

  const recipesMap: Record<string, any> = {};
  for (const r of recipes ?? []) {
    recipesMap[r.id] = {
      id: r.id,
      slug: r.slug,
      name: r.name,
      description: r.description,
      category: r.category,
      mealType: r.meal_type,
      ingredients: r.ingredients,
      instructions: r.instructions,
      totalTime: r.total_time_minutes,
      servings: r.servings,
      difficulty: r.difficulty === "medium" ? "Medium" : "Easy",
      estimatedCost: { min: r.cost_min_kes, max: r.cost_max_kes },
      image: r.image_url,
      tags: r.tags ?? [],
      dietaryInfo: r.dietary_tags ?? [],
    };
  }

  const enrichedItems = (items ?? [])
    .map((item) => ({
      ...item,
      recipe: item.recipe_id ? recipesMap[item.recipe_id] : null,
    }))
    .filter((item) => item.recipe);

  return NextResponse.json({
    collection,
    items: enrichedItems,
  });
}

// DELETE — remove item from collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const recipeId = request.nextUrl.searchParams.get("recipe_id");
  if (!recipeId) return NextResponse.json({ error: "recipe_id required" }, { status: 400 });

  const { error } = await supabase
    .from("user_collection_items")
    .delete()
    .eq("collection_id", id)
    .eq("recipe_id", recipeId)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: "Unable to remove." }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}