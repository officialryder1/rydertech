<script lang="ts">
  import { Globe, CheckCircle, Zap, Shield } from '@lucide/svelte';
  
  const services = [
    { title: 'Responsive Website Design', description: 'Mobile-friendly websites that work perfectly on all devices' },
    { title: 'E-commerce Development', description: 'Online stores with secure payment integration for Nigerian businesses' },
    { title: 'Corporate Website Design', description: 'Professional websites for Nigerian companies and organizations' },
    { title: 'WordPress Development', description: 'Custom WordPress themes and plugins for Nigerian clients' },
    { title: 'SEO-Optimized Websites', description: 'Websites built to rank high on Google Nigeria search results' },
    { title: 'Website Maintenance', description: 'Ongoing support and updates for Nigerian websites' }
  ];
  
  const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'Benin City', 'Aba', 'Onitsha'];
</script>

<svelte:head>
  <title>Web Design Agency Nigeria | Professional Website Development Services</title>
  <meta name="description" content="RyderTech is Nigeria's leading web design agency. We create professional, responsive websites for businesses across Lagos, Abuja, and all Nigerian cities. Get a free quote today!" />
  <meta name="keywords" content="web design Nigeria, website development Nigeria, Nigerian web agency, Lagos web design, Abuja website developers, e-commerce Nigeria" />
  
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Web Design & Development",
    "provider": {
      "@type": "LocalBusiness",
      "name": "RyderTech",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "NG",
        "addressRegion": "Abuja",
        "addressLocality": "Nigeria"
      }
    },
    "areaServed": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": 9.05785,
        "longitude": 7.49508
      },
      "geoRadius": "1000"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Web Design Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Business Website Design"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "E-commerce Development"
          }
        }
      ]
    }
  }
  </script>
</svelte:head>

<div class="min-h-screen bg-white">
  <!-- Hero Section -->
  <section class="pt-32 pb-20 px-4 bg-gradient-to-br from-blue-50 to-white">
    <div class="container mx-auto max-w-6xl">
      <div class="text-center">
        <h1 class="text-4xl md:text-6xl font-black text-gray-900 mb-6">
          Professional <span class="text-blue-600">Web Design Agency</span> in Nigeria
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          We create stunning, responsive websites for Nigerian businesses that convert visitors into customers. Serving clients across Lagos, Abuja, Port Harcourt, and all Nigerian cities.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/contact" class="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
            Get Free Website Quote
          </a>
          <a href="tel:+2349033147769" class="px-8 py-4 border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors">
            Call: +234 903 314 7769
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- Services -->
  <section class="py-20 px-4">
    <div class="container mx-auto max-w-6xl">
      <h2 class="text-3xl font-black text-center text-gray-900 mb-12">
        Web Design Services for <span class="text-blue-600">Nigerian Businesses</span>
      </h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each services as service}
          <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-blue-100 rounded-lg">
                <CheckCircle class="w-6 h-6 text-blue-600" />
              </div>
              <h3 class="font-bold text-lg text-gray-900">{service.title}</h3>
            </div>
            <p class="text-gray-600">{service.description}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Cities We Serve -->
  <section class="py-20 bg-gray-50">
    <div class="container mx-auto max-w-6xl px-4">
      <h2 class="text-3xl font-black text-center text-gray-900 mb-12">
        Web Design Services Across <span class="text-blue-600">Nigeria</span>
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        {#each cities as city}
          <div class="text-center p-4 bg-white rounded-xl shadow-sm">
            <Globe class="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 class="font-bold text-gray-900">{city}</h3>
            <p class="text-sm text-gray-600">Web Design Services</p>
          </div>
        {/each}
      </div>
      <p class="text-center text-gray-600 mt-8">
        We provide web design services to businesses in every state across Nigeria
      </p>
    </div>
  </section>

  <!-- CTA -->
  <section class="py-20 px-4">
    <div class="container mx-auto max-w-4xl text-center">
      <h2 class="text-4xl font-black text-gray-900 mb-6">
        Ready to Get Your Nigerian Business Online?
      </h2>
      <p class="text-xl text-gray-600 mb-8">
        Join hundreds of Nigerian businesses that trust RyderTech for their web design needs.
      </p>
      <a href="/contact" class="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:shadow-xl transition-all">
        Start Your Website Project Today
      </a>
    </div>
  </section>
</div>