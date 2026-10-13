
import { publishedOnly } from '$lib/postPublish';

/**
 * NOTE: this layout deliberately does NOT set `prerender = true`.
 *
 * Publish dates are gated at REQUEST time (see $lib/postPublish.ts) so the drip
 * publishes on schedule without a redeploy. Prerendering would bake the publish
 * set into static HTML at build time, and every drip date would then need a
 * rebuild — the opposite of what a drip is for.
 */

export async function load() {
    const posts = import.meta.glob(`$lib/posts/*.svx`, { eager: true });

    

    const all = Object.entries(posts).map(([path, post]) => {
        const slug = path.split('/').pop().replace('.svx', '');
        return {
            ...post.metadata,
            slug,
            path: `/blog/${slug}`
        };
    });

    // Only posts whose publish date has arrived, newest first, so the index and
    // the "featured" pick agree on what "latest" means.
    const visible = publishedOnly(all).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return { posts: visible };
}