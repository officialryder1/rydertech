<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { Label } from '$lib/components/ui/label';
	import SEOMeta from '$lib/components/SEOMeta.svelte';
	import { supabase } from '$lib/supabaseClient';
	import { env } from '$env/dynamic/public';
	import { sendLeadEmail } from '$lib/email';
	import {
		Calculator,
		TrendingDown,
		Plus,
		X,
		ArrowLeft,
		CheckCircle2,
		AlertTriangle,
		ArrowRight,
		Building2,
		Users,
		ShoppingCart,
		FileText,
		Settings,
		MessageSquare,
		Truck,
		CreditCard,
		BarChart2,
		Target,
		ChevronDown,
		ChevronUp,
		Mail,
		Download,
		Star
	} from '@lucide/svelte';

	import {
		computeDrain,
		formatMoney,
		recommendStack,
		type TaskInput,
		type EngineResult
	} from '$lib/opsDrain';
	import { scoreLead } from '$lib/leadScore';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

// ---- Nigerian SMB Workflow Presets by Category ----
interface WorkflowPreset extends Omit<TaskInput, 'id'> {
	category: 'finance' | 'operations' | 'sales' | 'support' | 'hr' | 'logistics';
	description: string;
	nigerianContext: string;
}

const WORKFLOW_PRESETS: WorkflowPreset[] = [
	// Finance
	{ label: 'Invoice generation & dispatch', people: 2, minutesEach: 25, frequency: 'daily', errorRatePct: 15, automatablePct: 90, category: 'finance', description: 'Creating PDF invoices, emailing clients, tracking payment status', nigerianContext: 'Paystack/Flutterwave webhooks can auto-generate & send invoices' },
	{ label: 'Expense recording & categorization', people: 1, minutesEach: 45, frequency: 'weekly', errorRatePct: 12, automatablePct: 85, category: 'finance', description: 'Manual entry of receipts, bank statements, categorizing for tax', nigerianContext: 'OCR + bank API integration eliminates keystroke entry' },
	{ label: 'Monthly reconciliation', people: 2, minutesEach: 180, frequency: 'monthly', errorRatePct: 20, automatablePct: 80, category: 'finance', description: 'Matching bank statements to invoices, chasing discrepancies', nigerianContext: 'Auto-reconciliation via Paystack/Monnify APIs + accounting sync' },
	{ label: 'Payroll processing', people: 1, minutesEach: 120, frequency: 'monthly', errorRatePct: 8, automatablePct: 75, category: 'finance', description: 'Calculating salaries, deductions, generating payslips, statutory filings', nigerianContext: 'Pension (PenCom), NHF, PAYE calculations can be fully automated' },

	// Operations
	{ label: 'Client onboarding & KYC', people: 2, minutesEach: 90, frequency: 'weekly', errorRatePct: 18, automatablePct: 80, category: 'operations', description: 'Collecting documents, verification, contract signing, account setup', nigerianContext: 'Self-serve portal + BVN/NIN verification API + DocuSign' },
	{ label: 'Inventory tracking & stock alerts', people: 3, minutesEach: 60, frequency: 'daily', errorRatePct: 15, automatablePct: 85, category: 'operations', description: 'Manual counts, low-stock alerts, reorder PO creation', nigerianContext: 'POS/ERP integration with auto-reorder thresholds' },
	{ label: 'Quality checks & compliance logging', people: 2, minutesEach: 40, frequency: 'daily', errorRatePct: 10, automatablePct: 70, category: 'operations', description: 'Checklist completion, photo evidence, regulatory log entries', nigerianContext: 'Mobile forms + auto-submit to regulatory portals (NAFDAC, SON)' },
	{ label: 'Vendor invoice processing', people: 1, minutesEach: 30, frequency: 'daily', errorRatePct: 12, automatablePct: 90, category: 'operations', description: 'Receiving, matching to PO, approval routing, payment scheduling', nigerianContext: '3-way match automation + approval workflow' },

	// Sales
	{ label: 'Lead qualification & routing', people: 2, minutesEach: 30, frequency: 'daily', errorRatePct: 25, automatablePct: 85, category: 'sales', description: 'Scoring inbound leads, assigning to reps, CRM enrichment', nigerianContext: 'AI triage on WhatsApp/email + auto-assign by territory/skill' },
	{ label: 'Proposal & quote generation', people: 1, minutesEach: 60, frequency: 'weekly', errorRatePct: 15, automatablePct: 80, category: 'sales', description: 'Customizing templates, pricing calc, approval, sending', nigerianContext: 'CPQ engine with Nigerian tax/VAT rules built-in' },
	{ label: 'Follow-up sequences & nurture', people: 2, minutesEach: 45, frequency: 'daily', errorRatePct: 30, automatablePct: 90, category: 'sales', description: 'Manual WhatsApp/email follow-ups, meeting scheduling', nigerianContext: 'WhatsApp Business API sequences + Calendly auto-book' },
	{ label: 'Pipeline reporting & forecasting', people: 1, minutesEach: 90, frequency: 'weekly', errorRatePct: 10, automatablePct: 75, category: 'sales', description: 'CRM data cleanup, stage probabilities, forecast roll-up', nigerianContext: 'Auto-sync from WhatsApp/email → CRM → dashboard' },

	// Support
	{ label: 'Support ticket triage & routing', people: 3, minutesEach: 20, frequency: 'daily', errorRatePct: 20, automatablePct: 85, category: 'support', description: 'Reading, categorizing, prioritizing, assigning tickets', nigerianContext: 'AI classification + auto-reply for FAQs, escalate exceptions' },
	{ label: 'Customer onboarding & training', people: 2, minutesEach: 60, frequency: 'weekly', errorRatePct: 15, automatablePct: 70, category: 'support', description: 'Welcome calls, demo scheduling, guide sharing, check-ins', nigerianContext: 'Automated email/WhatsApp drip + video library + progress tracking' },
	{ label: 'Refund & dispute handling', people: 1, minutesEach: 45, frequency: 'weekly', errorRatePct: 18, automatablePct: 75, category: 'support', description: 'Verifying claims, processing refunds, communicating outcomes', nigerianContext: 'Rules engine + Paystack/Flutterwave refund API + auto-notify' },

	// HR
	{ label: 'Leave & attendance tracking', people: 1, minutesEach: 30, frequency: 'daily', errorRatePct: 8, automatablePct: 90, category: 'hr', description: 'Timesheet review, leave balance calc, approval workflows', nigerianContext: 'Biometric/geofence clock-in + auto-accrual + Slack/WhatsApp approvals' },
	{ label: 'Employee onboarding checklist', people: 1, minutesEach: 120, frequency: 'monthly', errorRatePct: 12, automatablePct: 80, category: 'hr', description: 'Offer letter, contracts, asset assignment, system access, orientation', nigerianContext: 'Pension (PenCom) enrollment, HMO, tax registration automation' },
	{ label: 'Performance review cycles', people: 2, minutesEach: 180, frequency: 'monthly', errorRatePct: 10, automatablePct: 60, category: 'hr', description: 'Form distribution, reminder chasing, calibration, documentation', nigerianContext: 'Automated cycle + 360° collection + OKR tracking' },

	// Logistics
	{ label: 'Order processing & fulfillment', people: 3, minutesEach: 40, frequency: 'daily', errorRatePct: 15, automatablePct: 85, category: 'logistics', description: 'Order verification, picking, packing, courier booking, tracking', nigerianContext: 'Shopify/WooCommerce → courier API (GIG, Kwik, SendBox) auto-book' },
	{ label: 'Delivery coordination & proof', people: 2, minutesEach: 35, frequency: 'daily', errorRatePct: 20, automatablePct: 80, category: 'logistics', description: 'Route planning, driver dispatch, POD collection, exception handling', nigerianContext: 'Route optimization + driver app + customer WhatsApp notifications' },
	{ label: 'Returns & reverse logistics', people: 1, minutesEach: 45, frequency: 'weekly', errorRatePct: 25, automatablePct: 70, category: 'logistics', description: 'RMA creation, pickup scheduling, inspection, restock/refund', nigerianContext: 'Self-serve returns portal + courier integration + auto-refund' }
];

