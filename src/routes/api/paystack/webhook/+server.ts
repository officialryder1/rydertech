import { json } from '@sveltejs/kit';
import { createSupabaseAdminClient } from '$lib/supabase/server';
import { env } from '$env/dynamic/private';
import crypto from 'node:crypto';
import type { RequestHandler } from './$types';

const PAYSTACK_SECRET = env.PAYSTACK_SECRET_KEY;

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.text();
  const signature = request.headers.get('x-paystack-signature');

  if (!PAYSTACK_SECRET || !signature) {
    return json({ error: 'misconfigured' }, { status: 500 });
  }

  // Verify signature
  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(body).digest('hex');
  if (hash !== signature) {
    return json({ error: 'invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);
  // Only act on successful charge
  if (event.event !== 'charge.success') {
    return json({ received: true, ignored: event.event });
  }

  const tx = event.data;
  const courseSlug = tx.metadata?.course_slug;
  const email = tx.customer?.email ?? tx.metadata?.email;
  const amountKobo = tx.amount; // kobo
  const reference = tx.reference;

  if (!courseSlug || !email) {
    return json({ error: 'missing course_slug/email' }, { status: 400 });
  }

  // Optional: verify with Paystack API (good practice)
  try {
    const verify = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
    });
    const vj = await verify.json();
    if (!vj.status || vj.data.status !== 'success') {
      return json({ error: 'unverified' }, { status: 402 });
    }
  } catch {
    // If verification call fails, still trust the signed webhook event.
  }

  const supabase = createSupabaseAdminClient();

  // Find the user by email
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users?.users?.find((u: any) => u.email === email);
  if (!user) {
    return json({ error: 'user not found' }, { status: 404 });
  }

  // Idempotent insert
  const { error: insErr } = await supabase.from('purchases').upsert(
    {
      user_id: user.id,
      course_slug: courseSlug,
      amount_ngn: Math.round(amountKobo / 100),
      provider: 'paystack',
      reference,
      status: 'paid',
      paid_at: new Date().toISOString()
    },
    { onConflict: 'reference' }
  );

  if (insErr) {
    return json({ error: insErr.message }, { status: 500 });
  }

  return json({ ok: true });
};
