// app/api/meals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function context() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

// GET — fetch all user's meal data
export async function GET(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = request.nextUrl.searchParams;
  const type = params.get("type") || "all"; // "all" | "favorites" | "cooked" | "mine"

  const [favoritesRes, logRes, userRecipesRes, collectionsRes] = await Promise.all([
    // Favorites — from user_preferences
    supabase
      .from("user_preferences")
      .select("favorites")
      .eq("user_id", user.id)
      .maybeSingle(),

    // Cooking log
    supabase
      .from("user_cooking_log")
      .select("*")
      .eq("user_id", user.id)
      .order("cooked_at", { ascending: false })
      .limit(200),

    // User's own recipes
    supabase
      .from("user_recipes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),

    // Collections
    supabase
      .from("user_collections")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  // Compute stats
  const cookingLog = logRes.data ?? [];
  const favorites: string[] = (favoritesRes.data?.favorites as string[]) ?? [];

  // Cook count per recipe
  const cookStats: Record<string, { count: number; lastCooked: string; avgRating: number | null }> = {};
  const ratingMap: Record<string, number[]> = {};

  for (const entry of cookingLog) {
    const key = entry.recipe_id || entry.user_recipe_id;
    if (!key) continue;
    if (!cookStats[key]) {
      cookStats[key] = { count: 0, lastCooked: entry.cooked_at, avgRating: null };
    }
    cookStats[key].count += 1;
    if (new Date(entry.cooked_at) > new Date(cookStats[key].lastCooked)) {
      cookStats[key].lastCooked = entry.cooked_at;
    }
    if (entry.rating) {
      if (!ratingMap[key]) ratingMap[key] = [];
      ratingMap[key].push(entry.rating);
    }
  }

  for (const key of Object.keys(ratingMap)) {
    const ratings = ratingMap[key];
    cookStats[key].avgRating = Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
  }

  return NextResponse.json({
    favorites,
    cookingLog,
    cookStats,
    userRecipes: userRecipesRes.data ?? [],
    collections: collectionsRes.data ?? [],
    stats: {
      favoritesCount: favorites.length,
      cookedCount: cookingLog.length,
      myRecipesCount: (userRecipesRes.data ?? []).length,
      collectionsCount: (collectionsRes.data ?? []).length,
    },
  });
}

// POST — log a cook
export async function POST(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || !body.recipe_name) {
    return NextResponse.json({ error: "recipe_name required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("user_cooking_log")
    .insert({
      user_id: user.id,
      recipe_id: body.recipe_id || null,
      user_recipe_id: body.user_recipe_id || null,
      recipe_name: body.recipe_name.trim().slice(0, 120),
      rating: typeof body.rating === "number" && body.rating >= 1 && body.rating <= 5 ? body.rating : null,
      notes: body.notes?.slice(0, 500) || null,
      photo_url: body.photo_url || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Unable to log cook." }, { status: 500 });
  return NextResponse.json({ log: data }, { status: 201 });
}

// PATCH — update a log entry (rating/notes)
export async function PATCH(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const updates: Record<string, any> = {};
  if (typeof body.rating === "number") updates.rating = body.rating;
  if (typeof body.notes === "string") updates.notes = body.notes.slice(0, 500);

  const { data, error } = await supabase
    .from("user_cooking_log")
    .update(updates)
    .eq("id", body.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Unable to update." }, { status: 500 });
  return NextResponse.json({ log: data });
}

// DELETE — remove a log entry
export async function DELETE(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase
    .from("user_cooking_log")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: "Unable to delete." }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}