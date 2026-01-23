<script lang="ts">
  
  import { page } from '$app/stores';
  
  // Import SEO components
  import Seo from '$lib/components/seo/Seo.svelte';
  import Breadcrumbs from '$lib/components/seo/Breadcrumbs.svelte';
  import FAQSchema from '$lib/components/seo/FAQSchema.svelte';
  
  let { data } = $page;
</script>

<!-- SEO Meta Tags -->
<Seo {...data.seo} />

<!-- Structured Data -->
<svelte:head>
  <script type="application/ld+json">
    {JSON.stringify(data.seo.structuredData)}
  </script>
</svelte:head>

<!-- Breadcrumb Navigation -->
<Breadcrumbs 
  items={[
    { name: 'Home', url: '/' },
    { name: 'Labs', url: '/labs' },
    { name: 'Cost Estimator', url: '/labs/cost-estimator', current: true }
  ]} 
/>

<!-- Main Content -->
<slot />

<!-- FAQ Schema Component -->
<FAQSchema 
  questions={[
    {
      question: 'How accurate is the website cost estimator?',
      answer: 'Our estimator provides a realistic range based on 50+ projects completed in Nigeria. While not a final quote, it gives you a solid starting point for budgeting your website development.'
    },
    {
      question: 'Can I get an estimate in Nigerian Naira (NGN)?',
      answer: 'Yes! Our tool supports both USD and NGN. We use real-time exchange rates to provide accurate NGN estimates for Nigerian businesses.'
    },
    {
      question: 'How long does it take to get a website estimate?',
      answer: 'The estimator takes about 2 minutes to complete. Just answer 5-7 simple questions about your project requirements.'
    },
    {
      question: 'What factors affect website development costs in Nigeria?',
      answer: 'Key factors include: project type (landing page vs e-commerce), number of pages, advanced features (payments, user accounts), design requirements, and timeline urgency.'
    },
    {
      question: 'Is this tool free to use?',
      answer: 'Yes, the Website Cost Estimator is completely free. No signup required. It\'s part of RyderTech Labs free tools for entrepreneurs.'
    }
  ]}
/>