<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import SEOMeta from '$lib/components/SEOMeta.svelte';
	import { supabase } from '$lib/supabaseClient';
	import { env } from '$env/dynamic/public';
	import emailjs from '@emailjs/browser';
	import {
		Timer,
		TrendingDown,
		Plus,
		X,
		ArrowLeft,
		CheckCircle2,
		AlertTriangle,
		Calculator
	} from '@lucide/svelte';

	import {
		computeDrain,
		formatMoney,
		recommendStack,
		type TaskInput
	} from '$lib/opsDrain';
	import { reportFromOpsDrain, buildShareUrl } from '$lib/shareReport';
	import { goto } from '$app/navigation';

	// Defaults model a realistic mid-size firm with genuine process drain.
	// Calibration matters: if defaults yield a negative verdict the tool argues
	// against our own service on first paint. Current values → ~11mo payback.
	const PRESETS: Omit<TaskInput, 'id'>[] = [
		{ label: 'Invoicing & billing', people: 3, minutesEach: 35, frequency: 'daily', errorRatePct: 12, automatablePct: 85 },
		{ label: 'Client onboarding', people: 2, minutesEach: 120, frequency: 'weekly', errorRatePct: 15, automatablePct: 70 },
		{ label: 'Reporting & data entry', people: 4, minutesEach: 75, frequency: 'weekly', errorRatePct: 12, automatablePct: 75 }
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
	let error = $state<string | null>(null);

	const result = $derived(computeDrain({ hourlyCost, tasks, buildCost, monthlyRunCost }));
	const stack = $derived(recommendStack(result.tasks));
	const worthIt = $derived(result.paybackMonths !== null && result.paybackMonths <= 18);
	const money = (n: number) => formatMoney(n, currency);

	function getReport() {
		const payload = reportFromOpsDrain(result, currency);
		goto(buildShareUrl(payload));
	}

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
			try {
				localStorage.setItem('rydertech_ops_drain_email', email);
			} catch {}

			const serviceId = env.PUBLIC_EMAILJS_SERVICE_ID;
			const templateId = env.PUBLIC_EMAILJS_TEMPLATE_ID;
			const publicKey = env.PUBLIC_EMAILJS_PUBLIC_KEY;

			if (serviceId && templateId && publicKey) {
				await emailjs.send(
					serviceId,
					templateId,
					{
						from_name: company || 'Ops Drain Calculator lead',
						from_email: email,
						company,
						budget: money(buildCost),
						timeline: result.paybackMonths === null ? 'n/a' : `${result.paybackMonths} month payback`,
						message: `New Ops Drain Calculator result (source: /labs/ops-drain).\n\n${summaryText()}`,
						lead_type: 'lead_magnet_ops_drain'
					},
					{ publicKey }
				);
			} else {
				console.warn('EmailJS not configured — ops-drain lead not emailed:', email);
			}

			// Best-effort DB backup, non-blocking if Supabase is off.
			try {
				await supabase
					.from('newsletter_subscriptions')
					.insert([
						{ email, source: 'lead_magnet_ops_drain', subscribed_at: new Date().toISOString() }
					])
					.select();
			} catch {
				console.info('Ops drain lead backup skipped (DB unavailable):', email);
			}
		} catch (err) {
			console.warn('Ops drain lead email failed:', err);
		} finally {
			isSubmitting = false;
		}
	}

	const severityCopy: Record<string, string> = {
		low: 'Lean operation. Automation here is optimisation, not rescue.',
		moderate: 'Meaningful drag. A targeted build pays for itself.',
		high: 'Serious leakage. You are funding a salary that produces nothing.',
		critical: 'Critical. Manual process is now your largest hidden cost centre.'
	};
</script>

<SEOMeta
	data={{
		title: 'Ops Drain Calculator — What Manual Processes Really Cost You | RyderTech',
		description:
			'Calculate the annual cost of your manual business processes, the hours automation recovers, and the payback period on an automation build. Free, instant, no signup to calculate.',
		canonical: 'https://rydertech.ng/labs/ops-drain'
	}}
/>

