<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import SEOMeta from '$lib/components/SEOMeta.svelte';
	import { supabase } from '$lib/supabaseClient';
	import { env } from '$env/dynamic/public';
	import emailjs from '@emailjs/browser';
	import { generateInviteQR } from '$lib/qrGenerator';
	import { formatMoney } from '$lib/opsDrain';
	import {
		computeEventRisk,
		type EngineInput,
		type CheckInMethod
	} from '$lib/eventAccessRisk';
	import { reportFromEventRisk, buildShareUrl } from '$lib/shareReport';
	import { goto } from '$app/navigation';
	import {
		ScanLine,
		Clock,
		ShieldAlert,
		Users,
		ArrowLeft,
		CheckCircle2,
		AlertTriangle,
		Calculator,
		QrCode,
		PartyPopper
	} from '@lucide/svelte';

	const PRESET: Omit<EngineInput, 'currency'> = {
		guestCount: 500,
		gateCount: 3,
		peakArrivalMinutes: 60,
		eventDurationHours: 6,
		method: 'manual',
		accessListUsed: false,
		onsitePrinting: true,
		staffWage: 3000,
		avgTicketValue: 15000
	};

	let currency = $state<'NGN' | 'USD'>('NGN');
	let guestCount = $state(PRESET.guestCount);
	let gateCount = $state(PRESET.gateCount);
	let peakArrivalMinutes = $state(PRESET.peakArrivalMinutes);
	let eventDurationHours = $state(PRESET.eventDurationHours);
	let method = $state<CheckInMethod>(PRESET.method);
	let accessListUsed = $state(PRESET.accessListUsed);
	let onsitePrinting = $state(PRESET.onsitePrinting);
	let staffWage = $state(PRESET.staffWage);
	let avgTicketValue = $state(PRESET.avgTicketValue);

	let email = $state('');
	let company = $state('');
	let isSubmitting = $state(false);
	let unlocked = $state(false);
	let error = $state<string | null>(null);

	// Live QR demo state
	let qrDataUrl = $state('');
	let qrGenerating = $state(false);

	const input = $derived<EngineInput>({
		guestCount,
		gateCount,
		peakArrivalMinutes,
		eventDurationHours,
		method,
		accessListUsed,
		onsitePrinting,
		staffWage,
		avgTicketValue,
		currency
	});

	const result = $derived(computeEventRisk(input));
	const money = (n: number) => formatMoney(n, currency);
	const critical = $derived(result.severity === 'critical' || result.severity === 'high');

	function getReport() {
		const payload = reportFromEventRisk(result, currency);
		goto(buildShareUrl(payload));
	}

	function switchCurrency(next: 'NGN' | 'USD') {
		if (next === currency) return;
		currency = next;
		if (next === 'USD') {
			staffWage = 20;
			avgTicketValue = 120;
		} else {
			staffWage = PRESET.staffWage;
			avgTicketValue = PRESET.avgTicketValue;
		}
	}

	function validEmail(v: string) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
	}

	function summaryText() {
		return [
			`Guests: ${guestCount} across ${gateCount} gate(s)`,
			`Current method: ${method}`,
			`Gate clear time: ${result.gateTimeMin} min (QR: ${result.gateTimeMinQr} min, saves ${result.gateTimeSavedMin} min)`,
			`Gatecrash exposure: ${result.gatecrashPct}% → ${result.exposedGuests} guests`,
			`Revenue at risk: ${money(result.revenueAtRisk)}`,
			`Staffing cost (current): ${money(result.staffCostCurrent)}`,
			`Staffing cost (QR): ${money(result.staffCostQr)}`,
			`Staffing saving: ${money(result.staffingDelta)}`,
			`Severity: ${result.severity}`,
			'',
			'Recommended Veripasshub upgrades:',
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
				localStorage.setItem('rydertech_event_risk_email', email);
			} catch {}

			const serviceId = env.PUBLIC_EMAILJS_SERVICE_ID;
			const templateId = env.PUBLIC_EMAILJS_TEMPLATE_ID;
			const publicKey = env.PUBLIC_EMAILJS_PUBLIC_KEY;

			if (serviceId && templateId && publicKey) {
				await emailjs.send(
					serviceId,
					templateId,
					{
						from_name: company || 'Event Access Risk Scanner lead',
						from_email: email,
						company,
						budget: money(result.staffingDelta),
						timeline: `${result.gateTimeSavedMin} min faster gate`,
						message: `New Event Access Risk Scanner result (source: /labs/event-access-risk).\n\n${summaryText()}`,
						lead_type: 'lead_magnet_event_risk'
					},
					{ publicKey }
				);
			} else {
				console.warn('EmailJS not configured — event-risk lead not emailed:', email);
			}

			try {
				await supabase
					.from('newsletter_subscriptions')
					.insert([
						{ email, source: 'lead_magnet_event_risk', subscribed_at: new Date().toISOString() }
					])
					.select();
			} catch {
				console.info('Event risk lead backup skipped (DB unavailable):', email);
			}
		} catch (err) {
			console.warn('Event risk lead email failed:', err);
		} finally {
			isSubmitting = false;
		}
	}

	async function generateDemoQR() {
		qrGenerating = true;
		const payload = JSON.stringify({
			event: 'Veripasshub Live Demo',
			guest: 'Prospect',
			tier: 'VIP',
			iat: Date.now(),
			nonce: crypto.randomUUID()
		});
		qrDataUrl = await generateInviteQR(payload);
		qrGenerating = false;
	}
