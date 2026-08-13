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
		computeLocalVisibility,
		type EngineInput,
		type Currency
	} from '$lib/localVisibility';
	import { reportFromLocalVisibility, buildShareUrl } from '$lib/shareReport';
	import { goto } from '$app/navigation';
	import {
		Search,
		MapPin,
		Globe,
		Star,
		Users,
		ArrowLeft,
		CheckCircle2,
		AlertTriangle,
		Calculator,
		Gauge,
		PartyPopper,
		TrendingUp
	} from '@lucide/svelte';

	const PRESET: Omit<EngineInput, 'currency'> = {
		businessName: '',
		category: 'restaurant',
		city: 'Lagos',
		haveWebsite: false,
		websiteResponsive: false,
		haveGoogleBusinessProfile: false,
		gbpVerified: false,
		gbpReviews: 0,
		gbpRating: 0,
		runPaidAds: false,
		socialOnly: true,
		avgCustomerValue: 5000
	};

	let currency = $state<Currency>('NGN');
	let businessName = $state('');
	let category = $state(PRESET.category);
	let city = $state(PRESET.city);
	let haveWebsite = $state(PRESET.haveWebsite);
	let websiteResponsive = $state(PRESET.websiteResponsive);
	let haveGoogleBusinessProfile = $state(PRESET.haveGoogleBusinessProfile);
	let gbpVerified = $state(PRESET.gbpVerified);
	let gbpReviews = $state(PRESET.gbpReviews);
	let gbpRating = $state(PRESET.gbpRating);
	let runPaidAds = $state(PRESET.runPaidAds);
	let socialOnly = $state(PRESET.socialOnly);
	let avgCustomerValue = $state(PRESET.avgCustomerValue);

	let email = $state('');
	let company = $state('');
	let isSubmitting = $state(false);
	let unlocked = $state(false);
	let error = $state<string | null>(null);

	const input = $derived<EngineInput>({
		businessName,
		category,
		city,
		haveWebsite,
		websiteResponsive,
		haveGoogleBusinessProfile,
		gbpVerified,
		gbpReviews,
		gbpRating,
		runPaidAds,
		socialOnly,
		avgCustomerValue,
		currency
	});

	const result = $derived(computeLocalVisibility(input));
	const money = (n: number) => formatMoney(n, currency);
	const critical = $derived(result.severity === 'critical' || result.severity === 'high');

	function getReport() {
		const payload = reportFromLocalVisibility(result, currency, businessName);
		goto(buildShareUrl(payload));
	}

	function switchCurrency(next: Currency) {
		if (next === currency) return;
		currency = next;
		if (next === 'USD') {
			avgCustomerValue = 30;
		} else {
			avgCustomerValue = PRESET.avgCustomerValue;
		}
	}

	function validEmail(v: string) {
		return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v);
	}

	function summaryText() {
		return [
			`Business: ${businessName || '(not named)'} — ${category} in ${city}`,
			`Local visibility score: ${result.score}/100 (${result.findability})`,
			`Est. local searches / month: ${result.estMonthlySearches.toLocaleString()}`,
			`Est. customers lost / month: ${result.estMissed.toLocaleString()}`,
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
			// Always unlock — a delivery failure must never block the prospect.
			unlocked = true;
			try {
				localStorage.setItem('rydertech_visibility_email', email);
			} catch {}

			const serviceId = env.PUBLIC_EMAILJS_SERVICE_ID;
			const templateId = env.PUBLIC_EMAILJS_TEMPLATE_ID;
			const publicKey = env.PUBLIC_EMAILJS_PUBLIC_KEY;

			if (serviceId && templateId && publicKey) {
				await emailjs.send(
					serviceId,
					templateId,
					{
						from_name: company || businessName || 'Local Visibility Audit lead',
						from_email: email,
						company: company || businessName,
						budget: money(result.revenueAtRisk),
						timeline: `${result.score}/100 visibility`,
						message: `New Local Visibility Audit result (source: /labs/visibility).\n\n${summaryText()}`,
						lead_type: 'lead_magnet_visibility'
					},
					{ publicKey }
				);
			} else {
				console.warn('EmailJS not configured — visibility lead not emailed:', email);
			}

			try {
				await supabase
					.from('newsletter_subscriptions')
					.insert([
						{ email, source: 'lead_magnet_visibility', subscribed_at: new Date().toISOString() }
					])
					.select();
			} catch {
				console.info('Visibility lead backup skipped (DB unavailable):', email);
			}
		} catch (err) {
			console.warn('Visibility lead email failed:', err);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<SEOMeta
	data={{
		title: 'Local Visibility Audit — Is Your Business Findable on Google? | RyderTech',
		description:
			'Score how findable your business is on Google Maps and local search. Free 60-second audit shows the customers and revenue you lose to poor local visibility — no signup required.',
		canonical: 'https://rydertech.ng/labs/visibility'
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
			<Badge variant="secondary" class="mb-3">Local SEO Diagnostic</Badge>
			<h1 class="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
				Can customers in {city} actually find you on Google?
			</h1>
			<p class="mt-4 text-lg text-muted-foreground">
				~46% of all Google searches have local intent. Most Nigerian businesses are invisible to
				the ones that matter. Enter your real setup and see your visibility score, the customers
				you lose every month, and what it's worth in revenue.
			</p>
		</header>

		<div class="grid gap-8 lg:grid-cols-[1fr_400px]">
			<!-- INPUTS -->
			<section class="space-y-6">
				<Card>
					<CardHeader class="pb-4">
						<div class="flex items-center justify-between">
							<CardTitle class="flex items-center gap-2 text-base">
								<Globe class="h-4 w-4 text-primary" />
								Your business
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
						<label class="block sm:col-span-2">
							<span class="mb-1.5 block text-xs text-muted-foreground">Business name</span>
							<Input type="text" bind:value={businessName} placeholder="e.g. Mama Nkechi Kitchen" />
						</label>
						<label class="block">
							<span class="mb-1.5 block text-xs text-muted-foreground">Category</span>
							<select
								bind:value={category}
								class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
							>
								<option value="restaurant">Restaurant / food</option>
								<option value="salon_barber">Salon / barber</option>
								<option value="hotel">Hotel / hospitality</option>
								<option value="real_estate">Real estate</option>
								<option value="law_firm">Law firm</option>
								<option value="clinic_hospital">Clinic / hospital</option>
								<option value="retail_shop">Retail shop</option>
								<option value="event_planner">Event planner</option>
								<option value="gym_fitness">Gym / fitness</option>
								<option value="school">School</option>
								<option value="auto_mechanic">Auto mechanic</option>
								<option value="tech_services">Tech services</option>
								<option value="other">Other</option>
							</select>
						</label>
						<label class="block">
							<span class="mb-1.5 block text-xs text-muted-foreground">City</span>
							<select
								bind:value={city}
								class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
							>
								<option value="Lagos">Lagos</option>
								<option value="Abuja">Abuja</option>
								<option value="Port Harcourt">Port Harcourt</option>
								<option value="Ibadan">Ibadan</option>
								<option value="Kano">Kano</option>
								<option value="other">Other</option>
							</select>
						</label>
						<label class="block">
							<span class="mb-1.5 block text-xs text-muted-foreground">Avg value of one customer</span>
							<Input type="number" min="0" bind:value={avgCustomerValue} />
						</label>
					</CardContent>
				</Card>

				<Card>
					<CardHeader class="pb-4">
						<CardTitle class="flex items-center gap-2 text-base">
							<Globe class="h-4 w-4 text-primary" />
							Website
						</CardTitle>
						<CardDescription>Do you own a working, searchable website?</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="flex flex-col gap-3">
							<label class="flex items-center gap-2 text-sm text-muted-foreground">
								<input type="checkbox" bind:checked={haveWebsite} class="h-4 w-4 accent-primary" />
								We have a website
							</label>
							<label class="flex items-center gap-2 text-sm text-muted-foreground {haveWebsite ? '' : 'opacity-40'}">
								<input
									type="checkbox"
									bind:checked={websiteResponsive}
									disabled={!haveWebsite}
									class="h-4 w-4 accent-primary"
								/>
								It works well on phones (mobile-ready)
							</label>
							<label class="flex items-center gap-2 text-sm text-muted-foreground">
								<input type="checkbox" bind:checked={socialOnly} class="h-4 w-4 accent-primary" />
								We rely mostly on Instagram / Facebook, no real website
							</label>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader class="pb-4">
						<CardTitle class="flex items-center gap-2 text-base">
							<MapPin class="h-4 w-4 text-primary" />
							Google Business Profile
						</CardTitle>
						<CardDescription>This is what puts you on Google Maps and "near me" searches.</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="flex flex-col gap-3">
							<label class="flex items-center gap-2 text-sm text-muted-foreground">
								<input type="checkbox" bind:checked={haveGoogleBusinessProfile} class="h-4 w-4 accent-primary" />
								We have a Google Business Profile
							</label>
							<label
								class="flex items-center gap-2 text-sm text-muted-foreground {haveGoogleBusinessProfile
									? ''
									: 'opacity-40'}"
							>
								<input
									type="checkbox"
									bind:checked={gbpVerified}
									disabled={!haveGoogleBusinessProfile}
									class="h-4 w-4 accent-primary"
								/>
								It's verified (we own the listing)
							</label>
						</div>
						<div class="grid gap-4 sm:grid-cols-2 {gbpVerified ? '' : 'opacity-40'}">
							<label class="block">
								<span class="mb-1.5 block text-xs text-muted-foreground">Google reviews</span>
								<Input type="number" min="0" bind:value={gbpReviews} disabled={!gbpVerified} />
							</label>
							<label class="block">
								<span class="mb-1.5 block text-xs text-muted-foreground">Average rating (1-5)</span>
								<Input
									type="number"
									min="0"
									max="5"
									step="0.1"
									bind:value={gbpRating}
									disabled={!gbpVerified}
								/>
							</label>
						</div>
						<label class="flex items-center gap-2 text-sm text-muted-foreground">
							<input type="checkbox" bind:checked={runPaidAds} class="h-4 w-4 accent-primary" />
							We run paid Google / Facebook ads to fill the gap
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
							Your local visibility score
						</CardDescription>
						<div class="flex items-end gap-2">
							<p class="text-5xl font-bold {critical ? 'text-destructive' : 'text-foreground'}">
								{result.score}
							</p>
							<span class="mb-1 text-lg text-muted-foreground">/100</span>
						</div>
						<p class="text-sm text-muted-foreground">
							Findability: <span class="font-medium text-primary">{result.findability}</span>
						</p>
					</CardHeader>
					<CardContent>
						<dl class="space-y-3 border-t pt-4 text-sm">
							<div class="flex justify-between">
								<dt class="text-muted-foreground">Est. local searches / mo</dt>
								<dd class="font-medium">{result.estMonthlySearches.toLocaleString()}</dd>
							</div>
							<div class="flex justify-between">
								<dt class="text-muted-foreground">Customers lost / mo</dt>
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
							<h3 class="text-lg font-semibold">Get your fix plan</h3>
							<p class="mt-1.5 text-sm text-muted-foreground">
								We'll send the scoped fix for your exact visibility profile — the website, the
								Google Business Profile setup, and the local SEO that brings customers in.
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
								Your visibility upgrades
							</h3>
							<ul class="mt-4 space-y-3">
								{#each result.enhancements as item}
									<li class="flex gap-2.5 text-sm text-muted-foreground">
										<span class="mt-0.5 text-primary">▸</span>
										<span>{item}</span>
									</li>
								{/each}
							</ul>
							<Button href="/contact?tool=visibility" class="mt-5 w-full">Book a scoping call</Button>
							<Button variant="outline" class="mt-2 w-full gap-2" onclick={getReport}>
								<TrendingUp class="h-4 w-4" /> Get shareable audit report
							</Button>
							<a
								href="/services/web-design-in-nigeria"
								class="mt-2 block text-center text-sm text-muted-foreground hover:text-foreground"
								>Or see our local SEO work →</a
							>
						{/if}
					</CardContent>
				</Card>
			</aside>
		</div>
	</div>
</div>
