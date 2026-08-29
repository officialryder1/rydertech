<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import SEOMeta from '$lib/components/SEOMeta.svelte';
	import { env } from '$env/dynamic/public';
	import {
		Calculator,
		ArrowLeft,
		CheckCircle2,
		Zap,
		CreditCard,
		ArrowUpRight
	} from '@lucide/svelte';

	import { calculateGateways, type GatewayInput } from '$lib/gatewayCalc';
	import { reportFromGatewayCalc, buildShareUrl } from '$lib/shareReport';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let monthlyVolume = $state(10_000_000);
	let avgTicket = $state(25_000);
	let transferPct = $state(60);
	let cardPct = $state(35);
	let intCardPct = $state(5);

	let email = $state('');
	let company = $state('');
	let isSubmitting = $state(false);
	let unlocked = $state(false);
	let error = $state<string | null>(null);

	const input = $derived<GatewayInput>({
		monthlyVolume,
		avgTicket,
		transferPct,
		cardPct,
		intCardPct
	});

	const result = $derived(calculateGateways(input));
	const money = (n: number) => '₦ ' + Math.round(n).toLocaleString('en-US');

	function getReport() {
		const payload = reportFromGatewayCalc(result, 'NGN');
		goto(buildShareUrl(payload));
	}

	function validEmail(v: string) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!validEmail(email)) {
			error = 'Please enter a valid email address.';
			return;
		}
		if (!browser) return;
		isSubmitting = true;
		error = null;

		try {
			const { default: emailjs } = await import('@emailjs/browser');
			const { supabase } = await import('$lib/supabaseClient');

			const serviceId = env.PUBLIC_EMAILJS_SERVICE_ID;
			const templateId = env.PUBLIC_EMAILJS_TEMPLATE_ID;
			const publicKey = env.PUBLIC_EMAILJS_PUBLIC_KEY;

			if (serviceId && templateId && publicKey) {
				await emailjs.send(
					serviceId,
					templateId,
					{
						to_email: email,
						company: company || 'Not specified',
						tool_name: 'Nigerian Payment Gateway Fee Audit',
						monthly_volume: money(result.monthlyVolume),
						cheapest_gateway: result.cheapestGateway.name,
						max_savings: money(result.maxAnnualSavings),
						summary: result.verdict
					},
					publicKey
				);
			}

			try {
				await supabase.from('newsletter_subscriptions').insert({
					email,
					source: 'gateway-calc',
					metadata: {
						company,
						monthlyVolume: result.monthlyVolume,
						cheapest: result.cheapestGateway.name,
						savings: result.maxAnnualSavings
					}
				});
			} catch (dbErr) {
				console.warn('Supabase lead sink warning:', dbErr);
			}

			unlocked = true;
		} catch (err: any) {
			console.error('Lead submit error:', err);
			unlocked = true;
		} finally {
			isSubmitting = false;
		}
	}
</script>

<SEOMeta
	data={{
		title: 'Nigerian Payment Gateway Fee & Payout Calculator | RyderTech Labs',
		description:
			'Compare processing fees, settlement speeds, and transaction costs across Paystack, Monnify, Flutterwave, and Interswitch for Nigerian businesses.',
		keywords: [
			'Paystack fees calculator',
			'Monnify vs Paystack',
			'Flutterwave fees Nigeria',
			'payment gateway comparison Nigeria'
		],
		canonical: 'https://rydertech.ng/labs/gateway-calc'
	}}
/>

