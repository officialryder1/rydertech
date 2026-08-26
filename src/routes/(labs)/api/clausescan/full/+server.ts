import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { z } from 'zod';
import { analyzeContract, type ContractType } from '$lib/gemini-clausescan';

const SECRET = env.PAYSTACK_SECRET_KEY;

const schema = z.object({
	text: z.string().min(40).max(32000),
	type: z.enum(['generic', 'employment', 'vendor', 'lease', 'nda', 'partnership', 'saas']).default('generic'),
	reference: z.string().min(1)
});

/**
 * Full report is paywalled: we verify the Paystack reference succeeded BEFORE
 * spending a Gemini call on the full analysis. Skipping payment => 402.
 */
async function verifyPaid(reference: string): Promise<boolean> {
	if (!SECRET) return false;
	const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
		headers: { Authorization: `Bearer ${SECRET}` }
	});
	const j = await res.json().catch(() => ({}));
	const tx = j?.data;
	return res.ok && j?.status === true && tx?.status === 'success';
}

export async function POST({ request }: { request: Request }) {
	try {
		const body = await request.json();
		const { text, type, reference } = schema.parse(body);

		const paid = await verifyPaid(reference);
		if (!paid) return json({ error: 'Payment not confirmed for this report.' }, { status: 402 });

		const full = await analyzeContract(text, 'full', type as ContractType);
		return json({ success: true, full });
	} catch (error) {
		console.error('ClauseScan full error:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Could not generate the full report.' },
			{ status: 500 }
		);
	}
}
