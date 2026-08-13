export const imageOverrideStorageKey = 'food-image-overrides'

export function readImageOverrides(): Record<string, string> {
  try {
    const raw = localStorage.getItem(imageOverrideStorageKey)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function recipeImage(recipe: { id: string; image: string }, overrides: Record<string, string> = {}) {
  return overrides[recipe.id] || recipe.image
}

export function saveImageOverride(id: string, dataUrl: string) {
  const overrides = readImageOverrides()
  overrides[id] = dataUrl
  localStorage.setItem(imageOverrideStorageKey, JSON.stringify(overrides))
  return overrides
}

export function resetImageOverride(id: string) {
  const overrides = readImageOverrides()
  delete overrides[id]
  localStorage.setItem(imageOverrideStorageKey, JSON.stringify(overrides))
  return overrides
}

export function isImageOverride(id: string, overrides: Record<string, string>) {
  return Boolean(overrides[id])
}

export const imageGuidance: Record<string, string> = {
  'ugali-sukuma': 'Ugali with sautéed sukuma wiki greens',
  'ndengu-rice': 'Kenyan green gram ndengu stew with rice',
  'githeri-fried': 'Fried Kenyan githeri with maize and beans',
  'rolex': 'Kenyan street food rolex with chapati and egg',
  'matoke': 'Green matoke bananas in tomato stew',
  'omena-ugali': 'Omena small fish with ugali',
  'mandazi-tea': 'Kenyan mandazi with chai tea',
}

export function imageAlt(recipe: { id: string; name: string }, overrides: Record<string, string> = {}) {
  return overrides[recipe.id] ? `${recipe.name}, custom photo saved on this device` : imageGuidance[recipe.id] || `${recipe.name}, a Kenyan home-cooked meal`
}
