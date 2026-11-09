<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
  import SEOMeta from '$lib/components/SEOMeta.svelte';
  import StructuredData from '$lib/components/StructuredData.svelte';

	import { 
		Search, 
		Sparkles, 
		Loader2, 
		Globe, 
		Star, 
		TrendingUp, 
		AlertCircle, 
		CheckCircle2, 
		RefreshCw,
		Palette,
		Zap,
		Accessibility,
		Search as SearchIcon,
		Layout,
    ArrowLeft,
    Gauge
	} from '@lucide/svelte';
	import { scoreLead } from '$lib/leadScore';
	import { reportFromWebsiteRater, buildShareUrl } from '$lib/shareReport';
	import { supabase } from '$lib/supabaseClient';
	import { env } from '$env/dynamic/public';
	import emailjs from '@emailjs/browser';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { track } from '@vercel/analytics/sveltekit';
	import type { ReviewResult } from '$lib/websiteRaterResults';

	// State
	let url = $state('');
	let loading = $state(false);
	let error = $state('');
	let review = $state<any>(null);
  let reviewedUrl = $state('');
	let email = $state('');
	let company = $state('');
	let isSubmitting = $state(false);
	let unlocked = $state(false);
	let leadError = $state<string | null>(null);

	// Capture lead source from URL params (utm_source, tool)
	const _utmSource = $page.url.searchParams.get('utm_source');
	const _toolParam = $page.url.searchParams.get('tool');
	const leadSource = $derived([
		_utmSource ? `utm:${_utmSource}` : '',
		_toolParam ? `tool:${_toolParam}` : ''
	].filter(Boolean).join('|') || 'direct');

	const categoryIcons: Record<string, any> = {
		design: Palette,
		ux: Layout,
		performance: Zap,
		accessibility: Accessibility,
		seo: SearchIcon
	};

	// Maps a scored category to the RyderTech service that fixes it.
	const categoryNames: Record<string, string> = {
		design: 'Design',
		ux: 'UX',
		performance: 'Performance',
		accessibility: 'Accessibility',
		seo: 'SEO'
	};

	const serviceFixMap: Record<string, { href: string; label: string }> = {
		design: { href: '/services/web-design-in-nigeria', label: 'web design & rebuilds' },
		ux: { href: '/services/web-design-in-nigeria', label: 'UX-focused rebuilds' },
		performance: { href: '/services/web-design-in-nigeria', label: 'speed optimization' },
		accessibility: { href: '/contact', label: 'accessibility remediation' },
		seo: { href: '/services/web-design-in-nigeria', label: 'SEO-ready builds' }
	};

	// Two lowest-scoring categories — the visitor's pain, stated back at them.
	const weakestAreas = $derived(
		review && review.categories
			? Object.entries(review.categories as Record<string, { score: number }>)
					.sort((a, b) => a[1].score - b[1].score)
					.slice(0, 2)
			: []
	);

	const primaryFix = $derived(
		weakestAreas.length > 0 && serviceFixMap[weakestAreas[0][0]]
			? serviceFixMap[weakestAreas[0][0]]
			: { href: '/services/web-design-in-nigeria', label: 'web design & rebuilds' }
	);

  // SEO data based on state
	const seoData = $derived({
		title: review 
			? `Analysis Results: ${reviewedUrl} - Score: ${review.overallScore}/10`
			: 'Free AI Website Review & Analysis Tool',
		description: review
			? `Website analysis for ${reviewedUrl}: Overall score ${review.overallScore}/10. ${review.summary.slice(0, 150)}...`
			: 'Get a free professional AI-powered review of your website. Analyze design, UX, performance, SEO, and accessibility in seconds.',
		canonical: review ? `https://rydertech.ng/labs/website-rater/analysis?url=${encodeURIComponent(reviewedUrl)}` : 'https://rydertech.ng'
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';
		review = null;
		reviewedUrl = url;

		try {
			const res = await fetch('/api/review', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url })
			});

			const data = await res.json();
			
			if (!data.success) throw new Error(data.error);
			review = data.review;
			try { localStorage.setItem('rydertech_lead_captured', '1'); } catch {}

			// Update URL with query param for shareability
			const newUrl = new URL(window.location.href);
			newUrl.searchParams.set('url', url);
			window.history.pushState({}, '', newUrl);


		} catch (err) {
			error = err instanceof Error ? err.message : 'Something went wrong';
		} finally {
			loading = false;
		}
	}

	function getScoreVariant(score: number): "default" | "secondary" | "destructive" | "outline" {
		if (score >= 8) return 'default'; // Uses primary (blue)
		if (score >= 6) return 'secondary'; // Gold-ish
		return 'destructive';
	}

	function getScoreColor(score: number): string {
		if (score >= 8) return 'text-primary';
		if (score >= 6) return 'text-secondary';
		return 'text-red-500';
	}

	function getScoreBg(score: number): string {
		if (score >= 8) return 'bg-primary/10 border-primary/20';
		if (score >= 6) return 'bg-secondary/10 border-secondary/20';
		return 'bg-red-500/10 border-red-500/20';
	}

  function reset() {
		review = null;
		url = '';
		reviewedUrl = '';
		email = '';
		company = '';
		unlocked = false;
		leadError = null;
		window.history.pushState({}, '', '/');
	}

	async function handleLeadSubmit(e: Event) {
		e.preventDefault();
		leadError = null;
		if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			leadError = 'Please enter a valid email address.';
			return;
		}
		isSubmitting = true;
		try {
			// Always unlock — delivery failure must never block the prospect.
			unlocked = true;
			try {
				localStorage.setItem('rydertech_website_rater_email', email);
				localStorage.setItem('rydertech_lead_captured', '1');
			} catch {}

			// Score the lead: lower review score = hotter lead (bigger gap to fix).
			const healthScore = review ? Math.round((review.overallScore / 10) * 100) : 50;
			const lead = scoreLead({
			tool: 'website_rater',
			impactValue: review ? review.overallScore * 10000 : 0,
			revenueAtRisk: review ? review.overallScore * 10000 : 0,
			healthScore,
			});

			const serviceId = env.PUBLIC_EMAILJS_SERVICE_ID;
			const templateId = env.PUBLIC_EMAILJS_TEMPLATE_ID;
			const publicKey = env.PUBLIC_EMAILJS_PUBLIC_KEY;

			const summaryText = review
				? `Overall score: ${review.overallScore}/10\n\nSummary: ${review.summary}\n\nStrengths:\n${(review.strengths || []).map((s: string) => `- ${s}`).join('\n')}\n\nImprovements:\n${(review.improvements || []).map((i: string) => `- ${i}`).join('\n')}\n\nCategories:\n${Object.entries(review.categories || {}).map(([key, cat]: [string, any]) => `- ${key}: ${cat.score}/10`).join('\n')}`
				: 'No review data available';

			if (serviceId && templateId && publicKey) {
				await emailjs.send(
					serviceId,
					templateId,
					{
						from_name: company || 'Website Rater lead',
						from_email: email,
						company,
						budget: `Review score: ${review?.overallScore}/10`,
						timeline: 'Ready for a website audit',
						message: `New Website Rater result (source: /labs/website-rater). Lead score: ${lead.points}/100 (${lead.tier}).\n\nURL: ${reviewedUrl}\nScore: ${review?.overallScore}/10\nSummary: ${summaryText}`,
						lead_type: 'lead_magnet_website_rater',
						lead_score: lead.points,
						lead_tier: lead.tier,
						lead_source: leadSource
					},
					{ publicKey }
				);
			} else {
				console.warn('EmailJS not configured — website-rater lead not emailed:', email);
			}

			try {
				const { error: dbError } = await supabase
					.from('newsletter_subscriptions')
					.insert([
						{ email, source: 'lead_magnet_website_rater', subscribed_at: new Date().toISOString(), lead_score: lead.points, lead_tier: lead.tier, lead_source: leadSource }
					]);
						if (dbError) { console.error('Lead NOT persisted:', dbError.code, dbError.message, { email }); }
			} catch (dbErr) {
				// Log specifically so missing columns are visible in production logs.
				console.warn('Supabase newsletter_subscriptions insert failed (website-rater lead):', dbErr);
			}
		} catch (err) {
			console.warn('Website Rater lead email failed:', err);
		} finally {
			isSubmitting = false;
		}
	}

	function getReport() {
		if (!review) return;
		const payload = reportFromWebsiteRater(review as ReviewResult, reviewedUrl);
		goto(buildShareUrl(payload));
	}

  // Check for URL param on mount
	$effect(() => {
		const params = new URLSearchParams(window.location.search);
		const urlParam = params.get('url');
		if (urlParam && !review) {
			url = urlParam;
			handleSubmit(new Event('submit'));
		}
	});
