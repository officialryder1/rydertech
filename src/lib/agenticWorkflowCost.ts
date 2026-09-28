/**
 * Agentic Workflow Cost Calculator Engine
 *
 * Estimates the annual cost of manual coordination tasks that AI agents
 * (RPA + LLM reasoning) can automate. Pure functions — no DOM, no network.
 * Unit-testable via node.
 *
 * Inputs model the most common manual "glue work" an African SMB does every day:
 * collecting payments via WhatsApp, reconciling M-Pesa, answering repetitive
 * customer questions, chasing unpaid invoices, manually forwarding orders.
 *
 * Model:
 *   - Each task consumed = people × minutes × occurrences × hourlyRate
 *   - Error rate = rework (costed at the same hourly rate)
 *   - Automation removes `automatablePct` of total (base + rework) effort
 *   - Build cost + monthly run cost (agent infra / LLM token budget) amortised
 *   - Payback: months until monthly savings cover the build
 *
 * Calibration target: a small Lagos retailer doing 30 WhatsApp orders/day,
 * 15 M-Pesa reconciliations, 5 invoice chases. Defaults should yield a meaningful
 * (6–18 month) payback to argue for the service, not against it.
 */

export type Frequency = 'daily' | 'weekly' | 'monthly';

export interface WorkflowTask {
	id: string;
	label: string;
	/** number of people involved */
	people: number;
	/** minutes per execution, per person */
	minutesEach: number;
	frequency: Frequency;
	/** 0-100, % of executions needing rework */
	errorRatePct: number;
	/** 0-100, % of this task an AI agent can replace */
	automatablePct: number;
}

export interface EngineInput {
	/** fully-loaded cost per staff hour */
	hourlyCost: number;
	tasks: WorkflowTask[];
	/** one-off build cost for the agentic workflow */
	buildCost: number;
	/** recurring monthly cost (agent infra / LLM tokens / API calls) */
	monthlyRunCost: number;
	/** display currency */
	currency: 'NGN' | 'USD';
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
	/** net saving = recoverable cost − 12 × monthly run cost */
	netAnnualSaving: number;
	/** months until build pays for itself; null = never at this rate */
	paybackMonths: number | null;
	/** first-year ROI % on build + run cost */
	firstYearRoiPct: number;
	/** working days freed per year (8h day) */
	daysFreedPerYear: number;
	severity: 'low' | 'moderate' | 'high' | 'critical';
	verdict: string;
	enhancements: string[];
}

const OCCURRENCES_PER_YEAR: Record<Frequency, number> = {
	daily: 260,
	weekly: 52,
	monthly: 12
};

const clamp = (n: number, min: number, max: number) =>
	Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;

const round = (n: number) => (Number.isFinite(n) ? Math.round(n * 100) / 100 : 0);

export function computeTask(task: WorkflowTask, hourlyCost: number): TaskResult {
	const people = clamp(task.people, 0, 10_000);
	const minutes = clamp(task.minutesEach, 0, 60 * 24);
	const errorRate = clamp(task.errorRatePct, 0, 100) / 100;
	const automatable = clamp(task.automatablePct, 0, 100) / 100;
	const occurrences = OCCURRENCES_PER_YEAR[task.frequency] ?? 12;

	const annualHours = (minutes / 60) * people * occurrences;
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

export function computeAgenticCost(input: EngineInput): EngineResult {
	const hourlyCost = clamp(input.hourlyCost, 0, 1_000_000);
	const tasks = (input.tasks ?? []).map((t) => computeTask(t, hourlyCost));

	const totalAnnualHours = tasks.reduce((a, t) => a + t.totalHours, 0);
	const totalAnnualCost = tasks.reduce((a, t) => a + t.annualCost, 0);
	const recoverableAnnualHours = tasks.reduce((a, t) => a + t.recoverableHours, 0);
	const recoverableAnnualCost = tasks.reduce((a, t) => a + t.recoverableCost, 0);

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
		severity: severityOf(recoverableAnnualHours),
		verdict: verdictOf(recoverableAnnualHours, paybackMonths, netAnnualSaving),
		enhancements: defaultEnhancements
	};
}

function severityOf(hours: number): EngineResult['severity'] {
	if (hours >= 2000) return 'critical';
	if (hours >= 800) return 'high';
	if (hours >= 200) return 'moderate';
	return 'low';
}

function verdictOf(hours: number, payback: number | null, net: number): string {
	if (hours >= 2000)
		return 'Critical. Your team spends nearly full-time each year on tasks an agent could do for a fraction of the cost.';
	if (hours >= 800)
		return 'High drag. A single agentic workflow can reclaim weeks of staff time every year.';
	if (hours >= 200)
		return 'Meaningful leakage. Automation pays for itself and frees your team for higher-value work.';
	return 'Light-touch optimization. The savings are real but modest — automation is polish, not rescue.';
}

const defaultEnhancements = [
	'AI triage agent — classify and auto-reply to customer WhatsApp messages, escalating only exceptions to a human.',
	'M-Pesa reconciliation agent — match incoming payments to invoices automatically via Daraja API + Paystack.',
	'Invoice chase agent — send polite reminders, escalate to phone/SMS, and follow up on unpaid balances.',
	'Inventory sync agent — reconcile stock across WhatsApp orders, Excel sheets, and your point-of-sale system.',
	'Central ops dashboard — all agent runs tracked in one place so the recovered time stays recovered.'
];

export function formatMoney(n: number, currency: 'NGN' | 'USD'): string {
	const prefix = currency === 'NGN' ? '₦' : '$';
	return prefix + Math.round(n).toLocaleString('en-US');
}

/**
 * Maps the result onto the agentic-automation stack RyderTech would deploy.
 * Reuses the Ops Drain recommendStack pattern for consistency.
 */
export function recommendAgenticStack(tasks: TaskResult[]): string[] {
	const recs: string[] = [];
	const has = (kw: string) => tasks.some((t) => t.label.toLowerCase().includes(kw));

	if (has('whatsapp'))
		recs.push('WhatsApp order intake agent — auto-catalog incoming orders, confirm with buyer, sync to inventory.');
	if (has('m-pesa') || has('payment') || has('reconcil'))
		recs.push('M-Pesa reconciliation agent — pull Daraja API transactions, match by reference code, flag discrepancies, generate daily reports.');
	if (has('invoice') || has('billing') || has('chase'))
		recs.push('Invoice follow-up agent — send reminders, escalate to SMS/calls, update CRM status on payment.');
	if (has('inventory') || has('stock'))
		recs.push('Inventory sync agent — reconcile WhatsApp orders + Excel sheets + POS into a single source of truth.');
	if (has('customer') || has('support') || has('question'))
		recs.push('Customer Q&A agent — auto-answer FAQs in WhatsApp/Web chat, escalate only complex queries.');
	if (has('report') || has('data entry') || has('entry'))
		recs.push('Data entry + reporting agent — extract data from emails/WhatsApp/PDFs, update sheets, generate daily digests.');

	if (recs.length === 0)
		recs.push('Custom agentic workflow — API-first backend replacing the manual handoffs identified above.');

	recs.push('Central ops dashboard so the recovered time stays recovered — visibility on every agent run.');
	return recs;
}
