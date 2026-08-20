// Proves the enrollment fix: admin client can INSERT purchases (RLS bypass),
// user-session client CANNOT (the bug). Run against live Supabase.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = {};
for (const l of readFileSync('.env', 'utf-8').replace(/\r/g, '').split('\n')) {
  if (l.includes('=')) env[l.split('=')[0]] = l.split('=').slice(1).join('=').trim();
}
const URL = env.PUBLIC_SUPABASE_URL, ANON = env.PUBLIC_SUPABASE_ANON_KEY, SR = env.SUPABASE_SERVICE_ROLE_KEY;

// 1) create a throwaway test user
const admin = createClient(URL, SR, { auth: { autoRefreshToken: false, persistSession: false } });
const email = `probe_${Date.now()}@rydertech.ng`;
const { data: u, error: ue } = await admin.auth.admin.createUser({ email, password: 'Probe1234!', email_confirm: true });
if (ue) { console.log('user create error:', ue.message); process.exit(1); }
const uid = u.user.id;
console.log('test user:', uid);

// 2) user-session client (RLS ON) — should FAIL to insert (the old bug)
const user = createClient(URL, ANON, { auth: { autoRefreshToken: false, persistSession: false } });
const { error: signErr } = await user.auth.signInWithPassword({ email, password: 'Probe1234!' });
const { error: rlsErr } = await user.from('purchases').insert({ user_id: uid, course_slug: 'ai-automation-mastery', amount_ngn: 1, status: 'paid', reference: 'probe_rls_' + uid });
console.log('USER-SESSION insert error (expected, proves RLS blocks it):', rlsErr ? rlsErr.message : 'NONE (unexpected!)');

// 3) admin client — should SUCCEED (the fix)
const { error: adminErr } = await admin.from('purchases').insert({ user_id: uid, course_slug: 'ai-automation-mastery', amount_ngn: 1, status: 'paid', reference: 'probe_admin_' + uid });
console.log('ADMIN insert error (expected NONE):', adminErr ? adminErr.message : 'NONE ✓');

// cleanup
await admin.from('purchases').delete().eq('reference', 'probe_admin_' + uid);
await admin.auth.admin.deleteUser(uid);
console.log('cleanup done');