</script>

<!-- SEO -->
<SEOMeta data={seoData} />

{#if !review}
	<StructuredData type="WebSite" />
	<StructuredData type="SoftwareApplication" />
{:else}
	<StructuredData 
		type="Review" 
		data={{
			url: reviewedUrl,
			score: review.overallScore,
			summary: review.summary
		}} 
	/>
{/if}

<div class="min-h-screen bg-gradient-to-b from-gray-50 via-white to-blue-50/30">
  <!-- Skip to main content for accessibility -->
	<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded-lg z-50">
		Skip to main content
	</a>

	<!-- Header -->
	<header class="border-b border-primary/10 bg-white/80 backdrop-blur-md sticky top-0 z-50">
		<div class="container mx-auto px-4 h-16 flex items-center justify-between">
			<div class="flex items-center gap-2">
        <a href="/labs" class="flex items-center gap-2 group" aria-label="RyderTech Labs - website rater">
          <div class="w-8 h-8 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center">
            <Sparkles class="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <span class="font-bold text-xl text-primary">RyderTech Labs.</span>
        </a>
			</div>
			<Badge variant="outline" class="border-secondary text-secondary bg-secondary/10">
				AI Powered
			</Badge>
		</div>
	</header>

	<main class="container mx-auto px-4 py-12 max-w-5xl">
    <a href="/labs" class="inline-flex items-center gap-2 mb-6 text-sm text-primary hover:opacity-80 transition-opacity">
      <Button variant="ghost" size="sm" class="gap-2">
        <ArrowLeft class="w-4 h-4" />
        Back to Labs
      </Button>
    </a>
		{#if !review}
			<!-- Hero Section -->
			<div class="text-center mb-12 space-y-4">
				<h1 class="text-4xl md:text-6xl font-bold text-primary">
					Professional Website
					<span class="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">
						Analysis
					</span>
				</h1>
				<p class="text-slate-600 text-lg max-w-2xl mx-auto">
					Get an expert AI-powered review of your website's design, UX, performance, and more.
				</p>
			</div>

			<!-- Input Card -->
			<Card class="max-w-2xl mx-auto border-blue/10 shadow-xl shadow-primary/5">
				<CardHeader class="text-center pb-4">
					<CardTitle class="text-2xl text-primary">Enter Website URL</CardTitle>
					<CardDescription>We'll analyze the site and provide detailed feedback</CardDescription>
				</CardHeader>
				<CardContent>
					<form onsubmit={handleSubmit} class="space-y-4">
						<div class="relative">
							<Globe class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
							<Input
								type="url"
								placeholder="https://example.com"
								bind:value={url}
								required
								class="pl-10 h-12 text-lg border-primary/20 focus:border-primary focus:ring-primary/20 "
							/>
						</div>
						
						{#if error}
							<div class="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
								<AlertCircle class="w-4 h-4" />
								{error}
							</div>
						{/if}

						<Button 
							type="submit" 
							disabled={loading}
							class="w-full h-12 text-primary hover:text-white border border-primary text-lg bg-gradient-to-r from-primary to-primary-light hover:opacity-90 transition-all"
						>
							{#if loading}
								<Loader2 class="w-5 h-5 mr-2 animate-spin" />
								Analyzing...
							{:else}
								<Search class="w-5 h-5 mr-2" />
								Analyze Website
							{/if}
						</Button>
					</form>
				</CardContent>
			</Card>

			<!-- Features -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
				{#each [
					{ icon: Palette, title: 'Design Review', desc: 'Visual aesthetics and branding analysis' },
					{ icon: Zap, title: 'Performance', desc: 'Speed and optimization insights' },
					{ icon: TrendingUp, title: 'SEO & Growth', desc: 'Search visibility recommendations' }
				] as feature}
					<div class="text-center p-6 rounded-xl bg-white border border-primary/5 shadow-sm">
						<div class="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
							{#if feature.title === 'Design Review'}
								<Palette class="w-6 h-6 text-primary" />
							{:else if feature.title === 'Performance'}
								<Zap class="w-6 h-6 text-primary" />
							{:else if feature.title === 'SEO & Growth'}
								<TrendingUp class="w-6 h-6 text-primary" />
							{/if}
						</div>
						<h3 class="font-semibold text-primary mb-2">{feature.title}</h3>
						<p class="text-sm text-slate-600">{feature.desc}</p>
					</div>
				{/each}
			</div>
      <!-- FAQ Section for SEO -->
			<section class="mt-20 max-w-3xl mx-auto" aria-labelledby="faq-heading">
				<h2 id="faq-heading" class="text-2xl font-bold text-primary text-center mb-8">Frequently Asked Questions</h2>
				<div class="space-y-4">
					<details class="group bg-white rounded-lg border border-slate-200 p-4">
						<summary class="font-semibold text-blue-600 cursor-pointer list-none flex justify-between items-center">
							How does the AI website review work?
							<span class="transition group-open:rotate-180">▼</span>
						</summary>
						<p class="mt-2 text-slate-600 text-sm">
							Our AI analyzes your website's HTML, CSS, and structure using Google's Gemini AI to evaluate design, UX, performance, SEO, and accessibility.
						</p>
					</details>
					<details class="group bg-white rounded-lg border border-slate-200 p-4">
						<summary class="font-semibold text-blue-600 cursor-pointer list-none flex justify-between items-center">
							Is this website analysis free?
							<span class="transition group-open:rotate-180">▼</span>
						</summary>
						<p class="mt-2 text-slate-600 text-sm">
							Yes! RyderTech offers free AI-powered website analysis. Get instant feedback on your site's strengths and areas for improvement.
						</p>
					</details>
					<details class="group bg-white rounded-lg border border-slate-200 p-4">
						<summary class="font-semibold text-blue-600 cursor-pointer list-none flex justify-between items-center">
							What metrics do you analyze?
							<span class="transition group-open:rotate-180">▼</span>
						</summary>
						<p class="mt-2 text-slate-600 text-sm">
							We analyze Design (visual appeal), UX (user experience), Performance (speed), Accessibility (WCAG compliance), and SEO (search optimization).
						</p>
					</details>
				</div>
			</section>
		{:else}
			<!-- Results View -->
			<article class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <!-- Navigation -->
				<nav class="flex items-center justify-between">
				<!-- Back Button -->
				<Button 
					variant="ghost" 
					onclick={reset}
					class="text-primary border border-primary hover:text-primary hover:bg-primary/10 transition-colors gap-2"
				>
					<RefreshCw class="w-4 h-4 mr-2" />
					New Analysis
				</Button>

        <div class="flex gap-2">
					<Button
						variant="outline"
						onclick={getReport}
						class="border-primary/20"
					>
						<Gauge class="w-4 h-4 mr-2" aria-hidden="true" />
						Report
					</Button>
				</div>
        </nav>

				<!-- Overall Score Card -->
				<Card class="border-primary/10 overflow-hidden">
					<div class="bg-gradient-to-r from-primary to-primary-light p-8 text-white">
						<div class="flex flex-col md:flex-row items-center justify-between gap-6">
							<div class="text-center md:text-left">
								<h2 class="text-3xl font-bold mb-2">Analysis Complete</h2>
								<p class="text-blue-100 text-sm md:text-base break-all">{reviewedUrl}</p>
							</div>
							<div class="flex items-center gap-4" itemscope itemtype="https://schema.org/Rating">
								<div class="text-center">
									<div class="text-6xl font-bold">{review.overallScore}</div>
									<div class="text-blue-500 text-sm uppercase tracking-wider">Overall Score</div>
                  <meta itemprop="bestRating" content="10" />
								</div>
								<div class="h-16 w-px bg-white/20"></div>
								<div class="text-5xl" aria-label="Rating: {review.overallScore} out of 10">
									{#if review.overallScore >= 8}
										<Star class="w-12 h-12 text-secondary fill-secondary" />
									{:else if review.overallScore >= 6}
										<Star class="w-12 h-12 text-secondary" />
									{:else}
										<AlertCircle class="w-12 h-12 text-red-300" />
									{/if}
								</div>
							</div>
						</div>
					</div>
					<CardContent class="pt-6">
						<p class="text-slate-700 text-lg leading-relaxed text-center max-w-3xl mx-auto">
							{review.summary}
						</p>
					</CardContent>
				</Card>

				<!-- Category Scores Grid -->
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each Object.entries(review.categories) as [key, category]}
						{@const Icon = categoryIcons[key] || Star}
						<Card class="border-2 {getScoreBg(category.score)} transition-all hover:shadow-md">
							<CardHeader class="pb-3">
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-2">
										<div class="p-2 rounded-lg bg-white/50">
											<Icon class="w-5 h-5 {getScoreColor(category.score)}" />
										</div>
										<CardTitle class="text-lg capitalize text-slate-800">{key}</CardTitle>
									</div>
									<Badge variant={getScoreVariant(category.score)} class="text-lg px-3 py-1">
										{category.score}
									</Badge>
								</div>
							</CardHeader>
							<CardContent>
								<p class="text-sm text-slate-600 leading-relaxed">{category.feedback}</p>
							</CardContent>
						</Card>
					{/each}
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<!-- Strengths -->
					<Card class="border-green-200 bg-green-50/50">
						<CardHeader>
							<CardTitle class="flex items-center gap-2 text-green-800">
								<CheckCircle2 class="w-5 h-5" />
								Strengths
							</CardTitle>
						</CardHeader>
						<CardContent>
							<ul class="space-y-3">
								{#each review.strengths as strength}
									<li class="flex items-start gap-3 text-green-900">
										<span class="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"></span>
										<span class="text-sm leading-relaxed">{strength}</span>
									</li>
								{/each}
							</ul>
						</CardContent>
					</Card>

					<!-- Improvements -->
					<Card class="border-secondary/30 bg-secondary/5">
						<CardHeader>
							<CardTitle class="flex items-center gap-2 text-secondary-dark">
								<TrendingUp class="w-5 h-5" />
								Recommendations
							</CardTitle>
						</CardHeader>
						<CardContent>
							<ul class="space-y-3">
								{#each review.improvements as improvement}
									<li class="flex items-start gap-3 text-slate-800">
										<span class="w-1.5 h-1.5 rounded-full bg-secondary mt-2 shrink-0"></span>
										<span class="text-sm leading-relaxed">{improvement}</span>
									</li>
								{/each}
							</ul>
						</CardContent>
					</Card>
				</div>

				<!-- Service bridge + lead capture: unified conversion block -->
								<div class="mt-8 rounded-2xl border border-primary/10 bg-gradient-to-r from-primary via-primary to-primary-dark p-6 md:p-8 text-white">
									<h3 class="text-xl md:text-2xl font-bold mb-2">
										{#if weakestAreas.length > 0}
											Your weakest areas: {weakestAreas.map(([key]) => categoryNames[key] ?? key).join(' & ')}
										{:else}
											Ready to raise your score?
										{/if}
									</h3>
									<p class="text-white/90 text-sm md:text-base mb-5 max-w-2xl">
										These are exactly the areas a targeted rebuild fixes first. RyderTech designs and builds fast, SEO-ready websites for Nigerian businesses — we'll scope the fixes for {reviewedUrl} in one call.
									</p>

									{#if !unlocked}
										<div class="group max-w-md mx-auto space-y-3">
											<form onsubmit={handleLeadSubmit} class="space-y-3">
												<div class="flex flex-col sm:flex-row gap-2">
																					<Input type="text" bind:value={company} placeholder="Company" required class="flex-1" />
																					<Input type="email" bind:value={email} placeholder="you@company.com" required class="flex-1" />
																				</div>
												{#if leadError}
													<p class="text-xs text-red-200 text-center">{leadError}</p>
												{/if}
												<Button type="submit" disabled={isSubmitting} class="w-full bg-white text-primary hover:bg-blue-50 border-0 font-semibold" onclick={() => track('website_rater_bridge_click', { cta: 'fix_my', category: primaryFix.label, url: reviewedUrl })}>
													{isSubmitting ? 'Sending…' : 'Send Me the Fix Plan'}
												</Button>
												<p class="text-center text-xs text-white/70">No spam. Unsubscribe anytime.</p>
											</form>
										</div>
									{:else}
										<div class="text-center pt-4 space-y-4">
											<Button
												variant="outline"
												onclick={() => { track('website_rater_share_report', { url: reviewedUrl, score: review?.overallScore }); getReport(); }}
												class="gap-2 border-white/40 text-white hover:bg-white/10"
											>
												<Gauge class="w-4 h-4 mr-2" />
												Get shareable audit report
											</Button>
											<Button
												size="lg"
												onclick={reset}
												class="bg-white/10 text-white hover:bg-white/20"
											>
												<RefreshCw class="w-5 h-5 mr-2" />
												Analyze Another Website
											</Button>
										</div>
									{/if}
								</div>
				</article>
		{/if}
	</main>

	<!-- Footer -->
	<footer class="border-t border-slate-200 mt-20 py-8 text-center text-slate-500 text-sm">
		<!-- Cross-tool recommendations -->
		<div class="max-w-3xl mx-auto mb-8">
			<h3 class="text-lg font-semibold text-foreground mb-4 text-center">Other RyderTech Labs tools you might find useful</h3>
			<div class="grid gap-4 sm:grid-cols-2">
				<a
					href="/labs/ops-drain"
					class="rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-primary hover:shadow-md"
				>
					<h4 class="font-semibold text-foreground mb-1">Ops Drain Calculator</h4>
					<p class="text-xs text-slate-600">
						See what your manual processes cost per year and how fast automation pays for itself.
					</p>
				</a>
				<a
					href="/labs/event-access-risk"
					class="rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-primary hover:shadow-md"
				>
					<h4 class="font-semibold text-foreground mb-1">Event Access Risk Scanner</h4>
					<p class="text-xs text-slate-600">
						Audit your event gate for bottlenecks, gatecrash exposure, and revenue at risk.
					</p>
				</a>
			</div>
			<div class="mt-6 text-center">
			<p class="text-slate-500 text-sm">Powered by Google Gemini AI • Built with 💖 by RyderTech</p>
			</div>
		</div>
	</footer>
</div>