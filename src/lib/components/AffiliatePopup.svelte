<script>
  import { X, Gift, DollarSign, Users, TrendingUp, CheckCircle, Clock, Award, Copy, ExternalLink } from '@lucide/svelte';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  export let show = false;
  export let onClose = () => {};
  export const autoShowDelay = 5000; // 5 seconds default

  let copied = false;
  let referralLink = '';
  let daysRemaining = 14; // 14 days promo
  let hoursRemaining = 8;

  // Countdown timer
  let timerInterval;

  onMount(() => {
    if (browser) {
      // Generate a unique referral link for the current user
      const userId = localStorage.getItem('rydertech_affiliate_id') || generateUserId();
      referralLink = `https://rydertech.com/ref/${userId}`;
      
      // Countdown timer
      timerInterval = setInterval(() => {
        if (hoursRemaining > 0) {
          hoursRemaining--;
        } else {
          if (daysRemaining > 0) {
            daysRemaining--;
            hoursRemaining = 23;
          }
        }
      }, 3600000); // Update every hour
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  });

  function generateUserId() {
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    if (browser) {
      localStorage.setItem('rydertech_affiliate_id', id);
    }
    return id;
  }

  function copyReferralLink() {
    navigator.clipboard.writeText(referralLink);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }

  function handleClose() {
    if (browser) {
      localStorage.setItem('rydertech_affiliate_popup_closed', Date.now().toString());
    }
    onClose();
  }
</script>

{#if show}
  <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-black/50 backdrop-blur-sm"
      onclick={handleClose}
    ></div>
    
    <!-- Popup Card -->
    <div class="relative bg-gradient-to-br from-[var(--primary)] via-[var(--accent)] to-[var(--secondary)] rounded-3xl shadow-2xl max-w-2xl w-full animate-slideUp overflow-hidden">
      <!-- Close Button -->
      <button 
        onclick={handleClose}
        class="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors z-10 text-white"
        aria-label="Close popup"
      >
        <X class="w-5 h-5" />
      </button>
      
      <!-- Pattern Overlay -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl"></div>
      </div>
      
      <!-- Content -->
      <div class="relative p-8 md:p-10">
        <!-- Header Badge -->
        <div class="flex justify-center mb-6">
          <div class="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 text-white text-sm font-semibold">
            <Gift class="w-4 h-4" />
            <span>🚀 LIMITED TIME AFFILIATE PROGRAM</span>
          </div>
        </div>
        
        <!-- Timer -->
        <div class="flex justify-center mb-8">
          <div class="inline-flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
            <Clock class="w-5 h-5 text-white animate-pulse" />
            <div class="flex items-center space-x-3">
              <div class="text-center">
                <div class="text-2xl font-black text-white">{daysRemaining}</div>
                <div class="text-xs text-white/70">Days</div>
              </div>
              <div class="text-white/50 text-xl font-bold">:</div>
              <div class="text-center">
                <div class="text-2xl font-black text-white">{hoursRemaining}</div>
                <div class="text-xs text-white/70">Hours</div>
              </div>
              <div class="text-white/50 text-xl font-bold">:</div>
              <div class="text-center">
                <div class="text-2xl font-black text-white">59</div>
                <div class="text-xs text-white/70">Mins</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Title -->
        <h2 class="text-3xl md:text-4xl font-black text-white text-center mb-4">
          Earn <span class="text-[var(--secondary-light)]">₦50,000</span> Per Referral!
        </h2>
        
        <!-- Subtitle -->
        <p class="text-lg text-white/90 text-center mb-8 max-w-xl mx-auto">
          Join our affiliate program and earn huge commissions for every client you refer to us.
        </p>
        
        <!-- Stats Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
            <div class="text-2xl font-black text-white mb-1">₦50k</div>
            <div class="text-xs text-white/70">Per Referral</div>
          </div>
          <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
            <div class="text-2xl font-black text-white mb-1">10%</div>
            <div class="text-xs text-white/70">Recurring</div>
          </div>
          <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
            <div class="text-2xl font-black text-white mb-1">30+</div>
            <div class="text-xs text-white/70">Active Affiliates</div>
          </div>
          <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
            <div class="text-2xl font-black text-white mb-1">₦2.5M</div>
            <div class="text-xs text-white/70">Paid Out</div>
          </div>
        </div>
        
        <!-- Features -->
        <div class="grid md:grid-cols-2 gap-4 mb-8">
          <div class="flex items-start space-x-3">
            <div class="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle class="w-5 h-5 text-green-300" />
            </div>
            <div>
              <div class="font-semibold text-white">Instant Commission</div>
              <div class="text-sm text-white/70">Get paid as soon as client pays</div>
            </div>
          </div>
          
          <div class="flex items-start space-x-3">
            <div class="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp class="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div class="font-semibold text-white">Recurring Commission</div>
              <div class="text-sm text-white/70">Earn 10% on repeat business</div>
            </div>
          </div>
          
          <div class="flex items-start space-x-3">
            <div class="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users class="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <div class="font-semibold text-white">Unlimited Referrals</div>
              <div class="text-sm text-white/70">No cap on how many you refer</div>
            </div>
          </div>
          
          <div class="flex items-start space-x-3">
            <div class="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Award class="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div class="font-semibold text-white">Bonus Tiers</div>
              <div class="text-sm text-white/70">Extra ₦100k for 5+ referrals</div>
            </div>
          </div>
        </div>
        
        <!-- Referral Link Box -->
        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 mb-8">
          <div class="text-sm text-white/70 mb-2">Your Referral Link:</div>
          <div class="flex items-center gap-2">
            <input 
              type="text" 
              value={referralLink}
              readonly
              class="flex-1 px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white text-sm focus:outline-none"
            />
            <button
              onclick={copyReferralLink}
              class="px-4 py-3 bg-white text-[var(--primary)] font-semibold rounded-xl hover:bg-gray-100 transition-colors flex items-center"
            >
              {#if copied}
                <CheckCircle class="w-5 h-5 mr-2" />
                Copied!
              {:else}
                <Copy class="w-5 h-5 mr-2" />
                Copy
              {/if}
            </button>
          </div>
        </div>
        
        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-4">
          <a 
            href="/affiliate/join"
            class="flex-1 px-6 py-4 bg-white text-[var(--primary)] font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 text-center flex items-center justify-center group"
          >
            Join Affiliate Program
            <ExternalLink class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </a>
          
          <a 
            href="/affiliate"
            class="flex-1 px-6 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors text-center"
          >
            Learn More
          </a>
        </div>
        
        <!-- Terms -->
        <p class="text-center text-white/50 text-xs mt-6">
          *Terms and conditions apply. Minimum payout ₦10,000.
        </p>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { 
      opacity: 0;
      transform: translateY(50px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
  
  .animate-slideUp {
    animation: slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
</style>