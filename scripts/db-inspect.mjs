import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = {};
for (const l of readFileSync('.env', 'utf-8').replace(/\r/g, '').split('\n')) {
  if (l.includes('=')) env[l.split('=')[0]] = l.split('=').slice(1).join('=').trim();
}
const URL = env.PUBLIC_SUPABASE_URL, SR = env.SUPABASE_SERVICE_ROLE_KEY;
const admin = createClient(URL, SR, { auth: { autoRefreshToken: false, persistSession: false } });

for (const t of ['profiles', 'purchases', 'course_videos']) {
  const { count, error } = await admin.from(t).select('*', { count: 'exact', head: true });
  console.log(t, '-> rows:', count, error ? 'ERR ' + error.message : '');
}
const { data: vids } = await admin.from('course_videos').select('course_slug,youtube_id,title');
console.log('course_videos:', JSON.stringify(vids));
const { data: profs } = await admin.from('profiles').select('email');
console.log('profiles:', JSON.stringify(profs));
