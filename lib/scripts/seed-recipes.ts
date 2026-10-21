// lib/scripts/seed-recipes.ts
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { batch01 } from '../seed-data/batch-01';
import { batch02 } from '../seed-data/batch-02';
import { batch03 } from '../seed-data/batch-03';
import { batch04 } from '../seed-data/batch-04';
import { transformManyV2, type SeedRecipeV2 } from '../seed-data/recipe-v2';

// Load environment variables
config({ path: '.env.development.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Add each new batch here as we create it (batch03, batch04, ...)
const seedRecipes: SeedRecipeV2[] = [...batch01, ...batch02, ...batch03, ...batch04];

const normalizeName = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** One dish = one id = one name. Throws before anything is written. */
function assertNoDuplicates(recipes: SeedRecipeV2[]) {
  const ids = new Map<string, string>();
  const names = new Map<string, string>();
  const problems: string[] = [];

  for (const recipe of recipes) {
    if (ids.has(recipe.id)) {
      problems.push(`Duplicate id "${recipe.id}"`);
    }
    ids.set(recipe.id, recipe.name);

    const key = normalizeName(recipe.name);
    const existing = names.get(key);
    if (existing && existing !== recipe.id) {
      problems.push(`Duplicate name "${recipe.name}" (ids: ${existing}, ${recipe.id})`);
    }
    names.set(key, recipe.id);
  }

  if (problems.length > 0) {
    throw new Error(`Duplicate check failed:\n - ${problems.join('\n - ')}`);
  }
}

async function runSeed() {
  console.log('🌱 Starting recipe seed (v2 catalogue)...');
  console.log(`📊 Found ${seedRecipes.length} recipes to seed`);

  assertNoDuplicates(seedRecipes);

  // ✅ FIX: Drop image_url so re-seeding never overwrites saved photos
  const dbRecipes = transformManyV2(seedRecipes).map(({ image_url, ...rest }) => rest);

  console.log('🔄 Upserting recipes...');

  const batchSize = 10;
  let successCount = 0;

  for (let i = 0; i < dbRecipes.length; i += batchSize) {
    const batch = dbRecipes.slice(i, i + batchSize);
    
    // ✅ FIXED: Changed onConflict from 'id' to 'slug'
    const { data, error } = await supabase
      .from('recipes')
      .upsert(batch, {
        onConflict: 'slug',
        ignoreDuplicates: false,
      })
      .select('id');

    if (error) {
      console.error(`❌ Error seeding batch ${i / batchSize + 1}:`, error);
      continue;
    }

    successCount += data?.length || 0;
    console.log(`✅ Batch ${i / batchSize + 1}: ${data?.length || 0} recipes upserted`);
  }

  console.log(`✅ Successfully upserted ${successCount} of ${dbRecipes.length} recipes`);
  console.log('🎉 Seed completed successfully!');
}

runSeed()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });