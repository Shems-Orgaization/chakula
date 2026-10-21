// lib/meal-image-backups.ts
// id -> online backup photo. Edit a line to swap an image.
// commons() builds a hotlink-safe Wikimedia Commons URL from the exact file name.
const commons = (file: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file.replace(/ /g, "_"))}?width=1000`;

export const MEAL_IMAGE_BACKUPS: Record<string, string> = {
  // ---- batch 01 ----
  "ugali-sukuma-wiki": commons("Ugali na Sukumawiki.JPG"),
  "ugali-cabbage": commons("Ugali and cabbage.jpg"),
  "ugali-omena": commons("Omena & ugali.jpg"),
};