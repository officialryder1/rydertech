// Decisive test: is the user's actual transaction PAID or abandoned?
// Calls the LIVE prod /api/paystack/verify with the real reference + a real session.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = {};
for (const l of readFileSync('.env', 'utf-8').replace(/\r/g, '').split('\n')) if (l.includes('=')) env[l.split('=')[0]] = l.split('=').slice(1).join('=').trim();
const supa = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
const { data: auth } = await supa.auth.signInWithPassword({ email: 'testcheckout@rydertech.ng', password: 'Test1234!' });
const session = auth.session;
const project = env.PUBLIC_SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)[1];
const cookie = `sb-${project}-auth-token=${JSON.stringify(session)}`;

const REF = 'ryd_ai-automation-mastery_1787308257200';
const r = await fetch('https://www.rydertech.ng/api/paystack/verify', {
  method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie },
  body: JSON.stringify({ reference: REF })
});
const j = await r.json();
console.log('verify status:', r.status);
console.log('verify body:', JSON.stringify(j, null, 2).slice(0, 400));
