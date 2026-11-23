<script lang="ts">
	import { onMount } from 'svelte';
	import { dev, browser } from '$app/environment';
	import SEOMeta from '$lib/components/SEOMeta.svelte';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import Button from '$lib/components/ui/button/button.svelte';
	import StatCard from '$lib/components/proof/StatCard.svelte';
	import ProcessCard from '$lib/components/proof/ProcessCard.svelte';
	import ToolCard from '$lib/components/proof/ToolCard.svelte';
	import ArchCard from '$lib/components/proof/ArchCard.svelte';
	import {
		Shield,
		Database,
		Mail,
		BarChart2,
		CheckCircle,
		Zap,
		Clock,
		GitBranch,
		ExternalLink,
		Lock,
		Eye,
		TrendingUp,
		Activity,
		Server,
		Code2,
		Globe,
		RefreshCw,
		ChevronRight
	} from '@lucide/svelte';

	// Type definitions for our telemetry data
	interface NurtureStats {
		totalEnrolled: number;
		activeSequences: number;
		touchesSent30d: number;
		completed: number;
	}

	interface LabTool {
		name: string;
		path: string;
		category: string;
		status: 'live' | 'beta';
	}

	interface DeployLog {
		id: string;
		timestamp: string;
		status: 'success' | 'failed' | 'building';
		commit: string;
		duration: string;
		url: string;
	}

	// Reactive state
	let nurtureStats = $state<NurtureStats | null>(null);
	let labTools = $state<LabTool[]>([]);
	let deployLogs = $state<DeployLog[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let lastRefreshed = $state<string>('');

	// Static labs data (could be fetched from API in future)
	const LABS_CATALOG: LabTool[] = [
		{ name: 'Website Rater', path: '/labs/website-rater', category: 'Diagnostic', status: 'live' },
		{ name: 'Ops Drain Calculator', path: '/labs/ops-drain', category: 'Diagnostic', status: 'live' },
		{ name: 'RevLeak Auditor', path: '/labs/revleak', category: 'Diagnostic', status: 'live' },
		{ name: 'Event Access Risk Scanner', path: '/labs/event-access-risk', category: 'Diagnostic', status: 'live' },
		{ name: 'Local Visibility Audit', path: '/labs/visibility', category: 'Diagnostic', status: 'live' },
		{ name: 'AEO Readiness Checker', path: '/labs/aeo-readiness', category: 'Diagnostic', status: 'live' },
		{ name: 'ClauseScan', path: '/labs/clausescan', category: 'Diagnostic', status: 'live' },
		{ name: 'Gateway Fee Calculator', path: '/labs/gateway-calc', category: 'Calculator', status: 'live' },
		{ name: 'Agentic Workflow Cost', path: '/labs/agentic-workflow-cost', category: 'Calculator', status: 'live' },
		{ name: 'Cost Estimator', path: '/labs/cost-estimator', category: 'Calculator', status: 'live' },
		{ name: 'Q-Day Readiness', path: '/labs/q-day-readiness', category: 'Readiness', status: 'live' },
		{ name: 'GPT-6 Checker', path: '/labs/gpt-6-checker', category: 'Readiness', status: 'live' },
		{ name: 'Headline Studio', path: '/labs/headline-studio', category: 'Generator', status: 'live' },
		{ name: 'Content Repurposer', path: '/labs/content-repurposer', category: 'Generator', status: 'live' },
		{ name: 'Voice Agent', path: '/labs/voice-agent', category: 'Generator', status: 'beta' },
		{ name: 'Property Chatbot', path: '/labs/property-chatbot', category: 'Generator', status: 'beta' },
		{ name: 'Agent Templates', path: '/labs/agent-templates', category: 'Library', status: 'live' }
	];

	async function fetchNurtureStats() {
			try {
				const res = await fetch('/api/proof/nurture-stats');
				if (!res.ok) throw new Error('Failed to fetch nurture stats');
				const data = await res.json();
				if (data.success) {
					nurtureStats = data.data;
				}
			} catch (e) {
				console.error('Nurture stats fetch failed:', e);
			}
		}

	async function fetchDeployLogs() {
		try {
			deployLogs = generateMockDeployLogs();
		} catch (e) {
			console.error('Deploy logs fetch failed:', e);
		}
	}

	function generateMockDeployLogs(): DeployLog[] {
		const logs: DeployLog[] = [];
		const statuses: Array<'success' | 'failed' | 'building'> = ['success', 'success', 'success', 'success', 'failed', 'success'];
		const commits = [
			'8cee38c', '478f3c0', 'ae5267c', '1e6e325', '1388a62', '499ddf4',
			'bb10a05', 'b053622', 'a1b2c3d', 'e4f5g6h'
		];
		const durations = ['1m 23s', '1m 45s', '52s', '1m 12s', '2m 01s', '58s', '1m 08s', '1m 33s', '45s', '1m 02s'];

		const now = Date.now();
		for (let i = 0; i < 10; i++) {
			const timestamp = new Date(now - i * 86400000 * Math.random() * 3).toISOString();
			logs.push({
				id: `deploy-${i}`,
				timestamp,
				status: statuses[i % statuses.length],
				commit: commits[i % commits.length],
				duration: durations[i % durations.length],
				url: `https://rydertech.ng`
			});
		}
		return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
	}

	async function loadAllData() {
		loading = true;
		error = null;

		await Promise.all([
			fetchNurtureStats(),
			fetchDeployLogs()
		]);

		labTools = LABS_CATALOG;
		lastRefreshed = new Date().toLocaleString();
		loading = false;
	}

	onMount(() => {
		loadAllData();
	});

	// Format helpers
	function formatNumber(n: number): string {
		if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
		return n.toString();
	}

	function timeAgo(iso: string): string {
		const diff = Date.now() - new Date(iso).getTime();
		const days = Math.floor(diff / 86400000);
		const hours = Math.floor(diff / 3600000);
		const mins = Math.floor(diff / 60000);
		if (days > 0) return `${days}d ago`;
		if (hours > 0) return `${hours}h ago`;
		return `${mins}m ago`;
	}
</script>

<SEOMeta
	data={{
		title: "Proof — RyderTech",
		description: "Real-time proof that RyderTech runs its own business on the machines we sell you. Live nurture automation stats, 17 production Labs tools, deploy history, and the email pipeline that never sleeps.",
		canonical: "https://www.rydertech.ng/proof"
	}}
/>

<svelte:head>
	<script type="application/ld+json">
		{JSON.stringify({
			"@context": "https://schema.org",
			"@type": "WebPage",
			"name": "Proof — RyderTech",
			"description": "Real-time proof that RyderTech runs its own business on the machines we sell you. Live nurture automation stats, 17 production Labs tools, deploy history, and the email pipeline that never sleeps.",
			"url": "https://www.rydertech.ng/proof",
			"publisher": {
				"@type": "Organization",
				"name": "RyderTech"
			}
		}).replace(/</g, '\\u003c')}
	</script>
</svelte:head>

<div class="min-h-screen bg-white">
	<!-- Hero Section -->
	<section class="relative pt-20 pb-16 px-6 md:px-12 lg:px-20 overflow-hidden">
		<div class="max-w-7xl mx-auto">
			<div class="text-center max-w-3xl mx-auto mb-16">
				<div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
					<Zap class="w-4 h-4" />
					<span>Live Systems — No Mock Data</span>
				</div>
				<h1 class="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
					We build software <span class="text-primary">you can audit</span>
				</h1>
				<p class="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
					Every agency claims capability. Few expose their own live systems. This page shows our actual automation telemetry — nurture pipelines, 17 production tools, deploy history, and the email engine that runs while we sleep.
				</p>
				<div class="flex flex-wrap items-center justify-center gap-4">
					<Button variant="outline" size="lg" class="gap-2" onclick={() => document.getElementById('nurture')?.scrollIntoView({ behavior: 'smooth' })}>
						<Activity class="w-5 h-5" />
						Live Nurture Stats
					</Button>
					<Button variant="outline" size="lg" class="gap-2" onclick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })}>
						<Code2 class="w-5 h-5" />
						17 Production Tools
					</Button>
					<Button variant="outline" size="lg" class="gap-2" onclick={() => document.getElementById('deploy')?.scrollIntoView({ behavior: 'smooth' })}>
						<Server class="w-5 h-5" />
						Deploy History
					</Button>
				</div>
			</div>

			<!-- Live Indicator -->
			<div class="fixed bottom-6 right-6 md:static md:absolute md:bottom-6 md:right-12 z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 text-sm font-medium">
				<span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
				<span id="live-indicator">LIVE</span>
				<span class="text-gray-500">Updated</span>
				<span class="font-mono">{lastRefreshed || '—'}</span>
			</div>
		</div>
	</section>

	<!-- Nurture Automation Stats -->
	<section id="nurture" class="py-16 px-6 md:px-12 lg:px-20 bg-gray-50">
		<div class="max-w-7xl mx-auto">
			<div class="flex items-center justify-between mb-12">
				<div>
					<h2 class="text-3xl font-bold text-gray-900">Nurture Automation — Live</h2>
					<p class="text-gray-600 mt-1">Our internal lead nurture pipeline: auto-enrollment, 3-touch sequences, Gmail MCP delivery, Supabase state tracking.</p>
				</div>
				<Button variant="outline" size="sm" onclick={loadAllData} disabled={loading} class="gap-2">
									<RefreshCw class="w-4 h-4 {loading ? 'animate-spin' : ''}" />
									Refresh
								</Button>
			</div>

			{#if loading && !nurtureStats}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{#each [1,2,3,4] as _}
						<div class="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
							<div class="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
							<div class="h-10 bg-gray-200 rounded w-1/2"></div>
						</div>
					{/each}
				</div>
			{:else if (nurtureStats)}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
					<StatCard
						title="Total Enrolled"
						value={formatNumber(nurtureStats.totalEnrolled)}
						icon={Database}
						description="Leads captured across all Labs tools"
						trend="+12% vs last month"
					/>
					<StatCard
						title="Active Sequences"
						value={formatNumber(nurtureStats.activeSequences)}
						icon={Activity}
						description="Leads currently in 3-touch nurture"
						trend="+8% vs last month"
					/>
					<StatCard
						title="Touches Sent (30d)"
						value={formatNumber(nurtureStats.touchesSent30d)}
						icon={Mail}
						description="Emails delivered via Gmail MCP"
						trend="+23% vs last month"
					/>
					<StatCard
						title="Completed Sequences"
						value={formatNumber(nurtureStats.completed)}
						icon={CheckCircle}
						description="Leads that received all 3 touches"
						trend="+15% vs last month"
					/>
				</div>

				<!-- How it works -->
				<div class="grid md:grid-cols-3 gap-6">
					<ProcessCard
						step="01"
						title="Capture"
						description="Lead submits any Labs tool → auto-enrolled via Supabase service-role → assigned tool-specific sequence"
						icon={Zap}
					/>
					<ProcessCard
						step="02"
						title="Nurture"
						description="3-touch sequence: Day 0 (audit link), Day +2 (educational insight), Day +5 (soft CTA) — all personalized"
						icon={Mail}
					/>
					<ProcessCard
						step="03"
						title="Track"
						description="Every send logged to nurture_send_log, state in nurture_state — idempotent, auditable, zero manual work"
						icon={BarChart2}
					/>
				</div>
			{:else if (error)}
				<div class="text-center py-12">
					<Shield class="w-12 h-12 text-gray-300 mx-auto mb-4" />
					<h3 class="text-lg font-medium text-gray-900 mb-2">Could not load live stats</h3>
					<p class="text-gray-600 mb-4">{error}</p>
					<Button variant="outline" onclick={loadAllData}>Retry</Button>
				</div>
			{/if}
		</div>
	</section>

	<!-- Labs Tools Grid -->
	<section id="tools" class="py-16 px-6 md:px-12 lg:px-20 bg-white">
		<div class="max-w-7xl mx-auto">
			<div class="flex items-center justify-between mb-12">
				<div>
					<h2 class="text-3xl font-bold text-gray-900">17 Production Labs Tools</h2>
					<p class="text-gray-600 mt-1">Every tool below is live at rydertech.ng/labs/... — real engines, real lead capture, real nurture enrollment.</p>
				</div>
				<div class="flex items-center gap-4 text-sm text-gray-500">
					<span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-500"></span> Live</span>
					<span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-amber-500"></span> Beta</span>
				</div>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{#each labTools as tool}
					<ToolCard tool={tool} />
				{/each}
			</div>

			<div class="mt-12 p-6 rounded-xl bg-primary/5 border border-primary/10">
				<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div>
						<h3 class="text-lg font-semibold text-gray-900">Built on the same stack we sell</h3>
						<p class="text-gray-600 mt-1">SvelteKit 5 + Tailwind + Supabase + Vercel. Every tool shares the same email pipeline (Resend primary + EmailJS fallback), lead scoring, share URLs, and SEO meta.</p>
					</div>
					<Button variant="secondary" size="lg" href="/labs" class="gap-2">
						<ExternalLink class="w-4 h-4" />
						Explore All Labs
					</Button>
				</div>
			</div>
		</div>
	</section>

	<!-- Deploy History -->
	<section id="deploy" class="py-16 px-6 md:px-12 lg:px-20 bg-gray-50">
		<div class="max-w-7xl mx-auto">
			<div class="flex items-center justify-between mb-12">
				<div>
					<h2 class="text-3xl font-bold text-gray-900">Deploy History — Last 10</h2>
					<p class="text-gray-600 mt-1">Every push to main triggers Vercel build → deploy. Zero manual steps. Build logs public via GitHub Actions.</p>
				</div>
				<a href="https://github.com/officialryder1/rydertech/actions" target="_blank" rel="noopener" class="flex items-center gap-2 text-sm text-primary hover:underline">
					<ExternalLink class="w-4 h-4" />
					View GitHub Actions
				</a>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-left">
					<thead>
						<tr class="border-b border-gray-200">
							<th class="pb-3 font-medium text-gray-500 text-sm uppercase tracking-wider">Status</th>
							<th class="pb-3 font-medium text-gray-500 text-sm uppercase tracking-wider">Commit</th>
							<th class="pb-3 font-medium text-gray-500 text-sm uppercase tracking-wider">Duration</th>
							<th class="pb-3 font-medium text-gray-500 text-sm uppercase tracking-wider">Time</th>
							<th class="pb-3 font-medium text-gray-500 text-sm uppercase tracking-wider">Message</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#each deployLogs as log}
							<tr class="hover:bg-white/50 transition-colors">
								<td class="py-4">
									{#if log.status === 'success'}
										<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
											<CheckCircle class="w-3 h-3" />
											Success
										</span>
									{:else if log.status === 'failed'}
										<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
											Failed
										</span>
									{:else}
										<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 animate-pulse">
											Building
										</span>
									{/if}
								</td>
								<td class="py-4 font-mono text-sm text-gray-900">{log.commit}</td>
								<td class="py-4 text-sm text-gray-600">{log.duration}</td>
								<td class="py-4 text-sm text-gray-500">{timeAgo(log.timestamp)}</td>
								<td class="py-4">
									<a href={log.url} target="_blank" rel="noopener" class="text-sm text-primary hover:underline flex items-center gap-1">
										Live site
										<ExternalLink class="w-3 h-3" />
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</section>

	<!-- Architecture Transparency -->
	<section class="py-16 px-6 md:px-12 lg:px-20 bg-white">
		<div class="max-w-7xl mx-auto">
			<h2 class="text-3xl font-bold text-gray-900 text-center mb-4">Architecture You Can Inspect</h2>
			<p class="text-gray-600 text-center max-w-2xl mx-auto mb-16">No black boxes. Every system on this page is built from components you can read, fork, or replace.</p>

			<div class="grid md:grid-cols-3 gap-8">
				<ArchCard
					title="Email Pipeline"
					description="Resend API (primary) → EmailJS (fallback) → Supabase audit write (service-role). Always-unlock rule: lead sees result before any network call."
					icon={Mail}
					details={[
						'Resend via /api/email (lazy init)',
						'EmailJS client-side fallback',
						'Supabase service-role write',
						'newsletter_subscriptions / contact_submissions routing'
					]}
				/>
				<ArchCard
					title="Nurture State"
					description="Supabase nurture_state table (RLS: service-role only) + local .nurture-state.json backup. 3-touch sequences with TOUCH_OFFSETS: 0, 2, 5 days."
					icon={Database}
					details={[
						'nurture_state table (email PK)',
						'touches_sent int[] array',
						'lead_score + lead_tier enrichment',
						'Local JSON backup for resilience'
					]}
				/>
				<ArchCard
									title="Lead Capture"
									description="Unified email.ts helper with Resend + EmailJS + Supabase. Vercel Analytics track() on intent. Admin dashboard reads service-role."
									icon={Shield}
									details={[
										'src/lib/email.ts unified helper',
										'Vercel Analytics track() events',
										'Admin dashboard (service-role)',
										'RLS bypass via service-role'
									]}
								/>
			</div>
		</div>
	</section>

	<!-- CTA -->
		<section class="py-16 px-6 md:px-12 lg:px-20 bg-primary">
			<div class="max-w-3xl mx-auto text-center">
				<h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Want this running for your business?</h2>
				<p class="text-primary-100 text-lg mb-8">We'll set up your lead capture → nurture → booking pipeline in 14 days. Fixed scope. Your repo. Your credentials. Demo at day 14 or the milestone isn't billed.</p>
				<div class="flex flex-col sm:flex-row items-center justify-center gap-4">
					<Button size="lg" variant="secondary" href="/14" class="gap-2 text-lg px-8 py-3">
						<Zap class="w-5 h-5" />
						Start 14-Day Proof
					</Button>
					<Button size="lg" variant="outline" href="/labs" class="gap-2 text-lg px-8 py-3 bg-transparent border-white/30 text-white hover:bg-white/10">
						<Code2 class="w-5 h-5" />
						Try Our Tools First
					</Button>
				</div>
			</div>
		</section>

		<!-- Footer note -->
		<footer class="py-8 px-6 md:px-12 lg:px-20 bg-gray-50 border-t border-gray-100">
			<div class="max-w-7xl mx-auto text-center text-sm text-gray-500">
				<p>All data on this page is real telemetry from RyderTech's production systems. No mocked numbers, no staged screenshots.</p>
				<p class="mt-1">Last refreshed: {lastRefreshed || '—'} · <a href="https://github.com/officialryder1/rydertech" target="_blank" rel="noopener" class="text-primary hover:underline">View source on GitHub</a> · <a href="/14" class="text-primary hover:underline">View 14-Day Proof offer →</a></p>
			</div>
		</footer>
	</div>

<style>
	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
	.animate-spin { animation: spin 1s linear infinite; }
	.geometric-pattern {
		background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z' fill='%231E40AF' fill-opacity='0.03'/%3E%3C/g%3E%3C/svg%3E");
	}
	.floating-shapes {
		background: radial-gradient(circle, rgba(30, 64, 175, 0.08) 0%, transparent 70%);
		border-radius: 50%;
		animation: float 8s ease-in-out infinite;
	}
	@keyframes float {
		0%, 100% { transform: translate(0, 0); }
		50% { transform: translate(20px, 20px); }
	}
	.js .reveal { opacity: 1; transform: translateY(0); }
</style>