// app/api/meals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ID_RE = /^[A-Za-z0-9_-]{1,80}$/;
const URL_RE = /^https?:\/\/\S{1,2000}$/i;
const MAX_LOG_GET = 200;
const MAX_USER_RECIPES = 200;
const MAX_COLLECTIONS = 200;
const MAX_LOG_INSERTS = 5000;

async function context() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

function errJson(message: string, code: string, status: number) {
  return NextResponse.json({ error: message, code }, { status });
}

// GET — fetch all user's meal data
export async function GET(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return errJson("Unauthorized", "unauthorized", 401);

  const params = request.nextUrl.searchParams;
  const rawType = params.get("type") ?? "all";
  const type = rawType === "favorites" || rawType === "cooked" || rawType === "mine" ? rawType : "all";

  const [favoritesRes, logRes, userRecipesRes, collectionsRes] = await Promise.all([
    supabase
      .from("user_preferences")
      .select("favorites")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("user_cooking_log")
      .select("*")
      .eq("user_id", user.id)
      .order("cooked_at", { ascending: false })
      .limit(MAX_LOG_GET),
    supabase
      .from("user_recipes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(MAX_USER_RECIPES),
    supabase
      .from("user_collections")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(MAX_COLLECTIONS),
  ]);

  if (favoritesRes.error || logRes.error || userRecipesRes.error || collectionsRes.error) {
    return errJson("Unable to load.", "db_error", 500);
  }

  const cookingLog = logRes.data ?? [];
  const favorites: string[] = Array.isArray(favoritesRes.data?.favorites)
    ? (favoritesRes.data!.favorites as string[]).filter((x): x is string => typeof x === "string")
    : [];

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
    if (typeof entry.rating === "number") {
      (ratingMap[key] ||= []).push(entry.rating);
    }
  }

  for (const key of Object.keys(ratingMap)) {
    const ratings = ratingMap[key];
    cookStats[key].avgRating =
      Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
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
    type,
  });
}

// POST — log a cook
export async function POST(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return errJson("Unauthorized", "unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return errJson("recipe_name required", "invalid_body", 400);
  }
  if (typeof body.recipe_name !== "string" || !body.recipe_name.trim()) {
    return errJson("recipe_name required", "recipe_name_required", 400);
  }

  let recipeId: string | null = null;
  if (body.recipe_id !== undefined && body.recipe_id !== null) {
    if (typeof body.recipe_id !== "string" || !ID_RE.test(body.recipe_id)) {
      return errJson("recipe_id invalid", "recipe_id_invalid", 400);
    }
    recipeId = body.recipe_id;
  }
  let userRecipeId: string | null = null;
  if (body.user_recipe_id !== undefined && body.user_recipe_id !== null) {
    if (typeof body.user_recipe_id !== "string" || !ID_RE.test(body.user_recipe_id)) {
      return errJson("user_recipe_id invalid", "user_recipe_id_invalid", 400);
    }
    userRecipeId = body.user_recipe_id;
  }

  if (userRecipeId) {
    const { data: own, error: ownErr } = await supabase
      .from("user_recipes")
      .select("id")
      .eq("id", userRecipeId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (ownErr) return errJson("Unable to log cook.", "db_error", 500);
    if (!own) return errJson("user_recipe_id forbidden", "forbidden", 403);
  }

  const { count, error: countErr } = await supabase
    .from("user_cooking_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  if (countErr) return errJson("Unable to log cook.", "db_error", 500);
  if ((count ?? 0) >= MAX_LOG_INSERTS) {
    return errJson("Log limit reached.", "limit_reached", 403);
  }

  let rating: number | null = null;
  if (body.rating !== undefined && body.rating !== null) {
    if (typeof body.rating !== "number" || !Number.isFinite(body.rating) || body.rating < 1 || body.rating > 5) {
      return errJson("rating invalid", "rating_invalid", 400);
    }
    rating = body.rating;
  }

  let notes: string | null = null;
  if (body.notes !== undefined && body.notes !== null) {
    if (typeof body.notes !== "string") return errJson("notes invalid", "notes_invalid", 400);
    notes = body.notes.slice(0, 500);
  }

  let photoUrl: string | null = null;
  if (body.photo_url !== undefined && body.photo_url !== null) {
    if (typeof body.photo_url !== "string" || !URL_RE.test(body.photo_url)) {
      return errJson("photo_url invalid", "photo_url_invalid", 400);
    }
    photoUrl = body.photo_url;
  }

  const { data, error } = await supabase
    .from("user_cooking_log")
    .insert({
      user_id: user.id,
      recipe_id: recipeId,
      user_recipe_id: userRecipeId,
      recipe_name: body.recipe_name.trim().slice(0, 120),
      rating,
      notes,
      photo_url: photoUrl,
    })
    .select()
    .single();

  if (error) return errJson("Unable to log cook.", "db_error", 500);
  return NextResponse.json({ log: data }, { status: 201 });
}

// PATCH — update a log entry (rating/notes)
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

  const updates: Record<string, unknown> = {};
  if (body.rating !== undefined) {
    if (body.rating === null) updates.rating = null;
    else if (typeof body.rating === "number" && Number.isFinite(body.rating) && body.rating >= 1 && body.rating <= 5) updates.rating = body.rating;
    else return errJson("rating invalid", "rating_invalid", 400);
  }
  if (body.notes !== undefined) {
    if (body.notes === null) updates.notes = null;
    else if (typeof body.notes === "string") updates.notes = body.notes.slice(0, 500);
    else return errJson("notes invalid", "notes_invalid", 400);
  }
  if (Object.keys(updates).length === 0) {
    return errJson("Nothing to update.", "nothing_to_update", 400);
  }

  const { data, error } = await supabase
    .from("user_cooking_log")
    .update(updates)
    .eq("id", body.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return errJson("Unable to update.", "db_error", 500);
  return NextResponse.json({ log: data });
}

// DELETE — remove a log entry
export async function DELETE(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return errJson("Unauthorized", "unauthorized", 401);

  const id = request.nextUrl.searchParams.get("id");
  if (!id || !ID_RE.test(id)) return errJson("id required", "id_invalid", 400);

  const { error } = await supabase
    .from("user_cooking_log")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return errJson("Unable to delete.", "db_error", 500);
  return new NextResponse(null, { status: 204 });
}