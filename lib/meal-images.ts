// lib/meal-images.ts
const MEAL_IMAGE_BACKUPS: Record<string, string> = {};

export const LOCAL_IMAGE_DIR = "/meal-images"; // = public/meal-images/
const LOCAL_EXTENSIONS = ["jpg", "webp", "png", "jpeg"];

/** Sources in priority order. The first one that loads wins. */
export function recipeImageSources(
  recipe: { id: string; image?: string | null },
  overrides: Record<string, string> = {},
): string[] {
  const sources: string[] = [];
  const add = (url?: string | null) => {
    if (url && url.trim() !== "" && url !== "null" && !sources.includes(url)) sources.push(url);
  };

  add(overrides[recipe.id]); // 1. user upload / override
  add(recipe.image); //         1b. image_url from the database
  for (const ext of LOCAL_EXTENSIONS) add(`${LOCAL_IMAGE_DIR}/${recipe.id}.${ext}`); // 2. local file
  add(MEAL_IMAGE_BACKUPS[recipe.id]); // 3. online backup
  return sources; //            4. empty list means the placeholder shows
}