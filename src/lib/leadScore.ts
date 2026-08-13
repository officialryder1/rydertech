/**
 * leadScore.ts — universal lead-scoring engine for RyderTech /labs tools.
 * Pure functions (no DOM/network). Each tool passes the result metrics that
 * make a lead "hotter"; we return a 0-100 points score + tier + reasons.
 *
 * Principle: a visitor who quantifies a BIG problem (huge ops drain, large
 * revenue leak, invisible locally, uncited by AI, long event gate risk) is a
 * hotter lead than one with a trivial result — regardless of which tool.
 */

export type Tier = 'cool' | 'warm' | 'hot';

export interface ScoreInput {
	/** which tool produced the result */
	tool: 'ops_drain' | 'revleak' | 'event_risk' | 'visibility' | 'aeo' | 'cost_estimator';
	/** the money/impact metric the tool computed (absolute, in the tool's currency) */
	impactValue: number;
	/** total annual $ value left on the table (normalised to NGN for cross-tool comparison) */
	revenueAtRisk: number;
	/** 0-100 severity/findability/readiness score where lower = worse (optional) */
	healthScore?: number;
}

export interface ScoreResult {
	points: number; // 0-100
	tier: Tier;
	reasons: string[];
}

const clamp = (n: number, min: number, max: number) =>
	Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;

/**
 * Normalise an absolute impact value to a 0-40 sub-score on a log-ish curve.
 * ₦50k → ~8pts, ₦500k → ~22pts, ₦5M+ → 40pts. Rewarded for magnitude.
 */
function impactSubscore(v: number): number {
	const x = Math.max(0, v);
	if (x <= 0) return 0;
	// 40 * (1 - e^(-v/1_000_000)): saturates near 40 by ~₦1M, ~38 by ₦3M
	return clamp(Math.round(40 * (1 - Math.exp(-x / 1_000_000))), 0, 40);
}

/**
 * A worse health score (more invisible/uncited/slow) = hotter lead.
 * healthScore 0 → 40pts, 100 → 0pts. Only applied when provided.
 */
function healthSubscore(health?: number): number {
	if (health === undefined) return 0;
	const h = clamp(health, 0, 100);
	return Math.round((100 - h) / 100 * 40);
}

export function scoreLead(input: ScoreInput): ScoreResult {
	const reasons: string[] = [];
	let points = 0;

	const imp = impactSubscore(input.impactValue);
	if (imp > 0) {
		points += imp;
		if (imp >= 30) reasons.push('Large quantified impact — high willingness to fix');
		else if (imp >= 15) reasons.push('Solid quantified impact');
	}

	const rev = impactSubscore(input.revenueAtRisk);
	if (rev > 0 && input.revenueAtRisk > input.impactValue) {
		// revenueAtRisk already captured via impactValue in most tools; avoid double count
		// by only adding the *delta* if it's materially larger
		const delta = input.revenueAtRisk - input.impactValue;
		if (delta > 50_000) {
			const extra = impactSubscore(delta);
			points += extra;
			reasons.push('Annual revenue exposure compounds the urgency');
		}
	} else if (rev > 0) {
		points += rev;
	}

	const hsc = healthSubscore(input.healthScore);
	if (hsc > 0) {
		points += hsc;
		if (hsc >= 30) reasons.push('Severe visibility/readiness gap detected');
		else if (hsc >= 15) reasons.push('Notable gap in current setup');
	}

	points = clamp(points, 0, 100);

	const tier: Tier = points >= 60 ? 'hot' : points >= 30 ? 'warm' : 'cool';
	if (reasons.length === 0) reasons.push('Explored the tool (baseline interest)');

	return { points, tier, reasons };
}

export const TIER_LABEL: Record<Tier, string> = {
	cool: 'Cool',
	warm: 'Warm',
	hot: 'Hot'
};
