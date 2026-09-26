// app/api/shopping/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function context() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

function guessCategory(name: string): string {
  const n = name.toLowerCase();
  if (/tomato|onion|potato|carrot|cabbage|spinach|sukuma|managu|terere|kunde|matoke|banana|mango|avocado|pepper|cucumber|garlic|ginger|lemon|lime|dhania|cilantro|lettuce|broccoli|zucchini|pumpkin|pea|corn|maize/.test(n))
    return "produce";
  if (/beef|chicken|goat|pork|fish|tilapia|omena|prawn|shrimp|sausage|smokie|meat|mince|kuku/.test(n))
    return "meat";
  if (/milk|cream|yogurt|yoghurt|cheese|butter|ghee|egg/.test(n))
    return "dairy";
  if (/salt|pepper|curry|cumin|coriander|paprika|turmeric|masala|cinnamon|cardamom|chili|spice|thyme|rosemary|bay|sauce|vinegar/.test(n))
    return "spices";
  if (/flour|rice|pasta|spaghetti|oil|sugar|honey|bread|oat|quinoa|beans|ndengu|lentil|grain|cereal|coconut|tea|coffee/.test(n))
    return "pantry";
  return "other";
}

// GET items — filter by list_id
export async function GET(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const listId = request.nextUrl.searchParams.get("list_id");

  let query = supabase
    .from("user_shopping_items")
    .select("*")
    .eq("user_id", user.id);

  if (listId) {
    query = query.eq("list_id", listId);
  }

  const { data, error } = await query
    .order("checked", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Unable to load." }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

// POST
export async function POST(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  // Bulk
  if (Array.isArray(body.items)) {
    const rows = body.items
      .filter((name: any) => typeof name === "string" && name.trim())
      .map((name: string) => {
        const trimmed = name.trim().slice(0, 120);
        return {
          user_id: user.id,
          list_id: body.list_id || null,
          ingredient_name: trimmed,
          quantity: null,
          unit: null,
          checked: false,
          source: body.source === "recipe" ? "recipe" : "manual",
          category: guessCategory(trimmed),
          actual_price: null,
        };
      });

    if (rows.length === 0) return NextResponse.json({ error: "No items" }, { status: 400 });

    const { data, error } = await supabase.from("user_shopping_items").insert(rows).select();
    if (error) return NextResponse.json({ error: "Unable to add." }, { status: 500 });
    return NextResponse.json({ items: data ?? [] }, { status: 201 });
  }

  // Single
  if (typeof body.ingredient_name !== "string" || !body.ingredient_name.trim()) {
    return NextResponse.json({ error: "ingredient_name required" }, { status: 400 });
  }

  const name = body.ingredient_name.trim().slice(0, 120);

  const { data, error } = await supabase
    .from("user_shopping_items")
    .insert({
      user_id: user.id,
      list_id: body.list_id || null,
      ingredient_name: name,
      quantity: typeof body.quantity === "number" ? body.quantity : null,
      unit: body.unit?.slice(0, 24) || null,
      checked: false,
      source: body.source === "recipe" ? "recipe" : "manual",
      category: body.category || guessCategory(name),
      actual_price: null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Unable to add." }, { status: 500 });
  return NextResponse.json({ item: data }, { status: 201 });
}

// PATCH
export async function PATCH(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const updates: Record<string, any> = { updated_at: new Date().toISOString() };
  if (typeof body.checked === "boolean") updates.checked = body.checked;
  if (typeof body.ingredient_name === "string" && body.ingredient_name.trim())
    updates.ingredient_name = body.ingredient_name.trim().slice(0, 120);
  if (typeof body.quantity === "number" || body.quantity === null) updates.quantity = body.quantity;
  if (typeof body.unit === "string" || body.unit === null) updates.unit = body.unit;
  if (typeof body.category === "string") updates.category = body.category;
  if (typeof body.actual_price === "number" || body.actual_price === null) updates.actual_price = body.actual_price;
  if (typeof body.list_id === "string" || body.list_id === null) updates.list_id = body.list_id;

  const { data, error } = await supabase
    .from("user_shopping_items")
    .update(updates)
    .eq("id", body.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Unable to update." }, { status: 500 });
  return NextResponse.json({ item: data });
}

// DELETE
export async function DELETE(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = request.nextUrl.searchParams;
  const id = params.get("id");
  const listId = params.get("list_id");
  const clearChecked = params.get("clear_checked") === "true";
  const clearAll = params.get("clear_all") === "true";

  if (id) {
    await supabase.from("user_shopping_items").delete().eq("id", id).eq("user_id", user.id);
    return new NextResponse(null, { status: 204 });
  }

  if (clearChecked && listId) {
    await supabase.from("user_shopping_items").delete().eq("user_id", user.id).eq("list_id", listId).eq("checked", true);
    return NextResponse.json({ success: true });
  }

  if (clearAll && listId) {
    await supabase.from("user_shopping_items").delete().eq("user_id", user.id).eq("list_id", listId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Missing parameters." }, { status: 400 });
}