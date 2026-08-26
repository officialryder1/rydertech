import { GoogleGenerativeAI } from '@google/generative-ai';
import { GOOGLE_GEMINI_API_KEY } from '$env/static/private';
import type { ClauseFinding, FullResult, SummaryResult } from './clauseScan';
import { buildSummary, defaultNextSteps } from './clauseScan';

const genAI = new GoogleGenerativeAI(GOOGLE_GEMINI_API_KEY);
const MODEL = 'gemini-3-flash-preview';

export type ContractType =
	| 'generic'
	| 'employment'
	| 'vendor'
	| 'lease'
	| 'nda'
	| 'partnership'
	| 'saas';

function extractJson(text: string): any {
	const block = text.match(/```json\n?([\s\S]*?)\n?```/);
	const raw = block ? block[1] : text.match(/\{[\s\S]*\}/)?.[0] ?? text;
	return JSON.parse(raw);
}

const SYSTEM = (mode: 'summary' | 'full', type: ContractType) =>
	`You are a contract risk reviewer for small businesses and founders in Nigeria and Africa.
Review the provided ${type} contract text. Be practical, not pedantic: flag clauses that create real
financial, legal, or operational exposure for the signing party. Explain each in plain English a non-lawyer
understands. Severity: "low" (balanced/fair), "moderate" (one-sided but survivable), "high" (materially
against the signer), "critical" (could cause major loss or strip rights).
Return ONLY valid JSON.${mode === 'summary'
		? `
Shape:
{
  "riskScore": number 1-100,
  "severity": "low"|"moderate"|"high"|"critical",
  "topRisks": [ { "clause": string, "category": string, "severity": Severity, "risk": string, "explanation": string } ],
  "verdict": "string, 1-2 sentences",
  "clauseCount": number
}
Include at most 3 worst-first items in topRisks.`
		: `
Shape:
{
  "riskScore": number 1-100,
  "severity": "low"|"moderate"|"high"|"critical",
  "clauses": [ { "clause": string, "category": string, "severity": Severity, "risk": string, "explanation": string, "redline": string } ],
  "overallAssessment": "string, 2-3 sentences",
  "recommendedNextSteps": [ "string", "string", "string" ],
  "verdict": "string, 1-2 sentences",
  "clauseCount": number
}
Include EVERY assessed clause, worst-first, and a concrete "redline" (suggested replacement wording) for each.`}`;

export async function analyzeContract(
	text: string,
	mode: 'summary' | 'full',
	type: ContractType = 'generic'
): Promise<SummaryResult | FullResult> {
	const model = genAI.getGenerativeModel({ model: MODEL });
	const prompt = `${SYSTEM(mode, type)}\n\nCONTRACT TEXT:\n"""\n${text.slice(0, 30000)}\n"""`;
	const result = await model.generateContent(prompt);
	const parsed = extractJson(await result.response.text());

	if (mode === 'summary') {
		const findings: ClauseFinding[] = (parsed.topRisks ?? []).map((r: any) => ({
			clause: String(r.clause ?? 'Clause'),
			category: String(r.category ?? 'General'),
			severity: (r.severity ?? 'moderate') as ClauseFinding['severity'],
			risk: String(r.risk ?? ''),
			explanation: String(r.explanation ?? '')
		}));
		return buildSummary(findings, String(parsed.verdict ?? ''));
	}

	const findings: ClauseFinding[] = (parsed.clauses ?? []).map((r: any) => ({
		clause: String(r.clause ?? 'Clause'),
		category: String(r.category ?? 'General'),
		severity: (r.severity ?? 'moderate') as ClauseFinding['severity'],
		risk: String(r.risk ?? ''),
		explanation: String(r.explanation ?? ''),
		redline: r.redline ? String(r.redline) : undefined
	}));
	const full: FullResult = {
		...buildSummary(findings, String(parsed.verdict ?? ''), { all: true }),
		clauses: findings,
		overallAssessment: String(parsed.overallAssessment ?? ''),
		recommendedNextSteps: Array.isArray(parsed.recommendedNextSteps)
			? parsed.recommendedNextSteps.map(String)
			: defaultNextSteps((parsed.severity as ClauseFinding['severity']) ?? 'moderate')
	};
	return full;
}
