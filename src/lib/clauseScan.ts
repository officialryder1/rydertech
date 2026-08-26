/**
 * ClauseScan Engine
 * Risk aggregation + formatting for the AI contract reviewer lead magnet.
 * Pure functions — no DOM, no network. Unit-tested via scripts/clausescan-engine-test.ts.
 *
 * The Gemini layer (gemini-clausescan.ts) returns per-clause severity; this engine
 * turns that into a single 1-100 risk score, a severity band, and a shareable payload.
 */

export type Severity = 'low' | 'moderate' | 'high' | 'critical';

export interface ClauseFinding {
	/** short clause name, e.g. "Limitation of Liability" */
	clause: string;
	/** category bucket for grouping, e.g. "Liability" */
	category: string;
	severity: Severity;
	/** one-line risk phrase */
	risk: string;
	/** plain-English explanation a non-lawyer understands */
	explanation: string;
	/** suggested improvement / redline (full report only) */
	redline?: string;
}

export interface SummaryResult {
	riskScore: number; // 1-100
	severity: Severity;
	topRisks: ClauseFinding[]; // worst-first, capped at 3
	verdict: string;
	clauseCount: number;
}

export interface FullResult extends SummaryResult {
	clauses: ClauseFinding[]; // all clauses, worst-first
	overallAssessment: string;
	recommendedNextSteps: string[];
}

/** One-time unlock price (kobo handled at the Paystack layer). */
export const CLAUSESCAN_PRICE_NGN = 2500;
export const CLAUSESCAN_PRODUCT = 'clausescan';

const SEV_POINTS: Record<Severity, number> = {
	low: 20,
	moderate: 45,
	high: 72,
	critical: 100
};

const SEV_RANK: Record<Severity, number> = { low: 1, moderate: 2, high: 3, critical: 4 };

const clamp = (n: number, min: number, max: number) =>
	Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/**
 * Aggregate per-clause severities into a single 1-100 risk score.
 * Averages per-clause points, then escalates for concentration of bad clauses
 * (criticals are rare and expensive — they should push the score hard).
 */
export function aggregateRisk(findings: { severity: Severity }[]): { riskScore: number; severity: Severity } {
	if (!findings.length) return { riskScore: 1, severity: 'low' };
	const points = findings.map((f) => SEV_POINTS[f.severity]);
	const avg = mean(points);
	const numCritical = findings.filter((f) => f.severity === 'critical').length;
	const numHigh = findings.filter((f) => f.severity === 'high').length;
	const score = clamp(Math.round(avg + numCritical * 9 + numHigh * 3), 1, 100);
	return { riskScore: score, severity: band(score, numCritical) };
}

/** Severity band from score, but never below "high" if a critical clause exists. */
export function band(score: number, hasCritical = false): Severity {
	if (hasCritical && score < 70) return 'high';
	if (score >= 80) return 'critical';
	if (score >= 55) return 'high';
	if (score >= 30) return 'moderate';
	return 'low';
}

/** Worst-first sort for display. */
export function sortFindings(findings: ClauseFinding[]): ClauseFinding[] {
	return [...findings].sort((a, b) => SEV_RANK[b.severity] - SEV_RANK[a.severity]);
}

/** Build a free summary from a full findings list (or just pass summary findings). */
export function buildSummary(
	findings: ClauseFinding[],
	verdict: string,
	opts: { all?: boolean } = {}
): SummaryResult {
	const sorted = sortFindings(findings);
	const { riskScore, severity } = aggregateRisk(findings);
	return {
		riskScore,
		severity,
		topRisks: opts.all ? sorted : sorted.slice(0, 3),
		verdict,
		clauseCount: findings.length
	};
}

const SEV_LABEL: Record<Severity, string> = {
	low: 'Low',
	moderate: 'Moderate',
	high: 'High',
	critical: 'Critical'
};

export function severityLabel(s: Severity): string {
	return SEV_LABEL[s];
}

export function formatScore(n: number): string {
	return `${clamp(Math.round(n), 1, 100)}/100`;
}

/** Generic next-step copy used when the model omits recommendations. */
export function defaultNextSteps(severity: Severity): string[] {
	const steps = [
		'Have a qualified lawyer review the flagged clauses before signing.',
		'Request redlines on every "critical" and "high" clause above.',
		'Negotiate a mutual (not one-sided) liability and termination position.'
	];
	if (severity === 'critical' || severity === 'high') {
		steps.unshift('Do not sign until the critical clauses are renegotiated.');
	}
	return steps;
}

/** Plain-language headline depending on band — mirrors opsDrain severityCopy intent. */
export function severityCopy(severity: Severity): string {
	switch (severity) {
		case 'critical':
			return 'Critical exposure. One or more clauses could cost you significantly or strip your rights.';
		case 'high':
			return 'High risk. Several clauses lean heavily against you — renegotiate before signing.';
		case 'moderate':
			return 'Moderate risk. Some one-sided terms worth pushing back on.';
		default:
			return 'Low risk. Mostly balanced, with a few minor items to note.';
	}
}
