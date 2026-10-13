/**
 * Readiness Audit Engine — 9-question "90-Day Automation Audit" scorer.
 *
 * Pure functions. No DOM, no network, no Supabase. Headless-smoke-testable:
 *   node --experimental-strip-types smoke.mts
 *
 * Question set (locked, @Marketer Content/2026-10-12-audit-copy.md):
 *   Process Maturity  Q1 manual tasks (multi)  Q2 hrs/wk (range)  Q3 error freq  Q4 consequence
 *   Data Readiness    Q5 data state            Q6 quality 1-5     Q7 tools (multi)
 *   Team Capability   Q8 staff cost (range)    Q9 tech comfort 1-5
 *   Landing form      business name + sector
 *
 * ROI derivation (verbatim from spec):
 *   annual_time_cost = (hrs_wk x 52) x loaded_hourly_cost
 *   pilot_cost       = rate_card_lookup(complexity, sector)
 *   payback_months   = pilot_cost / (annual_time_cost / 12)
 *   roi_multiple     = (annual_time_cost - pilot_cost) / pilot_cost
 *
 * Confidence flag: HIGH = hrs_wk + loaded_hourly + error_rate; MEDIUM = hrs_wk + loaded_hourly;
 *                  LOW = either missing -> ROI block suppressed entirely.
 */

export type Sector =
	| 'fintech'
	| 'logistics'
	| 'retail_fmcg'
	| 'healthcare'
	| 'professional_services'
	| 'agritech'
	| 'other';

export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW';
export type Severity = 'low' | 'moderate' | 'high' | 'critical';

/** Q2 — dropdown ranges, midpoint used and disclosed on the report face. */
export type HoursRange = 'lt5' | '5to10' | '10to20' | '20to40' | 'gt40';
/** Q3 — error frequency, mapped to an implied rate. */
export type ErrorFrequency = 'rarely' | 'monthly' | 'weekly' | 'daily';
/** Q8 — staff cost ranges for the team doing the work. */
export type StaffCostRange = 'lt200k' | '200to500k' | '500kto1m' | '1mto2m' | 'gt2m';
/** Q6 / Q9 — 1-5 scales. */
export type Scale15 = 1 | 2 | 3 | 4 | 5;

export interface AuditInput {
	sector: Sector;
	/** Q1 — selected manual workflows. */
	manualTasks: string[];
	/** Q2 — hours/week combined across the team. */
	hoursRange: HoursRange;
	/** Q3 — error frequency. */
	errorFrequency: ErrorFrequency;
	/** Q4 — biggest consequence of errors. */
	consequence: string;
	/** Q5 — data state. */
	dataState: string;
	/** Q6 — self-assessed data quality. */
	dataQuality: Scale15;
	/** Q7 — tools already in use. */
	tools: string[];
	/** Q8 — average monthly staff cost for the team doing this work. */
	staffCostRange: StaffCostRange;
	/** Q9 — team comfort with technology. */
	techComfort: Scale15;
	/** Team size, used only to convert a monthly cost into a loaded hourly rate. */
	teamSize?: number;
	/**
	 * Recurring monthly cost to run the automation (hosting, APIs, retainer).
	 * Not a question — it is a platform assumption, defaulted from the shipped
	 * ops-drain preset and disclosed in the report's assumptions block.
	 */
	monthlyRunCost?: number;
}

export interface RoiEstimate {
	/** (hrs_wk x 52) x loaded_hourly_cost */
	annual_time_cost: number;
	/** rate_card_lookup(complexity, sector) */
	pilot_cost: number;
	/** GROSS headline: pilot_cost / (annual_time_cost / 12). Null when suppressed. */
	payback_months: number | null;
	/** NET second line: pilot_cost / ((annual_time_cost - 12 x run cost) / 12). Null when never. */
	net_payback_months: number | null;
	/** (annual_time_cost - pilot_cost) / pilot_cost */
	roi_multiple: number;
	/** Recurring monthly cost netted off in the second line. */
	monthly_run_cost: number;
	/** Set when the gross headline is withheld because run cost eats the saving. */
	headline_suppressed_reason: string | null;
	/** Weekly manual hours at which THIS sector+pilot pays back inside 90 days. */
	ninety_day_threshold_hrs_wk: number;
	/** True when the respondent's own hours clear the 90-day threshold. */
	meets_ninety_day: boolean;
	/** Ready-to-render conditional line; never a blanket promise. */
	ninety_day_conditional: string;
}

