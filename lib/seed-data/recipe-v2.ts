// lib/seed-data/recipe-v2.ts
export type Unit = "g" | "kg" | "ml" | "l" | "cup" | "tbsp" | "tsp" | "piece" | "bunch" | "head" | "clove" | "pinch" | "to_taste";
export type Audience = "comrade" | "family" | "street" | "traditional";
export type BudgetTier = 100 | 200 | 300 | 500;
export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";
export type Difficulty = "Easy" | "Medium";
export type Region = "Nationwide" | "Nairobi" | "Central" | "Western" | "Nyanza" | "Coast" | "Eastern" | "Rift Valley";

export interface RecipeIngredientV2 {
  name: string;
  qty: number | null;
  unit: Unit;
  amount: string;
  optional: boolean;
}

export interface SeedRecipeV2 {
  id: string;
  name: string;
  swahili_name: string;
  description: string;
  category: string;
  meal_type: MealType;
  difficulty: Difficulty;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  cost_min_kes: number;
  cost_max_kes: number;
  audience: Audience[];
  region: Region;
  one_pot: boolean;
  needs_fridge: boolean;
  tags: string[];
  ingredients: RecipeIngredientV2[];
  instructions: string[];
}

export interface DatabaseRecipeV2 {
  id: string;
  name: string;
  slug: string;
  swahili_name: string;
  description: string;
  category: string;
  meal_type: MealType;
  difficulty: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  total_time_minutes: number;
  servings: number;
  cost_min_kes: number;
  cost_max_kes: number;
  cost_per_serving_kes: number;
  budget_tier: BudgetTier;
  audience: Audience[];
  region: Region;
  one_pot: boolean;
  needs_fridge: boolean;
  dietary_tags: string[];
  allergens: string[];
  tags: string[];
  ingredients: RecipeIngredientV2[];
  instructions: string[];
  image_url: string | null;
  image_alt: string;
  is_published: boolean;
  catalogue_version: 2;
  is_comrade_friendly: boolean;
  comrade_score: number;
}

const defaultAmount = (qty: number | null, unit: Unit): string => {
  if (qty === null || unit === "to_taste") return "to taste";
  if (unit === "piece") return String(qty);
  if (unit === "cup") return `${qty} ${qty === 1 ? "cup" : "cups"}`;
  return `${qty} ${unit}`;
};

export function ing(name: string, qty: number | null, unit: Unit, amount?: string, optional = false): RecipeIngredientV2 {
  return { name, qty, unit, amount: amount ?? defaultAmount(qty, unit), optional };
}

export function budgetTierFor(maxCostKes: number): BudgetTier {
  if (maxCostKes <= 100) return 100;
  if (maxCostKes <= 200) return 200;
  if (maxCostKes <= 300) return 300;
  return 500;
}

export function comradeScoreFor(recipe: SeedRecipeV2): number {
  const base = recipe.audience.includes("comrade") ? 70 : 40;
  const tier = budgetTierFor(recipe.cost_max_kes);
  const cheapBonus = tier === 100 ? 30 : tier === 200 ? 20 : tier === 300 ? 10 : 0;
  return base + cheapBonus;
}

export function validateRecipeV2(recipe: SeedRecipeV2): string[] {
  const errors: string[] = [];
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(recipe.id)) errors.push("id must be a lowercase slug");
  if (recipe.cost_min_kes > recipe.cost_max_kes) errors.push("cost_min_kes is above cost_max_kes");
  if (recipe.servings < 1) errors.push("servings must be at least 1");
  if (recipe.instructions.length < 3) errors.push("needs at least 3 instruction steps");
  if (recipe.ingredients.length < 2) errors.push("needs at least 2 ingredients");
  for (const item of recipe.ingredients) {
    if (item.unit !== "to_taste" && item.qty === null) errors.push(`ingredient "${item.name}" has no qty`);
    if (/[()]/.test(item.name)) errors.push(`ingredient "${item.name}" has brackets in its name`);
  }
  return errors;
}

export function transformV2(recipe: SeedRecipeV2): DatabaseRecipeV2 {
  const errors = validateRecipeV2(recipe);
  if (errors.length > 0) throw new Error(`Recipe "${recipe.id}" is invalid: ${errors.join("; ")}`);

  return {
    id: recipe.id,
    name: recipe.name,
    slug: recipe.id,
    swahili_name: recipe.swahili_name,
    description: recipe.description,
    category: recipe.category,
    meal_type: recipe.meal_type,
    difficulty: recipe.difficulty.toLowerCase(),
    prep_time_minutes: recipe.prep_time_minutes,
    cook_time_minutes: recipe.cook_time_minutes,
    total_time_minutes: recipe.prep_time_minutes + recipe.cook_time_minutes,
    servings: recipe.servings,
    cost_min_kes: recipe.cost_min_kes,
    cost_max_kes: recipe.cost_max_kes,
    cost_per_serving_kes: Math.round((recipe.cost_min_kes + recipe.cost_max_kes) / 2 / recipe.servings),
    budget_tier: budgetTierFor(recipe.cost_max_kes),
    audience: recipe.audience,
    region: recipe.region,
    one_pot: recipe.one_pot,
    needs_fridge: recipe.needs_fridge,
    dietary_tags: [],
    allergens: [],
    tags: recipe.tags,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    image_url: null,
    image_alt: `${recipe.name}, a Kenyan home-cooked meal`,
    is_published: true,
    catalogue_version: 2,
    is_comrade_friendly: recipe.audience.includes("comrade"),
    comrade_score: comradeScoreFor(recipe),
  };
}

export function transformManyV2(recipes: SeedRecipeV2[]): DatabaseRecipeV2[] {
  return recipes.map(transformV2);
}