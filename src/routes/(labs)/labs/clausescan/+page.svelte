<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import SEOMeta from '$lib/components/SEOMeta.svelte';
	import { supabase } from '$lib/supabaseClient';
	import { env } from '$env/dynamic/public';
	import emailjs from '@emailjs/browser';
	import {
		FileText,
		ScanLine,
		ArrowLeft,
		AlertTriangle,
		ShieldCheck,
		Loader2,
		CheckCircle2,
		Lock,
		Upload
	} from '@lucide/svelte';

	import { scoreLead } from '$lib/leadScore';
	import { reportFromClauseScan, buildShareUrl } from '$lib/shareReport';
	import { severityLabel } from '$lib/clauseScan';
	import { CLAUSESCAN_PRICE_NGN } from '$lib/clauseScan';
	import { goto } from '$app/navigation';

	type ContractType = 'generic' | 'employment' | 'vendor' | 'lease' | 'nda' | 'partnership' | 'saas';

	const TYPES: { value: ContractType; label: string }[] = [
		{ value: 'generic', label: 'Generic / mixed' },
		{ value: 'employment', label: 'Employment' },
		{ value: 'vendor', label: 'Vendor / supplier' },
		{ value: 'lease', label: 'Lease / tenancy' },
		{ value: 'nda', label: 'NDA' },
		{ value: 'partnership', label: 'Partnership' },
		{ value: 'saas', label: 'SaaS / software' }
	];

	let contractType = $state<ContractType>('generic');
	let text = $state('');
	let email = $state('');
	let scanning = $state(false);
	let error = $state<string | null>(null);
	let summary = $state<{
		riskScore: number;
		severity: 'low' | 'moderate' | 'high' | 'critical';
		topRisks: { clause: string; category: string; severity: string; risk: string; explanation: string }[];
		verdict: string;
		clauseCount: number;
	} | null>(null);

	let paying = $state(false);
	let payError = $state<string | null>(null);
	let leadCaptured = $state(false);

	const severityTone: Record<string, string> = {
		low: 'text-emerald-600',
		moderate: 'text-amber-600',
		high: 'text-orange-600',
		critical: 'text-red-600'
	};
	const sevBg: Record<string, string> = {
		low: 'bg-emerald-500/10 border-emerald-500/30',
		moderate: 'bg-amber-500/10 border-amber-500/30',
		high: 'bg-orange-500/10 border-orange-500/30',
		critical: 'bg-red-500/10 border-red-500/30'
	};

	function validEmail(v: string) {
		const s = (v ?? '').trim();
		const at = s.indexOf('@');
		const dot = s.lastIndexOf('.');
		return at > 0 && dot > at + 1 && dot < s.length - 1 && !s.includes(' ');
	}

	function handleFile(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		if (file.size > 200_000) {
			error = 'Keep the paste under ~200KB. For long PDFs, copy the key clauses in.';
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			text = String(reader.result ?? '').slice(0, 32000);
			error = null;
		};
		reader.readAsText(file);
	}

	function getReport() {
		if (!summary) return;
		const payload = reportFromClauseScan(summary);
		goto(buildShareUrl(payload));
	}

	async function runScan() {
		error = null;
		if (text.trim().length < 40) {
			error = 'Paste at least a paragraph of contract text to scan.';
			return;
		}
		scanning = true;
		try {
			const res = await fetch('/api/clausescan/scan', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text: text.slice(0, 32000), type: contractType })
			});
			const j = await res.json();
			if (!res.ok || !j.success) {
				error = j.error ?? 'Could not analyze the contract. Try again.';
				return;
			}
			summary = j.summary;
		} catch (err) {
			error = 'Network error. Check your connection and retry.';
		} finally {
			scanning = false;
		}
	}

	async function captureLeadAndPay() {
		error = null;
		payError = null;
		if (!summary) return;
		if (!validEmail(email)) {
			payError = 'Enter the email for your report receipt.';
			return;
		}
		// Always proceed to pay; a delivery failure must never block the buyer.
		leadCaptured = true;
		try {
			localStorage.setItem('rydertech_clausescan_text', text.slice(0, 32000));
			localStorage.setItem('rydertech_clausescan_type', contractType);
		} catch {}

		try {
			const lead = scoreLead({
				tool: 'clausescan' as any,
				impactValue: summary.riskScore * 5000,
				revenueAtRisk: summary.riskScore * 5000,
				healthScore: 100 - summary.riskScore
			});
			const serviceId = env.PUBLIC_EMAILJS_SERVICE_ID;
			const templateId = env.PUBLIC_EMAILJS_TEMPLATE_ID;
			const publicKey = env.PUBLIC_EMAILJS_PUBLIC_KEY;
			if (serviceId && templateId && publicKey) {
				await emailjs.send(
					serviceId,
					templateId,
					{
						from_name: 'ClauseScan lead',
						from_email: email,
						company: '',
						budget: `₦${CLAUSESCAN_PRICE_NGN}`,
						timeline: 'one-time unlock',
						message: `New ClauseScan result (source: /labs/clausescan). Lead score: ${lead.points}/100 (${lead.tier}).\nRisk score: ${summary.riskScore}/100 (${severityLabel(summary.severity)}). Clauses: ${summary.clauseCount}.\nVerdict: ${summary.verdict}`,
						lead_type: 'lead_magnet_clausescan',
						lead_score: lead.points,
						lead_tier: lead.tier
					},
					{ publicKey }
				);
			}
			try {
				await supabase
					.from('newsletter_subscriptions')
					.insert([
						{
							email,
							source: 'lead_magnet_clausescan',
							subscribed_at: new Date().toISOString(),
							lead_score: lead.points,
							lead_tier: lead.tier
						}
					])
					.select();
			} catch {}
		} catch (err) {
			console.warn('ClauseScan lead email failed (non-blocking):', err);
		}

		// Start Paystack payment.
		if (!env.PUBLIC_PAYSTACK_PUBLIC_KEY) {
			payError = 'Paystack is not configured yet. Contact support.';
			return;
		}
		paying = true;
		const reference = `clausescan_${Date.now()}`;
		try {
			localStorage.setItem('rydertech_clausescan_reference', reference);
			const res = await fetch('/api/paystack/clausescan/initialize', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, reference })
			});
			const j = await res.json();
			if (!res.ok || !j.authorization_url) {
				paying = false;
				payError = j.error ?? 'Could not start payment. Try again.';
				return;
			}
			window.location.href = j.authorization_url;
		} catch {
			paying = false;
			payError = 'Network error starting payment. Check your connection.';
		}
	}
