/**
 * Local Visibility Engine
 * Turns a business's local-presence inputs into a 0-100 "findability" score,
 * an estimate of how many local customers search but can't find them, and the
 * revenue that leak represents — then maps the gaps to a RyderTech fix plan.
 *
 * Pure functions — no DOM, no network. Reuses opsDrain's formatMoney for output.
 * All "search volume" numbers are transparent ESTIMATES (clearly labelled) so the
 * tool works with zero external APIs (no Places API key, no cost).
 */

export type Currency = 'NGN' | 'USD';

export interface EngineInput {
	/** business / brand name — for personalised report + share link */
	businessName: string;
	/** coarse category used for the local-search-volume estimate */
	category: string;
	/** city — drives the local-search-volume multiplier */
	city: string;
	/** owns a working website */
	haveWebsite: boolean;
	/** that website works properly on phones */
	websiteResponsive: boolean;
	/** has a Google Business Profile */
	haveGoogleBusinessProfile: boolean;
	/** the profile is verified (owns the listing) */
	gbpVerified: boolean;
	/** number of Google reviews on the profile */
	gbpReviews: number;
	/** average star rating (1-5) */
	gbpRating: number;
	/** currently pays for Google/Facebook ads to fill the gap */
	runPaidAds: boolean;
	/** relies mainly on Instagram/Facebook and has no real website */
	socialOnly: boolean;
	/** average value of one new customer, in the chosen currency */
	avgCustomerValue: number;
	currency: Currency;
}

export type Findability = 'invisible' | 'hard-to-find' | 'findable' | 'dominant';
export type Severity = 'low' | 'moderate' | 'high' | 'critical';

export interface Gap {
	factor: string;
	impact: string;
	severity: Severity;
}

export interface EngineResult {
	/** 0-100 local visibility score */
	score: number;
	findability: Findability;
	/** estimated local searches/month for this category+city (illustrative) */
	estMonthlySearches: number;
	/** estimated local customers searching but unable to find you each month */
	estMissed: number;
	/** estMissed × avgCustomerValue — annualised revenue left on the table */
	revenueAtRisk: number;
	/** ranked gaps holding the score down */
	gaps: Gap[];
	severity: Severity;
	verdict: string;
	enhancements: string[];
}

// ---- Estimate tables (transparent, illustrative) ----
const CATEGORY_SEARCHES: Record<string, number> = {
	restaurant: 12000,
	salon_barber: 9000,
	hotel: 8000,
	real_estate: 15000,
	law_firm: 5000,
	clinic_hospital: 10000,
	retail_shop: 11000,
	event_planner: 4000,
	gym_fitness: 6000,
	school: 7000,
	auto_mechanic: 5000,
	tech_services: 6000,
	other: 5000
};

const CITY_MULT: Record<string, number> = {
	lagos: 1.0,
	abuja: 0.55,
	'port harcourt': 0.4,
	ibadan: 0.35,
	kano: 0.3
};

const clamp = (n: number, min: number, max: number) =>
	Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
const round = (n: number) => (Number.isFinite(n) ? Math.round(n * 100) / 100 : 0);

function reviewTierPoints(reviews: number): number {
	if (reviews >= 50) return 8;
	if (reviews >= 10) return 5;
	if (reviews >= 1) return 3;
	return 0;
}

function ratingPoints(rating: number): number {
	if (rating >= 4.3) return 6;
	if (rating >= 3.5) return 4;
	if (rating > 0) return -6; // visible but poor rating actively hurts
	return 0;
}

function severityRank(s: Severity): number {
	return s === 'critical' ? 3 : s === 'high' ? 2 : s === 'moderate' ? 1 : 0;
}

function findabilitySeverity(f: Findability): Severity {
	return f === 'invisible' ? 'critical' : f === 'hard-to-find' ? 'high' : f === 'findable' ? 'moderate' : 'low';
}

function scoreLocalVisibility(input: EngineInput): number {
	let s = 0;

	// Website (max 30)
	if (input.haveWebsite) s += 18;
	if (input.haveWebsite && input.websiteResponsive) s += 12;

	// Google Business Profile (max ~45 with reviews/rating)
	if (input.haveGoogleBusinessProfile) s += 18;
	if (input.gbpVerified) {
		s += 12;
		s += reviewTierPoints(input.gbpReviews);
		s += ratingPoints(input.gbpRating);
	}

	// Ownership + consistency (max 15)
	if (!input.socialOnly) s += 8; // owns a real digital asset, not just social handles
	if (input.haveWebsite && input.gbpVerified) s += 7; // consistent NAP across web + maps

	// Paid buffer (max 10) — fills the gap but at a recurring cost
	if (input.runPaidAds) s += 10;

	return s;
}

