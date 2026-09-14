import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateHeadlines, type HeadlineConfig } from '$lib/headlineStudio';
import { z } from 'zod';

const schema = z.object({
	topic: z.string().min(3, 'Topic must be at least 3 characters'),
	industry: z.string().optional(),
	styles: z.array(z.enum([
		'curiosity', 'how-to', 'question', 'listicle', 'breaking',
		'command', 'problem-agitate', 'benefit-driven', 'social-proof', 'fear-scarcity'
	])).min(1, 'Select at least one style'),
	count: z.number().min(1).max(20).default(8)
});

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const parsed = schema.parse(body);

		const input: HeadlineConfig = {
			topic: parsed.topic,
			industry: parsed.industry || 'general business',
			styles: parsed.styles,
			count: parsed.count
		};

		const result = await generateHeadlines(input);
		return json({ success: true, result });
	} catch (error) {
		console.error('Headline generation error:', error);
		return json(
			{ success: false, error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
};
