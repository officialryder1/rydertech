<script lang="ts">
  import Seo from '$lib/components/seo/Seo.svelte';
  import Breadcrumbs from '$lib/components/seo/Breadcrumbs.svelte';

  const title = 'Locations — RyderTech Labs';
  const description = 'Find RyderTech services across Nigerian cities: Abuja, Lagos, Port Harcourt and more.';
  const canonical = 'https://rydertech.ng/locations';
  const keywords = 'locations, Abuja, Lagos, Port Harcourt, web design Nigeria';
  const og = { title, description, type: 'website', url: canonical, image: 'https://rydertech.ng/icons/og-image.png' };
  const twitter = { card: 'summary_large_image', site: '@rydertech', title, description, image: og.image };

  const breadcrumbs = [
    { name: 'Home', url: '/', current: false },
    { name: 'Locations', url: '/locations', current: true }
  ];
</script>

<Seo {title} description={description} keywords={keywords} canonical={canonical} {og} {twitter} />

<div class="container mx-auto px-4 py-30">
  <Breadcrumbs items={breadcrumbs} />

  <header class="mb-8">
    <h1 class="text-3xl font-extrabold">Locations</h1>
    <p class="mt-2 text-muted-foreground">We offer web design and digital services across Nigeria. Choose your city to learn more.</p>
  </header>

  <section class="grid gap-6 md:grid-cols-3">
    <a href="/locations/abuja-web-design" class="p-6 border rounded hover:shadow">
      <h3 class="font-semibold">Abuja Web Design</h3>
      <p class="text-sm text-muted-foreground mt-2">Local websites, SEO and e-commerce for Abuja businesses.</p>
    </a>

    <a href="/locations/lagos-web-design" class="p-6 border rounded hover:shadow">
      <h3 class="font-semibold">Lagos Web Design</h3>
      <p class="text-sm text-muted-foreground mt-2">Fast, mobile-first sites optimised for Lagos audiences.</p>
    </a>

    <a href="/locations/port-harcourt-web-design" class="p-6 border rounded hover:shadow">
      <h3 class="font-semibold">Port Harcourt Web Design</h3>
      <p class="text-sm text-muted-foreground mt-2">Reliable websites and local SEO for Port Harcourt businesses.</p>
    </a>
  </section>
</div>
