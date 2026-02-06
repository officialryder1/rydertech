<script>
  import { DollarSign, Rocket, CheckCircle, Clock } from '@lucide/svelte';
  
  let showPromo = $state(true);
  
  // Check if user has interacted with this before
  import { onMount } from 'svelte';
  
  onMount(() => {
    const hasInteracted = localStorage.getItem('rydertech_job_promo_interacted');
    if (hasInteracted === 'true') {
      showPromo = false;
    }
  });
  
  function handleClose() {
    showPromo = false;
    localStorage.setItem('rydertech_job_promo_interacted', 'true');
  }
</script>

{#if showPromo}
  <div class="my-8 border-2 border-dashed border-[var(--primary)]/30 rounded-2xl p-6 bg-gradient-to-br from-white to-[var(--primary)]/5 relative overflow-hidden group hover:border-[var(--primary)]/50 transition-all duration-300">
    <!-- Decorative Background -->
    <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10 rounded-full -translate-y-16 translate-x-16"></div>
    
    <!-- Content -->
    <div class="relative z-10">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-xl">
            <DollarSign class="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 class="text-2xl font-black text-gray-900">Need to Hire?</h3>
            <p class="text-[var(--primary)] font-semibold">Special $1 Job Posting for Blog Readers</p>
          </div>
        </div>
        
        <button 
          onclick={handleClose}
          class="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close promotion"
        >
          <span class="text-xs">Hide</span>
        </button>
      </div>
      
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="flex items-start space-x-3">
          <div class="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
            <Rocket class="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h4 class="font-bold text-gray-900">Fast Hiring</h4>
            <p class="text-gray-600 text-sm">Get applications within 24 hours</p>
          </div>
        </div>
        
        <div class="flex items-start space-x-3">
          <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <CheckCircle class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 class="font-bold text-gray-900">Verified Talent</h4>
            <p class="text-gray-600 text-sm">All candidates are pre-vetted</p>
          </div>
        </div>
        
        <div class="flex items-start space-x-3">
          <div class="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
            <Clock class="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h4 class="font-bold text-gray-900">30-Day Listing</h4>
            <p class="text-gray-600 text-sm">Job stays active for a month</p>
          </div>
        </div>
      </div>
      
      <!-- CTA Section -->
      <div class="flex flex-col sm:flex-row items-center justify-between bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
        <div class="mb-4 sm:mb-0">
          <div class="flex items-baseline">
            <span class="text-4xl font-black text-[var(--primary-dark)]">$1</span>
            <span class="text-gray-500 ml-2 line-through">$49</span>
          </div>
          <p class="text-sm text-gray-600 mt-1">Limited to first 50 blog readers</p>
        </div>
        
        <div class="flex space-x-4">
          <a 
            href="/post-a-job?promo=$1"
            class="px-8 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            Post Job Now
          </a>
          <a 
            href="/job-board"
            class="px-6 py-3 border-2 border-[var(--primary)]/30 text-[var(--primary)] font-semibold rounded-xl hover:border-[var(--primary)]/60 hover:bg-[var(--primary)]/5 transition-colors"
          >
            View Jobs
          </a>
        </div>
      </div>
      
      <div class="text-center mt-4">
        <p class="text-xs text-gray-500">
          Already posted? <a href="/manage-jobs" class="text-[var(--primary)] hover:underline font-medium">Manage your listings</a>
        </p>
      </div>
    </div>
  </div>
{/if}