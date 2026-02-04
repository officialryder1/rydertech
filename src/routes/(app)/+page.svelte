<script>
    import NewsLetterModel from '$lib/components/NewsLetterModel.svelte';
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
    Badge
  } from '@lucide/svelte';

  let showNewsletter = $state(false);
  let realTestimonials = $state([])
  let loading = $state(true)
  let lastTick = $state(0)

  onMount(async () => {
    // 1. data loading
    await loadTestimonials();

    // 2. newsletter logic
    const hasSubscribed = localStorage.getItem('rydertech_newsletter_subscribed');
    const modalClosedRecently = localStorage.getItem('rydertech_newsletter_closed');
    
    if (!hasSubscribed && !modalClosedRecently) {
      setTimeout(() => showNewsletter = true, 3000);
    }

    // 3. Optimized Event Listeners
    const handleScroll = () => scrollY = window.scrollY;
    
    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastTick < 16) return; // Cap at ~60fps
      mouseX = e.clientX;
      mouseY = e.clientY;
      lastTick = now;
    };

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
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        projects (
          project_name
        )
      `)
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(6);

    if (!error) {
      realTestimonials = data || [];
    }
    loading = false;
  }

  // Original services from your first request
  const services = [
    {
      icon: Globe,
      title: 'Web Development',
      description: 'Custom web applications built with modern technologies like SvelteKit, React, and Node.js.',
      features: ['Responsive Design', 'SEO Optimized', 'Fast Performance'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Smartphone,
      title: 'Mobile Apps',
      description: 'Cross-platform mobile applications for iOS and Android using React Native and Flutter.',
      features: ['Native Performance', 'Offline Capability', 'App Store Ready'],
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Database,
      title: 'Backend Systems',
      description: 'Scalable server architecture, APIs, and database solutions for your business needs.',
      features: ['RESTful APIs', 'Microservices', 'Database Design'],
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Cloud,
      title: 'Cloud Solutions',
      description: 'Deployment, migration, and management of cloud infrastructure on AWS, Azure, and Google Cloud.',
      features: ['Cloud Migration', 'DevOps', 'Serverless Architecture'],
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Shield,
      title: 'Security & Compliance',
      description: 'Enterprise-grade security solutions and compliance frameworks for your applications.',
      features: ['Security Audits', 'GDPR Compliance', 'Data Protection'],
      color: 'from-indigo-500 to-blue-500'
    },
    {
      icon: Code,
      title: 'Custom Software',
      description: 'Tailored software solutions designed to solve your unique business challenges.',
      features: ['Custom Workflows', 'Integration', 'Maintenance'],
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
          <div class="inline-flex items-center space-x-2 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-full px-4 py-2 text-sm text-[var(--primary)] font-semibold">
            <div class="w-2 h-2 bg-[var(--secondary)] rounded-full animate-pulse"></div>
            <span>CREATIVE TECH SOLUTIONS</span>
          </div>
          
          <!-- Main Headline -->
          <h1 class="text-5xl md:text-7xl font-black leading-tight">
             Nigeria's Leading <span class="gradient-text">Web Design</span>
            <br />
            <span class="text-gray-900">& Software Agency</span>
          </h1>
          
          <!-- Description -->
          <p class="text-xl text-gray-600 leading-relaxed">
            We build <strong>professional websites</strong> and <strong>custom software</strong> for businesses across Nigeria. 
            Serving clients in <strong>Lagos</strong>, <strong>Abuja</strong>, <strong>Port Harcourt</strong>, and nationwide.
          </p>
          
          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 pt-8">
            <a href="/contact" class="creative-button px-8 py-4 text-white font-semibold text-lg rounded-xl">
              <span class="flex items-center">
                Start Your Journey
                <ArrowRight class="w-5 h-5 ml-2" />
              </span>
            </a>
            
            <a href="/work" class="px-8 py-4 border-2 border-[var(--primary)]/20 text-[var(--primary)] font-semibold rounded-xl hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5 transition-all duration-300">
              <span class="flex items-center">
                View Our Work
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
                <div class="w-16 h-1 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full mx-auto"></div>
            </div>
            
            <div class="grid grid-cols-2 gap-3">
                {#each [
                { icon: Cpu, label: 'Frontend', tech: 'Svelte/React' },
                { icon: Database, label: 'Backend', tech: 'Node.js/Django' },
                { icon: Cloud, label: 'Cloud', tech: 'AWS/Azure' },
                { icon: Shield, label: 'Security', tech: 'Enterprise' }
                ] as stack}
                <div class="text-center p-3 rounded-xl bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5 border border-white/20 hover:scale-105 transition-all duration-300 group">
                    <div class="w-8 h-8 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
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
                <div class="aspect-square rounded-2xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10 border border-white/20 flex items-center justify-center hover:scale-105 transition-transform duration-300 group">
                <Cpu class="w-8 h-8 text-[var(--primary)] group-hover:scale-110 transition-transform duration-300" />
                </div>
            {/each}
            </div>

            <!-- Enhanced Bottom Section -->
            <div class="mt-6 text-center">
            <div class="relative inline-block">
                <div class="w-12 h-12 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-300 group">
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
        <div class="absolute -top-3 -right-3 md:-top-4 md:-right-4 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-[var(--secondary)] to-[var(--secondary-light)] rounded-2xl flex items-center justify-center shadow-lg animate-float">
            <Zap class="w-6 h-6 md:w-8 md:h-8 text-white" />
        </div>
        <div class="absolute -bottom-3 -left-3 md:-bottom-4 md:-left-4 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-[var(--accent)] to-[var(--primary-light)] rounded-2xl flex items-center justify-center shadow-lg animate-float" style="animation-delay: 1s;">
            <Sparkles class="w-4 h-4 md:w-6 md:h-6 text-white" />
        </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Stats Section -->
  <section class="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        {#each stats as stat, i}
          <div class="text-center group" style="animation-delay: {i * 0.1}s">
            <div class="relative inline-flex mb-4">
              <div class="p-4 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10 rounded-2xl border border-[var(--primary)]/20 group-hover:border-[var(--primary)]/40 transition-all duration-300 group-hover:scale-110">
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
            <div class="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <span class="text-white font-black text-lg">{brand.logo}</span>
            </div>
            
            <!-- Brand Name -->
            <h3 class="font-black text-gray-900 text-lg mb-2">{brand.name}</h3>
            
            <!-- Brand Description -->
            <p class="text-gray-600 text-sm">{brand.description}</p>
            
            <!-- Hover Indicator -->
            <div class="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div class="w-8 h-0.5 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] mx-auto rounded-full" />
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
          <Code class="w-4 h-4" />
          <span>OUR SERVICES</span>
        </div>
        <h2 class="text-4xl md:text-5xl font-black text-gray-900 mb-4">
          Creative <span class="gradient-text">Digital Solutions</span>
        </h2>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          We combine technical expertise with creative thinking to deliver solutions that stand out in the digital landscape.
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each services as service, i}
          <div class="service-card rounded-2xl p-6 shadow-lg hover:shadow-2xl" style="animation-delay: {i * 0.1}s">
            <!-- Icon -->
            <div class="mb-4">
              <div class="p-3 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10 rounded-xl w-fit">
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
            <button class="w-full py-2.5 text-[var(--primary)] font-semibold rounded-lg border border-[var(--primary)]/20 hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5 transition-all duration-200 flex items-center justify-center group" onclick={window.location.href = "/services"}>
              Explore
              <ArrowRight class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- RyderTech Labs Showcase -->
<section class="py-20 px-4 bg-gradient-to-br from-[var(--primary)]/5 via-white to-[var(--secondary)]/5 relative overflow-hidden" aria-labelledby="rydertech-labs">
  <div class="absolute inset-0 pointer-events-none">
    <div class="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-[var(--secondary)]/10 to-[var(--accent)]/10 rounded-full blur-3xl"></div>
  </div>
  
  <div class="container mx-auto max-w-6xl relative z-10">
    <div class="text-center mb-12">
      <div class="inline-flex items-center space-x-2 bg-gradient-to-r from-[var(--primary)]/20 to-[var(--secondary)]/20 border border-[var(--primary)]/30 rounded-full px-4 py-2 text-sm text-[var(--primary-dark)] font-semibold mb-4">
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
      <!-- Website Cost Estimator Card -->
      <div class="group bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-[var(--primary)]/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div class="flex items-start justify-between mb-4">
          <div class="p-3 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl">
            <Calculator class="w-6 h-6 text-blue-600" />
          </div>
          <Badge variant="outline" class="text-xs font-semibold border-[var(--secondary)]/30 text-[var(--secondary-dark)]">
            <Sparkles class="w-3 h-3 mr-1" />
            NEW
          </Badge>
        </div>
        
        <h3 class="text-xl font-black text-gray-900 mb-3">Website Cost Estimator</h3>
        <p class="text-gray-600 mb-4 leading-relaxed">
          Get a rough estimate of what it would cost to build your website based on your idea. 
          Get estimates in NGN or USD with real-time exchange rates.
        </p>
        
        <div class="space-y-3 mb-6">
          <div class="flex items-center text-sm">
            <CheckCircle class="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
            <span class="text-gray-600">Free to use, no signup required</span>
          </div>
          <div class="flex items-center text-sm">
            <CheckCircle class="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
            <span class="text-gray-600">NGN & USD currency support</span>
          </div>
          <div class="flex items-center text-sm">
            <CheckCircle class="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
            <span class="text-gray-600">Based on 50+ real projects</span>
          </div>
        </div>
        
        <a 
          href="/labs/cost-estimator" 
          class="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center group-hover:shadow-lg"
        >
          Try Free Tool
          <ArrowRight class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
        </a>
      </div>

      <!-- Website Copy Analyzer Card (Coming Soon) -->
      <div class="group bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div class="flex items-start justify-between mb-4">
          <div class="p-3 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl">
            <FileText class="w-6 h-6 text-purple-600" />
          </div>
          <Badge variant="outline" class="text-xs font-semibold border-gray-300 text-gray-500">
            COMING SOON
          </Badge>
        </div>
        
        <h3 class="text-xl font-black text-gray-900 mb-3">Website Copy Analyzer</h3>
        <p class="text-gray-600 mb-4 leading-relaxed">
          Analyze your homepage copy and get AI-powered feedback on clarity and conversion potential.
        </p>
        
        <div class="space-y-3 mb-6">
          <div class="flex items-center text-sm">
            <div class="w-4 h-4 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
              <div class="w-2 h-2 rounded-full bg-gray-400"></div>
            </div>
            <span class="text-gray-500">AI-powered feedback</span>
          </div>
          <div class="flex items-center text-sm">
            <div class="w-4 h-4 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
              <div class="w-2 h-2 rounded-full bg-gray-400"></div>
            </div>
            <span class="text-gray-500">SEO optimization tips</span>
          </div>
          <div class="flex items-center text-sm">
            <div class="w-4 h-4 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
              <div class="w-2 h-2 rounded-full bg-gray-400"></div>
            </div>
            <span class="text-gray-500">Conversion rate insights</span>
          </div>
        </div>
        
        <button 
          disabled
          class="w-full py-3 bg-gray-100 text-gray-400 font-semibold rounded-xl cursor-not-allowed flex items-center justify-center"
        >
          Notify Me When Ready
          <Bell class="w-4 h-4 ml-2" />
        </button>
      </div>

      <!-- MVP Feature Planner Card (Coming Soon) -->
      <div class="group bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div class="flex items-start justify-between mb-4">
          <div class="p-3 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-xl">
            <LayoutGrid class="w-6 h-6 text-emerald-600" />
          </div>
          <Badge variant="outline" class="text-xs font-semibold border-gray-300 text-gray-500">
            COMING SOON
          </Badge>
        </div>
        
        <h3 class="text-xl font-black text-gray-900 mb-3">MVP Feature Planner</h3>
        <p class="text-gray-600 mb-4 leading-relaxed">
          Prioritize features for your app or product MVP with AI-powered recommendations.
        </p>
        
        <div class="space-y-3 mb-6">
          <div class="flex items-center text-sm">
            <div class="w-4 h-4 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
              <div class="w-2 h-2 rounded-full bg-gray-400"></div>
            </div>
            <span class="text-gray-500">AI-powered prioritization</span>
          </div>
          <div class="flex items-center text-sm">
            <div class="w-4 h-4 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
              <div class="w-2 h-2 rounded-full bg-gray-400"></div>
            </div>
            <span class="text-gray-500">Timeline estimation</span>
          </div>
          <div class="flex items-center text-sm">
            <div class="w-4 h-4 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
              <div class="w-2 h-2 rounded-full bg-gray-400"></div>
            </div>
            <span class="text-gray-500">Resource planning</span>
          </div>
        </div>
        
        <button 
          disabled
          class="w-full py-3 bg-gray-100 text-gray-400 font-semibold rounded-xl cursor-not-allowed flex items-center justify-center"
        >
          Notify Me When Ready
          <Bell class="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>

    <!-- Labs Call to Action -->
    <div class="text-center">
      <div class="bg-white rounded-2xl p-8 border-2 border-[var(--primary)]/20 shadow-lg max-w-3xl mx-auto">
        <div class="flex items-center justify-center mb-6">
          <div class="p-3 bg-gradient-to-r from-[var(--primary)]/20 to-[var(--secondary)]/20 rounded-xl mr-4">
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
            class="py-3 px-6 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center group"
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
<section class="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
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
              <div class="w-12 h-12 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10 rounded-xl flex items-center justify-center flex-shrink-0">
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
        <a href="/reviews" class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300">
          View All Reviews
          <ArrowRight class="w-4 h-4 ml-2" />
        </a>
      </div>
    {/if}
  </div>
</section>

  <!-- Creative CTA Section -->
  <section class="py-20 px-4 relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-[var(--primary)] via-[var(--accent)] to-[var(--primary-dark)]"></div>
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

</div>

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