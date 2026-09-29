/**
 * Type definition for the website review result returned by /api/review.
 * Mirrors the JSON contract from gemini.ts#reviewWebsite.
 */

export interface ReviewCategory {
	score: number;
	feedback: string;
}

export interface ReviewResult {
	overallScore: number;
	categories: {
		design: ReviewCategory;
		ux: ReviewCategory;
		performance: ReviewCategory;
		accessibility: ReviewCategory;
		seo: ReviewCategory;
	};
	strengths: string[];
	improvements: string[];
	summary: string;
}
