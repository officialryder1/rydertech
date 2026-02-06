<script>
  import { DollarSign, X, Users, Zap, Target } from '@lucide/svelte';
  
  let isVisible = $state(true);
  let timer = $state(15); // Countdown timer in seconds
  
  // Countdown timer
  if (isVisible) {
    const interval = setInterval(() => {
      if (timer > 0) {
        timer--;
      } else {
        clearInterval(interval);
      }
    }, 1000);
  }
  
  function closeBanner() {
    isVisible = false;
  }
</script>

{#if isVisible}
  <div class="relative bg-gradient-to-r from-[var(--primary-dark)] via-[var(--primary)] to-[var(--secondary)] text-white p-4 rounded-2xl mb-8 shadow-lg slide-in">
    <!-- Close Button -->
    <button 
      onclick={closeBanner}
      class="absolute top-3 right-3 hover:bg-white/20 rounded-full transition-colors z-10"
      aria-label="Close banner"
    >
      <X class="w-4 h-4" />
    </button>
    
    <div class="flex flex-col md:flex-row items-center justify-between">
      <!-- Left Content -->
      <div class="flex-1 mb-4 md:mb-0 md:mr-6">
        <div class="flex items-center space-x-3 mb-3">
          <div class="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <DollarSign class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-xl font-black">Post a Job for Only $1</h3>
            <p class="text-white/90 text-sm">Limited time offer for blog readers</p>
          </div>
        </div>
        
        <div class="grid grid-cols-3 gap-4 mt-4">
          <div class="flex items-center">
            <Users class="w-4 h-4 mr-2 text-white/80" />
            <span class="text-sm">5,000+ Talent</span>
          </div>
          <div class="flex items-center">
            <Zap class="w-4 h-4 mr-2 text-white/80" />
            <span class="text-sm">Instant Posting</span>
          </div>
          <div class="flex items-center">
            <Target class="w-4 h-4 mr-2 text-white/80" />
            <span class="text-sm">Niche Audience</span>
          </div>
        </div>
      </div>
      
      <!-- Right CTA -->
      <div class="flex flex-col items-center md:items-end space-y-3">
        <div class="text-center md:text-right">
          <div class="text-2xl font-black">$1</div>
          <div class="text-xs text-white/70 line-through">Regular: $49</div>
        </div>
        
        <a 
          href="/post-a-job?promo=$1"
          class="px-6 py-3 bg-white text-[var(--primary-dark)] font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl whitespace-nowrap"
        >
          Post Job Now
        </a>
        
        <div class="flex items-center text-xs text-white/80">
          <div class="w-2 h-2 bg-red-400 rounded-full animate-pulse mr-2"></div>
          <span>Offer ends in: {timer}s</span>
        </div>
      </div>
    </div>
    
    <!-- Progress Bar -->
    <div class="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
      <div 
        class="h-full bg-gradient-to-r from-green-400 to-cyan-400 rounded-full transition-all duration-1000"
        style="width: {100 - (timer / 15 * 100)}%"
      ></div>
    </div>
  </div>
{/if}

<style>
  .slide-in {
    animation: slideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>