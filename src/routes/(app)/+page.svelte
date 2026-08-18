<script>
// @ts-nocheck

  // AEO: direct-answer content — these Q&A pairs are also emitted as FAQPage JSON-LD
  const faqs = [
    {
      q: 'What does RyderTech build?',
      a: 'RyderTech is a Nigerian software studio that builds custom web apps, mobile apps, and cloud platforms, then makes them intelligent with AI — LLM chatbots, computer vision, and ML workflow automation.'
    },
    {
      q: 'Do you build AI chatbots and automation for small businesses?',
      a: 'Yes. We deploy AI chatbots, WhatsApp assistants, and back-office automation for Nigerian and African SMBs — from lead qualification to invoicing and support triage — usually with a measurable payback in months.'
    },
    {
      q: 'How much does a website or app cost in Nigeria?',
      a: 'A simple business website starts around ₦300,000, while a custom web app or mobile app typically ranges from ₦1.5M to ₦8M depending on scope. Use our free Website Cost Estimator to get a tailored range.'
    },
    {
      q: 'Where is RyderTech based and who do you serve?',
      a: 'We are based in Abuja and serve clients across Lagos, Port Harcourt, and nationwide Nigeria, plus remote clients across Africa. We work in English and West-African business contexts.'
    },
    {
      q: 'Can you help my business show up on Google and AI search?',
      a: 'Yes. Beyond building your site, we handle local SEO and Answer Engine Optimization (AEO) — structured data, FAQ content, and Google Business Profile setup — so customers find you on Google and AI assistants like ChatGPT name you first.'
    }
  ];

  // Serialize FAQPage JSON-LD once. Escape '<' so the JSON can never break out of
  // the <script> tag context. Injected via {@html} below — Svelte does NOT
  // evaluate {#each} inside a raw <script> tag, which previously leaked
  // template syntax into the rendered structured data.
  const faqJson = JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a }
      }))
    },
    null,
    2
  ).replace(/</g, '\\u003c');

    import NewsLetterModel from '$lib/components/NewsLetterModel.svelte';
  import LeadMagnetDownload from '$lib/components/LeadMagnetDownload.svelte';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { 
    Code, 
    Globe, 
    Smartphone, 
    Database, 
    Cloud, 
    Shield,
    ArrowRight,
    CheckCircle,
    Users,
    TrendingUp,
    Star,
    MessageCircle,
    Cpu,
    Zap,
    Sparkles,
    Quote,
    Calculator, 
    FileText, 
    LayoutGrid,
    Bell,
    Mail,
    Badge,
    Timer,
    ScanLine,
    Gauge
  } from '@lucide/svelte';

  // Hardcoded client testimonials (DB disabled — manual uploads).
  let showNewsletter = $state(false);
  const realTestimonials = [
    {
      client_name: 'Chinwendu Kenneth',
      projects: { project_name: 'Church Management Platform' },
      testimonial: 'RyderTech transformed our entire digital infrastructure. Their web development team delivered a platform that increased our operational efficiency by 40%.',
      rating: 5,
      created_at: '2025-09-01'
    },
    {
      client_name: 'Caleb Nwakanma',
      projects: { project_name: 'Fashion Agency' },
      testimonial: 'Working with RyderTech was a game-changer for our Fashion agency. They built our website from scratch and helped us navigate complex compliance requirements.',
      rating: 5,
      created_at: '2025-08-15'
    },
    {
      client_name: 'Divine Favour',
      projects: { project_name: 'Traveling Agency' },
      testimonial: 'The travel booking platform developed by RyderTech has revolutionized our business. Our bookings have increased by 60% since launch!',
      rating: 5,
      created_at: '2025-07-20'
    },
    {
      client_name: 'Fredrick Reuben',
      projects: { project_name: 'E-Commerce' },
      testimonial: 'RyderTech delivered an exceptional e-commerce platform that perfectly aligned with our vision. It significantly boosted our online sales.',
      rating: 5,
      created_at: '2025-07-10'
    },
    {
      client_name: 'Ani Emmanuel',
      projects: { project_name: 'therealmeglobal' },
      testimonial: 'RyderTech understood our brand and delivered a platform that truly represents who we are. Professional, fast, and reliable from start to finish.',
      rating: 5,
      created_at: '2025-06-25'
    },
    {
      client_name: 'Prof Ken Nwakanma',
      projects: { project_name: 'UAAG' },
      testimonial: 'Working with RyderTech was seamless. They translated a complex vision into a clean, scalable product and supported us well beyond launch.',
      rating: 5,
      created_at: '2025-06-10'
    },
    {
      client_name: 'Nancy Marcos',
      projects: { project_name: 'Reality Check with Nancy' },
      testimonial: 'Our new site looks incredible and performs even better. RyderTech nailed the brief and the engagement was a pleasure throughout.',
      rating: 5,
      created_at: '2025-05-30'
    }
  ];
  let loading = $state(false);

  // @ts-ignore
  onMount(async () => {
    // 1. data loading
    // Testimonials are now hardcoded above (DB disabled). No fetch needed.

    // 2. newsletter logic
    const hasSubscribed = localStorage.getItem('rydertech_newsletter_subscribed');
    const modalClosedRecently = localStorage.getItem('rydertech_newsletter_closed');
    
    if (!hasSubscribed && !modalClosedRecently) {
      setTimeout(() => showNewsletter = true, 3000);
    }

    // 3. Optimized Event Listeners
    const handleScroll = () => scrollY = window.scrollY;
    
    // @ts-ignore
    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastTick < 16) return; // Cap at ~60fps
      mouseX = e.clientX;
      mouseY = e.clientY;
      lastTick = now;
    };

    // @ts-ignore
    const handleMouseLeave = (e) => {
      if (e.clientY < 0 && !hasSubscribed && !modalClosedRecently) {
        showNewsletter = true;
      }
    };

    // Auto-rotate testimonials
    const testimonialInterval = setInterval(() => {
      activeTestimonial = (activeTestimonial + 1) % testimonials.length;
    }, 5000);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearInterval(testimonialInterval);
    };
  })

  async function loadTestimonials() {
    // Deprecated: Supabase DB is disabled. Testimonials are now hardcoded
    // in the `realTestimonials` const above. Kept as a no-op to avoid
    // breaking the onMount call signature if re-enabled later.
    return;
  }

  // Blended services: foundational build + AI layer
  const services = [
    {
      icon: Globe,
      title: 'Web & AI Apps',
      description: 'Custom web apps built with modern frameworks — with AI features like smart search, recommendations, and LLM assistants baked in.',
      features: ['Responsive Design', 'AI-Ready UI/UX', 'LLM Features', 'SEO Optimized'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Smartphone,
      title: 'Mobile Apps',
      description: 'Cross-platform iOS/Android apps with on-device and cloud AI — chat, vision, and personalization that keep users engaged.',
      features: ['Native Performance', 'On-device AI', 'Offline Capable', 'App Store Ready'],
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Database,
      title: 'Backend, Cloud & MLOps',
      description: 'Scalable APIs, vector stores, and cloud infrastructure — plus MLOps pipelines that serve your models reliably.',
      features: ['RESTful APIs', 'Vector DBs', 'MLOps Pipelines', 'Serverless Inference'],
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: MessageCircle,
      title: 'LLM Chatbots & Agents',
      description: 'Conversational assistants and autonomous agents for support, bookings, and tasks — grounded in your business data, on WhatsApp or web.',
      features: ['Customer Support Bots', 'Autonomous Agents', 'RAG Knowledge Base', 'WhatsApp / Web'],
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Zap,
      title: 'ML & Intelligent Automation',
      description: 'Machine-learning models and process automation that cut manual work — forecasting, classification, and document processing.',
      features: ['Predictive Models', 'Workflow Automation', 'Document Intelligence', 'PoC to Production'],
      color: 'from-indigo-500 to-blue-500'
    },
    {
      icon: Sparkles,
      title: 'Computer Vision',
      description: 'Image and video AI for detection, recognition, and inspection — from retail analytics to quality control.',
      features: ['Object Detection', 'OCR / Face Recognition', 'Visual Inspection', 'Camera Analytics'],
      color: 'from-amber-500 to-yellow-500'
    }
  ];

  // Brands we work with
  const brands = [
    { name: 'FindsNg', logo: 'FN', description: 'E-Commerce' },
    { name: 'Sanuary Wealth Foundation', logo: 'SWMF', description: 'NGO' },
    { name: 'RyderXchange', logo: 'RX', description: 'Blockchain Infrastructure' },
    { name: 'SOGCA', logo: 'SOG', description: 'Church Platform' },
    { name: 'CouqleQuest', logo: 'CQ', description: 'App Development' },
    { name: 'Discova', logo: 'DV', description: 'Multi-vendor platform' },
    { name: 'SweetEdge', logo: 'SE', description: 'Fashion Brand' },
    { name: 'DbTravels', logo: 'DBT', description: 'Traveling Agency' }
  ];

  // Testimonials
  const testimonials = [
    {
      name: 'Chinwendu Kenneth',
      company: 'SOGCA',
      role: 'Admin',
      content: 'RyderTech transformed our entire digital infrastructure. Their web development team delivered a platform that increased our operational efficiency by 40%. The attention to detail and technical expertise exceeded our expectations.',
      rating: 5,
      project: 'Church Management Platform'
    },
    {
      name: 'Caleb Nwakanma',
      company: 'SweetEdge',
      role: 'Founder & CEO',
      content: 'Working with RyderTech was a game-changer for our Fashion agency. They built our website from scratch and helped us navigate complex compliance requirements.',
      rating: 5,
      project: 'Fashion Agency'
    },
    {
      name: 'Divine Favour',
      company: 'DbTravels',
      role: 'Founder & CEO',
      content: 'The travel booking platform developed by RyderTech has revolutionized our business. The user experience is seamless, and the backend system is robust and scalable. Our bookings have increased by 60% since launch!',
      rating: 5,
      project: 'Traveling Agency'
    },
    {
      name: 'Fredrick Reuben',
      company: 'FindsNg',
      role: 'Founder & CTO',
      content: 'RyderTech delivered an exceptional e-commerce platform that perfectly aligned with our vision. Their team was responsive, knowledgeable, and proactive throughout the development process. The end product has significantly boosted our online sales and customer engagement.',
      rating: 5,
      project: 'E-Commerce'
    },
    // {
    //   name: 'Lisa Thompson',
    //   company: 'SecureNet',
    //   role: 'Security Director',
    //   content: 'Their security audit and compliance framework implementation was thorough and professional. RyderTech helped us achieve GDPR and SOC2 compliance while improving our overall security posture.',
    //   rating: 5,
    //   project: 'Security & Compliance Overhaul'
    // },
    // {
    //   name: 'Alex Martinez',
    //   company: 'MobileFirst',
    //   role: 'Product Manager',
    //   content: 'The cross-platform mobile app developed by RyderTech has received fantastic user feedback. The performance is exceptional on both iOS and Android, and the development process was smooth and collaborative.',
    //   rating: 5,
    //   project: 'Cross-platform Mobile Application'
    // }
  ];

  const stats = [
    { icon: Users, number: '50+', label: 'Happy Clients' },
    { icon: Code, number: '100+', label: 'Projects Completed' },
    { icon: TrendingUp, number: '99%', label: 'Client Satisfaction' },
    { icon: Star, number: '5+', label: 'Years Experience' }
  ];

  let scrollY = 0;
  let mouseX = 0;
  let mouseY = 0;
  let activeTestimonial = 0;

  onMount(() => {
    const handleScroll = () => scrollY = window.scrollY;
    // @ts-ignore
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    // Auto-rotate testimonials
    const testimonialInterval = setInterval(() => {
      activeTestimonial = (activeTestimonial + 1) % testimonials.length;
    }, 5000);

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(testimonialInterval);
    };
  });



  function handleNewsletterClose() {
    showNewsletter = false;
    // Remember that user closed the modal (don't show for 7 days)
    localStorage.setItem('rydertech_newsletter_closed', 'true');
    setTimeout(() => {
      localStorage.removeItem('rydertech_newsletter_closed');
    }, 7 * 24 * 60 * 60 * 1000); // 7 days
  }

  // @ts-ignore
  async function handleNewsletterSubscribe(email) {
    // Here you would integrate with your actual email service
    console.log('Subscribing email:', email);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Store subscription in localStorage
    localStorage.setItem('rydertech_newsletter_subscribed', 'true');
    
    // In a real app, you would send this to your backend/email service
    // Example with fetch:
    /*
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) throw new Error('Subscription failed');
    } catch (error) {
      console.error('Subscription error:', error);
      throw error;
    }
    */
  }
