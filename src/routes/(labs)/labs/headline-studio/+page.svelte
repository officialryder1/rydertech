<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import SEOMeta from '$lib/components/SEOMeta.svelte';
	import { supabase } from '$lib/supabaseClient';
	import { env } from '$env/dynamic/public';
	import emailjs from '@emailjs/browser';
	import { scoreLead } from '$lib/leadScore';
	import { goto } from '$app/navigation';
	import {
		Sparkles, Copy, RefreshCw, AlertCircle, Loader2, Send, TrendingUp,
		Target, Type, List, HelpCircle, Megaphone, Shield, Award, Zap,
		MapPin, ExternalLink
	} from '@lucide/svelte';
	import type { Headline, HeadlineResult, HeadlineStyle } from '$lib/headlineStudio';
	import { STYLE_LABELS } from '$lib/headlineStudio';

	// --- State ---
	let topic = $state('');
	let industry = $state('');
	let selectedStyles = $state<HeadlineStyle[]>(['curiosity', 'how-to', 'question', 'listicle']);
	let count = $state(8);
	let loading = $state(false);
	let error = $state('');
	let result = $state<HeadlineResult | null>(null);
	let copiedId = $state<string | null>(null);
	let email = $state('');
	let company = $state('');
	let isSubmitting = $state(false);
	let leadError = $state('');
	let leadCaptured = $state(false);
	let unlocked = $state(false);

	const allStyles: { id: HeadlineStyle; name: string; icon: any; desc: string }[] = [
		{ id: 'curiosity', name: 'Curiosity Gap', icon: HelpCircle, desc: 'Intrigue without giving it all away' },
		{ id: 'how-to', name: 'How-To', icon: List, desc: 'Practical skills and outcomes' },
		{ id: 'question', name: 'Question Hook', icon: HelpCircle, desc: 'Direct pain-point questions' },
		{ id: 'listicle', name: 'Listicle', icon: List, desc: 'Numbers + scannable value' },
		{ id: 'breaking', name: 'Breaking', icon: Zap, desc: 'Urgency + timeliness' },
		{ id: 'command', name: 'Command', icon: Send, desc: 'Imperative, direct tone' },
		{ id: 'problem-agitate', name: 'PAS', icon: AlertCircle, desc: 'Problem → Agitate → Solve' },
		{ id: 'benefit-driven', name: 'Benefit-Driven', icon: TrendingUp, desc: 'Transformation-focused' },
		{ id: 'social-proof', name: 'Social Proof', icon: Award, desc: 'Authority + crowds' },
		{ id: 'fear-scarcity', name: 'Fear/Scarcity', icon: MapPin, desc: 'Loss aversion + exclusivity' }
	];

	function toggleStyle(id: HeadlineStyle) {
		if (selectedStyles.includes(id)) {
			selectedStyles = selectedStyles.filter(s => s !== id);
		} else {
			selectedStyles = [...selectedStyles, id];
		}
	}

	function copyToClipboard(text: string, id: string) {
		navigator.clipboard.writeText(text);
		copiedId = id;
		setTimeout(() => copiedId = null, 2000);
	}

	async function handleGenerate() {
		if (!topic.trim() || topic.length < 3) {
			error = 'Please enter a topic (at least 3 characters).';
			return;
		}
		if (selectedStyles.length === 0) {
			error = 'Please select at least one headline style.';
			return;
		}

		loading = true;
		error = '';
		result = null;

		try {
			const res = await fetch('/api/headlines', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					topic,
					industry: industry || undefined,
					styles: selectedStyles,
					count: Math.min(count, 12)
				})
			});

			const data = await res.json();
			if (!data.success) throw new Error(data.error || 'Generation failed');
			result = data.result;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Something went wrong';
		} finally {
			loading = false;
		}
	}

	function reset() {
		result = null;
		topic = '';
		industry = '';
		selectedStyles = ['curiosity', 'how-to', 'question', 'listicle'];
		error = '';
	}

	function validEmail(v: string) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
	}

	function summaryText() {
		if (!result) return '';
		return [
			`Topic: ${topic}`,
			`Industry: ${industry || 'general'}`,
			`Styles: ${selectedStyles.map(s => STYLE_LABELS[s]).join(', ')}`,
			`Count: ${result.headlines.length}`,
			'',
			`Top headline: ${result.topPicks[0]?.text}`,
			`Top score: ${result.topPicks[0]?.clickbaitScore}/100`,
			'',
			'Generated headlines:',
			...result.headlines.slice(0, 5).map((h, i) => `${i + 1}. [${h.style}] ${h.text}`)
		].join('\n');
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		leadError = '';
		if (!validEmail(email)) {
			leadError = 'Please enter a valid email address.';
			return;
		}
		isSubmitting = true;
		try {
			// Always unlock — delivery failure must never block the prospect.
			unlocked = true;
			leadCaptured = true;
			try {
				localStorage.setItem('rydertech_headline_email', email);
				localStorage.setItem('rydertech_lead_captured', '1');
			} catch {}

			const lead = scoreLead({
				tool: 'cost_estimator', // maps to the general lead type
				impactValue: result ? result.topPicks[0]?.clickbaitScore * 1000 : 0,
				revenueAtRisk: result ? result.topPicks.length * 50000 : 0
			});

			const serviceId = env.PUBLIC_EMAILJS_SERVICE_ID;
			const templateId = env.PUBLIC_EMAILJS_TEMPLATE_ID;
			const publicKey = env.PUBLIC_EMAILJS_PUBLIC_KEY;

			if (serviceId && templateId && publicKey && email) {
				await emailjs.send(
					serviceId,
					templateId,
					{
						from_name: company || 'Headline Studio lead',
						from_email: email,
						company,
						budget: `${result?.headlines.length || 0} headlines generated`,
						timeline: `Top score: ${result?.topPicks[0]?.clickbaitScore}/100`,
						message: `New AI Headline Studio result (source: /labs/headline-studio).\nLead score: ${lead.points}/100 (${lead.tier}).\n\n${summaryText()}`,
						lead_type: 'lead_magnet_headline_studio',
						lead_score: lead.points,
						lead_tier: lead.tier
					},
					{ publicKey }
				);
			} else {
				console.warn('EmailJS not configured — headline lead not emailed:', email);
			}

			// Best-effort DB backup
			try {
				await supabase
					.from('newsletter_subscriptions')
					.insert([
						{
							email,
							source: 'lead_magnet_headline_studio',
							subscribed_at: new Date().toISOString(),
							lead_score: lead.points,
							lead_tier: lead.tier
						}
					])
					.select();
			} catch {
				console.info('Headline lead backup skipped (DB unavailable):', email);
			}
		} catch (err) {
			console.warn('Headline lead email failed:', err);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<SEOMeta
	data={{
		title: 'AI Headline Studio — Generate Viral Headlines for Your Topic',
		description:
			"Generate 8-12 viral headline variants across proven copywriting formulas — Curiosity, How-To, Listicle, Question, PAS, and more. Free AI tool by RyderTech. No signup.",
		canonical: 'https://rydertech.ng/labs/headline-studio'
	}}
/>

<div class="min-h-screen bg-background">
	<div class="container mx-auto max-w-6xl px-4 py-10">
		<a
			href="/labs"
			class="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
		>
			← Back to Labs
		</a>

		<header class="mb-10 max-w-3xl">
			<Badge variant="secondary" class="mb-3">AI Copywriting</Badge>
			<h1 class="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
				Viral headlines, <br />
				<span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-500">zero brainstorming.</span>
			</h1>
			<p class="mt-4 text-lg text-muted-foreground">
				Enter any topic and we'll generate 8-12 high-scoring headline variants using proven copywriting
				formulas: Curiosity Gap, How-To, Listicle, Question hooks, PAS, and more. Each headline is
				scored for click-worthiness. Free, no signup.
			</p>
		</header>

		{#if !result && !loading}
			<!-- INPUT FORM -->
			<div class="grid gap-8 lg:grid-cols-[1fr_380px]">
				<section class="space-y-6">
					<Card>
						<CardHeader class="pb-4">
							<CardTitle class="flex items-center gap-2 text-base">
								<Target class="h-4 w-4 text-primary" />
								Your topic
							</CardTitle>
							<CardDescription>What headline would you want for this topic?</CardDescription>
						</CardHeader>
						<CardContent class="space-y-4">
							<Input
								type="text"
								placeholder="e.g. AI automation for small businesses"
								bind:value={topic}
								class="text-base"
							/>
							<Input
								type="text"
								placeholder="Industry / niche (optional)"
								bind:value={industry}
							/>
							<div>
								<label class="mb-1.5 block text-xs text-muted-foreground">How many headlines</label>
								<Input
									type="number"
									min="1"
									max="12"
									bind:value={count}
								/>
							</div>
							{#if error}
								<p class="text-xs text-destructive">{error}</p>
							{/if}
						</CardContent>
					</Card>

					<Card>
						<CardHeader class="pb-4">
							<CardTitle class="flex items-center gap-2 text-base">
								<Type class="h-4 w-4 text-primary" />
								Headline styles
							</CardTitle>
							<CardDescription>
								We'll distribute headlines evenly across your selected styles.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
								{#each allStyles as s}
									{@const Icon = s.icon}
									<button
										type="button"
										onclick={() => toggleStyle(s.id)}
										class={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
											selectedStyles.includes(s.id)
												? 'border-primary bg-primary/5 text-primary'
												: 'border-border hover:border-muted-foreground text-muted-foreground'
										}`}
									>
										<Icon class="h-4 w-4" />
										<span class="text-sm font-medium">{s.name}</span>
									</button>
								{/each}
							</div>
						</CardContent>
					</Card>

					{#if error}
						<div class="flex items-center gap-2 text-destructive text-sm bg-destructive/5 p-3 rounded-lg">
							<AlertCircle class="h-4 w-4" />
							{error}
						</div>
					{/if}

					<Button
						onclick={handleGenerate}
						disabled={loading || !topic.trim() || selectedStyles.length === 0}
						class="w-full gap-2"
						size="lg"
					>
						{#if loading}
							<Loader2 class="h-5 w-5 animate-spin" />
							Generating...
						{:else}
							<Sparkles class="h-5 w-5" />
							Generate Viral Headlines
						{/if}
					</Button>
				</section>

				<!-- Lead Capture / Teaser -->
				<aside class="space-y-6">
					<Card>
						<CardHeader class="pb-4">
							<CardTitle class="text-base">Need viral headlines too?</CardTitle>
							<CardDescription>
								The same headline engine powers our
								<a href="/labs/content-repurposer" class="text-primary hover:underline">AI Content Repurposer</a>
								— turn one blog post into 6 platform-native posts.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onsubmit={handleSubmit} class="space-y-3">
								<Input type="text" bind:value={company} placeholder="Company (optional)" />
								<Input
									type="email"
									bind:value={email}
									placeholder="you@company.com"
									required
								/>
								{#if leadError}
									<p class="text-xs text-destructive">{leadError}</p>
								{/if}
								<Button type="submit" disabled={isSubmitting} class="w-full">
									{isSubmitting ? 'Sending…' : 'Send me the Repurposer'}
								</Button>
							</form>
							{#if leadCaptured}
								<p class="mt-2 text-center text-xs text-muted-foreground">
									✓ Check your inbox — we’ll send the Repurposer link + headline tips.
								</p>
							{/if}
						</CardContent>
					</Card>

					<Card>
						<CardContent class="pt-6">
							<div class="flex gap-2 text-sm">
								<MapPin class="h-4 w-4 shrink-0 text-muted-foreground" />
								<span class="text-muted-foreground">
									Organic-first tool. Runs on Gemini 2.0 Flash. Zero tracking, no signup.
								</span>
							</div>
						</CardContent>
					</Card>
				</aside>
			</div>
		{:else if loading}
			<div class="text-center py-20">
				<Loader2 class="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
				<h3 class="text-xl font-semibold text-foreground mb-2">Generating your headlines...</h3>
				<p class="text-muted-foreground">Our AI copywriter is crafting platform-native headlines for your topic.</p>
			</div>
		{:else if result}
			<!-- RESULTS -->
			<div class="space-y-8">
				<div class="flex items-center justify-between">
					<h2 class="text-2xl font-bold text-foreground">Generated Headlines</h2>
					<Button variant="outline" onclick={reset} class="gap-2">
						<RefreshCw class="h-4 w-4" />
						New topic
					</Button>
				</div>

				<!-- Top picks -->
				<div class="space-y-3">
					<h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">Top 3 Picks</h3>
					{#each result.topPicks as headline}
						<Card class="border-primary/30 bg-primary/2.5">
							<CardContent class="pt-4">
								<div class="flex items-start justify-between gap-4">
									<div class="space-y-1">
										<Badge variant="secondary" class="text-xs">
											{STYLE_LABELS[headline.style]}
										</Badge>
										<p class="font-medium text-foreground">{headline.text}</p>
									</div>
									<div class="flex shrink-0 items-center gap-2">
										<Badge class="text-xs">
											<TrendingUp class="h-3 w-3 mr-1" />
											{headline.clickbaitScore}/100
										</Badge>
										<Button
											variant="ghost"
											size="sm"
											onclick={() => copyToClipboard(headline.text, headline.id)}
										>
											{#if copiedId === headline.id}
							Copied!
						{:else}
							<Copy class="h-4 w-4" />
						{/if}
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					{/each}
				</div>

				<!-- All headlines -->
				<div class="space-y-3">
					<h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
						All {result.headlines.length} headlines
					</h3>
					<div class="grid gap-3 md:grid-cols-2">
						{#each result.headlines as headline (headline.id)}
							<div class="rounded-lg border border-border bg-card p-4 transition hover:border-primary/30">
								<div class="flex items-start justify-between gap-3">
									<p class="text-sm font-medium text-foreground leading-snug">
										{headline.text}
									</p>
									<div class="flex shrink-0 flex-col items-end gap-1.5">
										<Badge variant="outline" class="text-xs">
											{STYLE_LABELS[headline.style]}
										</Badge>
										<span class="text-xs text-muted-foreground">{headline.clickbaitScore}/100</span>
									</div>
								</div>
								<Button
									variant="ghost"
									size="sm"
									class="mt-2 h-6 gap-1 text-xs"
									onclick={() => copyToClipboard(headline.text, headline.id)}
								>
									{copiedId === headline.id ? 'Copied!' : ''}
									<Copy class="h-3 w-3" />
								</Button>
							</div>
						{/each}
					</div>
				</div>

				<!-- Style distribution -->
				<Card>
					<CardHeader class="pb-4">
						<CardTitle class="text-base">Style distribution</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="flex flex-wrap gap-2">
							{#each Object.entries(result.styleDistribution) as [style, n]}
								{#if n > 0}
									<Badge variant="outline" class="text-xs">
										{STYLE_LABELS[style as HeadlineStyle]}: {n}
									</Badge>
								{/if}
							{/each}
						</div>
					</CardContent>
				</Card>

				<!-- CTA to Content Repurposer -->
				<div class="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-violet-500/5 p-6 text-center">
					<h3 class="text-xl font-semibold text-foreground mb-2">
						Love these headlines? Turn your full content into 6 platform posts.
					</h3>
					<p class="text-sm text-muted-foreground mb-4">
						Our AI Content Repurposer expands any blog, article, or transcript into
						LinkedIn posts, Twitter threads, newsletter blurbs, and TikTok scripts.
					</p>
					<Button href="/labs/content-repurposer" class="gap-2">
						<Sparkles class="h-4 w-4" />
						Try Content Repurposer
					</Button>
				</div>

				<!-- Lead gate for results -->
				{#if !unlocked}
					<Card>
						<CardHeader class="pb-4">
							<CardTitle>Get headline formulas + the full Repurposer</CardTitle>
							<CardDescription>
								We'll send you our proven headline formula cheat-sheet and keep you posted
								on new RyderTech Labs tools.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onsubmit={handleSubmit} class="space-y-3">
								<div class="grid gap-3 sm:grid-cols-2">
									<Input type="text" bind:value={company} placeholder="Company (optional)" />
									<Input
										type="email"
										bind:value={email}
										placeholder="you@company.com"
										required
									/>
								</div>
								{#if leadError}
									<p class="text-xs text-destructive">{leadError}</p>
								{/if}
								<Button type="submit" disabled={isSubmitting} class="w-full">
									{isSubmitting ? 'Sending…' : 'Send me the formula sheet'}
								</Button>
							</form>
							{#if leadCaptured}
								<p class="mt-2 text-center text-xs text-muted-foreground">
									✓ Check your inbox — formula sheet + Repurposer link on the way.
								</p>
							{/if}
						</CardContent>
					</Card>
				{/if}
			</div>
		{/if}
	</div>
</div>
