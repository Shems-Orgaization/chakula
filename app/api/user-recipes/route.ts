// app/api/user-recipes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function context() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function GET() {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("user_recipes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Unable to load." }, { status: 500 });
  return NextResponse.json({ recipes: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const { data, error } = await supabase
    .from("user_recipes")
    .insert({
      user_id: user.id,
      name: body.name.trim().slice(0, 120),
      description: body.description?.slice(0, 500) || "",
      category: body.category?.slice(0, 50) || "Other",
      meal_type: body.meal_type || "Dinner",
      difficulty: body.difficulty || "easy",
      total_time_minutes: Number(body.total_time_minutes) || 30,
      servings: Number(body.servings) || 2,
      cost_min_kes: Number(body.cost_min_kes) || 0,
      cost_max_kes: Number(body.cost_max_kes) || 0,
      ingredients: Array.isArray(body.ingredients) ? body.ingredients : [],
      instructions: Array.isArray(body.instructions) ? body.instructions : [],
      image_url: body.image_url || null,
      tags: Array.isArray(body.tags) ? body.tags : [],
      dietary_tags: Array.isArray(body.dietary_tags) ? body.dietary_tags : [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Unable to create." }, { status: 500 });
  return NextResponse.json({ recipe: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const updates: Record<string, any> = { updated_at: new Date().toISOString() };
  const allowed = [
    "name", "description", "category", "meal_type", "difficulty",
    "total_time_minutes", "servings", "cost_min_kes", "cost_max_kes",
    "ingredients", "instructions", "image_url", "tags", "dietary_tags",
  ];
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  const { data, error } = await supabase
    .from("user_recipes")
    .update(updates)
    .eq("id", body.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Unable to update." }, { status: 500 });
  return NextResponse.json({ recipe: data });
}

export async function DELETE(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase
    .from("user_recipes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: "Unable to delete." }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}