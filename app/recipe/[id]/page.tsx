import { redirect } from "next/navigation";
import { FoodApp } from "@/components/food-app";
import { createClient } from "@/lib/supabase/server";
import { mapDbRecipe, type DbRecipeRow } from "@/lib/recipe-mapper";
import type { Recipe } from "@/lib/recipes";

type UserRow = {
  id: string; name: string; description: string | null; category: string | null;
  meal_type: string | null; difficulty: string | null; total_time_minutes: number | null;
  servings: number | null; cost_min_kes: number | null; cost_max_kes: number | null;
  ingredients: Recipe["ingredients"] | null; instructions: string[] | null;
  image_url: string | null; tags: string[] | null; dietary_tags: string[] | null;
};

const MEALS: Recipe["mealType"][] = ["Breakfast", "Lunch", "Dinner", "Snack"];

function mapUserRecipe(r: UserRow): Recipe {
  const time = r.total_time_minutes ?? 30;
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    category: r.category ?? "Other",
    mealType: MEALS.find((m) => m === r.meal_type) ?? "Dinner",
    ingredients: r.ingredients ?? [],
    instructions: r.instructions ?? [],
    prepTime: Math.max(5, time - 10),
    cookTime: time,
    totalTime: time,
    servings: r.servings ?? 2,
    difficulty: r.difficulty === "medium" ? "Medium" : "Easy",
    estimatedCost: { min: r.cost_min_kes ?? 0, max: r.cost_max_kes ?? 0 },
    equipment: ["Sufuria", "Wooden spoon"],
    image: r.image_url ?? null,
    tags: r.tags ?? [],
    dietaryInfo: r.dietary_tags ?? [],
    popularity: 0,
  };
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("recipes")
    .select("*")
    .or(`slug.eq.${id},id.eq.${id}`)
    .eq("is_published", true)
    .maybeSingle();

  if (data) {
    return (
      <FoodApp
        initialView="detail"
        selectedId={id}
        initialRecipe={mapDbRecipe(data as DbRecipeRow)}
      />
    );
  }

  // Not public: try the user's own recipes (RLS limits this to their rows).
  const { data: mine } = await supabase
    .from("user_recipes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!mine) redirect("/explore");

  return (
    <FoodApp
      initialView="detail"
      selectedId={id}
      initialRecipe={mapUserRecipe(mine as UserRow)}
    />
  );
}