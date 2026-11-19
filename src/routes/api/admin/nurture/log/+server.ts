import { createSupabaseAdminClient } from '$lib/supabase/server';
import { json } from '@sveltejs/kit';

export async function GET() {
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