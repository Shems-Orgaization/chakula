// app/api/plans/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function userClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

// ----- GET: Fetch plans for date range -----
export async function GET(request: NextRequest) {
  const { supabase, user } = await userClient();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = request.nextUrl.searchParams;
  const startDate = params.get("start");
  const endDate = params.get("end");

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

  const { data, error } = await query.order("plan_date", { ascending: true });

  if (error) {
    console.error("Plans GET error:", error);
    return NextResponse.json({ error: "Unable to load meal plans." }, { status: 500 });
  }

  return NextResponse.json({ plans: data ?? [] });
}

// ----- POST: Create/update a meal plan -----
export async function POST(request: NextRequest) {
  const { supabase, user } = await userClient();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { plan_date, meal_type, recipe_id, servings } = body;

  // Validation
  if (!plan_date || !meal_type || !recipe_id) {
    return NextResponse.json(
      { error: "plan_date, meal_type, and recipe_id are required." },
      { status: 400 }
    );
  }

  if (!["breakfast", "lunch", "dinner"].includes(meal_type)) {
    return NextResponse.json(
      { error: "meal_type must be breakfast, lunch, or dinner." },
      { status: 400 }
    );
  }

  // Upsert (replace if same user + date + meal slot)
  const { data, error } = await supabase
    .from("user_meal_plans")
    .upsert(
      {
        user_id: user.id,
        plan_date,
        meal_type,
        recipe_id,
        servings: servings || 2,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,plan_date,meal_type" }
    )
    .select()
    .single();

  if (error) {
    console.error("Plans POST error:", error);
    return NextResponse.json({ error: "Unable to save meal plan." }, { status: 500 });
  }

  return NextResponse.json({ plan: data });
}

// ----- DELETE: Remove a meal plan -----
export async function DELETE(request: NextRequest) {
  const { supabase, user } = await userClient();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = request.nextUrl.searchParams;
  const id = params.get("id");
  const date = params.get("date");
  const mealType = params.get("meal_type");
  const clearWeek = params.get("clear") === "true";

  // 1. Delete by ID
  if (id) {
    const { error } = await supabase
      .from("user_meal_plans")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Plans DELETE error:", error);
      return NextResponse.json({ error: "Unable to delete meal plan." }, { status: 500 });
    }
    return new NextResponse(null, { status: 204 });
  }

  // 2. Delete by date + meal_type (single slot)
  if (date && mealType) {
    const { error } = await supabase
      .from("user_meal_plans")
      .delete()
      .eq("user_id", user.id)
      .eq("plan_date", date)
      .eq("meal_type", mealType);

    if (error) return NextResponse.json({ error: "Unable to delete." }, { status: 500 });
    return new NextResponse(null, { status: 204 });
  }

  // 3. Delete entire week (date range)
  if (date && clearWeek) {
    const endDate = params.get("end");
    let query = supabase
      .from("user_meal_plans")
      .delete()
      .eq("user_id", user.id);
    
    if (endDate) {
      query = query.gte("plan_date", date).lte("plan_date", endDate);
    } else {
      query = query.eq("plan_date", date);
    }

    const { error } = await query;
    if (error) return NextResponse.json({ error: "Unable to clear week." }, { status: 500 });
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json({ error: "Missing parameters." }, { status: 400 });
}