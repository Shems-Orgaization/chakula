export type CostRange = { min: number; max: number }
export type Ingredient = { name: string; amount: string; essential?: boolean }
export type Recipe = {
  id: string
  name: string
  description: string
  category: string
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'
  ingredients: Ingredient[]
  instructions: string[]
  prepTime: number
  cookTime: number
  totalTime: number
  servings: number
  difficulty: 'Easy' | 'Medium'
  estimatedCost: CostRange
  equipment: string[]
  image: string
  tags: string[]
  dietaryInfo: string[]
  popularity: number
}

const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=82`
const localPhoto = (name: string) => `/images/${name}.png`
const base = (overrides: Partial<Recipe> & Pick<Recipe, 'id' | 'name' | 'category' | 'mealType'>): Recipe => ({
  description: 'A comforting, practical plate made for everyday Kenyan cooking.',
  ingredients: [
    { name: 'Onion', amount: '1 medium' },
    { name: 'Cooking oil', amount: '2 tbsp' },
    { name: 'Salt', amount: 'to taste' },
  ],
  instructions: ['Prepare and chop the ingredients before turning on the cooker.', 'Cook the onion in oil until soft and lightly golden, then add the main ingredients.', 'Season, simmer until tender, and serve while hot.'],
  prepTime: 8, cookTime: 18, totalTime: 26, servings: 2, difficulty: 'Easy', estimatedCost: { min: 80, max: 150 },
  equipment: ['Sufuria', 'Wooden spoon'], image: photo('photo-1547592180-85f173990554'), tags: ['Comrade-friendly'], dietaryInfo: [], popularity: 80, ...overrides,
})

export const recipes: Recipe[] = [
  base({ id: 'ugali-sukuma', name: 'Ugali & Sukuma Wiki', category: 'Ugali', mealType: 'Dinner', description: 'The dependable Kenyan classic: firm ugali with garlicky, tender greens.', ingredients: [{ name: 'Maize flour', amount: '2 vikombe' }, { name: 'Sukuma wiki', amount: '1 bunch' }, { name: 'Tomato', amount: '2' }, { name: 'Onion', amount: '1' }, { name: 'Oil', amount: '2 tbsp' }], totalTime: 30, cookTime: 22, estimatedCost: { min: 70, max: 130 }, image: localPhoto('ugali-sukuma'), tags: ['One-pot', 'Bachelor-friendly'], dietaryInfo: ['Vegetarian']}),
  base({ id: 'egg-ugali', name: 'Ugali & Fried Eggs', category: 'Eggs', mealType: 'Dinner', description: 'Soft scrambled eggs with tomato tucked next to hot, fresh ugali.', ingredients: [{ name: 'Maize flour', amount: '2 vikombe' }, { name: 'Eggs', amount: '3' }, { name: 'Tomato', amount: '2' }, { name: 'Onion', amount: '1' }], totalTime: 25, estimatedCost: { min: 90, max: 150 }, tags: ['Quick', 'Bachelor-friendly'], image: photo('photo-1525351484163-7529414344d8')}),
  base({ id: 'githeri-fried', name: 'Fried Githeri', category: 'Githeri', mealType: 'Lunch', description: 'Maize and beans fried with tomato, onion and a little spice.', ingredients: [{ name: 'Cooked maize', amount: '2 cups' }, { name: 'Cooked beans', amount: '1 cup' }, { name: 'Tomato', amount: '2' }, { name: 'Onion', amount: '1' }, { name: 'Dhania', amount: 'a handful' }], totalTime: 20, estimatedCost: { min: 80, max: 140 }, tags: ['One-pot', 'Leftover-friendly'], image: photo('photo-1547592180-85f173990554')}),
  base({ id: 'beans-rice', name: 'Beans & Rice', category: 'Beans', mealType: 'Lunch', description: 'A filling, budget-friendly bowl that stretches beautifully to tomorrow.', ingredients: [{ name: 'Rice', amount: '2 cups' }, { name: 'Cooked beans', amount: '2 cups' }, { name: 'Tomato', amount: '2' }, { name: 'Onion', amount: '1' }], totalTime: 35, cookTime: 28, estimatedCost: { min: 100, max: 170 }, tags: ['Batch-cook', 'Comrade-friendly'], image: localPhoto('beans-rice')}),
  base({ id: 'ndengu-rice', name: 'Ndengu & Rice', category: 'Ndengu', mealType: 'Lunch', description: 'Green grams in a rich tomato stew over fluffy rice.', ingredients: [{ name: 'Ndengu', amount: '2 cups' }, { name: 'Rice', amount: '2 cups' }, { name: 'Tomato', amount: '3' }, { name: 'Coconut milk', amount: '½ cup' }], totalTime: 40, cookTime: 32, estimatedCost: { min: 120, max: 210 }, tags: ['Batch-cook'], image: localPhoto('ndengu-rice')}),
  base({ id: 'egg-fried-rice', name: 'Egg Fried Rice', category: 'Rice', mealType: 'Dinner', description: 'A fast wok-style rescue for leftover rice and a hungry evening.', ingredients: [{ name: 'Leftover rice', amount: '2 cups' }, { name: 'Eggs', amount: '2' }, { name: 'Carrot', amount: '1' }, { name: 'Spring onion', amount: '2 stalks' }, { name: 'Soy sauce', amount: '1 tbsp' }], totalTime: 15, cookTime: 10, estimatedCost: { min: 80, max: 160 }, tags: ['Quick', 'One-pot', 'Leftover-friendly', 'Bachelor-friendly'], image: photo('photo-1512058564366-18510be2db19')}),
  base({ id: 'pilau', name: 'Easy Beef Pilau', category: 'Rice', mealType: 'Dinner', description: 'Fragrant spiced rice with tender beef, simplified for a weeknight.', ingredients: [{ name: 'Rice', amount: '2 cups' }, { name: 'Beef', amount: '300 g' }, { name: 'Pilau masala', amount: '2 tsp' }, { name: 'Onion', amount: '2' }], totalTime: 50, cookTime: 40, difficulty: 'Medium', estimatedCost: { min: 280, max: 420 }, tags: ['Weekend'], image: photo('photo-1512058564366-18510be2db19')}),
  base({ id: 'chapati-beans', name: 'Chapati & Beans', category: 'Chapati', mealType: 'Dinner', description: 'Soft chapati with saucy beans: filling, familiar and easy to portion.', ingredients: [{ name: 'Chapati', amount: '2' }, { name: 'Cooked beans', amount: '2 cups' }, { name: 'Tomato', amount: '2' }, { name: 'Onion', amount: '1' }], totalTime: 20, estimatedCost: { min: 130, max: 220 }, tags: ['Comrade-friendly'], image: photo('photo-1601050690597-df0568f70950')}),
  base({ id: 'rolex', name: 'Street-style Rolex', category: 'Quick Meals', mealType: 'Breakfast', description: 'Chapati rolled around an omelette with tomato and crunchy cabbage.', ingredients: [{ name: 'Chapati', amount: '1' }, { name: 'Eggs', amount: '2' }, { name: 'Tomato', amount: '1' }, { name: 'Cabbage', amount: 'a handful' }], totalTime: 12, cookTime: 8, estimatedCost: { min: 80, max: 150 }, tags: ['Quick', 'Bachelor-friendly'], image: photo('photo-1525351484163-7529414344d8')}),
  base({ id: 'potatoes-eggs', name: 'Potatoes & Eggs', category: 'Potatoes', mealType: 'Dinner', description: 'Crisp-edged potatoes tossed with onion, tomato and fried eggs.', ingredients: [{ name: 'Potatoes', amount: '4 medium' }, { name: 'Eggs', amount: '3' }, { name: 'Tomato', amount: '2' }, { name: 'Onion', amount: '1' }], totalTime: 28, estimatedCost: { min: 100, max: 180 }, tags: ['One-pot', 'Bachelor-friendly'], image: photo('photo-1518977676601-b53f82aba655')}),
  base({ id: 'matoke', name: 'Matoke in Tomato Stew', category: 'Matoke', mealType: 'Dinner', description: 'Green bananas simmered until tender in a bright, savoury tomato base.', ingredients: [{ name: 'Matoke', amount: '8' }, { name: 'Tomato', amount: '3' }, { name: 'Onion', amount: '1' }, { name: 'Coriander', amount: 'a handful' }], totalTime: 35, estimatedCost: { min: 130, max: 220 }, tags: ['One-pot', 'Vegetarian'], image: photo('photo-1512621776951-a57141f2eefd')}),
  base({ id: 'omena-ugali', name: 'Omena & Ugali', category: 'Omena', mealType: 'Dinner', description: 'Small fish in a tomato-coconut sauce with the perfect ugali side.', ingredients: [{ name: 'Omena', amount: '250 g' }, { name: 'Maize flour', amount: '2 vikombe' }, { name: 'Tomato', amount: '3' }, { name: 'Coconut milk', amount: '½ cup' }], totalTime: 35, estimatedCost: { min: 160, max: 260 }, tags: ['Protein-rich'], image: photo('photo-1547592180-85f173990554')}),
  base({ id: 'tomato-pasta', name: 'Tomato Garlic Pasta', category: 'Pasta', mealType: 'Dinner', description: 'A pantry pasta with a saucy tomato finish and no complicated shopping.', ingredients: [{ name: 'Pasta', amount: '250 g' }, { name: 'Tomato', amount: '4' }, { name: 'Garlic', amount: '3 cloves' }, { name: 'Dhania', amount: 'a handful' }], totalTime: 22, estimatedCost: { min: 100, max: 190 }, tags: ['Quick', 'One-pot'], image: photo('photo-1473093295043-cdd812d0e601')}),
  base({ id: 'mandazi-tea', name: 'Mandazi & Chai', category: 'Breakfast', mealType: 'Breakfast', description: 'Pillowy mandazi alongside milky spiced tea for a slow morning.', ingredients: [{ name: 'Wheat flour', amount: '2 cups' }, { name: 'Milk', amount: '1 cup' }, { name: 'Tea leaves', amount: '2 tsp' }, { name: 'Sugar', amount: '2 tbsp' }], totalTime: 35, difficulty: 'Medium', estimatedCost: { min: 90, max: 170 }, tags: ['Breakfast'], image: photo('photo-1551024506-0bccd828d307')}),
  base({ id: 'oatmeal-banana', name: 'Banana Peanut Oats', category: 'Breakfast', mealType: 'Breakfast', description: 'Creamy oats topped with banana and a spoonful of peanut butter.', ingredients: [{ name: 'Oats', amount: '1 cup' }, { name: 'Banana', amount: '1' }, { name: 'Milk', amount: '1 cup' }, { name: 'Peanut butter', amount: '1 tbsp' }], totalTime: 8, cookTime: 5, estimatedCost: { min: 70, max: 140 }, tags: ['Quick', 'Vegetarian'], image: photo('photo-1512621776951-a57141f2eefd')}),
  base({ id: 'beef-stew', name: 'Beef Stew & Rice', category: 'Beef', mealType: 'Dinner', description: 'A hearty tomato beef stew designed to leave you with lunch tomorrow.', ingredients: [{ name: 'Beef', amount: '300 g' }, { name: 'Rice', amount: '2 cups' }, { name: 'Tomato', amount: '3' }, { name: 'Carrot', amount: '2' }], totalTime: 55, cookTime: 45, difficulty: 'Medium', estimatedCost: { min: 300, max: 480 }, tags: ['Leftover-friendly'], image: photo('photo-1547592180-85f173990554')}),
  base({ id: 'cabbage-sandwich', name: 'Egg & Cabbage Sandwich', category: 'Quick Meals', mealType: 'Lunch', description: 'Crisp cabbage, egg and tomato between toasted bread slices.', ingredients: [{ name: 'Bread', amount: '4 slices' }, { name: 'Eggs', amount: '2' }, { name: 'Cabbage', amount: '1 cup' }, { name: 'Tomato', amount: '1' }], totalTime: 12, cookTime: 8, estimatedCost: { min: 75, max: 140 }, tags: ['Quick', 'Bachelor-friendly'], image: photo('photo-1525351484163-7529414344d8')}),
  base({ id: 'chicken-stew', name: 'Simple Chicken Stew', category: 'Chicken', mealType: 'Dinner', description: 'Tender chicken in a rich onion and tomato gravy.', ingredients: [{ name: 'Chicken', amount: '500 g' }, { name: 'Tomato', amount: '3' }, { name: 'Onion', amount: '2' }, { name: 'Potatoes', amount: '3' }], totalTime: 48, cookTime: 38, difficulty: 'Medium', estimatedCost: { min: 320, max: 520 }, tags: ['Batch-cook'], image: photo('photo-1547592180-85f173990554')}),
]

export const categories = ['All', 'Breakfast', 'Quick Meals', 'Rice', 'Ugali', 'Chapati', 'Potatoes', 'Pasta', 'Beans', 'Ndengu', 'Matoke', 'Omena', 'Chicken', 'Beef', 'Eggs']
export const recipeService = { list: () => recipes, get: (id: string) => recipes.find((recipe) => recipe.id === id) }
