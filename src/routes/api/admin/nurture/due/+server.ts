import { createSupabaseAdminClient } from '$lib/supabase/server';
import { json } from '@sveltejs/kit';

export async function GET() {
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