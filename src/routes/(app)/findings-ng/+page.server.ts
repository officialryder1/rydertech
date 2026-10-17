import type { PageServerLoad } from './$types';
import { fetchComparisonData } from '$lib/findingsng.js';

export const load: PageServerLoad = async ({ locals }) => {
	const supabase = locals.supabase;
	const category = 'price-tracking';
	try {
		const rows = await fetchComparisonData(supabase, category, { verifiedOnly: true });
		return { rows };
	} catch (err) {
		console.error('Failed to load comparison data:', err);
		return { rows: [] };
	}
};