function buildGaps(input: EngineInput): Gap[] {
	const gaps: Gap[] = [];

	if (!input.haveWebsite) {
		gaps.push({
			factor: 'No website',
			impact: '~46% of all Google searches have local intent — most never reach you.',
			severity: 'critical'
		});
	} else if (!input.websiteResponsive) {
		gaps.push({
			factor: 'Website not mobile-ready',
			impact: 'Most local searches happen on phones; a broken mobile site sinks you in rankings.',
			severity: 'high'
		});
	}

	if (!input.haveGoogleBusinessProfile) {
		gaps.push({
			factor: 'No Google Business Profile',
			impact: 'You are absent from Google Maps and the local 3-pack — invisible for "near me".',
			severity: 'critical'
		});
	} else if (!input.gbpVerified) {
		gaps.push({
			factor: 'Unverified listing',
			impact: 'An unverified profile cannot show reviews or rank in local results.',
			severity: 'high'
		});
	} else {
		if (input.gbpReviews < 10) {
			gaps.push({
				factor: 'Too few reviews',
				impact: 'Under 10 reviews and you lose the click to better-rated competitors.',
				severity: input.gbpReviews < 1 ? 'high' : 'moderate'
			});
		}
		if (input.gbpRating > 0 && input.gbpRating < 4.0) {
			gaps.push({
				factor: 'Low star rating',
				impact: `A ${input.gbpRating.toFixed(1)}★ average actively pushes customers to rivals.`,
				severity: 'high'
			});
		}
	}

	if (input.socialOnly && !input.haveWebsite) {
		gaps.push({
			factor: 'Social-only presence',
			impact: 'Instagram/Facebook followers are rented audiences — you own no searchable asset.',
			severity: 'high'
		});
	}

	return gaps.sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
}

function buildVerdict(f: Findability, input: EngineInput): string {
	const name = input.businessName?.trim() || 'Your business';
	switch (f) {
		case 'invisible':
			return `${name} is effectively invisible to local search. Customers in ${input.city || 'your city'} are finding competitors, not you.`;
		case 'hard-to-find':
			return `${name} shows up only some of the time. You win the searches you should, but bleed the rest to better-optimised rivals.`;
		case 'findable':
			return `${name} is reasonably findable — but the top of the local results is still up for grabs.`;
		case 'dominant':
			return `${name} owns its local search presence. Keep the reviews and citations flowing to stay there.`;
	}
}

function buildEnhancements(): string[] {
	return [
		'Claim & verify a Google Business Profile with accurate name, address, phone, hours, and categories.',
		'Launch a fast, mobile-first website — most local searches happen on phones, and Google ranks for it.',
		'Build a reviews engine — automated follow-ups to push past 20+ genuine five-star reviews.',
		'Lay a local SEO foundation — location pages, LocalBusiness schema, and consistent citations.',
		'Own your audience — convert social followers into website subscribers and email you control.'
	];
}

export function computeLocalVisibility(input: EngineInput): EngineResult {
	const scoreRaw = scoreLocalVisibility(input);
	const score = clamp(Math.round(scoreRaw), 0, 100);

	const findability: Findability =
		score >= 80 ? 'dominant' : score >= 55 ? 'findable' : score >= 30 ? 'hard-to-find' : 'invisible';

	// Estimate local search demand for this category + city.
	const catBase = CATEGORY_SEARCHES[input.category] ?? CATEGORY_SEARCHES.other;
	const cityMult = CITY_MULT[input.city.trim().toLowerCase()] ?? 0.25;
	const estMonthlySearches = Math.round(catBase * cityMult);

	// Conservative: only ~12% of the searches a business is "missing" are reachable
	// new customers once the gaps are fixed. Clearly an estimate.
	const estMissed = Math.round(estMonthlySearches * (1 - score / 100) * 0.12);
	const revenueAtRisk = round(estMissed * 12 * input.avgCustomerValue);

	const gaps = buildGaps(input);
	const severity = findabilitySeverity(findability);
	const verdict = buildVerdict(findability, input);
	const enhancements = buildEnhancements();

	return {
		score,
		findability,
		estMonthlySearches,
		estMissed,
		revenueAtRisk,
		gaps,
		severity,
		verdict,
		enhancements
	};
}
