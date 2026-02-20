<script lang="ts">
	import { page } from '$app/stores';
	
	interface Props {
		type: 'WebSite' | 'WebPage' | 'SoftwareApplication' | 'Review';
		data?: Record<string, any>;
	}
	
	let { type, data = {} }: Props = $props();
	
	const baseUrl = 'https://rydertech.ng/labs/website-rater'; 
	
	const structuredData = $derived(() => {
		const common = {
			'@context': 'https://schema.org',
			'@type': type
		};
		
		switch (type) {
			case 'WebSite':
				return {
					...common,
					name: 'RyderTech Labs - Website Rater',
					url: baseUrl,
					description: 'AI-powered website analysis and review tool',
					potentialAction: {
						'@type': 'SearchAction',
						target: `${baseUrl}/search?q={search_term_string}`,
						'query-input': 'required name=search_term_string'
					}
				};
				
			case 'SoftwareApplication':
				return {
					...common,
					name: 'RyderTech Website Rater',
					applicationCategory: 'DeveloperApplication',
					operatingSystem: 'Any',
					offers: {
						'@type': 'Offer',
						price: '0',
						priceCurrency: 'USD'
					},
					aggregateRating: {
						'@type': 'AggregateRating',
						ratingValue: '4.8',
						ratingCount: '127'
					}
				};
				
			case 'Review':
				return {
					...common,
					itemReviewed: {
						'@type': 'WebSite',
						url: data.url
					},
					reviewRating: {
						'@type': 'Rating',
						ratingValue: data.score,
						bestRating: 10
					},
					author: {
						'@type': 'Organization',
						name: 'RyderTech AI'
					},
					reviewBody: data.summary,
					datePublished: new Date().toISOString()
				};
				
			default:
				return {
					...common,
					url: $page.url.href,
					name: data.title || 'RyderTech Labs',
					description: data.description
				};
		}
	});
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify(structuredData())}</script>`}
</svelte:head>