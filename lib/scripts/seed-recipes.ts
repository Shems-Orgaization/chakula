// lib/scripts/seed-recipes.ts
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { recipes as seedRecipes } from '../seed-data/recipes';
import { transformToDatabaseRecipes } from '../seed-data/transform';

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

async function runSeed() {
  console.log('🌱 Starting recipe seed...');
  console.log(`📊 Found ${seedRecipes.length} recipes to seed`);

  const dbRecipes = transformToDatabaseRecipes(seedRecipes);

  console.log('🔄 Upserting recipes...');

  const batchSize = 10;
  let successCount = 0;

  for (let i = 0; i < dbRecipes.length; i += batchSize) {
    const batch = dbRecipes.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('recipes')
      .upsert(batch, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select('id');

    if (error) {
      console.error(`❌ Error seeding batch ${i / batchSize + 1}:`, error);
      continue;
    }

    successCount += data?.length || 0;
    console.log(`✅ Batch ${i / batchSize + 1}: ${data?.length || 0} recipes upserted`);
  }

  console.log(`✅ Successfully upserted ${successCount} recipes`);
  console.log('🎉 Seed completed successfully!');
}

runSeed()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });