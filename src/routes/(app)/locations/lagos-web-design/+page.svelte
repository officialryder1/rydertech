<script lang="ts">
  import Seo from '$lib/components/seo/Seo.svelte';
  import Breadcrumbs from '$lib/components/seo/Breadcrumbs.svelte';

  const title = 'Lagos Web Design — RyderTech Labs';
  const description = 'Professional web design in Lagos: responsive websites, e-commerce, SEO, and conversion-focused design for businesses in Lagos.';
  const canonical = 'https://rydertech.ng/locations/lagos-web-design';
  const keywords = 'Lagos web design, Lagos website design, web design Lagos, Nigeria web design';
  const og = { title, description, type: 'website', url: canonical, image: 'https://rydertech.ng/icons/og-image.png' };
  const twitter = { card: 'summary_large_image', site: '@rydertech', title, description, image: og.image };

  const breadcrumbs = [
    { name: 'Home', url: '/', current: false },
    { name: 'Locations', url: '/locations', current: false },
    { name: 'Lagos Web Design', url: '/locations/lagos-web-design', current: true }
  ];

  let faq1 = false;
  let faq2 = false;
</script>

<Seo {title} description={description} keywords={keywords} canonical={canonical} {og} {twitter} />

<div class="container mx-auto px-4 py-30">
  <Breadcrumbs items={breadcrumbs} />

  <header class="grid gap-6 md:grid-cols-3 items-start mb-8">
    <div class="md:col-span-2">
      <h1 class="text-3xl md:text-4xl font-extrabold leading-tight">Lagos Web Design</h1>
      <p class="mt-3 text-muted-foreground max-w-3xl">We build high-performance, mobile-first websites for Lagos businesses. Our work focuses on speed, accessibility and conversion optimisation so you capture Lagos traffic.</p>

      <div class="mt-6 flex flex-wrap gap-3">
        <a href="/contact" class="inline-flex items-center px-5 py-3 bg-primary text-white rounded-md shadow-sm hover:opacity-95">Get a free estimate</a>
        <a href="/services" class="inline-flex items-center px-5 py-3 border rounded-md text-foreground hover:bg-gray-50">See our services</a>
      </div>
    </div>

    <aside class="rounded-lg border p-5 bg-white/50">
      <h3 class="font-semibold">Local to Lagos?</h3>
      <p class="text-sm text-muted-foreground mt-2">We work with Lagos brands of all sizes — we understand local market behaviour and fast mobile networks.</p>
      <dl class="mt-4 space-y-2 text-sm">
        <div>
          <dt class="font-medium">Typical project</dt>
          <dd>Small business site: ₦250,000 — ₦500,000+</dd>
        </div>
        <div>
          <dt class="font-medium">E-commerce</dt>
          <dd>From ₦500,000 — ₦1,800,000+</dd>
        </div>
      </dl>
      <a href="/contact" class="mt-4 inline-block text-sm font-medium text-primary">Contact us →</a>
    </aside>
  </header>

  <section class="grid gap-8 md:grid-cols-3 mb-12">
    <div class="md:col-span-2 space-y-6">
      <h2 class="text-2xl font-semibold">What we build</h2>
      <p class="text-muted-foreground">Our Lagos projects prioritise performance and conversions. Typical deliverables include:</p>
      <ul class="list-disc ml-5 space-y-2">
        <li>Mobile-first responsive design for Lagos audiences</li>
        <li>SEO-friendly structure and local optimisation</li>
        <li>Conversion-focused landing pages and checkout flows</li>
        <li>E-commerce stores with local and international payment support</li>
        <li>Content management and analytics setup</li>
      </ul>

      <h3 class="text-xl font-semibold">Why choose RyderTech in Lagos?</h3>
      <p class="text-muted-foreground">We pair Lagos market knowledge with modern web practices: fast builds, lightweight pages, and pragmatic SEO that drives local traffic and sales.</p>

      <h3 class="text-xl font-semibold">Quick case studies</h3>
      <div class="space-y-4">
        <article class="p-4 border rounded">
          <h4 class="font-medium">Marketplace launch</h4>
          <p class="text-sm text-muted-foreground mt-1">Built a headless storefront with optimised product discovery and improved conversion rates.</p>
        </article>
        <article class="p-4 border rounded">
          <h4 class="font-medium">Service booking platform</h4>
          <p class="text-sm text-muted-foreground mt-1">Redesigned a booking funnel to reduce drop-offs and increase completed bookings.</p>
        </article>
      </div>
    </div>

    <aside class="space-y-4">
      <div class="p-4 border rounded">
        <h4 class="font-semibold">Free discovery call</h4>
        <p class="text-sm text-muted-foreground mt-1">Book a 30-minute call to scope your project and get a transparent estimate.</p>
        <a href="/contact" class="mt-3 inline-block px-4 py-2 bg-primary text-white rounded">Book now</a>
      </div>

      <div class="p-4 border rounded">
        <h4 class="font-semibold">Performance optimisations</h4>
        <p class="text-sm text-muted-foreground mt-1">We tune sites for Lagos networks to improve load times and conversions.</p>
      </div>
    </aside>
  </section>


  <section class="prose max-w-none">
    <h2>Frequently asked questions</h2>

    <div class="mt-3">
      <button
        class="w-full text-left font-medium flex items-center justify-between"
        aria-expanded={faq1}
        on:click={() => (faq1 = !faq1)}>
        <span>How long does a website take?</span>
        <svg class="w-4 h-4 ml-3 transition-transform" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg" style:transform={faq1 ? 'rotate(90deg)' : 'rotate(0deg)'}>
          <path d="M6 4l8 6-8 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      {#if faq1}
        <p class="mt-2 text-muted-foreground">A small business site typically takes 3–6 weeks. E-commerce projects vary based on integrations and catalogue size.</p>
      {/if}
    </div>

    <div class="mt-3">
      <button
        class="w-full text-left font-medium flex items-center justify-between"
        aria-expanded={faq2}
        on:click={() => (faq2 = !faq2)}>
        <span>Do you offer payment integration?</span>
        <svg class="w-4 h-4 ml-3 transition-transform" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg" style:transform={faq2 ? 'rotate(90deg)' : 'rotate(0deg)'}>
          <path d="M6 4l8 6-8 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      {#if faq2}
        <p class="mt-2 text-muted-foreground">Yes — we integrate local payment gateways and international processors depending on your needs.</p>
      {/if}
    </div>
  </section>
</div>