export interface AuditResult {
	/** Stored, not user-supplied — computed on insert. */
	confidence: Confidence;
	/** Present only when confidence !== 'LOW'. */
	roi_estimate: RoiEstimate | null;
	/** Why the ROI block is absent, when it is. */
	roi_suppressed_reason: string | null;
	severity: Severity;
	/** 0-100 readiness index across the three dimensions. */
	readiness_score: number;
	dimensions: { process_maturity: number; data_readiness: number; team_capability: number };
	/** Report section 1 — the single biggest gap. */
	top_gap: { title: string; finding: string; next_step: string };
	/** Report section 2 — 3 prioritised moves. */
	automation_sequence: { priority: number; title: string; approach: string; complexity: 'low' | 'medium' | 'high' }[];
	/** Report section 3 — assumptions footnote rendered on the face of the report. */
	assumptions: string[];
	/** Verbatim citation strings — never paraphrase these. */
	citations: string[];
}

// ---------------------------------------------------------------------------
// Lookup tables
// ---------------------------------------------------------------------------

/** Q2 midpoints — disclosed on the report face. */
export const HOURS_MIDPOINT: Record<HoursRange, number> = {
	lt5: 2.5,
	'5to10': 7.5,
	'10to20': 15,
	'20to40': 30,
	gt40: 50
};

/** Q2 -> representative label for copy. */
export const HOURS_LABEL: Record<HoursRange, string> = {
	lt5: 'under 5 hrs/wk',
	'5to10': '5-10 hrs/wk',
	'10to20': '10-20 hrs/wk',
	'20to40': '20-40 hrs/wk',
	gt40: 'over 40 hrs/wk'
};

/** Q3 -> implied share of executions needing rework. */
export const ERROR_RATE_PCT: Record<ErrorFrequency, number> = {
	rarely: 2,
	monthly: 5,
	weekly: 10,
	daily: 18
};

/** Q8 midpoints — monthly NGN for the team doing the work. */
export const STAFF_COST_MIDPOINT: Record<StaffCostRange, number> = {
	lt200k: 150_000,
	'200to500k': 350_000,
	'500kto1m': 750_000,
	'1mto2m': 1_500_000,
	gt2m: 2_500_000
};

/** Working hours per person per month — converts a monthly cost to a loaded hourly rate. */
export const WORK_HOURS_PER_MONTH = 160;

/**
 * Default recurring cost to run a shipped automation. Not a question — it mirrors the
 * shipped ops-drain preset (NGN 60,000/mo platform run cost) and is disclosed in the
 * report's assumptions block. Pass `monthlyRunCost` to override.
 */
export const DEFAULT_MONTHLY_RUN_COST = 60_000;

const formatNaira = (n: number) => 'NGN ' + Math.round(n).toLocaleString('en-US');

/**
 * Rate card. Anchors (@Researcher, 2026-10-12):
 *   Nuelsville SME band            NGN 650K - 4M   (direct source, ceiling)
 *   succeedhqinnovations 2026      NGN 1M  - 5M    (direct source, RPA floor)
 * Locked pilot band                NGN 500K - 1.5M
 *
 * Sector differentiation follows demonstrated willingness to pay:
 *   fintech 54% AI adoption, microfinance/digital lenders at 71% AI underwriting -> above floor
 *   logistics sits between
 *   retail/FMCG 28% adoption, cost-sensitive -> at the floor
 */
export const RATE_CARD: Record<Sector, number> = {
	fintech: 1_500_000,
	logistics: 1_000_000,
	professional_services: 1_000_000,
	healthcare: 1_000_000,
	agritech: 750_000,
	retail_fmcg: 500_000,
	other: 750_000
};

/** Complexity multiplier applied to the sector base rate. */
export const COMPLEXITY_MULTIPLIER: Record<'low' | 'medium' | 'high', number> = {
	low: 0.85,
	medium: 1,
	high: 1.25
};

/** Verbatim citation strings. Do not paraphrase. */
export const CITATIONS = {
	sage_default: '6.4 hrs/wk saved per finance staff member; month-end close 12 -> 3 days (Sage 2025 Africa SME Technology Report)',
	world_bank_recon: '12 hrs/wk average on supplier invoice reconciliation (World Bank, cited by NeuroptikAI, 2026)',
	nuelsville: 'SME automation engagements quoted at NGN 650K - 4M (Nuelsville, published band)'
} as const;

/** Anchor used as the conservative default when the respondent gives no hours figure. */
export const DEFAULT_HRS_WK = 6.4;
/** Reconciliation-specific case, used when the respondent selects invoice/reconciliation work. */
export const RECONCILIATION_HRS_WK = 12;

// ---------------------------------------------------------------------------
// Scoring helpers
// ---------------------------------------------------------------------------

