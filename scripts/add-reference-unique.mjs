// Adds a UNIQUE constraint on purchases.reference so upsert(onConflict:'reference') works.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = {};
for (const l of readFileSync('.env', 'utf-8').replace(/\r/g, '').split('\n')) if (l.includes('=')) env[l.split('=')[0]] = l.split('=').slice(1).join('=').trim();
const supa = createClient(env.PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

async function runSql(sql) {
  try {
    const { error } = await supa.rpc('exec', { sql });
    return error ?? 'ok';
  } catch (e) {
    return 'rpc-exec-unavailable: ' + e.message;
  }
}

const dedup = await runSql(`
  delete from public.purchases a
  using public.purchases b
  where a.id < b.id and a.reference = b.reference and a.reference is not null;
`);
console.log('dedup:', dedup);

const add = await runSql(`
  do $$
  begin
    if not exists (
      select 1 from pg_constraint c
      join pg_class t on t.oid = c.conrelid
      join pg_namespace n on n.oid = t.relnamespace
      where t.relname = 'purchases' and n.nspname = 'public' and c.contype = 'u'
    ) then
      alter table public.purchases add constraint purchases_reference_unique unique (reference);
    end if;
  end $$;
`);
console.log('add-constraint:', add);

// verify the constraint exists
const { data, error } = await supa.from('purchases').select('reference').limit(1);
console.log('verify select:', error ?? 'select ok', '| sample:', JSON.stringify(data));
