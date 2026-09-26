import type { Recipe } from './recipes'

export type RecommendationPrefs = { 
  budget: number; 
  maxTime: number; 
  pantry: string[]; 
  bachelor: boolean; 
  mealType?: Recipe['mealType'] 
}

export type Match = { 
  recipe: Recipe; 
  score: number; 
  have: string[]; 
  missing: string[]; 
  explanation: string 
}

const normalize = (value: string) => 
  value.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()

const has = (pantry: string[], ingredient: string) => 
  pantry.some((item) => 
    normalize(ingredient).includes(normalize(item)) || 
    normalize(item).includes(normalize(ingredient))
  )

// ✅ NEW: Comrade-friendly meals get a big boost
const COMRADE_RECIPES = [
  'ugali-sukuma-wiki', 'ugali-sukuma', 'githeri', 'beans-rice', 
  'ndengu-rice', 'chapati-beans', 'rolex', 'chips-mayai', 
  'smokie', 'samosa', 'bhajia', 'boiled-eggs', 'mandazi-tea', 
  'uji', 'bread-eggs', 'pancakes', 'egg-fried-rice', 
  'cabbage-potatoes', 'managu', 'terere', 'mrenda', 'kunde',
  'matoke-stew', 'tomato-pasta', 'potato-egg-sauce', 'chapati-tea',
  'sweet-potatoes', 'arrow-roots', 'porridge', 'eggs-bread',
  'roasted-maize', 'viazi-karai', 'kachumbari', 'omena-ugali',
  'beans-ugali-protein', 'chapati', 'ugali'
];

const COMRADE_KEYWORDS = [
  'ugali', 'githeri', 'chapati', 'mandazi', 'uji', 'ndengu',
  'sukuma', 'managu', 'terere', 'mrenda', 'kunde', 'matoke',
  'omena', 'rolex', 'smokie', 'kachumbari', 'chips', 'bhajia',
  'samosa', 'beans', 'rice', 'cabbage', 'porridge', 'arrow'
];

function isComradeRecipe(recipe: Recipe): boolean {
  const id = recipe.id?.toLowerCase() || '';
  const name = recipe.name?.toLowerCase() || '';
  
  if (COMRADE_RECIPES.some(r => id.includes(r))) return true;
  if (COMRADE_KEYWORDS.some(k => name.includes(k))) return true;
  return false;
}

export function matchRecipe(recipe: Recipe, pantry: string[] = []): Match {
  const have = recipe.ingredients
    .filter((item) => has(pantry, item.name))
    .map((item) => item.name)
  const missing = recipe.ingredients
    .filter((item) => !has(pantry, item.name))
    .map((item) => item.name)
  const score = Math.round((have.length / Math.max(recipe.ingredients.length, 1)) * 100)
  
  return { 
    recipe, 
    score, 
    have, 
    missing, 
    explanation: 
      score >= 80 ? 'You already have most of what you need.' : 
      score >= 45 ? 'A few smart swaps or a small shop will get you there.' : 
      'This one needs a fuller shop, but the payoff is worth it.' 
  }
}

export function rankRecipes(
  recipes: Recipe[], 
  prefs: RecommendationPrefs, 
  rejected: Record<string, number> = {}
): Match[] {
  return recipes
    .filter((recipe) => !prefs.mealType || recipe.mealType === prefs.mealType)
    .map((recipe) => {
      const match = matchRecipe(recipe, prefs.pantry)
      
      // Budget score (0-100)
      const budgetScore = recipe.estimatedCost.max <= prefs.budget 
        ? 100 
        : Math.max(0, 100 - ((recipe.estimatedCost.max - prefs.budget) / prefs.budget) * 100)
      
      // Time score (0-100)
      const timeScore = recipe.totalTime <= prefs.maxTime 
        ? 100 
        : Math.max(0, 100 - (recipe.totalTime - prefs.maxTime) * 4)
      
      // Comrade score (0-100) - NEW
      const comradeScore = isComradeRecipe(recipe) ? 100 : 30
      
      // Bachelor score (0-100)
      const bachelorScore = prefs.bachelor 
        ? (recipe.tags?.includes('One-pot') ? 100 : 
           recipe.tags?.includes('Bachelor-friendly') ? 80 : 45) 
        : 70
      
      // Ease score - simple meals preferred (0-100)
      const easeScore = recipe.ingredients.length <= 5 ? 100 :
                        recipe.ingredients.length <= 8 ? 70 : 40
      
      // Feedback penalty
      const feedbackPenalty = rejected[recipe.id] 
        ? Math.min(rejected[recipe.id] * 18, 80) 
        : 0
      
      // ✅ NEW WEIGHTED SCORE - Comrade meals get higher weight
      const score = Math.round(
        budgetScore * 0.20 +     // 20% - affordability
        match.score * 0.20 +     // 20% - pantry match
        comradeScore * 0.25 +    // 25% - comrade friendly (HIGH PRIORITY)
        timeScore * 0.10 +       // 10% - quick
        easeScore * 0.10 +       // 10% - simple
        bachelorScore * 0.05 +   // 5% - bachelor friendly
        (80 - feedbackPenalty) * 0.10  // 10% - not rejected
      )
      
      return { 
        ...match, 
        score, 
        explanation: `${match.explanation} ${comradeScore >= 100 ? 'Perfect for a quick comrade meal.' : ''} Weighted for your budget and time.` 
      }
    })
    .sort((a, b) => b.score - a.score)
}

export const formatCost = (cost: Recipe['estimatedCost']) => 
  `KES ${cost.min}–${cost.max}`