<script lang="ts">
	import '../../app.css';
	import { injectAnalytics } from '@vercel/analytics/sveltekit'
  import { dev, browser} from '$app/environment';
	import { onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/stores'
  import Navbar from '$lib/components/Navbar.svelte';
  import '@fontsource-variable/inter';
  import { fade } from 'svelte/transition';

	import { 
    CircuitBoard,
    Zap,
    Mail,
    Phone,
    MapPin
  } from '@lucide/svelte';
	
  injectAnalytics({ mode: dev ? 'development' : 'production' });
	let { children } = $props();
	let scrollY = $state(0);
	let mouseX = $state(0);
  let mouseY = $state(0);
  let lastTick = $state(0)
	let date = new Date();

  // afterNavigate runs every time the route changes
  afterNavigate(() => {
    if (browser && window.gtag) {
      window.gtag('config', 'G-KXN2CLVLK9', {
        page_path: $page.url.pathname,
        page_title: document.title
      })
    }
  })

  const handleMouseMove = (e: MouseEvent) => {
    const now = Date.now();
    if (now - lastTick < 16) return; // Throttle to ~60

    mouseX = e.clientX;
    mouseY = e.clientY;
    lastTick = now;
  }
	
  onMount(() => {
        detectServiceWorkerUpdate();
  });


	onMount(() => {

		const handleScroll = () => scrollY = window.scrollY;

		window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('mousemove', handleMouseMove);
    };
	});

  let updateAvailable = $state(false);
  let registration: ServiceWorkerRegistration | null = null;

  async function detectServiceWorkerUpdate() {
    if (!browser || !('serviceWorker' in navigator)) return;

    registration = await navigator.serviceWorker.ready;

    registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Instead of confirm(), we just set our state to true
                updateAvailable = true;
            }
        });
    });
}

function applyUpdate() {
    registration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
}
</script>

<svelte:head>
	<title>RyderTech - Leading Web Design & Software Agency in Nigeria</title>
	<meta name="description" content="RyderTech is Nigeria's top web design and software development agency. We create custom websites, mobile apps, and digital solutions for businesses across Nigeria." />

  <!-- Open Graph -->
   <meta property="og:type" content="website" />
   <meta property="og:url" content="https://rydertech.ng"/>
   <meta property="og:title" content="RyderTech - Web Design & Software Agency in Nigeria" />
   <meta property="og:description" content="Nigeria's premier web design and software development agency creating digital solutions for businesses." />
    <meta property="og:image" content="https://rydertech.ng/og-image.jpg" />

  <!-- Twitter Card -->
   <meta property="twitter:card" content="summary_large_image" />
   <meta property="twitter:url" content="https://rydertech.ng" />
   <meta property="twitter:title" content="RyderTech - Web Design & Software Agency in Nigeria" />
   <meta property="twitter:description" content="Nigeria's premier web design and software development agency creating digital solutions for businesses." />
   <meta property="twitter:image" content="https://rydertech.ng/og-image.jpg" />

   <!-- Additional SEO tags -->
    <meta name="keywords" content="web design Nigeria, software agency Nigeria, website development Lagos, website development abuja, custom software Nigeria, mobile app development Nigeria, e-commerce website Nigeria, digital agency Nigeria" />
    <meta name="author" content="RyderTech" />
    <meta name="robots" content="index, follow" />
    <meta name="googlebot" content="index, follow" />

    <!-- Local Business Schema -->
     <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "name": "RyderTech",
        "description": "Leading web design and software development agency in Nigeria",
        "url": "https://rydertech.ng",
        "logo": "https://rydertech.ng/logo.png",
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "NG",
            "addressRegion": "Abuja",
            "addressLocality": "Abuja"
        },
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+234-903-314-7769",
            "contactType": "Customer Service",
            "areaServed": "NG",
            "availableLanguage": ["English"]
        },
        "sameAs": [
            "https://twitter.com/official_ryder0",
            "https://instagram.com/rydertech.ng"
        ]
    }
    </script>
