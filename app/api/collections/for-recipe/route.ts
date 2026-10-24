// app/api/collections/for-recipe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function context() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

function bad(message: string, code: string) {
  return NextResponse.json({ error: message, code }, { status: 400 });
}

export async function GET(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });

  const recipeId = request.nextUrl.searchParams.get("recipe_id");
  if (!recipeId || typeof recipeId !== "string" || !recipeId.trim()) {
    return bad("recipe_id required", "recipe_id_required");
  }
  const recipeIdClean = recipeId.trim().slice(0, 64);
  if (!/^[A-Za-z0-9_-]+$/.test(recipeIdClean)) {
    return bad("recipe_id invalid", "recipe_id_invalid");
  }

  const { data, error } = await supabase
    .from("user_collection_items")
    .select("collection_id")
    .eq("user_id", user.id)
    .eq("recipe_id", recipeIdClean)
    .limit(200);

  if (error) return NextResponse.json({ error: "Unable to check.", code: "db_error" }, { status: 500 });
  return NextResponse.json({ collectionIds: (data ?? []).map((d) => d.collection_id) });
}