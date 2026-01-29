<script lang="ts">
  import Seo from '$lib/components/seo/Seo.svelte';
  import Breadcrumbs from '$lib/components/seo/Breadcrumbs.svelte';

  const title = 'Port Harcourt Web Design — RyderTech Labs';
  const description = 'Web design services for Port Harcourt businesses: responsive sites, local SEO, and e-commerce solutions.';
  const canonical = 'https://rydertech.ng/locations/port-harcourt-web-design';
  const keywords = 'Port Harcourt web design, Port Harcourt website design, web design Port Harcourt';
  const og = { title, description, type: 'website', url: canonical, image: 'https://rydertech.ng/icons/og-image.png' };
  const twitter = { card: 'summary_large_image', site: '@rydertech', title, description, image: og.image };

  const breadcrumbs = [
    { name: 'Home', url: '/', current: false },
    { name: 'Locations', url: '/locations', current: false },
    { name: 'Port Harcourt Web Design', url: '/locations/port-harcourt-web-design', current: true }
  ];

  let faq1 = false;
  let faq2 = false;
</script>

<Seo {title} description={description} keywords={keywords} canonical={canonical} {og} {twitter} />

<div class="container mx-auto px-4 py-30">
  <Breadcrumbs items={breadcrumbs} />

  <header class="grid gap-6 md:grid-cols-3 items-start mb-8">
    <div class="md:col-span-2">
      <h1 class="text-3xl md:text-4xl font-extrabold leading-tight">Port Harcourt Web Design</h1>
      <p class="mt-3 text-muted-foreground max-w-3xl">We deliver reliable, conversion-focused websites and local SEO services for Port Harcourt companies. Our approach balances reliability on local networks with modern design and conversion optimisation.</p>

      <div class="mt-6 flex flex-wrap gap-3">
        <a href="/contact" class="inline-flex items-center px-5 py-3 bg-primary text-white rounded-md shadow-sm hover:opacity-95">Request a quote</a>
        <a href="/services" class="inline-flex items-center px-5 py-3 border rounded-md text-foreground hover:bg-gray-50">See our services</a>
      </div>
    </div>

    <aside class="rounded-lg border p-5 bg-white/50">
      <h3 class="font-semibold">Local to Port Harcourt?</h3>
      <p class="text-sm text-muted-foreground mt-2">We serve businesses across Port Harcourt and the Rivers state region available for remote and onsite work.</p>
      <dl class="mt-4 space-y-2 text-sm">
        <div>
          <dt class="font-medium">Typical project</dt>
          <dd>Small business site: ₦250,000 — ₦500,000+</dd>
        </div>
        <div>
          <dt class="font-medium">E-commerce</dt>
          <dd>From ₦500,000 — ₦1,500,000+</dd>
        </div>
      </dl>
      <a href="/contact" class="mt-4 inline-block text-sm font-medium text-primary">Contact us →</a>
    </aside>
  </header>

  <section class="grid gap-8 md:grid-cols-3 mb-12">
    <div class="md:col-span-2 space-y-6">
      <h2 class="text-2xl font-semibold">What we build</h2>
      <p class="text-muted-foreground">We create websites focused on reliability and conversions. Typical deliverables include:</p>
      <ul class="list-disc ml-5 space-y-2">
        <li>Responsive designs tuned for local usage patterns</li>
        <li>Local SEO and directory optimisation</li>
        <li>Conversion-focused pages and contact flows</li>
        <li>E-commerce with secure payments and inventory management</li>
        <li>CMS handover and training</li>
      </ul>

      <h3 class="text-xl font-semibold">Why choose RyderTech in Port Harcourt?</h3>
      <p class="text-muted-foreground">We understand local market and connectivity constraints and build sites that perform well while converting visitors into customers.</p>

      <h3 class="text-xl font-semibold">Quick case studies</h3>
      <div class="space-y-4">
        <article class="p-4 border rounded">
          <h4 class="font-medium">Restaurant ordering</h4>
          <p class="text-sm text-muted-foreground mt-1">Built an ordering site with simple checkout that boosted online orders and phone bookings.</p>
        </article>
        <article class="p-4 border rounded">
          <h4 class="font-medium">Trades business site</h4>
          <p class="text-sm text-muted-foreground mt-1">Launched a portfolio site that improved lead quality and local discovery.</p>
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
        <h4 class="font-semibold">Local SEO boost</h4>
        <p class="text-sm text-muted-foreground mt-1">We optimise for Port Harcourt searches so customers can find you locally.</p>
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