</svelte:head>

<div class="min-h-screen bg-white overflow-hidden">
  <!-- Animated Background -->
  <div class="fixed inset-0 pointer-events-none geometric-pattern"></div>
  
  <!-- Floating Shapes -->
  <div class="fixed top-20 right-20 w-64 h-64 floating-shapes"></div>
  <!-- svelte-ignore element_invalid_self_closing_tag -->
  <div class="fixed bottom-40 left-10 w-48 h-48 floating-shapes" style="animation-delay: 2s;"></div>

  <!-- Navigation -->
  <Navbar />

  <!-- Main Content -->
  <main transition:fade>
     <!-- Blog Header -->
    {#if updateAvailable}
      <div class="fixed bottom-6 right-6 z-[100] max-w-sm bg-gray-900 text-white p-4 rounded-2xl shadow-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-4">
        <div class="flex items-start space-x-4">
          <div class="bg-[var(--primary)] p-2 rounded-lg">
            <Zap class="w-5 h-5" />
          </div>
          <div class="flex-1">
            <h3 class="font-bold">Update Available</h3>
            <p class="text-sm text-gray-400">A new version of RyderTech is ready.</p>
            <div class="mt-3 flex space-x-3">
              <button 
                onclick={applyUpdate}
                class="bg-white text-black px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
              >
                Update Now
              </button>
              <button 
                onclick={() => updateAvailable = false}
                class="text-gray-400 px-2 py-1.5 text-sm hover:text-white transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    {/if}
    
    {@render children()}
  </main>

  <!-- Footer -->
  <footer class="bg-gray-900 text-white py-16 px-4">
    <div class="container mx-auto max-w-6xl">
      <div class="grid md:grid-cols-4 gap-8">
        <div class="md:col-span-2">
          <div class="flex items-center space-x-3 mb-6">
            <div class="w-12 h-12 bg-linear-to-br from-[var(--primary)] to-[var(--secondary)] rounded-2xl flex items-center justify-center">
              <CircuitBoard class="w-6 h-6 text-white" />
            </div>
            <div>
              <div class="text-2xl font-black">RYDER<span class="text-[var(--secondary)]">TECH</span></div>
              <div class="text-gray-400 text-sm">Creative Software Agency</div>
            </div>
          </div>
          <p class="text-gray-400 max-w-md text-lg leading-relaxed">
            We build digital experiences that blend creative design with cutting-edge technology to help businesses stand out and succeed.
          </p>
        </div>
        
        <div>
          <h3 class="font-black text-lg mb-4">Connect</h3>
          <div class="space-y-3 text-gray-400">
            <div class="flex items-center hover:text-white transition-colors cursor-pointer">
              <Mail class="w-4 h-4 mr-3" />
              rydertech.ng@gmail.com
            </div>
            <div class="flex items-center hover:text-white transition-colors cursor-pointer">
              <Phone class="w-4 h-4 mr-3" />
              +234 903 3147 769
            </div>
            <div class="flex items-center hover:text-white transition-colors cursor-pointer">
              <MapPin class="w-4 h-4 mr-3" />
              Jabi Lake Mall, Abuja, Nigeria
            </div>
          </div>
        </div>
        
        <div>
          <h3 class="font-black text-lg mb-4">Explore</h3>
          <div class="space-y-2 text-gray-400">
            {#each ['Our Work', 'Services', 'About', 'Reviews', 'Blog', 'Careers'] as item}
              <a 
                href="/{item.toLowerCase().replace(' ', '-')}" 
                class="hover:text-white transition-colors cursor-pointer block"
              >
                {item}
              </a>
            {/each}
          </div>
        </div>
      </div>
      
      <div class="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
        <p>&copy; {date.getFullYear()} RyderTech. Crafting digital excellence with creative technology.</p>
      </div>
    </div>
  </footer>
</div>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
  
  :global(body) {
    font-family: 'Inter Variable', sans-serif;
  }
</style>