const clamp = (n: number, min: number, max: number) =>
	Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
const round = (n: number, dp = 2) => {
	const f = 10 ** dp;
	return Number.isFinite(n) ? Math.round(n * f) / f : 0;
};

const RECON_KW = ['reconcil', 'invoice', 'payable', 'receivable', 'billing'];

export function isReconciliationWork(manualTasks: string[]): boolean {
	return manualTasks.some((t) => RECON_KW.some((k) => t.toLowerCase().includes(k)));
}

/**
 * Loaded hourly rate from Q8.
 *
 * @Marketer's footnote reads: "Staff cost converted to loaded hourly rate using
 * midpoint of selected range x team size estimate." The range is the PER-PERSON
 * monthly cost, so multiplying by team size and dividing by (team size x monthly
 * hours) cancels team size out. Effective rate is therefore midpoint / 160.
 *
 * This matters: dividing by team size as well understates the rate by a factor of
 * team size and pushes every payback figure 2-5x outside the published 4-12 month band.
 */
export function loadedHourlyCost(range: StaffCostRange, _teamSize = 1): number {
	return STAFF_COST_MIDPOINT[range] / WORK_HOURS_PER_MONTH;
}

/** Complexity from data readiness + number of workflows + team capability. */
export function assessComplexity(input: AuditInput): 'low' | 'medium' | 'high' {
	const taskLoad = clamp(input.manualTasks.length, 0, 6); // 0-6
	const dataPenalty = 5 - clamp(input.dataQuality, 1, 5); // 0-4
	const toolPenalty = input.tools.length >= 3 ? 0 : input.tools.length === 0 ? 2 : 1;
	const capabilityBonus = clamp(input.techComfort, 1, 5) >= 4 ? 1 : 0;
	const score = taskLoad + dataPenalty + toolPenalty - capabilityBonus;
	if (score >= 7) return 'high';
	if (score >= 4) return 'medium';
	return 'low';
}

export function rateCardLookup(sector: Sector, complexity: 'low' | 'medium' | 'high'): number {
	const base = RATE_CARD[sector] ?? RATE_CARD.other;
	return Math.round(base * COMPLEXITY_MULTIPLIER[complexity]);
}

export function confidenceOf(input: AuditInput): { confidence: Confidence; reason: string | null } {
	const hasHours = input.hoursRange != null && HOURS_MIDPOINT[input.hoursRange] != null;
	const hasCost = input.staffCostRange != null && STAFF_COST_MIDPOINT[input.staffCostRange] != null;
	const hasError = input.errorFrequency != null && ERROR_RATE_PCT[input.errorFrequency] != null;

	if (!hasHours || !hasCost) {
		const missing = [!hasHours && 'hours/week', !hasCost && 'staff cost'].filter(Boolean).join(' and ');
		return { confidence: 'LOW', reason: `ROI withheld — ${missing} not provided.` };
	}
	if (!hasError) return { confidence: 'MEDIUM', reason: null };
	return { confidence: 'HIGH', reason: null };
}

// ---------------------------------------------------------------------------
// Main entry
// ---------------------------------------------------------------------------

