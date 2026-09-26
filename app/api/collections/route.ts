// app/api/collections/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function context() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

// GET — list all collections with item counts
export async function GET() {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get collections
  const { data: collections, error } = await supabase
    .from("user_collections")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Unable to load." }, { status: 500 });

  // Get all items to compute counts + preview images
  const { data: items } = await supabase
    .from("user_collection_items")
    .select("collection_id, recipe_id, user_recipe_id")
    .eq("user_id", user.id);

  // Get recipe images for previews
  const recipeIds = (items ?? [])
    .map((i) => i.recipe_id)
    .filter((id): id is string => Boolean(id));

  let recipeImageMap: Record<string, string | null> = {};
  if (recipeIds.length > 0) {
    const { data: recipes } = await supabase
      .from("recipes")
      .select("id, image_url")
      .in("id", recipeIds);
    for (const r of recipes ?? []) {
      recipeImageMap[r.id] = r.image_url;
    }
  }

  // Compute count + preview per collection
  const enriched = (collections ?? []).map((c) => {
    const collectionItems = (items ?? []).filter((i) => i.collection_id === c.id);
    const previewImages = collectionItems
      .slice(0, 4)
      .map((i) => (i.recipe_id ? recipeImageMap[i.recipe_id] : null))
      .filter((url): url is string => Boolean(url));
    return {
      ...c,
      itemCount: collectionItems.length,
      previewImages,
    };
  });

  return NextResponse.json({ collections: enriched });
}

// POST — create collection
export async function POST(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });

  const { data, error } = await supabase
    .from("user_collections")
    .insert({
      user_id: user.id,
      name: body.name.trim().slice(0, 60),
      description: body.description?.slice(0, 300) || null,
      icon: body.icon || "📚",
      color: body.color || "orange",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Unable to create." }, { status: 500 });
  return NextResponse.json({ collection: data }, { status: 201 });
}

// PATCH — update collection
export async function PATCH(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const updates: Record<string, any> = { updated_at: new Date().toISOString() };
  if (body.name) updates.name = body.name.trim().slice(0, 60);
  if (body.description !== undefined) updates.description = body.description?.slice(0, 300) || null;
  if (body.icon) updates.icon = body.icon;
  if (body.color) updates.color = body.color;

  const { data, error } = await supabase
    .from("user_collections")
    .update(updates)
    .eq("id", body.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Unable to update." }, { status: 500 });
  return NextResponse.json({ collection: data });
}

// DELETE
export async function DELETE(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase
    .from("user_collections")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: "Unable to delete." }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}