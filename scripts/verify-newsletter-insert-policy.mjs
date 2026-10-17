// Verify the newsletter_subscriptions INSERT policy from the CLIENT path.
// Run from the repo root:  node scripts/verify-newsletter-insert-policy.mjs
//   exit 0 = policy live (anon INSERT accepted, row confirmed, anon SELECT still denied)
//   exit 2 = still blocked (RLS rejects the insert)
//   exit 3 = RLS LEAK (anon can read the lead list) - treat as an incident
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
}
const { PUBLIC_SUPABASE_URL: URL, PUBLIC_SUPABASE_ANON_KEY: ANON, SUPABASE_SERVICE_ROLE_KEY: SVC } = env;
if (!URL || !ANON || !SVC) { console.error('MISSING ENV (need PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)'); process.exit(1); }

const anon = createClient(URL, ANON, { auth: { persistSession: false, autoRefreshToken: false } });
const admin = createClient(URL, SVC, { auth: { persistSession: false, autoRefreshToken: false } });
const email = `verify-findingsng-${Date.now()}@example.com`;

// 1. the exact browser payload from /labs/ops-drain with the FindingsNg box ticked
const { data: ins, error: insErr, status } = await anon
  .from('newsletter_subscriptions')
  .insert([{
    email,
    source: 'lead_magnet_ops_drain',
    subscribed_at: new Date().toISOString(),
    lead_score: 78,
    lead_tier: 'hot',
    lead_source: '/labs/ops-drain',
    lead_tags: ['findingsng'],
  }])
  .select();
console.log(`1. ANON INSERT: status=${status} ${insErr ? `ERR ${insErr.code} ${insErr.message}` : `OK rows=${ins?.length}`}`);
if (insErr) {
  console.log('RESULT: BLOCKED - the policy is not live. Touch 1 stays gated.');
  process.exit(2);
}

// 2. service-role confirm
const { data: conf } = await admin.from('newsletter_subscriptions')
  .select('id,email,lead_tags,lead_score,lead_segment').eq('email', email);
console.log('2. SERVICE-ROLE READ:', JSON.stringify(conf));

// 3. the segment query the admin dashboard runs
const { data: seg } = await admin.from('newsletter_subscriptions')
  .select('id,email').contains('lead_tags', ['findingsng']);
console.log(`3. SEGMENT lead_tags @> ['findingsng']: count=${seg?.length ?? 0} | test row present=${seg?.some(r => r.email === email) ?? false}`);

// 4. anon must still be unable to read leads
const { data: sel, error: selErr, status: selStatus } = await anon
  .from('newsletter_subscriptions').select('id,email').eq('email', email);
if (!selErr && sel && sel.length > 0) {
  console.log(`4. ANON SELECT: status=${selStatus} rows=${sel.length}  *** RLS LEAK ***`);
  await admin.from('newsletter_subscriptions').delete().eq('email', email);
  process.exit(3);
}
console.log(`4. ANON SELECT: status=${selStatus} denied (${selErr?.code ?? 'no rows'}) - leads still unreadable`);

// 5. cleanup
const { error: delErr } = await admin.from('newsletter_subscriptions').delete().eq('email', email);
const { data: after } = await admin.from('newsletter_subscriptions').select('id').eq('email', email);
console.log(`5. CLEANUP: ${delErr?.message ?? 'ok'} | rows remaining=${after?.length ?? '?'}`);
console.log('RESULT: POLICY LIVE - touch 1 is clear.');
