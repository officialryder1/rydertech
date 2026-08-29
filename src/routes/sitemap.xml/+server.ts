import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const baseUrl = 'https://rydertech.ng';
  const pages = [
    { path: '', priority: '1.0', freq: 'daily' },
    { path: '/services', priority: '0.9', freq: 'weekly' },
    { path: '/services/ai', priority: '0.9', freq: 'weekly' },
    { path: '/services/web-design-in-nigeria', priority: '0.8', freq: 'monthly' },
    { path: '/about', priority: '0.6', freq: 'monthly' },
    { path: '/work', priority: '0.7', freq: 'monthly' },
    { path: '/reviews', priority: '0.7', freq: 'weekly' },
    { path: '/contact', priority: '0.8', freq: 'monthly' },
    { path: '/blog', priority: '0.7', freq: 'weekly' },
    { path: '/labs', priority: '0.8', freq: 'weekly' },
    { path: '/labs/gateway-calc', priority: '0.9', freq: 'monthly' },
    { path: '/labs/ops-drain', priority: '0.9', freq: 'monthly' },
    { path: '/labs/event-access-risk', priority: '0.9', freq: 'monthly' },
    { path: '/labs/revleak', priority: '0.9', freq: 'monthly' },
    { path: '/labs/cost-estimator', priority: '0.9', freq: 'monthly' },
    { path: '/labs/website-rater', priority: '0.9', freq: 'monthly' },
    { path: '/labs/visibility', priority: '0.9', freq: 'monthly' },
    { path: '/labs/aeo-readiness', priority: '0.9', freq: 'monthly' },
    { path: '/labs/clausescan', priority: '0.9', freq: 'monthly' },
    { path: '/courses', priority: '0.8', freq: 'weekly' },
    { path: '/courses/ai-automation-mastery', priority: '0.8', freq: 'monthly' },
    { path: '/courses/ai-video-generation-ads', priority: '0.8', freq: 'monthly' },
    { path: '/courses/llm-chatbots-agents', priority: '0.8', freq: 'monthly' },
    { path: '/courses/no-code-ai-business-ops', priority: '0.8', freq: 'monthly' },
    { path: '/blog/ai-chatbot-nigeria', priority: '0.8', freq: 'monthly' },
    { path: '/blog/computer-vision-nigeria', priority: '0.8', freq: 'monthly' },
    { path: '/blog/whatsapp-ai-assistant-nigeria', priority: '0.8', freq: 'monthly' },
    { path: '/blog/ml-automation-smes-nigeria', priority: '0.8', freq: 'monthly' },
    { path: '/blog/slow-website-revenue-loss', priority: '0.8', freq: 'monthly' },
    { path: '/blog/web-development-agency-abuja', priority: '0.8', freq: 'monthly' },
    { path: '/locations', priority: '0.7', freq: 'monthly' },
    { path: '/locations/abuja-web-design', priority: '0.8', freq: 'monthly' },
    { path: '/locations/lagos-web-design', priority: '0.8', freq: 'monthly' },
    { path: '/locations/port-harcourt-web-design', priority: '0.8', freq: 'monthly' }
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages.map(p => `  <url>
    <loc>${baseUrl}${p.path}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml'
    }
  });
};
