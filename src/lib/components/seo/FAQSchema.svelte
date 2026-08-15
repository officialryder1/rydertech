<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    questions
  }: {
    questions: Array<{ question: string; answer: string }>;
  } = $props();

  // Build a valid schema.org FAQPage JSON-LD object and serialize it once.
  // We escape '<' so the JSON can never break out of the <script> tag context.
  const json = JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: questions.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer
        }
      }))
    },
    null,
    2
  ).replace(/</g, '\\u003c');
</script>

<svelte:head>
  {@html `<script type="application/ld+json">${json}<\/script>`}
</svelte:head>
