import { json } from '@sveltejs/kit';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const STATE_FILE = join(process.cwd(), 'scripts', 'leads', '.nurture-state.json');

interface NurtureLead {
	email: string;
	tool: string;
	capturedAt: string;
	touches: number[];
	lead_score: number | null;
	lead_tier: string | null;
}

interface NurtureState {
	leads: NurtureLead[];
}

export async function GET() {
	try {
		if (!existsSync(STATE_FILE)) {
			return json({
				success: true,
				data: {
					totalEnrolled: 0,
					activeSequences: 0,
					touchesSent30d: 0,
					completed: 0
				}
			});
		}

		const raw = readFileSync(STATE_FILE, 'utf-8');
		const state: NurtureState = JSON.parse(raw);

		const now = Date.now();
		const thirtyDaysAgo = now - 30 * 86400000;

		let totalEnrolled = 0;
		let activeSequences = 0;
		let touchesSent30d = 0;
		let completed = 0;

		for (const lead of state.leads) {
			totalEnrolled++;
			const touches = lead.touches || [];
			
			if (touches.length >= 3) {
				completed++;
			} else if (touches.length > 0) {
				activeSequences++;
			}

			// Count touches sent in last 30 days based on capturedAt
			const capturedAt = new Date(lead.capturedAt).getTime();
			if (capturedAt >= thirtyDaysAgo) {
				touchesSent30d += touches.length;
			}
		}

		return json({
			success: true,
			data: {
				totalEnrolled,
				activeSequences,
				touchesSent30d,
				completed
			}
		});
	} catch (e) {
		console.error('Proof nurture stats error:', e);
		return json({ success: false, error: 'Failed to load stats' }, { status: 500 });
	}
}