
<script lang="ts">
	import Seo from '$lib/components/seo/Seo.svelte';
	import Breadcrumbs from '$lib/components/seo/Breadcrumbs.svelte';
	import FAQSchema from '$lib/components/seo/FAQSchema.svelte';

	const title = 'Abuja Web Development & Software Agency — RyderTech';
	const description = 'RyderTech is a leading Abuja web development agency and software agency. We build fast, conversion-focused websites, web apps, and AI automation for businesses in Abuja, Nigeria.';
	const canonical = 'https://rydertech.ng/locations/abuja-web-design';
	const keywords = 'Abuja web development agency, software agency Abuja, web development agency Abuja, software development agency Abuja, Abuja web developers, Abuja software developers, custom software Abuja, web design Abuja, AI automation Abuja, mobile app development Abuja';
	const og = { title, description, type: 'website', url: canonical, image: 'https://rydertech.ng/icons/og-image.png' };
	const twitter = { card: 'summary_large_image', site: '@rydertech', title, description, image: og.image };

	const breadcrumbs = [
		{ name: 'Home', url: '/', current: false },
		{ name: 'Locations', url: '/locations', current: false },
		{ name: 'Abuja Web Design', url: '/locations/abuja-web-design', current: true }
	];
    let faq1 = false;
	let faq2 = false;
	let faq3 = false;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        '@id': 'https://rydertech.ng/#business',
        name: 'RyderTech',
        url: 'https://rydertech.ng',
        logo: 'https://rydertech.ng/logo.png',
        image: 'https://rydertech.ng/icons/og-image.png',
        description: 'Abuja-based web development and software agency serving businesses across Nigeria with websites, web apps, and AI automation.',
        telephone: '+234-903-314-7769',
        email: 'rydertech.ng@gmail.com',
        priceRange: '₦₦₦',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'NG',
          addressRegion: 'Abuja',
          addressLocality: 'Abuja'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 9.076478,
          longitude: 7.398574
        },
        areaServed: 'Abuja, Nigeria',
        sameAs: [
          'https://twitter.com/official_ryder0',
          'https://instagram.com/rydertech.ng'
        ]
      },
      {
        '@type': 'Service',
        serviceType: 'Web Development',
        provider: { '@id': 'https://rydertech.ng/#business' },
        areaServed: 'Abuja, Nigeria',
        name: 'Abuja Web Development Agency',
        url: 'https://rydertech.ng/locations/abuja-web-design'
      },
      {
        '@type': 'Service',
        serviceType: 'Software Development',
        provider: { '@id': 'https://rydertech.ng/#business' },
        areaServed: 'Abuja, Nigeria',
        name: 'Abuja Software Agency',
        url: 'https://rydertech.ng/locations/abuja-web-design'
      }
    ]
  };

  // FAQs also rendered as FAQPage structured data for rich results.
  const faqs = [
    {
      question: 'What does a web development agency in Abuja typically cost?',
      answer: 'A small business website from an Abuja web development agency usually starts around ₦250,000–₦550,000. E-commerce and custom web apps range from ₦500,000 to ₦1,500,000+. Use our free Website Cost Estimator for a tailored range.'
    },
    {
      question: 'Do you build more than websites — can you build custom software?',
      answer: 'Yes. RyderTech is both a web design company and a software development agency in Abuja. We build custom web apps, mobile apps, AI chatbots, and back-office automation — not just brochure sites.'
    },
    {
      question: 'How long does it take to build a website in Abuja?',
      answer: 'A typical small business site takes 3–6 weeks. E-commerce and custom web apps vary with integrations and catalogue size. We share a clear timeline after a free discovery call.'
    },
    {
      question: 'Do you offer local SEO so Abuja customers can find me?',
      answer: 'Yes. As an Abuja-based software agency we optimise every build for local search — structured data, Google Business Profile setup, and on-page SEO — so customers searching "web development agency Abuja" can find you.'
    }
  ];
</script>

<Seo {title} description={description} keywords={keywords} canonical={canonical} {og} {twitter} {jsonLd} />
<FAQSchema questions={faqs} />

