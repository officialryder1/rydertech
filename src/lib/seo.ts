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
	title: 'Web Reviewer - AI-Powered Website Analysis & Review Tool',
	description: 'Get professional AI-powered reviews of your website. Analyze design, UX, performance, SEO, and accessibility with expert recommendations.',
	keywords: ['website review', 'AI analysis', 'UX audit', 'SEO checker', 'web design review', 'performance analysis'],
	ogImage: '/og-image.jpg',
	type: 'website'
};

export function generateMetaTags(data: Partial<SEOData> = {}) {
	const seo = { ...defaultSEO, ...data };
	
	return {
		title: `${seo.title} | LuxReview`,
		description: seo.description,
		keywords: seo.keywords?.join(', '),
		
		// Open Graph
		'og:title': seo.title,
		'og:description': seo.description,
		'og:type': seo.type,
		'og:image': seo.ogImage,
		'og:site_name': 'LuxReview',
		
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