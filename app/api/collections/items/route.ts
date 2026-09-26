// app/api/collections/items/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function context() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

// POST — add recipe to collection(s)
export async function POST(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.recipe_id || !Array.isArray(body.collection_ids)) {
    return NextResponse.json({ error: "recipe_id and collection_ids required" }, { status: 400 });
  }

  // Check what already exists to avoid duplicates
  const { data: existing } = await supabase
    .from("user_collection_items")
    .select("collection_id")
    .eq("user_id", user.id)
    .eq("recipe_id", body.recipe_id)
    .in("collection_id", body.collection_ids);

  const existingIds = new Set((existing ?? []).map((e) => e.collection_id));
  const toInsert = body.collection_ids
    .filter((id: string) => !existingIds.has(id))
    .map((collection_id: string) => ({
      collection_id,
      user_id: user.id,
      recipe_id: body.recipe_id,
      user_recipe_id: body.user_recipe_id || null,
    }));

  if (toInsert.length === 0) {
    return NextResponse.json({ added: 0, message: "Already in selected collections" });
  }

  const { data, error } = await supabase
    .from("user_collection_items")
    .insert(toInsert)
    .select();

  if (error) return NextResponse.json({ error: "Unable to add." }, { status: 500 });
  return NextResponse.json({ added: data?.length ?? 0, items: data }, { status: 201 });
}

// DELETE — remove recipe from collection
export async function DELETE(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = request.nextUrl.searchParams;
  const collectionId = params.get("collection_id");
  const recipeId = params.get("recipe_id");

  if (!collectionId || !recipeId) {
    return NextResponse.json({ error: "collection_id and recipe_id required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("user_collection_items")
    .delete()
    .eq("collection_id", collectionId)
    .eq("recipe_id", recipeId)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: "Unable to remove." }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}