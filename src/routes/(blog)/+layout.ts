
export const prerender = true;

export async function load() {
    const posts = import.meta.glob(`$lib/posts/*.svx`, { eager: true });

    

    return {
        posts: Object.entries(posts).map(([path, post]) => {
            const slug = path
                .split('/')
                .pop()
                .replace('.svx', '');
            
            return {
                ...post.metadata,
                slug,
                path: `/blog/${slug}`
            };
        })
    };
}