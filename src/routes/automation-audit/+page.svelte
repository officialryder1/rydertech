<script lang="ts">
	/**
	 * /automation-audit — RyderTech "90-Day Automation Audit" campaign landing page.
	 *
	 * Brand: premium dark (#0A0A0F base), cyan #06B6D4 + gold #D4AF37 accents,
	 * Playfair Display headers + Roboto body (self-hosted below, no external request).
	 *
	 * UTM: all utm_* params plus ?campaign= are captured and carried into the lead
	 * payload as lead_source. The value is forwarded to the calculator so the same
	 * attribution rides on both the calculator lead and the booking link.
	 */
	import AutomationAuditCalculator from '$lib/components/AutomationAuditCalculator.svelte';
	import SEOMeta from '$lib/components/SEOMeta.svelte';
	import { env } from '$env/dynamic/public';
	import { page } from '$app/stores';
	import {
		UserRoundX,
		Table2,
		FileInput,
		EyeOff,
		TrendingUp,
		UsersRound,
		Award,
		ArrowRight,
		Quote,
		Star,
		ShieldCheck,
		Clock,
		Download,
		Zap,
		Sparkles
	} from '@lucide/svelte';
	import type { EngineResult } from '$lib/opsDrain';

	// ---- UTM / campaign attribution -------------------------------------------
	const params = $page.url.searchParams;
	const utmSource = params.get('utm_source');
	const utmMedium = params.get('utm_medium');
	const utmCampaign = params.get('campaign') ?? params.get('utm_campaign');
	const utmContent = params.get('utm_content');
	const utmTerm = params.get('utm_term');

	const leadSource = [
		'campaign:automation-audit',
		utmCampaign ? `utm_campaign:${utmCampaign}` : '',
		utmSource ? `utm_source:${utmSource}` : '',
		utmMedium ? `utm_medium:${utmMedium}` : '',
		utmContent ? `utm_content:${utmContent}` : '',
		utmTerm ? `utm_term:${utmTerm}` : ''
	]
		.filter(Boolean)
		.join('|');

	const bookingUrl = $derived.by(() => {
		const base = env.PUBLIC_BOOKING_URL || '/contact';
		const sep = base.includes('?') ? '&' : '?';
		return `${base}${sep}tool=automation-audit&lead_source=${encodeURIComponent(leadSource)}`;
	});

	// ---- Live calculator result (drives the value-stack + final CTA numbers) --
	let result = $state<EngineResult | null>(null);
	const money = (n: number) => '₦' + Math.round(n).toLocaleString('en-US');
	const livePayback = $derived(result?.paybackMonths ?? null);
	const liveAnnual = $derived(result ? result.recoverableAnnualCost : 0);

	// ---- Content --------------------------------------------------------------
	const painPoints = [
		{
			icon: UserRoundX,
			title: 'Manual Check-In',
			body: 'Every gate agent and front-desk staffer you pay is a cost you automate away.',
			stat: 'Gym owners lose ₦180K/mo to manual check-in errors and walk-aways.'
		},
		{
			icon: Table2,
			title: 'Spreadsheet Scheduling',
			body: 'Double-bookings, no-shows, and 10+ hours a week of pure admin overhead.',
			stat: 'The average ops manager spends 14 hrs/week reconciling calendars.'
		},
		{
			icon: FileInput,
			title: 'Data Entry & Reconciliation',
			body: 'Humans make errors. Systems do not — and they never call in sick.',
			stat: 'Manual entry runs a 1–4% error rate. On 10,000 rows, that is 400 mistakes.'
		},
		{
			icon: EyeOff,
			title: 'No Real-Time Visibility',
			body: 'You cannot fix what you cannot see. Decisions made on last week\u2019s spreadsheet.',
			stat: 'Ops leaders report 5–9 days of reporting lag before a problem surfaces.'
		},
		{
			icon: TrendingUp,
			title: 'Scaling Bottlenecks',
			body: 'Growth should not mean hiring three more admins to keep the lights on.',
			stat: 'Headcount typically grows faster than revenue during manual scale-up.'
		}
	];

	const comparisonRows = [
		{ metric: 'Time per check-in', manual: '45–90 sec + queue', auto: '0.4 sec, self-serve' },
		{ metric: 'Staff required', manual: '12 gate agents', auto: '0 — attendees self-scan' },
		{ metric: 'Error / fraud rate', manual: 'Duplicate + fake entries', auto: '0 — cryptographic QR' },
		{ metric: 'Reporting', manual: 'Manual count, next morning', auto: 'Real-time dashboard' },
		{ metric: 'Monthly staff cost', manual: '₦1.4M+', auto: '₦60K platform run cost' }
	];

	const testimonials = [
		{
			quote:
				'We went from 12 gate agents to 0. Attendees scan and walk in. 0.4 seconds. The queue that used to snake out of the venue simply stopped existing.',
			name: 'Event Director',
			location: 'Lagos',
			project: 'Veripasshub'
		},
		{
			quote:
				'I used to spend 3 hours a day on member management. Now it is automated — billing, check-in, audit logs. I focus on training my clients.',
			name: 'Gym Owner',
			location: 'Abuja',
			project: 'Gym House'
		},
		{
			quote:
				'Our invoicing went from 2 days to 2 minutes. Honestly, the calculator was not wrong — it was conservative.',
			name: 'COO',
			location: 'Logistics Firm',
			project: 'RyderTech Automation'
		}
	];

	const logos = ['Veripasshub', 'Gym House', 'RyderTech'];

	function handleResult(r: EngineResult) {
		result = r;
	}
