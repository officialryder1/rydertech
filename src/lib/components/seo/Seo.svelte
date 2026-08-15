<script lang="ts">
  export let title: string;
  export let description: string;
  export let keywords: string;
  export let canonical: string;
  export let og: {
    title: string;
    description: string;
    type: string;
    url: string;
    image: string;
  };
  export let twitter: {
    card: string;
    site: string;
    title: string;
    description: string;
    image: string;
  };
  // Optional JSON-LD structured data object (e.g. LocalBusiness, Service).
  // We build the full <script> element as an HTML string and inject it with
  // {@html} because Svelte does NOT process template directives inside a
  // <script> tag nested within <svelte:head> — it passes that tag through raw.
  export let jsonLd: Record<string, unknown> | null = null;
  const jsonLdHtml = jsonLd
    ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}<\/script>`
    : '';
</script>

<svelte:head>
  <!-- Primary Meta Tags -->
  <title>{title}</title>
  <meta name="title" content={title} />
  <meta name="description" content={description} />
  <meta name="keywords" content={keywords} />
  <link rel="canonical" href={canonical} />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content={og.type} />
  <meta property="og:url" content={og.url} />
  <meta property="og:title" content={og.title} />
  <meta property="og:description" content={og.description} />
  <meta property="og:image" content={og.image} />
  <meta property="og:locale" content="en_NG" />
  <meta property="og:site_name" content="RyderTech" />

  <!-- Twitter -->
  <meta property="twitter:card" content={twitter.card} />
  <meta property="twitter:url" content={og.url} />
  <meta property="twitter:title" content={twitter.title} />
  <meta property="twitter:description" content={twitter.description} />
  <meta property="twitter:image" content={twitter.image} />
  <meta property="twitter:site" content={twitter.site} />
  
  <!-- Additional SEO Meta Tags -->
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
  <meta name="author" content="RyderTech" />
  <meta name="copyright" content="RyderTech" />
  <meta name="geo.region" content="NG-LA" />
  <meta name="geo.placename" content="Lagos, Nigeria" />
  <meta name="geo.position" content="6.524379;3.379206" />
  <meta name="ICBM" content="6.524379, 3.379206" />
  
  <!-- Mobile Specific -->
  <meta name="theme-color" content="#3b82f6" />
  <meta name="apple-mobile-web-app-title" content="RyderTech" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

  {#if jsonLd}
    {@html jsonLdHtml}
  {/if}
</svelte:head>