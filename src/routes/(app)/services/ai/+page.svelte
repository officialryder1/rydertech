<script lang="ts">
  import { Cpu, MessageCircle, Zap, Sparkles, Database, Code, CheckCircle, ArrowRight, Globe } from '@lucide/svelte';
  import { Badge } from "$lib/components/ui/badge";
  import LeadMagnetDownload from '$lib/components/LeadMagnetDownload.svelte';

  const aiServices = [
    {
      icon: Cpu,
      title: 'AI App Development',
      description: 'Custom AI-powered web and mobile apps with LLM features, recommendation engines, and intelligent workflows built into your product.'
    },
    {
      icon: MessageCircle,
      title: 'LLM Chatbots & Agents',
      description: 'Conversational assistants and autonomous agents for support, bookings, and tasks — grounded in your business data, on WhatsApp or web.'
    },
    {
      icon: Zap,
      title: 'ML & Intelligent Automation',
      description: 'Machine-learning models and process automation that cut manual work: forecasting, classification, and document processing.'
    },
    {
      icon: Sparkles,
      title: 'Computer Vision',
      description: 'Image and video AI for detection, recognition, and inspection — from retail analytics to quality control.'
    },
    {
      icon: Database,
      title: 'AI-Ready Data & Cloud',
      description: 'Vector databases, MLOps pipelines, and cloud infrastructure that make your AI systems fast, scalable, and reliable.'
    },
    {
      icon: Code,
      title: 'Custom AI Software',
      description: 'End-to-end AI solutions tailored to your operations — from prototype to production with ongoing monitoring.'
    }
  ];

  const useCases = [
    { title: 'AI Customer Support', text: 'WhatsApp & web chatbots that answer FAQs, take orders, and book appointments 24/7 — in English and Pidgin.' },
    { title: 'Document Intelligence', text: 'Auto-extract and classify invoices, forms, and contracts. Cut manual data entry by up to 80%.' },
    { title: 'Demand Forecasting', text: 'ML models that predict sales and stock needs so you stop over- or under-ordering.' },
    { title: 'Smart Recommendations', text: 'Personalized product and content suggestions that lift conversion on your store or app.' },
    { title: 'Visual Inspection', text: 'Computer vision that spots defects and counts inventory from camera feeds — no manual checks.' },
    { title: 'Process Automation', text: 'Autonomous agents that move data between your tools and run repetitive workflows end-to-end.' }
  ];

  const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'Benin City'];
  const niche = 'AI & ML Software';
</script>

<svelte:head>
  <title>AI & ML Services | RyderTech — Intelligent Software for Nigerian Businesses</title>
  <meta name="description" content="RyderTech builds AI & ML solutions: LLM chatbots, computer vision, ML automation, and AI-ready apps for businesses in Lagos, Abuja, Port Harcourt, and worldwide. Book an AI consult." />
  <meta name="keywords" content="AI development Nigeria, machine learning Nigeria, LLM chatbot, computer vision, AI automation, AI app development Lagos, RAG agent, MLOps Nigeria" />
  {@html `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "AI & ML Software Development",
    "provider": {
      "@type": "ProfessionalService",
      "name": "RyderTech",
      "url": "https://rydertech.ng",
      "address": { "@type": "PostalAddress", "addressCountry": "NG", "addressRegion": "Abuja", "addressLocality": "Nigeria" }
    },
    "areaServed": ["Lagos", "Abuja", "Port Harcourt", "Nigeria", "Worldwide"],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "AI Services",
      "itemListElement": [
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "LLM Chatbots & Agents" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Computer Vision" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "ML & Intelligent Automation" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "AI-Ready Data & Cloud" } }
      ]
    }
  })}</script>`}
</svelte:head>

<div class="min-h-screen bg-white">
  <!-- Hero Section -->
  <section class="pt-40 pb-20 px-4 bg-linear-to-br from-slate-950 to-slate-800 text-white">
    <div class="container mx-auto max-w-6xl">
      <div class="text-center">
        <Badge variant="outline" class="mb-4 px-4 py-1 border-white/30 text-white/90">
          2026 {niche} Studio
        </Badge>
        <h1 class="text-4xl md:text-6xl font-black mb-6">
          Practical <span class="text-cyan-400">AI & ML</span> for Your Business
        </h1>
        <p class="text-xl text-white/70 max-w-3xl mx-auto mb-8">
          We engineer AI systems that ship real value — from LLM chatbots and computer vision to ML automation — alongside the web and mobile platforms that put them to work. Serving clients across Lagos, Abuja, Port Harcourt, and worldwide.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/contact" class="px-8 py-4 bg-cyan-500 text-slate-900 font-bold rounded-xl hover:bg-cyan-400 transition-colors">
            Book an AI Consult
          </a>
          <a href="tel:+2349033147769" class="px-8 py-4 border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-colors">
            Call: +234 903 314 7769
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- AI Services -->
  <section class="py-20 px-4">
    <div class="container mx-auto max-w-6xl">
      <h2 class="text-3xl font-black text-center text-gray-900 mb-12">
        What We <span class="text-cyan-600">Build</span>
      </h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each aiServices as service}
          <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-cyan-100 rounded-lg">
                <service.icon class="w-6 h-6 text-cyan-600" />
              </div>
              <h3 class="font-bold text-lg text-gray-900">{service.title}</h3>
            </div>
            <p class="text-gray-600">{service.description}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Use Cases -->
  <section class="py-20 bg-gray-50">
    <div class="container mx-auto max-w-6xl px-4">
      <h2 class="text-3xl font-black text-center text-gray-900 mb-12">
        Where <span class="text-cyan-600">AI Pays Off</span>
      </h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each useCases as uc}
          <div class="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div class="flex items-center gap-2 mb-2">
              <CheckCircle class="w-5 h-5 text-cyan-600" />
              <h3 class="text-lg font-bold text-gray-900">{uc.title}</h3>
            </div>
            <p class="text-sm text-gray-600 leading-relaxed">{uc.text}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Cities We Serve -->
  <section class="py-20 bg-white">
    <div class="container mx-auto max-w-6xl px-4">
      <h2 class="text-3xl font-black text-center text-gray-900 mb-12">
        AI Teams Serving <span class="text-cyan-600">Nigeria & Beyond</span>
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {#each cities as city}
          <div class="text-center p-4 bg-gray-50 rounded-xl shadow-sm">
            <Globe class="w-8 h-8 text-cyan-600 mx-auto mb-2" />
            <h3 class="font-bold text-gray-900">{city}</h3>
            <p class="text-sm text-gray-600">AI Development</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Lead Magnet -->
  <section class="py-16 px-4 bg-gray-50">
    <div class="container mx-auto max-w-2xl">
      <LeadMagnetDownload />
    </div>
  </section>

  <!-- CTA -->
  <section class="py-20 px-4">
    <div class="container mx-auto max-w-4xl text-center">
      <h2 class="text-4xl font-black text-gray-900 mb-6">
        Ready to Put AI to Work?
      </h2>
      <p class="text-xl text-gray-600 mb-8">
        Tell us your workflow — we'll show you the fastest AI win for your business.
      </p>
      <a href="/contact" class="inline-block px-8 py-4 bg-linear-to-r from-cyan-600 to-blue-700 text-white font-bold rounded-xl hover:shadow-xl transition-all">
        Start Your AI Project
      </a>
    </div>
  </section>
</div>
