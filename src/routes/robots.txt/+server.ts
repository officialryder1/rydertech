import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const robots = `User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /a/admin/

Sitemap: https://rydertech.ng/sitemap.xml

# Nigerian search engine focus
Host: https://rydertech.ng`;

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain'
    }
  });
};