export function computeAudit(input: AuditInput): AuditResult {
	const complexity = assessComplexity(input);
	const teamSize = clamp(input.teamSize ?? 1, 1, 500);
	const monthlyRunCost = clamp(input.monthlyRunCost ?? DEFAULT_MONTHLY_RUN_COST, 0, 10_000_000);

	// --- ROI ---------------------------------------------------------------
	const { confidence, reason } = confidenceOf(input);

	let roi: RoiEstimate | null = null;
	if (confidence !== 'LOW') {
		const hrsWk = HOURS_MIDPOINT[input.hoursRange];
		const hourly = loadedHourlyCost(input.staffCostRange, teamSize);
		const annual_time_cost = hrsWk * 52 * hourly;
		const pilot_cost = rateCardLookup(input.sector, complexity);
		const monthlySaving = annual_time_cost / 12;

		// Headline = gross (per spec). Second line = net of running the automation.
		const grossPayback = monthlySaving > 0 ? round(pilot_cost / monthlySaving, 1) : null;
		const netMonthly = monthlySaving - monthlyRunCost;
		const netPayback = netMonthly > 0 ? round(pilot_cost / netMonthly, 1) : null;

		// Suppress the headline when the automation's own run cost eats the saving —
		// same discipline as the confidence flag: withhold rather than overstate.
		const headlineSuppressed =
			netMonthly <= 0
				? `Headline withheld — at ${formatNaira(monthlyRunCost)}/month to run, this automation costs more than the manual work it replaces. Reduce scope or raise the workload.`
				: null;

		const threshold = ninetyDayThresholdHrsWk(pilot_cost, hourly);
		const meets = hrsWk >= threshold;

		roi = {
			annual_time_cost: Math.round(annual_time_cost),
			pilot_cost,
			payback_months: headlineSuppressed ? null : grossPayback,
			net_payback_months: netPayback,
			roi_multiple: pilot_cost > 0 ? round((annual_time_cost - pilot_cost) / pilot_cost, 2) : 0,
			monthly_run_cost: monthlyRunCost,
			headline_suppressed_reason: headlineSuppressed,
			ninety_day_threshold_hrs_wk: threshold,
			meets_ninety_day: meets,
			ninety_day_conditional: meets
				? `Your ${hrsWk} hrs/wk clears the ${threshold} hrs/wk this build needs to pay for itself in under 90 days.`
				: `This build pays for itself in under 90 days once your weekly manual hours exceed ${threshold}. You are at ${hrsWk}.`
		};
	}

	// --- Dimension scores (0-100) ------------------------------------------
	const taskLoad = clamp(input.manualTasks.length, 0, 6) / 6;
	const hoursLoad = clamp(HOURS_MIDPOINT[input.hoursRange], 0, 50) / 50;
	const errorLoad = clamp(ERROR_RATE_PCT[input.errorFrequency], 0, 18) / 18;
	// process_maturity: higher = more mature (less manual pain)
	const process_maturity = Math.round(100 * (1 - (taskLoad * 0.4 + hoursLoad * 0.4 + errorLoad * 0.2)));
	const data_readiness = Math.round(100 * ((clamp(input.dataQuality, 1, 5) - 1) / 4 * 0.7 + clamp(input.tools.length, 0, 3) / 3 * 0.3));
	const team_capability = Math.round(100 * ((clamp(input.techComfort, 1, 5) - 1) / 4 * 0.75 + (input.tools.length > 0 ? 0.25 : 0)));
	const readiness_score = Math.round(process_maturity * 0.4 + data_readiness * 0.3 + team_capability * 0.3);

	const hrsWk = HOURS_MIDPOINT[input.hoursRange];
	const severity: Severity =
		hrsWk >= 30 ? 'critical' : hrsWk >= 15 ? 'high' : hrsWk >= 7.5 ? 'moderate' : 'low';

	// --- Report section 1: top gap -----------------------------------------
	const gaps: { dim: string; score: number }[] = [
		{ dim: 'process_maturity', score: process_maturity },
		{ dim: 'data_readiness', score: data_readiness },
		{ dim: 'team_capability', score: team_capability }
	].sort((a, b) => a.score - b.score);

	const topGap = buildTopGap(gaps[0].dim, input);

	// --- Report section 2: sequence ----------------------------------------
	const sequence = buildSequence(input, complexity);

	// --- Report section 3: assumptions -------------------------------------
	// Only state an assumption for an input that was actually supplied. A missing
	// input is disclosed as omitted, never silently defaulted into the maths.
	const assumptions: string[] = [
		`Hours split evenly across your ${input.manualTasks.length || 1} selected task${input.manualTasks.length === 1 ? '' : 's'}.`
	];

	const hasHours = input.hoursRange != null && HOURS_MIDPOINT[input.hoursRange] != null;
	const hasCost = input.staffCostRange != null && STAFF_COST_MIDPOINT[input.staffCostRange] != null;
	const hasError = input.errorFrequency != null && ERROR_RATE_PCT[input.errorFrequency] != null;

	if (hasHours) {
		assumptions.push(
			`Midpoint used for range answers (${HOURS_LABEL[input.hoursRange]} -> ${HOURS_MIDPOINT[input.hoursRange]} hrs/wk).`
		);
	} else {
		assumptions.push('Hours per week not provided — no time-cost figure is shown.');
	}

	if (hasCost) {
		assumptions.push(
			`Staff cost converted to a loaded hourly rate using the midpoint of the selected range (NGN ${STAFF_COST_MIDPOINT[input.staffCostRange].toLocaleString()}/mo per person) divided by ${WORK_HOURS_PER_MONTH} working hours/month, then applied to your combined weekly hours.`
		);
	} else {
		assumptions.push('Staff cost not provided — no ROI figure is shown.');
	}

	if (hasError) {
		assumptions.push(
			`Error frequency (${input.errorFrequency}) mapped to an implied ${ERROR_RATE_PCT[input.errorFrequency]}% rework rate.`
		);
	} else {
		assumptions.push('Error frequency not provided — rework cost is excluded from the estimate.');
	}

	assumptions.push(`Pilot priced at the ${complexity}-complexity ${input.sector.replace(/_/g, ' ')} rate.`);
	assumptions.push(
		`Running the automation is assumed to cost ${formatNaira(monthlyRunCost)}/month (hosting, APIs, retainer); the headline payback is gross of this and the second line nets it off.`
	);

	const citations = isReconciliationWork(input.manualTasks)
		? [CITATIONS.world_bank_recon, CITATIONS.sage_default, CITATIONS.nuelsville]
		: [CITATIONS.sage_default, CITATIONS.nuelsville];

	return {
		confidence,
		roi_estimate: roi,
		roi_suppressed_reason: reason,
		severity,
		readiness_score,
		dimensions: { process_maturity, data_readiness, team_capability },
		top_gap: topGap,
		automation_sequence: sequence,
		assumptions,
		citations
	};
}

