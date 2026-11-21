// lib/assistant-types.ts

export type AssistantPage =
  | "dashboard"
  | "explore"
  | "detail"
  | "pantry"
  | "planner"
  | "shopping"
  | "surprise"
  | "meals"
  | "other";

export type AssistantContext = {
  budget?: number;
  pantry?: string[];
  shopping?: string[];
  favorites?: string[];
  recent?: string[];
  recipeId?: string;
  date?: string;
};

export type RecipeCard = {
  id: string;
  name: string;
  category: string;
  mealType: string;
  cost: { min: number; max: number };
  time: number;
  image: string | null;
};

export type ExploreFilters = {
  maxBudget?: number;
  maxTime?: number;
  sort?: "match" | "cheapest" | "quickest";
  usePantry?: boolean;
  category?: string;
  query?: string;
};
export type FilterHandler = (f: ExploreFilters) => () => void;

export type DraftRecipe = {
  name: string;
  description: string;
  category: string;
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  totalTime: number;
  servings: number;
  cost: { min: number; max: number };
  ingredients: { name: string; amount: string; qty: number | null; unit: string }[];
  instructions: string[];
};

export type PlanItem = {
  date: string;
  slot: "breakfast" | "lunch" | "dinner";
  recipeId: string;
  recipeName: string;
  cost: { min: number; max: number };
};

export type AssistantAction =
  | { type: "add_to_shopping"; names: string[] }
  | { type: "save_favorite"; recipeId: string; recipeName: string }
  | { type: "set_budget"; amount: number }
  | { type: "set_filters"; filters: ExploreFilters }
  | { type: "create_recipe"; draft: DraftRecipe }
  | { type: "my_version"; baseId: string; baseName: string; draft: DraftRecipe }
  | { type: "suggest_correction"; recipeId: string; recipeName: string; note: string }
  | { type: "plan_meals"; items: PlanItem[] }
  | { type: "update_pantry"; add: string[]; remove: string[] }
  | {
      type: "create_collection";
      name: string;
      description: string;
      icon: string;
      color: string;
      recipes: { id: string; name: string }[];
    };

export type AssistantResponse = {
  reply: string;
  answer: string;
  recipes: RecipeCard[];
  actions: AssistantAction[];
  remaining: number;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  recipes?: RecipeCard[];
  actions?: AssistantAction[];
  error?: boolean;
};