</script>

<SEOMeta
	data={{
		title: 'Event Access Risk Scanner — Gate Bottleneck & Gatecrash Exposure | RyderTech',
		description:
			'Calculate how long your event gate will back up, how many guests slip in free, and what it costs. Free diagnostic from the Veripasshub team — no signup to scan.',
		canonical: 'https://rydertech.ng/labs/event-access-risk'
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
			<Badge variant="secondary" class="mb-3">Event Access Diagnostic</Badge>
			<h1 class="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
				Your gate has a risk profile.
			</h1>
			<p class="mt-4 text-lg text-muted-foreground">
				Most event teams never calculate it. Enter your real numbers and see how long your gate
				backs up, how many guests slip in free, and what it costs you — then watch a live
				Veripasshub invite QR in action.
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
								Your event
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
							<span class="mb-1.5 block text-xs text-muted-foreground">Expected guests</span>
							<Input type="number" min="0" bind:value={guestCount} />
						</label>
						<label class="block">
							<span class="mb-1.5 block text-xs text-muted-foreground">Entry points / gates</span>
							<Input type="number" min="1" bind:value={gateCount} />
						</label>
						<label class="block">
							<span class="mb-1.5 block text-xs text-muted-foreground">Peak arrival window (min)</span>
							<Input type="number" min="1" bind:value={peakArrivalMinutes} />
						</label>
						<label class="block">
							<span class="mb-1.5 block text-xs text-muted-foreground">Event duration (hours)</span>
							<Input type="number" min="0.5" step="0.5" bind:value={eventDurationHours} />
						</label>
						<label class="block">
							<span class="mb-1.5 block text-xs text-muted-foreground">Staff wage / hour</span>
							<Input type="number" min="0" bind:value={staffWage} />
						</label>
						<label class="block">
							<span class="mb-1.5 block text-xs text-muted-foreground">Avg ticket / guest value</span>
							<Input type="number" min="0" bind:value={avgTicketValue} />
						</label>
					</CardContent>
				</Card>

				<Card>
					<CardHeader class="pb-4">
						<CardTitle class="flex items-center gap-2 text-base">
							<ScanLine class="h-4 w-4 text-primary" />
							Current check-in method
						</CardTitle>
						<CardDescription>What you do at the gate today.</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="grid grid-cols-3 gap-2">
							{#each ['manual', 'spreadsheet', 'qr'] as m}
								<button
									type="button"
									onclick={() => (method = m as CheckInMethod)}
									class="rounded-lg border px-3 py-3 text-sm font-medium capitalize transition {method === m
										? 'border-primary bg-primary/5 text-foreground'
										: 'text-muted-foreground hover:text-foreground'}"
								>
									{m}
								</button>
							{/each}
						</div>
						<div class="flex flex-col gap-3 pt-1">
							<label class="flex items-center gap-2 text-sm text-muted-foreground">
								<input type="checkbox" bind:checked={accessListUsed} class="h-4 w-4 accent-primary" />
								We cross-check a pre-event access list at the gate
							</label>
							<label class="flex items-center gap-2 text-sm text-muted-foreground">
								<input type="checkbox" bind:checked={onsitePrinting} class="h-4 w-4 accent-primary" />
								Guests get printed lists / paper invites that can be shared
							</label>
						</div>
					</CardContent>
				</Card>

				<!-- LIVE QR DEMO -->
				<Card>
					<CardHeader class="pb-4">
						<CardTitle class="flex items-center gap-2 text-base">
							<QrCode class="h-4 w-4 text-primary" />
							See the Veripasshub fix, live
						</CardTitle>
						<CardDescription>
							This is exactly how a Veripasshub invite scans — signed, single-use, sub-second at the gate.
						</CardDescription>
					</CardHeader>
					<CardContent class="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
						<div class="flex h-40 w-40 shrink-0 items-center justify-center rounded-lg border bg-white">
							{#if qrDataUrl}
								<img src={qrDataUrl} alt="Sample Veripasshub invite QR" class="h-36 w-36" />
							{:else}
								<QrCode class="h-10 w-10 text-muted-foreground/40" />
							{/if}
						</div>
						<div class="space-y-3">
							<Button onclick={generateDemoQR} disabled={qrGenerating} variant="outline">
								{qrGenerating ? 'Generating…' : 'Generate a sample invite QR'}
							</Button>
							<p class="text-xs text-muted-foreground">
								Point your phone camera at it — it decodes a signed invite payload. No app, no list-scanning.
							</p>
						</div>
					</CardContent>
				</Card>
			</section>

			<!-- RESULTS -->
			<aside class="space-y-6 lg:sticky lg:top-8 lg:self-start">
				<Card>
					<CardHeader class="pb-3">
						<CardDescription class="flex items-center gap-1.5">
							<Clock class="h-3.5 w-3.5" />
							Time to clear your gate
						</CardDescription>
						<p class="text-4xl font-bold {critical ? 'text-destructive' : 'text-foreground'}">
							{result.gateTimeMin} min
						</p>
						<p class="text-sm text-muted-foreground">
							Under QR verification this drops to <span class="font-medium text-primary">{result.gateTimeMinQr} min</span>
							— {result.gateTimeSavedMin} min saved.
						</p>
					</CardHeader>
					<CardContent>
						<dl class="space-y-3 border-t pt-4 text-sm">
							<div class="flex justify-between">
								<dt class="text-muted-foreground">Gatecrash exposure</dt>
								<dd class="font-medium text-destructive">{result.gatecrashPct}%</dd>
							</div>
							<div class="flex justify-between">
								<dt class="text-muted-foreground">Guests slipping in free</dt>
								<dd class="font-medium">{result.exposedGuests.toLocaleString()}</dd>
							</div>
							<div class="flex justify-between">
								<dt class="text-muted-foreground">Revenue at risk</dt>
								<dd class="font-medium text-destructive">{money(result.revenueAtRisk)}</dd>
							</div>
							<div class="flex justify-between">
								<dt class="text-muted-foreground">Staffing cost (current)</dt>
								<dd class="font-medium">{money(result.staffCostCurrent)}</dd>
							</div>
							<div class="flex justify-between">
								<dt class="text-muted-foreground">Staffing cost (QR)</dt>
								<dd class="font-medium text-primary">{money(result.staffCostQr)}</dd>
							</div>
							<div class="flex justify-between">
								<dt class="text-muted-foreground">Staffing saving</dt>
								<dd class="font-medium text-primary">{money(result.staffingDelta)}</dd>
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
							<h3 class="text-lg font-semibold">Get the Veripasshub upgrade plan</h3>
							<p class="mt-1.5 text-sm text-muted-foreground">
								We'll send the scoped fix for your exact risk profile — the QR system, the gate
								dashboard, and what each phase costs.
							</p>
							<form onsubmit={handleSubmit} class="mt-4 space-y-3">
								<Input type="text" bind:value={company} placeholder="Company / event name" />
								<Input type="email" bind:value={email} placeholder="you@company.com" required />
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
								Your Veripasshub upgrades
							</h3>
							<ul class="mt-4 space-y-3">
								{#each result.enhancements as item}
									<li class="flex gap-2.5 text-sm text-muted-foreground">
										<span class="mt-0.5 text-primary">▸</span>
										<span>{item}</span>
									</li>
								{/each}
							</ul>
							<Button href="/contact" class="mt-5 w-full">Book a scoping call</Button>
							<Button variant="outline" class="mt-2 w-full gap-2" onclick={getReport}>
								<ScanLine class="h-4 w-4" /> Get shareable audit report
							</Button>
							<a href="/services/ai" class="mt-2 block text-center text-sm text-muted-foreground hover:text-foreground">Or see our custom-portal work →</a>
						{/if}
					</CardContent>
				</Card>
			</aside>
		</div>
	</div>
</div>
