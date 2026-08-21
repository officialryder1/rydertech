import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { createSupabaseAdminClient } from '$lib/supabase/server';
import { courseBySlug } from '$lib/courses';
import type { PageServerLoad } from './$types';

const SECRET = env.PAYSTACK_SECRET_KEY;

// Server-side enrollment: when Paystack redirects back here with ?reference=...,
// verify the transaction and write the purchase row DIRECTLY (admin client, RLS
// bypass). This runs on page load — no client-side JS poll needed, so a paid
// user is enrolled instantly and can never be stuck "confirming".
// Falls back to the client poll only if the server check is inconclusive.
async function enrollFromReference(reference: string, user: any) {
  if (!SECRET || !reference) return false;
  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${SECRET}` }
  });
  const j = await res.json().catch(() => ({}));
  const tx = j?.data;
  if (j?.status !== true || tx?.status !== 'success') return false;
  const courseSlug: string = tx.metadata?.course_slug ?? '';
  if (!courseBySlug(courseSlug)) return false;
  const admin = createSupabaseAdminClient();
  const row = {
    user_id: user.id,
    course_slug: courseSlug,
    amount_ngn: Math.round((tx.amount ?? 0) / 100),
    provider: 'paystack',
    reference,
    status: 'paid',
    paid_at: new Date().toISOString()
  };
  const { error: insErr } = await admin.from('purchases').upsert(row, { onConflict: 'reference' });
  if (insErr) {
    const { error: insErr2 } = await admin.from('purchases').insert(row);
    if (insErr2) return false;
  }
  return true;
}

export const load: PageServerLoad = async ({ url, locals }) => {
  const courseSlug = url.searchParams.get('course') ?? '';
  const reference = url.searchParams.get('reference') ?? '';
  const trxref = url.searchParams.get('trxref') ?? '';
  const course = courseBySlug(courseSlug);

  const {
    data: { user }
  } = await locals.supabase.auth.getUser();
  if (!user) {
    throw redirect(302, `/login?redirect=${encodeURIComponent(url.pathname + url.search)}`);
  }

  // Server-side enroll on load (robust — no client JS dependency).
  // Paystack may return the reference in either ?reference= or ?trxref=; try both.
  if (reference) await enrollFromReference(reference, user);
  if (trxref && trxref !== reference) await enrollFromReference(trxref, user);

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
