import { redirect } from '@sveltejs/kit';
import { courseBySlug } from '$lib/courses';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
  const courseSlug = url.searchParams.get('course') ?? '';
  const reference = url.searchParams.get('reference') ?? '';
  const course = courseBySlug(courseSlug);

  const {
    data: { user }
  } = await locals.supabase.auth.getUser();
  if (!user) {
    throw redirect(302, `/login?redirect=${encodeURIComponent(url.pathname + url.search)}`);
  }

  // Wait for the webhook to have written the purchase row.
  const { data: purchase } = await locals.supabase
    .from('purchases')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('course_slug', courseSlug)
    .eq('status', 'paid')
    .maybeSingle();

  return {
    courseTitle: course?.title ?? courseSlug,
    courseSlug,
    reference,
    paid: Boolean(purchase)
  };
};
