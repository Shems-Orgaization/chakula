import type { Recipe } from './recipes'

export type RecommendationPrefs = { budget: number; maxTime: number; pantry: string[]; bachelor: boolean; mealType?: Recipe['mealType'] }
export type Match = { recipe: Recipe; score: number; have: string[]; missing: string[]; explanation: string }

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
const has = (pantry: string[], ingredient: string) => pantry.some((item) => normalize(ingredient).includes(normalize(item)) || normalize(item).includes(normalize(ingredient)))

export function matchRecipe(recipe: Recipe, pantry: string[] = []): Match {
  const have = recipe.ingredients.filter((item) => has(pantry, item.name)).map((item) => item.name)
  const missing = recipe.ingredients.filter((item) => !has(pantry, item.name)).map((item) => item.name)
  const score = Math.round((have.length / Math.max(recipe.ingredients.length, 1)) * 100)
  return { recipe, score, have, missing, explanation: score >= 80 ? 'You already have most of what you need.' : score >= 45 ? 'A few smart swaps or a small shop will get you there.' : 'This one needs a fuller shop, but the payoff is worth it.' }
}

export function rankRecipes(recipes: Recipe[], prefs: RecommendationPrefs, rejected: Record<string, number> = {}): Match[] {
  return recipes.filter((recipe) => !prefs.mealType || recipe.mealType === prefs.mealType).map((recipe) => {
    const match = matchRecipe(recipe, prefs.pantry)
    const budgetScore = recipe.estimatedCost.max <= prefs.budget ? 100 : Math.max(0, 100 - ((recipe.estimatedCost.max - prefs.budget) / prefs.budget) * 100)
    const timeScore = recipe.totalTime <= prefs.maxTime ? 100 : Math.max(0, 100 - (recipe.totalTime - prefs.maxTime) * 4)
    const bachelorScore = prefs.bachelor ? (recipe.tags.includes('One-pot') ? 100 : recipe.tags.includes('Bachelor-friendly') ? 80 : 45) : 70
    const feedbackPenalty = rejected[recipe.id] ? Math.min(rejected[recipe.id] * 18, 80) : 0
    const score = Math.round(budgetScore * .25 + match.score * .25 + 75 * .2 + timeScore * .1 + bachelorScore * .1 + (80 - feedbackPenalty) * .1)
    return { ...match, score, explanation: `${match.explanation} Weighted for your ${prefs.bachelor ? 'low-cleanup ' : ''}budget and time.` }
  }).sort((a, b) => b.score - a.score)
}

export const formatCost = (cost: Recipe['estimatedCost']) => `KES ${cost.min}–${cost.max}`
