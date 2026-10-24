// app/api/collections/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_ITEMS = 500;
const ID_RE = /^[A-Za-z0-9_-]{1,80}$/;

async function context() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

function errJson(message: string, code: string, status: number) {
  return NextResponse.json({ error: message, code }, { status });
}

// GET — collection details with full recipes
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (typeof id !== "string" || !ID_RE.test(id)) {
    return errJson("Not found", "id_invalid", 404);
  }
  const { supabase, user } = await context();
  if (!user) return errJson("Unauthorized", "unauthorized", 401);

  const { data: collection, error: cErr } = await supabase
    .from("user_collections")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (cErr) return errJson("Unable to load.", "db_error", 500);
  if (!collection) return errJson("Not found", "not_found", 404);

  const { data: items, error: iErr } = await supabase
    .from("user_collection_items")
    .select("*")
    .eq("collection_id", id)
    .eq("user_id", user.id)
    .order("added_at", { ascending: false })
    .limit(MAX_ITEMS);

  if (iErr) return errJson("Unable to load.", "db_error", 500);

  const recipeIds = (items ?? [])
    .map((i) => i.recipe_id)
    .filter((rid): rid is string => typeof rid === "string" && rid.length > 0)
    .slice(0, MAX_ITEMS);

  const { data: recipes, error: rErr } = recipeIds.length
    ? await supabase.from("recipes").select("*").in("id", recipeIds).limit(MAX_ITEMS)
    : { data: [], error: null };

  if (rErr) return errJson("Unable to load.", "db_error", 500);

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
      recipe: item.recipe_id ? recipesMap[item.recipe_id] ?? null : null,
    }))
    .filter((item) => item.recipe);

  return NextResponse.json({ collection, items: enrichedItems });
}

// DELETE — remove item from collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (typeof id !== "string" || !ID_RE.test(id)) {
    return errJson("id invalid", "id_invalid", 400);
  }
  const { supabase, user } = await context();
  if (!user) return errJson("Unauthorized", "unauthorized", 401);

  const rawRecipeId = request.nextUrl.searchParams.get("recipe_id");
  if (!rawRecipeId || !ID_RE.test(rawRecipeId)) {
    return errJson("recipe_id required", "recipe_id_required", 400);
  }
  const recipeId = rawRecipeId;

  // Verify collection belongs to user before delete (rule 4).
  const { data: own, error: ownErr } = await supabase
    .from("user_collections")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (ownErr) return errJson("Unable to remove.", "db_error", 500);
  if (!own) return errJson("Not found", "not_found", 404);

  const { error } = await supabase
    .from("user_collection_items")
    .delete()
    .eq("collection_id", id)
    .eq("recipe_id", recipeId)
    .eq("user_id", user.id);

  if (error) return errJson("Unable to remove.", "db_error", 500);
  return new NextResponse(null, { status: 204 });
}