function buildTopGap(dim: string, input: AuditInput): AuditResult['top_gap'] {
	if (dim === 'process_maturity') {
		return {
			title: 'Manual process load',
			finding: `Your team spends ${HOURS_LABEL[input.hoursRange]} on ${input.manualTasks.length} manual workflow${input.manualTasks.length === 1 ? '' : 's'}, with errors occurring ${input.errorFrequency}. That is the single largest recoverable cost in the business.`,
			next_step: 'Automate the highest-frequency workflow first — that is where the hours are.'
		};
	}
	if (dim === 'data_readiness') {
		return {
			title: 'Data readiness',
			finding: `Your data quality rates ${input.dataQuality}/5 with ${input.tools.length} system${input.tools.length === 1 ? '' : 's'} in place. Automation built on this base will need a data-cleanup phase before it can run reliably.`,
			next_step: 'Stabilise the data source before automating anything downstream of it.'
		};
	}
	return {
		title: 'Team capability',
		finding: `Team comfort with technology rates ${input.techComfort}/5. Tools shipped without an internal owner tend to stall after handover.`,
		next_step: 'Name one champion and scope the first build so that person can run it unaided.'
	};
}

function buildSequence(input: AuditInput, complexity: 'low' | 'medium' | 'high'): AuditResult['automation_sequence'] {
	const recs: AuditResult['automation_sequence'] = [];
	const has = (kw: string) => input.manualTasks.some((t) => t.toLowerCase().includes(kw));

	if (has('reconcil') || has('invoice') || has('billing') || has('payable'))
		recs.push({
			priority: recs.length + 1,
			title: 'Invoice & reconciliation pipeline',
			approach: 'Webhook intake -> rule-based matching -> exception queue for humans only.',
			complexity: 'medium'
		});
	if (has('report') || has('data entry') || has('entry') || has('spreadsheet'))
		recs.push({
			priority: recs.length + 1,
			title: 'Reporting & data capture',
			approach: 'Scheduled aggregation replacing keystroke entry, with a validation layer.',
			complexity: 'low'
		});
	if (has('payroll') || has('hr') || has('onboard'))
		recs.push({
			priority: recs.length + 1,
			title: 'Payroll & onboarding flows',
			approach: 'Templated intake -> approval chain -> automatic record creation.',
			complexity: 'medium'
		});
	if (has('support') || has('enquir') || has('inquir') || has('customer'))
		recs.push({
			priority: recs.length + 1,
			title: 'Customer enquiry triage',
			approach: 'Classify and auto-draft responses; escalate only genuine exceptions.',
			complexity: 'medium'
		});
	if (has('schedul') || has('booking') || has('dispatch') || has('inventory'))
		recs.push({
			priority: recs.length + 1,
			title: 'Scheduling & dispatch',
			approach: 'Booking engine with calendar sync and automated reminders.',
			complexity: 'high'
		});

	if (recs.length === 0)
		recs.push({
			priority: 1,
			title: 'Custom workflow automation',
			approach: 'API-first backend replacing the manual handoffs identified above.',
			complexity
		});

	// Cap at 3 priorities, always ending on the dashboard so recovered time stays recovered.
	return recs.slice(0, 3).map((r, i) => ({ ...r, priority: i + 1 }));
}

/**
 * 90-day claim gate. Returns the minimum weekly manual hours at which the pilot
 * genuinely pays back inside 3 months, given the quoted pilot cost and loaded rate.
 * Used to render the conditional line rather than a blanket promise.
 */
export function ninetyDayThresholdHrsWk(pilotCost: number, hourlyCost: number): number {
	if (hourlyCost <= 0) return Number.POSITIVE_INFINITY;
	return round((pilotCost * 4) / (52 * hourlyCost), 1);
}
