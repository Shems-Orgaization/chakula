// lib/scripts/list-missing-images.ts
import { existsSync } from 'fs';
import { join } from 'path';
import { batch01 } from '../seed-data/batch-01';
import { batch02 } from '../seed-data/batch-02';
import { batch03 } from '../seed-data/batch-03';
import { batch04 } from '../seed-data/batch-04';
import { MEAL_IMAGE_BACKUPS } from '../meal-image-backups';

const exts = ['jpg', 'webp', 'png', 'jpeg'];
const dir = join(process.cwd(), 'public', 'meal-images');

const batches = { 'batch-01': batch01, 'batch-02': batch02, 'batch-03': batch03, 'batch-04': batch04 };

for (const [label, recipes] of Object.entries(batches)) {
  const missing = recipes.filter(
    (r) => !MEAL_IMAGE_BACKUPS[r.id] && !exts.some((e) => existsSync(join(dir, `${r.id}.${e}`))),
  );
  console.log(`\n${label}: ${missing.length} of ${recipes.length} have no image`);
  missing.forEach((r) => console.log(`  ${r.id}  (${r.name})`));
}