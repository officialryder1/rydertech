<!-- +page.svelte -->
<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import NewsLetterModel from "$lib/components/NewsLetterModel.svelte";
	import { fade } from "svelte/transition";
	import {
		Calculator,
		FileText,
		Timer,
		ScanLine,
		Search,
		Gauge,
		Sparkles,
		Bot,
		Brain,
		Shield,
		LayoutGrid,
		ArrowRight,
		Mail
	} from "@lucide/svelte";

	let showNewsletter = $state(false);

	function handleNewsletterClose() {
		showNewsletter = false;
		localStorage.setItem("rydertech_newsletter_closed", "true");
		setTimeout(() => {
			localStorage.removeItem("rydertech_newsletter_closed");
		}, 7 * 24 * 60 * 60 * 1000);
	}

	async function handleNewsletterSubscribe(email: string) {
		console.log("Subscribing email:", email);
		await new Promise((resolve) => setTimeout(resolve, 1000));
		localStorage.setItem("rydertech_newsletter_subscribed", "true");
	}

	type ToolCard = {
		title: string;
		description: string;
		icon: any;
		href: string;
		action: string;
		category: string;
		new?: boolean;
		comingSoon?: boolean;
	};

	const tools: ToolCard[] = [
		// Security & Compliance
		{
			title: "Q-Day Readiness Score",
			description: "Assess your post-quantum cryptography risk. Get a score, revenue-at-risk estimate, and migration plan.",
			icon: Shield,
			href: "/labs/q-day-readiness",
			action: "Assess My Risk",
			category: "Security",
			new: true
		},
		{
			title: "Event Access Risk Scanner",
			description: "See how long your event gate backs up, how many guests slip in free, and what it costs — with a live QR demo.",
			icon: ScanLine,
			href: "/labs/event-access-risk",
			action: "Scan My Risk",
			category: "Security"
		},
		{
			title: "ClauseScan — Contract Risk",
			description: "Paste a contract for an instant AI risk score and the worst clauses in plain English.",
			icon: ScanLine,
			href: "/labs/clausescan",
			action: "Scan My Contract",
			category: "Legal AI"
		},
		// Revenue & Growth
		{
			title: "RevLeak Auditor",
			description: "Calculate how much revenue your slow website leaks every month from lost conversions.",
			icon: Gauge,
			href: "/labs/revleak",
			action: "Audit My Leak",
			category: "Revenue"
		},
		{
			title: "Local Visibility Audit",
			description: "Score how findable your business is on Google — and what missing customers cost you.",
			icon: Search,
			href: "/labs/visibility",
			action: "Audit My Visibility",
			category: "Local SEO"
		},
		{
			title: "AI Search Readiness Audit",
			description: "Score how likely AI answer engines are to cite you instead of a competitor.",
			icon: Sparkles,
			href: "/labs/aeo-readiness",
			action: "Check My AEO",
			category: "AEO / GEO"
		},
		{
			title: "Nigerian Payment Gateway Calculator",
			description: "Compare processing fees, settlement speeds, and costs across Paystack, Monnify, Flutterwave.",
			icon: Calculator,
			href: "/labs/gateway-calc",
			action: "Calculate Fees",
			category: "Fintech"
		},
		{
			title: "Finance Tracker",
			description: "Track and analyze your personal or business finances with AI-powered insights.",
			icon: Brain,
			href: "https://flow-spense.pages.dev/",
			action: "Track Finances",
			category: "External"
		},
		// Planning & Analysis
		{
			title: "Website Cost Estimator",
			description: "Get a rough estimate of what it would cost to build your website based on your idea.",
			icon: Calculator,
			href: "/labs/cost-estimator",
			action: "Estimate Cost",
			category: "Planning"
		},
		{
			title: "Website Copy Analyzer",
			description: "Analyze your homepage copy and get AI-powered feedback on clarity and conversion.",
			icon: FileText,
			href: "/labs/website-rater",
			action: "Analyze Copy",
			category: "AI Review"
		},
		{
			title: "Ops Drain Calculator",
			description: "Calculate what your manual processes cost per year and how fast automation pays.",
			icon: Timer,
			href: "/labs/ops-drain",
			action: "Calculate Drain",
			category: "Automation"
		},
		{
			title: "Agentic Workflow Cost",
			description: "Calculate what WhatsApp orders, M-Pesa reconciliation, and invoice chasing cost — and how an AI agent pays for itself.",
			icon: Bot,
			href: "/labs/agentic-workflow-cost",
			action: "Calculate Savings",
			category: "Automation",
			new: true
		},
		// AI Tools
		{
			title: "AI Headline Studio",
			description: "Generate viral headline variants using proven copywriting formulas.",
			icon: Sparkles,
			href: "/labs/headline-studio",
			action: "Generate Headlines",
			category: "AI Copywriting"
		},
		{
			title: "AI Content Repurposer",
			description: "Turn one blog post into LinkedIn posts, Twitter threads, newsletters, and TikTok scripts.",
			icon: FileText,
			href: "/labs/content-repurposer",
			action: "Repurpose Content",
			category: "AI Content"
		},
		{
			title: "GPT-6 Readiness Checker",
			description: "Score how ready your business is for autonomous AI agents.",
			icon: Bot,
			href: "/labs/gpt-6-checker",
			action: "Check Readiness",
			category: "AI Agents"
		},
		// Coming soon
		{
			title: "MVP Feature Planner",
			description: "Prioritize features for your app or product MVP with AI-powered recommendations.",
			icon: LayoutGrid,
			href: "#",
			action: "Notify Me",
			category: "Planning",
			comingSoon: true
		}
	];

	// Group tools by category
	const categories = [
		{ id: "security", name: "Security & Compliance", catFilter: ["Security"] },
		{ id: "revenue", name: "Revenue & Growth", catFilter: ["Revenue", "Local SEO", "AEO / GEO", "Fintech", "External"] },
		{ id: "planning", name: "Planning & Analysis", catFilter: ["Planning", "AI Review", "Automation"] },
		{ id: "ai", name: "AI Tools", catFilter: ["AI Copywriting", "AI Content", "AI Agents", "Legal AI"] }
	];

	const groupedTools = $state(
		categories.map((cat) => ({
			id: cat.id,
			name: cat.name,
			tools: tools.filter((t) => cat.catFilter.includes(t.category))
		}))
	);

	const freeToolCount = tools.filter((c) => !c.comingSoon).length;
