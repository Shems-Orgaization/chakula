// app/api/collections/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ID_RE = /^[A-Za-z0-9_-]{1,80}$/;
const HEX_COLOR_RE = /^#[0-9a-fA-F]{3,8}$/;
const COLOR_WORD_RE = /^[a-zA-Z]{1,20}$/;
const MAX_COLLECTIONS = 200;
const MAX_ITEMS = 2000;

async function context() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

function errJson(message: string, code: string, status: number) {
  return NextResponse.json({ error: message, code }, { status });
}

function validColor(v: unknown): v is string {
  return typeof v === "string" && (HEX_COLOR_RE.test(v) || COLOR_WORD_RE.test(v));
}

// GET — list all collections with item counts
export async function GET() {
  const { supabase, user } = await context();
  if (!user) return errJson("Unauthorized", "unauthorized", 401);

  const { data: collections, error } = await supabase
    .from("user_collections")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(MAX_COLLECTIONS);

  if (error) return errJson("Unable to load.", "db_error", 500);

  const { data: items, error: iErr } = await supabase
    .from("user_collection_items")
    .select("collection_id, recipe_id, user_recipe_id")
    .eq("user_id", user.id)
    .limit(MAX_ITEMS);
  if (iErr) return errJson("Unable to load.", "db_error", 500);

  const recipeIds = (items ?? [])
    .map((i) => i.recipe_id)
    .filter((id): id is string => typeof id === "string" && id.length > 0)
    .slice(0, MAX_ITEMS);

  const recipeImageMap: Record<string, string | null> = {};
  if (recipeIds.length > 0) {
    const { data: recipes, error: rErr } = await supabase
      .from("recipes")
      .select("id, image_url")
      .in("id", recipeIds)
      .limit(MAX_ITEMS);
    if (rErr) return errJson("Unable to load.", "db_error", 500);
    for (const r of recipes ?? []) recipeImageMap[r.id] = r.image_url;
  }

  const enriched = (collections ?? []).map((c) => {
    const collectionItems = (items ?? []).filter((i) => i.collection_id === c.id);
    const previewImages = collectionItems
      .slice(0, 4)
      .map((i) => (i.recipe_id ? recipeImageMap[i.recipe_id] ?? null : null))
      .filter((url): url is string => Boolean(url));
    return { ...c, itemCount: collectionItems.length, previewImages };
  });

  return NextResponse.json({ collections: enriched });
}

// POST — create collection
export async function POST(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return errJson("Unauthorized", "unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return errJson("name required", "invalid_body", 400);
  }
  if (typeof body.name !== "string" || !body.name.trim()) {
    return errJson("name required", "name_required", 400);
  }

  // Per-user cap
  const { count, error: cErr } = await supabase
    .from("user_collections")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  if (cErr) return errJson("Unable to create.", "db_error", 500);
  if ((count ?? 0) >= MAX_COLLECTIONS) {
    return errJson("Collection limit reached.", "limit_reached", 403);
  }

  let description: string | null = null;
  if (body.description !== undefined && body.description !== null) {
    if (typeof body.description !== "string") {
      return errJson("description must be a string.", "description_invalid", 400);
    }
    description = body.description.trim().slice(0, 300) || null;
  }

  let icon = "📚";
  if (body.icon !== undefined) {
    if (typeof body.icon !== "string") return errJson("icon invalid.", "icon_invalid", 400);
    icon = body.icon.trim().slice(0, 8) || "📚";
  }

  let color = "orange";
  if (body.color !== undefined) {
    if (!validColor(body.color)) return errJson("color invalid.", "color_invalid", 400);
    color = body.color;
  }

  const { data, error } = await supabase
    .from("user_collections")
    .insert({
      user_id: user.id,
      name: body.name.trim().slice(0, 60),
      description,
      icon,
      color,
    })
    .select()
    .single();

  if (error) return errJson("Unable to create.", "db_error", 500);
  return NextResponse.json({ collection: data }, { status: 201 });
}

// PATCH — update collection
export async function PATCH(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return errJson("Unauthorized", "unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return errJson("id required", "invalid_body", 400);
  }
  if (typeof body.id !== "string" || !ID_RE.test(body.id)) {
    return errJson("id required", "id_invalid", 400);
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      return errJson("name invalid.", "name_invalid", 400);
    }
    updates.name = body.name.trim().slice(0, 60);
  }
  if (body.description !== undefined) {
    if (body.description === null) updates.description = null;
    else if (typeof body.description === "string") updates.description = body.description.trim().slice(0, 300) || null;
    else return errJson("description invalid.", "description_invalid", 400);
  }
  if (body.icon !== undefined) {
    if (typeof body.icon !== "string") return errJson("icon invalid.", "icon_invalid", 400);
    updates.icon = body.icon.trim().slice(0, 8) || "📚";
  }
  if (body.color !== undefined) {
    if (!validColor(body.color)) return errJson("color invalid.", "color_invalid", 400);
    updates.color = body.color;
  }

  if (Object.keys(updates).length === 1) {
    return errJson("Nothing to update.", "nothing_to_update", 400);
  }

  const { data, error } = await supabase
    .from("user_collections")
    .update(updates)
    .eq("id", body.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return errJson("Unable to update.", "db_error", 500);
  return NextResponse.json({ collection: data });
}

// DELETE
export async function DELETE(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return errJson("Unauthorized", "unauthorized", 401);

  const id = request.nextUrl.searchParams.get("id");
  if (!id || !ID_RE.test(id)) return errJson("id required", "id_invalid", 400);

  const { error } = await supabase
    .from("user_collections")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return errJson("Unable to delete.", "db_error", 500);
  return new NextResponse(null, { status: 204 });
}