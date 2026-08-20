// Applies the new purchases INSERT RLS policy to the live Supabase project (idempotent).
import { readFileSync } from 'node:fs';

const env = {};
for (const l of readFileSync('.env', 'utf-8').replace(/\r/g, '').split('\n')) {
  if (l.includes('=')) env[l.split('=')[0]] = l.split('=').slice(1).join('=').trim();
}
const URL = env.PUBLIC_SUPABASE_URL, PAT = env.SUPABASE_ACCESS_TOKEN;
const PROJECT = URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
if (!PAT || !PROJECT) { console.log('missing SUPABASE_ACCESS_TOKEN or URL'); process.exit(1); }

const sql = `
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='purchases' AND policyname='own purchases insert'
  ) THEN
    CREATE POLICY "own purchases insert" ON public.purchases
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
`;

const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT}/database/query`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${PAT}`, 'x-client-info': 'rydertech-cli' },
  body: JSON.stringify({ query: sql })
});
const text = await res.text();
console.log('HTTP', res.status, text);
process.exit(res.ok ? 0 : 1);