const CATEGORY_INFO: Record<string, { icon: any; label: string; color: string; description: string }> = {
	finance: { icon: CreditCard, label: 'Finance & Accounting', color: 'text-emerald-500', description: 'Invoicing, expenses, reconciliation, payroll' },
	operations: { icon: Settings, label: 'Operations', color: 'text-blue-500', description: 'Onboarding, inventory, quality, vendor management' },
	sales: { icon: Target, label: 'Sales & CRM', color: 'text-amber-500', description: 'Lead qualification, quotes, follow-ups, forecasting' },
	support: { icon: MessageSquare, label: 'Customer Support', color: 'text-violet-500', description: 'Ticket triage, onboarding, refunds, knowledge base' },
	hr: { icon: Users, label: 'HR & People', color: 'text-rose-500', description: 'Leave, onboarding, performance, compliance' },
	logistics: { icon: Truck, label: 'Logistics & Fulfillment', color: 'text-orange-500', description: 'Orders, delivery, returns, inventory sync' }
};

const PRESETS_BY_CATEGORY: Record<string, WorkflowPreset[]> = {};
WORKFLOW_PRESETS.forEach(p => {
	if (!PRESETS_BY_CATEGORY[p.category]) PRESETS_BY_CATEGORY[p.category] = [];
	PRESETS_BY_CATEGORY[p.category].push(p);
});

let currency = $state<'NGN' | 'USD'>('NGN');
let hourlyCost = $state(6500);
let buildCost = $state(3_500_000);
let monthlyRunCost = $state(60_000);
let tasks = $state<TaskInput[]>([]);
let selectedCategory = $state<'all' | keyof typeof PRESETS_BY_CATEGORY>('all');
let expandedCategories = $state<Record<string, boolean>>({});

let email = $state('');
let company = $state('');
let businessSize = $state<'micro' | 'small' | 'medium' | 'large'>('small');
let industry = $state('');
let isSubmitting = $state(false);
let unlocked = $state(false);
let error = $state<string | null>(null);
let currentStep = $state(1); // 1: diagnose, 2: results, 3: capture
let expectedPayback = $state(18);
let showReport = $state(false);

const _utmSource = $page.url.searchParams.get('utm_source');
const _utmMedium = $page.url.searchParams.get('utm_medium');
const _utmCampaign = $page.url.searchParams.get('utm_campaign');
const _toolParam = $page.url.searchParams.get('tool');
const leadSource = $derived([
	_utmSource ? `utm:${_utmSource}` : '',
	_toolParam ? `tool:${_toolParam}` : '',
	_utmMedium ? `medium:${_utmMedium}` : '',
	_utmCampaign ? `campaign:${_utmCampaign}` : ''
].filter(Boolean).join('|') || 'direct');

const result = $derived(computeDrain({ hourlyCost, tasks, buildCost, monthlyRunCost }));
const stack = $derived(recommendStack(result.tasks));
const worthIt = $derived(result.paybackMonths !== null && result.paybackMonths <= 18);
const money = (n: number) => formatMoney(n, currency);

