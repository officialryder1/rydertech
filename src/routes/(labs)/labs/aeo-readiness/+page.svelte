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
	import {
		computeAeoReadiness,
		type EngineInput,
		type Currency
	} from '$lib/aeoReadiness';
	import { reportFromAeo, buildShareUrl } from '$lib/shareReport';
	import { scoreLead } from '$lib/leadScore';
	import { goto } from '$app/navigation';
	import {
		Sparkles,
		Bot,
		Code2,
		MessageSquareText,
		BadgeCheck,
		Link2,
		RefreshCw,
		MapPin,
		ArrowLeft,
		CheckCircle2,
		AlertTriangle,
		Calculator,
		Gauge,
		PartyPopper,
		TrendingUp
	} from '@lucide/svelte';

	const PRESET: Omit<EngineInput, 'currency'> = {
		haveWebsite: false,
		hasStructuredData: false,
		hasFAQContent: false,
		entityClear: false,
		citedByAuthorities: false,
		hasKnowledgePresence: false,
		contentFresh: false,
		hasLocalSignal: false,
		monthlyVisitors: 0,
		avgCustomerValue: 5000
	};

	let currency = $state<Currency>('NGN');
	let businessName = $state('');
	let haveWebsite = $state(PRESET.haveWebsite);
	let hasStructuredData = $state(PRESET.hasStructuredData);
	let hasFAQContent = $state(PRESET.hasFAQContent);
	let entityClear = $state(PRESET.entityClear);
	let citedByAuthorities = $state(PRESET.citedByAuthorities);
	let hasKnowledgePresence = $state(PRESET.hasKnowledgePresence);
	let contentFresh = $state(PRESET.contentFresh);
	let hasLocalSignal = $state(PRESET.hasLocalSignal);
	let monthlyVisitors = $state(PRESET.monthlyVisitors);
	let avgCustomerValue = $state(PRESET.avgCustomerValue);

	let email = $state('');
	let company = $state('');
	let isSubmitting = $state(false);
	let unlocked = $state(false);
	let error = $state<string | null>(null);

	const input = $derived<EngineInput>({
		haveWebsite,
		hasStructuredData,
		hasFAQContent,
		entityClear,
		citedByAuthorities,
		hasKnowledgePresence,
		contentFresh,
		hasLocalSignal,
		monthlyVisitors,
		avgCustomerValue,
		currency
	});

	const result = $derived(computeAeoReadiness(input));
	const money = (n: number) => formatMoney(n, currency);
	const critical = $derived(result.severity === 'critical' || result.severity === 'high');

	function getReport() {
		const payload = reportFromAeo(result, currency, businessName);
		goto(buildShareUrl(payload));
	}

	function switchCurrency(next: Currency) {
		if (next === currency) return;
		currency = next;
		avgCustomerValue = next === 'USD' ? 30 : PRESET.avgCustomerValue;
	}

	function validEmail(v: string) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
	}

	function summaryText() {
		return [
			`Business: ${businessName || '(not named)'}`,
			`AI-search readiness score: ${result.score}/100 (${result.readiness})`,
			`Est. answer surfaces / month: ${result.estMonthlyAnswers.toLocaleString()}`,
			`Citations missed / month: ${result.estMissed.toLocaleString()}`,
			`Revenue left on table / year: ${money(result.revenueAtRisk)}`,
			'',
			'Gaps found:',
			...result.gaps.map((g) => `- ${g.factor} (${g.severity}): ${g.impact}`),
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
			unlocked = true; // never block the prospect on a delivery failure
			try {
				localStorage.setItem('rydertech_aeo_email', email);
				localStorage.setItem('rydertech_lead_captured', '1');
			} catch {}

			const lead = scoreLead({
				tool: 'aeo',
				impactValue: result.revenueAtRisk,
				revenueAtRisk: result.revenueAtRisk,
				healthScore: result.score
			});
			const leadScoreVal = lead.points;
			const leadTier = lead.tier;

			const serviceId = env.PUBLIC_EMAILJS_SERVICE_ID;
			const templateId = env.PUBLIC_EMAILJS_TEMPLATE_ID;
			const publicKey = env.PUBLIC_EMAILJS_PUBLIC_KEY;

			if (serviceId && templateId && publicKey) {
				await emailjs.send(
					serviceId,
					templateId,
					{
						from_name: company || businessName || 'AI Search Readiness lead',
						from_email: email,
						company: company || businessName,
						budget: money(result.revenueAtRisk),
						timeline: `${result.score}/100 readiness`,
						message: `New AI Search Readiness Audit result (source: /labs/aeo-readiness). Lead score: ${leadScoreVal}/100 (${leadTier}).\n\n${summaryText()}`,
						lead_type: 'lead_magnet_aeo',
						lead_score: leadScoreVal,
						lead_tier: leadTier
					},
					{ publicKey }
				);
			} else {
				console.warn('EmailJS not configured — aeo lead not emailed:', email);
			}

			try {
				await supabase
					.from('newsletter_subscriptions')
					.insert([{ email, source: 'lead_magnet_aeo', subscribed_at: new Date().toISOString(), lead_score: leadScoreVal, lead_tier: leadTier }])
					.select();
			} catch {
				console.info('AEO lead backup skipped (DB unavailable):', email);
			}
		} catch (err) {
			console.warn('AEO lead email failed:', err);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<SEOMeta
	data={{
		title: 'AI Search Readiness Audit — Are You Cited by ChatGPT & Google AI? | RyderTech',
		description:
			'Score how ready your business is to be quoted by AI answer engines (Google AI Overviews, ChatGPT, Gemini). Free 60-second AEO audit shows the customers you miss when AI names a competitor instead.',
		canonical: 'https://rydertech.ng/labs/aeo-readiness'
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
			<Badge variant="secondary" class="mb-3">Answer Engine Optimization (AEO)</Badge>
			<h1 class="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
				When customers ask AI for a business like yours — does it name you?
			</h1>
			<p class="mt-4 text-lg text-muted-foreground">
				Answer engines (Google AI Overviews, ChatGPT, Gemini, Siri) quote a <em>source</em>. If your
				site isn't structured to be cited, the AI names a competitor. Score your AI-search readiness
				in 60 seconds — no signup required.
			</p>
		</header>

		<div class="grid gap-8 lg:grid-cols-[1fr_400px]">
			<!-- INPUTS -->
			<section class="space-y-6">
				<Card>
					<CardHeader class="pb-4">
						<CardTitle class="flex items-center gap-2 text-base">
							<Bot class="h-4 w-4 text-primary" />
							Your AI-search signals
						</CardTitle>
						<CardDescription>Tick what's true today. We score the gaps.</CardDescription>
					</CardHeader>
					<CardContent class="grid gap-3">
						<label class="flex items-center gap-2 text-sm text-muted-foreground">
							<input type="checkbox" bind:checked={haveWebsite} class="h-4 w-4 accent-primary" />
							We have a crawlable website
						</label>
						<label class="flex items-center gap-2 text-sm text-muted-foreground">
							<input type="checkbox" bind:checked={hasStructuredData} class="h-4 w-4 accent-primary" />
							We use structured data (schema.org / JSON-LD)
						</label>
						<label class="flex items-center gap-2 text-sm text-muted-foreground">
							<input type="checkbox" bind:checked={hasFAQContent} class="h-4 w-4 accent-primary" />
							We publish direct-answer (FAQ) content
						</label>
						<label class="flex items-center gap-2 text-sm text-muted-foreground">
							<input type="checkbox" bind:checked={entityClear} class="h-4 w-4 accent-primary" />
							Our entity is clearly defined (about / author / NAP)
						</label>
						<label class="flex items-center gap-2 text-sm text-muted-foreground">
							<input type="checkbox" bind:checked={citedByAuthorities} class="h-4 w-4 accent-primary" />
							Trusted sites (press, high-DA) cite or link us
						</label>
						<label class="flex items-center gap-2 text-sm text-muted-foreground">
							<input type="checkbox" bind:checked={hasKnowledgePresence} class="h-4 w-4 accent-primary" />
							We appear in Google's knowledge graph / Maps
						</label>
						<label class="flex items-center gap-2 text-sm text-muted-foreground">
							<input type="checkbox" bind:checked={contentFresh} class="h-4 w-4 accent-primary" />
							Our core content was updated in the last 6 months
						</label>
						<label class="flex items-center gap-2 text-sm text-muted-foreground">
							<input type="checkbox" bind:checked={hasLocalSignal} class="h-4 w-4 accent-primary" />
							We have local entity signals (LocalBusiness schema / citations)
						</label>
					</CardContent>
				</Card>

				<Card>
					<CardHeader class="pb-4">
						<div class="flex items-center justify-between">
							<CardTitle class="flex items-center gap-2 text-base">
								<Calculator class="h-4 w-4 text-primary" />
								Traffic & value
							</CardTitle>
							<div class="flex gap-1 rounded-lg border p-1">
								{#each ['NGN', 'USD'] as c}
									<button
										type="button"
										onclick={() => switchCurrency(c as Currency)}
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
							<span class="mb-1.5 block text-xs text-muted-foreground">Monthly organic visitors</span>
							<Input type="number" min="0" bind:value={monthlyVisitors} />
						</label>
						<label class="block">
							<span class="mb-1.5 block text-xs text-muted-foreground">Avg value of one referred customer</span>
							<Input type="number" min="0" bind:value={avgCustomerValue} />
						</label>
						<label class="block sm:col-span-2">
							<span class="mb-1.5 block text-xs text-muted-foreground">Business name (optional)</span>
							<Input type="text" bind:value={businessName} placeholder="e.g. RyderTech" />
						</label>
					</CardContent>
				</Card>
			</section>

			<!-- RESULTS -->
			<aside class="space-y-6 lg:sticky lg:top-8 lg:self-start">
				<Card>
					<CardHeader class="pb-3">
						<CardDescription class="flex items-center gap-1.5">
							<Gauge class="h-3.5 w-3.5" />
							Your AI-search readiness
						</CardDescription>
						<div class="flex items-end gap-2">
							<p class="text-5xl font-bold {critical ? 'text-destructive' : 'text-foreground'}">
								{result.score}
							</p>
							<span class="mb-1 text-lg text-muted-foreground">/100</span>
						</div>
						<p class="text-sm text-muted-foreground">
							Readiness: <span class="font-medium text-primary">{result.readiness}</span>
						</p>
					</CardHeader>
					<CardContent>
						<dl class="space-y-3 border-t pt-4 text-sm">
							<div class="flex justify-between">
								<dt class="text-muted-foreground">Est. answer surfaces / mo</dt>
								<dd class="font-medium">{result.estMonthlyAnswers.toLocaleString()}</dd>
							</div>
							<div class="flex justify-between">
								<dt class="text-muted-foreground">Citations missed / mo</dt>
								<dd class="font-medium text-destructive">{result.estMissed.toLocaleString()}</dd>
							</div>
							<div class="flex justify-between">
								<dt class="text-muted-foreground">Revenue left on table / yr</dt>
								<dd class="font-medium text-destructive">{money(result.revenueAtRisk)}</dd>
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

						{#if result.gaps.length}
							<div class="mt-4 space-y-2">
								<p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									What's holding you back
								</p>
								{#each result.gaps as gap}
									<div
										class="flex gap-2 rounded-md border p-2.5 text-sm {gap.severity === 'critical'
											? 'border-destructive/30 bg-destructive/5'
											: gap.severity === 'high'
												? 'border-destructive/20'
												: 'border-border'}"
									>
										<span class="mt-0.5 text-destructive">▸</span>
										<div>
											<p class="font-medium text-foreground">{gap.factor}</p>
											<p class="text-xs text-muted-foreground">{gap.impact}</p>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</CardContent>
				</Card>

				<Card>
					<CardContent class="pt-6">
						{#if !unlocked}
							<h3 class="text-lg font-semibold">Get your AEO fix plan</h3>
							<p class="mt-1.5 text-sm text-muted-foreground">
								We'll send the scoped plan for your exact readiness profile — the schema, the
								FAQ content, and the authority work that makes AI name you first.
							</p>
							<form onsubmit={handleSubmit} class="mt-4 space-y-3">
								<Input type="text" bind:value={company} placeholder="Company / business name" />
								<Input type="email" bind:value={email} placeholder="you@business.com" required />
								{#if error}
									<p class="text-xs text-destructive">{error}</p>
								{/if}
								<Button type="submit" disabled={isSubmitting} class="w-full">
									{isSubmitting ? 'Sending…' : 'Send me the plan'}
								</Button>
							</form>
						{:else}
							<h3 class="flex items-center gap-2 text-lg font-semibold text-primary">
								<PartyPopper class="h-5 w-5" />
								Your AEO upgrades
							</h3>
							<ul class="mt-4 space-y-3">
								{#each result.enhancements as item}
									<li class="flex gap-2.5 text-sm text-muted-foreground">
										<span class="mt-0.5 text-primary">▸</span>
										<span>{item}</span>
									</li>
								{/each}
							</ul>
							<Button href="/contact?tool=aeo-readiness" class="mt-5 w-full">Book a scoping call</Button>
							<Button variant="outline" class="mt-2 w-full gap-2" onclick={getReport}>
								<TrendingUp class="h-4 w-4" /> Get shareable audit report
							</Button>
							<a
								href="/services/ai"
								class="mt-2 block text-center text-sm text-muted-foreground hover:text-foreground"
								>Or see our AI & automation work →</a
							>
						{/if}
					</CardContent>
				</Card>
			</aside>
		</div>
	</div>
</div>
