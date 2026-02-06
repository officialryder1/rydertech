<script lang="ts">
  export let items: Array<{
    name: string;
    url: string;
    current?: boolean;
  }>;
</script>

<nav class="py-4 px-5" aria-label="Breadcrumb">
  <ol class="flex flex-wrap items-center space-x-2 text-sm">
    {#each items as item, index}
      <li class="flex items-center">
        {#if index > 0}
          <svg class="w-4 h-4 mx-2 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        {/if}
        {#if item.current}
          <span class="font-medium text-primary" aria-current="page">
            {item.name}
          </span>
        {:else}
          <a href={item.url} class="text-muted-foreground hover:text-foreground transition-colors">
            {item.name}
          </a>
        {/if}
      </li>
    {/each}
  </ol>
</nav>

<svelte:head>
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {@const items}
        {#each items as item, index}
          {
            "@type": "ListItem",
            "position": {index + 1},
            "name": "{item.name}",
            "item": "https://rydertech.ng{item.url}"
          }{@const isLast = index === items.length - 1}{#if !isLast},{/if}
        {/each}
      ]
    }
  </script>
</svelte:head>