const totalRecoverableHours = $derived(result.recoverableAnnualHours);
const leadScoreInput = $derived({
	tool: 'ops_drain' as const,
	impactValue: result.recoverableAnnualCost,
	revenueAtRisk: result.recoverableAnnualCost,
	healthScore: 100 - Math.min(100, Math.round(result.recoverableAnnualHours / 20))
});
const leadScoreResult = $derived(scoreLead(leadScoreInput));

const severityCopy: Record<string, string> = {
	low: 'Lean operation. Automation here is optimisation, not rescue.',
	moderate: 'Meaningful drag. A targeted build pays for itself.',
	high: 'Serious leakage. You are funding a salary that produces nothing.',
	critical: 'Critical. Manual process is now your largest hidden cost centre.'
};

function getReport() {
	const payload = {
		tool: 'automation-readiness' as const,
		title: 'Automation Readiness Diagnostic',
		heroLabel: 'Annual cost of manual processes',
		heroValue: money(result.totalAnnualCost),
		heroTone: result.severity === 'critical' || result.severity === 'high' ? 'bad' as const : 'neutral' as const,
		verdict:
			result.paybackMonths === null
				? 'Automation does not yet pay back at this saving rate — but the recovered time is real.'
				: `Automation pays for itself in ${result.paybackMonths} months at ${result.firstYearRoiPct}% first-year ROI.`,
		rows: [
			{ label: 'Staff-days lost / year', value: `${Math.round(result.recoverableAnnualHours / 8).toLocaleString()} days`, tone: 'bad' as const },
			{ label: 'Recoverable cost / year', value: money(result.recoverableAnnualCost), tone: 'good' as const },
			{ label: 'Net annual saving', value: money(result.netAnnualSaving), tone: 'good' as const },
			{ label: 'Payback period', value: result.paybackMonths === null ? '—' : `${result.paybackMonths} mo`, tone: 'neutral' as const },
			{ label: 'Lead score', value: `${leadScoreResult.points}/100 (${leadScoreResult.tier})`, tone: leadScoreResult.tier === 'hot' ? 'good' as const : leadScoreResult.tier === 'warm' ? 'neutral' as const : 'bad' as const }
		],
		recommendations: [
			...stack.slice(0, 3),
			`Priority order: ${result.tasks.filter(t => t.recoverableCost > 0).sort((a, b) => b.recoverableCost - a.recoverableCost).slice(0, 3).map(t => t.label).join(' → ')}`
		],
		currency,
		generatedAt: new Date().toISOString().slice(0, 10),
		sourceUrl: 'https://rydertech.ng/labs/automation-readiness'
	};
	
	// Navigate to share page
	import('$lib/shareReport').then(({ buildShareUrl }) => {
		goto(buildShareUrl(payload as any));
	});
}

function validEmail(v: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function addPreset(preset: WorkflowPreset) {
	if (tasks.some(t => t.label === preset.label)) return;
	tasks = [
		...tasks,
		{
			...preset,
			id: crypto.randomUUID()
		}
	];
}

function addCustomTask() {
	tasks = [
		...tasks,
		{
			id: crypto.randomUUID(),
			label: 'Custom manual task',
			people: 1,
			minutesEach: 30,
			frequency: 'weekly',
			errorRatePct: 10,
			automatablePct: 70
		}
	];
}

function removeTask(id: string) {
	tasks = tasks.filter(t => t.id !== id);
}

function switchCurrency(next: 'NGN' | 'USD') {
	if (next === currency) return;
	currency = next;
	if (next === 'USD') {
		hourlyCost = 45;
		buildCost = 24000;
		monthlyRunCost = 400;
	} else {
		hourlyCost = 6500;
		buildCost = 3_500_000;
		monthlyRunCost = 60_000;
	}
}

function nextStep() {
	if (currentStep === 1 && tasks.length === 0) {
		error = 'Add at least one manual task to see your automation roadmap.';
		return;
	}
	error = null;
	currentStep = Math.min(3, currentStep + 1);
	if (currentStep === 2) {
		// Scroll to results
		setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 100);
	}
}

function prevStep() {
	currentStep = Math.max(1, currentStep - 1);
}

async function handleSubmit(e: Event) {
	e.preventDefault();
	error = null;
	if (!validEmail(email)) {
		error = 'Please enter a valid email address.';
		return;
	}
	isSubmitting = true;
	try {
		unlocked = true;
		try {
			localStorage.setItem('rydertech_automation_readiness_email', email);
			localStorage.setItem('rydertech_lead_captured', '1');
		} catch {}

		const lead = scoreLead({
			tool: 'ops_drain',
			impactValue: result.recoverableAnnualCost,
			revenueAtRisk: result.recoverableAnnualCost,
			healthScore: 100 - Math.min(100, Math.round(result.recoverableAnnualHours / 20))
		});
		const leadScoreVal = lead.points;
		const leadTier = lead.tier;

		await sendLeadEmail({
			from_name: company || 'Automation Readiness lead',
			from_email: email,
			company,
			budget: money(buildCost),
			timeline: result.paybackMonths === null ? 'n/a' : `${result.paybackMonths} month payback`,
			message: `New Automation Readiness Diagnostic result (source: /labs/automation-readiness). Lead score: ${leadScoreVal}/100 (${leadTier}). Business size: ${businessSize}. Industry: ${industry || 'not specified'}.\n\nAnnual manual cost: ${money(result.totalAnnualCost)}\nRecoverable: ${money(result.recoverableAnnualCost)}\nNet saving: ${money(result.netAnnualSaving)}\nPayback: ${result.paybackMonths === null ? 'never' : result.paybackMonths + ' months'}\nFirst-year ROI: ${result.firstYearRoiPct}%\nSeverity: ${result.severity}\n\nTop tasks:\n${result.tasks.filter(t => t.recoverableCost > 0).sort((a, b) => b.recoverableCost - a.recoverableCost).slice(0, 5).map(t => `- ${t.label}: ${t.totalHours}h/yr, ${money(t.annualCost)}/yr (recoverable ${money(t.recoverableCost)})`).join('\n')}\n\nRecommended build:\n${stack.map(s => `- ${s}`).join('\n')}`,
			lead_type: 'lead_magnet_automation_readiness',
			lead_score: leadScoreVal,
			lead_tier: leadTier,
			lead_source: leadSource,
			lead_tags: ['automation-readiness', businessSize]
		});

		try {
			const { error: dbError } = await supabase
				.from('newsletter_subscriptions')
				.insert([{
					email,
					source: 'lead_magnet_automation_readiness',
					subscribed_at: new Date().toISOString(),
					lead_score: leadScoreVal,
					lead_tier: leadTier,
					lead_source: leadSource,
					lead_tags: ['automation-readiness', businessSize]
				}]);
			if (dbError) {
				console.error('Automation readiness lead NOT persisted:', dbError.code, dbError.message, { email });
			}
		} catch (dbErr) {
			console.error('Automation readiness lead backup threw (DB unavailable):', dbErr, { email });
		}
	} catch (err) {
		console.warn('Automation readiness lead email failed:', err);
	} finally {
		isSubmitting = false;
	}
}

