// lib/pantry.ts
import type { Recipe } from "@/lib/recipes";

export const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();

/** True when a pantry item and an ingredient name match (either contains the other). */
export const inPantry = (ingredientName: string, pantry: string[]): boolean => {
  const a = norm(ingredientName);
  if (a === "") return false;
  return pantry.some((p) => {
    const b = norm(p);
    return b !== "" && (a.includes(b) || b.includes(a));
  });
};

export const pantryHits = (recipe: Recipe, pantry: string[]): number =>
  recipe.ingredients.filter((i) => inPantry(i.name, pantry)).length;