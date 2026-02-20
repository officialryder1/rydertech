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
    Share2
	} from '@lucide/svelte';

	// State
	let url = $state('');
	let loading = $state(false);
	let error = $state('');
	let review = $state<any>(null);
  let reviewedUrl = $state('');

	const categoryIcons: Record<string, any> = {
		design: Palette,
		ux: Layout,
		performance: Zap,
		accessibility: Accessibility,
		seo: SearchIcon
	};

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
		if (score >= 8) return 'text-brand-blue';
		if (score >= 6) return 'text-brand-gold';
		return 'text-red-500';
	}

	function getScoreBg(score: number): string {
		if (score >= 8) return 'bg-brand-blue/10 border-brand-blue/20';
		if (score >= 6) return 'bg-brand-gold/10 border-brand-gold/20';
		return 'bg-red-500/10 border-red-500/20';
	}

  function reset() {
		review = null;
		url = '';
		reviewedUrl = '';
		window.history.pushState({}, '', '/');
	}

  function shareResults() {
		if (navigator.share) {
			navigator.share({
				title: `Website Analysis: ${reviewedUrl}`,
				text: `My website scored ${review.overallScore}/10 on LuxReview!`,
				url: window.location.href
			});
		} else {
			navigator.clipboard.writeText(window.location.href);
		}
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

<div class="min-h-screen bg-gradient-to-b from-brand-cream via-white to-blue-50/30">
  <!-- Skip to main content for accessibility -->
	<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-brand-blue text-white px-4 py-2 rounded-lg z-50">
		Skip to main content
	</a>

	<!-- Header -->
	<header class="border-b border-brand-blue/10 bg-white/80 backdrop-blur-md sticky top-0 z-50">
		<div class="container mx-auto px-4 h-16 flex items-center justify-between">
			<div class="flex items-center gap-2">
        <a href="/labs/website-rater" class="flex items-center gap-2 group" aria-label="RyderTech Labs - website rater">
          <div class="w-8 h-8 bg-gradient-to-br from-brand-blue to-brand-blue-light rounded-lg flex items-center justify-center">
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
			<Card class="max-w-2xl mx-auto border-blue/10 shadow-xl shadow-brand-blue/5">
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
							class="w-full h-12 text-primary hover:text-white border border-primary text-lg bg-gradient-to-r from-brand-blue to-brand-blue-light hover:opacity-90 transition-all"
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
							<svelte:component this={feature.icon} class="w-6 h-6 text-primary" />
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
							Yes! LuxReview offers free AI-powered website analysis. Get instant feedback on your site's strengths and areas for improvement.
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
							onclick={shareResults}
							class="border-brand-blue/20"
						>
							<Share2 class="w-4 h-4 mr-2" aria-hidden="true" />
							Share
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

				<!-- CTA -->
				<div class="text-center pt-8">
					<Button 
						size="lg"
						onclick={reset}
						class="bg-gradient-to-r from-secondary to-secondary-dark text-white hover:opacity-90"
					>
						<RefreshCw class="w-5 h-5 mr-2" />
						Analyze Another Website
					</Button>
				</div>
			</article>
		{/if}
	</main>

	<!-- Footer -->
	<footer class="border-t border-slate-200 mt-20 py-8 text-center text-slate-500 text-sm">
		<p>Powered by Google Gemini AI • Built with 💖 by rydertech</p>
	</footer>
</div>