function summaryText() {
	const lines = result.tasks.map(
		(t) => `- ${t.label}: ${t.totalHours}h/yr, ${money(t.annualCost)}/yr (recoverable ${money(t.recoverableCost)})`
	);
	return [
		`Annual cost of manual work: ${money(result.totalAnnualCost)}`,
		`Recoverable via automation: ${money(result.recoverableAnnualCost)}`,
		`Staff days freed per year: ${result.daysFreedPerYear}`,
		`Net annual saving: ${money(result.netAnnualSaving)}`,
		`Payback: ${result.paybackMonths === null ? 'never at this budget' : result.paybackMonths + ' months'}`,
		`First-year ROI: ${result.firstYearRoiPct}%`,
		`Severity: ${result.severity}`,
		`Lead score: ${leadScoreResult.points}/100 (${leadScoreResult.tier})`,
		'',
		'Tasks:',
		...lines,
		'',
		'Recommended build:',
		...stack.map((s) => `- ${s}`)
	].join('\n');
}

const tierColors: Record<string, string> = {
	hot: 'bg-red-500',
	warm: 'bg-amber-500',
	cool: 'bg-emerald-500'
};
</script>

<SEOMeta
	data={{
		title: 'Automation Readiness Diagnostic — Find Your Highest-ROI Workflows | RyderTech',
		description: 'Free diagnostic: map your manual processes, calculate automation ROI, get a prioritized Nigerian-cost roadmap. No signup to calculate. Instant results.',
		canonical: 'https://rydertech.ng/labs/automation-readiness'
	}}
/>

