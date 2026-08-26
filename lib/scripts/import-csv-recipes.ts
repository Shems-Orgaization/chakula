// lib/scripts/import-csv-recipes.ts
import * as fs from 'fs';
import * as path from 'path';

interface SeedRecipe {
  id: string;
  name: string;
  description: string;
  category: string;
  meal_type: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  difficulty: "Easy" | "Medium";
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
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseIngredients(ingredientsStr: string): { name: string; amount: string }[] {
  if (!ingredientsStr || ingredientsStr === '#') return [];
  
  return ingredientsStr.split(',').map(item => {
    const trimmed = item.trim();
    const match = trimmed.match(/^(.+?)\s*\((.+?)\)$/);
    if (match) {
      return { name: match[1].trim(), amount: match[2].trim() };
    }
    return { name: trimmed, amount: 'to taste' };
  });
}

function parseInstructions(instructionsStr: string): string[] {
  if (!instructionsStr || instructionsStr === '#') return ['No instructions available.'];
  
  const steps = instructionsStr.split(/\d+\.\s*/).filter(s => s.trim().length > 0);
  if (steps.length > 0) {
    return steps.map(s => s.trim());
  }
  return [instructionsStr.trim()];
}

function getMealType(category: string): "Breakfast" | "Lunch" | "Dinner" | "Snack" {
  const cat = category.toLowerCase();
  if (cat.includes('breakfast')) return 'Breakfast';
  if (cat.includes('main') || cat.includes('stew') || cat.includes('curry') || cat.includes('rice') || cat.includes('meat') || cat.includes('fish') || cat.includes('chicken')) return 'Dinner';
  if (cat.includes('salad') || cat.includes('sandwich') || cat.includes('wrap') || cat.includes('soup')) return 'Lunch';
  if (cat.includes('snack') || cat.includes('appetizer') || cat.includes('bread') || cat.includes('beverage') || cat.includes('dessert') || cat.includes('condiment')) return 'Snack';
  return 'Lunch';
}

function getDifficulty(ingredientsCount: number, instructionsLength: number): "Easy" | "Medium" {
  if (ingredientsCount > 8 || instructionsLength > 150) return 'Medium';
  return 'Easy';
}

function estimateCost(ingredientsCount: number): { min: number; max: number } {
  const baseCost = ingredientsCount * 35;
  return {
    min: Math.max(50, baseCost - 50),
    max: baseCost + 100
  };
}

function getDietaryTags(row: Record<string, string>): string[] {
  const tags: string[] = [];
  
  if (row['Vegetarian'] === '#') tags.push('Vegetarian');
  if (row['Vegan'] === '#') tags.push('Vegan');
  if (row['Gluten-Free'] === '#') tags.push('Gluten-Free');
  if (row['Lactose-Intolerant'] === '#') tags.push('Dairy-Free');
  if (row['Diabetes'] === '#') tags.push('Low-Sugar');
  
  const category = row['Recipe Category']?.toLowerCase() || '';
  if (category.includes('meat')) tags.push('High-Protein');
  if (category.includes('vegetarian') || category.includes('vegetable')) tags.push('Vegetarian');
  
  return tags;
}

function getTags(row: Record<string, string>): string[] {
  const tags: string[] = [];
  const category = row['Recipe Category']?.toLowerCase() || '';
  const title = row['Recipe Title']?.toLowerCase() || '';
  
  if (category.includes('bread')) tags.push('bread');
  if (category.includes('staple')) tags.push('staple');
  if (category.includes('main')) tags.push('main-dish');
  if (category.includes('snack')) tags.push('snack');
  if (category.includes('beverage')) tags.push('drink');
  if (category.includes('salad')) tags.push('salad');
  if (category.includes('soup')) tags.push('soup');
  if (category.includes('curry')) tags.push('curry');
  if (category.includes('stew')) tags.push('stew');
  if (category.includes('meat')) tags.push('meat');
  if (category.includes('chicken')) tags.push('chicken');
  if (category.includes('fish') || category.includes('seafood')) tags.push('seafood');
  
  if (title.includes('kenyan') || title.includes('swahili') || title.includes('nyama') || title.includes('kienyeji')) tags.push('kenyan');
  if (title.includes('quick') || title.includes('easy')) tags.push('quick');
  if (title.includes('healthy')) tags.push('healthy');
  
  if (row['Vegetarian'] === '#') tags.push('vegetarian');
  if (row['Gluten-Free'] === '#') tags.push('gluten-free');
  
  return tags;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function convertCSVtoRecipes(csvContent: string): SeedRecipe[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length === 0) {
    console.error('❌ CSV file is empty!');
    return [];
  }
  
  const headers = parseCSVLine(lines[0]);
  
  const titleIndex = headers.indexOf('Recipe Title');
  const categoryIndex = headers.indexOf('Recipe Category');
  const ingredientsIndex = headers.indexOf('Recipe Ingredients Quantities');
  const instructionsIndex = headers.indexOf('Recipe Instructions');
  const descriptionIndex = headers.indexOf('Description');
  
  if (titleIndex === -1) {
    console.error('❌ Could not find "Recipe Title" column in CSV');
    console.log('Headers found:', headers);
    return [];
  }
  
  const recipes: SeedRecipe[] = [];
  const seenIds = new Set<string>();
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
    
    const title = row['Recipe Title'] || 'Unknown Recipe';
    const category = row['Recipe Category'] || 'Uncategorized';
    const ingredientsStr = row['Recipe Ingredients Quantities'] || '';
    const instructionsStr = row['Recipe Instructions'] || '';
    const description = row['Description'] || `A delicious ${title.toLowerCase()} recipe.`;
    
    const ingredients = parseIngredients(ingredientsStr);
    const instructions = parseInstructions(instructionsStr);
    const mealType = getMealType(category);
    const difficulty = getDifficulty(ingredients.length, instructionsStr.length);
    const cost = estimateCost(ingredients.length);
    const dietaryTags = getDietaryTags(row);
    const tags = getTags(row);
    
    let id = generateSlug(title);
    if (seenIds.has(id)) {
      id = `${id}-${i}`;
    }
    seenIds.add(id);
    
    const recipe: SeedRecipe = {
      id: id,
      name: title,
      description: description,
      category: category,
      meal_type: mealType,
      difficulty: difficulty,
      total_time_minutes: Math.min(Math.max(ingredients.length * 5 + 10, 15), 60),
      cost_min_kes: cost.min,
      cost_max_kes: cost.max,
      servings: 4,
      image_url: null,
      image_alt: `${title} - Kenyan recipe`,
      dietary_tags: dietaryTags.length > 0 ? dietaryTags : ['Traditional'],
      tags: tags.length > 0 ? tags : ['kenyan'],
      ingredients: ingredients,
      instructions: instructions
    };
    
    recipes.push(recipe);
  }
  
