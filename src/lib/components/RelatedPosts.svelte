<script lang="ts">
  import { ArrowRight } from '@lucide/svelte';
  import { Badge } from '$lib/components/ui/badge';
  import { Card, CardContent } from '$lib/components/ui/card';

  interface PostMeta {
    title?: string;
    slug?: string;
    category?: string;
    excerpt?: string;
    image?: string;
    tags?: string[];
    date?: string;
    [key: string]: unknown;
  }

  let { currentSlug = '', tags = [] }: { currentSlug?: string; tags?: string[] } = $props();

  // Import all blog posts via glob
  const modules = import.meta.glob('/src/lib/posts/*.svx', {
    eager: true,
  }) as Record<string, { metadata?: PostMeta }>;

  // Build posts list with metadata
  let allPosts = $derived(
    Object.entries(modules)
      .map(([path, mod]) => {
        const slug = path.split('/').pop()?.replace('.svx', '') ?? '';
        return {
          slug,
          ...(mod.metadata || {}),
          path: `/blog/${slug}`,
        };
      })
      .filter(p => p.slug && p.slug !== currentSlug)
  );

  // Find related posts: match on tags, then category
  let relatedPosts = $derived.by(() => {
    const currentTags = Array.isArray(tags) ? tags : [];
    if (currentTags.length === 0) {
      // No tags — show 3 most recent posts
      return allPosts.slice(0, 3);
    }

    // Score by tag overlap
    const scored = allPosts.map(post => {
      const postTags = Array.isArray(post.tags) ? post.tags : [];
      const overlap = currentTags.filter(t => postTags.includes(t)).length;
      return { post, score: overlap };
    });

    // Sort by score desc, then by date desc
    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const da = a.post.date ? new Date(a.post.date).getTime() : 0;
        const db = b.post.date ? new Date(b.post.date).getTime() : 0;
        return db - da;
      })
      .slice(0, 3)
      .map(s => s.post);
  });
</script>

{#if relatedPosts.length > 0}
  <div class="mt-16 pt-12 border-t border-border">
    <h3 class="text-xl font-bold text-foreground mb-2">Related Reading</h3>
    <p class="text-sm text-muted-foreground mb-6">
      Articles with similar topics you might find useful.
    </p>
    <div class="grid md:grid-cols-3 gap-6">
      {#each relatedPosts as post}
        <Card class="group hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-border">
          {#if post.image}
            <div class="relative h-40 overflow-hidden">
              <img
                src={post.image}
                alt={post.title ?? 'Article image'}
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          {/if}
          <CardContent class="p-5">
            <Badge variant="outline" class="text-xs mb-3">
              {post.category}
            </Badge>
            <h4 class="font-bold text-gray-900 mb-2 text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {post.title}
            </h4>
            <p class="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
            <a
              href={post.path}
              class="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Read article
              <ArrowRight class="w-3 h-3" />
            </a>
          </CardContent>
        </Card>
      {/each}
    </div>
  </div>
{/if}
