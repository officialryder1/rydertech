import { createSupabaseAdminClient } from '$lib/supabase/server';
import { json, error } from '@sveltejs/kit';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'kennethvic07@gmail.com,rydertech.ng@gmail.com,victorkenneth9@gmail.com')
  .split(',')
  .map(e => e.trim());

async function requireAdmin(locals: any) {
  const user = locals.user;
  if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
    throw error(403, 'Unauthorized');
  }
}

export async function GET({ locals }) {
  await requireAdmin(locals);
  const admin = createSupabaseAdminClient();

  try {
    const { data, error } = await admin
      .from('nurture_send_log')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return json({ success: true, data: data || [] });
  } catch (e: unknown) {
    console.error('Nurture send log error:', e);
    return json({ success: false, error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}