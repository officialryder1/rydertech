import { GoogleGenerativeAI } from '@google/generative-ai';
import { GOOGLE_GEMINI_API_KEY } from '$env/static/private';

const genAI = new GoogleGenerativeAI(GOOGLE_GEMINI_API_KEY);

export async function reviewWebsite(url: string, htmlContent: string) {
	const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

	const prompt = `
You are an expert web design and UX/UI reviewer. Analyze this website and provide a detailed review.

URL: ${url}

HTML Content (first 5000 chars):
${htmlContent.slice(0, 5000)}

Provide your review in this exact JSON format:
{
  "overallScore": number (1-10),
  "categories": {
    "design": { "score": number, "feedback": "string" },
    "ux": { "score": number, "feedback": "string" },
    "performance": { "score": number, "feedback": "string" },
    "accessibility": { "score": number, "feedback": "string" },
    "seo": { "score": number, "feedback": "string" }
  },
  "strengths": ["string", "string"],
  "improvements": ["string", "string"],
  "summary": "string (2-3 sentences overall assessment)"
}

Be constructive, specific, and actionable in your feedback.
`;

	const result = await model.generateContent(prompt);
	const response = await result.response;
	const text = response.text();
	
	// Extract JSON from response (handle markdown code blocks)
	const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
	const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
	
	return JSON.parse(jsonStr);
}