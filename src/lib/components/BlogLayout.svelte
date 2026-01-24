<script>

    let { title, date, author, excerpt, category, readTime, tags=[], image } = $props();
</script>

<svelte:head>
  <title>{title} - RyderTech Blog</title>
  <meta name="description" content={excerpt} />
</svelte:head>

<article class="min-h-screen bg-background pt-32 pb-20">
  <div class="container mx-auto max-w-4xl px-4">
    <!-- Blog Header -->
    <header class="text-center mb-12">
      <div class="inline-flex items-center space-x-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-semibold mb-6">
        <span>{category}</span>
      </div>
      
      <h1 class="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
        {title}
      </h1>
      
      <p class="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
        {excerpt}
      </p>

      <!-- Author & Meta Info -->
      <div class="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
        <div class="flex items-center space-x-2">
          <span>By {author}</span>
        </div>
        <div class="flex items-center space-x-2">
          <span>{new Date(date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
        <div class="flex items-center space-x-2">
          <span>{readTime}</span>
        </div>
      </div>
    </header>

    <!-- Featured Image -->
    {#if image}
      <div class="mb-12 rounded-2xl overflow-hidden">
        <img 
          src={image} 
          alt={title}
          class="w-full h-96 object-cover"
        />
      </div>
    {/if}

    <!-- Blog Content -->
    <div class="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-li:text-muted-foreground">
      <slot />
    </div>

    <!-- Tags -->
    {#if tags.length > 0}
      <div class="mt-12 pt-8 border-t border-border">
        <div class="flex flex-wrap gap-2">
          {#each tags as tag}
            <span class="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm">
              #{tag}
            </span>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Navigation -->
    <div class="mt-12 flex justify-between items-center pt-8 border-t border-border">
      <a href="/blog" class="text-primary hover:text-primary/80 font-semibold flex items-center">
        ← Back to Blog
      </a>
      <button 
        on:click={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        class="text-muted-foreground hover:text-foreground flex items-center"
      >
        Back to top ↑
      </button>
    </div>
  </div>
</article>

<style>
  .prose {
    line-height: 1.75;
  }
  
  .prose h2 {
    font-size: 1.875em;
    margin-top: 2em;
    margin-bottom: 1em;
  }
  
  .prose h3 {
    font-size: 1.5em;
    margin-top: 1.6em;
    margin-bottom: 0.8em;
  }
  
  .prose p {
    margin-bottom: 1.5em;
  }
  
  .prose code {
    background: var(--muted);
    padding: 0.2em 0.4em;
    border-radius: 0.25rem;
    font-size: 0.875em;
  }
  
  .prose pre {
    padding: 1.5em;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin: 1.5em 0;
  }
  
  .prose ul, .prose ol {
    margin: 1.5em 0;
    padding-left: 1.5em;
  }
  
  .prose li {
    margin: 0.5em 0;
  }
  
  .prose blockquote {
    border-left: 4px solid var(--primary);
    padding-left: 1.5em;
    margin: 1.5em 0;
    font-style: italic;
  }
</style>