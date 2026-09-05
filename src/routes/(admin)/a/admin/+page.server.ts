import { createSupabaseAdminClient } from '$lib/supabase/server';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

// Pull admin emails from env (comma-separated), consistent with +layout.server.ts
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'kennethvic07@gmail.com,rydertech.ng@gmail.com,victorkenneth9@gmail.com')
  .split(',')
  .map(e => e.trim());

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user;

  if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
    throw error(403, 'Unauthorized');
  }

  const admin = createSupabaseAdminClient();

  const [
    { data: contactSubmissions, error: contactError },
    { data: newsletterSubs, error: newsletterError },
    { data: leadMagnets, error: magnetError },
    { data: profiles, error: profilesError }
  ] = await Promise.all([
    admin.from('contact_submissions').select('*').order('submitted_at', { ascending: false }),
    admin.from('newsletter_subscriptions').select('*').order('subscribed_at', { ascending: false }),
    admin.from('lead_magnets').select('*').order('captured_at', { ascending: false }),
    admin.from('profiles').select('*').order('created_at', { ascending: false })
  ]);

  if (contactError) console.error('Failed to fetch contact submissions:', contactError);
  if (newsletterError) console.error('Failed to fetch newsletter subs:', newsletterError);
  if (magnetError) console.error('Failed to fetch lead magnets:', magnetError);
  if (profilesError) console.error('Failed to fetch profiles:', profilesError);

  const now = new Date();
  const last7days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const submissions = contactSubmissions || [];
  const newsletters = newsletterSubs || [];
  const magnets = leadMagnets || [];

  const stats = {
    totalSubmissions: submissions.length,
    totalSubscribers: newsletters.length,
    totalMagnets: magnets.length,
    totalUsers: (profiles || []).length,
    weeklySubmissions: submissions.filter(s => new Date(s.submitted_at) >= last7days).length,
    weeklySubscribers: newsletters.filter(s => new Date(s.subscribed_at) >= last7days).length,
    weeklyMagnets: magnets.filter(s => new Date(s.captured_at) >= last7days).length,
    monthlySubmissions: submissions.filter(s => new Date(s.submitted_at) >= last30days).length,
    monthlySubscribers: newsletters.filter(s => new Date(s.subscribed_at) >= last30days).length,
    monthlyMagnets: magnets.filter(s => new Date(s.captured_at) >= last30days).length,
    pendingSubmissions: submissions.filter(s => s.status === 'new').length,
    contactedSubmissions: submissions.filter(s => s.status === 'contacted').length,
    repliedSubmissions: submissions.filter(s => s.status === 'replied').length,
    closedSubmissions: submissions.filter(s => s.status === 'closed').length
  };

  return {
    user,
    stats,
    submissions,
    newsletters,
    magnets,
    profiles: profiles || []
  };
};

export const actions: Actions = {
  updateStatus: async ({ request, locals }) => {
    if (!locals.user || !locals.user.email || !ADMIN_EMAILS.includes(locals.user.email)) {
      throw error(403, 'Unauthorized');
    }

    const formData = await request.formData();
    const id = formData.get('id') as string;
    const status = formData.get('status') as string;

    if (!id || !status) {
      return fail(400, { message: 'Missing id or status' });
    }

    const validStatuses = ['new', 'contacted', 'replied', 'closed'];
    if (!validStatuses.includes(status)) {
      return fail(400, { message: 'Invalid status' });
    }

    const admin = createSupabaseAdminClient();
    const { error: updateError } = await admin
      .from('contact_submissions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) {
      console.error('Failed to update submission status:', updateError);
      return fail(500, { message: 'Failed to update status' });
    }

    return { success: true };
  }
};
