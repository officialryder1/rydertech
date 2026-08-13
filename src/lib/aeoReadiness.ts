/**
 * AI Search Readiness (AEO) Engine
 * Scores how likely a business is to be CITED by answer engines (Google AI
 * Overviews, ChatGPT, Gemini, Siri) rather than buried. Pure functions — no
 * DOM, no network, no external APIs. Reuses opsDrain's formatMoney for output.
 *
 * AEO = Answer Engine Optimization. The unit of win is being quoted as the
 * answer, not ranking #1. The signals below are what LLM crawlers reward:
 * structured data, direct-answer (FAQ) content, clear entity definition, and
 * third-party authority citations.
 */

export type Currency = 'NGN' | 'USD';

export interface EngineInput {
	/** owns a crawlable website */
	haveWebsite: boolean;
	/** emits schema.org / JSON-LD (FAQPage, LocalBusiness, Article) */
	hasStructuredData: boolean;
	/** publishes explicit Q&A / direct-answer content mapped to real queries */
	hasFAQContent: boolean;
	/** clear "who/what is this" entity definition (about page, author bio, NAP) */
	entityClear: boolean;
	/** cited or linked by trusted third parties (press, Wikipedia, high-DA sites) */
	citedByAuthorities: boolean;
	/** present in Google's knowledge graph (GBP or knowledge panel) */
	hasKnowledgePresence: boolean;
	/** core content updated within the last 6 months */
	contentFresh: boolean;
	/** local entity signal (LocalBusiness schema / consistent citations) */
	hasLocalSignal: boolean;
	/** approximate monthly organic visitors — proxy for answer-surface scale */
	monthlyVisitors: number;
	/** average value of one referred customer, in the chosen currency */
	avgCustomerValue: number;
	currency: Currency;
}

export type AiReadiness = 'invisible' | 'partial' | 'ready' | 'dominant';
export type Severity = 'low' | 'moderate' | 'high' | 'critical';

export interface Gap {
	factor: string;
	impact: string;
	severity: Severity;
}

export interface EngineResult {
	/** 0-100 AI-search readiness score */
	score: number;
	readiness: AiReadiness;
	/** est. answers/surfaces per month you could be cited in (illustrative) */
	estMonthlyAnswers: number;
	/** est. AI-referred customers lost / month because you aren't cited */
	estMissed: number;
	/** annualised revenue left on the table (estimate) */
	revenueAtRisk: number;
	gaps: Gap[];
	severity: Severity;
	verdict: string;
	enhancements: string[];
}

const clamp = (n: number, min: number, max: number) =>
	Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
const round = (n: number) => (Number.isFinite(n) ? Math.round(n * 100) / 100 : 0);

function severityRank(s: Severity): number {
	return s === 'critical' ? 3 : s === 'high' ? 2 : s === 'moderate' ? 1 : 0;
}

function readinessSeverity(r: AiReadiness): Severity {
	return r === 'invisible' ? 'critical' : r === 'partial' ? 'high' : r === 'ready' ? 'moderate' : 'low';
}

function scoreAeo(input: EngineInput): number {
	let s = 0;
	if (input.haveWebsite) s += 15;
	if (input.hasStructuredData) s += 20;
	if (input.hasFAQContent) s += 15;
	if (input.entityClear) s += 15;
	if (input.citedByAuthorities) s += 15;
	if (input.hasKnowledgePresence) s += 10;
	if (input.contentFresh) s += 5;
	if (input.hasLocalSignal) s += 5;
	return s; // max 100
}

