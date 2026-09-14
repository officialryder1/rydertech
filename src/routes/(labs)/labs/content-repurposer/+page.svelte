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
		Sparkles, Copy, RefreshCw, AlertCircle, Loader2, Linkedin, Twitter,
		Mail, Video, Instagram, BookOpen, Send
	} from '@lucide/svelte';
	import type { RepurposedPost, RepurposeInput } from '$lib/content-repurposer/types';

	// --- State ---
	let sourceContent = $state('');
	let contentType = $state<RepurposeInput['contentType']>('blog');
	let tone = $state<RepurposeInput['tone']>('professional');
	let selectedPlatforms = $state<string[]>(['linkedin', 'twitter']);
	let loading = $state(false);
	let error = $state('');
	let posts = $state<RepurposedPost[]>([]);
	let copiedId = $state<string | null>(null);
	let email = $state('');
	let company = $state('');
	let isSubmitting = $state(false);
	let leadError = $state('');
	let unlocked = $state(false);
	let leadCaptured = $state(false);

	const availablePlatforms = [
		{ id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
		{ id: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'text-sky-500' },
		{ id: 'newsletter', name: 'Newsletter', icon: Mail, color: 'text-purple-600' },
		{ id: 'tiktok', name: 'TikTok', icon: Video, color: 'text-pink-500' },
		{ id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600' },
		{ id: 'blog', name: 'Blog Intro', icon: BookOpen, color: 'text-green-600' }
	];

	const contentTypes = [
		{ value: 'blog', label: 'Blog Post' },
		{ value: 'article', label: 'Article' },
		{ value: 'video', label: 'Video Transcript' },
		{ value: 'podcast', label: 'Podcast Transcript' },
		{ value: 'other', label: 'Other' }
	];

	const tones = [
		{ value: 'professional', label: 'Professional' },
		{ value: 'casual', label: 'Casual' },
		{ value: 'engaging', label: 'Engaging' },
		{ value: 'authoritative', label: 'Authoritative' }
	];

	function togglePlatform(id: string) {
		if (selectedPlatforms.includes(id)) {
			selectedPlatforms = selectedPlatforms.filter(p => p !== id);
		} else {
			selectedPlatforms = [...selectedPlatforms, id];
		}
	}

	function getPlatformInfo(id: string) {
		return availablePlatforms.find(p => p.id === id) || { name: id, icon: Sparkles, color: '' };
	}

	function copyToClipboard(text: string, id: string) {
		navigator.clipboard.writeText(text);
		copiedId = id;
		setTimeout(() => copiedId = null, 2000);
	}

	function validEmail(v: string) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
	}

	function summaryText() {
		return [
			`Content type: ${contentType}`,
			`Platforms: ${selectedPlatforms.join(', ')}`,
			`Tone: ${tone}`,
			'',
			`Source (${sourceContent.length} chars):`,
			sourceContent.slice(0, 300) + (sourceContent.length > 300 ? '...' : ''),
			'',
			`Generated ${posts.length} posts.`,
			...posts.slice(0, 3).map((p, i) => `#${i + 1} [${p.platform}] ${p.content.slice(0, 120)}`)
		].join('\n');
	}

	async function handleGenerate() {
		if (!sourceContent.trim()) {
			error = 'Please enter some content first.';
			return;
		}
		if (selectedPlatforms.length === 0) {
			error = 'Please select at least one platform.';
			return;
		}

		loading = true;
		error = '';
		posts = [];

		try {
			const res = await fetch('/api/repurpose', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					sourceContent,
					contentType,
					targetPlatforms: selectedPlatforms,
					tone
				})
			});

			const data = await res.json();
			if (!data.success) throw new Error(data.error || 'Generation failed');
			posts = data.posts;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Something went wrong';
		} finally {
			loading = false;
		}
	}

	function reset() {
		posts = [];
		sourceContent = '';
		selectedPlatforms = ['linkedin', 'twitter'];
		error = '';
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
			unlocked = true;
			leadCaptured = true;
			try {
				localStorage.setItem('rydertech_repurposer_email', email);
				localStorage.setItem('rydertech_lead_captured', '1');
			} catch {}

			const lead = scoreLead({
				tool: 'cost_estimator',
				impactValue: posts.length * 100000,
				revenueAtRisk: posts.length * 200000
			});

			const serviceId = env.PUBLIC_EMAILJS_SERVICE_ID;
			const templateId = env.PUBLIC_EMAILJS_TEMPLATE_ID;
			const publicKey = env.PUBLIC_EMAILJS_PUBLIC_KEY;

			if (serviceId && templateId && publicKey && email) {
				await emailjs.send(
					serviceId,
					templateId,
					{
						from_name: company || 'Content Repurposer lead',
						from_email: email,
						company,
						budget: `${posts.length} posts generated`,
						timeline: `Platforms: ${selectedPlatforms.join(', ')}`,
						message: `New AI Content Repurposer result (source: /labs/content-repurposer).\nLead score: ${lead.points}/100 (${lead.tier}).\n\n${summaryText()}`,
						lead_type: 'lead_magnet_content_repurposer',
						lead_score: lead.points,
						lead_tier: lead.tier
					},
					{ publicKey }
				);
			} else {
				console.warn('EmailJS not configured — repurposer lead not emailed:', email);
			}

			try {
				await supabase
					.from('newsletter_subscriptions')
					.insert([
						{
							email,
							source: 'lead_magnet_content_repurposer',
							subscribed_at: new Date().toISOString(),
							lead_score: lead.points,
							lead_tier: lead.tier
						}
					])
					.select();
			} catch {
				console.info('Repurposer lead backup skipped (DB unavailable):', email);
			}
		} catch (err) {
			console.warn('Content Repurposer lead email failed:', err);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<SEOMeta
	data={{
		title: 'AI Content Repurposer — Turn One Post Into 6 Platform Posts',
		description:
			'Turn your blog posts, articles, and video transcripts into platform-native LinkedIn posts, Twitter threads, newsletter blurbs, and TikTok scripts — all AI-powered. Free to try.',
		canonical: 'https://rydertech.ng/labs/content-repurposer'
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
			<Badge variant="secondary" class="mb-3">AI Content Engine</Badge>
			<h1 class="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
				One piece of content,<br />
				<span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-500">six platforms.</span>
			</h1>
			<p class="mt-4 text-lg text-muted-foreground">
				Paste your blog post, article, or transcript. Our AI transforms it into platform-native posts for
				LinkedIn, Twitter, newsletters, TikTok, Instagram, and blog intros. Free, no signup.
			</p>
		</header>

		{#if !posts.length && !loading}
			<!-- INPUT FORM -->
			<div class="grid gap-8 lg:grid-cols-[1fr_380px]">
				<section class="space-y-6">
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<select
							bind:value={contentType}
							class="border border-border rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary focus:border-transparent outline-none w-full bg-background"
						>
							{#each contentTypes as ct}
								<option value={ct.value}>{ct.label}</option>
							{/each}
						</select>
						<select
							bind:value={tone}
							class="border border-border rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary focus:border-transparent outline-none w-full bg-background"
						>
							{#each tones as t}
								<option value={t.value}>{t.label}</option>
							{/each}
						</select>
					</div>

					<Card>
						<CardHeader class="pb-4">
							<CardTitle class="text-base">Target platforms</CardTitle>
							<CardDescription>
								We'll generate a native post for each selected platform.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
								{#each availablePlatforms as platform}
									{@const Icon = platform.icon}
									<button
										type="button"
										onclick={() => togglePlatform(platform.id)}
										class={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
											selectedPlatforms.includes(platform.id)
												? 'border-primary bg-primary/5 text-primary'
												: 'border-border hover:border-muted-foreground text-muted-foreground'
										}`}
									>
										<Icon class="h-5 w-5" />
										<span class="font-medium">{platform.name}</span>
									</button>
								{/each}
							</div>
						</CardContent>
					</Card>

					<div>
						<textarea
							placeholder="Paste your blog post, article, video transcript, or podcast script here..."
							bind:value={sourceContent}
							rows={12}
							class="w-full text-base resize-none border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-background"
						></textarea>
						<div class="mt-2 flex justify-between text-xs text-muted-foreground">
							<span>{sourceContent.length} characters</span>
							<span>Minimum 50 characters</span>
						</div>
					</div>

					{#if error}
						<p class="text-sm text-destructive">{error}</p>
					{/if}

					<Button
						onclick={handleGenerate}
						disabled={loading || !sourceContent.trim() || selectedPlatforms.length === 0}
						class="w-full gap-2"
						size="lg"
					>
						{#if loading}
							<Loader2 class="h-5 w-5 animate-spin" />
							Generating...
						{:else}
							<Sparkles class="h-5 w-5" />
							Generate Repurposed Posts
						{/if}
					</Button>
				</section>

				<!-- Lead capture / cross-sell -->
				<aside class="space-y-6">
					<Card>
						<CardHeader class="pb-4">
							<CardTitle class="text-base">Try AI Headline Studio for viral hooks</CardTitle>
							<CardDescription>
								Our AI Headline Studio generates 8-12 headline variants across proven copywriting formulas.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onsubmit={handleSubmit} class="space-y-3">
								<Input type="text" bind:value={company} placeholder="Company (optional)" />
								<Input type="email" bind:value={email} placeholder="you@company.com" required />
								{#if leadError}
									<p class="text-xs text-destructive">{leadError}</p>
								{/if}
								<Button type="submit" disabled={isSubmitting} class="w-full">
									{isSubmitting ? 'Sending…' : 'Send me headline formulas'}
								</Button>
							</form>
							{#if leadCaptured}
								<p class="mt-2 text-center text-xs text-muted-foreground">
									✓ Check your inbox — headline sheet coming right away.
								</p>
							{/if}
						</CardContent>
					</Card>

					<Card>
						<CardContent class="pt-6">
							<div class="flex gap-2 text-sm">
								<Sparkles class="h-4 w-4 shrink-0 text-primary" />
								<span class="text-muted-foreground">
									Runs on Gemini 2.0 Flash. Zero tracking, no signup required.
								</span>
							</div>
						</CardContent>
					</Card>
				</aside>
			</div>
		{:else if loading}
			<div class="text-center py-20">
				<Loader2 class="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
				<h3 class="text-xl font-semibold text-foreground mb-2">Generating your posts...</h3>
				<p class="text-muted-foreground">Our AI is analyzing your content and crafting platform-native posts.</p>
			</div>
		{:else}
			<!-- RESULTS -->
			<div class="space-y-8">
				<div class="flex items-center justify-between">
					<h2 class="text-2xl font-bold text-foreground">Generated Posts</h2>
					<Button variant="outline" onclick={reset} class="gap-2">
						<RefreshCw class="h-4 w-4" />
						New content
					</Button>
				</div>

				{#each posts as post (post.id)}
					{@const Icon = getPlatformInfo(post.platform).icon || Sparkles}
					<div class="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
						<div class="p-6 border-b border-border">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-3">
									<Icon class="h-6 w-6 text-primary" />
									<h3 class="text-xl font-bold text-foreground">{post.title}</h3>
								</div>
								<span class="text-xs px-3 py-1 bg-muted rounded-full text-muted-foreground">
									{post.platform}
								</span>
							</div>
							<p class="text-sm text-muted-foreground mt-2">
								{post.estimatedCharacterCount} characters
							</p>
						</div>
						<div class="p-6 space-y-4">
							<div class="bg-muted/30 rounded-lg p-4 whitespace-pre-wrap text-sm leading-relaxed">
								{post.content}
							</div>
							{#if post.hashtags.length > 0}
								<div class="flex flex-wrap gap-2">
									{#each post.hashtags as tag}
										<span class="text-xs text-muted-foreground">{tag}</span>
									{/each}
								</div>
							{/if}
							<div class="pt-4 border-t border-border">
								<Button
									variant="ghost"
									onclick={() => copyToClipboard(post.content + (post.hashtags.length ? '\n' + post.hashtags.join(' ') : ''), post.id)}
									class="gap-2 text-sm"
								>
									{copiedId === post.id ? 'Copied!' : ''}
									<Copy class="h-4 w-4" />
									Copy to clipboard
								</Button>
							</div>
						</div>
					</div>
				{/each}

				<div class="text-center pt-8">
					<Button variant="outline" onclick={reset} class="gap-2">
						<RefreshCw class="h-4 w-4" />
						Repurpose another piece of content
					</Button>
				</div>

				<!-- Lead gate after results -->
				{#if !unlocked}
					<Card>
						<CardHeader class="pb-4">
							<CardTitle>Save your repurposed posts</CardTitle>
							<CardDescription>
								Enter your email and we'll send you a summary + keep you posted on new tools.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onsubmit={handleSubmit} class="space-y-3">
								<div class="grid gap-3 sm:grid-cols-2">
									<Input type="text" bind:value={company} placeholder="Company (optional)" />
									<Input type="email" bind:value={email} placeholder="you@company.com" required />
								</div>
								{#if leadError}
									<p class="text-xs text-destructive">{leadError}</p>
								{/if}
								<Button type="submit" disabled={isSubmitting} class="w-full">
									{isSubmitting ? 'Sending…' : 'Save my posts'}
								</Button>
							</form>
							{#if leadCaptured}
								<p class="mt-2 text-center text-xs text-muted-foreground">
									✓ Check your inbox — we saved your result.
								</p>
							{/if}
						</CardContent>
					</Card>
				{/if}
			</div>
		{/if}
	</div>
</div>
