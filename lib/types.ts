import { Recipe } from "@/lib/recipes";

export type View =
  | "home"
  | "surprise"
  | "browse"
  | "pantry"
  | "planner"
  | "meals"
  | "shopping"
  | "detail"
  | "profile"
  | "settings";

export type MealType = Recipe["mealType"]; // "Breakfast" | "Lunch" | "Dinner" | "Snack"