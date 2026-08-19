// Applies the courses schema via the Supabase Management API.
// Reads keys from .env (never logs them). Usage: node scripts/apply-courses-migration.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(dir, '..');

// minimal .env parser
const env = {};
const envText = readFileSync(resolve(root, '.env'), 'utf8').replace(/\r/g, '');
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}

const url = env.PUBLIC_SUPABASE_URL;
const token = env.SUPABASE_ACCESS_TOKEN;
if (!url || !token) {
  console.error('Missing PUBLIC_SUPABASE_URL or SUPABASE_ACCESS_TOKEN');
  process.exit(1);
}
const ref = url.replace('https://', '').split('.')[0];
const sql = readFileSync(resolve(root, 'supabase/migrations/0001_courses.sql'), 'utf8');

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: sql })
});

const text = await res.text();
if (!res.ok) {
  console.error('MIGRATION FAILED', res.status, text);
  process.exit(1);
}
console.log('MIGRATION OK');
console.log(text.slice(0, 400));
