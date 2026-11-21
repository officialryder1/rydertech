<script lang="ts">
	import SEOMeta from '$lib/components/SEOMeta.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import StepCard from '$lib/components/pilot/StepCard.svelte';
	import DeliverableCard from '$lib/components/pilot/DeliverableCard.svelte';
	import PricingCard from '$lib/components/pilot/PricingCard.svelte';
	import {
		Zap,
		CheckCircle,
		GitBranch,
		Lock,
		FileText,
		Shield,
		ArrowRight,
		DollarSign,
		ExternalLink
	} from '@lucide/svelte';

	interface FAQItem {
		question: string;
		answer: string;
	}

	const faqs: FAQItem[] = [
		{
			question: 'What exactly do I get in 14 days?',
			answer: 'A working, deployable slice of your product — one core user flow (e.g., lead capture → nurture → booking, or checkout → webhook → dashboard). Running in your repo, on your infrastructure, with a live demo at day 14.'
		},
		{
			question: 'What happens after the 14-day pilot?',
			answer: 'Three paths: (1) Pilot hits the mark → we scope the full build with the pilot cost credited. (2) Needs iteration → we extend by 7 days at no extra cost. (3) Not a fit → you keep the code, the repo, and the handover pack. No further obligation.'
		},
		{
			question: 'Do I need to commit to a full project upfront?',
			answer: 'No. The pilot is a standalone engagement. You only decide on the full build after seeing the working demo. The pilot fee (₦150k–₦400k) is credited 100% toward the full project if you proceed.'
		},
		{
			question: 'Who owns the code and credentials?',
			answer: 'You. From commit #1 the GitHub repo is in your account. All cloud credentials (Supabase, Vercel, Paystack, etc.) are provisioned in your name. We push to your repo; you can revoke our access anytime.'
		},
		{
			question: "What if the demo isn't ready at day 14?",
			answer: "The milestone isn't billed. We either extend (7 days, no charge) or you walk away with zero cost. We only invoice when the agreed scope is demonstrably working in your environment."
		},
		{
			question: 'What stacks do you support?',
			answer: 'Our default: SvelteKit 5 + Tailwind + Supabase (PostgreSQL + Auth + Realtime) + Vercel. We also work in Next.js, Node/FastAPI, and Flutter. If your stack differs, we\'ll flag it in the scoping call.'
		},
		{
			question: 'How do you define scope for the pilot?',
			answer: 'We agree on exactly ONE user journey with 3–5 acceptance criteria before day 1. Example: "Anonymous visitor → fills form → receives personalized email → sees dashboard with their data." No vague "build an MVP" — a testable slice.'
		}
	];

	const faqJson = JSON.stringify(
		{
			'@context': 'https://schema.org',
			'@type': 'FAQPage',
			mainEntity: faqs.map((item) => ({
				'@type': 'Question',
				name: item.question,
				acceptedAnswer: { '@type': 'Answer', text: item.answer }
			}))
		},
		null,
		2
	).replace(/</g, '\\u003c');
</script>

<SEOMeta
	data={{
		title: '14-Day Proof — RyderTech',
		description: 'Fixed-scope paid pilot: we build a working slice of your product in your repo in 14 days. Demo at day 14 or the milestone isn\'t billed. ₦150k–₦400k credited toward full build.',
		canonical: 'https://www.rydertech.ng/14'
	}}
/>

<svelte:head>
	<script type="application/ld+json">
		{faqJson}
	</script>
</svelte:head>

