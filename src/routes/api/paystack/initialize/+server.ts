import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { courseBySlug, formatNgn } from '$lib/courses';
import type { RequestHandler } from './$types';

const SECRET = env.PAYSTACK_SECRET_KEY;
const SITE_URL = env.PUBLIC_SITE_URL ?? 'https://rydertech.ng';

export const POST: RequestHandler = async ({ request, fetch }) => {
  if (!SECRET) {
    return json({ error: 'Paystack secret not configured.' }, { status: 500 });
  }
  const body = await request.json().catch(() => ({}));
  const { email, courseSlug, reference } = body as { email?: string; courseSlug?: string; reference?: string };

  const course = courseBySlug(courseSlug ?? '');
  if (!course || !email) {
    return json({ error: 'Invalid course or email.' }, { status: 400 });
  }

  const callbackUrl = `${SITE_URL}/checkout/success?reference=${encodeURIComponent(reference ?? '')}&course=${encodeURIComponent(course.slug)}`;

  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: { Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      amount: course.priceNgn * 100, // kobo
      currency: 'NGN',
      reference,
      callback_url: callbackUrl,
      metadata: { course_slug: course.slug, email },
      label: `RyderTech — ${course.title}`
    })
  });

  const data = await res.json();
  if (!res.ok || !data.status) {
    // Surface the real Paystack error (e.g. invalid key 1010) instead of a silent popup failure.
    return json({ error: data.message ?? 'Could not start payment.' }, { status: res.status || 502 });
  }
  return json({ authorization_url: data.data.authorization_url });
};
