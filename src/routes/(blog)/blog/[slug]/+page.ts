import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const posts = import.meta.glob('$lib/posts/*.svx');
    if(!posts) {
        error(404, 'No posts found');
    }

    for (const[path, resolver] of Object.entries(posts)) {
        const slug = path.split('/').pop()?.replace('.svx', '')

        if (slug === params.slug) {
            const post = await resolver();

            return {
                post,
                slug
            }
        }
    }
}