<script lang="ts">
  import { onMount } from 'svelte';
  import { Menu, X, ArrowRight, CircuitBoard } from '@lucide/svelte';
  import { page } from '$app/stores'

  let scrolled = $state(false);
  let mobileMenuOpen = $state(false);
  let isMobile = $state(false);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'Work', href: '/work' },
    { name: 'Blog', href: '/blog' },
    { name: 'Review', href: '/reviews' },
    { name: 'Contact', href: '/contact' }
  ];


  onMount(() => {
    const handleScroll = () => {
      scrolled = window.scrollY > 20;
    };

    const handleResize = () => {
      isMobile = window.innerWidth < 768;
    };

    handleResize(); // Initial check

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  });

  function closeMobileMenu() {
    mobileMenuOpen = false;
    document.body.style.overflow = 'auto';
  }

  function openMobileMenu() {
    mobileMenuOpen = true;
    document.body.style.overflow = 'hidden';
  }

</script>

<nav 
  class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 {scrolled 
    ? 'bg-white/90 backdrop-blur-md shadow-lg py-3' 
    : 'bg-transparent py-5'}"
>
  <div class="container mx-auto px-4 max-w-6xl">
    <div class="flex items-center justify-between">
      <!-- Logo -->
     <a href="/" class="flex items-center space-x-3 group cursor-pointer">
        <div class="relative">
          <div class="w-12 h-12 bg-linear-to-br from-primary to-(--primary-dark) rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
            <CircuitBoard class="w-6 h-6 text-white" />
          </div>
          <div class="absolute -inset-2 bg-(--primary)/20 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300"></div>
        </div>
        <div>
          <span class="text-2xl font-black bg-linear-to-r from-primary to-(--primary-dark) bg-clip-text text-transparent">RYDER</span>
          <span class="text-2xl font-black text-secondary">TECH</span>
        </div>
      </a>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center space-x-6">
        {#each navItems as item}
          <a
            href={item.href}
            class="text-gray-700 font-medium hover:text-primary transition-colors duration-200 relative group"
          >
            {item.name}
            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-linear-to-r from-primary to-[var(--secondary)] group-hover:w-full transition-all duration-300"></span>
          </a>
        {/each}

        <a
          href="/contact"
          class="creative-button px-6 py-2.5 text-white font-semibold rounded-xl ml-4"
        >
          <span class="flex items-center">
            Get Started
            <ArrowRight class="w-4 h-4 ml-2" />
          </span>
        </a>
      </div>

      <!-- Mobile Menu Button -->
      <button
        class="md:hidden p-2 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 z-50"
        onclick={() => mobileMenuOpen ? closeMobileMenu() : openMobileMenu()}
        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        {#if mobileMenuOpen}
          <X class="w-6 h-6 text-gray-700" />
        {:else}
          <Menu class="w-6 h-6 text-gray-700" />
        {/if}
      </button>
    </div>

    <!-- Mobile Menu Overlay -->
    {#if mobileMenuOpen}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onclick={closeMobileMenu}></div>
    {/if}

    <!-- Mobile Menu Panel -->
    <div
      class="md:hidden fixed top-0 right-0 h-screen w-80 bg-white shadow-2xl z-40 transform transition-transform duration-300 {mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}"
    >
      <div class="p-8 h-full flex flex-col">
        <!-- Mobile Logo -->
        <div class="mb-10">
          <a href="/" class="flex items-center space-x-3" onclick={closeMobileMenu}>
            <div class="w-12 h-12 bg-linear-to-brrom-[var(--primary)] to-(--primary-dark) rounded-2xl flex items-center justify-center">
              <span class="text-white font-black text-xl">R</span>
            </div>
            <div>
              <span class="text-2xl font-black text-gray-900">RyderTech</span>
              <p class="text-sm text-gray-500">Nigeria's Leading Web Agency</p>
            </div>
          </a>
        </div>

        <!-- Mobile Navigation Items -->
        <div class="flex-1 space-y-2">
          {#each navItems as item}
            <a
              href={item.href}
              class="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200 group"
              onclick={() => closeMobileMenu()}
              
            >
              <span class="text-gray-800 font-medium text-lg group-hover:text-primary">
                {item.name}
              </span>
              <div class="w-8 h-8 rounded-lg bg-linear-to-r from-(--primary)/10 to-(--secondary)/10 flex items-center justify-center group-hover:from-(--primary)/20 group-hover:to-(--secondary)/20">
                <ArrowRight class="w-4 h-4 text-primary" />
              </div>
            </a>
          {/each}
        </div>

        <!-- Mobile CTA -->
        <div class="pt-8 border-t border-gray-100">
          <a
            href="/contact"
            class="creative-button w-full py-4 text-white font-semibold rounded-xl flex items-center justify-center mb-4"
            onclick={closeMobileMenu}
          >
            <span class="flex items-center">
              Start Your Project
              <ArrowRight class="w-5 h-5 ml-2" />
            </span>
          </a>
          
          <div class="text-center text-sm text-gray-500">
            <p>Need help? Call us:</p>
            <a href="tel:+2349033147769" class="text-primary font-semibold hover:underline">
              +234 903 314 7769
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</nav>

<style>
  .creative-button {
    background: linear-gradient(135deg, 
      var(--primary) 0%, 
      var(--primary-dark) 50%, 
      var(--secondary) 100%);
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .creative-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(var(--primary-rgb), 0.3);
  }

  .creative-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: 0.5s;
  }

  .creative-button:hover::before {
    left: 100%;
  }
</style>