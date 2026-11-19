import { createSupabaseAdminClient } from '$lib/supabase/server';
import { json } from '@sveltejs/kit';

export async function GET() {
  const admin = createSupabaseAdminClient();

  try {
    // Total enrolled
    const { count: totalEnrolled, error: countError } = await admin
      .from('nurture_state')
      .select('*', { count: 'exact', head: true });

    // Active sequences (not completed)
    const { count: activeSequences, error: activeError } = await admin
      .from('nurture_state')
      .select('*', { count: 'exact', head: true })
      .lt('touches_sent', '[1,2,3]');

    // Touches sent in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    const { data: recentLogs, error: logError } = await admin
      .from('nurture_send_log')
      .select('id', { count: 'exact' })
      .gte('sent_at', thirtyDaysAgo);

    // Completed sequences
    const { count: completed, error: completedError } = await admin
      .from('nurture_state')
      .select('*', { count: 'exact', head: true })
      .gte('touches_sent', '[1,2,3]');

    return json({
      success: true,
      data: {
        totalEnrolled: totalEnrolled || 0,
        activeSequences: activeSequences || 0,
        touchesSent30d: recentLogs?.length || 0,
        completed: completed || 0
      }
    });
  } catch (e: unknown) {
    console.error('Nurture stats error:', e);
    return json({ success: false, error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}