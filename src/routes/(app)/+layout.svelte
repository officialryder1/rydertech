<script lang="ts">
	import '../../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
 
	import { 
    Code, 
    CircuitBoard,
    Zap,
    Sparkles,
    ArrowRight,
    MessageCircle,
    Mail,
    Phone,
    MapPin
  } from '@lucide/svelte';
	
	let { children } = $props();
	let scrollY = $state(0);
	let mouseX = $state(0);
  	let mouseY = $state(0);
	let date = new Date();
	
   onMount(() => {
        detectServiceWorkerUpdate();
    });

	onMount(() => {
		const handleScroll = () => scrollY = window.scrollY;
		const handleMouseMove = (e) => {
		mouseX = e.clientX;
		mouseY = e.clientY;
		};

		window.addEventListener('scroll', handleScroll);
		window.addEventListener('mousemove', handleMouseMove);

		return () => {
		window.removeEventListener('scroll', handleScroll);
		window.removeEventListener('mousemove', handleMouseMove);
		};
	});

  async function detectServiceWorkerUpdate() {
        const registration = await navigator.serviceWorker.ready;

        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;

            newWorker?.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New update available
                    if (confirm('A new version is available. Do you want to update?')) {
                        newWorker.postMessage({ type: 'SKIP_WAITING' });
                        window.location.reload();
                    }
                }
            });
        });
    }
</script>

<svelte:head>
	<title>RyderTech - Creative Software Development Agency</title>
	<meta name="description" content="RyderTech delivers cutting-edge software solutions with creative design and modern technologies." />
	<meta name="keywords" content="RyderTech, Software Development, Creative Agency, Web Development, Mobile Apps, Custom Software, Technology Solutions" />
	<meta name="author" content="RyderTech" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
</svelte:head>

<div class="min-h-screen bg-white overflow-hidden">
  <!-- Animated Background -->
  <div class="fixed inset-0 pointer-events-none geometric-pattern" />
  
  <!-- Floating Shapes -->
  <div class="fixed top-20 right-20 w-64 h-64 floating-shapes" />
  <div class="fixed bottom-40 left-10 w-48 h-48 floating-shapes" style="animation-delay: 2s;" />

  <!-- Navigation -->
  <nav class="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 transition-all duration-300" class:py-8={scrollY < 100} class:py-4={scrollY >= 100}>
    <div class="container mx-auto px-4 flex justify-between items-center">
      <!-- Creative Logo -->
      <a href="/" class="flex items-center space-x-3 group cursor-pointer">
        <div class="relative">
          <div class="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
            <CircuitBoard class="w-6 h-6 text-white" />
          </div>
          <div class="absolute -inset-2 bg-[var(--primary)]/20 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300" />
        </div>
        <div>
          <span class="text-2xl font-black bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] bg-clip-text text-transparent">RYDER</span>
          <span class="text-2xl font-black text-[var(--secondary)]">TECH</span>
        </div>
      </a>
      
      <!-- Navigation Links -->
      <div class="hidden md:flex space-x-8">
        {#each ['Services', 'Work', 'About', 'Contact'] as item}
          <a 
            href="/{item.toLowerCase()}" 
            class="text-gray-700 hover:text-[var(--primary)] font-semibold transition-all duration-300 relative group"
          >
            {item}
            <div class="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] group-hover:w-full transition-all duration-300" />
          </a>
        {/each}
      </div>

      <!-- Creative CTA Button -->
      <a href="/contact" class="creative-button px-8 py-3 text-white font-semibold rounded-xl overflow-hidden">
        <span class="flex items-center">
          Start Project
          <Zap class="w-4 h-4 ml-2" />
        </span>
      </a>
    </div>
  </nav>

  <!-- Main Content -->
  <main>
    
    {@render children()}
  </main>

  <!-- Footer -->
  <footer class="bg-gray-900 text-white py-16 px-4">
    <div class="container mx-auto max-w-6xl">
      <div class="grid md:grid-cols-4 gap-8">
        <div class="md:col-span-2">
          <div class="flex items-center space-x-3 mb-6">
            <div class="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-2xl flex items-center justify-center">
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
            {#each ['Our Work', 'Services', 'About', 'Blog', 'Careers'] as item}
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
    font-family: 'Inter', sans-serif;
  }
</style>
