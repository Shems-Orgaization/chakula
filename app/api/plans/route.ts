// app/api/plans/route.ts import 
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ID_RE = /^[A-Za-z0-9_-]{1,80}$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const;
const MAX_PLANS = 500;

async function userClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

function errJson(message: string, code: string, status: number) {
  return NextResponse.json({ error: message, code }, { status });
}

function isIsoDate(s: string): boolean {
  if (!ISO_DATE_RE.test(s)) return false;
  const d = new Date(s + "T00:00:00Z");
  return !Number.isNaN(d.getTime());
}

// ----- GET: Fetch plans for date range -----
export async function GET(request: NextRequest) {
  const { supabase, user } = await userClient();
  if (!user) return errJson("Unauthorized", "unauthorized", 401);

  const params = request.nextUrl.searchParams;
  const startDate = params.get("start");
  const endDate = params.get("end");

  if (startDate && !isIsoDate(startDate)) return errJson("start invalid", "start_invalid", 400);
  if (endDate && !isIsoDate(endDate)) return errJson("end invalid", "end_invalid", 400);

  let query = supabase
    .from("user_meal_plans")
    .select(`
      id,
      plan_date,
      meal_type,
      recipe_id,
      servings,
      created_at,
      updated_at,
      recipes:recipe_id (
        id, slug, name, description, category, meal_type,
        total_time_minutes, cost_min_kes, cost_max_kes, servings,
        difficulty, image_url, ingredients, instructions, tags, dietary_tags
      )
    `)
    .eq("user_id", user.id);

  if (startDate) query = query.gte("plan_date", startDate);
  if (endDate) query = query.lte("plan_date", endDate);

  const { data, error } = await query
    .order("plan_date", { ascending: true })
    .limit(MAX_PLANS);

  if (error) return errJson("Unable to load meal plans.", "db_error", 500);
  return NextResponse.json({ plans: data ?? [] });
}

// ----- POST: Create/update a meal plan -----
export async function POST(request: NextRequest) {
  const { supabase, user } = await userClient();
  if (!user) return errJson("Unauthorized", "unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return errJson(
      "plan_date, meal_type, and recipe_id are required.",
      "invalid_body",
      400
    );
  }

  const { plan_date, meal_type, recipe_id, servings } = body as Record<string, unknown>;

  if (typeof plan_date !== "string" || !isIsoDate(plan_date)) {
    return errJson("plan_date invalid.", "plan_date_invalid", 400);
  }
  if (typeof meal_type !== "string" || !(MEAL_TYPES as readonly string[]).includes(meal_type)) {
    return errJson("meal_type must be breakfast, lunch, or dinner.", "meal_type_invalid", 400);
  }
  if (typeof recipe_id !== "string" || !ID_RE.test(recipe_id)) {
    return errJson("recipe_id invalid.", "recipe_id_invalid", 400);
  }

  let servingsVal = 2;
  if (servings !== undefined && servings !== null) {
    if (typeof servings !== "number" || !Number.isFinite(servings) || servings < 1 || servings > 20) {
      return errJson("servings invalid.", "servings_invalid", 400);
    }
    servingsVal = Math.round(servings);
  }

  // Verify recipe exists (owner is not required — public recipes; but ensure id valid).
  const { data: recipe, error: rErr } = await supabase
    .from("recipes")
    .select("id")
    .eq("id", recipe_id)
    .maybeSingle();
  if (rErr) return errJson("Unable to save meal plan.", "db_error", 500);
  if (!recipe) return errJson("recipe_id not found.", "recipe_not_found", 404);

  const { data, error } = await supabase
    .from("user_meal_plans")
    .upsert(
      {
        user_id: user.id,
        plan_date,
        meal_type,
        recipe_id,
        servings: servingsVal,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,plan_date,meal_type" }
    )
    .select()
    .single();

  if (error) return errJson("Unable to save meal plan.", "db_error", 500);
  return NextResponse.json({ plan: data });
}

// ----- DELETE: Remove a meal plan -----
export async function DELETE(request: NextRequest) {
  const { supabase, user } = await userClient();
  if (!user) return errJson("Unauthorized", "unauthorized", 401);

  const params = request.nextUrl.searchParams;
  const id = params.get("id");
  const date = params.get("date");
  const mealType = params.get("meal_type");
  const clearWeek = params.get("clear") === "true";

  if (id) {
    if (!ID_RE.test(id)) return errJson("id invalid", "id_invalid", 400);
    const { error } = await supabase
      .from("user_meal_plans")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) return errJson("Unable to delete meal plan.", "db_error", 500);
    return new NextResponse(null, { status: 204 });
  }

  if (date && mealType) {
    if (!isIsoDate(date) || !(MEAL_TYPES as readonly string[]).includes(mealType)) {
      return errJson("Invalid date or meal_type.", "invalid_params", 400);
    }
    const { error } = await supabase
      .from("user_meal_plans")
      .delete()
      .eq("user_id", user.id)
      .eq("plan_date", date)
      .eq("meal_type", mealType);
    if (error) return errJson("Unable to delete.", "db_error", 500);
    return new NextResponse(null, { status: 204 });
  }

  if (date && clearWeek) {
    if (!isIsoDate(date)) return errJson("date invalid", "date_invalid", 400);
    const endDate = params.get("end");
    if (endDate && !isIsoDate(endDate)) return errJson("end invalid", "end_invalid", 400);

    let query = supabase
      .from("user_meal_plans")
      .delete()
      .eq("user_id", user.id);
    if (endDate) {
      // Cap range to 60 days
      const startMs = new Date(date + "T00:00:00Z").getTime();
      const endMs = new Date(endDate + "T00:00:00Z").getTime();
      if (endMs - startMs > 60 * 24 * 60 * 60 * 1000) {
        return errJson("Date range too large.", "range_too_large", 400);
      }
      query = query.gte("plan_date", date).lte("plan_date", endDate);
    } else {
      query = query.eq("plan_date", date);
    }

    const { error } = await query;
    if (error) return errJson("Unable to clear week.", "db_error", 500);
    return new NextResponse(null, { status: 204 });
  }

  return errJson("Missing parameters.", "missing_params", 400);
}