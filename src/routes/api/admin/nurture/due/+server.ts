import { createSupabaseAdminClient } from '$lib/supabase/server';
import { json } from '@sveltejs/kit';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'kennethvic07@gmail.com,rydertech.ng@gmail.com,victorkenneth9@gmail.com')
  .split(',')
  .map(e => e.trim());

async function requireAdmin(locals: any) {
  const user = locals.user;
  if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
    return json({ success: false, error: 'Unauthorized' }, { status: 403 });
  }
}

export async function GET({ locals }) {
  const auth = await requireAdmin(locals);
  if (auth) return auth;
  const admin = createSupabaseAdminClient();

  try {
    // Use the database function to get due leads
    const { data, error } = await admin.rpc('get_due_nurture_leads');

    if (error) throw error;

    return json({ success: true, data: data || [] });
  } catch (e: unknown) {
    console.error('Due nurture touches error:', e);
    return json({ success: false, error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}