<div class="container mx-auto px-4 py-30">
	<Breadcrumbs items={breadcrumbs} />

	<header class="grid gap-6 md:grid-cols-3 items-start mb-8">
		<div class="md:col-span-2">
			<h1 class="text-3xl md:text-4xl font-extrabold leading-tight">Abuja Web Development & Software Agency</h1>
			<p class="mt-3 text-muted-foreground max-w-3xl">RyderTech is an Abuja web development agency and software agency helping local businesses launch fast, secure, conversion-focused websites and custom software. From landing pages to full e-commerce platforms and AI automation, we build digital products that grow Abuja companies.</p>

			<div class="mt-6 flex flex-wrap gap-3">
				<a href="/contact" class="inline-flex items-center px-5 py-3 bg-primary text-white rounded-md shadow-sm hover:opacity-95">Get a free estimate</a>
				<a href="/services" class="inline-flex items-center px-5 py-3 border rounded-md text-foreground hover:bg-gray-50">See our services</a>
			</div>
		</div>

		<aside class="rounded-lg border p-5 bg-white/50">
			<h3 class="font-semibold">Local to Abuja?</h3>
			<p class="text-sm text-muted-foreground mt-2">We're based in Abuja (Jabi Lake Mall) and work with clients across Nigeria — onsite meetings available by appointment.</p>
			<dl class="mt-4 space-y-2 text-sm">
				<div>
					<dt class="font-medium">Typical project</dt>
					<dd>Small business site: ₦250,000 — ₦550,000</dd>
				</div>
				<div>
					<dt class="font-medium">E-commerce</dt>
					<dd>From ₦500,000 — ₦1,500,000+</dd>
				</div>
				<div>
					<dt class="font-medium">Custom software / web app</dt>
					<dd>From ₦1,500,000</dd>
				</div>
			</dl>
			<a href="/contact" class="mt-4 inline-block text-sm font-medium text-primary">Contact us →</a>
		</aside>
	</header>

	<section class="grid gap-8 md:grid-cols-3 mb-12">
		<div class="md:col-span-2 space-y-6">
			<h2 class="text-2xl font-semibold">What our Abuja web development agency builds</h2>
			<p class="text-muted-foreground">Whether you need a simple site or a full software platform, our Abuja team ships modern, accessible, easy-to-manage products. Typical deliverables:</p>
			<ul class="list-disc ml-5 space-y-2">
				<li>Responsive, mobile-first websites tailored to Abuja audiences</li>
				<li>SEO-friendly structure and on-page optimisation for "Abuja" searches</li>
				<li>Conversion-focused landing pages and contact flows</li>
				<li>E-commerce stores with secure local payment integration (Paystack, Flutterwave)</li>
				<li>Custom web apps, dashboards, and portals</li>
				<li>AI chatbots, WhatsApp assistants, and back-office automation</li>
				<li>Content management with training and handover</li>
			</ul>

			<h3 class="text-xl font-semibold">Why choose RyderTech as your Abuja software agency?</h3>
			<p class="text-muted-foreground">We combine local market knowledge with modern web technology to help Abuja businesses reach more customers. Our sites load fast on Nigerian networks, follow accessibility best practices, and are engineered to convert visitors into leads. As both a web design company and a software development agency in Abuja, we can take you from a first landing page all the way to a custom platform.</p>

			<h3 class="text-xl font-semibold">Free tools to plan your project</h3>
			<p class="text-muted-foreground">Before you talk to any web development agency in Abuja, estimate your budget and check your current visibility:</p>
			<ul class="list-disc ml-5 space-y-2">
				<li><a class="text-primary underline" href="/labs/cost-estimator">Website Cost Estimator</a> — get a tailored build range in minutes.</li>
				<li><a class="text-primary underline" href="/labs/visibility">Local Visibility Audit</a> — see how findable your business is on Google in Abuja.</li>
				<li><a class="text-primary underline" href="/labs/revleak">RevLeak Auditor</a> — calculate revenue lost to a slow website.</li>
			</ul>

			<h3 class="text-xl font-semibold">Quick case studies</h3>
			<div class="space-y-4">
				<article class="p-4 border rounded">
					<h4 class="font-medium">E-commerce for a retail brand</h4>
					<p class="text-sm text-muted-foreground mt-1">Launched a secure Shopify/Headless setup that increased online orders by 75% within 3 months.</p>
				</article>
				<article class="p-4 border rounded">
					<h4 class="font-medium">Professional services site</h4>
					<p class="text-sm text-muted-foreground mt-1">Redesigned a consultancy website to improve lead quality and shorten the sales cycle.</p>
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
				<p class="text-sm text-muted-foreground mt-1">We optimise for Abuja searches so customers can find you locally.</p>
			</div>

			<div class="p-4 border rounded">
				<h4 class="font-semibold">Abuja businesses we serve</h4>
				<p class="text-sm text-muted-foreground mt-1">Real estate, law firms, retailers, schools, healthcare, fintech, and government contractors across the FCT.</p>
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
				<span>{faqs[0].question}</span>
				<svg class="w-4 h-4 ml-3 transition-transform" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg" style:transform={faq1 ? 'rotate(90deg)' : 'rotate(0deg)'}>
					<path d="M6 4l8 6-8 6" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</button>
			{#if faq1}
				<p class="mt-2 text-muted-foreground">{faqs[0].answer}</p>
			{/if}
		</div>

		<div class="mt-3">
			<button
				class="w-full text-left font-medium flex items-center justify-between"
				aria-expanded={faq2}
				on:click={() => (faq2 = !faq2)}>
				<span>{faqs[1].question}</span>
				<svg class="w-4 h-4 ml-3 transition-transform" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg" style:transform={faq2 ? 'rotate(90deg)' : 'rotate(0deg)'}>
					<path d="M6 4l8 6-8 6" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</button>
			{#if faq2}
				<p class="mt-2 text-muted-foreground">{faqs[1].answer}</p>
			{/if}
		</div>

		<div class="mt-3">
			<button
				class="w-full text-left font-medium flex items-center justify-between"
				aria-expanded={faq3}
				on:click={() => (faq3 = !faq3)}>
				<span>{faqs[3].question}</span>
				<svg class="w-4 h-4 ml-3 transition-transform" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg" style:transform={faq3 ? 'rotate(90deg)' : 'rotate(0deg)'}>
					<path d="M6 4l8 6-8 6" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</button>
			{#if faq3}
				<p class="mt-2 text-muted-foreground">{faqs[3].answer}</p>
			{/if}
		</div>

		<p class="mt-6"><a class="text-primary underline font-medium" href="/contact">Talk to our Abuja web development team →</a></p>
	</section>
</div>
