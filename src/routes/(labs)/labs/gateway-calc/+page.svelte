<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Calculator, CreditCard, ArrowLeft } from '@lucide/svelte';
	import { calculateGateways, type GatewayInput } from '$lib/gatewayCalc';

	let monthlyVolume = $state(10_000_000);
	let avgTicket = $state(25_000);
	let transferPct = $state(60);
	let cardPct = $state(35);
	let intCardPct = $state(5);

	const input = $derived<GatewayInput>({ monthlyVolume, avgTicket, transferPct, cardPct, intCardPct });
	const result = $derived(calculateGateways(input));
	const money = (n: number) => '₦ ' + Math.round(n).toLocaleString('en-US');
</script>

<div class="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-5xl mx-auto space-y-8">
		<div class="flex items-center justify-between">
			<a href="/labs" class="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors">
				<ArrowLeft class="w-4 h-4 mr-2" /> Back to RyderTech Labs
			</a>
		</div>
		<div class="text-center space-y-4">
			<div class="inline-flex p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400">
				<CreditCard class="w-8 h-8" />
			</div>
			<h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">Nigerian Payment Gateway Fee Calculator</h1>
			<p class="max-w-2xl mx-auto text-slate-400 text-lg">Compare processing fees, settlement speed, and annual transaction overhead across Paystack, Monnify, Flutterwave, and Interswitch.</p>
		</div>
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
			<Card class="lg:col-span-5 bg-slate-900/60 border-slate-800 backdrop-blur">
				<CardHeader>
					<CardTitle class="text-white flex items-center gap-2">
						<Calculator class="w-5 h-5 text-emerald-400" /> Your Volume & Mix
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-6">
					<div class="space-y-2">
						<label for="monthlyVolume" class="text-sm font-medium text-slate-300 flex justify-between">
							<span>Monthly Processing Volume</span>
							<span class="text-emerald-400 font-semibold">{money(monthlyVolume)}</span>
						</label>
						<input id="monthlyVolume" type="range" min="500000" max="200000000" step="500000" bind:value={monthlyVolume} class="w-full accent-emerald-500 bg-slate-800 cursor-pointer" />
					</div>
					<div class="space-y-2">
						<label for="avgTicket" class="text-sm font-medium text-slate-300 flex justify-between">
							<span>Average Transaction Ticket</span>
							<span class="text-emerald-400 font-semibold">{money(avgTicket)}</span>
						</label>
						<input id="avgTicket" type="range" min="1000" max="500000" step="1000" bind:value={avgTicket} class="w-full accent-emerald-500 bg-slate-800 cursor-pointer" />
					</div>
					<div class="space-y-4 pt-4 border-t border-slate-800">
						<h3 class="text-sm font-semibold text-slate-200">Payment Channel Mix</h3>
						<div class="space-y-1">
							<label for="transferPct" class="text-xs text-slate-400 flex justify-between">
								<span>Bank Transfers / Virtual Accounts</span>
								<span class="text-slate-200">{transferPct}%</span>
							</label>
							<input id="transferPct" type="range" min="0" max="100" step="5" bind:value={transferPct} class="w-full accent-emerald-500 bg-slate-800" />
						</div>
						<div class="space-y-1">
							<label for="cardPct" class="text-xs text-slate-400 flex justify-between">
								<span>Local Debit / Credit Cards (Verve/Mastercard/Visa)</span>
								<span class="text-slate-200">{cardPct}%</span>
							</label>
							<input id="cardPct" type="range" min="0" max="100" step="5" bind:value={cardPct} class="w-full accent-emerald-500 bg-slate-800" />
						</div>
						<div class="space-y-1">
							<label for="intCardPct" class="text-xs text-slate-400 flex justify-between">
								<span>International Cards (USD/Foreign)</span>
								<span class="text-slate-200">{intCardPct}%</span>
							</label>
							<input id="intCardPct" type="range" min="0" max="50" step="5" bind:value={intCardPct} class="w-full accent-emerald-500 bg-slate-800" />
						</div>
					</div>
				</CardContent>
			</Card>
			<div class="lg:col-span-7 space-y-6">
				<Card class="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border-emerald-500/30">
					<CardHeader class="pb-3">
						<div class="flex items-center justify-between">
							<span class="text-xs text-slate-400">Est. {result.totalTransactionsPerMonth.toLocaleString()} txs/mo</span>
						</div>
						<CardTitle class="text-2xl sm:text-3xl font-bold text-white mt-2">{result.cheapestGateway.name}</CardTitle>
						<CardDescription class="text-slate-300 text-base">{result.verdict}</CardDescription>
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
					</CardContent>
				</Card>
			</div>
		</div>
	</div>
</div>
