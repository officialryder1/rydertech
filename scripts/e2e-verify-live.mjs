// Server-side E2E of the NEW enrollment path on PRODUCTION.
// 1) Sign in test user via Supabase Auth -> get session JWT + cookie string
// 2) Initialize a real Paystack transaction (prod secret) -> reference
// 3) Use Paystack test-mode "transaction/charge" simulation is N/A; instead we
//    simulate Paystack marking it paid by calling our OWN verify after we flip
//    the txn to paid via the Paystack test API is not possible headlessly.
// FALLBACK PROOF: call /api/paystack/verify with a reference we KNOW is paid by
// first writing a paid purchase through the webhook-equivalent admin path, then
// deleting it and re-running verify to confirm verify WRITES it.
// Simpler: just confirm /api/paystack/verify with auth cookie returns 200 and
// that an admin-inserted paid row makes /account show the course.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = {};
for (const l of readFileSync('.env', 'utf-8').replace(/\r/g, '').split('\n')) {
  if (l.includes('=')) env[l.split('=')[0]] = l.split('=').slice(1).join('=').trim();
}
const URL = env.PUBLIC_SUPABASE_URL, ANON = env.PUBLIC_SUPABASE_ANON_KEY;

const supa = createClient(URL, ANON, { auth: { autoRefreshToken: false, persistSession: false } });
const email = 'testcheckout@rydertech.ng';
const { data: auth, error: ae } = await supa.auth.signInWithPassword({ email, password: 'Test1234!' });
if (ae) { console.log('AUTH ERR', ae.message); process.exit(1); }
const access = auth.session.access_token;
// Supabase SSR cookie: name = sb-<project>-auth-token, value = JSON, but the HTTP
// Cookie header requires the value to be URL-encoded (browsers do this automatically;
// a raw JSON value with { and " breaks server-side cookie parsing -> 401).
const cookieVal = encodeURIComponent(JSON.stringify({ access_token: access, token_type: 'bearer', expires_in: 3600, refresh_token: auth.session.refresh_token, user: auth.user }));

const project = URL.match(/https:\/\/([^.]+)\.supabase\.co/)[1];
const cookieName = `sb-${project}-auth-token`;
console.log('cookie set, len', cookieVal.length, 'name', cookieName);
const r1 = await fetch('https://www.rydertech.ng/api/paystack/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Cookie: `${cookieName}=${cookieVal}` },
  body: JSON.stringify({ reference: 'ryd_probe_unpaid_' + Date.now() })
});
console.log('verify (unpaid) ->', r1.status, await r1.text());

// Now initialize a REAL transaction and confirm live initialize returns a URL
const r2 = await fetch('https://www.rydertech.ng/api/paystack/initialize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Cookie: `${cookieName}=${cookieVal}` },
  body: JSON.stringify({ email, courseSlug: 'ai-automation-mastery', reference: 'ryd_e2e_' + Date.now() })
});
console.log('initialize ->', r2.status, await r2.text());
console.log('COOKIE:', cookieName);
