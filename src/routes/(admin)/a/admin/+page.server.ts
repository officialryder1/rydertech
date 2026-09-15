import { createSupabaseAdminClient } from '$lib/supabase/server';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

// Pull admin emails from env (comma-separated), consistent with +layout.server.ts
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'kennethvic07@gmail.com,rydertech.ng@gmail.com,victorkenneth9@gmail.com')
  .split(',')
  .map(e => e.trim());

// --- AI Lead Scoring ---
// Weights: budget 60%, tool referral 25%, company presence 15%
const HIGH_VALUE_TOOLS = new Set(['revleak', 'ops-drain', 'event-access-risk', 'gateway-calc']);
const MODERATE_TOOLS = new Set(['cost-estimator', 'website-rater', 'gpt-6-checker']);
const LOW_VALUE_TOOLS = new Set(['headline-studio', 'content-repurposer']);

function scoreBudget(budget?: string | null): number {
  if (!budget) return 10;
  const b = budget.toLowerCase();
  if (b.includes('15m+')) return 60;
  if (b.includes('5m') && b.includes('15m')) return 50;
  if (b.includes('1.5m') && b.includes('5m')) return 40;
  if (b.includes('500k') && b.includes('1.5m')) return 30;
  if (b.includes('150k') && b.includes('500k')) return 20;
  return 10;
}

function scoreToolReferral(leadSource?: string): number {
  if (!leadSource) return 5;
  const toolMatch = leadSource.match(/tool=([a-z0-9-]+)/);
  if (!toolMatch) {
    if (leadSource.includes('blog')) return 10;
    return 5;
  }
  const tool = toolMatch[1];
  if (HIGH_VALUE_TOOLS.has(tool)) return 25;
  if (MODERATE_TOOLS.has(tool)) return 15;
  if (LOW_VALUE_TOOLS.has(tool)) return 10;
  return 5;
}

function scoreCompany(company?: string | null): number {
  if (!company || company.trim() === '') return 5;
  return 15;
}

function scoreLead(submission: { budget?: string; company?: string; lead_source?: string }): { lead_score: number; lead_segment: 'hot' | 'warm' | 'cold' } {
  const total = Math.min(100, scoreBudget(submission.budget) + scoreToolReferral(submission.lead_source) + scoreCompany(submission.company));
  let segment: 'hot' | 'warm' | 'cold';
  if (total >= 70) segment = 'hot';
  else if (total >= 40) segment = 'warm';
  else segment = 'cold';
  return { lead_score: total, lead_segment: segment };
}

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

  const submissions = (contactSubmissions || []).map(sub => ({
    ...sub,
    ...scoreLead(sub),
  })).sort((a, b) => {
    // Sort by lead_score desc, then by submitted_at desc
    if (b.lead_score !== a.lead_score) return b.lead_score - a.lead_score;
    return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
  });
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
