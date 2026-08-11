<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import SEOMeta from '$lib/components/SEOMeta.svelte';
	import { supabase } from '$lib/supabaseClient';
	import { env } from '$env/dynamic/public';
	import emailjs from '@emailjs/browser';
	import { formatMoney } from '$lib/opsDrain';
	import { computeRevLeak, type EngineInput } from '$lib/revLeak';
	import {
		Gauge,
		TrendingDown,
		ArrowLeft,
		CheckCircle2,
		AlertTriangle,
		Calculator,
		Zap
	} from '@lucide/svelte';

	// Defaults model a realistic mid-size e-commerce / lead-gen site with a slow load.
	const PRESET: Omit<EngineInput, 'currency'> = {
		monthlyVisitors: 20000,
		conversionRate: 2.5,
		avgOrderValue: 25000,
		loadTimeSeconds: 5
	};

	let currency = $state<'NGN' | 'USD'>('NGN');
	let monthlyVisitors = $state(PRESET.monthlyVisitors);
	let conversionRate = $state(PRESET.conversionRate);
	let avgOrderValue = $state(PRESET.avgOrderValue);
	let loadTimeSeconds = $state(PRESET.loadTimeSeconds);

	let email = $state('');
	let company = $state('');
	let isSubmitting = $state(false);
	let unlocked = $state(false);
	let error = $state<string | null>(null);

	const input = $derived<EngineInput>({
		monthlyVisitors,
		conversionRate,
		avgOrderValue,
		loadTimeSeconds,
		currency
	});

	const result = $derived(computeRevLeak(input));
	const money = (n: number) => formatMoney(n, currency);
	const critical = $derived(result.severity === 'critical' || result.severity === 'high');

	function switchCurrency(next: 'NGN' | 'USD') {
		if (next === currency) return;
		currency = next;
		if (next === 'USD') {
			avgOrderValue = 170;
		} else {
			avgOrderValue = PRESET.avgOrderValue;
		}
	}

	function validEmail(v: string) {
		return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v);
	}

	function summaryText() {
		return [
			`Monthly visitors: ${monthlyVisitors.toLocaleString()}`,
			`Current conversion: ${conversionRate}%`,
			`Avg order value: ${money(avgOrderValue)}`,
			`Load time: ${loadTimeSeconds}s`,
			'',
			`Conversion lost to slow load: ${result.lostConversionPct}%`,
			`Orders lost / month: ${result.lostOrdersPerMonth.toLocaleString()}`,
			`Revenue leaked / month: ${money(result.monthlyLeak)}`,
			`Revenue leaked / year: ${money(result.annualLeak)}`,
			`Severity: ${result.severity}`,
			'',
			'Recommended fixes:',
			...result.enhancements.map((e) => `- ${e}`)
		].join('\\n');
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
				localStorage.setItem('rydertech_revleak_email', email);
			} catch {}

			const serviceId = env.PUBLIC_EMAILJS_SERVICE_ID;
			const templateId = env.PUBLIC_EMAILJS_TEMPLATE_ID;
			const publicKey = env.PUBLIC_EMAILJS_PUBLIC_KEY;

			if (serviceId && templateId && publicKey) {
				await emailjs.send(
					serviceId,
					templateId,
					{
						from_name: company || 'RevLeak Auditor lead',
						from_email: email,
						company,
						budget: money(result.annualLeak),
						timeline: `${result.lostConversionPct}% conversion recovered`,
						message: `New RevLeak Auditor result (source: /labs/revleak).\n\n${summaryText()}`,
						lead_type: 'lead_magnet_revleak'
					},
					{ publicKey }
				);
			} else {
				console.warn('EmailJS not configured — revleak lead not emailed:', email);
			}

			try {
				await supabase
					.from('newsletter_subscriptions')
					.insert([
						{ email, source: 'lead_magnet_revleak', subscribed_at: new Date().toISOString() }
					])
					.select();
			} catch {
				console.info('RevLeak lead backup skipped (DB unavailable):', email);
			}
		} catch (err) {
			console.warn('RevLeak lead email failed:', err);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<SEOMeta
	data={{
		title: 'RevLeak Auditor — How Much Revenue Your Slow Site Is Losing | RyderTech',
		description:
			'Calculate the revenue your slow website leaks every month from lost conversions. Free diagnostic from RyderTech — enter your traffic, conversion, and load time to see the cost.',
		canonical: 'https://rydertech.ng/labs/revleak'
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
			<Badge variant="secondary" class="mb-3">Revenue Leak Diagnostic</Badge>
			<h1 class="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
				Your slow site has a price tag.
			</h1>
			<p class="mt-4 text-lg text-muted-foreground">
				Speed isn't a vanity metric. Every second past 2s silently bleeds conversions. Enter your
				real numbers and see exactly what your site loses each month — and what a fix is worth.
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
					<CardContent class="grid gap-4 sm:grid-cols-2">
						<label class="block">
							<span class="mb-1.5 block text-xs text-muted-foreground">Monthly visitors</span>
							<Input type="number" min="0" bind:value={monthlyVisitors} />
						</label>
						<label class="block">
							<span class="mb-1.5 block text-xs text-muted-foreground">Conversion rate (%)</span>
							<Input type="number" min="0" step="0.1" bind:value={conversionRate} />
						</label>
						<label class="block">
							<span class="mb-1.5 block text-xs text-muted-foreground">Avg order value</span>
							<Input type="number" min="0" bind:value={avgOrderValue} />
						</label>
						<label class="block">
							<span class="mb-1.5 block text-xs text-muted-foreground">Load time (seconds)</span>
							<Input type="number" min="0.1" step="0.1" bind:value={loadTimeSeconds} />
						</label>
					</CardContent>
				</Card>

				<Card>
					<CardHeader class="pb-4">
						<CardTitle class="flex items-center gap-2 text-base">
							<Zap class="h-4 w-4 text-primary" />
							The leak, explained
						</CardTitle>
						<CardDescription>
							Conversion decays ~9% per second past the 2s "good" threshold. We never attribute more
							than 70% of conversion to speed.
						</CardDescription>
					</CardHeader>
					<CardContent class="space-y-3 text-sm text-muted-foreground">
						<div class="flex items-center gap-2">
							<span class="font-medium text-foreground">{monthlyVisitors.toLocaleString()}</span>
							visitors ×
							<span class="font-medium text-foreground">{conversionRate}%</span>
							convert =
							<span class="font-medium text-foreground"
								>{Math.round((monthlyVisitors * conversionRate) / 100).toLocaleString()}</span
							>
							orders / month today
						</div>
						<div class="flex items-center gap-2">
							A 2s load would hold
							<span class="font-medium text-primary">{result.conversionRateOptimal}%</span>
							=
							<span class="font-medium text-primary"
								>{Math.round((monthlyVisitors * result.conversionRateOptimal) / 100).toLocaleString()}</span
							>
							orders / month
						</div>
						<div class="rounded-lg border border-primary/20 bg-primary/5 p-3">
							You're losing
							<span class="font-semibold text-destructive"
								>{result.lostOrdersPerMonth.toLocaleString()}</span
							>
							orders / month to slow load.
						</div>
					</CardContent>
				</Card>
			</section>

			<!-- RESULTS -->
			<aside class="space-y-6 lg:sticky lg:top-8 lg:self-start">
				<Card>
					<CardHeader class="pb-3">
						<CardDescription class="flex items-center gap-1.5">
							<TrendingDown class="h-3.5 w-3.5" />
							Revenue your site leaks per year
						</CardDescription>
						<p class="text-4xl font-bold {critical ? 'text-destructive' : 'text-foreground'}">
							{money(result.annualLeak)}
						</p>
						<p class="text-sm text-muted-foreground">
							<span class="font-medium text-destructive">{result.lostConversionPct}%</span> of conversions
							lost at a <span class="font-medium">{loadTimeSeconds}s</span> load.
						</p>
					</CardHeader>
					<CardContent>
						<dl class="space-y-3 border-t pt-4 text-sm">
							<div class="flex justify-between">
								<dt class="text-muted-foreground">Lost per month</dt>
								<dd class="font-medium text-destructive">{money(result.monthlyLeak)}</dd>
							</div>
							<div class="flex justify-between">
								<dt class="text-muted-foreground">Orders lost / month</dt>
								<dd class="font-medium">{result.lostOrdersPerMonth.toLocaleString()}</dd>
							</div>
							<div class="flex justify-between">
								<dt class="text-muted-foreground">Recoverable / year</dt>
								<dd class="font-medium text-primary">{money(result.recoverableAnnual)}</dd>
							</div>
						</dl>

						<div
							class="mt-4 flex gap-2 rounded-lg border p-3 text-sm {critical
								? 'border-destructive/30 bg-destructive/5'
								: 'border-primary/30 bg-primary/5'}"
						>
							{#if critical}
								<AlertTriangle class="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
								<span>{result.verdict}</span>
							{:else}
								<CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0 text-primary" />
								<span>{result.verdict}</span>
							{/if}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent class="pt-6">
						{#if !unlocked}
							<h3 class="text-lg font-semibold">Get the speed-fix blueprint</h3>
							<p class="mt-1.5 text-sm text-muted-foreground">
								We'll send the scoped performance plan for your exact leak — the audit, the rebuild,
								and the projected revenue recovery.
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
								<Gauge class="h-5 w-5" />
								Your speed-fix plan
							</h3>
							<ul class="mt-4 space-y-3">
								{#each result.enhancements as item}
									<li class="flex gap-2.5 text-sm text-muted-foreground">
										<span class="mt-0.5 text-primary">▸</span>
										<span>{item}</span>
									</li>
								{/each}
							</ul>
							<Button href="/contact" class="mt-5 w-full">Book a performance audit</Button>
							<a href="/services/web-design-in-nigeria" class="mt-2 block text-center text-sm text-muted-foreground hover:text-foreground">Or see our web rebuild work →</a>
						{/if}
					</CardContent>
				</Card>
			</aside>
		</div>
	</div>
</div>
