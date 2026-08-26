// lib/seed-data/transform.ts
import { SeedRecipe } from './recipes';

export interface DatabaseRecipe {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  meal_type: string;
  difficulty: string;
  total_time_minutes: number;
  cost_min_kes: number;
  cost_max_kes: number;
  servings: number;
  image_url: string | null;
  image_alt: string | null;
  dietary_tags: string[];
  tags: string[];
  ingredients: { name: string; amount: string }[];
  instructions: string[];
  is_published: boolean;
}

/**
 * Generate a URL-friendly slug from a recipe name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Transform a SeedRecipe to the database format
 */
export function transformToDatabaseRecipe(recipe: SeedRecipe): DatabaseRecipe {
  return {
    id: recipe.id,
    name: recipe.name,
    slug: generateSlug(recipe.name),
    description: recipe.description,
    category: recipe.category,
    meal_type: recipe.meal_type,
    difficulty: recipe.difficulty.toLowerCase(),
    total_time_minutes: recipe.total_time_minutes,
    cost_min_kes: recipe.cost_min_kes,
    cost_max_kes: recipe.cost_max_kes,
    servings: recipe.servings,
    image_url: recipe.image_url,
    image_alt: recipe.image_alt,
    dietary_tags: recipe.dietary_tags,
    tags: recipe.tags,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    is_published: true,
  };
}

/**
 * Transform multiple recipes to database format
 */
export function transformToDatabaseRecipes(
  recipes: SeedRecipe[]
): DatabaseRecipe[] {
  return recipes.map(transformToDatabaseRecipe);
}