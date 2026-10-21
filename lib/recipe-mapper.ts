// lib/recipe-mapper.ts
import type { Recipe } from "@/lib/recipes";

export interface DbRecipeRow {
  id: string;
  slug: string | null;
  name: string;
  description: string;
  category: string;
  meal_type: Recipe["mealType"];
  ingredients: Recipe["ingredients"];
  instructions: string[];
  total_time_minutes: number;
  servings: number;
  difficulty: string;
  cost_min_kes: number;
  cost_max_kes: number;
  image_url: string | null;
  tags: string[] | null;
  dietary_tags: string[] | null;
  comrade_score: number | null;
  is_comrade_friendly: boolean | null;
}

/** Same shape that /api/recipes/[id] returns, so the app sees no difference. */
export function mapDbRecipe(data: DbRecipeRow): Recipe {
  return {
    id: data.id,
    slug: data.slug ?? undefined,
    name: data.name,
    description: data.description,
    category: data.category,
    mealType: data.meal_type,
    ingredients: data.ingredients,
    instructions: data.instructions,
    prepTime: Math.max(5, data.total_time_minutes - 10),
    cookTime: data.total_time_minutes,
    totalTime: data.total_time_minutes,
    servings: data.servings,
    difficulty: data.difficulty === "medium" ? "Medium" : "Easy",
    estimatedCost: { min: data.cost_min_kes, max: data.cost_max_kes },
    equipment: ["Sufuria", "Wooden spoon"],
    image: data.image_url ?? null,
    tags: data.tags ?? [],
    dietaryInfo: data.dietary_tags ?? [],
    popularity: data.comrade_score ?? 0,
    isComradeFriendly: data.is_comrade_friendly ?? false,
  };
}