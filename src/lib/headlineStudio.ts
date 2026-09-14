/**
 * AI Headline Studio — Browser-safe types, constants, and scoring engine.
 * No server-only imports. Safe to import from SvelteKit client components.
 * The actual Gemini API call lives in headlineStudio.server.ts (server-only).
 */
export type HeadlineStyle =
	| 'curiosity'
	| 'how-to'
	| 'question'
	| 'listicle'
	| 'breaking'
	| 'command'
	| 'problem-agitate'
	| 'benefit-driven'
	| 'social-proof'
	| 'fear-scarcity';

export interface HeadlineConfig {
	topic: string;
	industry: string;
	styles: HeadlineStyle[];
	count: number;
}

export interface Headline {
	id: string;
	text: string;
	style: HeadlineStyle;
	charLength: number;
	clickbaitScore: number;
}

export interface HeadlineResult {
	headlines: Headline[];
	topPicks: Headline[];
	styleDistribution: Record<HeadlineStyle, number>;
}

export const STYLE_DESCRIPTIONS: Record<HeadlineStyle, string> = {
	curiosity: 'Creates intrigue without giving everything away — makes the reader NEED to know more.',
	'how-to': 'Promise a practical skill or outcome the reader will gain.',
	question: 'A direct question that targets a pain point the reader feels personally.',
	listicle: 'Numbers + promise of concise, scannable value.',
	breaking: 'Urgency + news — feels timely and must-be-read-now.',
	command: 'Direct, imperative tone that tells the reader what to do.',
	'problem-agitate': 'Identifies a frustration, amplifies the pain, then hints at relief.',
	'benefit-driven': 'Focuses purely on what the reader gains — transformation-focused.',
	'social-proof': 'Leverages authority, crowds, or popularity to build trust.',
	'fear-scarcity': 'Triggers loss aversion or exclusivity pressure to act now.'
};

export const STYLE_LABELS: Record<HeadlineStyle, string> = {
	curiosity: 'Curiosity Gap',
	'how-to': 'How-To',
	question: 'Question Hook',
	listicle: 'Listicle',
	breaking: 'Breaking',
	command: 'Command',
	'problem-agitate': 'PAS (Problem-Agitate)',
	'benefit-driven': 'Benefit-Driven',
	'social-proof': 'Social Proof',
	'fear-scarcity': 'Fear/Scarcity'
};

/**
 * Heuristic clickbait score: rewards curiosity words, numbers, power words, short length.
 */
export function scoreHeadline(text: string): number {
	const lower = text.toLowerCase();
	let score = 0;

	// Length bonus — 30-60 chars is the sweet spot
	const len = text.length;
	if (len >= 30 && len <= 60) score += 25;
	else if (len > 60 && len <= 70) score += 15;
	else if (len > 70) score -= 10;
	else if (len < 20) score -= 5;

	// Power words
	const powerWords = [
		'secret', 'proven', 'ultimate', 'free', 'fast', 'easy', 'best',
		'new', 'instant', 'hidden', 'little-known', 'shocking', 'unbelievable',
		'mistake', 'hack', 'trick', 'genius', 'stupid', 'simple', 'quick'
	];
	const powerCount = powerWords.filter((w) => lower.includes(w)).length;
	score += Math.min(powerCount * 4, 20);

	// Numbers
	if (/\b\d+/.test(text)) score += 10;

	// Curiosity markers
	if (/\b(how|why|what|when|where|does|can|could)\b/.test(lower)) score += 5;
	if (/\b(never|without|before|after|again)\b/.test(lower)) score += 5;

	// Urgency
	if (/\b(now|today|2025|2026|urgent|last chance|deadline)\b/.test(lower)) score += 5;

	// Colon or separator (proven headline pattern: "Number/Title: Subtitle")
	if (/[:—-]/.test(text)) score += 3;

	return Math.max(0, Math.min(100, score));
}

export { STYLE_LABELS as default };
