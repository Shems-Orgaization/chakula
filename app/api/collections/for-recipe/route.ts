// app/api/collections/for-recipe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function context() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function GET(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const recipeId = request.nextUrl.searchParams.get("recipe_id");
  if (!recipeId) return NextResponse.json({ error: "recipe_id required" }, { status: 400 });

  const { data, error } = await supabase
    .from("user_collection_items")
    .select("collection_id")
    .eq("user_id", user.id)
    .eq("recipe_id", recipeId);

  if (error) return NextResponse.json({ error: "Unable to check." }, { status: 500 });
  return NextResponse.json({ collectionIds: (data ?? []).map((d) => d.collection_id) });
}