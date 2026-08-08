/**
 * Ops Drain Engine
 * Converts manual-process inputs into annual cost, automation ROI, and payback.
 * Pure functions — no DOM, no network. Unit-testable via node.
 */

export type Frequency = 'daily' | 'weekly' | 'monthly';

export interface TaskInput {
	id: string;
	label: string;
	/** people involved in this task */
	people: number;
	/** minutes per single execution, per person */
	minutesEach: number;
	frequency: Frequency;
	/** 0-100, share of executions needing rework */
	errorRatePct: number;
	/** 0-100, realistic share of this task automation removes */
	automatablePct: number;
}

export interface EngineInput {
	/** fully-loaded cost per staff hour, in the chosen currency */
	hourlyCost: number;
	tasks: TaskInput[];
	/** one-off build cost quoted for the automation */
	buildCost: number;
	/** recurring monthly cost to run the automation (hosting, API, retainer) */
	monthlyRunCost: number;
}

export interface TaskResult {
	id: string;
	label: string;
	annualHours: number;
	reworkHours: number;
	totalHours: number;
	annualCost: number;
	recoverableHours: number;
	recoverableCost: number;
}

export interface EngineResult {
	tasks: TaskResult[];
	totalAnnualHours: number;
	totalAnnualCost: number;
	recoverableAnnualHours: number;
	recoverableAnnualCost: number;
	/** recoverable cost net of running the automation for a year */
	netAnnualSaving: number;
	/** months until the build pays for itself; null = never at this saving rate */
	paybackMonths: number | null;
	/** first-year return on the build+run investment, as a percentage */
	firstYearRoiPct: number;
	/** working days of staff time freed per year (8h day) */
	daysFreedPerYear: number;
	severity: 'low' | 'moderate' | 'high' | 'critical';
}

const OCCURRENCES_PER_YEAR: Record<Frequency, number> = {
	daily: 260, // working days
	weekly: 52,
	monthly: 12
};

const clamp = (n: number, min: number, max: number) =>
	Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;

export function computeTask(task: TaskInput, hourlyCost: number): TaskResult {
	const people = clamp(task.people, 0, 10_000);
	const minutes = clamp(task.minutesEach, 0, 60 * 24);
	const errorRate = clamp(task.errorRatePct, 0, 100) / 100;
	const automatable = clamp(task.automatablePct, 0, 100) / 100;
	const occurrences = OCCURRENCES_PER_YEAR[task.frequency] ?? 12;

	const annualHours = (minutes / 60) * people * occurrences;
	// rework is assumed to cost the same again for the failed share
	const reworkHours = annualHours * errorRate;
	const totalHours = annualHours + reworkHours;

	const annualCost = totalHours * clamp(hourlyCost, 0, 1_000_000);
	const recoverableHours = totalHours * automatable;
	const recoverableCost = recoverableHours * clamp(hourlyCost, 0, 1_000_000);

	return {
		id: task.id,
		label: task.label,
		annualHours: round(annualHours),
		reworkHours: round(reworkHours),
		totalHours: round(totalHours),
		annualCost: round(annualCost),
		recoverableHours: round(recoverableHours),
		recoverableCost: round(recoverableCost)
	};
}

export function computeDrain(input: EngineInput): EngineResult {
	const hourlyCost = clamp(input.hourlyCost, 0, 1_000_000);
	const tasks = (input.tasks ?? []).map((t) => computeTask(t, hourlyCost));

	const totalAnnualHours = sum(tasks.map((t) => t.totalHours));
	const totalAnnualCost = sum(tasks.map((t) => t.annualCost));
	const recoverableAnnualHours = sum(tasks.map((t) => t.recoverableHours));
	const recoverableAnnualCost = sum(tasks.map((t) => t.recoverableCost));

	const buildCost = clamp(input.buildCost, 0, 100_000_000);
	const monthlyRunCost = clamp(input.monthlyRunCost, 0, 10_000_000);
	const annualRunCost = monthlyRunCost * 12;

	const netAnnualSaving = recoverableAnnualCost - annualRunCost;
	const monthlyNet = netAnnualSaving / 12;

	const paybackMonths = monthlyNet > 0 ? round(buildCost / monthlyNet) : null;

	const investmentYearOne = buildCost + annualRunCost;
	const firstYearRoiPct =
		investmentYearOne > 0
			? round(((recoverableAnnualCost - investmentYearOne) / investmentYearOne) * 100)
			: 0;

	return {
		tasks,
		totalAnnualHours: round(totalAnnualHours),
		totalAnnualCost: round(totalAnnualCost),
		recoverableAnnualHours: round(recoverableAnnualHours),
		recoverableAnnualCost: round(recoverableAnnualCost),
		netAnnualSaving: round(netAnnualSaving),
		paybackMonths,
		firstYearRoiPct,
		daysFreedPerYear: round(recoverableAnnualHours / 8),
		severity: severityOf(recoverableAnnualHours)
	};
}

function severityOf(hours: number): EngineResult['severity'] {
	if (hours >= 2000) return 'critical';
	if (hours >= 800) return 'high';
	if (hours >= 200) return 'moderate';
	return 'low';
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const round = (n: number) => (Number.isFinite(n) ? Math.round(n * 100) / 100 : 0);

export function formatMoney(n: number, currency: string): string {
	const prefix = currency === 'NGN' ? 'NGN ' : currency === 'USD' ? '$' : currency + ' ';
	return prefix + Math.round(n).toLocaleString('en-US');
}

/** Maps the result onto the automation stack RyderTech would actually deploy. */
export function recommendStack(tasks: TaskResult[]): string[] {
	const recs: string[] = [];
	const has = (kw: string) => tasks.some((t) => t.label.toLowerCase().includes(kw));

	if (has('invoic') || has('billing'))
		recs.push('Automated invoicing pipeline — Paystack/Stripe webhook → PDF generation → email dispatch.');
	if (has('onboard'))
		recs.push('Self-serve onboarding portal — SvelteKit forms → Supabase → templated welcome sequence.');
	if (has('report'))
		recs.push('Scheduled reporting service — cron job aggregates Postgres → generated dashboard + email digest.');
	if (has('data entry') || has('entry'))
		recs.push('Ingestion API + OCR/LLM extraction replacing keystroke entry, with validation rules.');
	if (has('support') || has('enquir') || has('inquir'))
		recs.push('AI triage layer — classify and auto-draft responses, escalate only true exceptions.');
	if (has('schedul') || has('booking'))
		recs.push('Booking engine with calendar sync and automated reminders.');

	if (recs.length === 0)
		recs.push('Custom workflow automation — API-first backend replacing the manual handoffs identified above.');

	recs.push('Central ops dashboard so the recovered time stays recovered — visibility on every automated run.');
	return recs;
}
