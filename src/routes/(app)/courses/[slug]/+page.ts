import { error } from '@sveltejs/kit';
import { courses, courseBySlug } from '$lib/courses';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => courses.map((c) => ({ slug: c.slug }));

export const load: PageLoad = ({ params }) => {
  const course = courseBySlug(params.slug);
  if (!course) {
    throw error(404, 'Course not found');
  }
  return { course };
};
