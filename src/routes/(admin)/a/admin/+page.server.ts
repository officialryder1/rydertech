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

// --- Tier classification from lead_score (hot/warm/cold naming) ---
function classifyTier(score: number | null | undefined): 'hot' | 'warm' | 'cold' {
  if (score == null) return 'cold';
  if (score >= 70) return 'hot';
  if (score >= 40) return 'warm';
  return 'cold';
}

// --- ISO week key for weekly accumulation ---
function weekKey(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay() || 7; // Sunday -> 7
  d.setDate(d.getDate() - day + 1); // Monday of this ISO week
  return d.toISOString().slice(0, 10);
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
    { data: profiles, error: profilesError },
    { data: findingsngSubs, error: findingsngError },
    { data: vendors, error: vendorsError },
    { data: pricingTiers, error: pricingError },
    { data: benchmarks, error: benchmarksError }
  ] = await Promise.all([
    admin.from('contact_submissions').select('*').order('submitted_at', { ascending: false }),
    admin.from('newsletter_subscriptions').select('*').order('subscribed_at', { ascending: false }),
    admin.from('profiles').select('*').order('created_at', { ascending: false }),
    // Card 1: FindingsNg segment — lead_tags @> ARRAY['findingsng']
    admin.from('newsletter_subscriptions')
      .select('*')
      .contains('lead_tags', ['findingsng'])
      .order('subscribed_at', { ascending: false }),
    // Card 2: Vendor intelligence
    admin.from('vendors').select('*').order('name', { ascending: true }),
    admin.from('pricing_tiers')
      .select('*, vendors(name, slug, website_url, status, category)')
      .order('vendor_id', { ascending: true }),
    admin.from('benchmarks')
      .select('*, vendor_benchmarks(value, is_verified, verified_date)')
      .order('metric_name', { ascending: true })
  ]);

  if (contactError) console.error('Failed to fetch contact submissions:', contactError);
  if (newsletterError) console.error('Failed to fetch newsletter subs:', newsletterError);
  if (profilesError) console.error('Failed to fetch profiles:', profilesError);
  if (findingsngError) console.error('Failed to fetch FindingsNg subs:', findingsngError);
  if (vendorsError) console.error('Failed to fetch vendors:', vendorsError);
  if (pricingError) console.error('Failed to fetch pricing tiers:', pricingError);
  if (benchmarksError) console.error('Failed to fetch benchmarks:', benchmarksError);

  const now = new Date();
  const last7days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const submissions = (contactSubmissions || []).map(sub => ({
    ...sub,
    ...scoreLead(sub),
  })).sort((a, b) => {
    if (b.lead_score !== a.lead_score) return b.lead_score - a.lead_score;
    return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
  });
  const newsletters = newsletterSubs || [];

  // For labs lead-magnet subs that already have a client-side lead_score,
  // ensure lead_segment is populated (hot/warm/cold) so the UI can filter.
  const newslettersWithSegment = newsletters.map(n => {
    if (n.lead_score != null && !n.lead_segment) {
      return { ...n, lead_segment: classifyTier(n.lead_score) };
    }
    return n;
  });

  // FIX dual-column drift: labs routes write to `lead_source`, the Lead Magnets
  // tab filters on `source`. Union both columns so no captures are lost.
  const magnets = (newslettersWithSegment || []).filter(n =>
    String(n.source || '').startsWith('lead_magnet_') ||
    String(n.lead_source || '').startsWith('lead_magnet_')
  );

  // ================================================================
  // Card 1: FindingsNg segment
  // ================================================================
  const fnSubs = findingsngSubs || [];
  const fnTotal = fnSubs.length;

  // Tier breakdown (hot/warm/cold from lead_score)
  const fnHot = fnSubs.filter(s => classifyTier(s.lead_score) === 'hot').length;
  const fnWarm = fnSubs.filter(s => classifyTier(s.lead_score) === 'warm').length;
  const fnCold = fnSubs.filter(s => classifyTier(s.lead_score) === 'cold').length;

  // Per-source breakdown (union source + lead_source like the magnets fix)
  const fnPerSource: Record<string, number> = {};
  for (const s of fnSubs) {
    const src = String(s.source || s.lead_source || 'unknown');
    fnPerSource[src] = (fnPerSource[src] || 0) + 1;
  }

  // Last-touch: most recent subscribed_at
  const fnLastTouch = fnSubs.length > 0
    ? fnSubs.reduce((latest, s) => {
        const d = new Date(s.subscribed_at);
        return d > latest ? d : latest;
      }, new Date(fnSubs[0].subscribed_at))
    : null;

  // Weekly accumulation: count per ISO week (last 8 weeks)
  const fnWeeklyMap: Record<string, number> = {};
  for (const s of fnSubs) {
    const wk = weekKey(s.subscribed_at);
    fnWeeklyMap[wk] = (fnWeeklyMap[wk] || 0) + 1;
  }
  // Sort weeks ascending and take last 8
  const fnWeeklySorted = Object.entries(fnWeeklyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8);

  const findingsngStats = {
    total: fnTotal,
    hot: fnHot,
    warm: fnWarm,
    cold: fnCold,
    perSource: fnPerSource,
    lastTouch: fnLastTouch ? fnLastTouch.toISOString() : null,
    weekly: fnWeeklySorted
  };

  // ================================================================
  // Card 2: Vendor intelligence
  // ================================================================
  const vendorList = vendors || [];
  const tierList = pricingTiers || [];
  const benchmarkList = benchmarks || [];

  // Verified counts for pattern-lock badges
  const verifiedTiers = tierList.filter(t => t.is_verified).length;
  const unverifiedTiers = tierList.filter(t => !t.is_verified).length;
  const verifiedBenchmarks = benchmarkList.filter(b =>
    (b as unknown as { vendor_benchmarks?: { is_verified: boolean }[] }).vendor_benchmarks?.some(vb => vb.is_verified)
  ).length;

  const vendorStats = {
    totalVendors: vendorList.length,
    totalTiers: tierList.length,
    verifiedTiers,
    unverifiedTiers,
    totalBenchmarks: benchmarkList.length,
    verifiedBenchmarks
  };

  const stats = {
    totalSubmissions: submissions.length,
    totalSubscribers: newslettersWithSegment.length,
    totalMagnets: magnets.length,
    totalUsers: (profiles || []).length,
    weeklySubmissions: submissions.filter(s => new Date(s.submitted_at) >= last7days).length,
    weeklySubscribers: newslettersWithSegment.filter(s => new Date(s.subscribed_at) >= last7days).length,
    weeklyMagnets: magnets.filter(s => new Date(s.subscribed_at) >= last7days).length,
    monthlySubmissions: submissions.filter(s => new Date(s.submitted_at) >= last30days).length,
    monthlySubscribers: newslettersWithSegment.filter(s => new Date(s.subscribed_at) >= last30days).length,
    monthlyMagnets: magnets.filter(s => new Date(s.subscribed_at) >= last30days).length,
    pendingSubmissions: submissions.filter(s => s.status === 'new').length,
    contactedSubmissions: submissions.filter(s => s.status === 'contacted').length,
    repliedSubmissions: submissions.filter(s => s.status === 'replied').length,
    closedSubmissions: submissions.filter(s => s.status === 'closed').length
  };

  return {
    user,
    stats,
    submissions,
    newsletters: newslettersWithSegment,
    magnets,
    profiles: profiles || [],
    findingsng: {
      stats: findingsngStats,
      subs: fnSubs
    },
    vendors: {
      stats: vendorStats,
      list: vendorList,
      tiers: tierList,
      benchmarks: benchmarkList
    }
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
