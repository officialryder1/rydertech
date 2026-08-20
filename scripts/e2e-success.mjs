// E2E: /checkout/success renders "You're enrolled" for a paid user.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(dir, '..');
const env = {};
for (const l of readFileSync(resolve(root, '.env'), 'utf8').replace(/\r/g, '').split('\n')) {
  const m = l.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const URL = env.PUBLIC_SUPABASE_URL;
const ANON = env.PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
const TEST_EMAIL = `qa_${Date.now()}@rydertech.ng`;
const COURSE = 'ai-automation-mastery';
const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });
const anon = createClient(URL, ANON, { auth: { persistSession: false } });
const ref = URL.replace('https://', '').split('.')[0];

function mintCookie(session) {
  const val = encodeURIComponent(JSON.stringify({
    access_token: session.access_token, refresh_token: session.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer', user: session.user
  }));
  return `sb-${ref}-auth-token=${val}`;
}
let userId;
try {
  const { data: u } = await admin.auth.admin.createUser({ email: TEST_EMAIL, password: 'QaTest!123', email_confirm: true });
  userId = u.user.id;
  await admin.from('purchases').insert({ user_id: userId, course_slug: COURSE, amount_ngn: 80000, provider: 'paystack', reference: `e2e_${Date.now()}`, status: 'paid', paid_at: new Date().toISOString() });
  const { data: sign } = await anon.auth.signInWithPassword({ email: TEST_EMAIL, password: 'QaTest!123' });
  const cookie = mintCookie(sign.session);
  const res = await fetch(`http://localhost:5173/checkout/success?course=${COURSE}&reference=ryd_test`, { headers: { cookie } });
  const html = await res.text();
  const ok = res.status === 200 && html.includes("You're enrolled");
  console.log('paid user /checkout/success ->', res.status, ok ? 'ENROLLED ✓' : 'BROKEN ✗');
  if (!ok) console.log(html.slice(0, 200));
} catch (e) {
  console.error('E2E ERROR:', e.message);
  process.exitCode = 1;
} finally {
  if (userId) {
    await admin.from('purchases').delete().eq('user_id', userId);
    await admin.auth.admin.deleteUser(userId);
    console.log('cleanup done');
  }
}
