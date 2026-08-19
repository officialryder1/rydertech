import { redirect, error } from '@sveltejs/kit';
import { createSupabaseServerClient } from '$lib/supabase/server';
import { courseBySlug } from '$lib/courses';
import type { PageServerLoad } from './$types';

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

  // Already owns it?
  const { data: owned } = await supabase
    .from('purchases')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_slug', params.slug)
    .eq('status', 'paid')
    .maybeSingle();
  if (owned) throw redirect(302, `/learn/${params.slug}`);

  return {
    course: { slug: course.slug, title: course.title, priceNgn: course.priceNgn, outcome: course.outcome },
    email: user.email
  };
};