function buildGaps(input: EngineInput): Gap[] {
	const gaps: Gap[] = [];

	if (!input.haveWebsite) {
		gaps.push({
			factor: 'No crawlable website',
			impact: 'Answer engines have nothing to read — you cannot be cited without a source.',
			severity: 'critical'
		});
	}
	if (input.haveWebsite && !input.hasStructuredData) {
		gaps.push({
			factor: 'No structured data (schema)',
			impact: 'Without JSON-LD, LLMs guess at your meaning instead of quoting it precisely.',
			severity: 'high'
		});
	}
	if (!input.hasFAQContent) {
		gaps.push({
			factor: 'No direct-answer (FAQ) content',
			impact: 'AI Overviews lift clear Q→A pairs. Without them, you are never the answer.',
			severity: 'high'
		});
	}
	if (!input.entityClear) {
		gaps.push({
			factor: 'Unclear entity definition',
			impact: 'If Google/Siri can’t resolve "who is this", you won’t appear in answers.',
			severity: 'high'
		});
	}
	if (!input.citedByAuthorities) {
		gaps.push({
			factor: 'No authority citations',
			impact: 'LLMs prefer sources other trusted sources reference. Zero mentions = zero trust.',
			severity: 'moderate'
		});
	}
	if (!input.hasKnowledgePresence) {
		gaps.push({
			factor: 'No knowledge-graph presence',
			impact: 'Absent from the knowledge panel / Maps means absent from local and entity answers.',
			severity: 'moderate'
		});
	}
	if (!input.contentFresh) {
		gaps.push({
			factor: 'Stale content',
			impact: 'Answer engines favour recently updated, factually current sources.',
			severity: 'moderate'
		});
	}
	if (input.haveWebsite && !input.hasLocalSignal) {
		gaps.push({
			factor: 'No local entity signal',
			impact: 'LocalBusiness schema + citations are what win "near me" AI answers.',
			severity: 'low'
		});
	}

	return gaps.sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
}

function buildVerdict(r: AiReadiness): string {
	switch (r) {
		case 'invisible':
			return 'You are effectively invisible to answer engines. When customers ask AI for a business like yours, a competitor gets named — not you.';
		case 'partial':
			return 'You show up sometimes, but you are not structured to be the cited answer. Most AI queries about your space name someone else.';
		case 'ready':
			return 'You are reasonably AI-readable — but the top-of-answer spot is still up for grabs. A few fixes lock it in.';
		case 'dominant':
			return 'Answer engines can read, cite, and trust you. You are the source AI names. Keep the schema and authority flowing.';
	}
}

function buildEnhancements(): string[] {
	return [
		'Deploy structured data — FAQPage, LocalBusiness, and Article JSON-LD so LLMs parse meaning, not guess.',
		'Build direct-answer content — Q&A pages mapped to the exact queries your customers ask AI.',
		'Lock your entity — a clear About/author definition and consistent NAP across the web.',
		'Earn authority citations — press, partnerships, and listings LLMs already trust.',
		'Keep content fresh — a maintenance cadence so answer engines treat you as current.'
	];
}

export function computeAeoReadiness(input: EngineInput): EngineResult {
	const score = clamp(Math.round(scoreAeo(input)), 0, 100);

	const readiness: AiReadiness =
		score >= 80 ? 'dominant' : score >= 55 ? 'ready' : score >= 30 ? 'partial' : 'invisible';

	// Illustrative estimate: ~4% of a site's organic-relevant traffic maps to
	// AI-answer surfaces. Of those, the share you MISS scales with (1 - score/100).
	const visitors = clamp(input.monthlyVisitors, 0, 10_000_000);
	const estMonthlyAnswers = Math.round(visitors * 0.04);
	const estMissed = Math.round(estMonthlyAnswers * (1 - score / 100));
	// Assume ~10% of AI-referred visitors convert at avgCustomerValue.
	const revenueAtRisk = round(estMissed * 12 * input.avgCustomerValue * 0.1);

	const gaps = buildGaps(input);
	const severity = readinessSeverity(readiness);
	const verdict = buildVerdict(readiness);
	const enhancements = buildEnhancements();

	return {
		score,
		readiness,
		estMonthlyAnswers,
		estMissed,
		revenueAtRisk,
		gaps,
		severity,
		verdict,
		enhancements
	};
}
