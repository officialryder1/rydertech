import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const baseUrl = 'https://rydertech.ng';
  const pages = [
    '',
    '/services/web-design-nigeria',
    '/services/software-development-nigeria',
    '/work',
    '/reviews',
    '/contact',
    '/blog',
    '/blog/web-design-cost-nigeria'
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages.map(page => `
  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>
  `).join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml'
    }
  });
};