</script>

<SEOMeta
	data={{
		title: 'Automation Audit — How Much Is Manual Work Costing You Every Month? | RyderTech',
		description:
			'Most businesses do not need AI agents — they need automation that pays for itself in 90 days. Calculate your ops drain in naira, see your payback period, and book a free automation audit call.',
		canonical: 'https://rydertech.ng/automation-audit',
		keywords: [
			'automation audit',
			'ops drain calculator',
			'automation ROI Nigeria',
			'business process automation',
			'90-day payback automation'
		]
	}}
/>

<div
	class="campaign-dark min-h-screen bg-[#0A0A0F] font-roboto text-gray-200 antialiased selection:bg-[#06B6D4]/30 selection:text-white"
>
	<!-- ============================= HERO ============================= -->
	<section class="relative overflow-hidden border-b border-white/5">
		<!-- ambient brand glow -->
		<div class="pointer-events-none absolute inset-0" aria-hidden="true">
			<div
				class="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-[#06B6D4]/12 blur-[120px] max-sm:hidden"
			></div>
			<div
				class="absolute -right-20 top-20 h-80 w-80 rounded-full bg-[#D4AF37]/10 blur-[120px] max-sm:hidden"
			></div>
			<div
				class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#06B6D4]/60 to-transparent"
			></div>
		</div>

		<div class="relative container mx-auto max-w-5xl px-4 py-20 text-center md:py-28">
			<div
				class="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-1.5 text-xs font-medium tracking-wide text-[#D4AF37] uppercase"
			>
				<Sparkles class="h-3.5 w-3.5" />
				The 90-Day Automation Audit
			</div>

			<h1 class="font-playfair text-4xl leading-tight font-bold text-white md:text-6xl md:leading-[1.1]">
				How Much Is Manual Work<br class="hidden sm:block" />
				Costing You <span class="text-[#06B6D4]">Every Month?</span>
			</h1>

			<p class="mx-auto mt-6 max-w-2xl text-lg text-gray-400 md:text-xl">
				Answer a few questions. Get your automation ROI in 30 seconds — in naira, not vague promises.
			</p>

			<div class="mt-10 flex flex-col items-center gap-4">
				<a
					href="#calculator"
					class="group inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-8 py-4 text-base font-semibold text-[#0A0A0F] shadow-lg shadow-[#D4AF37]/20 transition hover:bg-[#E5C14F] hover:shadow-[#D4AF37]/30"
				>
					Calculate My Ops Drain
					<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
				</a>
				<p class="text-sm text-gray-500">No email required. No sales call. Just your numbers.</p>
			</div>

			<div class="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-gray-500">
				<span class="flex items-center gap-1.5"
					><ShieldCheck class="h-3.5 w-3.5 text-[#06B6D4]" /> 50,000+ verified attendee records</span
				>
				<span class="flex items-center gap-1.5"
					><Clock class="h-3.5 w-3.5 text-[#06B6D4]" /> 0.4s QR check-in in production</span
				>
				<span class="flex items-center gap-1.5"
					><Zap class="h-3.5 w-3.5 text-[#06B6D4]" /> Built and shipped by RyderTech</span
				>
			</div>
		</div>
	</section>

	<!-- ========================= PAIN POINTS ========================= -->
	<section class="container mx-auto max-w-6xl px-4 py-20">
		<div class="mx-auto mb-14 max-w-2xl text-center">
			<h2 class="font-playfair text-3xl font-bold text-white md:text-4xl">
				The 5 Silent Profit Killers in Your Operations
			</h2>
			<p class="mt-4 text-gray-400">
				None of these look expensive on their own. Add them up and you are funding a salary that produces
				nothing.
			</p>
		</div>

		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each painPoints as point}
				{@const Icon = point.icon}
				<div
					class="group relative rounded-xl border border-white/8 bg-white/[0.02] p-6 transition hover:border-[#06B6D4]/40 hover:bg-white/[0.04]"
				>
					<div
						class="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#06B6D4]/20 bg-[#06B6D4]/10 text-[#06B6D4]"
					>
						<Icon class="h-5 w-5" />
					</div>
					<h3 class="text-lg font-semibold text-white">{point.title}</h3>
					<p class="mt-2 text-sm leading-relaxed text-gray-400">{point.body}</p>
					<p class="mt-4 border-t border-white/5 pt-3 text-xs text-[#D4AF37]">{point.stat}</p>
				</div>
			{/each}

			<div
				class="flex flex-col justify-center rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-6"
			>
				<p class="font-playfair text-2xl font-bold text-[#D4AF37]">10–30+ hours a week.</p>
				<p class="mt-2 text-sm text-gray-400">
					That is what we recover from most businesses we audit — before a single AI agent enters the
					picture.
				</p>
			</div>
		</div>
	</section>

	<!-- ====================== CALCULATOR EMBED ====================== -->
	<section id="calculator" class="scroll-mt-20 border-y border-white/5 bg-[#0D0D14]">
		<div class="container mx-auto max-w-6xl px-4 py-20">
			<div class="mx-auto mb-12 max-w-2xl text-center">
				<div
					class="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400"
				>
					Step 1 — Run the numbers
				</div>
				<h2 class="font-playfair text-3xl font-bold text-white md:text-4xl">
					Your Ops Drain, <span class="text-[#06B6D4]">Calculated</span>
				</h2>
				<p class="mt-4 text-gray-400">
					Pre-filled with the processes we see most. Change any number and the payback updates instantly.
				</p>
			</div>

			<AutomationAuditCalculator {leadSource} onResult={handleResult} />
		</div>
	</section>

	<!-- ======================= VALUE STACKING ======================= -->
	<section class="container mx-auto max-w-6xl px-4 py-20">
		<div class="mx-auto mb-14 max-w-2xl text-center">
			<h2 class="font-playfair text-3xl font-bold text-white md:text-4xl">
				What Automation Actually Looks Like
			</h2>
			<p class="mt-4 text-gray-400">
				Not theory. These are running production systems, measured.
			</p>
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			<!-- Manual -->
			<div class="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-6 md:p-8">
				<div class="mb-6 flex items-center gap-2">
					<span class="h-2 w-2 rounded-full bg-red-400"></span>
					<h3 class="text-lg font-semibold tracking-wide text-red-400 uppercase">Manual process</h3>
				</div>
				<dl class="space-y-4">
					{#each comparisonRows as row}
						<div class="flex flex-col gap-1 border-b border-red-500/10 pb-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
							<dt class="text-xs tracking-wide text-gray-500 uppercase">{row.metric}</dt>
							<dd class="text-sm font-medium text-red-300 sm:text-right">{row.manual}</dd>
						</div>
					{/each}
				</dl>
			</div>

			<!-- Automated -->
			<div class="rounded-xl border border-[#06B6D4]/25 bg-[#06B6D4]/[0.05] p-6 md:p-8">
				<div class="mb-6 flex items-center gap-2">
					<span class="h-2 w-2 rounded-full bg-[#06B6D4]"></span>
					<h3 class="text-lg font-semibold tracking-wide text-[#06B6D4] uppercase">
						Automated process
					</h3>
				</div>
				<dl class="space-y-4">
					{#each comparisonRows as row}
						<div class="flex flex-col gap-1 border-b border-[#06B6D4]/10 pb-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
							<dt class="text-xs tracking-wide text-gray-500 uppercase">{row.metric}</dt>
							<dd class="text-sm font-medium text-[#7DE3F5] sm:text-right">{row.auto}</dd>
						</div>
					{/each}
				</dl>
			</div>
		</div>

		<!-- Proof examples -->
		<div class="mt-6 grid gap-4 md:grid-cols-2">
			<div class="rounded-xl border border-white/8 bg-white/[0.02] p-6">
				<div class="flex items-start justify-between gap-3">
					<h4 class="text-base font-semibold text-white">Veripasshub — event access control</h4>
					<span class="shrink-0 rounded bg-[#06B6D4]/10 px-2 py-0.5 text-[10px] text-[#06B6D4]"
						>Production</span
					>
				</div>
				<p class="mt-3 text-sm text-gray-400">
					50,000+ attendees checked in with 0.4s response time. Zero manual gate staff required.
				</p>
				<div class="mt-5 flex gap-6">
					<div>
						<p class="font-playfair text-2xl font-bold text-white">50K+</p>
						<p class="text-xs text-gray-500">verified records</p>
					</div>
					<div>
						<p class="font-playfair text-2xl font-bold text-[#06B6D4]">0.4s</p>
						<p class="text-xs text-gray-500">check-in response</p>
					</div>
					<div>
						<p class="font-playfair text-2xl font-bold text-[#D4AF37]">0</p>
						<p class="text-xs text-gray-500">gate staff needed</p>
					</div>
				</div>
			</div>

			<div class="rounded-xl border border-white/8 bg-white/[0.02] p-6">
				<div class="flex items-start justify-between gap-3">
					<h4 class="text-base font-semibold text-white">Gym House — gym SaaS platform</h4>
					<span class="shrink-0 rounded bg-[#06B6D4]/10 px-2 py-0.5 text-[10px] text-[#06B6D4]"
						>Production</span
					>
				</div>
				<p class="mt-3 text-sm text-gray-400">
					Gym owners manage 500+ members with zero full-time admin staff. Automated billing, check-in,
					and audit logs.
				</p>
				<div class="mt-5 flex gap-6">
					<div>
						<p class="font-playfair text-2xl font-bold text-white">500+</p>
						<p class="text-xs text-gray-500">members managed</p>
					</div>
					<div>
						<p class="font-playfair text-2xl font-bold text-[#06B6D4]">0</p>
						<p class="text-xs text-gray-500">full-time admins</p>
					</div>
					<div>
						<p class="font-playfair text-2xl font-bold text-[#D4AF37]">100%</p>
						<p class="text-xs text-gray-500">billing automated</p>
					</div>
				</div>
			</div>
		</div>

		{#if result && liveAnnual > 0}
			<div
				class="mt-6 rounded-xl border border-[#D4AF37]/25 bg-[#D4AF37]/[0.06] p-6 text-center"
			>
				<p class="text-xs tracking-wide text-gray-400 uppercase">Based on your numbers above</p>
				<p class="font-playfair mt-2 text-3xl font-bold text-[#D4AF37]">
					{money(liveAnnual)}
					<span class="text-base font-normal text-gray-400">recoverable per year</span>
				</p>
				{#if livePayback !== null}
					<p class="mt-1 text-sm text-gray-400">
						Automation pays for itself in {livePayback} months.
					</p>
				{/if}
			</div>
		{/if}
	</section>

	<!-- ======================== SOCIAL PROOF ======================== -->
	<section class="border-y border-white/5 bg-[#0D0D14]">
		<div class="container mx-auto max-w-6xl px-4 py-20">
			<div class="mx-auto mb-12 max-w-2xl text-center">
				<h2 class="font-playfair text-3xl font-bold text-white md:text-4xl">
					Real Operations. Real Numbers.
				</h2>
			</div>

			<div class="grid gap-4 md:grid-cols-3">
				{#each testimonials as t}
					<figure class="flex flex-col rounded-xl border border-white/8 bg-white/[0.02] p-6">
						<Quote class="mb-4 h-6 w-6 shrink-0 text-[#D4AF37]/60" />
						<blockquote class="flex-1 text-sm leading-relaxed text-gray-300">
							{t.quote}
						</blockquote>
						<figcaption class="mt-5 border-t border-white/5 pt-4">
							<div class="flex items-center gap-0.5 text-[#D4AF37]">
								{#each Array(5) as _}
									<Star class="h-3 w-3 fill-current" />
								{/each}
							</div>
							<p class="mt-2 text-sm font-semibold text-white">{t.name}</p>
							<p class="text-xs text-gray-500">{t.location} · {t.project}</p>
						</figcaption>
					</figure>
				{/each}
			</div>

			<!-- Logo strip -->
			<div class="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
				{#each logos as logo}
					<span
						class="font-playfair text-lg font-bold tracking-wide text-gray-600 transition hover:text-gray-300"
						>{logo}</span
					>
				{/each}
			</div>
		</div>
	</section>

	<!-- ========================== FINAL CTA ========================= -->
	<section id="book" class="relative scroll-mt-20 overflow-hidden">
		<div class="pointer-events-none absolute inset-0" aria-hidden="true">
			<div class="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[#06B6D4]/12 blur-[120px] max-sm:hidden"></div>
			<div class="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-[#D4AF37]/10 blur-[100px] max-sm:hidden"></div>
		</div>

		<div class="relative container mx-auto max-w-3xl px-4 py-24 text-center">
			<div
				class="mb-6 inline-flex items-center gap-2 rounded-full border border-[#06B6D4]/30 bg-[#06B6D4]/10 px-4 py-1.5 text-xs font-medium tracking-wide text-[#06B6D4] uppercase"
			>
				<Award class="h-3.5 w-3.5" />
				Free · 20 minutes · No obligation
			</div>

			<h2 class="font-playfair text-3xl leading-tight font-bold text-white md:text-5xl">
				Your 90-Day Payback <span class="text-[#D4AF37]">Starts Here</span>
			</h2>

			<p class="mx-auto mt-6 max-w-xl text-lg text-gray-400">
				Book a free 20-minute automation audit call. We will map your top 3 automation opportunities and
				project your ROI — before you spend a naira.
			</p>

			<div class="mt-10 flex flex-col items-center gap-5">
				<a
					href={bookingUrl}
					target={bookingUrl.startsWith('http') ? '_blank' : undefined}
					rel={bookingUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
					class="group inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-8 py-4 text-base font-semibold text-[#0A0A0F] shadow-lg shadow-[#D4AF37]/20 transition hover:bg-[#E5C14F]"
				>
					Book My Free Automation Audit Call
					<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
				</a>

				<a
					href="#calculator"
					class="inline-flex items-center gap-2 text-sm text-gray-400 underline decoration-white/20 underline-offset-4 transition hover:text-white"
				>
					<Download class="h-3.5 w-3.5" />
					Or download the Ops Drain Calculator one-pager
				</a>

				<p class="text-xs text-gray-600">No commitment. No obligation. Just clarity.</p>
			</div>

			<!-- Trust row -->
			<div
				class="mt-14 grid gap-6 border-t border-white/5 pt-10 text-left sm:grid-cols-3"
			>
				<div>
					<UsersRound class="mb-3 h-5 w-5 text-[#06B6D4]" />
					<p class="text-sm font-semibold text-white">Built, not consulted</p>
					<p class="mt-1 text-xs text-gray-500">
						We run Veripasshub and Gym House in production. We have shipped what we are recommending.
					</p>
				</div>
				<div>
					<Clock class="mb-3 h-5 w-5 text-[#06B6D4]" />
					<p class="text-sm font-semibold text-white">Payback in 90 days</p>
					<p class="mt-1 text-xs text-gray-500">
						Every build we scope is measured against a payback window. If it does not pay back, we say so.
					</p>
				</div>
				<div>
					<ShieldCheck class="mb-3 h-5 w-5 text-[#06B6D4]" />
					<p class="text-sm font-semibold text-white">Automation first, AI second</p>
					<p class="mt-1 text-xs text-gray-500">
						We fix the workflow before layering AI on it. That is why the gains hold.
					</p>
				</div>
			</div>
		</div>
	</section>
</div>

<style>
	:global(body:has(.campaign-dark)) {
		background-color: #0a0a0f;
	}

	:global(.campaign-dark .font-playfair) {
		font-family: 'Playfair Display', Georgia, serif;
	}

	:global(.campaign-dark) {
		font-family: 'Roboto', system-ui, sans-serif;
	}

	/* Naira glyph is absent from both variable subsets — render it from a system face. */
	:global(.campaign-dark .font-playfair),
	:global(.campaign-dark h1),
	:global(.campaign-dark h2) {
		font-feature-settings: normal;
	}
</style>