<div class="min-h-screen bg-background">
	<div class="container mx-auto max-w-7xl px-4 py-10">
		<a
			href="/labs"
			class="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
		>
			<ArrowLeft class="h-4 w-4" />
			Back to Labs
		</a>

		<!-- Progress Indicator -->
		<div class="mb-8 flex items-center gap-2">
			{#each [1, 2, 3] as step}
				<div class="flex items-center gap-2">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all
							{step <= currentStep ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}"
					>
						{step}
					</div>
					{#if step < 3}
						<div
							class="h-1 flex-1 max-w-24 transition-colors
								{step < currentStep ? 'bg-primary' : 'bg-border'}"
						/>
					{/if}
				</div>
				{#if step === 1} <span class="text-xs text-muted-foreground ml-1">Diagnose</span> {:else if step === 2} <span class="text-xs text-muted-foreground ml-1">Roadmap</span> {:else} <span class="text-xs text-muted-foreground ml-1">Get Blueprint</span> {/if}
			{/each}
		</div>

		{#if currentStep === 1}
			<!-- STEP 1: DIAGNOSE -->
			<header class="mb-10 max-w-3xl">
				<Badge variant="secondary" class="mb-3">Automation Diagnostic</Badge>
				<h1 class="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
					Find the workflows automation should touch first.
				</h1>
				<p class="mt-4 text-lg text-muted-foreground">
					Most Nigerian SMBs automate the wrong things. Pick your real manual tasks, see the
					annual cost, and get a prioritized build roadmap with Nigerian pricing benchmarks.
				</p>
			</header>

			<div class="grid gap-8 lg:grid-cols-[1fr_400px]">
				<!-- INPUTS -->
				<section class="space-y-6">
					<Card>
						<CardHeader class="pb-4">
							<div class="flex items-center justify-between">
								<CardTitle class="flex items-center gap-2 text-base">
									<Building2 class="h-4 w-4 text-primary" />
									Business context
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
							<label class="block">
								<span class="mb-1.5 block text-xs text-muted-foreground">Business size</span>
								<select
									bind:value={businessSize}
									class="border-input h-10 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:border-ring"
								>
									<option value="micro">Micro (1-9 staff)</option>
									<option value="small">Small (10-49 staff)</option>
									<option value="medium">Medium (50-249 staff)</option>
									<option value="large">Large (250+ staff)</option>
								</select>
							</label>
							<label class="block">
								<span class="mb-1.5 block text-xs text-muted-foreground">Industry</span>
								<Input
									type="text"
									bind:value={industry}
									placeholder="e.g. Fintech, Logistics, Manufacturing"
								/>
							</label>
							<label class="block sm:col-span-2">
								<span class="mb-1.5 block text-xs text-muted-foreground">Staff cost / hour (fully loaded)</span>
								<Input type="number" min="0" bind:value={hourlyCost} />
							</label>
						</CardContent>
					</Card>

					<Card>
						<CardHeader class="pb-4">
							<div class="flex items-center justify-between">
								<CardTitle class="flex items-center gap-2 text-base">
									<Calculator class="h-4 w-4 text-primary" />
									Automation budget
								</CardTitle>
								<div class="flex gap-1 rounded-lg border p-1">
									{#each ['NGN', 'USD'] as c}
										<button
											type="button"
											onclick={() => switchCurrency(c as 'NGN' | 'USD')}
											class="rounded px-3 py-1 text-xs font-medium transition
												{currency === c
													? 'bg-primary text-white'
													: 'text-muted-foreground hover:text-foreground'}"
										>
											{c}
										</button>
									{/each}
								</div>
							</div>
						</CardHeader>
						<CardContent class="grid gap-4 sm:grid-cols-3">
							<label class="block">
								<span class="mb-1.5 block text-xs text-muted-foreground">Build budget (one-off)</span>
								<Input type="number" min="0" bind:value={buildCost} />
							</label>
							<label class="block">
								<span class="mb-1.5 block text-xs text-muted-foreground">Monthly run cost</span>
								<Input type="number" min="0" bind:value={monthlyRunCost} />
							</label>
							<label class="block">
								<span class="mb-1.5 block text-xs text-muted-foreground">Expected payback target</span>
								<select
													bind:value={expectedPayback}
													class="border-input h-10 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:border-ring"
												>
													<option value="12">12 months</option>
													<option value="18" selected>18 months</option>
													<option value="24">24 months</option>
												</select>
							</label>
						</CardContent>
					</Card>

					<Card>
						<CardHeader class="pb-4">
							<CardTitle class="flex items-center gap-2 text-base">
								<Target class="h-4 w-4 text-primary" />
								Your manual tasks
							</CardTitle>
							<CardDescription>
								Browse common Nigerian SMB workflows by category. Click to add — adjust numbers to match your reality.
							</CardDescription>
						</CardHeader>
						<CardContent class="space-y-4">
							<!-- Category Tabs -->
							<div class="flex flex-wrap gap-2">
								<button
									type="button"
									onclick={() => selectedCategory = 'all'}
									class="rounded-lg px-3 py-1.5 text-sm font-medium transition
										{selectedCategory === 'all'
											? 'bg-primary text-white'
											: 'bg-muted hover:bg-muted/80'}"
								>
									All categories
								</button>
								{#each Object.entries(CATEGORY_INFO) as [cat, info]}
									<button
										type="button"
										onclick={() => selectedCategory = cat as any}
										class="rounded-lg px-3 py-1.5 text-sm font-medium transition flex items-center gap-1.5
											{selectedCategory === cat
												? 'bg-primary text-white'
												: 'bg-muted hover:bg-muted/80'}"
									>
										<info.icon class="h-3.5 w-3.5" style="color: var(--primary)" />
										{info.label}
									</button>
								{/each}
							</div>

							<!-- Presets by Category -->
							<div class="space-y-4">
								{#each Object.entries(PRESETS_BY_CATEGORY) as [cat, presets]}
									{#if selectedCategory === 'all' || selectedCategory === cat}
										<div class="border rounded-lg overflow-hidden">
											<button
												type="button"
												onclick={() => expandedCategories[cat] = !expandedCategories[cat]}
												class="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition"
											>
												<div class="flex items-center gap-2">
													<svelte:component this={CATEGORY_INFO[cat].icon} class="h-4 w-4" style="color: var(--primary)" />
													<span class="font-medium">{CATEGORY_INFO[cat].label}</span>
													<Badge variant="secondary" class="text-xs">{presets.length} workflows</Badge>
												</div>
												{#if expandedCategories[cat]}
													<ChevronUp class="h-4 w-4 text-muted-foreground" />
												{:else}
													<ChevronDown class="h-4 w-4 text-muted-foreground" />
												{/if}
											</button>

											{#if expandedCategories[cat]}
												<div class="p-4 space-y-3 bg-background">
													{#each presets as preset}
														<div class="rounded-lg border bg-muted/30 p-4 hover:border-primary/30 transition">
															<div class="flex items-start justify-between gap-3">
																<div class="flex-1 min-w-0">
																	<div class="flex items-center gap-2 mb-1">
																		<span class="font-medium">{preset.label}</span>
																		<Badge variant="outline" class="text-xs">
																			{preset.frequency}
																		</Badge>
																	</div>
																	<p class="text-sm text-muted-foreground mb-2">{preset.description}</p>
																	<p class="text-xs text-primary/80 bg-primary/5 px-2 py-1 rounded inline-block">
																		🇳🇬 {preset.nigerianContext}
																	</p>
																</div>
																{#if tasks.some(t => t.label === preset.label)}
																	<Badge variant="secondary" class="shrink-0">Added</Badge>
																{:else}
																	<Button
																		variant="outline"
																		size="sm"
																		onclick={() => addPreset(preset)}
																		class="shrink-0"
																	>
																		<Plus class="h-3.5 w-3.5 mr-1" /> Add
																	</Button>
																{/if}
															</div>
														</div>
													{/each}
												</div>
											{/if}
										</div>
									{/if}
								{/each}
							</div>

							<!-- Custom Task -->
							<div class="rounded-lg border bg-muted/30 p-4">
								<div class="flex items-center justify-between">
									<div>
										<span class="font-medium">Add custom task</span>
										<p class="text-sm text-muted-foreground">For workflows not listed above</p>
									</div>
									<Button variant="outline" onclick={addCustomTask}>
										<Plus class="h-3.5 w-3.5 mr-1" /> Add custom
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>

					<!-- Added Tasks Summary -->
					{#if tasks.length > 0}
						<Card>
							<CardHeader class="pb-4">
								<CardTitle class="flex items-center gap-2 text-base">
									<FileText class="h-4 w-4 text-primary" />
									Your selected tasks ({tasks.length})
								</CardTitle>
							</CardHeader>
							<CardContent class="space-y-3">
								{#each tasks as task, i (task.id)}
									<div class="rounded-lg border bg-muted/30 p-4">
										<div class="mb-3 flex items-center gap-3">
											<Input bind:value={task.label} placeholder="Task name" class="flex-1 font-medium" />
											<span class="whitespace-nowrap text-xs text-muted-foreground">
												{money(result.tasks[i]?.annualCost ?? 0)}/yr
											</span>
											<button
												type="button"
												onclick={() => removeTask(task.id)}
												class="text-muted-foreground transition hover:text-destructive"
												aria-label="Remove task"
											>
												<X class="h-4 w-4" />
											</button>
										</div>
										<div class="grid grid-cols-2 gap-3 sm:grid-cols-5">
											<label class="block">
												<span class="mb-1 block text-[10px] uppercase text-muted-foreground">People</span>
												<Input type="number" min="0" bind:value={task.people} class="h-8 text-sm" />
											</label>
											<label class="block">
												<span class="mb-1 block text-[10px] uppercase text-muted-foreground">Mins each</span>
												<Input type="number" min="0" bind:value={task.minutesEach} class="h-8 text-sm" />
											</label>
											<label class="block">
												<span class="mb-1 block text-[10px] uppercase text-muted-foreground">Frequency</span>
												<select
													bind:value={task.frequency}
													class="border-input h-8 w-full rounded-md border bg-transparent px-2 text-sm outline-none focus-visible:border-ring"
												>
													{#each ['daily', 'weekly', 'monthly'] as f}
														<option value={f}>{f}</option>
													{/each}
												</select>
											</label>
											<label class="block">
												<span class="mb-1 block text-[10px] uppercase text-muted-foreground">Rework %</span>
												<Input type="number" min="0" max="100" bind:value={task.errorRatePct} class="h-8 text-sm" />
											</label>
											<label class="block">
												<span class="mb-1 block text-[10px] uppercase text-muted-foreground">Automatable %</span>
												<Input type="number" min="0" max="100" bind:value={task.automatablePct} class="h-8 text-sm" />
											</label>
										</div>
									</div>
								{/each}
							</CardContent>
						</Card>
					{/if}

					<!-- Navigation -->
					<div class="flex justify-end gap-3 pt-4 border-t">
						<Button variant="primary" onclick={nextStep} class="w-full sm:w-auto gap-2" disabled={tasks.length === 0}>
							See my roadmap
							<ArrowRight class="h-4 w-4" />
						</Button>
					</div>
				</section>

				<!-- QUICK PREVIEW / HELP -->
				<aside class="space-y-6 lg:sticky lg:top-8 lg:self-start">
					<Card>
						<CardHeader class="pb-3">
							<CardTitle class="text-lg">How it works</CardTitle>
						</CardHeader>
						<CardContent class="space-y-4 text-sm text-muted-foreground">
							<div class="flex gap-3">
								<div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
									<Calculator class="h-4 w-4 text-primary" />
								</div>
								<div>
									<p class="font-medium">1. Pick your tasks</p>
									<p>Browse 18+ Nigerian SMB workflows or add custom ones.</p>
								</div>
							</div>
							<div class="flex gap-3">
								<div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
									<Target class="h-4 w-4 text-primary" />
								</div>
								<div>
									<p class="font-medium">2. See the math</p>
									<p>Annual cost, recoverable hours, payback, ROI — instantly.</p>
								</div>
							</div>
							<div class="flex gap-3">
								<div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
									<ArrowRight class="h-4 w-4 text-primary" />
								</div>
								<div>
									<p class="font-medium">3. Get the blueprint</p>
									<p>Prioritized roadmap with Nigerian build costs & stack recs.</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{#if tasks.length > 0}
						<Card class="border-primary/30 bg-primary/5">
							<CardContent class="pt-6">
								<div class="text-center">
									<p class="text-sm text-muted-foreground">Estimated annual manual cost</p>
									<p class="text-3xl font-bold text-primary">{money(result.totalAnnualCost)}</p>
									<p class="text-xs text-muted-foreground mt-1">{result.tasks.length} tasks • {result.totalAnnualHours.toLocaleString()} hrs/yr</p>
								</div>
							</CardContent>
						</Card>
					{/if}
				</aside>
			</div>

		{:else if currentStep === 2}
			<!-- STEP 2: RESULTS / ROADMAP -->
			<header class="mb-10 max-w-3xl" id="results">
				<Badge variant="secondary" class="mb-3">Your Automation Roadmap</Badge>
				<h1 class="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
					Here's what automation should touch first — ranked by ROI.
				</h1>
				<p class="mt-4 text-lg text-muted-foreground">
					Based on your inputs, these are the highest-impact workflows to automate, with Nigerian build costs.
				</p>
			</header>

			<div class="grid gap-8 lg:grid-cols-[1fr_400px]">
				<!-- ROADMAP -->
				<section class="space-y-6">
					<!-- Severity Header -->
					<Card class="border-destructive/30 bg-destructive/5">
						<CardHeader class="pb-3">
							<CardDescription class="flex items-center gap-1.5">
								<AlertTriangle class="h-3.5 w-3.5" />
								Automation urgency: <span class="font-semibold capitalize">{result.severity}</span>
							</CardDescription>
							<p class="text-4xl font-bold text-destructive">{money(result.totalAnnualCost)}</p>
							<p class="text-sm text-muted-foreground">{severityCopy[result.severity]}</p>
						</CardHeader>
						<CardContent>
							<dl class="space-y-3 border-t pt-4 text-sm grid grid-cols-2 gap-4">
								<div class="flex justify-between">
									<dt class="text-muted-foreground">Hours consumed / year</dt>
									<dd class="font-medium">{result.totalAnnualHours.toLocaleString()}</dd>
								</div>
								<div class="flex justify-between">
									<dt class="text-muted-foreground">Recoverable by automation</dt>
									<dd class="font-medium text-primary">{money(result.recoverableAnnualCost)}</dd>
								</div>
								<div class="flex justify-between">
									<dt class="text-muted-foreground">Staff days freed / year</dt>
									<dd class="font-medium">{result.daysFreedPerYear}</dd>
								</div>
								<div class="flex justify-between">
									<dt class="text-muted-foreground">Net saving after run costs</dt>
									<dd class="font-medium {result.netAnnualSaving > 0 ? 'text-primary' : 'text-destructive'}">{money(result.netAnnualSaving)}</dd>
								</div>
								<div class="flex justify-between">
									<dt class="text-muted-foreground">Payback period</dt>
									<dd class="font-medium">{result.paybackMonths === null ? 'Never at this budget' : `${result.paybackMonths} months`}</dd>
								</div>
								<div class="flex justify-between">
									<dt class="text-muted-foreground">First-year ROI</dt>
									<dd class="font-medium {result.firstYearRoiPct >= 0 ? 'text-primary' : 'text-destructive'}">{result.firstYearRoiPct}%</dd>
								</div>
								<div class="flex justify-between">
									<dt class="text-muted-foreground">Lead score</dt>
									<dd class="font-medium">
										<Badge class={tierColors[leadScoreResult.tier]}>{leadScoreResult.points}/100 ({leadScoreResult.tier})</Badge>
									</dd>
								</div>
								<div class="flex justify-between">
									<dt class="text-muted-foreground">Top priority</dt>
									<dd class="font-medium text-primary">{result.tasks.filter(t => t.recoverableCost > 0).sort((a, b) => b.recoverableCost - a.recoverableCost)[0]?.label || '—'}</dd>
								</div>
							</dl>
						</CardContent>
					</Card>

					<!-- Task Rankings -->
					<Card>
						<CardHeader class="pb-4">
							<CardTitle class="flex items-center gap-2 text-base">
								<BarChart2 class="h-4 w-4 text-primary" />
								Tasks ranked by recoverable value
							</CardTitle>
							<CardDescription>
								Highest recoverable cost first = biggest ROI. Adjust automatable % to re-rank.
							</CardDescription>
						</CardHeader>
						<CardContent class="space-y-3">
							{#each result.tasks.filter(t => t.recoverableCost > 0).sort((a, b) => b.recoverableCost - a.recoverableCost) as task, rank}
								<div class="rounded-lg border bg-muted/30 p-4">
									<div class="flex items-center justify-between">
										<div class="flex items-center gap-3">
											<span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">{rank + 1}</span>
											<div>
												<p class="font-medium">{task.label}</p>
												<p class="text-xs text-muted-foreground">
													{task.totalHours}h/yr • {money(task.annualCost)}/yr • {Math.round(task.recoverableHours)}h recoverable
												</p>
											</div>
										</div>
										<div class="text-right">
											<p class="font-bold text-primary">{money(task.recoverableCost)}</p>
											<p class="text-xs text-muted-foreground">{task.automatablePct}% automatable</p>
										</div>
									</div>
								</div>
							{/each}
							{#if result.tasks.filter(t => t.recoverableCost > 0).length === 0}
								<p class="text-center text-muted-foreground py-8">No recoverable cost detected. Increase automatable % or add higher-volume tasks.</p>
							{/if}
						</CardContent>
					</Card>

					<!-- Recommended Stack -->
					<Card>
						<CardHeader class="pb-4">
							<CardTitle class="flex items-center gap-2 text-base">
								<Settings class="h-4 w-4 text-primary" />
								Recommended automation stack
							</CardTitle>
							<CardDescription>What RyderTech would actually deploy for your task mix.</CardDescription>
						</CardHeader>
						<CardContent>
							<ul class="space-y-3">
								{#each stack as item}
									<li class="flex gap-2.5 text-sm text-muted-foreground">
										<span class="mt-0.5 text-primary">▸</span>
										<span>{item}</span>
									</li>
								{/each}
							</ul>
						</CardContent>
					</Card>

					<!-- Verdict Box -->
					<div
						class="mt-4 flex gap-2 rounded-lg border p-3 text-sm
							{worthIt
								? 'border-primary/30 bg-primary/5'
								: result.paybackMonths === null
									? 'border-destructive/30 bg-destructive/5'
									: 'bg-muted/40'}"
					>
						{#if worthIt}
							<CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0 text-primary" />
							<span>This build pays for itself in under 18 months. Worth doing now.</span>
						{:else if result.paybackMonths === null}
							<AlertTriangle class="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
							<span>At this budget the automation costs more than it saves. Reduce scope or run cost.</span>
						{:else}
							<AlertTriangle class="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
							<span>Payback is {result.paybackMonths} months — long. Trim scope or target higher-volume tasks first.</span>
						{/if}
					</div>
				</section>

				<!-- SIDEBAR: CAPTURE FORM -->
				<aside class="space-y-6 lg:sticky lg:top-8 lg:self-start">
					<Card>
						<CardContent class="pt-6">
							{#if !unlocked}
								<h3 class="text-lg font-semibold">Get the full automation blueprint</h3>
								<p class="mt-1.5 text-sm text-muted-foreground">
									We'll email you the scoped build plan for your exact tasks — the systems, the
									sequence, Nigerian vendor benchmarks, and what each phase costs.
								</p>
								<form onsubmit={handleSubmit} class="mt-4 space-y-3">
									<Input type="text" bind:value={company} placeholder="Company name" />
									<Input type="email" bind:value={email} placeholder="you@company.com" required />
									<div class="grid gap-3 sm:grid-cols-2">
										<label class="block">
											<span class="mb-1 block text-xs text-muted-foreground">Business size</span>
											<select
												bind:value={businessSize}
												class="border-input h-10 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:border-ring"
											>
												<option value="micro">Micro (1-9)</option>
												<option value="small">Small (10-49)</option>
												<option value="medium">Medium (50-249)</option>
												<option value="large">Large (250+)</option>
											</select>
										</label>
										<label class="block">
											<span class="mb-1 block text-xs text-muted-foreground">Industry</span>
											<Input type="text" bind:value={industry} placeholder="e.g. Fintech, Logistics" />
										</label>
									</div>
									{#if error}
										<p class="text-xs text-destructive">{error}</p>
									{/if}
									<Button type="submit" disabled={isSubmitting} class="w-full gap-2">
										{isSubmitting ? 'Sending…' : 'Send me the blueprint'}
										<Mail class="h-4 w-4" />
									</Button>
								</form>
								<p class="mt-3 text-center text-xs text-muted-foreground">
									No spam. Unsubscribe anytime. Your data helps us benchmark Nigerian automation costs.
								</p>
							{:else}
								<div class="space-y-4">
									<h3 class="flex items-center gap-2 text-lg font-semibold text-primary">
										<CheckCircle2 class="h-5 w-5" />
										Blueprint sent — check your inbox
									</h3>
									<ul class="space-y-3">
										{#each stack.slice(0, 3) as item}
											<li class="flex gap-2.5 text-sm text-muted-foreground">
												<span class="mt-0.5 text-primary">▸</span>
												<span>{item}</span>
											</li>
										{/each}
									</ul>
									<Button href="/contact?tool=automation-readiness" class="w-full gap-2">
										Book a scoping call
										<ArrowRight class="h-4 w-4" />
									</Button>
									<Button variant="outline" class="w-full gap-2" onclick={getReport}>
										<Download class="h-4 w-4" /> Get shareable audit report
									</Button>
									<Button variant="ghost" class="w-full gap-2" onclick={() => { currentStep = 1; window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
										<ArrowLeft class="h-4 w-4" /> Back to diagnose
									</Button>
								</div>
							{/if}
						</CardContent>
					</Card>

					<!-- Nigerian Context Box -->
					<Card class="border-amber/30 bg-amber/5">
						<CardHeader class="pb-3">
							<CardTitle class="flex items-center gap-2 text-base">
								<Star class="h-4 w-4 text-amber-500" />
								Nigerian benchmarks used
							</CardTitle>
						</CardHeader>
						<CardContent class="space-y-2 text-sm text-muted-foreground">
							<p>• Staff cost: <strong>₦6,500/hr</strong> (mid-level Lagos)</p>
							<p>• Build: <strong>₦3.5M</strong> (custom workflow, 6-8 weeks)</p>
							<p>• Run: <strong>₦60k/mo</strong> (hosting + API + monitoring)</p>
							<p>• Paystack/Flutterwave webhooks, BVN/NIN APIs, WhatsApp Business API</p>
							<p>• PenCom, NHF, PAYE, VAT compliance built-in</p>
						</CardContent>
					</Card>
				</aside>
			</div>

		{:else}
			<!-- STEP 3: CAPTURE (same as step 2 sidebar but full width) -->
			<div class="max-w-xl mx-auto text-center py-20">
				{#if !unlocked}
					<Mail class="h-16 w-16 mx-auto text-muted-foreground/50" />
					<h2 class="mt-6 text-2xl font-bold">Unlock your full automation blueprint</h2>
					<p class="mt-3 text-muted-foreground">
						Get the detailed build plan, Nigerian vendor cost benchmarks, and phased rollout
						sequence emailed to you.
					</p>
					<form onsubmit={handleSubmit} class="mt-8 max-w-md mx-auto space-y-3">
						<Input type="text" bind:value={company} placeholder="Company name" />
						<Input type="email" bind:value={email} placeholder="you@company.com" required />
						<div class="grid gap-3 sm:grid-cols-2">
							<label class="block">
								<span class="mb-1 block text-xs text-muted-foreground">Business size</span>
								<select
									bind:value={businessSize}
									class="border-input h-10 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:border-ring"
								>
									<option value="micro">Micro (1-9)</option>
									<option value="small">Small (10-49)</option>
									<option value="medium">Medium (50-249)</option>
									<option value="large">Large (250+)</option>
								</select>
							</label>
							<label class="block">
								<span class="mb-1 block text-xs text-muted-foreground">Industry</span>
								<Input type="text" bind:value={industry} placeholder="e.g. Fintech, Logistics" />
							</label>
						</div>
						{#if error}
							<p class="text-xs text-destructive">{error}</p>
						{/if}
						<Button type="submit" disabled={isSubmitting} class="w-full">
							{isSubmitting ? 'Sending…' : 'Send me the blueprint'}
						</Button>
					</form>
				{:else}
					<CheckCircle2 class="h-16 w-16 mx-auto text-primary" />
					<h2 class="mt-6 text-2xl font-bold">Blueprint sent!</h2>
					<p class="mt-3 text-muted-foreground">Check your inbox for the full automation roadmap.</p>
					<div class="mt-6 flex flex-col gap-3 max-w-md mx-auto">
						<Button href="/contact?tool=automation-readiness" class="w-full">Book a scoping call</Button>
						<Button variant="outline" class="w-full" onclick={getReport}>Get shareable audit report</Button>
						<Button variant="ghost" class="w-full" onclick={() => { currentStep = 1; window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Back to diagnose</Button>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>