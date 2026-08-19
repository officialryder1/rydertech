import { error, redirect } from '@sveltejs/kit';
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
