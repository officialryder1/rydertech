<script>
  import { DollarSign, X, Briefcase, TrendingUp, Clock } from '@lucide/svelte';
  
  let { position = 'top-right', showCloseButton = true, autoCloseTime = 0 } = $props(); // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
  
  let isVisible = $state(true);
  let isHovered = $state(false);
  let isAnimating = $state(false);
  
  // Close the alert
  function closeAlert() {
    isAnimating = true;
    setTimeout(() => {
      isVisible = false;
      isAnimating = false;
    }, 300);
  }
  
  // Auto-close if specified
  if (autoCloseTime > 0) {
    setTimeout(() => {
      if (!isHovered) closeAlert();
    }, autoCloseTime);
  }
  
  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };
</script>

{#if isVisible}
  <div 
    class="fixed z-[9999] {positionClasses[position]} transition-all duration-300 ease-out"
    class:opacity-0={isAnimating}
    class:scale-95={isAnimating}
    onmouseenter={() => isHovered = true}
    onmouseleave={() => isHovered = false}
  >
    <!-- Main Card -->
    <div class="w-80 md:w-96 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
      <!-- Header with Gradient -->
      <div class="relative h-2 bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)]"></div>
      
      <!-- Content -->
      <div class="p-5">
        <!-- Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-gradient-to-br from-green-100 to-green-50 rounded-lg border border-green-200">
              <DollarSign class="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div class="inline-flex items-center px-2 py-1 bg-green-100 rounded-full">
                <div class="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span class="text-xs font-bold text-green-700">SPECIAL OFFER</span>
              </div>
              <h3 class="text-lg font-black text-gray-900 mt-1">Post a Job for $1</h3>
            </div>
          </div>
          
          {#if showCloseButton}
            <button 
              onclick={closeAlert}
              class="p-3 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close promotion"
            >
              <X class="w-4 h-4 text-gray-500" />
            </button>
          {/if}
        </div>
        
        <!-- Description -->
        <p class="text-gray-600 text-sm leading-relaxed mb-5">
          Looking for top tech talent in Nigeria? Post your job listing on RyderTech and reach thousands of qualified developers, designers, and tech professionals.
        </p>
        
        <!-- Features -->
        <div class="space-y-3 mb-6">
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
              <Briefcase class="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p class="font-semibold text-gray-900 text-sm">Top Nigerian Talent</p>
              <p class="text-gray-500 text-xs">Reach 5,000+ tech professionals</p>
            </div>
          </div>
          
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center mr-3">
              <TrendingUp class="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p class="font-semibold text-gray-900 text-sm">30-Day Listing</p>
              <p class="text-gray-500 text-xs">Your job stays active for a full month</p>
            </div>
          </div>
          
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center mr-3">
              <Clock class="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p class="font-semibold text-gray-900 text-sm">Limited Time Offer</p>
              <p class="text-gray-500 text-xs">Only 50 spots available at $1</p>
            </div>
          </div>
        </div>
        
        <!-- CTA Button -->
        <a 
          href="/post-a-job?promo=$1"
          class="block w-full py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl text-center hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:shadow-lg mb-3"
        >
          Post Job for $1
          <span class="text-xs font-normal opacity-90 block mt-1">Limited time only</span>
        </a>
        
        <!-- Fine Print -->
        <p class="text-xs text-gray-400 text-center">
          Regular price: $49. Offer ends soon. No hidden fees.
        </p>
      </div>
    </div>
    
    <!-- Corner Decoration -->
    <div class="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-[var(--secondary)] to-[var(--primary)] rounded-lg -rotate-12 flex items-center justify-center shadow-lg">
      <span class="text-white text-xs font-black">$1</span>
    </div>
  </div>
{/if}

<style>
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .slide-in {
    animation: slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
</style>