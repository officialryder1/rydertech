<script>
  let { data } = $props();
  const { post } = data;
  
  // Format date once
  const formattedDate = new Date(post.metadata.date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Handle scroll to top
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
</script>

<article class="max-w-3xl mx-auto px-4 py-10 prose prose-sm sm:prose-base lg:prose-lg">
  <div class="container mx-auto max-w-4xl px-4">
    <!-- Blog Header -->
    <header class="text-center mb-12">
      <div class="inline-flex items-center space-x-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-semibold mb-6">
        <span>{post.metadata.category}</span>
      </div>
      
      <h1 class="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
        {post.metadata.title}
      </h1>
      
      <p class="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
        {post.metadata.excerpt}
      </p>

      <!-- Author & Meta Info -->
      <div class="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
        <div class="flex items-center space-x-2">
          <span>By {post.metadata.author}</span>
        </div>
        <div class="flex items-center space-x-2">
          <span>{formattedDate}</span>
        </div>
        <div class="flex items-center space-x-2">
          <span>{post.metadata.readTime}</span>
        </div>
      </div>
    </header>

    <!-- Featured Image -->
    {#if post.metadata.image}
      <div class="mb-12 rounded-2xl overflow-hidden shadow-lg">
        <img 
          src={post.metadata.image} 
          alt={post.metadata.title}
          class="w-full h-96 object-cover"
          loading="eager"
        />
      </div>
    {/if}

    <!-- Blog Content -->
    <div class="prose prose-lg max-w-none 
                prose-headings:text-foreground 
                prose-p:text-muted-foreground 
                prose-a:text-primary hover:prose-a:text-primary/80
                prose-strong:text-foreground 
                prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:rounded
                prose-pre:bg-muted prose-pre:border prose-pre:border-border
                prose-li:text-muted-foreground
                prose-blockquote:border-primary prose-blockquote:bg-primary/5
                prose-img:rounded-lg prose-img:shadow-md
                prose-table:border-border prose-th:bg-muted
                prose-hr:border-border">
      <svelte:component this={post.default} />
    </div>

    <!-- Tags -->
    {#if post.metadata.tags && post.metadata.tags.length > 0}
      <div class="mt-12 pt-8 border-t border-border">
        <h4 class="text-sm font-semibold text-muted-foreground mb-3">Tags</h4>
        <div class="flex flex-wrap gap-2">
          {#each post.metadata.tags as tag}
            <span class="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm hover:bg-primary/10 hover:text-primary transition-colors cursor-default">
              #{tag}
            </span>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Navigation -->
    <div class="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-border">
      <a 
        href="/blog" 
        class="text-primary hover:text-primary/80 font-semibold flex items-center group transition-colors"
      >
        <span class="group-hover:-translate-x-1 transition-transform">←</span>
        <span class="ml-2">Back to Blog</span>
      </a>
      
      <div class="flex items-center gap-4 text-sm text-muted-foreground">
        <span>Share:</span>
        <div class="flex gap-2">
          <button class="hover:text-foreground transition-colors" title="Share on Twitter">
            🐦
          </button>
          <button class="hover:text-foreground transition-colors" title="Share on LinkedIn">
            💼
          </button>
          <button class="hover:text-foreground transition-colors" title="Copy link">
            🔗
          </button>
        </div>
      </div>
      
      <button 
        on:click={scrollToTop}
        class="text-muted-foreground hover:text-foreground flex items-center transition-colors group"
      >
        <span class="mr-2">Back to top</span>
        <span class="group-hover:-translate-y-0.5 transition-transform">↑</span>
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
    font-weight: 700;
  }
  
  .prose h3 {
    font-size: 1.5em;
    margin-top: 1.6em;
    margin-bottom: 0.8em;
    font-weight: 600;
  }

  .prose h4 {
    font-size: 1.25em;
    margin-top: 1.4em;
    margin-bottom: 0.6em;
    font-weight: 600;
  }
  
  .prose p {
    margin-bottom: 1.5em;
  }
  
  .prose code:not(pre code) {
    background: var(--muted);
    padding: 0.2em 0.4em;
    border-radius: 0.25rem;
    font-size: 0.875em;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  }
  
  .prose pre {
    padding: 1.5em;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin: 1.5em 0;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    line-height: 1.5;
  }

  .prose pre code {
    background: none;
    padding: 0;
    border-radius: 0;
  }
  
  .prose ul, .prose ol {
    margin: 1.5em 0;
    padding-left: 1.5em;
  }
  
  .prose li {
    margin: 0.5em 0;
  }

  .prose li > p {
    margin: 0;
  }
  
  .prose blockquote {
    border-left: 4px solid var(--primary);
    padding: 1em 1.5em;
    margin: 1.5em 0;
    font-style: italic;
    background: var(--primary)/5;
    border-radius: 0 0.5rem 0.5rem 0;
  }

  .prose blockquote > :first-child {
    margin-top: 0;
  }

  .prose blockquote > :last-child {
    margin-bottom: 0;
  }

  .prose table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5em 0;
  }

  .prose th,
  .prose td {
    border: 1px solid var(--border);
    padding: 0.75em;
    text-align: left;
  }

  .prose th {
    font-weight: 600;
  }

  .prose hr {
    border: none;
    border-top: 1px solid var(--border);
    margin: 2em 0;
  }

  /* Ensure images are responsive */
  .prose img {
    max-width: 100%;
    height: auto;
  }

  /* Better link styling */
  .prose a {
    text-decoration: none;
    font-weight: 500;
    border-bottom: 1px solid transparent;
    transition: all 0.2s ease;
  }

  .prose a:hover {
    border-bottom-color: var(--primary);
  }

  /* Improve list styling */
  .prose ul {
    list-style-type: disc;
  }

  .prose ol {
    list-style-type: decimal;
  }

  .prose li::marker {
    color: var(--primary);
  }

  :global(p){
    margin-bottom: 1.25rem;
  }

  :global(img){
    margin: 1rem 0;
	  border-radius: 0.5rem;
  }
</style>