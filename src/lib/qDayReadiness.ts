/**
 * Q-Day Readiness Engine
 * Assesses how prepared an organisation is for the quantum-computing threat to
 * classical cryptography (a.k.a. "Q-Day").
 *
 * Pure functions — no DOM, no network. Unit-testable via node.
 */

export interface QDayInput {
	/** Does the org store PII, payment data, or state secrets at rest? */
	handlesSensitiveData: boolean;
	/** Approximate volume of sensitive records (customers, users, transactions) */
	sensitiveRecordCount: number;
	/** How long must data stay confidential (threat model window) */
	retentionYears: number;
	/** Has the org inventoried all cryptographic assets? */
	cryptoInventoryDone: boolean;
	/** Percentage of systems running legacy crypto (RSA-2048, ECC p-256, etc.) */
	legacyCryptoPct: number;
	/** Is there an active PKI/certificate lifecycle management process? */
	activePki: boolean;
	/** Percentage of endpoints/devices on an inventory with patch capability */
	endpointPatchablePct: number;
	/** Does the org have a formal post-quantum migration plan? */
	hasPQCPlan: boolean;
	/** Annual revenue or budget range (for context) */
	annualRevenueUSD: number;
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';
export type QuantumTimeline = '2026-2028' | '2028-2030' | '2030-2035' | '2035+';

export interface RiskFactor {
	label: string;
	description: string;
	impact: 'low' | 'moderate' | 'high' | 'critical';
	points: number;
	maxPoints: number;
}

export interface QDayResult {
	score: number;          // 0-100, lower = more ready
	riskLevel: RiskLevel;
	quantumTimeline: QuantumTimeline;
	timeUntilExposed: string;  // human-readable
	factors: RiskFactor[];
	totalRiskPoints: number;
	maxRiskPoints: number;
	revenueAtRiskUSD: number;
	recommendations: Recommendation[];
}

export interface Recommendation {
	priority: 'critical' | 'high' | 'medium' | 'low';
	title: string;
	description: string;
	estimatedEffort: string;
}

const clamp = (n: number, min: number, max: number): number =>
	Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;

const pct = (val: number): number => clamp(val, 0, 100);

/** Score 0-40 for quantum-readiness; higher = less ready */
export function computeQDayRisk(input: QDayInput): QDayResult {
	const factors: RiskFactor[] = [
		{
			label: 'Sensitive Data Exposure',
			description: `Handles ${formatCount(input.sensitiveRecordCount)} sensitive records with ${input.retentionYears}-year retention.`,
			impact: input.handlesSensitiveData && input.sensitiveRecordCount > 1000
				? 'critical' : input.handlesSensitiveData
					? 'moderate' : 'low',
			points: input.handlesSensitiveData
				? clamp(Math.log10(input.sensitiveRecordCount + 1) * 4, 3, 12) + (input.retentionYears > 5 ? 3 : 0)
				: 0,
			maxPoints: 15
		},
		{
			label: 'Legacy Cryptography Prevalence',
			description: `${pct(input.legacyCryptoPct)}% of systems still run RSA-2048, ECC p-256, or other quantum-vulnerable algorithms.`,
			impact: pct(input.legacyCryptoPct) > 70 ? 'critical'
				: pct(input.legacyCryptoPct) > 40 ? 'high'
					: pct(input.legacyCryptoPct) > 15 ? 'moderate' : 'low',
			points: pct(input.legacyCryptoPct) / 100 * 15,
			maxPoints: 15
		},
		{
			label: 'Cryptographic Asset Visibility',
			description: input.cryptoInventoryDone
				? 'Full inventory of cryptographic assets is maintained.'
				: 'No cryptographic asset inventory exists.',
			impact: input.cryptoInventoryDone ? 'low' : 'high',
			points: input.cryptoInventoryDone ? 0 : 8,
			maxPoints: 8
		},
		{
			label: 'PKI & Certificate Lifecycle Management',
			description: input.activePki
				? 'Active PKI with certificate lifecycle management.'
				: 'No formal PKI or certificate management process.',
			impact: input.activePki ? 'low' : 'moderate',
			points: input.activePki ? 0 : 5,
			maxPoints: 5
		},
		{
			label: 'Endpoint Patchability',
			description: `${pct(input.endpointPatchablePct)}% of endpoints have automated patch capability — essential for deploying post-quantum updates.`,
			impact: pct(input.endpointPatchablePct) < 30 ? 'critical'
				: pct(input.endpointPatchablePct) < 60 ? 'high'
					: pct(input.endpointPatchablePct) < 85 ? 'moderate' : 'low',
			points: (100 - pct(input.endpointPatchablePct)) / 100 * 8,
			maxPoints: 8
		},
		{
			label: 'Post-Quantum Migration Planning',
			description: input.hasPQCPlan
				? 'Formal post-quantum migration plan is in place.'
				: 'No post-quantum migration strategy exists.',
			impact: input.hasPQCPlan ? 'low' : 'critical',
			points: input.hasPQCPlan ? 0 : 10,
			maxPoints: 10
		}
	];

	const totalRiskPoints = factors.reduce((sum, f) => sum + f.points, 0);
	const maxRiskPoints = factors.reduce((sum, f) => sum + f.maxPoints, 0);
	const score = Math.round((totalRiskPoints / maxRiskPoints) * 100);

	const riskLevel: RiskLevel =
		score >= 80 ? 'critical'
		: score >= 65 ? 'high'
			: score >= 40 ? 'moderate'
				: 'low';

	const quantumTimeline = getQuantumTimeline(score);
	const timeUntilExposed = getTimeUntilExposed(input);
	const revenueAtRiskUSD = calculateRevenueAtRisk(input);
	const recommendations = buildRecommendations(input, riskLevel, score, quantumTimeline);

	return {
		score,
		riskLevel,
		quantumTimeline,
		timeUntilExposed,
		factors,
		totalRiskPoints,
		maxRiskPoints,
		revenueAtRiskUSD,
		recommendations
	};
}

/** For high scores (more unprepared), quantum timeline is SOONER. */
function getQuantumTimeline(score: number): QuantumTimeline {
	if (score >= 80) return '2026-2028';
	if (score >= 65) return '2028-2030';
	if (score >= 40) return '2030-2035';
	return '2035+';
}

function getTimeUntilExposed(input: QDayInput): string {
	if (!input.handlesSensitiveData) return 'Beyond 2035';
	if (input.legacyCryptoPct > 70) return '2026-2028';
	if (input.legacyCryptoPct > 40 || !input.hasPQCPlan) return '2028-2030';
	if (input.legacyCryptoPct > 15) return '2030-2035';
	return '2035+';
}

function calculateRevenueAtRisk(input: QDayInput): number {
	if (!input.handlesSensitiveData) return 0;
	// Rough estimate: 10% of annual revenue at risk from a single data breach
	// post-quantum cryptanalysis. Scale by sensitivity factors.
	const baseRisk = input.annualRevenueUSD * 0.10;
	const recordFactor = Math.min(1, input.sensitiveRecordCount / 100000);
	const retentionFactor = Math.min(1, input.retentionYears / 10);
	return Math.round(baseRisk * recordFactor * retentionFactor);
}

function buildRecommendations(
	input: QDayInput,
	riskLevel: RiskLevel,
	score: number,
	quantumTimeline: QuantumTimeline
): Recommendation[] {
	const recs: Recommendation[] = [];

	if (score >= 70) {
		recs.push({
			priority: 'critical',
			title: 'Immediate Post-Quantum Cryptography Migration',
			description: 'Your organisation is at extreme risk. Begin migrating to NIST-standardized post-quantum algorithms (e.g., Kyber, Dilithium) immediately.',
			estimatedEffort: '6-12 months, high budget'
		});
		recs.push({
			priority: 'critical',
			title: 'Full Cryptographic Asset Inventory',
			description: 'Map every system, service, device, and application that uses cryptographic operations. Identify all quantum-vulnerable components.',
			estimatedEffort: '2-4 weeks'
		});
	}

	if (score >= 40 && score < 70) {
		recs.push({
			priority: 'high',
			title: 'Develop a Post-Quantum Migration Strategy',
			description: 'Create a phased migration plan prioritising high-value systems. Focus on certificate renewal cycles and PKI upgrade paths.',
			estimatedEffort: '3-6 months'
		});
	}

	if (score >= 30 && score < 60) {
		recs.push({
			priority: 'medium',
			title: 'Implement Crypto-Agility Framework',
			description: 'Build systems that can swap cryptographic algorithms without architectural overhaul. This ensures smooth PQC transition.',
			estimatedEffort: '2-8 months'
		});
	}

	// Always include for context
	if (score < 50) {
		recs.push({
			priority: 'low',
			title: 'Monitor NIST PQC Standardisation',
			description: 'Stay updated on finalised standards and begin pilot testing post-quantum algorithms in non-production environments.',
			estimatedEffort: '1-2 months (ongoing monitoring)'
		});
	} else {
		recs.push({
			priority: 'medium',
			title: 'Engage Quantum-Ready Security Vendor',
			description: 'Partner with vendors who already support post-quantum cryptography in their products and services.',
			estimatedEffort: '1-3 months'
		});
	}

	if (score < 40) {
		recs.push({
			priority: 'low',
			title: 'Establish Continuous Crypto Monitoring',
			description: 'Set up automated scanning to detect new quantum-vulnerable systems as your infrastructure evolves.',
			estimatedEffort: '1 month'
		});
	}

	return recs;
}

export function formatCount(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
	return `${n}`;
}
