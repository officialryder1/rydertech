import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { repurposeContent } from '$lib/content-repurposer/repurposer';
import type { RepurposeInput } from '$lib/content-repurposer/types';
import { z } from 'zod';

const schema = z.object({
	sourceContent: z.string().min(50, 'Content must be at least 50 characters'),
	contentType: z.enum(['blog', 'article', 'video', 'podcast', 'other']),
	targetPlatforms: z.array(z.enum(['linkedin', 'twitter', 'newsletter', 'tiktok', 'instagram', 'blog'])).min(1),
	tone: z.enum(['professional', 'casual', 'engaging', 'authoritative']).optional()
});

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const parsed = schema.parse(body);

		const input: RepurposeInput = {
			sourceContent: parsed.sourceContent,
			contentType: parsed.contentType,
			targetPlatforms: parsed.targetPlatforms,
			tone: parsed.tone || 'professional'
		};

		const posts = await repurposeContent(input);
		return json({ success: true, posts });
	} catch (error) {
		console.error('Repurposing error:', error);
		return json(
			{ success: false, error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
};