</script>

<SEOMeta
	data={{
		title: 'ClauseScan — Free AI Contract Risk Review | RyderTech',
		description:
			'Paste a contract and get an instant AI risk score, the worst clauses flagged in plain English, and a full report with redline wording. ₦2,500 one-time. No signup to scan.',
		canonical: 'https://rydertech.ng/labs/clausescan'
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
			<Badge variant="secondary" class="mb-3">Contract Review</Badge>
			<h1 class="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
				Don't sign what you haven't read.
			</h1>
			<p class="mt-4 text-lg text-muted-foreground">
				Paste a contract and ClauseScan flags the risky clauses in plain English — free. Unlock the full
				report for ₦2,500 and get redline wording for every problem clause.
			</p>
		</header>

		<div class="grid gap-8 lg:grid-cols-[1fr_420px]">
			<!-- INPUT -->
			<section class="space-y-6">
				<Card>
					<CardHeader class="pb-4">
						<div class="flex items-center justify-between">
							<CardTitle class="flex items-center gap-2 text-base">
								<FileText class="h-4 w-4 text-primary" />
								Your contract
							</CardTitle>
							<select
								bind:value={contractType}
								class="rounded-md border border-input bg-transparent px-2 py-1 text-sm outline-none focus-visible:border-ring"
							>
								{#each TYPES as t}
									<option value={t.value}>{t.label}</option>
								{/each}
							</select>
						</div>
						<CardDescription>Paste the contract body. PDF upload is on the way — for now copy the text in.</CardDescription>
					</CardHeader>
					<CardContent class="space-y-3">
						<Textarea
							bind:value={text}
							placeholder="Paste the contract text here… (vendor agreement, employment offer, lease, NDA, etc.)"
							class="min-h-[280px] font-mono text-sm"
						/>
						<div class="flex flex-wrap items-center gap-3">
							<label
								class="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground"
							>
								<Upload class="h-4 w-4" />
								Upload .txt
								<input type="file" accept=".txt,text/plain" class="hidden" onchange={handleFile} />
							</label>
							<span class="text-xs text-muted-foreground">{text.length} chars</span>
						</div>
						{#if error}
							<p class="text-xs text-destructive">{error}</p>
						{/if}
						<Button class="w-full" onclick={runScan} disabled={scanning}>
							{#if scanning}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" /> Scanning…
							{:else}
								<ScanLine class="mr-2 h-4 w-4" /> Scan contract (free)
							{/if}
						</Button>
					</CardContent>
				</Card>
			</section>

			<!-- RESULTS -->
			<aside class="space-y-6 lg:sticky lg:top-8 lg:self-start">
				{#if !summary}
					<Card>
						<CardContent class="pt-6">
							<div class="flex flex-col items-center gap-3 py-8 text-center">
								<ShieldCheck class="h-10 w-10 text-primary/40" />
								<p class="text-sm text-muted-foreground">
									Your risk score and worst clauses appear here. Free, instant, no signup.
								</p>
							</div>
						</CardContent>
					</Card>
				{:else}
					<Card>
						<CardHeader class="pb-3">
							<CardDescription class="flex items-center gap-1.5">
								<AlertTriangle class="h-3.5 w-3.5" />
								Contract risk score
							</CardDescription>
							<p class="text-4xl font-bold {severityTone[summary.severity]}">
								{summary.riskScore}/100
							</p>
							<span
								class="mt-1 inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold {sevBg[
									summary.severity
								]}"
							>
								{severityLabel(summary.severity)} risk
							</span>
							<p class="pt-2 text-sm text-muted-foreground">{summary.verdict}</p>
						</CardHeader>
						<CardContent>
							<p class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								Top risks (free preview)
							</p>
							<ul class="space-y-3 border-t pt-3">
								{#each summary.topRisks as risk}
									<li class="rounded-lg border p-3 text-sm">
										<div class="flex items-center justify-between gap-2">
											<span class="font-semibold">{risk.clause}</span>
											<span class="text-[11px] font-semibold {severityTone[risk.severity]}">{severityLabel(risk.severity)}</span>
										</div>
										<p class="mt-1 text-muted-foreground">{risk.explanation}</p>
									</li>
								{/each}
							</ul>
							{#if summary.clauseCount > summary.topRisks.length}
								<p class="mt-3 text-xs text-muted-foreground">
									+{summary.clauseCount - summary.topRisks.length} more clauses in the full report.
								</p>
							{/if}
						</CardContent>
					</Card>

					<Card>
						<CardContent class="pt-6">
							<h3 class="flex items-center gap-2 text-lg font-semibold">
								<Lock class="h-4 w-4 text-primary" />
								Get the full report
							</h3>
							<p class="mt-1.5 text-sm text-muted-foreground">
								Every clause assessed, worst-first, with plain-English explanations and <strong>redline wording</strong> you
								can lift straight into negotiations. One-time ₦{CLAUSESCAN_PRICE_NGN.toLocaleString()}.
							</p>
							<form
								class="mt-4 space-y-3"
								onsubmit={(e) => {
									e.preventDefault();
									captureLeadAndPay();
								}}
								>
								<input
									type="email"
									bind:value={email}
									placeholder="you@company.com"
									autocomplete="email"
									class="border-input bg-background h-9 w-full rounded-md border px-3 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
								/>
								{#if payError}
									<p class="text-xs text-destructive">{payError}</p>
								{/if}
								<Button type="submit" class="w-full" disabled={paying}>
									{#if paying}
										<Loader2 class="mr-2 h-4 w-4 animate-spin" /> Opening Paystack…
									{:else}
										Unlock full report — ₦{CLAUSESCAN_PRICE_NGN.toLocaleString()}
									{/if}
								</Button>
							</form>
							<Button variant="outline" class="mt-2 w-full gap-2" onclick={getReport}>
								<ScanLine class="h-4 w-4" /> Get shareable risk report
							</Button>
							<a href="/services/ai" class="mt-2 block text-center text-sm text-muted-foreground hover:text-foreground">
								Or have RyderTech automate your contract intake →
							</a>
						</CardContent>
					</Card>
				{/if}
			</aside>
		</div>
	</div>
</div>
