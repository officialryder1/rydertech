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
		Shield,
		ShieldCheck,
		ShieldX,
		Info,
		AlertTriangle,
		CheckCircle,
		X,
		ArrowLeft,
		ArrowRight,
		Download,
		Share2,
		Calendar,
		DollarSign
	} from '@lucide/svelte';
	import {
		computeQDayRisk,
		type QDayInput,
		type QDayResult,
		type RiskLevel
	} from '$lib/qDayReadiness';
	import { reportFromQDay, buildShareUrl } from '$lib/shareReport';
	import { scoreLead } from '$lib/leadScore';

	// Defaults model a mid-size firm with notable quantum exposure
	const DEFAULTS: QDayInput = {
		handlesSensitiveData: true,
		sensitiveRecordCount: 50000,
		retentionYears: 7,
		cryptoInventoryDone: false,
		legacyCryptoPct: 85,
		activePki: true,
		endpointPatchablePct: 60,
		hasPQCPlan: false,
		annualRevenueUSD: 2_500_000
	};

	let form = $state<QDayInput>({ ...DEFAULTS });
	let result = $state<QDayResult | null>(null);
	let email = $state('');
	let isSubmitting = $state(false);
	let unlocked = $state(false);
	let showShare = $state(false);
	let error = $state<string | null>(null);

	const riskConfig: Record<RiskLevel, { label: string; color: string; icon: any }> = {
		low: { label: 'Low Risk — Watchful Waiting', color: 'text-green-600', icon: ShieldCheck },
		moderate: { label: 'Moderate Risk — Plan Now', color: 'text-amber-600', icon: Info },
		high: { label: 'High Risk — Act Within 12 Months', color: 'text-orange-600', icon: AlertTriangle },
		critical: { label: 'Critical Risk — Act Within 90 Days', color: 'text-red-600', icon: ShieldX }
	};

	function validate(): string | null {
		if (form.sensitiveRecordCount < 0) return 'Sensitive record count must be positive.';
		if (form.retentionYears < 0 || form.retentionYears > 50) return 'Retention years must be between 0 and 50.';
		if (form.legacyCryptoPct < 0 || form.legacyCryptoPct > 100) return 'Legacy crypto percentage must be between 0 and 100.';
		if (form.endpointPatchablePct < 0 || form.endpointPatchablePct > 100) return 'Endpoint patchable percentage must be between 0 and 100.';
		if (form.annualRevenueUSD < 0) return 'Annual revenue must be positive.';
		return null;
	}

	function handleCalculate() {
		const err = validate();
		if (err) {
			error = err;
			return;
		}
		error = null;
		result = computeQDayRisk(form);
	}

	async function handleEmailCapture(e: Event) {
		e.preventDefault();
		error = null;
		if (!email || !email.includes('@')) {
			error = 'Please enter a valid email address.';
			return;
		}
		isSubmitting = true;
		try {
			// Always unlock — the user gets the report regardless.
			unlocked = true;
			localStorage.setItem('ryday_qday_email', email);

			// Primary: EmailJS (confirmed working by owner)
			const serviceId = env.PUBLIC_EMAILJS_SERVICE_ID;
			const templateId = env.PUBLIC_EMAILJS_TEMPLATE_ID;
			const publicKey = env.PUBLIC_EMAILJS_PUBLIC_KEY;

			if (serviceId && templateId && publicKey) {
				await emailjs.send(
					serviceId,
					templateId,
					{
						from_name: 'Q-Day Readiness Score',
						from_email: email,
						company: '',
						budget: '',
						timeline: '',
						message: 'New lead from Q-Day Readiness calculator.',
						lead_type: 'qday_readiness'
					},
					{ publicKey }
				);
			} else {
				console.warn('EmailJS not configured — lead not emailed:', email);
			}

			// Best-effort backup in Supabase (non-blocking if DB is off)
			try {
				const { error: dbErr } = await supabase
					.from('newsletter_subscriptions')
					.insert([{ email, source: 'qday_readiness', subscribed_at: new Date().toISOString() }])
					.select();
				if (dbErr) throw dbErr;
			} catch (dbErr) {
				console.info('Lead backup skipped (DB unavailable):', email);
			}

			// Shareable report
			if (result) {
				const reportUrl = buildShareUrl(reportFromQDay(result, email));
				await navigator.clipboard.writeText(reportUrl);
				showShare = true;
			}
		} catch (err) {
			console.warn('Lead email failed:', err);
			// User is already unlocked — report still shows
		} finally {
			isSubmitting = false;
		}
	}

	function reset() {
		form = { ...DEFAULTS };
		result = null;
		email = '';
		unlocked = false;
		showShare = false;
		error = null;
	}
