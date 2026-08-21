// Tests the live reference round-trip on PROD to see if /api/paystack/verify
// correctly talks to Paystack for a real (unpaid yet) transaction.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = {};
for (const l of readFileSync('.env', 'utf-8').replace(/\r/g, '').split('\n')) {
  if (l.includes('=')) env[l.split('=')[0]] = l.split('=').slice(1).join('=').trim();
}
const URL = env.PUBLIC_SUPABASE_URL, ANON = env.PUBLIC_SUPABASE_ANON_KEY;
const supa = createClient(URL, ANON, { auth: { autoRefreshToken: false, persistSession: false } });
const { data: auth } = await supa.auth.signInWithPassword({ email: 'testcheckout@rydertech.ng', password: 'Test1234!' });
const session = auth.session;
const project = URL.match(/https:\/\/([^.]+)\.supabase\.co/)[1];
const cookie = `sb-${project}-auth-token=${JSON.stringify(session)}`;

// 1) initialize a real transaction on prod
const ref = 'ryd_diag_' + Date.now();
const init = await fetch('https://www.rydertech.ng/api/paystack/initialize', {
  method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie },
  body: JSON.stringify({ email: 'testcheckout@rydertech.ng', courseSlug: 'ai-automation-mastery', reference: ref })
});
const initJ = await init.json();
console.log('initialize:', init.status, JSON.stringify(initJ).slice(0, 200));
const authUrl = initJ.authorization_url || '';
console.log('authUrl contains our ref?', authUrl.includes(ref), '| raw url:', authUrl.slice(0, 90));

// 2) verify with that ref (should be paid:false, NOT error)
const v = await fetch('https://www.rydertech.ng/api/paystack/verify', {
  method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie },
  body: JSON.stringify({ reference: ref })
});
const vJ = await v.json();
console.log('verify(unpaid):', v.status, JSON.stringify(vJ).slice(0, 200));
