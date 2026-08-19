// E2E proof: gated /learn route unlocks for a paid purchaser on the live dev server.
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
const TEST_PASS = 'QaTest!123';
const COURSE = 'ai-automation-mastery';

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });
const anon = createClient(URL, ANON, { auth: { persistSession: false } });

function mintCookie(ref, session) {
  const val = encodeURIComponent(JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: session.user
  }));
  return `sb-${ref}-auth-token=${val}`;
}

const ref = URL.replace('https://', '').split('.')[0];
let userId;
try {
  // 1. create QA user
  const { data: u, error: ce } = await admin.auth.admin.createUser({
    email: TEST_EMAIL, password: TEST_PASS, email_confirm: true
  });
  if (ce) throw ce;
  userId = u.user.id;
  console.log('1. QA user created:', userId.slice(0, 8));

  // 2. insert paid purchase
  const { error: pe } = await admin.from('purchases').insert({
    user_id: userId, course_slug: COURSE, amount_ngn: 80000,
    provider: 'paystack', reference: `e2e_${Date.now()}`, status: 'paid', paid_at: new Date().toISOString()
  });
  if (pe) throw pe;
  console.log('2. paid purchase inserted');

  // 3. insert a course video
  const { error: ve } = await admin.from('course_videos').insert({
    course_slug: COURSE, youtube_id: 'dQw4w9WgXcQ', title: 'Lesson 1 (test)', position: 0
  });
  if (ve) throw ve;
  console.log('3. course_videos row inserted');

  // 4. sign in as the QA user
  const { data: sign, error: se } = await anon.auth.signInWithPassword({ email: TEST_EMAIL, password: TEST_PASS });
  if (se) throw se;
  const cookie = mintCookie(ref, sign.session);

  // 5. fetch /learn as the paid user
  const res = await fetch('http://localhost:5173/learn/ai-automation-mastery', { headers: { cookie } });
  const html = await res.text();
  const ok = res.status === 200 && html.includes('youtube-nocookie.com/embed/dQw4w9WgXcQ');
  console.log('4. /learn as paid user -> HTTP', res.status, ok ? 'UNLOCKED ✓' : 'BLOCKED ✗');
  if (!ok) { console.log(html.slice(0, 300)); }

  // 6. anon should 302
  const anonRes = await fetch('http://localhost:5173/learn/ai-automation-mastery');
  console.log('5. /learn as anon -> HTTP', anonRes.status, anonRes.status === 302 ? 'REDIRECTED ✓' : 'NOT REDIRECTED ✗');
} catch (e) {
  console.error('E2E ERROR:', e.message);
  process.exitCode = 1;
} finally {
  if (userId) {
    await admin.from('course_videos').delete().eq('course_slug', COURSE);
    await admin.from('purchases').delete().eq('user_id', userId);
    await admin.auth.admin.deleteUser(userId);
    console.log('6. cleanup done (user + rows deleted)');
  }
}