  return recipes;
}

function writeSeedFile(recipes: SeedRecipe[]) {
  const outputPath = path.join(process.cwd(), 'lib/seed-data/recipes.ts');
  
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  let content = `// lib/seed-data/recipes.ts
// AUTO-GENERATED from CSV import - ${recipes.length} recipes

export interface SeedRecipe {
  id: string;
  name: string;
  description: string;
  category: string;
  meal_type: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  difficulty: "Easy" | "Medium";
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
}

export const recipes: SeedRecipe[] = [
`;

  for (const recipe of recipes) {
    content += `  {
    id: "${recipe.id}",
    name: "${recipe.name.replace(/"/g, '\\"')}",
    description: "${recipe.description.replace(/"/g, '\\"')}",
    category: "${recipe.category}",
    meal_type: "${recipe.meal_type}",
    difficulty: "${recipe.difficulty}",
    total_time_minutes: ${recipe.total_time_minutes},
    cost_min_kes: ${recipe.cost_min_kes},
    cost_max_kes: ${recipe.cost_max_kes},
    servings: ${recipe.servings},
    image_url: null,
    image_alt: "${recipe.image_alt}",
    dietary_tags: ${JSON.stringify(recipe.dietary_tags)},
    tags: ${JSON.stringify(recipe.tags)},
    ingredients: ${JSON.stringify(recipe.ingredients)},
    instructions: ${JSON.stringify(recipe.instructions)}
  },\n`;
  }
  
  content += `];

export const totalRecipes = recipes.length; // ${recipes.length}
`;

  fs.writeFileSync(outputPath, content, 'utf8');
  console.log(`✅ Generated ${recipes.length} recipes in ${outputPath}`);
}

async function main() {
  console.log('📖 Reading CSV file...');
  
  // ✅ FIXED: Use process.cwd() to get project root
  const csvPath = path.join(process.cwd(), 'Kenyan Recipes.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found at: ${csvPath}`);
    console.log('📁 Make sure "Kenyan Recipes.csv" is in the project root.');
    process.exit(1);
  }
  
  console.log(`✅ Found CSV at: ${csvPath}`);
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  
  console.log('🔄 Converting CSV to recipes...');
  const recipes = convertCSVtoRecipes(csvContent);
  
  if (recipes.length === 0) {
    console.error('❌ No recipes were parsed. Check the CSV format.');
    process.exit(1);
  }
  
  console.log(`✅ Converted ${recipes.length} recipes`);
  console.log('📝 Writing to seed file...');
  
  writeSeedFile(recipes);
  
  console.log(`\n🎉 Done! ${recipes.length} recipes ready.`);
  console.log('📊 Run `npm run seed` to import to database.');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});