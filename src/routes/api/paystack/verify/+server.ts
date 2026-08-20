import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { courseBySlug } from '$lib/courses';
import type { RequestHandler } from './$types';

const SECRET = env.PAYSTACK_SECRET_KEY;

// Verifies a transaction with Paystack and enrolls the CURRENT session user.
// Uses the authenticated session (not email lookup) so enrollment is reliable
// regardless of whether the webhook fired.
export const POST: RequestHandler = async ({ request, locals }) => {
  const {
    data: { user }
  } = await locals.supabase.auth.getUser();
  if (!user) return json({ error: 'Not authenticated.' }, { status: 401 });

  const { reference } = (await request.json().catch(() => ({}))) as { reference?: string };
  if (!reference || !SECRET) return json({ paid: false });

  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${SECRET}` }
  });
  const j = await res.json().catch(() => ({}));
  const tx = j?.data;
  if (!res.ok || j?.status !== true || tx?.status !== 'success') {
    // Still pending or failed — let the client poll again.
    return json({ paid: false });
  }

  const courseSlug: string = tx.metadata?.course_slug ?? '';
  const course = courseBySlug(courseSlug);
  if (!course) return json({ paid: false, error: 'Unknown course.' });

  const { error: insErr } = await locals.supabase.from('purchases').upsert(
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
  if (insErr) return json({ paid: false, error: insErr.message });

  return json({ paid: true });
};
