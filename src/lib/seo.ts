export interface SEOData {
	title: string;
	description: string;
	keywords?: string[];
	ogImage?: string;
	canonical?: string;
	type?: 'website' | 'article';
	publishedTime?: string;
	modifiedTime?: string;
	author?: string;
}

export const defaultSEO: SEOData = {
	title: 'RyderTech - AI and Software Development Studio',
	description: 'RyderTech builds custom web, mobile and AI automation software. Free tools to diagnose your website, your build costs and your manual process drain.',
	keywords: ['software development', 'AI automation', 'web development Nigeria', 'SvelteKit agency', 'workflow automation', 'custom software'],
	ogImage: '/og-image.jpg',
	type: 'website'
};

export function generateMetaTags(data: Partial<SEOData> = {}) {
	const seo = { ...defaultSEO, ...data };
	
	return {
		title: seo.title.includes('RyderTech') ? seo.title : `${seo.title} | RyderTech`,
		description: seo.description,
		keywords: seo.keywords?.join(', '),
		
		// Open Graph
		'og:title': seo.title,
		'og:description': seo.description,
		'og:type': seo.type,
		'og:image': seo.ogImage,
		'og:site_name': 'RyderTech',
		
		// Twitter
		'twitter:card': 'summary_large_image',
		'twitter:title': seo.title,
		'twitter:description': seo.description,
		'twitter:image': seo.ogImage,
		
		// Article specific
		...(seo.publishedTime && { 'article:published_time': seo.publishedTime }),
		...(seo.modifiedTime && { 'article:modified_time': seo.modifiedTime }),
		...(seo.author && { 'article:author': seo.author })
	};
}