<div class="min-h-screen bg-white">
	<!-- Hero -->
	<section class="relative pt-20 pb-16 px-6 md:px-12 lg:px-20 overflow-hidden">
		<div class="max-w-7xl mx-auto">
			<div class="text-center max-w-3xl mx-auto">
				<div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
					<Zap class="w-4 h-4" />
					<span>14-Day Proof — Fixed Scope • Your Repo • Your Credentials</span>
				</div>
				<h1 class="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
					We build a working slice of <span class="text-primary">your product</span> in 14 days
				</h1>
				<p class="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
					No vague proposals. No upfront commitment to a full project. One core user flow — running in your repo, on your infra, demo at day 14. If it's not working, you don't pay.
				</p>
				<div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
					<Button size="lg" variant="default" href="/contact" class="gap-2 text-lg px-8 py-3">
						<Zap class="w-5 h-5" />
						Start My 14-Day Proof
					</Button>
					<Button size="lg" variant="outline" href="/proof" class="gap-2 text-lg px-8 py-3">
						<ExternalLink class="w-5 h-5" />
						See Our Live Systems First
					</Button>
				</div>
				<div class="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
					<div class="flex items-center gap-1.5"><CheckCircle class="w-4 h-4 text-green-500" /> Demo at day 14 or no bill</div>
					<div class="flex items-center gap-1.5"><GitBranch class="w-4 h-4 text-green-500" /> Your repo from commit #1</div>
					<div class="flex items-center gap-1.5"><Lock class="w-4 h-4 text-green-500" /> Your credentials</div>
					<div class="flex items-center gap-1.5"><DollarSign class="w-4 h-4 text-green-500" /> ₦150k–₦400k credited</div>
				</div>
			</div>
		</div>
	</section>

	<!-- How It Works -->
	<section class="py-16 px-6 md:px-12 lg:px-20 bg-gray-50">
		<div class="max-w-7xl mx-auto">
			<div class="text-center max-w-2xl mx-auto mb-16">
				<h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How the 14-Day Proof works</h2>
				<p class="text-gray-600">Four steps. Zero surprises. You approve scope before we write a line of code.</p>
			</div>

			<div class="grid md:grid-cols-4 gap-6">
				<StepCard
					step="01"
					title="Scope Call (30 min)"
					description="We agree on exactly ONE user journey with 3–5 testable acceptance criteria. Fixed price. Fixed timeline."
					icon={FileText}
				/>
				<StepCard
					step="02"
					title="Repo & Infra Setup (Day 1–2)"
					description="We create the repo in your GitHub, provision Supabase/Vercel in your account, scaffold the stack."
					icon={GitBranch}
				/>
				<StepCard
					step="03"
					title="Build & Daily Syncs (Day 3–13)"
					description="We build the agreed flow. You get a daily 2-min Loom + commit log. No black box — you see progress in real time."
					icon={Zap}
				/>
				<StepCard
					step="04"
					title="Demo & Handover (Day 14)"
					description="Live demo against acceptance criteria. You get: working code, handover pack (arch, runbook, env map), credentials. Invoice only if it passes."
					icon={CheckCircle}
				/>
			</div>
		</div>
	</section>

	<!-- What You Get -->
	<section class="py-16 px-6 md:px-12 lg:px-20 bg-white">
		<div class="max-w-7xl mx-auto">
			<div class="text-center max-w-2xl mx-auto mb-16">
				<h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What you walk away with</h2>
				<p class="text-gray-600">Regardless of whether you continue, the pilot delivers a complete, auditable asset.</p>
			</div>

			<div class="grid md:grid-cols-3 gap-8">
				<DeliverableCard
					title="Working Code"
					description="One complete user flow — typed, tested, deployed. Not a prototype. Runs on your Vercel, reads/writes your Supabase."
					icon={Zap}
					items={['Feature branch + PR in your repo', 'TypeScript + Zod validation', 'Unit + integration tests', 'Deployed to your Vercel preview']}
				/>
				<DeliverableCard
					title="Handover Pack"
					description='Everything another developer needs to take over. No hostage-taking. No "only the original dev understands this."'
					icon={FileText}
					items={['Architecture diagram (Mermaid)', 'Runbook: deploy, rollback, scale', 'Environment variable map', 'Supabase schema + RLS policies', 'API contracts (OpenAPI)']}
				/>
				<DeliverableCard
					title="Full Ownership"
					description="Your repo. Your credentials. Your data. You can fire us on day 15 and hand to any dev team."
					icon={Shield}
					items={['GitHub repo in your org', 'Supabase project in your account', 'Vercel project in your account', 'All API keys provisioned in your name', 'Zero vendor lock-in']}
				/>
			</div>
		</div>
	</section>

	<!-- Pricing -->
	<section class="py-16 px-6 md:px-12 lg:px-20 bg-gray-50">
		<div class="max-w-7xl mx-auto">
			<div class="text-center max-w-2xl mx-auto mb-16">
				<h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
				<p class="text-gray-600">Pilot fee credited 100% toward full build if you proceed. No hidden costs.</p>
			</div>

			<div class="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
				<PricingCard
					tier="Focused"
					price="₦150k"
					description="One simple flow, 3–4 screens, single integration"
					features={['Lead capture → email → dashboard', 'Checkout → webhook → order view', 'Form → PDF → email delivery', 'Auth + 1 protected route']}
					cta="Start Focused Pilot"
				/>
				<PricingCard
					tier="Standard"
					price="₦275k"
					description="Core product loop with 2–3 integrations"
					features={['Multi-step onboarding flow', 'Paystack/Flutterwave + webhook', 'Email/SMS notifications', 'Admin dashboard + basic RBAC', 'Supabase RLS + storage']}
					cta="Start Standard Pilot"
					featured
				/>
				<PricingCard
					tier="Advanced"
					price="₦400k"
					description="Complex workflow with external APIs & background jobs"
					features={['WhatsApp Business API integration', 'n8n workflow automation', 'Scheduled jobs + cron', 'Multi-tenant data isolation', 'Audit logging + export']}
					cta="Start Advanced Pilot"
				/>
			</div>

			<div class="text-center mt-12">
				<p class="text-gray-600 mb-4">Not sure which tier? The scoping call (free) will tell us exactly.</p>
				<Button variant="outline" size="lg" href="/contact" class="gap-2">
					<ArrowRight class="w-5 h-5" />
					Book Free Scoping Call
				</Button>
			</div>
		</div>
	</section>

	<!-- FAQ -->
	<section class="py-16 px-6 md:px-12 lg:px-20 bg-white">
		<div class="max-w-3xl mx-auto">
			<h2 class="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">Questions?</h2>

			<div class="space-y-4" id="faq">
				{#each faqs as faq, index}
					<details class="group bg-gray-50 rounded-xl p-6 border border-gray-100 open:border-primary/30 transition-colors">
						<summary class="flex items-center justify-between cursor-pointer list-none font-semibold text-gray-900">
							{faq.question}
							<ArrowRight class="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
						</summary>
						<div class="mt-4 text-gray-600 leading-relaxed">
							{faq.answer}
						</div>
					</details>
				{/each}
			</div>
		</div>
	</section>

	<!-- CTA -->
	<section class="py-16 px-6 md:px-12 lg:px-20 bg-primary">
		<div class="max-w-3xl mx-auto text-center">
			<h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Ready to prove it?</h2>
			<p class="text-primary-100 text-lg mb-8">Book a 30-minute scoping call. We'll define the pilot scope, agree acceptance criteria, and set the day-1 start date. No pressure — just clarity.</p>
			<Button size="lg" variant="secondary" href="/contact" class="gap-2 text-lg px-8 py-3">
				<Zap class="w-5 h-5" />
				Start My 14-Day Proof
			</Button>
		</div>
	</section>

	<footer class="py-8 px-6 md:px-12 lg:px-20 bg-gray-50 border-t border-gray-100">
		<div class="max-w-7xl mx-auto text-center text-sm text-gray-500">
			<p>14-Day Proof — Fixed scope. Your repo. Your credentials. Demo at day 14 or the milestone isn't billed.</p>
			<p class="mt-1"><a href="/proof" class="text-primary hover:underline">See our live systems →</a></p>
		</div>
	</footer>
</div>

<style>
	details summary::-webkit-details-marker { display: none; }
	details summary::marker { display: none; }
</style>