<div class="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-5xl mx-auto space-y-8">
		<div class="flex items-center justify-between">
			<a
				href="/labs"
				class="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors"
			>
				<ArrowLeft class="w-4 h-4 mr-2" />
				Back to RyderTech Labs
			</a>
			<Badge variant="outline" class="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
				Fintech & Payments
			</Badge>
		</div>

		<div class="text-center space-y-4">
			<div class="inline-flex p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400">
				<CreditCard class="w-8 h-8" />
			</div>
			<h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
				Nigerian Payment Gateway Fee Calculator
			</h1>
			<p class="max-w-2xl mx-auto text-slate-400 text-lg">
				Compare processing fees, settlement speed, and annual transaction overhead across Paystack, Monnify, Flutterwave, and Interswitch for your exact business mix.
			</p>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
			<Card class="lg:col-span-5 bg-slate-900/60 border-slate-800 backdrop-blur">
				<CardHeader>
					<CardTitle class="text-white flex items-center gap-2">
						<Calculator class="w-5 h-5 text-emerald-400" />
						Your Volume & Mix
					</CardTitle>
					<CardDescription class="text-slate-400">
						Configure your business metrics to see exact gateway costs.
					</CardDescription>
				</CardHeader>
				<CardContent class="space-y-6">
					<div class="space-y-2">
						<label for="monthlyVolume" class="text-sm font-medium text-slate-300 flex justify-between">
							<span>Monthly Processing Volume</span>
							<span class="text-emerald-400 font-semibold">{money(monthlyVolume)}</span>
						</label>
						<input
							id="monthlyVolume"
							type="range"
							min="500000"
							max="200000000"
							step="500000"
							bind:value={monthlyVolume}
							class="w-full accent-emerald-500 bg-slate-800 cursor-pointer"
						/>
						<div class="flex justify-between text-xs text-slate-500">
							<span>₦500k</span>
							<span>₦100M</span>
							<span>₦200M+</span>
						</div>
					</div>

					<div class="space-y-2">
						<label for="avgTicket" class="text-sm font-medium text-slate-300 flex justify-between">
							<span>Average Transaction Ticket</span>
							<span class="text-emerald-400 font-semibold">{money(avgTicket)}</span>
						</label>
						<input
							id="avgTicket"
							type="range"
							min="1000"
							max="500000"
							step="1000"
							bind:value={avgTicket}
							class="w-full accent-emerald-500 bg-slate-800 cursor-pointer"
						/>
						<div class="flex justify-between text-xs text-slate-500">
							<span>₦1,000</span>
							<span>₦250,000</span>
							<span>₦500,000</span>
						</div>
					</div>

					<div class="space-y-4 pt-4 border-t border-slate-800">
						<h3 class="text-sm font-semibold text-slate-200">Payment Channel Mix</h3>
						
						<div class="space-y-1">
							<label for="transferPct" class="text-xs text-slate-400 flex justify-between">
								<span>Bank Transfers / Virtual Accounts</span>
								<span class="text-slate-200">{transferPct}%</span>
							</label>
							<input
								id="transferPct"
								type="range"
								min="0"
								max="100"
								step="5"
								bind:value={transferPct}
								class="w-full accent-emerald-500 bg-slate-800"
							/>
						</div>

						<div class="space-y-1">
							<label for="cardPct" class="text-xs text-slate-400 flex justify-between">
								<span>Local Debit / Credit Cards (Verve/Mastercard/Visa)</span>
								<span class="text-slate-200">{cardPct}%</span>
							</label>
							<input
								id="cardPct"
								type="range"
								min="0"
								max="100"
								step="5"
								bind:value={cardPct}
								class="w-full accent-emerald-500 bg-slate-800"
							/>
						</div>

						<div class="space-y-1">
							<label for="intCardPct" class="text-xs text-slate-400 flex justify-between">
								<span>International Cards (USD/Foreign)</span>
								<span class="text-slate-200">{intCardPct}%</span>
							</label>
							<input
								id="intCardPct"
								type="range"
								min="0"
								max="50"
								step="5"
								bind:value={intCardPct}
								class="w-full accent-emerald-500 bg-slate-800"
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			<div class="lg:col-span-7 space-y-6">
				<Card class="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border-emerald-500/30">
					<CardHeader class="pb-3">
						<div class="flex items-center justify-between">
							<Badge class="bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
								Recommended Gateway
							</Badge>
							<span class="text-xs text-slate-400">Est. {result.totalTransactionsPerMonth.toLocaleString()} txs/mo</span>
						</div>
						<CardTitle class="text-2xl sm:text-3xl font-bold text-white mt-2">
							{result.cheapestGateway.name}
						</CardTitle>
						<CardDescription class="text-slate-300 text-base">
							{result.verdict}
						</CardDescription>
					</CardHeader>
					<CardContent class="space-y-6">
						<div class="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
							<div>
								<span class="text-xs text-slate-400 block">Annual Processing Fee</span>
								<span class="text-xl font-bold text-white">{money(result.cheapestGateway.annualFee)}</span>
							</div>
							<div>
								<span class="text-xs text-slate-400 block">Effective Rate</span>
								<span class="text-xl font-bold text-emerald-400">{result.cheapestGateway.effectiveRatePct}%</span>
							</div>
							<div>
								<span class="text-xs text-slate-400 block">Payout Speed</span>
								<span class="text-sm font-semibold text-slate-200">{result.cheapestGateway.payoutSpeed}</span>
							</div>
						</div>

						<div class="space-y-3 pt-2">
							<h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider">All Gateways Compared (Annual Fee)</h4>
							<div class="space-y-2">
								{#each result.gateways as gw}
									<div class="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
										<div class="flex items-center gap-3">
											<div class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
												{gw.name.slice(0, 2).toUpperCase()}
											</div>
											<div>
												<span class="text-sm font-semibold text-white block">{gw.name}</span>
												<span class="text-xs text-slate-400">{gw.payoutSpeed}</span>
											</div>
										</div>
										<div class="text-right">
											<span class="text-sm font-bold text-white block">{money(gw.annualFee)}</span>
											<span class="text-xs text-emerald-400">{gw.effectiveRatePct}% effective</span>
										</div>
									</div>
								{/each}
							</div>
						</div>

						{#if !unlocked}
							<div class="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-4">
								<div class="flex items-start gap-3">
									<Zap class="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
									<div>
										<h4 class="text-sm font-semibold text-white">Unlock Full Gateway Audit & Recommendations</h4>
										<p class="text-xs text-slate-300 mt-1">
											Get the complete breakdown, pros/cons per gateway, and our engineering guide for multi-gateway failover routing.
										</p>
									</div>
								</div>
								<form onsubmit={handleSubmit} class="space-y-3">
									<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
										<Input
											type="text"
											placeholder="Company Name"
											bind:value={company}
											class="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
										/>
										<Input
											type="email"
											placeholder="work@company.com"
											bind:value={email}
											required
											class="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
										/>
									</div>
									{#if error}
										<p class="text-xs text-rose-400">{error}</p>
									{/if}
									<Button
										type="submit"
										disabled={isSubmitting}
										class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/20"
									>
										{isSubmitting ? 'Analyzing Gateways...' : 'Unlock Complete Audit Report'}
									</Button>
								</form>
							</div>
						{:else}
							<div class="p-6 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-6">
								<div class="flex items-center gap-3 text-emerald-400">
									<CheckCircle2 class="w-6 h-6 shrink-0" />
									<span class="font-semibold text-white">Audit Unlocked Successfully!</span>
								</div>

								<div class="space-y-3">
									<h4 class="text-sm font-semibold text-slate-200">RyderTech Engineering Recommendations</h4>
									<ul class="space-y-2">
										{#each result.recommendations as rec}
											<li class="text-xs text-slate-300 flex items-start gap-2">
												<span class="text-emerald-400 font-bold">›</span>
												{rec}
											</li>
										{/each}
									</ul>
								</div>

								<div class="flex flex-col sm:flex-row gap-3 pt-2">
									<Button
										onclick={getReport}
										class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
									>
										Get Shareable Branded Audit Report
										<ArrowUpRight class="w-4 h-4 ml-2" />
									</Button>
									<a
										href="/contact"
										class="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-800 text-sm font-medium transition-colors"
									>
										Talk to Payment Engineers
									</a>
								</div>
							</div>
						{/if}
					</CardContent>
				</Card>
			</div>
		</div>
	</div>
</div>
