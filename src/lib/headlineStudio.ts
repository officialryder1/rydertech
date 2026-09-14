/**
 * AI Headline Studio Engine
 * Generates viral headline variants across proven copywriting formulas.
 * Pure functions where possible; the LLM call is isolated to generateHeadlines().
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GOOGLE_GEMINI_API_KEY } from '$env/static/private';

const genAI = new GoogleGenerativeAI(GOOGLE_GEMINI_API_KEY ?? '');

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
	clickbaitScore: number; // 0-10 heuristic
}

export interface HeadlineResult {
	headlines: Headline[];
	// top 3 by score for quick display
	topPicks: Headline[];
	// distribution of styles generated
	styleDistribution: Record<HeadlineStyle, number>;
}

const STYLE_DESCRIPTIONS: Record<HeadlineStyle, string> = {
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

const STYLE_LABELS: Record<HeadlineStyle, string> = {
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

function buildSystemPrompt(): string {
	return `You are an elite copywriter and headline analyst who crafts viral headlines using proven advertising formulas. Your job is to generate high-scoring, click-worthy headlines for any topic.

CRITICAL INSTRUCTIONS:
1. Generate headlines using ONLY the requested copywriting styles.
2. Each headline must be short, punchy, and scannable — under 70 characters when possible.
3. Inject power words: new, proven, secret, ultimate, free, fast, easy, best, ultimate, instant.
4. Match the tone to the industry provided.
5. Include curiosity, urgency, or a clear benefit in every headline.
6. Distribute the count across the requested styles as evenly as possible.

RESPONSE FORMAT (ONLY JSON, no markdown, no code fences):
{
  "headlines": [
    {
      "text": "the headline text",
      "style": "one of: curiosity, how-to, question, listicle, breaking, command, problem-agitate, benefit-driven, social-proof, fear-scarcity"
    }
  ]
}
`;
}

function buildUserPrompt(config: HeadlineConfig): string {
	const { topic, industry, styles, count } = config;
	const styleList = styles.map((s) => `${STYLE_LABELS[s]} — ${STYLE_DESCRIPTIONS[s]}`).join('\n');
	return `Topic: ${topic}
Industry/Niche: ${industry || 'general business'}
Number of headlines to generate: ${count}
Styles to use (pick from these, distribute evenly):
${styleList}

Generate exactly ${count} distinct headlines. Each headline object must have "text" (the headline itself) and "style" (the style label). Return ONLY the JSON object.`;
}

/**
 * Heuristic clickbait score: rewards curiosity words, numbers, power words, short length.
 */
function scoreHeadline(text: string): number {
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

export async function generateHeadlines(config: HeadlineConfig): Promise<HeadlineResult> {
	const { styles, count } = config;
	const model = genAI.getGenerativeModel({
		model: 'gemini-3-flash-preview',
		generationConfig: {
			temperature: 0.8,
			maxOutputTokens: 4096,
			responseMimeType: 'application/json'
		}
	});

	const systemInstruction = buildSystemPrompt();
	const userPrompt = buildUserPrompt(config);

	const result = await model.generateContent({
		contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
		systemInstruction
	});

	const text = result.response.text();
	if (!text) throw new Error('No response from AI');

	let parsed: { headlines: Array<{ text: string; style: string }> };
	try {
		parsed = JSON.parse(text.trim());
	} catch (err) {
		console.error('Failed to parse headline AI response:', text);
		throw new Error('Failed to parse AI response');
	}

	if (!parsed.headlines || !Array.isArray(parsed.headlines)) {
		throw new Error('Invalid response structure');
	}

	const headlines: Headline[] = parsed.headlines.map((h, index) => ({
		id: `hl-${Date.now()}-${index}`,
		text: h.text,
		style: (h.style as HeadlineStyle) || 'curiosity',
		charLength: h.text.length,
		clickbaitScore: scoreHeadline(h.text)
	}));

	const topPicks = [...headlines].sort((a, b) => b.clickbaitScore - a.clickbaitScore).slice(0, 3);

	const styleDistribution = styles.reduce(
		(acc, s) => {
			acc[s] = headlines.filter((h) => h.style === s).length;
			return acc;
		},
		{} as Record<HeadlineStyle, number>
	);

	return { headlines, topPicks, styleDistribution };
}

export { STYLE_DESCRIPTIONS, STYLE_LABELS };