</script>

<svelte:head>
	<title>RyderTech Labs — Free AI Tools for Founders</title>
	<meta
		name="description"
		content="Free AI-powered tools by RyderTech to help founders plan, validate, and build better digital products. Cost estimators, analyzers, and calculators."
	/>
</svelte:head>

<NewsLetterModel show={showNewsletter} onClose={handleNewsletterClose} onSubscribe={handleNewsletterSubscribe} />

<div class="min-h-screen bg-background" transition:fade>
	<!-- Hero -->
	<section class="border-b border-border">
		<div class="mx-auto max-w-5xl px-6 py-20 md:py-28">
			<nav class="mb-12 flex items-center gap-4 text-xs font-medium text-muted-foreground">
				<span class="text-muted-foreground">RyderTech</span>
				<span>/</span>
				<span class="text-foreground">Labs</span>
			</nav>

			<h1 class="text-[2.75rem] leading-tight font-semibold tracking-tight text-foreground md:text-[3.5rem] lg:text-[4rem]">
				Free AI tools to help founders <br />plan, validate, and build faster.
			</h1>

			<p class="mt-6 max-w-2xl text-lg text-muted-foreground">
				Every tool is production-grade, built by our engineers using the same
				standards we bring to client work. No signup. No credit card. Just real answers.
			</p>

			<div class="mt-10 flex gap-4">
				<Button size="lg" class="gap-2" href="#tools">
					Explore Tools
					<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
				</Button>
			</div>
		</div>
	</section>

	<!-- Stats -->
	<section class="border-b border-border">
		<div class="mx-auto max-w-5xl px-6 py-12">
			<div class="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-4">
				<div class="text-center md:text-left">
					<div class="text-3xl font-medium text-foreground">50+</div>
					<div class="text-sm text-muted-foreground">Products shipped</div>
				</div>
				<div class="text-center md:text-left">
					<div class="text-3xl font-medium text-foreground">{freeToolCount}</div>
					<div class="text-sm text-muted-foreground">Free AI tools</div>
				</div>
				<div class="text-center md:text-left">
					<div class="text-3xl font-medium text-foreground">0</div>
					<div class="text-sm text-muted-foreground">Signups required</div>
				</div>
				<div class="text-center md:text-left">
					<div class="text-3xl font-medium text-foreground">24/7</div>
					<div class="text-sm text-muted-foreground">Always available</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Tools by Category -->
	<section id="tools" class="py-16">
		<div class="mx-auto max-w-5xl px-6">
			{#each groupedTools as group}
				<div class="mb-16 last:mb-0">
					<h2 class="mb-8 text-sm font-medium uppercase tracking-wider text-muted-foreground">
						{group.name}
					</h2>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{#each group.tools as tool}
							<a
								href={tool.href}
								class="group relative flex flex-col gap-4 rounded-lg border border-border bg-card p-6 text-decoration-none no-underline transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
							>
								<div class="flex items-start justify-between">
									<div
										class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 group-hover:bg-primary/10"
									>
										<svelte:component this={tool.icon} class="h-5 w-5 text-primary" />
									</div>
									{#if tool.new}
										<span
											class="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-primary text-primary-foreground"
										>
											NEW
										</span>
									{/if}
								</div>
								<div class="flex flex-col gap-1">
									<h3 class="font-medium text-foreground">{tool.title}</h3>
									<p class="text-sm text-muted-foreground">{tool.description}</p>
								</div>
								<div
									class="mt-auto pt-4 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100"
								>
									{tool.action}
								</div>
							</a>
						{/each}

						<!-- Coming soon card -->
						{#if group.name === 'Planning & Analysis'}
							<div class="flex flex-col gap-4 rounded-lg border border-dashed border-border bg-card p-6">
								<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
									<LayoutGrid class="h-5 w-5 text-muted-foreground" />
								</div>
								<div class="flex flex-col gap-1">
									<h3 class="font-medium text-muted-foreground">More Tools Coming</h3>
									<p class="text-sm text-muted-foreground/60">
										We're constantly building new tools to help founders and product teams.
									</p>
								</div>
								<Button variant="ghost" class="mt-auto self-start text-muted-foreground" disabled>
									Subscribe for Updates
								</Button>
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- CTA -->
	<section class="border-t border-border py-16">
		<div class="mx-auto max-w-5xl px-6 text-center">
			<h2 class="mb-4 text-2xl font-medium text-foreground">Need this built for your business?</h2>
			<p class="mx-auto mb-8 max-w-xl text-sm text-muted-foreground">
				These tools showcase our engineering approach. Let's discuss how we can
				apply this expertise to your project.
			</p>
			<div class="flex flex-col gap-4 sm:flex-row justify-center">
				<Button size="lg" class="gap-2 px-8" href="/contact">
					<Mail class="h-4 w-4" />
					Contact RyderTech
				</Button>
				<Button size="lg" variant="outline" class="gap-2" onclick={() => (showNewsletter = true)}>
					Join Labs Newsletter
				</Button>
			</div>
			<p class="mt-6 text-xs text-muted-foreground/60">
				No spam. Just occasional updates about new tools and technical insights.
			</p>
		</div>
	</section>
</div>
