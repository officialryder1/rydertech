// Probes the exact Supabase cookie name/value so we can replay a real session
// against the live prod /api/paystack/verify endpoint.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = {};
for (const l of readFileSync('.env', 'utf-8').replace(/\r/g, '').split('\n')) {
  if (l.includes('=')) env[l.split('=')[0]] = l.split('=').slice(1).join('=').trim();
}
const URL = env.PUBLIC_SUPABASE_URL, ANON = env.PUBLIC_SUPABASE_ANON_KEY;
const supa = createClient(URL, ANON, { auth: { autoRefreshToken: false, persistSession: false } });
const { data: auth, error } = await supa.auth.signInWithPassword({ email: 'testcheckout@rydertech.ng', password: 'Test1234!' });
if (error) { console.log('AUTH ERR', error.message); process.exit(1); }
const session = auth.session;
const project = URL.match(/https:\/\/([^.]+)\.supabase\.co/)[1];

// @supabase/ssr stores the cookie as JSON of the session under name sb-<project>-auth-token.
// It JSON.stringifies the FULL session object (access_token, refresh_token, token_type, expires_in, user, etc).
const cookieName = `sb-${project}-auth-token`;
const cookieValJson = JSON.stringify(session);

// Test 1: raw JSON (what browser sends)
// Test 2: @supabase/ssr actually stores it base64-encoded? Let's try both.
const testCases = [
  ['raw-json', cookieValJson],
  ['url-encoded', encodeURIComponent(cookieValJson)],
  ['base64', Buffer.from(cookieValJson).toString('base64')],
];

for (const [label, val] of testCases) {
  const r = await fetch('https://www.rydertech.ng/api/paystack/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: `${cookieName}=${val}` },
    body: JSON.stringify({ reference: 'ryd_probe_' + Date.now() })
  });
  const txt = await r.text();
  console.log(`${label} -> HTTP ${r.status} :: ${txt.slice(0, 120)}`);
}
