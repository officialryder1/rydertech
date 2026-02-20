<script lang="ts">
	import { page } from '$app/stores';
	import { generateMetaTags, type SEOData } from '$lib/seo';
	
	interface Props {
		data: Partial<SEOData>;
	}
	
	let { data }: Props = $props();
	
	const meta = $derived(generateMetaTags(data));
	const canonical = $derived(data.canonical || $page.url.href);
</script>

<svelte:head>
	<title>{meta.title}</title>
	<meta name="description" content={meta.description} />
	<meta name="keywords" content={meta.keywords} />
	
	<!-- Canonical -->
	<link rel="canonical" href={canonical} />
	
	<!-- Open Graph -->
	<meta property="og:title" content={meta['og:title']} />
	<meta property="og:description" content={meta['og:description']} />
	<meta property="og:type" content={meta['og:type']} />
	<meta property="og:image" content={meta['og:image']} />
	<meta property="og:site_name" content={meta['og:site_name']} />
	<meta property="og:url" content={canonical} />
	
	<!-- Twitter -->
	<meta name="twitter:card" content={meta['twitter:card']} />
	<meta name="twitter:title" content={meta['twitter:title']} />
	<meta name="twitter:description" content={meta['twitter:description']} />
	<meta name="twitter:image" content={meta['twitter:image']} />
	
	<!-- Robots -->
	<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
	
	<!-- Additional SEO -->
	<meta name="author" content="LuxReview" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
</svelte:head>