<script lang="ts">
	import { browser } from '$app/environment';
	import { ArrowRight, ExternalLink } from '@lucide/svelte';
	import FindingsNgPricingTable from '$lib/components/FindingsNgPricingTable.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();


		const findings = [
		{
			tag: 'Category floor',
			title: 'Entry pricing sits between $0 and $99 a month.',
			body: 'Pricefy carries the category\u2019s only forever-free tier at 50 SKUs. Every other vendor opens at a paid plan or a trial. That free tier is the structural pressure point the rest of the ladder prices against.',
			stat: '$0 to $99',
			statLabel: 'SMB entry band'
		},
		{
			tag: 'Metering',
			title: 'What you count decides what you pay.',
			body: 'Prisync bills per product, Pricefy per SKU, Price2Spy per URL. The same catalogue costs different money on each model.'
		},
		{
			tag: 'Mid-market',
			title: 'Published pricing is disappearing.',
			body: 'Price2Spy pulled its price list in May 2026 and moved to contact-sales. Above the SMB band the category increasingly quotes instead of publishing.'
		}
	];

	const provenance = [
		{
			state: 'Verified',
			definition: 'Read directly off the vendor\u2019s own pricing page and dated. These figures are safe to quote and appear on shareable cards.'
		},
		{
			state: 'Unverified',
			definition: 'Sourced from a marketplace listing rather than the vendor. Shown in the table with provenance attached, never promoted into a shareable surface.'
		},
		{
			state: 'Quote-led',
			definition: 'The vendor publishes no price at all. The row records that fact, which is itself the finding.'
		}
	];

	/**
	 * Reveal-on-scroll. Inline styles only: a persistent CSS `opacity: 0` hidden
	 * state can be stranded permanently if the visible class is ever lost, and an
	 * inline `opacity: 1` always wins over any stylesheet rule.
	 */
	function reveal(node: HTMLElement, delay = 0) {
		if (!browser) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		node.style.opacity = '0';
		node.style.transform = 'translateY(20px)';
		node.style.transition =
			'opacity .6s cubic-bezier(.22,1,.36,1), transform .6s cubic-bezier(.22,1,.36,1)';
		node.style.transitionDelay = `${delay}ms`;

		let shown = false;
		const show = () => {
			if (shown) return;
			shown = true;
			node.style.opacity = '1';
			node.style.transform = 'none';
			io.disconnect();
			clearTimeout(fallback);
		};
		const io = new IntersectionObserver(
			(entries) => entries.forEach((e) => e.isIntersecting && show()),
			{ threshold: 0.1 }
		);
		io.observe(node);
		const fallback = setTimeout(show, 1400);

		return {
			destroy() {
				io.disconnect();
				clearTimeout(fallback);
			}
		};
	}
</script>

<svelte:head>
	<title>Competitor Pricing for Price-Tracking SaaS | FindingsNg</title>
	<meta
		name="description"
		content="Published pricing for Prisync, Pricefy and Price2Spy side by side: plan ladders, metering models and provenance for every figure. Verified against vendor pages."
	/>
	<link rel="canonical" href="https://rydertech.ng/findings-ng" />
	<meta property="og:type" content="article" />
	<meta property="og:url" content="https://rydertech.ng/findings-ng" />
	<meta property="og:title" content="Competitor Pricing for Price-Tracking SaaS | FindingsNg" />
	<meta
		property="og:description"
		content="Plan ladders, metering models and provenance for Prisync, Pricefy and Price2Spy. Vendor-published figures only."
	/>
	<meta property="og:image" content="https://rydertech.ng/og-image.jpg" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Competitor Pricing for Price-Tracking SaaS | FindingsNg" />
	<meta
		name="twitter:description"
		content="Plan ladders, metering models and provenance for Prisync, Pricefy and Price2Spy. Vendor-published figures only."
	/>
	<meta name="twitter:image" content="https://rydertech.ng/og-image.jpg" />
</svelte:head>

