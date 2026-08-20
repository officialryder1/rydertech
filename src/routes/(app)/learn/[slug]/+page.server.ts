import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { createSupabaseAdminClient } from '$lib/supabase/server';
import { courseBySlug } from '$lib/courses';
import type { PageServerLoad } from './$types';

// If a paid user lands on /learn with ?verify=<ref> but has no purchase row yet,
// enroll them from the verified Paystack transaction. Guarantees access even if
// the webhook was delayed or never fired. Writes via ADMIN client (purchases has
// no INSERT RLS policy).
async function selfEnroll(admin: any, user: any, reference: string, courseSlug: string) {
  if (!env.PAYSTACK_SECRET_KEY || !reference) return false;
  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}` }
  });
  const j = await res.json().catch(() => ({}));
  const tx = j?.data;
  if (j?.status !== true || tx?.status !== 'success') return false;
  if ((tx.metadata?.course_slug ?? '') !== courseSlug) return false;
  const { error: insErr } = await admin.from('purchases').upsert(
    {
      user_id: user.id,
      course_slug: courseSlug,
      amount_ngn: Math.round((tx.amount ?? 0) / 100),
      provider: 'paystack',
      reference,
      status: 'paid',
      paid_at: new Date().toISOString()
    },
    { onConflict: 'reference' }
  );
  return !insErr;
}

export const load: PageServerLoad = async ({ params, url, locals }) => {
  const course = courseBySlug(params.slug);
  if (!course) throw error(404, 'Course not found');

  const supabase = locals.supabase;
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    throw redirect(302, `/login?redirect=${encodeURIComponent(url.pathname)}`);
  }

  // Self-enroll on first paid visit (recovery path).
  const verifyRef = url.searchParams.get('verify');
  if (verifyRef) {
    const admin = createSupabaseAdminClient();
    await selfEnroll(admin, user, verifyRef, params.slug);
  }

  const { data: purchase } = await supabase
    .from('purchases')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_slug', params.slug)
    .eq('status', 'paid')
    .maybeSingle();

  if (!purchase) {
    throw redirect(302, `/courses/${params.slug}?notice=not-enrolled`);
  }

  const { data: videos, error: vidErr } = await supabase
    .from('course_videos')
    .select('youtube_id, title, position')
    .eq('course_slug', params.slug)
    .order('position', { ascending: true });

  if (vidErr) throw error(500, 'Could not load videos');

  return {
    course: { slug: course.slug, title: course.title, outcome: course.outcome },
    videos: videos ?? []
  };
};