</script>

<SEOMeta
	data={{
		title: 'Q-Day Readiness Score — Quantum Crypto Risk Assessment | RyderTech',
		description: 'Is your data at risk from the quantum threat? Take the Q-Day Readiness Score: assess your post-quantum cryptography exposure, estimate revenue at risk, and get a migration action plan.',
		canonical: 'https://rydertech.ng/labs/q-day-readiness',
		image: 'https://rydertech.ng/icons/og-image.png'
	}}
/>

<div class="min-h-screen bg-gray-50 py-12">
	<div class="container mx-auto max-w-4xl px-4">
		<!-- Header -->
		<div class="text-center mb-12">
			<div class="inline-flex items-center space-x-2 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-full px-4 py-2 text-sm text-[var(--primary)] font-semibold mb-4">
				<Shield class="w-4 h-4" />
				<span>RyderTech Labs</span>
			</div>
			<h1 class="text-4xl md:text-5xl font-black text-gray-900 mb-4">
				Q-Day Readiness Score
			</h1>
			<p class="text-xl text-gray-600 max-w-2xl mx-auto">
				Assess your organisation's vulnerability to the quantum-computing threat. In 60 seconds, get a risk score, estimated revenue at risk, and a migration action plan.
			</p>
		</div>

		{#if !result}
			<!-- Input Form -->
			<Card class="border-2 border-gray-100 shadow-sm mb-8">
				<CardHeader>
					<CardTitle>Quantum Exposure Assessment</CardTitle>
					<CardDescription>
						Enter details about your cryptographic posture and data assets.
					</CardDescription>
				</CardHeader>
				<CardContent class="space-y-6">
					{#if error}
						<div class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
							{error}
						</div>
					{/if}

					<div class="space-y-2">
						<label class="block text-sm font-medium text-gray-700">
							Does your organisation handle sensitive data (PII, payment data, intellectual property)?
						</label>
						<div class="flex gap-4">
							<label class="flex items-center gap-2">
								<input type="radio" name="handlesSensitiveData" bind:group={form.handlesSensitiveData} value={true} class="text-[var(--primary)] focus:ring-[var(--primary)]" />
								Yes
							</label>
							<label class="flex items-center gap-2">
								<input type="radio" name="handlesSensitiveData" bind:group={form.handlesSensitiveData} value={false} class="text-[var(--primary)] focus:ring-[var(--primary)]" />
								No
							</label>
						</div>
					</div>

					<div class="grid md:grid-cols-2 gap-6">
						<div class="space-y-2">
							<label class="block text-sm font-medium text-gray-700">
								Sensitive record count (customers, users, transactions)
							</label>
							<Input
								type="number"
								min="0"
								bind:value={form.sensitiveRecordCount}
								class="w-full"
							/>
						</div>

						<div class="space-y-2">
							<label class="block text-sm font-medium text-gray-700">
								Data retention period (years)
							</label>
							<Input
								type="number"
								min="0"
								max="50"
								bind:value={form.retentionYears}
								class="w-full"
							/>
						</div>
					</div>

					<div class="space-y-2">
						<label class="block text-sm font-medium text-gray-700">
							Legacy cryptography prevalence
							<span class="text-gray-500">(RSA-2048, ECC p-256, etc.)</span>
						</label>
						<div class="flex items-center gap-4">
							<Input
								type="range"
								min="0"
								max="100"
								step="5"
								bind:value={form.legacyCryptoPct}
								class="w-full"
								on:input={(e) => form.legacyCryptoPct = Number((e.target as HTMLInputElement).value)}
							/>
							<span class="w-16 text-right font-medium text-gray-900">{form.legacyCryptoPct}%</span>
						</div>
					</div>

					<div class="space-y-2">
						<label class="flex items-center gap-2 text-sm font-medium text-gray-700">
							<input
								type="checkbox"
								checked={form.cryptoInventoryDone}
								on:change={(e) => form.cryptoInventoryDone = (e.target as HTMLInputElement).checked}
								class="rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
							/>
							Cryptographic asset inventory is maintained
						</label>
					</div>

					<div class="space-y-2">
						<label class="flex items-center gap-2 text-sm font-medium text-gray-700">
							<input
								type="checkbox"
								checked={form.activePki}
								on:change={(e) => form.activePki = (e.target as HTMLInputElement).checked}
								class="rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
							/>
							Active PKI & certificate lifecycle management
						</label>
					</div>

					<div class="space-y-2">
						<label class="block text-sm font-medium text-gray-700">
							Endpoint patchability
							<span class="text-gray-500">(automated patch capability)</span>
						</label>
						<div class="flex items-center gap-4">
							<Input
								type="range"
								min="0"
								max="100"
								step="5"
								bind:value={form.endpointPatchablePct}
								class="w-full"
								on:input={(e) => form.endpointPatchablePct = Number((e.target as HTMLInputElement).value)}
							/>
							<span class="w-16 text-right font-medium text-gray-900">{form.endpointPatchablePct}%</span>
						</div>
					</div>

					<div class="space-y-2">
						<label class="flex items-center gap-2 text-sm font-medium text-gray-700">
							<input
								type="checkbox"
								checked={form.hasPQCPlan}
								on:change={(e) => form.hasPQCPlan = (e.target as HTMLInputElement).checked}
								class="rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
							/>
							Formal post-quantum migration plan exists
						</label>
					</div>

					<div class="space-y-2">
						<label class="block text-sm font-medium text-gray-700">
							Annual revenue (USD)
						</label>
						<Input
							type="number"
							min="0"
							step="1000"
							bind:value={form.annualRevenueUSD}
							class="w-full"
							placeholder="e.g. 2500000"
						/>
					</div>

					<Button
						class="w-full bg-linear-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-semibold py-3"
						onclick={handleCalculate}
						disabled={isSubmitting}
					>
						Calculate My Q-Day Risk Score
					</Button>
				</CardContent>
			</Card>

			<!-- Blog cross-link -->
			<div class="text-center">
				<p class="text-sm text-gray-500 mb-2">
					Want to read more about quantum threats?
				</p>
				<a
					href="/blog/q-day-post-quantum-cryptography-2026"
					class="inline-flex items-center text-[var(--primary)] font-medium hover:underline"
				>
					Read: Q-Day Is Coming — Why Post-Quantum Cryptography Defines 2026
					<ArrowRight class="w-4 h-4 ml-1" />
				</a>
			</div>
		{:else}
			<!-- Results -->
			<div class="space-y-8">
				<Card class="border-2 border-gray-100 shadow-sm">
					<CardHeader>
						<div class="flex items-center justify-between">
							<CardTitle>Your Q-Day Readiness Score</CardTitle>
							<Button variant="outline" size="sm" onclick={reset}>
								<X class="w-4 h-4" />
							</Button>
						</div>
					</CardHeader>
					<CardContent class="space-y-6">
						<!-- Score Display -->
						<div class="text-center py-8">
							<div
								class={`inline-flex items-center justify-center w-32 h-32 rounded-full text-5xl font-black mb-4 ${
									result.riskLevel === 'critical' ? 'bg-red-50 text-red-600'
									: result.riskLevel === 'high' ? 'bg-orange-50 text-orange-600'
										: result.riskLevel === 'moderate' ? 'bg-amber-50 text-amber-600'
											: 'bg-green-50 text-green-600'
								}`}
							>
								{result.score}
							</div>
							<h3 class="text-2xl font-black text-gray-900 mb-2">
								{riskConfig[result.riskLevel].label}
							</h3>
							<p class="text-gray-600 max-w-lg mx-auto">
								Quantum computers capable of breaking current cryptography are projected to arrive
								<strong> within {result.timeUntilExposed}</strong>.
								Your vulnerability window ends around <strong>{result.quantumTimeline}</strong>.
							</p>
						</div>

						<!-- Revenue at Risk -->
						{#if result.revenueAtRiskUSD > 0}
							<div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
								<DollarSign class="w-6 h-6 text-red-600 mx-auto mb-2" />
								<div class="text-3xl font-black text-red-600 mb-1">
									${result.revenueAtRiskUSD.toLocaleString()}
								</div>
								<div class="text-sm text-red-800 font-medium">
									Estimated revenue at risk from a single post-quantum data breach
								</div>
							</div>
						{/if}

						<!-- Risk Factors -->
						<div class="space-y-4">
							<h4 class="text-lg font-semibold text-gray-900">Risk Breakdown</h4>
							{#each result.factors as factor}
								<div class="border border-gray-200 rounded-lg p-4">
									<div class="flex items-start justify-between mb-2">
										<h5 class="font-medium text-gray-900">{factor.label}</h5>
										<Badge
											class={factor.impact === 'critical' ? 'bg-red-100 text-red-800'
												: factor.impact === 'high' ? 'bg-orange-100 text-orange-800'
													: factor.impact === 'moderate' ? 'bg-amber-100 text-amber-800'
														: 'bg-green-100 text-green-800'}
										>
											{factor.impact}
										</Badge>
									</div>
									<p class="text-sm text-gray-600">{factor.description}</p>
									<div class="w-full bg-gray-200 rounded-full h-2 mt-2">
										<div
											class="h-2 rounded-full"
											style="width: {(factor.points / factor.maxPoints * 100)}%"
										></div>
									</div>
								</div>
							{/each}
						</div>

						<!-- Recommendations -->
						<div class="space-y-4">
							<h4 class="text-lg font-semibold text-gray-900">Action Plan</h4>
							{#each result.recommendations as rec}
								<div class="border-l-4 border-[var(--primary)] bg-gray-50 rounded-lg p-4">
									<div class="flex items-start gap-3">
										<AlertTriangle class="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-0.5" />
										<div>
											<div class="flex items-center gap-2 mb-1">
												<span class={`text-xs font-semibold uppercase ${
													rec.priority === 'critical' ? 'text-red-600'
													: rec.priority === 'high' ? 'text-orange-600'
														: rec.priority === 'medium' ? 'text-amber-600'
															: 'text-blue-600'
												}`}>{rec.priority}</span>
												<h5 class="font-medium text-gray-900">{rec.title}</h5>
											</div>
											<p class="text-sm text-gray-600 mb-1">{rec.description}</p>
											<p class="text-xs text-gray-500">Effort: {rec.estimatedEffort}</p>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</CardContent>
				</Card>

				<!-- Email Capture for Shareable Report -->
				<Card class="border-2 border-gray-100 shadow-sm">
					<CardHeader>
						<CardTitle>Get Your Shareable Audit Report</CardTitle>
						<CardDescription>
							Enter your email to receive a branded PDF-style report you can share with your security team or save for compliance records.
						</CardDescription>
					</CardHeader>
					<CardContent>
						{#if !unlocked}
							<form on:submit={handleEmailCapture} class="space-y-4">
								{#if error}
									<div class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
										{error}
									</div>
								{/if}
								<div class="space-y-2">
									<Input
										type="email"
										placeholder="you@company.com"
										bind:value={email}
										required
										class="w-full"
									/>
								</div>
								<Button
									type="submit"
									class="w-full bg-linear-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-semibold"
									disabled={isSubmitting}
								>
									{isSubmitting ? 'Processing...' : 'Get Shareable Report'}
								</Button>
							</form>
							<p class="text-xs text-gray-500 text-center">
								No spam. Unsubscribe anytime. Your report is always unlocked regardless.
							</p>
						{:else}
							<div class="text-center py-6">
								<CheckCircle class="w-12 h-12 text-green-500 mx-auto mb-4" />
								<h3 class="text-xl font-bold text-gray-900 mb-2">Report Ready!</h3>
								{#if showShare}
									<p class="text-sm text-gray-600 mb-4">
										Report link copied to clipboard. Share it or save the URL below:
									</p>
									<p class="text-xs text-gray-500 break-all mb-4">
										{showShare && buildShareUrl(reportFromQDay(result, email))}
									</p>
									<div class="flex gap-3 justify-center">
										<Button
											size="sm"
											variant="outline"
											onclick={async () => {
												const url = buildShareUrl(reportFromQDay(result, email));
												await navigator.clipboard.writeText(url);
											}}
										>
											<Share2 class="w-4 h-4 mr-2" />
											Copy Link
										</Button>
										<Button
											size="sm"
											class="bg-linear-to-r from-[var(--primary)] to-[var(--secondary)] text-white"
											onclick={() => window.print()}
										>
											<Download class="w-4 h-4 mr-2" />
											Print Report
										</Button>
									</div>
								{/if}
							</div>
						{/if}
					</CardContent>
				</Card>

				<!-- Back to calculator -->
				<div class="text-center">
					<Button variant="ghost" onclick={reset}>
						<ArrowLeft class="w-4 h-4 mr-2" />
						Run Another Assessment
					</Button>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}
</style>
