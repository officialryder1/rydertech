// Applies DDL via Supabase Management API (SQL endpoint) using the PAT.
import { readFileSync } from 'node:fs';

const env = {};
for (const l of readFileSync('.env', 'utf-8').replace(/\r/g, '').split('\n')) if (l.includes('=')) env[l.split('=')[0]] = l.split('=').slice(1).join('=').trim();
const REF = 'ddwwwqxhqdzbaeswenny';
const PAT = env.SUPABASE_ACCESS_TOKEN;

const sql = `
  -- Backfill dedup (keep lowest id per reference)
  delete from public.purchases a
  using public.purchases b
  where a.id < b.id and a.reference = b.reference and a.reference is not null;

  -- Add unique constraint on reference (idempotent)
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
`;

const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${PAT}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: sql })
});
const txt = await r.text();
console.log('HTTP', r.status);
console.log(txt.slice(0, 500));
