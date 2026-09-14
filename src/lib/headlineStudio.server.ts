/**
 * AI Headline Studio — Server-only Gemini API integration.
 * This file MUST NOT be imported from client-side code.
 * It imports $env/static/private which is server-only.
 *
 * The API endpoint src/routes/(labs)/api/headlines/+server.ts imports
 * generateHeadlines from here. The browser-safe types, constants, and
 * scoring functions live in headlineStudio.ts.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GOOGLE_GEMINI_API_KEY } from '$env/static/private';
import type { Headline, HeadlineConfig, HeadlineResult, HeadlineStyle } from './headlineStudio';
import { STYLE_DESCRIPTIONS, STYLE_LABELS, scoreHeadline } from './headlineStudio';

const genAI = new GoogleGenerativeAI(GOOGLE_GEMINI_API_KEY ?? '');

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
}`;
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