<div class="findings-dark min-h-screen bg-[#0A0A0F] text-gray-200 antialiased">
	<!-- ================================ HERO ================================ -->
	<section class="relative overflow-hidden border-b border-white/5">
		<div class="pointer-events-none absolute inset-0" aria-hidden="true">
			<div
				class="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-[#06B6D4]/12 blur-[120px] max-sm:hidden"
			></div>
			<div
				class="absolute -right-24 top-24 h-80 w-80 rounded-full bg-[#D4AF37]/10 blur-[120px] max-sm:hidden"
			></div>
		</div>

		<div class="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 lg:grid-cols-12 lg:items-center lg:py-24">
			<div class="lg:col-span-7" use:reveal>
				<p class="font-mono text-xs tracking-[0.2em] text-[#06B6D4] uppercase">
					FindingsNg research
				</p>

				<h1
					class="font-playfair mt-5 text-4xl leading-[1.1] font-bold text-white md:text-5xl"
				>
					What the price-tracking category actually charges.
				</h1>

				<p class="mt-6 max-w-xl text-lg leading-relaxed text-gray-400">
					Three vendors, three metering models, one published ladder. Every figure dated and
					traced to its source.
				</p>

				<div class="mt-10">
					<a
						href="/contact"
						class="group inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-7 py-3.5 text-base font-semibold text-[#0A0A0F] transition hover:bg-[#E5C14F]"
					>
						Get early access
						<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
					</a>
				</div>
			</div>

			<figure class="lg:col-span-5" use:reveal={120}>
				<div class="overflow-hidden rounded-2xl border border-white/8">
					<img
						src="https://picsum.photos/seed/findings-metering-ledger/900/1040"
						alt="Abstract texture used as a backdrop for the FindingsNg pricing index"
						class="h-64 w-full object-cover opacity-40 grayscale md:h-80 lg:h-[26rem]"
						width="900"
						height="1040"
						loading="eager"
					/>
				</div>
				<figcaption class="mt-3 text-xs text-gray-400">
					Price2Spy withdrew its published price list in May 2026 and moved to contact-sales.
				</figcaption>
			</figure>
		</div>
	</section>

	<!-- =============================== TABLE ================================ -->
	<section class="border-b border-white/5 bg-[#0D0D14]">
		<div class="mx-auto max-w-6xl px-4 py-20" use:reveal>
			<div class="mb-10 max-w-2xl">
				<h2 class="font-playfair text-3xl font-bold text-white md:text-4xl">
					The published ladder
				</h2>
				<p class="mt-4 text-gray-400">
					Nine plans across three vendors, read off vendor pricing pages on 15 October 2026.
				</p>
			</div>

			<FindingsNgPricingTable rows={data.rows} />
		</div>
	</section>

	<!-- ============================== FINDINGS ============================== -->
	<section class="border-b border-white/5">
		<div class="mx-auto max-w-6xl px-4 py-20">
			<h2 class="font-playfair mb-10 text-3xl font-bold text-white md:text-4xl">
				Three things the numbers say
			</h2>

			<div class="grid gap-4 lg:grid-cols-3">
				<article
					class="rounded-2xl border border-white/8 bg-gradient-to-br from-[#1E40AF] via-[#1E3A8A] to-[#0A0A0F] p-8 lg:col-span-2 lg:row-span-2"
					use:reveal
				>
					<h3 class="font-playfair mt-0 text-2xl leading-snug font-bold text-white md:text-3xl">
						{findings[0].title}
					</h3>
					<p class="mt-5 max-w-xl leading-relaxed text-gray-300">{findings[0].body}</p>
					<div class="mt-8 border-t border-white/15 pt-6">
						<p class="font-mono text-3xl font-bold text-[#D4AF37]">{findings[0].stat}</p>
						<p class="mt-1 text-xs tracking-wide text-gray-400 uppercase">
							{findings[0].statLabel}
						</p>
					</div>
				</article>

				<article
					class="relative overflow-hidden rounded-2xl border border-white/8 lg:col-span-1"
					use:reveal={80}
				>
					<img
						src="https://picsum.photos/seed/findings-sku-meter/800/560"
						alt="Abstract texture behind the metering finding"
						class="absolute inset-0 h-full w-full object-cover opacity-20 grayscale"
						width="800"
						height="560"
						loading="lazy"
					/>
					<div class="relative p-6">
						<h3 class="text-lg font-semibold text-white">{findings[1].title}</h3>
						<p class="mt-3 text-sm leading-relaxed text-gray-400">{findings[1].body}</p>
					</div>
				</article>

				<article
					class="rounded-2xl border border-[#D4AF37]/25 bg-[#D4AF37]/5 p-6 lg:col-span-1"
					use:reveal={160}
				>
					<h3 class="text-lg font-semibold text-white">{findings[2].title}</h3>
					<p class="mt-3 text-sm leading-relaxed text-gray-400">{findings[2].body}</p>
				</article>
			</div>
		</div>
	</section>

	<!-- ============================= PROVENANCE ============================= -->
	<section class="border-b border-white/5 bg-[#0D0D14]">
		<div class="mx-auto grid max-w-6xl gap-10 px-4 py-20 lg:grid-cols-12">
			<div class="lg:col-span-5" use:reveal>
				<h2 class="font-playfair text-3xl font-bold text-white md:text-4xl">
					Where each number comes from
				</h2>
				<p class="mt-4 leading-relaxed text-gray-400">
					Every row in the table carries its own provenance. A figure we could not read off the
					vendor page stays in the table with that limitation attached, and is kept out of every
					shareable card until it is confirmed.
				</p>
			</div>

			<dl class="lg:col-span-7" use:reveal={100}>
				{#each provenance as item, i (item.state)}
					<div class="border-t border-white/8 py-6">
						<dt class="flex items-baseline gap-3">
							<span class="text-base font-semibold text-white">{item.state}</span>
							<span class="font-mono text-xs text-gray-400">
								{String(i + 1).padStart(2, '0')}
							</span>
						</dt>
						<dd class="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">
							{item.definition}
						</dd>
					</div>
				{/each}
			</dl>
		</div>
	</section>

	<!-- ================================= CTA ================================ -->
	<section class="mx-auto max-w-6xl px-4 py-20">
		<div
			class="rounded-2xl border border-[#D4AF37]/25 bg-[#D4AF37]/5 px-6 py-14 md:px-14"
			use:reveal
		>
			<h2 class="font-playfair max-w-2xl text-3xl font-bold text-white md:text-4xl">
				Track what your competitors charge, as it changes.
			</h2>
			<p class="mt-4 max-w-xl leading-relaxed text-gray-400">
				FindingsNg watches vendor pricing pages and tells you when a ladder, a limit or a metering
				model moves.
			</p>
			<div class="mt-8">
				<a
					href="/contact"
					class="group inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-7 py-3.5 text-base font-semibold text-[#0A0A0F] transition hover:bg-[#E5C14F]"
				>
					Get early access
					<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
				</a>
			</div>
		</div>
	</section>

	<footer class="border-t border-white/5">
		<div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8">
			<p class="text-sm text-gray-400">
				Figures sourced 15 October 2026. Method: read the vendor pricing page, date it, cite it.
			</p>
			<a
				href="https://rydertech.ng/labs"
				class="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#06B6D4]"
			>
				More RyderTech research
				<ExternalLink class="h-3.5 w-3.5" />
			</a>
		</div>
	</footer>
</div>

<style>
	/* The global navbar and body are built for the light site. Re-theme only
	   while a .findings-dark page is mounted. */
	:global(body:has(.findings-dark)) {
		background-color: #0a0a0f;
	}

	:global(.findings-dark) {
		font-family: 'Roboto', system-ui, sans-serif;
	}

	:global(.findings-dark .font-playfair) {
		font-family: 'Playfair Display', Georgia, serif;
	}

	/* The global navbar ships gray-700 links over a transparent bar. Against
	   #0A0A0F that measures about 1.9:1, so re-color it for this page only.
	   `-webkit-text-fill-color` inherits, so the gold child span is re-pinned
	   explicitly or the two-tone logo wordmark flattens to white. */
	:global(body:has(.findings-dark) nav a) {
		color: #e5e7eb;
	}
	:global(body:has(.findings-dark) nav a:hover) {
		color: #06b6d4;
	}
	:global(body:has(.findings-dark) nav a span.bg-clip-text) {
		background-image: linear-gradient(to right, #ffffff, #ffffff);
		-webkit-text-fill-color: #ffffff;
	}
	:global(body:has(.findings-dark) nav a span.bg-clip-text span.text-\[\#D4AF37\]) {
		-webkit-text-fill-color: #d4af37;
		color: #d4af37;
	}
	:global(body:has(.findings-dark) nav[class*='bg-white']) {
		background-color: rgba(10, 10, 15, 0.85);
		backdrop-filter: blur(12px);
	}
	:global(body:has(.findings-dark) nav button[aria-label]) {
		background-color: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
	}
	:global(body:has(.findings-dark) nav button[aria-label] svg) {
		color: #e5e7eb;
	}
</style>
