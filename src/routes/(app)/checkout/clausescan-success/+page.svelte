<script lang="ts">
	import { onMount } from 'svelte';
	import { CheckCircle, Loader2, ArrowRight, FileText } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { severityLabel } from '$lib/clauseScan';

	let { data }: { data: { reference: string } } = $props();

	let status = $state<'verifying' | 'ready' | 'failed'>('verifying');
	let full = $state<{
		riskScore: number;
		severity: 'low' | 'moderate' | 'high' | 'critical';
		clauses: { clause: string; category: string; severity: string; risk: string; explanation: string; redline?: string }[];
		overallAssessment: string;
		recommendedNextSteps: string[];
		verdict: string;
		clauseCount: number;
	} | null>(null);
	let failMsg = $state('');

	const sevBg: Record<string, string> = {
		low: 'bg-emerald-500/10 border-emerald-500/30',
		moderate: 'bg-amber-500/10 border-amber-500/30',
		high: 'bg-orange-500/10 border-orange-500/30',
		critical: 'bg-red-500/10 border-red-500/30'
	};
	const severityTone: Record<string, string> = {
		low: 'text-emerald-600',
		moderate: 'text-amber-600',
		high: 'text-orange-600',
		critical: 'text-red-600'
	};

	async function loadFull() {
		if (!data.reference) {
			status = 'failed';
			failMsg = 'Missing payment reference.';
			return;
		}
		let contractText = '';
		let type = 'generic';
		try {
			contractText = localStorage.getItem('rydertech_clausescan_text') ?? '';
			type = localStorage.getItem('rydertech_clausescan_type') ?? 'generic';
		} catch {}

		if (!contractText) {
			status = 'failed';
			failMsg = 'We lost the contract text from this session. Re-run the scan to get your report.';
			return;
		}

		const body = JSON.stringify({ text: contractText, type, reference: data.reference });
		try {
			let res = await fetch('/api/clausescan/full', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body
			});
			let j = await res.json();
			// 402 => payment not yet confirmed (webhook lag). Poll briefly.
			if (res.status === 402) {
				for (let i = 0; i < 5; i++) {
					await new Promise((r) => setTimeout(r, 2000));
					res = await fetch('/api/clausescan/full', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body
					});
					j = await res.json();
					if (res.ok && j.success) break;
				}
			}
			if (!res.ok || !j.success) {
				status = 'failed';
				failMsg = j.error ?? 'Could not generate the full report.';
				return;
			}
			full = j.full;
			status = 'ready';
		} catch {
			status = 'failed';
			failMsg = 'Network error loading your report. Try refreshing.';
		}
	}

	onMount(loadFull);
</script>

<svelte:head>
	<title>ClauseScan Report | RyderTech</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="min-h-screen bg-background pt-24 pb-20 px-4">
	<div class="container mx-auto max-w-3xl">
		{#if status === 'verifying'}
			<div class="rounded-2xl border bg-card p-10 text-center shadow-sm space-y-4">
				<Loader2 class="h-14 w-14 text-primary mx-auto animate-spin" />
				<h1 class="text-2xl font-bold">Generating your full report…</h1>
				<p class="text-muted-foreground">Confirming payment and running the full clause analysis.</p>
			</div>
		{:else if status === 'failed'}
			<div class="rounded-2xl border bg-card p-10 text-center shadow-sm space-y-4">
				<h1 class="text-2xl font-bold">Report unavailable</h1>
				<p class="text-muted-foreground">{failMsg}</p>
				<a href="/labs/clausescan"><Button variant="outline">Back to ClauseScan</Button></a>
			</div>
		{:else if full}
			<div class="space-y-6">
				<div class="rounded-2xl border bg-card p-8 text-center">
					<CheckCircle class="h-12 w-12 text-green-600 mx-auto" />
					<h1 class="mt-3 text-2xl font-bold">Your full contract report</h1>
					<p class="mt-1 text-muted-foreground">Payment confirmed · {full.clauseCount} clauses assessed</p>
				</div>

				<Card class="border-0 shadow-sm">
					<CardContent class="pt-6">
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm text-muted-foreground">Overall risk score</p>
								<p class="text-3xl font-bold {severityTone[full.severity]}">{full.riskScore}/100</p>
							</div>
							<span class="inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold {sevBg[full.severity]}">
								{severityLabel(full.severity)} risk
							</span>
						</div>
						<p class="mt-3 text-sm text-muted-foreground">{full.overallAssessment}</p>
					</CardContent>
				</Card>

				<div class="space-y-4">
					<h2 class="text-lg font-semibold">Every clause, worst-first</h2>
					{#each full.clauses as c}
						<Card class="border-0 shadow-sm">
							<CardContent class="pt-5">
								<div class="flex items-start justify-between gap-3">
									<div class="flex items-center gap-2">
										<FileText class="h-4 w-4 text-primary" />
										<span class="font-semibold">{c.clause}</span>
									</div>
									<span class="text-[11px] font-semibold {severityTone[c.severity]}">{severityLabel(c.severity)}</span>
								</div>
								<p class="mt-2 text-sm text-muted-foreground">{c.explanation}</p>
								{#if c.redline}
									<div class="mt-3 rounded-lg border-l-4 border-primary/50 bg-primary/5 p-3">
										<p class="text-xs font-semibold uppercase tracking-wide text-primary">Suggested redline</p>
										<p class="mt-1 text-sm">{c.redline}</p>
									</div>
								{/if}
							</CardContent>
						</Card>
					{/each}
				</div>

				{#if full.recommendedNextSteps?.length}
					<Card class="border-0 shadow-sm">
						<CardContent class="pt-5">
							<h2 class="text-sm font-semibold uppercase tracking-wide text-primary">Recommended next steps</h2>
							<ul class="mt-3 space-y-2">
								{#each full.recommendedNextSteps as s}
									<li class="flex gap-2 text-sm text-muted-foreground"><span class="text-primary">▸</span>{s}</li>
								{/each}
							</ul>
						</CardContent>
					</Card>
				{/if}

				<div class="flex flex-col gap-3 sm:flex-row">
					<a href="/labs/clausescan" class="flex-1"><Button variant="outline" class="w-full">Scan another contract</Button></a>
					<a href="/contact" class="flex-1">
						<Button class="w-full">Book a review with RyderTech <ArrowRight class="ml-2 h-4 w-4" /></Button>
					</a>
				</div>
			</div>
		{/if}
	</div>
</div>
