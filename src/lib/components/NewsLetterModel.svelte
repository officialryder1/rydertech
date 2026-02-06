<script>
  import { X, Send, Gift, Clock, Users, ArrowRight, Zap, CheckCircle } from '@lucide/svelte';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';

  // Props
  // @ts-ignore
  // @ts-ignore
  let { show, onClose, onSubscribe = (email) => {} } = $props();

  // Local state
  let userEmail = $state('');
  let isSubmitting = $state(false);
  let submitted = $state(false);
  let error = $state(null);

  // Close on escape key
  onMount(() => {
    // @ts-ignore
    const handleEscape = (e) => {
      if (e.key === 'Escape' && show) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  });

  // @ts-ignore
  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!userEmail || !userEmail.includes('@')) {
      return;
    }

    isSubmitting = true;
    error = null;

    try {
      // @ts-ignore
      const { data, error: supabaseError } = await supabase
        .from('newsletter_subscriptions')
        .insert([
          {
            email: userEmail,
            subscribed_at: new Date().toISOString(),
            source: 'welcome_modal' // Fixed typo from 'welcome_model'
          }
        ])
        .select();

      if (supabaseError) {
        throw supabaseError;
      }

      // Call the parent subscribe function if provided
      await onSubscribe(userEmail);
      
      submitted = true;

      // Store in localStorage to prevent showing again
      localStorage.setItem('rydertech_newsletter_subscribed', 'true');

      setTimeout(() => {
        onClose();
        setTimeout(() => {
          submitted = false;
          userEmail = '';
        }, 300);
      }, 2000);
    } catch (err) {
      console.error('Subscription Error:', err); // Changed to console.error
      // @ts-ignore
      error = 'Failed to subscribe. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }

  // @ts-ignore
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  // Reset when opened
  $effect(() => {
    if (show) {
      submitted = false;
      userEmail = '';
      isSubmitting = false;
      error = null;
    }
  });
</script>

<svelte:window on:keydown={(e) => e.key === 'Escape' && show && onClose()} />

{#if show}
  <!-- Backdrop -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore event_directive_deprecated -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
    on:click={handleBackdropClick}
  >
    <!-- Modal Content -->
    <!-- svelte-ignore event_directive_deprecated -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
      class="relative w-full max-w-md animate-scale-in"
      on:click|stopPropagation
    >
      {#if !submitted}
        <!-- Newsletter Subscription Form -->
        <div class="glass-card rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          <!-- Header with Gradient -->
          <div class="bg-linear-to-r from-primary to-(--primary-dark) p-6 text-center relative">
            <!-- Close Button -->
            <!-- svelte-ignore event_directive_deprecated -->
            <button 
              on:click={onClose}
              class="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
            >
              <X class="w-4 h-4 text-white" />
            </button>
            
            <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Gift class="w-8 h-8 text-white" />
            </div>
            
            <h3 class="text-2xl font-black text-white mb-2">Welcome to RyderTech! 🚀</h3>
            <p class="text-white/90 text-sm">Join our exclusive community of innovators</p>
          </div>

          <!-- Content -->
          <div class="p-6 bg-white">
            <!-- Error Message -->
            {#if error}
              <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            {/if}

            <!-- Benefits List -->
            <div class="space-y-3 mb-6">
              {#each [
                { icon: Zap, text: 'Get early access to new features' },
                { icon: Clock, text: 'Exclusive tech insights & tutorials' },
                { icon: Users, text: 'Join 2,000+ developers' },
                { icon: Gift, text: 'Special offers for subscribers' }
              ] as benefit}
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-linear-to-rrom-[var(--primary)]/10 to-(--secondary)/10 rounded-lg flex items-center justify-center shrink-0">
                    <benefit.icon class="w-4 h-4 text-primary" />
                  </div>
                  <span class="text-gray-700 text-sm font-medium">{benefit.text}</span>
                </div>
              {/each}
            </div>

            <!-- Subscription Form -->
            <!-- svelte-ignore event_directive_deprecated -->
            <!-- svelte-ignore event_directive_deprecated -->
            <form on:submit={handleSubmit} class="space-y-4">
              <div>
                <label for="newsletter-email" class="sr-only">Email Address</label>
                <div class="relative">
                  <input
                    id="newsletter-email"
                    type="email"
                    bind:value={userEmail}
                    placeholder="Enter your email address"
                    required
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900"
                    disabled={isSubmitting}
                  />
                  <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Send class="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !userEmail}
                class="w-full creative-button py-3 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {#if isSubmitting}
                  <div class="flex items-center justify-center">
                    <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Subscribing...
                  </div>
                {:else}
                  <span class="flex items-center justify-center">
                    Join Newsletter
                    <ArrowRight class="w-4 h-4 ml-2" />
                  </span>
                {/if}
              </button>
            </form>

            <!-- Privacy Note -->
            <p class="text-center text-gray-500 text-xs mt-4">
              No spam ever. Unsubscribe at any time.
            </p>
          </div>
        </div>
      {:else}
        <!-- Success State -->
        <div class="glass-card rounded-3xl border border-white/20 shadow-2xl overflow-hidden text-center">
          <div class="bg-linear-to-r from-green-500 to-emerald-600 p-8">
            <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle class="w-10 h-10 text-white" />
            </div>
            <h3 class="text-2xl font-black text-white mb-2">Welcome Aboard! 🎉</h3>
            <p class="text-white/90 text-sm">Thank you for subscribing to our newsletter</p>
          </div>
          
          <div class="p-6 bg-white">
            <div class="w-16 h-16 bg-linear-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift class="w-8 h-8 text-emerald-600" />
            </div>
            <p class="text-gray-700 font-semibold mb-2">Your welcome gift is on its way!</p>
            <p class="text-gray-600 text-sm">We've sent you our exclusive tech resources pack</p>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }

  .animate-scale-in {
    animation: scaleIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes scaleIn {
    from { 
      opacity: 0;
      transform: scale(0.9) translateY(10px);
    }
    to { 
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
</style>