</script>

<div class="min-h-screen bg-white overflow-hidden">
  <!-- Animated Background -->
  <div class="fixed inset-0 pointer-events-none geometric-pattern"></div>
  
  <!-- Floating Shapes -->
  <div class="fixed top-20 right-20 w-64 h-64 floating-shapes"></div>
  <div class="fixed bottom-40 left-10 w-48 h-48 floating-shapes" style="animation-delay: 2s;"></div>
  
    <NewsLetterModel 
        show={showNewsletter}
        onClose={handleNewsletterClose}
        onSubscribe={handleNewsletterSubscribe}
    />

  <!-- Hero Section -->
  <section class="relative pt-32 pb-20 px-4 min-h-screen flex items-center">
    <div class="container mx-auto max-w-6xl relative z-10">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- Left Content -->
        <div class="space-y-8">
          <!-- Badge -->
          <div class="inline-flex items-center space-x-2 bg-(--primary)/10 border border-(--primary)/20 rounded-full px-4 py-2 text-sm text-primary font-semibold">
            <div class="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
            <span>AI & ML SOFTWARE STUDIO</span>
          </div>
          
          <!-- Main Headline -->
          <h1 class="text-5xl md:text-7xl font-black leading-tight">
             Build the <span class="gradient-text">AI-Powered Engine</span>
            <br />
            <span class="text-gray-900">That Drives Your Business Growth</span>
          </h1>
          
          <!-- Description -->
          <p class="text-xl text-gray-600 leading-relaxed">
            We engineer custom <strong>AI & ML solutions</strong> — intelligent apps, LLM chatbots, automation agents, and computer-vision systems — alongside the web and mobile platforms that put them to work.<br />
            Serving clients in <strong>Lagos</strong>, <strong>Abuja</strong>, <strong>Port Harcourt</strong>, and <strong>Worldwide.</strong>
          </p>
          
          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 pt-8">
            <a href="/services/ai" class="creative-button px-8 py-4 text-white font-semibold text-lg rounded-xl">
              <span class="flex items-center">
                Explore AI Services
                <ArrowRight class="w-5 h-5 ml-2" />
              </span>
            </a>
            
            <a href="/contact" class="px-8 py-4 border-2 border-(--primary)/20 text-primary font-semibold rounded-xl hover:border-(--primary)/40 hover:bg-(--primary)/5 transition-all duration-300">
              <span class="flex items-center">
                Book an AI Consult
                <Sparkles class="w-5 h-5 ml-2" />
              </span>
            </a>
          </div>
        </div>

        <!-- Right Visual - Interactive Version -->
        <div class="relative">
        <!-- Main Card with Interactive Elements -->
        <div class="glass-card rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl">
            <!-- Interactive Tech Stack for Mobile -->
            <div class="md:hidden mb-6">
            <div class="text-center mb-4">
                <h3 class="text-gray-800 font-bold text-sm mb-2">Our Tech Stack</h3>
                <div class="w-16 h-1 bg-linear-to-r from-primary to-[var(--secondary)] rounded-full mx-auto"></div>
            </div>
            
            <div class="grid grid-cols-2 gap-3">
                {#each [
                { icon: Cpu, label: 'Frontend', tech: 'Svelte/React' },
                { icon: Database, label: 'Backend', tech: 'Node.js/Django' },
                { icon: Cloud, label: 'Cloud', tech: 'AWS/Azure' },
                { icon: Shield, label: 'Security', tech: 'Enterprise' }
                ] as stack}
                <div class="text-center p-3 rounded-xl bg-linear-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5 border border-white/20 hover:scale-105 transition-all duration-300 group">
                    <div class="w-8 h-8 bg-linear-to-r from-[var(--primary)] to-[var(--primary-dark)] rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                    <stack.icon class="w-4 h-4 text-white" />
                    </div>
                    <div class="text-xs text-gray-600 font-medium">{stack.label}</div>
                    <div class="text-xs text-[var(--primary)] font-bold">{stack.tech}</div>
                </div>
                {/each}
            </div>
            </div>

            <!-- Desktop: Original Grid -->
            <div class="hidden md:grid grid-cols-2 gap-4">
            {#each [1, 2, 3, 4] as i}
                <div class="aspect-square rounded-2xl bg-linear-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10 border border-white/20 flex items-center justify-center hover:scale-105 transition-transform duration-300 group">
                <Cpu class="w-8 h-8 text-[var(--primary)] group-hover:scale-110 transition-transform duration-300" />
                </div>
            {/each}
            </div>

            <!-- Enhanced Bottom Section -->
            <div class="mt-6 text-center">
            <div class="relative inline-block">
                <div class="w-12 h-12 bg-linear-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-300 group">
                <Code class="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <div class="absolute -inset-2 bg-[var(--primary)]/20 rounded-full blur-sm group-hover:blur-md transition-all duration-300"></div>
            </div>
            
            <p class="text-gray-700 font-semibold text-sm md:text-base mb-1">Innovative Solutions</p>
            <p class="text-gray-500 text-xs">Built with modern technology</p>
            
            <!-- Mobile: Quick Stats -->
            <div class="md:hidden flex justify-center space-x-4 mt-4 pt-4 border-t border-gray-200">
                {#each [
                { number: '99%', label: 'Success' },
                { number: '24/7', label: 'Support' },
                { number: '50+', label: 'Projects' }
                ] as stat}
                <div class="text-center">
                    <div class="text-[var(--primary)] font-bold text-sm">{stat.number}</div>
                    <div class="text-gray-500 text-xs">{stat.label}</div>
                </div>
                {/each}
            </div>
            </div>
        </div>

        <!-- Floating Elements - Responsive -->
        <div class="absolute -top-3 -right-3 md:-top-4 md:-right-4 w-16 h-16 md:w-20 md:h-20 bg-linear-to-r from-[var(--secondary)] to-[var(--secondary-light)] rounded-2xl flex items-center justify-center shadow-lg animate-float">
            <Zap class="w-6 h-6 md:w-8 md:h-8 text-white" />
        </div>
        <div class="absolute -bottom-3 -left-3 md:-bottom-4 md:-left-4 w-12 h-12 md:w-16 md:h-16 bg-linear-to-r from-[var(--accent)] to-[var(--primary-light)] rounded-2xl flex items-center justify-center shadow-lg animate-float" style="animation-delay: 1s;">
            <Sparkles class="w-4 h-4 md:w-6 md:h-6 text-white" />
        </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Stats Section -->
  <section class="py-20 bg-linear-to-br from-gray-50 to-white relative overflow-hidden">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        {#each stats as stat, i}
          <div class="text-center group" style="animation-delay: {i * 0.1}s">
            <div class="relative inline-flex mb-4">
              <div class="p-4 bg-linear-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10 rounded-2xl border border-[var(--primary)]/20 group-hover:border-[var(--primary)]/40 transition-all duration-300 group-hover:scale-110">
                <stat.icon class="w-6 h-6 text-[var(--primary)]" />
              </div>
              <div class="absolute -inset-2 bg-[var(--primary)]/5 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300"></div>
            </div>
            <div class="text-3xl font-black text-gray-900 mb-2">{stat.number}</div>
            <div class="text-gray-600 font-medium">{stat.label}</div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Brands Section -->
  <section class="py-20 bg-white relative overflow-hidden">
    <div class="container mx-auto max-w-6xl px-4">
      <div class="text-center mb-16">
        <div class="inline-flex items-center space-x-2 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-full px-4 py-2 text-sm text-[var(--primary)] font-semibold mb-4">
          <Users class="w-4 h-4" />
          <span>TRUSTED PARTNERS</span>
        </div>
        <h2 class="text-4xl md:text-5xl font-black text-gray-900 mb-4">
          Brands We <span class="gradient-text">Manage</span>
        </h2>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          We're proud to collaborate with innovative companies across various industries, 
          delivering exceptional software solutions that drive growth and success.
        </p>
      </div>

      <!-- Brands Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        {#each brands as brand, i}
          <div class="group text-center p-6 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105 border-2 border-transparent hover:border-[var(--primary)]/20">
            <!-- Brand Logo -->
            <div class="w-16 h-16 bg-linear-to-br from-[var(--primary)] to-[var(--primary-dark)] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <span class="text-white font-black text-lg">{brand.logo}</span>
            </div>
            
            <!-- Brand Name -->
            <h3 class="font-black text-gray-900 text-lg mb-2">{brand.name}</h3>
            
            <!-- Brand Description -->
            <p class="text-gray-600 text-sm">{brand.description}</p>
            
            <!-- Hover Indicator -->
            <div class="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div class="w-8 h-0.5 bg-linear-to-r from-[var(--primary)] to-[var(--secondary)] mx-auto rounded-full"></div>
            </div>
          </div>
        {/each}
      </div>

      <!-- Callout -->
      <div class="text-center mt-12">
        <p class="text-gray-600">
          Interested in becoming our partner? 
          <button class="text-[var(--primary)] font-semibold hover:text-[var(--primary-dark)] transition-colors ml-1">
            Let's talk about your project
            <ArrowRight class="w-4 h-4 inline ml-1" />
          </button>
        </p>
      </div>
    </div>
  </section>

  <!-- Services Section -->
  <section id="services" class="py-20 px-4 bg-white relative">
    <div class="container mx-auto max-w-6xl">
      <div class="text-center mb-16">
        <div class="inline-flex items-center space-x-2 bg-[var(--secondary)]/10 border border-[var(--secondary)]/20 rounded-full px-4 py-2 text-sm text-[var(--secondary-dark)] font-semibold mb-4">
          <Cpu class="w-4 h-4" />
          <span>AI & ML SERVICES</span>
        </div>
        <h2 class="text-4xl md:text-5xl font-black text-gray-900 mb-4">
          Intelligent <span class="gradient-text">AI Solutions</span>
        </h2>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          We build the platforms that run your business — web, mobile, and cloud — and make them intelligent with AI: LLM chatbots, computer vision, and ML automation, all under one roof.
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each services as service, i}
          <div class="service-card rounded-2xl p-6 shadow-lg hover:shadow-2xl" style="animation-delay: {i * 0.1}s">
            <!-- Icon -->
            <div class="mb-4">
              <div class="p-3 bg-linear-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10 rounded-xl w-fit">
                <service.icon class="w-6 h-6 text-[var(--primary)]" />
              </div>
            </div>
            
            <!-- Content -->
            <h3 class="text-xl font-black text-gray-900 mb-3">{service.title}</h3>
            <p class="text-gray-600 mb-4 leading-relaxed">{service.description}</p>
            
            <!-- Features -->
            <ul class="space-y-2 mb-6">
              {#each service.features as feature}
                <li class="flex items-center text-sm text-gray-600">
                  <CheckCircle class="w-4 h-4 text-[var(--secondary)] mr-2 flex-shrink-0" />
                  {feature}
                </li>
              {/each}
            </ul>
            
            <!-- Action -->
            <button class="w-full py-2.5 text-[var(--primary)] font-semibold rounded-lg border border-[var(--primary)]/20 hover:border-(--primary)/40 hover:bg-[var(--primary)]/5 transition-all duration-200 flex items-center justify-center group" onclick={window.location.href = "/services"}>
              Explore
              <ArrowRight class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- AI Use Cases Section -->
  <section class="py-20 px-4 bg-gradient-to-br from-slate-950 to-slate-800 text-white relative overflow-hidden">
    <div class="container mx-auto max-w-6xl">
      <div class="text-center mb-14">
        <div class="inline-flex items-center space-x-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm text-white/90 font-semibold mb-4">
          <Sparkles class="w-4 h-4" />
          <span>WHERE AI PAYS OFF</span>
        </div>
        <h2 class="text-4xl md:text-5xl font-black mb-4">Real AI Use Cases for Your Business</h2>
        <p class="text-lg text-white/70 max-w-2xl mx-auto">
          Practical, production-ready AI we build for Nigerian and global teams — measured by time saved and revenue unlocked.
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each [
          { title: 'AI Customer Support', text: 'WhatsApp & web chatbots that answer FAQs, take orders, and book appointments 24/7 — in English and Pidgin.' },
          { title: 'Document Intelligence', text: 'Auto-extract and classify invoices, forms, and contracts. Cut manual data entry by up to 80%.' },
          { title: 'Demand Forecasting', text: 'ML models that predict sales and stock needs so you stop over- or under-ordering.' },
          { title: 'Smart Recommendations', text: 'Personalized product and content suggestions that lift conversion on your store or app.' },
          { title: 'Visual Inspection', text: 'Computer vision that spots defects and counts inventory from camera feeds — no manual checks.' },
          { title: 'Process Automation', text: 'Autonomous agents that move data between your tools and run repetitive workflows end-to-end.' }
        ] as uc}
          <div class="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <h3 class="text-lg font-bold mb-2 text-white">{uc.title}</h3>
            <p class="text-sm text-white/70 leading-relaxed">{uc.text}</p>
          </div>
        {/each}
      </div>

      <div class="text-center mt-12">
        <a href="/services/ai" class="inline-flex items-center px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-white/90 transition">
          See All AI Services
          <ArrowRight class="w-4 h-4 ml-2" />
        </a>
      </div>
    </div>
  </section>

  <!-- RyderTech Labs Showcase -->
<section class="py-20 px-4 bg-linear-to-br from-[var(--primary)]/5 via-white to-[var(--secondary)]/5 relative overflow-hidden" aria-labelledby="rydertech-labs">
  <div class="absolute inset-0 pointer-events-none">
    <div class="absolute top-20 left-10 w-64 h-64 bg-linear-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-20 right-10 w-96 h-96 bg-linear-to-r from-[var(--secondary)]/10 to-[var(--accent)]/10 rounded-full blur-3xl"></div>
  </div>
  
  <div class="container mx-auto max-w-6xl relative z-10">
    <div class="text-center mb-12">
      <div class="inline-flex items-center space-x-2 bg-linear-to-r from-[var(--primary)]/20 to-[var(--secondary)]/20 border border-[var(--primary)]/30 rounded-full px-4 py-2 text-sm text-[var(--primary-dark)] font-semibold mb-4">
        <Sparkles class="w-4 h-4" />
        <span>FREE TOOLS & RESOURCES</span>
      </div>
      <h2 class="text-4xl md:text-5xl font-black text-gray-900 mb-4">
        Explore <span class="gradient-text">RyderTech Labs</span>
      </h2>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        Free AI-powered tools to help founders plan, validate, and build better digital products.
      </p>
    </div>

    <!-- Labs Tools Grid -->
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
      <!-- Ops Drain Calculator Card -->
      <div class="group bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-[var(--primary)]/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div class="flex items-start justify-between mb-4">
          <div class="p-3 bg-linear-to-br from-amber-500/10 to-orange-600/10 rounded-xl">
            <Timer class="w-6 h-6 text-amber-600" />
          </div>
          <Badge variant="outline" class="text-xs font-semibold border-[var(--secondary)]/30 text-[var(--secondary-dark)]">
            <Sparkles class="w-3 h-3 mr-1" />
            NEW
          </Badge>
        </div>
        
        <h3 class="text-xl font-black text-gray-900 mb-3">Ops Drain Calculator</h3>
        <p class="text-gray-600 mb-4 leading-relaxed">
          Calculate what your manual processes cost per year — and how fast automation pays for itself. Built for ops and finance leads.
        </p>
        
        <div class="space-y-3 mb-6">
          <div class="flex items-center text-sm">
            <CheckCircle class="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
            <span class="text-gray-600">Annual cost & automation payback</span>
          </div>
          <div class="flex items-center text-sm">
            <CheckCircle class="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
            <span class="text-gray-600">Scoped build plan delivered by email</span>
          </div>
          <div class="flex items-center text-sm">
            <CheckCircle class="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
            <span class="text-gray-600">NGN & USD currency support</span>
          </div>
        </div>
        
        <a 
          href="/labs/ops-drain" 
          class="w-full py-3 bg-linear-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center group-hover:shadow-lg"
        >
          Calculate My Drain
          <ArrowRight class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
        </a>
      </div>

      <!-- Event Access Risk Scanner Card -->
      <div class="group bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-[var(--primary)]/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div class="flex items-start justify-between mb-4">
          <div class="p-3 bg-linear-to-br from-rose-500/10 to-pink-600/10 rounded-xl">
            <ScanLine class="w-6 h-6 text-rose-600" />
          </div>
          <Badge variant="outline" class="text-xs font-semibold border-[var(--secondary)]/30 text-[var(--secondary-dark)]">
            <Sparkles class="w-3 h-3 mr-1" />
            NEW
          </Badge>
        </div>
        
        <h3 class="text-xl font-black text-gray-900 mb-3">Event Access Risk Scanner</h3>
        <p class="text-gray-600 mb-4 leading-relaxed">
          See how long your event gate backs up, how many guests slip in free, and what it costs — with a live Veripasshub QR demo.
        </p>
        
        <div class="space-y-3 mb-6">
          <div class="flex items-center text-sm">
            <CheckCircle class="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
            <span class="text-gray-600">Gate bottleneck & gatecrash exposure</span>
          </div>
          <div class="flex items-center text-sm">
            <CheckCircle class="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
            <span class="text-gray-600">Live scannable invite QR demo</span>
          </div>
          <div class="flex items-center text-sm">
            <CheckCircle class="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
            <span class="text-gray-600">Veripasshub upgrade plan by email</span>
          </div>
        </div>
        
        <a 
          href="/labs/event-access-risk" 
          class="w-full py-3 bg-linear-to-r from-rose-500 to-pink-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all duration-200 flex items-center justify-center group-hover:shadow-lg"
        >
          Scan My Risk
          <ArrowRight class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
        </a>
      </div>

      <!-- RevLeak Auditor Card -->
      <div class="group bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-[var(--primary)]/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div class="flex items-start justify-between mb-4">
          <div class="p-3 bg-linear-to-br from-emerald-500/10 to-teal-600/10 rounded-xl">
            <Gauge class="w-6 h-6 text-emerald-600" />
          </div>
          <Badge variant="outline" class="text-xs font-semibold border-[var(--secondary)]/30 text-[var(--secondary-dark)]">
            <Sparkles class="w-3 h-3 mr-1" />
            NEW
          </Badge>
        </div>
        
        <h3 class="text-xl font-black text-gray-900 mb-3">RevLeak Auditor</h3>
        <p class="text-gray-600 mb-4 leading-relaxed">
          Calculate how much revenue your slow website leaks every month from lost conversions — and what a speed fix is worth.
        </p>
        
        <div class="space-y-3 mb-6">
          <div class="flex items-center text-sm">
            <CheckCircle class="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
            <span class="text-gray-600">Revenue leaked per month & year</span>
          </div>
          <div class="flex items-center text-sm">
            <CheckCircle class="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
            <span class="text-gray-600">Conversion-decay model from load time</span>
          </div>
          <div class="flex items-center text-sm">
            <CheckCircle class="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
            <span class="text-gray-600">Speed-fix blueprint by email</span>
          </div>
        </div>
        
        <a 
          href="/labs/revleak" 
          class="w-full py-3 bg-linear-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 flex items-center justify-center group-hover:shadow-lg"
        >
          Audit My Leak
          <ArrowRight class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
        </a>
      </div>
    </div>

    <!-- Labs Call to Action -->
    <div class="text-center">
      <div class="bg-white rounded-2xl p-8 border-2 border-[var(--primary)]/20 shadow-lg max-w-3xl mx-auto">
        <div class="flex items-center justify-center mb-6">
          <div class="p-3 bg-linear-to-r from-[var(--primary)]/20 to-[var(--secondary)]/20 rounded-xl mr-4">
            <Globe class="w-6 h-6 text-[var(--primary)]" />
          </div>
          <div>
            <h3 class="text-2xl font-black text-gray-900">More Tools Coming Soon</h3>
            <p class="text-gray-600">We're constantly building new tools to help founders and product teams.</p>
          </div>
        </div>
        
        <div class="grid sm:grid-cols-2 gap-4 mt-6">
          <a 
            href="/labs" 
            class="py-3 px-6 bg-linear-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center group"
          >
            Explore All Tools
            <ArrowRight class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </a>
          
          <button 
            onclick={() => showNewsletter = true}
            class="py-3 px-6 border-2 border-[var(--primary)]/30 text-[var(--primary)] font-semibold rounded-xl hover:border-[var(--primary)]/60 hover:bg-[var(--primary)]/5 transition-all duration-300 flex items-center justify-center group"
          >
            <Mail class="w-4 h-4 mr-2" />
            Get Lab Updates
          </button>
        </div>
        
        <p class="text-sm text-gray-500 mt-4">
          Subscribe to be first to know about new tools, features, and exclusive content.
        </p>
      </div>
    </div>
  </div>
</section>

  <!-- Testimonials Section -->
<section id="testimonials" class="py-20 bg-linear-to-br from-gray-50 to-white relative overflow-hidden scroll-mt-24">
  <div class="container mx-auto max-w-6xl px-4">
    <div class="text-center mb-16">
      <div class="inline-flex items-center space-x-2 bg-[var(--secondary)]/10 border border-[var(--secondary)]/20 rounded-full px-4 py-2 text-sm text-[var(--secondary-dark)] font-semibold mb-4">
        <Quote class="w-4 h-4" />
        <span>REAL CLIENT FEEDBACK</span>
      </div>
      <h2 class="text-4xl md:text-5xl font-black text-gray-900 mb-4">
        What Our <span class="gradient-text">Clients Say</span>
      </h2>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        Real feedback from clients we've worked with. Each review is verified from actual projects.
      </p>
    </div>

    {#if loading}
      <div class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading testimonials...</p>
      </div>
    {:else if realTestimonials.length === 0}
      <div class="text-center py-12">
        <p class="text-gray-500">No testimonials yet. Be the first to review!</p>
      </div>
    {:else}
      <!-- Testimonial Grid -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each realTestimonials as testimonial}
          <div class="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-[var(--primary)]/20 transition-all duration-300 hover:shadow-lg">
            <div class="flex items-start space-x-3 mb-4">
              <div class="w-12 h-12 bg-linear-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <span class="text-[var(--primary)] font-black text-sm">
                  {testimonial.client_name?.split(' ').map(n => n[0]).join('') || 'C'}
                </span>
              </div>
              <div>
                <h4 class="font-black text-gray-900">{testimonial.client_name || 'Client'}</h4>
                <p class="text-[var(--primary)] text-sm font-semibold">
                  {testimonial.projects?.project_name || 'Project'}
                </p>
              </div>
            </div>
            <p class="text-gray-600 text-sm leading-relaxed line-clamp-3">
              "{testimonial.testimonial || testimonial.feedback}"
            </p>
            <div class="flex items-center justify-between mt-4">
              <div class="flex">
                {#each Array(5) as _, i}
                  <Star class="w-3 h-3 {i < testimonial.rating ? 'fill-[var(--secondary)] text-[var(--secondary)]' : 'fill-gray-200 text-gray-300'}" />
                {/each}
              </div>
              <span class="text-xs text-gray-500">
                {new Date(testimonial.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        {/each}
      </div>

      <!-- View All Reviews Button -->
      <div class="text-center mt-12">
        <a href="/reviews" class="inline-flex items-center px-6 py-3 bg-linear-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300">
          View All Reviews
          <ArrowRight class="w-4 h-4 ml-2" />
        </a>
      </div>
    {/if}
  </div>
</section>

  <!-- Lead Magnet: Website Cost Guide -->
  <section class="py-16 px-4 bg-gray-50">
    <div class="container mx-auto max-w-2xl">
      <LeadMagnetDownload />
    </div>
  </section>

  <!-- Creative CTA Section -->
  <section class="py-20 px-4 relative overflow-hidden">
    <div class="absolute inset-0 bg-linear-to-br from-[var(--primary)] via-[var(--accent)] to-[var(--primary-dark)]"></div>
    <div class="absolute inset-0 bg-black/10"></div>

    <div class="container mx-auto max-w-4xl text-center relative z-10">
      <div class="glass-card rounded-3xl p-12 border border-white/20">
        <Cpu class="w-16 h-16 mx-auto mb-6 text-white" />
        <h2 class="text-4xl md:text-5xl font-black text-white mb-6">
          Ready to Create Something
          <span class="text-[var(--secondary)]">Amazing?</span>
        </h2>
        <p class="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Let's combine your vision with our technical expertise to build digital experiences that captivate and convert.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/contact" class="px-8 py-4 bg-[var(--secondary)] text-gray-900 font-black rounded-xl hover:bg-[var(--secondary-light)] transition-all duration-300 text-lg">
            <span class="flex items-center justify-center">
              Start Your Project
              <Zap class="w-5 h-5 ml-2" />
            </span>
          </a>
          <button class="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:border-white/60 hover:bg-white/10 transition-all duration-300">
            <span class="flex items-center justify-center">
              <MessageCircle class="w-5 h-5 mr-2" />
              Book a Call
            </span>
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- AEO: direct-answer FAQ (cited by AI Overviews / ChatGPT) -->
  <section class="py-20 bg-gray-50">
    <div class="container mx-auto max-w-3xl px-4">
      <div class="text-center mb-10">
        <h2 class="text-3xl md:text-4xl font-black text-gray-900">Frequently Asked Questions</h2>
        <p class="text-gray-500 mt-2">The questions businesses ask us — and the answers AI assistants quote.</p>
      </div>
      <div class="space-y-4">
        {#each faqs as faq}
          <details class="group rounded-2xl border border-gray-200 bg-white p-5 [&_summary]:cursor-pointer [&_summary]:font-semibold [&_summary]:text-gray-900">
            <summary class="flex items-center justify-between">
              {faq.q}
              <span class="text-[var(--primary)] transition-transform group-open:rotate-45">+</span>
            </summary>
            <p class="mt-3 text-gray-600 leading-relaxed">{faq.a}</p>
          </details>
        {/each}
      </div>
    </div>
  </section>

</div>

<svelte:head>
  <link rel="canonical" href="https://rydertech.ng" />
  {@html `<script type="application/ld+json">${faqJson}</script>`}
</svelte:head>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
  
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  /* Pulse animation for the "NEW" badge */
  @keyframes gentle-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
  
</style>