<script lang="ts">
	/**
	 * AutomationAuditCalculator.svelte
	 *
	 * Self-contained ops-drain calculator for the /automation-audit campaign page.
	 * Reuses the pure engine in $lib/opsDrain (single source of truth for the math)
	 * plus the existing EmailJS + Supabase lead-capture convention. Owns its own
	 * state and emits its result upward so the page can show live context.
	 */
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { supabase } from '$lib/supabaseClient';
	import { env } from '$env/dynamic/public';
	import emailjs from '@emailjs/browser';
	import {
		Timer,
		TrendingDown,
		Plus,
		X,
		CircleCheck,
		CircleAlert,
		Calculator,
		Download,
		LoaderCircle
	} from '@lucide/svelte';

	import {
		computeDrain,
		formatMoney,
		recommendStack,
		type TaskInput,
		type EngineResult
	} from '$lib/opsDrain';
	import { scoreLead } from '$lib/leadScore';

	let {
		leadSource = 'campaign:automation-audit|direct',
		onResult = (_r: EngineResult) => {}
	}: {
		leadSource?: string;
		onResult?: (result: EngineResult) => void;
	} = $props();

	// Defaults mirror a realistic mid-size firm so the tool argues FOR automation
	// on first paint. Calibrated against /labs/ops-drain presets.
	const PRESETS: Omit<TaskInput, 'id'>[] = [
		{ label: 'Manual check-in & attendance', people: 3, minutesEach: 20, frequency: 'daily', errorRatePct: 12, automatablePct: 90 },
		{ label: 'Spreadsheet scheduling', people: 2, minutesEach: 45, frequency: 'daily', errorRatePct: 18, automatablePct: 85 },
		{ label: 'Invoicing & billing', people: 2, minutesEach: 35, frequency: 'daily', errorRatePct: 12, automatablePct: 85 },
		{ label: 'Reporting & data entry', people: 3, minutesEach: 60, frequency: 'weekly', errorRatePct: 15, automatablePct: 75 }
	];

	let currency = $state<'NGN' | 'USD'>('NGN');
	let hourlyCost = $state(6500);
	let buildCost = $state(3_500_000);
	let monthlyRunCost = $state(60_000);
	let tasks = $state<TaskInput[]>(PRESETS.map((p, i) => ({ ...p, id: String(i + 1) })));

	let email = $state('');
	let company = $state('');
	let isSubmitting = $state(false);
	let unlocked = $state(false);
	let submitted = $state(false);
	let error = $state<string | null>(null);

	const result = $derived(computeDrain({ hourlyCost, tasks, buildCost, monthlyRunCost }));
	const stack = $derived(recommendStack(result.tasks));
	const worthIt = $derived(result.paybackMonths !== null && result.paybackMonths <= 18);
	const money = (n: number) => formatMoney(n, currency);

	// Push the live result to the parent so downstream sections stay in sync.
	$effect(() => {
		onResult(result);
	});

	const severityCopy: Record<string, string> = {
		low: 'Lean operation. Automation here is optimisation, not rescue.',
		moderate: 'Meaningful drag. A targeted build pays for itself.',
		high: 'Serious leakage. You are funding a salary that produces nothing.',
		critical: 'Critical. Manual process is now your largest hidden cost centre.'
	};

	function validEmail(v: string) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
	}

	function addTask() {
		tasks = [
			...tasks,
			{
				id: crypto.randomUUID(),
				label: 'New manual task',
				people: 1,
				minutesEach: 30,
				frequency: 'weekly',
				errorRatePct: 10,
				automatablePct: 70
			}
		];
	}

	function removeTask(id: string) {
		tasks = tasks.filter((t) => t.id !== id);
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
			'',
			'Tasks:',
			...lines,
			'',
			'Recommended build:',
			...stack.map((s) => `- ${s}`)
		].join('\n');
	}

	/** "Download My Audit Report" — captures the lead then unlocks the blueprint. */
	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = null;
		if (!validEmail(email)) {
			error = 'Please enter a valid email address.';
			return;
		}
		isSubmitting = true;
		try {
			// Always unlock — a delivery failure must never block the prospect.
			unlocked = true;
			submitted = true;
			try {
				localStorage.setItem('rydertech_automation_audit_email', email);
				localStorage.setItem('rydertech_lead_captured', '1');
			} catch {}

			const lead = scoreLead({
				tool: 'ops_drain',
				impactValue: result.recoverableAnnualCost,
				revenueAtRisk: result.recoverableAnnualCost,
				healthScore: 100 - Math.min(100, Math.round(result.recoverableAnnualHours / 20))
			});

			const serviceId = env.PUBLIC_EMAILJS_SERVICE_ID;
			const templateId = env.PUBLIC_EMAILJS_TEMPLATE_ID;
			const publicKey = env.PUBLIC_EMAILJS_PUBLIC_KEY;

			if (serviceId && templateId && publicKey) {
				await emailjs.send(
					serviceId,
					templateId,
					{
						from_name: company || 'Automation Audit lead',
						from_email: email,
						company,
						budget: money(buildCost),
						timeline: result.paybackMonths === null ? 'n/a' : `${result.paybackMonths} month payback`,
						message: `New Automation Audit result (source: /automation-audit). Lead score: ${lead.points}/100 (${lead.tier}).\n\n${summaryText()}`,
						lead_type: 'lead_magnet_automation_audit',
						lead_score: lead.points,
						lead_tier: lead.tier,
						lead_source: leadSource
					},
					{ publicKey }
				);
			} else {
				console.warn('EmailJS not configured — automation-audit lead not emailed:', email);
			}

			// Best-effort DB backup, non-blocking if Supabase is off.
			try {
				const { error: dbError } = await supabase
					.from('newsletter_subscriptions')
					.insert([
						{
							email,
							source: 'lead_magnet_automation_audit',
							subscribed_at: new Date().toISOString(),
							lead_score: lead.points,
							lead_tier: lead.tier,
							lead_source: leadSource
						}
					])
					.select();
						if (dbError) { console.error('Lead NOT persisted:', dbError.code, dbError.message, { email }); }
			} catch {
				console.info('Automation audit lead backup skipped (DB unavailable):', email);
			}
		} catch (err) {
			console.warn('Automation audit lead email failed:', err);
		} finally {
			isSubmitting = false;
		}
	}

	/** Client-side branded PDF one-pager — no backend, no external service. */
	function downloadReport() {
		const report = buildOnePager();
		const blob = new Blob([report], { type: 'application/pdf' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'rydertech-automation-audit.pdf';
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	}

	function esc(s: string) {
		return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
	}

	/**
	 * Minimal single-page PDF written by hand (uncompressed content stream).
	 * Uses Helvetica only so no font embedding is required.
	 */
	function buildOnePager(): string {
		const W = 595;
		const H = 842;
		const M = 48;
		const lines: { text: string; size: number; bold: boolean; x: number; y: number; r: number; g: number; b: number }[] = [];

		let y = H - 70;
		const push = (
			text: string,
			size = 10,
			bold = false,
			color: [number, number, number] = [0.12, 0.13, 0.16],
			indent = 0
		) => {
			lines.push({ text: esc(text), size, bold, x: M + indent, y, r: color[0], g: color[1], b: color[2] });
			y -= size + 6;
		};

		const gold: [number, number, number] = [0.831, 0.686, 0.216];
		const cyan: [number, number, number] = [0.024, 0.714, 0.831];
		const muted: [number, number, number] = [0.42, 0.45, 0.5];
		const red: [number, number, number] = [0.71, 0.16, 0.19];

		push('RYDER TECH  |  AUTOMATION AUDIT', 11, true, cyan);
		y -= 10;
		push('Ops Drain Report', 26, true);
		y -= 6;
		push(`Generated ${new Date().toLocaleDateString('en-GB')}  |  Source: rydertech.ng/automation-audit`, 9, false, muted);
		y -= 20;

		push('ANNUAL COST OF MANUAL WORK', 9, true, muted);
		push(money(result.totalAnnualCost), 30, true, red);
		y -= 8;

		push(`Recoverable by automation: ${money(result.recoverableAnnualCost)}`, 12, true, cyan);
		push(`Net annual saving after run costs: ${money(result.netAnnualSaving)}`, 11);
		push(
			`Payback: ${result.paybackMonths === null ? 'never at this budget' : `${result.paybackMonths} months`}  |  First-year ROI: ${result.firstYearRoiPct}%`,
			11
		);
		push(`Hours consumed per year: ${Math.round(result.totalAnnualHours).toLocaleString()}`, 11);
		push(`Staff days freed per year: ${Math.round(result.daysFreedPerYear)}`, 11);
		y -= 14;

		push('WHERE THE MONEY GOES', 9, true, muted);
		for (const t of result.tasks) {
			push(
				`${t.label} — ${Math.round(t.totalHours).toLocaleString()}h/yr, ${money(t.annualCost)}/yr (recoverable ${money(t.recoverableCost)})`,
				10
			);
		}
		y -= 14;

		push('WHAT WE WOULD BUILD', 9, true, muted);
		for (const s of stack) {
			push(s, 10, false, [0.12, 0.13, 0.16], 12);
		}
		y -= 18;

		push('NEXT STEP', 9, true, gold);
		push('Book a free 20-minute Automation Audit call. We map your top 3', 11);
		push('automation opportunities and project your 12-month ROI before you spend a naira.', 11);
		y -= 10;
		push('rydertech.ng/automation-audit', 11, true, cyan);

		const content =
			lines
				.map((l) => {
					const font = l.bold ? '/F2' : '/F1';
					return [
						'BT',
						`${l.r} ${l.g} ${l.b} rg`,
						`${font} ${l.size} Tf`,
						`1 0 0 1 ${l.x} ${l.y} Tm`,
						`(${l.text}) Tj`,
						'ET'
					].join('\n');
				})
				.join('\n');

		const objects: string[] = [
			'<< /Type /Catalog /Pages 2 0 R >>',
			'<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
			`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>`,
			`<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
			'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
			'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'
		];

		let pdf = '%PDF-1.4\n';
		const offsets: number[] = [];
		objects.forEach((body, i) => {
			offsets.push(pdf.length);
			pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
		});
		const xrefStart = pdf.length;
		pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
		for (const off of offsets) pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
		pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
		return pdf;
	}
</script>

<div class="audit-calculator grid gap-6 lg:grid-cols-[1fr_400px]">
	<!-- INPUTS -->
	<section class="space-y-5">
		<Card>
			<CardHeader class="pb-4">
				<div class="flex items-center justify-between gap-3">
					<CardTitle class="flex items-center gap-2 text-base">
						<Calculator class="h-4 w-4 text-[#06B6D4]" />
						Your numbers
					</CardTitle>
					<div class="flex gap-1 rounded-lg border border-white/10 p-1">
						{#each ['NGN', 'USD'] as c}
							<button
								type="button"
								onclick={() => switchCurrency(c as 'NGN' | 'USD')}
								class="rounded px-3 py-1 text-xs font-medium transition {currency === c
									? 'bg-[#06B6D4] text-[#0A0A0F]'
									: 'text-gray-400 hover:text-white'}"
							>
								{c}
							</button>
						{/each}
					</div>
				</div>
			</CardHeader>
			<CardContent class="grid gap-4 sm:grid-cols-3">
				<label class="block">
					<span class="mb-1.5 block text-xs text-gray-400">Staff cost / hour</span>
					<Input type="number" min="0" bind:value={hourlyCost} />
				</label>
				<label class="block">
					<span class="mb-1.5 block text-xs text-gray-400">Automation build budget</span>
					<Input type="number" min="0" bind:value={buildCost} />
				</label>
				<label class="block">
					<span class="mb-1.5 block text-xs text-gray-400">Monthly run cost</span>
					<Input type="number" min="0" bind:value={monthlyRunCost} />
				</label>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="pb-4">
				<CardTitle class="flex items-center gap-2 text-base">
					<Timer class="h-4 w-4 text-[#06B6D4]" />
					Manual tasks your team does by hand
				</CardTitle>
				<CardDescription>Pre-filled with the processes we see most. Adjust to match your operation.</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				{#each tasks as task, i (task.id)}
					<div class="rounded-lg border border-white/10 bg-white/[0.03] p-4">
						<div class="mb-3 flex items-center gap-3">
							<Input bind:value={task.label} placeholder="Task name" class="flex-1 font-medium" />
							<span class="whitespace-nowrap text-xs text-gray-400">
								{money(result.tasks[i]?.annualCost ?? 0)}/yr
							</span>
							<button
								type="button"
								onclick={() => removeTask(task.id)}
								class="text-gray-400 transition hover:text-red-400"
								aria-label="Remove task"
							>
								<X class="h-4 w-4" />
							</button>
						</div>

						<div class="grid grid-cols-2 gap-3 sm:grid-cols-5">
							<label class="block">
								<span class="mb-1 block text-[11px] tracking-wide text-gray-400 uppercase">People</span>
								<Input type="number" min="0" bind:value={task.people} class="h-8 text-sm" />
							</label>
							<label class="block">
								<span class="mb-1 block text-[11px] tracking-wide text-gray-400 uppercase">Mins each</span>
								<Input type="number" min="0" bind:value={task.minutesEach} class="h-8 text-sm" />
							</label>
							<label class="block">
								<span class="mb-1 block text-[11px] tracking-wide text-gray-400 uppercase">Frequency</span>
								<select
									bind:value={task.frequency}
									class="h-8 w-full rounded-md border border-white/10 bg-transparent px-2 text-sm text-gray-200 outline-none focus-visible:border-[#06B6D4]"
								>
									{#each ['daily', 'weekly', 'monthly'] as f}
										<option value={f} class="bg-[#12121A] text-gray-200">{f}</option>
									{/each}
								</select>
							</label>
							<label class="block">
								<span class="mb-1 block text-[11px] tracking-wide text-gray-400 uppercase">Rework %</span>
								<Input type="number" min="0" max="100" bind:value={task.errorRatePct} class="h-8 text-sm" />
							</label>
							<label class="block max-sm:col-span-2">
								<span class="mb-1 block text-[11px] tracking-wide text-gray-400 uppercase">Automatable %</span>
								<Input type="number" min="0" max="100" bind:value={task.automatablePct} class="h-8 text-sm" />
							</label>
						</div>
					</div>
				{/each}

				<Button variant="outline" class="w-full gap-2" onclick={addTask}>
					<Plus class="h-4 w-4" />
					Add another manual task
				</Button>
			</CardContent>
		</Card>
	</section>

	<!-- RESULTS -->
	<aside class="space-y-5 lg:sticky lg:top-8 lg:self-start">
		<Card>
			<CardHeader class="pb-3">
				<CardDescription class="flex items-center gap-1.5">
					<TrendingDown class="h-3.5 w-3.5" />
					Annual cost of manual work
				</CardDescription>
				<p class="font-playfair text-4xl font-bold text-red-400">{money(result.totalAnnualCost)}</p>
				<p class="text-sm text-gray-400">{severityCopy[result.severity]}</p>
			</CardHeader>
			<CardContent>
				<dl class="space-y-3 border-t border-white/10 pt-4 text-sm">
					<div class="flex justify-between gap-3">
						<dt class="text-gray-400">Hours consumed / year</dt>
						<dd class="font-medium">{result.totalAnnualHours.toLocaleString()}</dd>
					</div>
					<div class="flex justify-between gap-3">
						<dt class="text-gray-400">Recoverable by automation</dt>
						<dd class="font-medium text-[#06B6D4]">{money(result.recoverableAnnualCost)}</dd>
					</div>
					<div class="flex justify-between gap-3">
						<dt class="text-gray-400">Staff days freed / year</dt>
						<dd class="font-medium">{result.daysFreedPerYear}</dd>
					</div>
					<div class="flex justify-between gap-3">
						<dt class="text-gray-400">Net saving after run costs</dt>
						<dd class="font-medium {result.netAnnualSaving > 0 ? 'text-[#D4AF37]' : 'text-red-400'}">
							{money(result.netAnnualSaving)}
						</dd>
					</div>
					<div class="flex justify-between gap-3">
						<dt class="text-gray-400">Payback period</dt>
						<dd class="font-medium">
							{result.paybackMonths === null ? 'Never at this budget' : `${result.paybackMonths} months`}
						</dd>
					</div>
					<div class="flex justify-between gap-3">
						<dt class="text-gray-400">First-year ROI</dt>
						<dd class="font-medium {result.firstYearRoiPct >= 0 ? 'text-[#06B6D4]' : 'text-red-400'}">
							{result.firstYearRoiPct}%
						</dd>
					</div>
				</dl>

				<div
					class="mt-4 flex gap-2 rounded-lg border p-3 text-sm {worthIt
						? 'border-[#06B6D4]/30 bg-[#06B6D4]/5'
						: 'border-white/10 bg-white/[0.02]'}"
				>
					{#if worthIt}
						<CircleCheck class="mt-0.5 h-4 w-4 shrink-0 text-[#06B6D4]" />
						<span>This build pays for itself in under 18 months. Worth doing now.</span>
					{:else if result.paybackMonths === null}
						<CircleAlert class="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
						<span>At this budget the automation costs more than it saves. Reduce scope or run cost.</span>
					{:else}
						<CircleAlert class="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
						<span>
							Payback is {result.paybackMonths} months — long. Trim scope or target higher-volume tasks first.
						</span>
					{/if}
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardContent class="pt-6">
				{#if !unlocked}
					<div class="mb-4 flex items-center justify-between gap-2">
						<Badge variant="outline" class="border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37]">
							Step 2
						</Badge>
						<span class="text-xs text-gray-400">Free · No sales call</span>
					</div>
					<h3 class="text-lg font-semibold">Download My Audit Report</h3>
					<p class="mt-1.5 text-sm text-gray-400">
						Get the branded one-page breakdown of these numbers plus the scoped build plan — the
						systems, the sequence, and what each phase costs.
					</p>
					<form onsubmit={handleSubmit} class="mt-4 space-y-3">
						<Input type="text" bind:value={company} placeholder="Company" />
						<Input type="email" bind:value={email} placeholder="you@company.com" required />
						{#if error}
							<p class="text-xs text-red-400">{error}</p>
						{/if}
						<Button type="submit" disabled={isSubmitting} class="w-full gap-2">
							{#if isSubmitting}
								<LoaderCircle class="h-4 w-4 animate-spin" />
								Sending…
							{:else}
								<Download class="h-4 w-4" />
								Download My Audit Report
							{/if}
						</Button>
						<p class="text-center text-[11px] text-gray-400">
							We email it. No email required to calculate above.
						</p>
					</form>
				{:else}
					<h3 class="flex items-center gap-2 text-lg font-semibold text-[#06B6D4]">
						<CircleCheck class="h-5 w-5" />
						Your report is ready
					</h3>
					<p class="mt-1.5 text-sm text-gray-400">
						{submitted ? 'Sent to ' + email + '. Download a copy now:' : 'Download your copy:'}
					</p>
					<Button class="mt-4 w-full gap-2" onclick={downloadReport}>
						<Download class="h-4 w-4" />
						Download the PDF one-pager
					</Button>

					<h4 class="mt-6 text-sm font-semibold text-[#D4AF37]">Your recommended build</h4>
					<ul class="mt-3 space-y-3">
						{#each stack as item}
							<li class="flex gap-2.5 text-sm text-gray-400">
								<span class="mt-0.5 text-[#06B6D4]">▸</span>
								<span>{item}</span>
							</li>
						{/each}
					</ul>

					<Button href="/automation-audit#book" class="mt-5 w-full">Book My Free Audit Call</Button>
				{/if}
			</CardContent>
		</Card>
	</aside>
</div>
