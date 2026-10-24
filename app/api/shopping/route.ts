// app/api/shopping/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ID_RE = /^[A-Za-z0-9_-]{1,80}$/;
const ALLOWED_CATEGORIES = ["produce", "meat", "dairy", "spices", "pantry", "other"] as const;
const MAX_BULK = 200;
const MAX_ROWS = 1000;
const MAX_PRICE = 1_000_000;

async function context() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

function errJson(message: string, code: string, status: number) {
  return NextResponse.json({ error: message, code }, { status });
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

async function verifyListOwned(
  supabase: Awaited<ReturnType<typeof createClient>>,
  listId: string,
  userId: string
): Promise<"ok" | "missing" | "error"> {
  const { data, error } = await supabase
    .from("shopping_lists")
    .select("id")
    .eq("id", listId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return "error";
  return data ? "ok" : "missing";
}

// GET items — filter by list_id
export async function GET(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return errJson("Unauthorized", "unauthorized", 401);

  const listId = request.nextUrl.searchParams.get("list_id");
  if (listId && !ID_RE.test(listId)) {
    return errJson("list_id invalid", "list_id_invalid", 400);
  }

  let query = supabase
    .from("user_shopping_items")
    .select("*")
    .eq("user_id", user.id);

  if (listId) query = query.eq("list_id", listId);

  const { data, error } = await query
    .order("checked", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(MAX_ROWS);

  if (error) return errJson("Unable to load.", "db_error", 500);
  return NextResponse.json({ items: data ?? [] });
}

// POST
export async function POST(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return errJson("Unauthorized", "unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return errJson("Invalid body", "invalid_body", 400);
  }

  let listId: string | null = null;
  if (body.list_id !== undefined && body.list_id !== null) {
    if (typeof body.list_id !== "string" || !ID_RE.test(body.list_id)) {
      return errJson("list_id invalid", "list_id_invalid", 400);
    }
    const validatedListId = body.list_id as string;
    listId = validatedListId;
    const owned = await verifyListOwned(supabase, validatedListId, user.id);
    if (owned === "error") return errJson("Unable to add.", "db_error", 500);
    if (owned === "missing") return errJson("List not found.", "not_found", 404);
  }

  const source = body.source === "recipe" ? "recipe" : "manual";

  // Per-user cap
  const { count, error: countErr } = await supabase
    .from("user_shopping_items")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  if (countErr) return errJson("Unable to add.", "db_error", 500);

  // Bulk
  if (Array.isArray(body.items)) {
    if (body.items.length > MAX_BULK) {
      return errJson("Too many items.", "items_too_many", 413);
    }

    const rows = body.items
      .filter((name: unknown): name is string => typeof name === "string" && !!name.trim())
      .map((name: string) => {
        const trimmed = (name as string).trim().slice(0, 120);
        return {
          user_id: user.id,
          list_id: listId,
          ingredient_name: trimmed,
          quantity: null as number | null,
          unit: null as string | null,
          checked: false,
          source,
          category: guessCategory(trimmed),
          actual_price: null as number | null,
        };
      });

    if (rows.length === 0) return errJson("No items", "no_items", 400);
    if ((count ?? 0) + rows.length > MAX_ROWS) {
      return errJson("Shopping list limit reached.", "limit_reached", 403);
    }

    const { data, error } = await supabase.from("user_shopping_items").insert(rows).select();
    if (error) return errJson("Unable to add.", "db_error", 500);
    return NextResponse.json({ items: data ?? [] }, { status: 201 });
  }

  // Single
  if (typeof body.ingredient_name !== "string" || !body.ingredient_name.trim()) {
    return errJson("ingredient_name required", "ingredient_name_required", 400);
  }
  if ((count ?? 0) >= MAX_ROWS) {
    return errJson("Shopping list limit reached.", "limit_reached", 403);
  }

  let quantity: number | null = null;
  if (body.quantity !== undefined && body.quantity !== null) {
    if (typeof body.quantity !== "number" || !Number.isFinite(body.quantity) || body.quantity < 0 || body.quantity > 100_000) {
      return errJson("quantity invalid", "quantity_invalid", 400);
    }
    quantity = body.quantity;
  }

  let unit: string | null = null;
  if (body.unit !== undefined && body.unit !== null) {
    if (typeof body.unit !== "string") return errJson("unit invalid", "unit_invalid", 400);
    unit = body.unit.trim().slice(0, 24) || null;
  }

  let category = guessCategory(body.ingredient_name);
  if (body.category !== undefined && body.category !== null) {
    if (typeof body.category !== "string" || !(ALLOWED_CATEGORIES as readonly string[]).includes(body.category)) {
      return errJson("category invalid", "category_invalid", 400);
    }
    category = body.category;
  }

  const name = body.ingredient_name.trim().slice(0, 120);

  const { data, error } = await supabase
    .from("user_shopping_items")
    .insert({
      user_id: user.id,
      list_id: listId,
      ingredient_name: name,
      quantity,
      unit,
      checked: false,
      source,
      category,
      actual_price: null,
    })
    .select()
    .single();

  if (error) return errJson("Unable to add.", "db_error", 500);
  return NextResponse.json({ item: data }, { status: 201 });
}

// PATCH
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
  if (body.checked !== undefined) {
    if (typeof body.checked !== "boolean") return errJson("checked invalid", "checked_invalid", 400);
    updates.checked = body.checked;
  }
  if (body.ingredient_name !== undefined) {
    if (typeof body.ingredient_name !== "string" || !body.ingredient_name.trim()) {
      return errJson("ingredient_name invalid", "ingredient_name_invalid", 400);
    }
    updates.ingredient_name = body.ingredient_name.trim().slice(0, 120);
  }
  if (body.quantity !== undefined) {
    if (body.quantity === null) updates.quantity = null;
    else if (typeof body.quantity === "number" && Number.isFinite(body.quantity) && body.quantity >= 0 && body.quantity <= 100_000) updates.quantity = body.quantity;
    else return errJson("quantity invalid", "quantity_invalid", 400);
  }
  if (body.unit !== undefined) {
    if (body.unit === null) updates.unit = null;
    else if (typeof body.unit === "string") updates.unit = body.unit.trim().slice(0, 24) || null;
    else return errJson("unit invalid", "unit_invalid", 400);
  }
  if (body.category !== undefined) {
    if (typeof body.category !== "string" || !(ALLOWED_CATEGORIES as readonly string[]).includes(body.category)) {
      return errJson("category invalid", "category_invalid", 400);
    }
    updates.category = body.category;
  }
  if (body.actual_price !== undefined) {
    if (body.actual_price === null) updates.actual_price = null;
    else if (typeof body.actual_price === "number" && Number.isFinite(body.actual_price) && body.actual_price >= 0 && body.actual_price <= MAX_PRICE) updates.actual_price = body.actual_price;
    else return errJson("actual_price invalid", "actual_price_invalid", 400);
  }
  if (body.list_id !== undefined) {
    if (body.list_id === null) updates.list_id = null;
    else if (typeof body.list_id === "string" && ID_RE.test(body.list_id)) {
      const owned = await verifyListOwned(supabase, body.list_id, user.id);
      if (owned === "error") return errJson("Unable to update.", "db_error", 500);
      if (owned === "missing") return errJson("List not found.", "not_found", 404);
      updates.list_id = body.list_id;
    } else return errJson("list_id invalid", "list_id_invalid", 400);
  }

  if (Object.keys(updates).length === 1) {
    return errJson("Nothing to update.", "nothing_to_update", 400);
  }

  const { data, error } = await supabase
    .from("user_shopping_items")
    .update(updates)
    .eq("id", body.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return errJson("Unable to update.", "db_error", 500);
  return NextResponse.json({ item: data });
}

// DELETE
export async function DELETE(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return errJson("Unauthorized", "unauthorized", 401);

  const params = request.nextUrl.searchParams;
  const id = params.get("id");
  const listId = params.get("list_id");
  const clearChecked = params.get("clear_checked") === "true";
  const clearAll = params.get("clear_all") === "true";

  if (id) {
    if (!ID_RE.test(id)) return errJson("id invalid", "id_invalid", 400);
    const { error } = await supabase
      .from("user_shopping_items")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) return errJson("Unable to delete.", "db_error", 500);
    return new NextResponse(null, { status: 204 });
  }

  if ((clearChecked || clearAll) && listId) {
    if (!ID_RE.test(listId)) return errJson("list_id invalid", "list_id_invalid", 400);
    const owned = await verifyListOwned(supabase, listId, user.id);
    if (owned === "error") return errJson("Unable to delete.", "db_error", 500);
    if (owned === "missing") return errJson("List not found.", "not_found", 404);

    let query = supabase
      .from("user_shopping_items")
      .delete()
      .eq("user_id", user.id)
      .eq("list_id", listId);

    if (clearChecked && !clearAll) {
      query = query.eq("checked", true);
    }

    const { error } = await query;
    if (error) return errJson("Unable to delete.", "db_error", 500);
    return NextResponse.json({ success: true });
  }

  return errJson("Missing parameters.", "missing_params", 400);
}