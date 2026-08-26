import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { analyzeContract, type ContractType } from '$lib/gemini-clausescan';

const schema = z.object({
	text: z.string().min(40, 'Paste at least a paragraph of contract text.').max(32000),
	type: z
		.enum(['generic', 'employment', 'vendor', 'lease', 'nda', 'partnership', 'saas'])
		.default('generic')
});

export async function POST({ request }: { request: Request }) {
	try {
		const body = await request.json();
		const { text, type } = schema.parse(body);
		const summary = await analyzeContract(text, 'summary', type as ContractType);
		return json({ success: true, summary });
	} catch (error) {
		console.error('ClauseScan error:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Could not analyze the contract.' },
			{ status: 500 }
		);
	}
}
