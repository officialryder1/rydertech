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
      .from('nurture_state')
      .select('*')
      .order('captured_at', { ascending: false });

    if (error) throw error;

    // Enrich with computed fields
    const enriched = (data || []).map(lead => {
      const touchesSent = lead.touches_sent || [];
      let nextTouch = null;
      if (!touchesSent.includes(1)) nextTouch = 1;
      else if (!touchesSent.includes(2)) nextTouch = 2;
      else if (!touchesSent.includes(3)) nextTouch = 3;

      const daysSinceCapture = Math.floor((Date.now() - new Date(lead.captured_at).getTime()) / 86400000);

      return {
        ...lead,
        nextTouch,
        daysSinceCapture
      };
    });

    return json({ success: true, data: enriched });
  } catch (e: unknown) {
    console.error('Nurture leads error:', e);
    return json({ success: false, error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}