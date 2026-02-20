import { json } from '@sveltejs/kit';
import { reviewWebsite } from '$lib/gemini';
import { z } from 'zod';

const schema = z.object({
	url: z.string().url()
});

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { url } = schema.parse(body);

		// Fetch website content
		const response = await fetch(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (compatible; WebsiteReviewer/1.0)'
			}
		});

		if (!response.ok) {
			return json({ error: 'Failed to fetch website' }, { status: 400 });
		}

		const html = await response.text();

		// Get AI review
		const review = await reviewWebsite(url, html);

		return json({ success: true, review });
	} catch (error) {
		console.error('Review error:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
}