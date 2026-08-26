import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { CLAUSESCAN_PRICE_NGN, CLAUSESCAN_PRODUCT } from '$lib/clauseScan';

const SECRET = env.PAYSTACK_SECRET_KEY;
const SITE_URL = env.PUBLIC_SITE_URL ?? 'https://rydertech.ng';

export const POST: import('./$types').RequestHandler = async ({ request }) => {
	if (!SECRET) return json({ error: 'Paystack secret not configured.' }, { status: 500 });

	const body = await request.json().catch(() => ({}));
	const { email, reference } = body as { email?: string; reference?: string };

	if (!email || !reference) {
		return json({ error: 'Email and reference are required.' }, { status: 400 });
	}

	const callbackUrl = `${SITE_URL}/checkout/clausescan-success?reference=${encodeURIComponent(reference)}`;

	const res = await fetch('https://api.paystack.co/transaction/initialize', {
		method: 'POST',
		headers: { Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json' },
		body: JSON.stringify({
			email,
			amount: CLAUSESCAN_PRICE_NGN * 100, // kobo
			currency: 'NGN',
			reference,
			callback_url: callbackUrl,
			metadata: { product: CLAUSESCAN_PRODUCT, email },
			label: 'RyderTech — ClauseScan Full Report'
		})
	});

	const data = await res.json();
	if (!res.ok || !data.status) {
		return json({ error: data.message ?? 'Could not start payment.' }, { status: res.status || 502 });
	}
	return json({ authorization_url: data.data.authorization_url });
};