<div class="min-h-screen bg-background">
	<div class="container mx-auto max-w-6xl px-4 py-10">
		<a
			href="/labs"
			class="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
		>
			<ArrowLeft class="h-4 w-4" />
			Back to Labs
		</a>

		<header class="mb-10 max-w-3xl">
			<Badge variant="secondary" class="mb-3">Ops Diagnostic</Badge>
			<h1 class="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
				Your manual processes have a price tag.
			</h1>
			<p class="mt-4 text-lg text-muted-foreground">
				Most teams never calculate it. Enter your real numbers and see the annual cost, the hours
				automation gives back, and how fast the build pays for itself.
			</p>
		</header>

		<div class="grid gap-8 lg:grid-cols-[1fr_400px]">
			<!-- INPUTS -->
			<section class="space-y-6">
				<Card>
					<CardHeader class="pb-4">
						<div class="flex items-center justify-between">
							<CardTitle class="flex items-center gap-2 text-base">
								<Calculator class="h-4 w-4 text-primary" />
								Your numbers
							</CardTitle>
							<div class="flex gap-1 rounded-lg border p-1">
								{#each ['NGN', 'USD'] as c}
									<button
										type="button"
										onclick={() => switchCurrency(c as 'NGN' | 'USD')}
										class="rounded px-3 py-1 text-xs font-medium transition {currency === c
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
							<span class="mb-1.5 block text-xs text-muted-foreground">Staff cost / hour</span>
							<Input type="number" min="0" bind:value={hourlyCost} />
						</label>
						<label class="block">
							<span class="mb-1.5 block text-xs text-muted-foreground">Automation build budget</span>
							<Input type="number" min="0" bind:value={buildCost} />
						</label>
						<label class="block">
							<span class="mb-1.5 block text-xs text-muted-foreground">Monthly run cost</span>
							<Input type="number" min="0" bind:value={monthlyRunCost} />
						</label>
					</CardContent>
				</Card>

				<Card>
					<CardHeader class="pb-4">
						<CardTitle class="flex items-center gap-2 text-base">
							<Timer class="h-4 w-4 text-primary" />
							Manual tasks
						</CardTitle>
						<CardDescription>Add every repeated task your team does by hand.</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
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

						<Button variant="outline" class="w-full gap-2" onclick={addTask}>
							<Plus class="h-4 w-4" />
							Add another manual task
						</Button>
					</CardContent>
				</Card>
			</section>

			<!-- RESULTS -->
			<aside class="space-y-6 lg:sticky lg:top-8 lg:self-start">
				<Card>
					<CardHeader class="pb-3">
						<CardDescription class="flex items-center gap-1.5">
							<TrendingDown class="h-3.5 w-3.5" />
							Annual cost of manual work
						</CardDescription>
						<p class="text-4xl font-bold text-destructive">{money(result.totalAnnualCost)}</p>
						<p class="text-sm text-muted-foreground">{severityCopy[result.severity]}</p>
					</CardHeader>
					<CardContent>
						<dl class="space-y-3 border-t pt-4 text-sm">
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
								<dd class="font-medium {result.netAnnualSaving > 0 ? '' : 'text-destructive'}">
									{money(result.netAnnualSaving)}
								</dd>
							</div>
							<div class="flex justify-between">
								<dt class="text-muted-foreground">Payback period</dt>
								<dd class="font-medium">
									{result.paybackMonths === null ? 'Never at this budget' : `${result.paybackMonths} months`}
								</dd>
							</div>
							<div class="flex justify-between">
								<dt class="text-muted-foreground">First-year ROI</dt>
								<dd class="font-medium {result.firstYearRoiPct >= 0 ? 'text-primary' : 'text-destructive'}">
									{result.firstYearRoiPct}%
								</dd>
							</div>
						</dl>

						<div
							class="mt-4 flex gap-2 rounded-lg border p-3 text-sm {worthIt
								? 'border-primary/30 bg-primary/5'
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
							<h3 class="text-lg font-semibold">Get the full automation blueprint</h3>
							<p class="mt-1.5 text-sm text-muted-foreground">
								We'll send the scoped build plan for the exact tasks you entered — the systems, the
								sequence, and what each phase costs.
							</p>
							<form onsubmit={handleSubmit} class="mt-4 space-y-3">
								<Input type="text" bind:value={company} placeholder="Company" />
								<Input type="email" bind:value={email} placeholder="you@company.com" required />
								{#if error}
									<p class="text-xs text-destructive">{error}</p>
								{/if}
								<Button type="submit" disabled={isSubmitting} class="w-full">
									{isSubmitting ? 'Sending…' : 'Send me the blueprint'}
								</Button>
							</form>
						{:else}
							<h3 class="flex items-center gap-2 text-lg font-semibold text-primary">
								<CheckCircle2 class="h-5 w-5" />
								Your recommended build
							</h3>
							<ul class="mt-4 space-y-3">
								{#each stack as item}
									<li class="flex gap-2.5 text-sm text-muted-foreground">
										<span class="mt-0.5 text-primary">▸</span>
										<span>{item}</span>
									</li>
								{/each}
							</ul>
							<Button href="/contact" class="mt-5 w-full">Book a scoping call</Button>
							<Button variant="outline" class="mt-2 w-full gap-2" onclick={getReport}>
								<Calculator class="h-4 w-4" /> Get shareable audit report
							</Button>
							<a href="/services/ai" class="mt-2 block text-center text-sm text-muted-foreground hover:text-foreground">Or see how we automate it →</a>
						{/if}
					</CardContent>
				</Card>
			</aside>
		</div>
	</div>
</div>
