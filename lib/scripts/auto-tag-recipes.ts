// scripts/auto-tag-recipes.ts
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.development.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MEATS = ['beef', 'chicken', 'goat', 'fish', 'tilapia', 'omena', 'mince', 'sausage', 'smokie', 'liver', 'mutura'];
const ALLERGENS = ['peanut', 'milk', 'egg', 'wheat', 'flour', 'fish', 'soy'];

async function run() {
  const { data: recipes, error } = await supabase.from('recipes').select('id, ingredients');
  if (error || !recipes) return console.error(error);

  for (const r of recipes) {
    const ingNames = (r.ingredients as any[]).map(i => i.name.toLowerCase()).join(' ');
    const dietary = new Set<string>();
    const allergens = new Set<string>();

    const hasMeat = MEATS.some(m => ingNames.includes(m));
    if (!hasMeat) {
      dietary.add('Vegetarian');
      if (!ingNames.includes('milk') && !ingNames.includes('egg')) dietary.add('Vegan');
    }
    if (!ingNames.includes('flour') && !ingNames.includes('spaghetti') && !ingNames.includes('macaroni') && !ingNames.includes('bread')) {
      dietary.add('Gluten-Free');
    }
    if (hasMeat || ingNames.includes('beans') || ingNames.includes('ndengu') || ingNames.includes('egg') || ingNames.includes('lentils')) {
      dietary.add('High-Protein');
    }

    ALLERGENS.forEach(a => { if (ingNames.includes(a)) allergens.add(a); });

    await supabase.from('recipes').update({
      dietary_tags: Array.from(dietary),
      allergens: Array.from(allergens)
    }).eq('id', r.id);
  }
  console.log('✅ Auto-tagged all recipes');
}
run();