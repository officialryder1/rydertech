import type { RequestHandler } from './$types';
import { publishedOnly } from '$lib/postPublish';

export const GET: RequestHandler = async () => {
  const baseUrl = 'https://rydertech.ng';

  // Blog post URLs are DERIVED from the post files, not hardcoded — a hardcoded
  // list rots every time a post is added, and it cannot know about publish dates.
  // Gating here matters: a future-dated post in the sitemap is a 404 Google will
  // crawl and index as an error.
  const postModules = import.meta.glob('$lib/posts/*.svx', { eager: true }) as Record<
    string,
    { metadata: { date: string | Date } }
  >;
  const postPaths = publishedOnly(
    Object.entries(postModules).map(([path, post]) => ({
      slug: path.split('/').pop()!.replace('.svx', ''),
      date: post.metadata.date
    }))
  )
    .map((p) => ({ path: `/blog/${p.slug}`, priority: '0.8', freq: 'monthly' }))
    .sort((a, b) => a.path.localeCompare(b.path));

  const pages = [
    { path: '', priority: '1.0', freq: 'daily' },
    { path: '/services', priority: '0.9', freq: 'weekly' },
    { path: '/services/ai', priority: '0.9', freq: 'weekly' },
    { path: '/services/web-design-in-nigeria', priority: '0.8', freq: 'monthly' },
    { path: '/about', priority: '0.6', freq: 'monthly' },
    { path: '/terms', priority: '0.4', freq: 'yearly' },
    { path: '/privacy', priority: '0.4', freq: 'yearly' },
    { path: '/work', priority: '0.7', freq: 'monthly' },
    { path: '/reviews', priority: '0.7', freq: 'weekly' },
    { path: '/contact', priority: '0.8', freq: 'monthly' },
    { path: '/blog', priority: '0.7', freq: 'weekly' },
    { path: '/labs', priority: '0.8', freq: 'weekly' },
    { path: '/automation-audit', priority: '0.9', freq: 'weekly' },
    { path: '/labs/gateway-calc', priority: '0.9', freq: 'monthly' },
    { path: '/labs/ops-drain', priority: '0.9', freq: 'monthly' },
    { path: '/labs/event-access-risk', priority: '0.9', freq: 'monthly' },
    { path: '/labs/revleak', priority: '0.9', freq: 'monthly' },
    { path: '/labs/cost-estimator', priority: '0.9', freq: 'monthly' },
    { path: '/labs/website-rater', priority: '0.9', freq: 'monthly' },
    { path: '/labs/visibility', priority: '0.9', freq: 'monthly' },
    { path: '/labs/aeo-readiness', priority: '0.9', freq: 'monthly' },
    { path: '/labs/clausescan', priority: '0.9', freq: 'monthly' },
    { path: '/labs/q-day-readiness', priority: '0.9', freq: 'monthly' },
    { path: '/labs/gpt-6-checker', priority: '0.9', freq: 'monthly' },
    { path: '/labs/headline-studio', priority: '0.9', freq: 'monthly' },
    { path: '/labs/content-repurposer', priority: '0.9', freq: 'monthly' },
    { path: '/labs/agentic-workflow-cost', priority: '0.9', freq: 'monthly' },
    { path: '/labs/agent-templates', priority: '0.8', freq: 'monthly' },
    { path: '/labs/voice-agent', priority: '0.9', freq: 'monthly' },
    { path: '/findings-ng', priority: '0.8', freq: 'monthly' },
    { path: '/courses', priority: '0.8', freq: 'weekly' },
    { path: '/courses/ai-automation-mastery', priority: '0.8', freq: 'monthly' },
    { path: '/courses/ai-video-generation-ads', priority: '0.8', freq: 'monthly' },
    { path: '/courses/llm-chatbots-agents', priority: '0.8', freq: 'monthly' },
    { path: '/courses/no-code-ai-business-ops', priority: '0.8', freq: 'monthly' },
    { path: '/locations', priority: '0.7', freq: 'monthly' },
    { path: '/locations/abuja-web-design', priority: '0.8', freq: 'monthly' },
    { path: '/locations/lagos-web-design', priority: '0.8', freq: 'monthly' },
    { path: '/locations/port-harcourt-web-design', priority: '0.8', freq: 'monthly' },
    ...postPaths
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
