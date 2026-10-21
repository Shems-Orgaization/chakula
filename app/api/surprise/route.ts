// app/api/surprise/route.ts
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

  const params = request.nextUrl.searchParams;
  const budget = Number(params.get("budget") ?? 300);
  const maxTime = Number(params.get("maxTime") ?? 60);
  const mealType = params.get("mealType");
  const difficulty = params.get("difficulty");
  const category = params.get("category");
  const count = Math.min(Number(params.get("count") ?? 6), 12);

  const { data: recentSurprises } = await supabase.from("user_surprise_history").select("recipe_id").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
  const excludeIds = new Set((recentSurprises ?? []).map((r) => r.recipe_id));

  const [prefRes, logRes] = await Promise.all([
    supabase.from("user_preferences").select("favorites, pantry").eq("user_id", user.id).maybeSingle(),
    supabase.from("user_cooking_log").select("recipe_id").eq("user_id", user.id).order("cooked_at", { ascending: false }).limit(30),
  ]);

  const pantry: string[] = (prefRes.data?.pantry as string[]) ?? [];
  const recentlyCooked = new Set((logRes.data ?? []).map((l) => l.recipe_id).filter(Boolean));

  let builder = supabase.from("recipes").select("*").eq("is_published", true).eq("is_comrade_friendly", true).lte("total_time_minutes", maxTime).lte("cost_min_kes", budget).limit(80);
  if (mealType) builder = builder.eq("meal_type", mealType);
  if (difficulty) builder = builder.eq("difficulty", difficulty.toLowerCase());
  if (category) builder = builder.eq("category", category);

  const { data: recipes, error } = await builder;
  if (error) return NextResponse.json({ error: "Unable to load." }, { status: 500 });

  const scored = (recipes ?? [])
    .filter((r) => !recentlyCooked.has(r.id))
    .map((r) => {
      const ingredients: { name: string }[] = r.ingredients ?? [];
      
      const pantryMatches = ingredients.filter((ing) => pantry.some((p) => ing.name.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(ing.name.toLowerCase())));
      const pantryScore = ingredients.length > 0 ? (pantryMatches.length / ingredients.length) * 100 : 0;

      const budgetScore = r.cost_min_kes <= budget ? 100 : Math.max(0, 100 - ((r.cost_min_kes - budget) / budget) * 100);
      const timeScore = r.total_time_minutes <= maxTime ? 100 : Math.max(0, 100 - (r.total_time_minutes - maxTime) * 3);
      const freshnessScore = excludeIds.has(r.id) ? 20 : 100;
      
      // ✅ Use DB comrade score
      const comradeScore = r.comrade_score ?? 0;

      const score = Math.round(pantryScore * 0.3 + budgetScore * 0.2 + timeScore * 0.2 + freshnessScore * 0.15 + comradeScore * 0.15);

      const reasons: string[] = [];
      if (pantryMatches.length >= 3) reasons.push(`${pantryMatches.length} ingredients in pantry`);
      if (r.total_time_minutes <= 30) reasons.push("Quick to cook");
      if (r.cost_min_kes <= 150) reasons.push("Budget-friendly");
      if (excludeIds.has(r.id)) reasons.push("Fresh pick");

      return {
        recipe: {
          id: r.id, slug: r.slug, name: r.name, description: r.description, category: r.category,
          mealType: r.meal_type, ingredients: r.ingredients, instructions: r.instructions,
          prepTime: Math.max(5, r.total_time_minutes - 10), cookTime: r.total_time_minutes,
          totalTime: r.total_time_minutes, servings: r.servings,
          difficulty: r.difficulty === "medium" ? "Medium" : "Easy",
          estimatedCost: { min: r.cost_min_kes, max: r.cost_max_kes },
          equipment: ["Sufuria", "Wooden spoon"], image: r.image_url ?? "",
          tags: r.tags ?? [], dietaryInfo: r.dietary_tags ?? [], allergens: r.allergens ?? [],
          popularity: r.comrade_score ?? 0, budgetTier: r.budget_tier ?? 500,
        },
        score, pantryMatches: pantryMatches.map((p) => p.name), reasons, isNew: !excludeIds.has(r.id),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, count);

  if (scored.length > 0) {
    await supabase.from("user_surprise_history").insert(scored.map((s) => ({ user_id: user.id, recipe_id: s.recipe.id, action: "shown", filters: { budget, maxTime, mealType, difficulty, category } })));
  }

  return NextResponse.json({ suggestions: scored });
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.recipe_id || !body?.action) return NextResponse.json({ error: "recipe_id and action required" }, { status: 400 });
  if (!["shown", "cooked", "saved", "skipped"].includes(body.action)) return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  const { error } = await supabase.from("user_surprise_history").insert({ user_id: user.id, recipe_id: body.recipe_id, action: body.action, filters: body.filters || {} });
  if (error) return NextResponse.json({ error: "Unable to record." }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const { supabase, user } = await context();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await supabase.from("user_surprise_history").delete().eq("user_id", user.id);
  return NextResponse.json({ success: true });
}