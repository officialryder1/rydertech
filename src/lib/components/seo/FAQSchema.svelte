<script lang="ts">
  export let questions: Array<{
    question: string;
    answer: string;
  }>;
</script>

<svelte:head>
    <script lang="ts">
  export let questions: Array<{
    question: string;
    answer: string;
  }>;
</script>

<svelte>
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {@const questions}
        {#each questions as item, index}
          {
            "@type": "Question",
            "name": "{@html item.question.replace(/"/g, '\\"')}",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "{@html item.answer.replace(/"/g, '\\"')}"
            }
          }{@const isLast = index === questions.length - 1}{#if !isLast},{/if}
        {/each}
      ]
    }
  </script>
</svelte:head>