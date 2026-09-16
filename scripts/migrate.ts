import { query } from '../lib/db';

async function run() {
  console.log('Running DB migration...');
  try {
    await query('ALTER TABLE tasks DROP COLUMN IF EXISTS project_id;');
    await query('DROP TABLE IF EXISTS projects;');
    console.log('Migration successful.');
  } catch (err) {
    console.error('Migration failed:', err);
  }
  process.exit(0);
}

run();
