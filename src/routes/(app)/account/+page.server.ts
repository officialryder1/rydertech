import { redirect } from '@sveltejs/kit';
import { createSupabaseServerClient } from '$lib/supabase/server';
import { courses, courseBySlug, formatNgn } from '$lib/courses';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  const supabase = locals.supabase;
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    throw redirect(302, `/login?redirect=${encodeURIComponent(url.pathname)}`);
  }

  const { data: purchases } = await supabase
    .from('purchases')
    .select('course_slug, status, amount_ngn, paid_at')
    .eq('user_id', user.id)
    .eq('status', 'paid');

  const owned = new Set((purchases ?? []).map((p) => p.course_slug));
  const myCourses = courses.filter((c) => owned.has(c.slug));

  return {
    email: user.email,
    // NOTE: do NOT include `icon` — it's a Svelte component (function) and is
    // not serializable across the server->client boundary (causes a 500).
    // The client resolves the icon from courseBySlug(c.slug) instead.
    myCourses: myCourses.map((c) => ({
      slug: c.slug,
      title: c.title,
      tagline: c.tagline,
      priceNgn: c.priceNgn,
      outcome: c.outcome
    }))
  };
};
