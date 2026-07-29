<!-- src/lib/components/AffiliateJoinModal.svelte -->
<script>
  import { X, CheckCircle, ArrowRight, AlertCircle } from '@lucide/svelte';
  import { createEventDispatcher } from 'svelte';

  export let show = false;
  
  const dispatch = createEventDispatcher();
  
  let formData = {
    fullName: '',
    email: '',
    phone: '',
    howHeard: '',
    website: '',
    agreeTerms: false
  };
  
  let isLoading = false;
  let success = false;
  let errors = {};

  function validateForm() {
    const newErrors = {};
    
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms';
    
    errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    isLoading = true;
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    isLoading = false;
    success = true;
    
    // In production, send to your backend
    // await fetch('/api/affiliate/join', {
    //   method: 'POST',
    //   body: JSON.stringify(formData)
    // });
    
    // Close modal after 3 seconds
    setTimeout(() => {
      dispatch('close');
      success = false;
    }, 3000);
  }

  function closeModal() {
    dispatch('close');
  }
</script>

{#if show}
  <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" on:click={closeModal}></div>
    
    <!-- Modal -->
    <div class="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slideUp">
      <!-- Close Button -->
      <button 
        on:click={closeModal}
        class="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
      >
        <X class="w-5 h-5 text-gray-500" />
      </button>
      
      {#if success}
        <!-- Success State -->
        <div class="p-8 text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle class="w-8 h-8 text-green-600" />
          </div>
          <h3 class="text-2xl font-black text-gray-900 mb-3">Successfully Joined!</h3>
          <p class="text-gray-600 mb-6">
            Welcome to the RyderTech Affiliate Program! Check your email for next steps.
          </p>
          <div class="p-4 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10 rounded-xl">
            <p class="text-sm text-gray-700">
              <span class="font-bold">Next steps:</span> You'll receive your affiliate dashboard access within 24 hours.
            </p>
          </div>
        </div>
      {:else}
        <!-- Form -->
        <div class="p-8">
          <h3 class="text-2xl font-black text-gray-900 mb-2">Join Affiliate Program</h3>
          <p class="text-gray-600 mb-6">Start earning commissions by referring clients to us.</p>
          
          <form on:submit={handleSubmit}>
            <!-- Full Name -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                bind:value={formData.fullName}
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                placeholder="John Doe"
                class:border-red-500={errors.fullName}
              />
              {#if errors.fullName}
                <p class="mt-1 text-sm text-red-600">{errors.fullName}</p>
              {/if}
            </div>
            
            <!-- Email -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                bind:value={formData.email}
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                placeholder="john@example.com"
                class:border-red-500={errors.email}
              />
              {#if errors.email}
                <p class="mt-1 text-sm text-red-600">{errors.email}</p>
              {/if}
            </div>
            
            <!-- Phone -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                bind:value={formData.phone}
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                placeholder="+234 800 000 0000"
                class:border-red-500={errors.phone}
              />
              {#if errors.phone}
                <p class="mt-1 text-sm text-red-600">{errors.phone}</p>
              {/if}
            </div>
            
            <!-- How did you hear about us? -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                How did you hear about us?
              </label>
              <select
                bind:value={formData.howHeard}
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              >
                <option value="">Select an option</option>
                <option value="social">Social Media</option>
                <option value="friend">Friend/Family</option>
                <option value="google">Google Search</option>
                <option value="blog">RyderTech Blog</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <!-- Website (Optional) -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Website/Social Media (Optional)
              </label>
              <input
                type="url"
                bind:value={formData.website}
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                placeholder="https://yourwebsite.com"
              />
            </div>
            
            <!-- Terms Agreement -->
            <div class="mb-6">
              <label class="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  bind:checked={formData.agreeTerms}
                  class="mt-1 mr-3"
                />
                <span class="text-sm text-gray-600">
                  I agree to the <a href="/terms" class="text-[var(--primary)] hover:underline" target="_blank">Terms of Service</a> and 
                  <a href="/privacy" class="text-[var(--primary)] hover:underline" target="_blank">Privacy Policy</a>. I understand that commissions are subject to the affiliate program terms.
                </span>
              </label>
              {#if errors.agreeTerms}
                <p class="mt-1 text-sm text-red-600">{errors.agreeTerms}</p>
              {/if}
            </div>
            
            <!-- Submit Button -->
            <button
              type="submit"
              disabled={isLoading}
              class="w-full py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {#if isLoading}
                <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Processing...
              {:else}
                Join Affiliate Program
                <ArrowRight class="w-5 h-5 ml-2" />
              {/if}
            </button>
          </form>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
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
  
  .animate-slideUp {
    animation: slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
</style>