/**
 * RevLeak Engine
 * Converts site-speed metrics + traffic + order value into estimated monthly/annual
 * revenue lost to a slow site. Pure functions — no DOM, no network.
 * Loss model: conversion decay as load time climbs past the 2s "good" threshold.
 */

export interface EngineInput {
	/** monthly unique visitors arriving at the conversion path */
	monthlyVisitors: number;
	/** current conversion rate, % (orders / visitors) */
	conversionRate: number;
	/** average order / customer value in the chosen currency */
	avgOrderValue: number;
	/** measured or estimated full load time, seconds */
	loadTimeSeconds: number;
	/** display currency */
	currency: 'NGN' | 'USD';
}

export interface EngineResult {
	/** conversion fraction lost to slow load, % */
	lostConversionPct: number;
	/** conversion rate they'd hold at a 2s load, % */
	conversionRateOptimal: number;
	/** orders lost per month to slow load */
	lostOrdersPerMonth: number;
	/** revenue lost per month */
	monthlyLeak: number;
	/** revenue lost per year */
	annualLeak: number;
	/** revenue retained per year if fixed */
	recoverableAnnual: number;
	severity: 'low' | 'moderate' | 'high' | 'critical';
	verdict: string;
	enhancements: string[];
}

const OPTIMAL_LOAD_S = 2; // Google's "good" threshold for LCP-ish full load
const DECAY_PER_SEC = 0.09; // ~9% of conversions lost per second over optimal (capped)
const MAX_LOST = 0.7; // never attribute more than 70% of conversion to speed

const clamp = (n: number, min: number, max: number) =>
	Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;

const round = (n: number) => (Number.isFinite(n) ? Math.round(n * 100) / 100 : 0);

export function computeRevLeak(input: EngineInput): EngineResult {
	const visitors = clamp(input.monthlyVisitors, 0, 50_000_000);
	const conv = clamp(input.conversionRate, 0.01, 100);
	const aov = clamp(input.avgOrderValue, 0, 100_000_000);
	const load = clamp(input.loadTimeSeconds, 0.1, 60);

	// Conversion lost to slow load.
	const over = Math.max(0, load - OPTIMAL_LOAD_S);
	const lostFraction = clamp(over * DECAY_PER_SEC, 0, MAX_LOST);
	const lostConversionPct = round(lostFraction * 100);

	// Conversion they'd hold at optimal load (recoverable base).
	const conversionRateOptimal = round(conv / (1 - lostFraction));

	const ordersNow = (visitors * conv) / 100;
	const ordersOptimal = (visitors * conversionRateOptimal) / 100;
	const lostOrdersPerMonth = round(ordersOptimal - ordersNow);

	const revenueNow = ordersNow * aov;
	const revenueOptimal = ordersOptimal * aov;
	const monthlyLeak = round(revenueOptimal - revenueNow);
	const annualLeak = round(monthlyLeak * 12);
	const recoverableAnnual = annualLeak;

	// Severity tiers on annual leak size (currency-agnostic thresholds scaled).
	let severity: EngineResult['severity'] = 'low';
	if (annualLeak >= 20_000_000 || lostConversionPct >= 40) severity = 'critical';
	else if (annualLeak >= 4_000_000 || lostConversionPct >= 22) severity = 'high';
	else if (annualLeak >= 600_000 || lostConversionPct >= 10) severity = 'moderate';

	const verdict =
		severity === 'critical'
			? 'Critical. Your site is quietly burning six figures a year at the gate.'
			: severity === 'high'
				? 'High drag. A slow site is costing you real revenue every single month.'
				: severity === 'moderate'
					? 'Moderate leak. Speed is shaving orders off your best traffic.'
					: 'Minor today — but every second you add later compounds the loss.';

	const enhancements = [
		'Full Core Web Vitals audit — LCP, INP, and CLS measured on real devices, not lab averages.',
		'Asset pipeline rebuild — image compression, modern formats (WebP/AVIF), and code-splitting to cut load time.',
		'Edge delivery — CDN + caching so first paint lands in under 1s for visitors everywhere.',
		'Render-path fix — eliminate render-blocking JS/CSS and defer third-party scripts dragging the gate.',
		'Conversion recovery sprint — re-test after the fix and quantify the recovered revenue.'
	];

	return {
		lostConversionPct,
		conversionRateOptimal,
		lostOrdersPerMonth,
		monthlyLeak,
		annualLeak,
		recoverableAnnual,
		severity,
		verdict,
		enhancements
	};
}
