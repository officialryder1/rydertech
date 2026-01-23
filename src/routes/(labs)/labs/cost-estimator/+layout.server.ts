import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
  const baseUrl = 'https://rydertech.ng';
  
  return {
    seo: {
      title: 'Free Website Cost Estimator | RyderTech Labs',
      description: 'Calculate website development costs instantly. Free AI-powered tool for Nigerian businesses, startups, and entrepreneurs. Get accurate estimates in NGN or USD.',
      keywords: 'website cost estimator Nigeria, web development cost Nigeria, how much does a website cost Nigeria, website price calculator Lagos, web design cost estimator, Nigeria website development pricing, affordable website cost Nigeria, business website cost Lagos, ecommerce website price Nigeria',
      canonical: `${baseUrl}/labs/cost-estimator`,
      og: {
        title: 'Free Website Cost Estimator | RyderTech Labs',
        description: 'Calculate website development costs instantly. Free AI-powered tool for Nigerian businesses.',
        type: 'website',
        url: `${baseUrl}/labs/cost-estimator`,
        image: `${baseUrl}/og/cost-estimator.jpg`
      },
      twitter: {
        card: 'summary_large_image',
        site: '@RyderTechLabs',
        title: 'Free Website Cost Estimator | RyderTech Labs',
        description: 'Calculate website development costs instantly. Free AI-powered tool for Nigerian businesses.',
        image: `${baseUrl}/og/cost-estimator-twitter.jpg`
      },
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        'name': 'Website Cost Estimator',
        'description': 'Free AI-powered tool to estimate website development costs for Nigerian businesses and startups.',
        'url': `${baseUrl}/labs/cost-estimator`,
        'applicationCategory': 'BusinessApplication',
        'operatingSystem': 'Any',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'creator': {
          '@type': 'Organization',
          'name': 'RyderTech Labs',
          'url': `${baseUrl}`
        }
      }
    }
  };
};