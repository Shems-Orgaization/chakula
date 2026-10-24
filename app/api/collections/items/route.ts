// app/api/collections/items/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ID_RE = /^[A-Za-z0-9_-]{1,80}$/;
const MAX_COLLECTION_IDS = 20;
const MAX_TOTAL_ITEMS = 1000;

async function context() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

function errJson(message: string, code: string, status: number) {
  return NextResponse.json({ error: message, code }, { status });
}

// POST — add recipe to collection(s)
export async function POST(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return errJson("Unauthorized", "unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return errJson("recipe_id and collection_ids required", "invalid_body", 400);
  }
  if (typeof body.recipe_id !== "string" || !ID_RE.test(body.recipe_id)) {
    return errJson("recipe_id and collection_ids required", "recipe_id_invalid", 400);
  }
  if (!Array.isArray(body.collection_ids) || body.collection_ids.length === 0) {
    return errJson("recipe_id and collection_ids required", "collection_ids_invalid", 400);
  }
  if (body.collection_ids.length > MAX_COLLECTION_IDS) {
    return errJson("Too many collections.", "collection_ids_too_many", 400);
  }
  const collectionIds: string[] = [];
  for (const cid of body.collection_ids) {
    if (typeof cid !== "string" || !ID_RE.test(cid)) {
      return errJson("collection_ids invalid", "collection_ids_invalid", 400);
    }
    collectionIds.push(cid);
  }

  let userRecipeId: string | null = null;
  if (body.user_recipe_id !== undefined && body.user_recipe_id !== null) {
    if (typeof body.user_recipe_id !== "string" || !ID_RE.test(body.user_recipe_id)) {
      return errJson("user_recipe_id invalid", "user_recipe_id_invalid", 400);
    }
    userRecipeId = body.user_recipe_id;
  }

  // Foreign ids must belong to user.
  const { data: owned, error: ownErr } = await supabase
    .from("user_collections")
    .select("id")
    .eq("user_id", user.id)
    .in("id", collectionIds);
  if (ownErr) return errJson("Unable to add.", "db_error", 500);
  const ownedSet = new Set((owned ?? []).map((o) => o.id));
  const foreign = collectionIds.filter((cid) => !ownedSet.has(cid));
  if (foreign.length > 0) {
    return errJson("Forbidden collection.", "forbidden", 403);
  }

  // Per-user cap on user_collection_items rows
  const { count, error: countErr } = await supabase
    .from("user_collection_items")
    .select("collection_id", { count: "exact", head: true })
    .eq("user_id", user.id);
  if (countErr) return errJson("Unable to add.", "db_error", 500);
  if ((count ?? 0) + collectionIds.length > MAX_TOTAL_ITEMS) {
    return errJson("Collection item limit reached.", "limit_reached", 403);
  }

  const { data: existing, error: exErr } = await supabase
    .from("user_collection_items")
    .select("collection_id")
    .eq("user_id", user.id)
    .eq("recipe_id", body.recipe_id)
    .in("collection_id", collectionIds);
  if (exErr) return errJson("Unable to add.", "db_error", 500);

  const existingIds = new Set((existing ?? []).map((e) => e.collection_id));
  const toInsert = collectionIds
    .filter((cid) => !existingIds.has(cid))
    .map((collection_id) => ({
      collection_id,
      user_id: user.id,
      recipe_id: body.recipe_id,
      user_recipe_id: userRecipeId,
    }));

  if (toInsert.length === 0) {
    return NextResponse.json({ added: 0, message: "Already in selected collections" });
  }

  const { data, error } = await supabase
    .from("user_collection_items")
    .insert(toInsert)
    .select();

  if (error) return errJson("Unable to add.", "db_error", 500);
  return NextResponse.json({ added: data?.length ?? 0, items: data }, { status: 201 });
}

// DELETE — remove recipe from collection
export async function DELETE(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return errJson("Unauthorized", "unauthorized", 401);

  const params = request.nextUrl.searchParams;
  const collectionId = params.get("collection_id");
  const recipeId = params.get("recipe_id");

  if (!collectionId || !recipeId) {
    return errJson("collection_id and recipe_id required", "missing_params", 400);
  }
  if (!ID_RE.test(collectionId) || !ID_RE.test(recipeId)) {
    return errJson("collection_id and recipe_id invalid", "id_invalid", 400);
  }

  const { data: own, error: ownErr } = await supabase
    .from("user_collections")
    .select("id")
    .eq("id", collectionId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (ownErr) return errJson("Unable to remove.", "db_error", 500);
  if (!own) return errJson("Not found", "not_found", 404);

  const { error } = await supabase
    .from("user_collection_items")
    .delete()
    .eq("collection_id", collectionId)
    .eq("recipe_id", recipeId)
    .eq("user_id", user.id);

  if (error) return errJson("Unable to remove.", "db_error", 500);
  return new NextResponse(null, { status: 204 });
}