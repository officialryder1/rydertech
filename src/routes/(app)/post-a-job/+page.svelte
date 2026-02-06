<script>
  import { ArrowLeft, CheckCircle, Shield, Users } from '@lucide/svelte';
  import { onMount } from 'svelte';

  let formData = $state({
    company: '',
    title: '',
    description: '',
    location: 'Remote',
    type: 'Full-time',
    email: '',
    website: ''
  });

  let isLoading = $state(false);
  let isSubmitted = $state(false);
  let promoApplied = $state(false);

  // Check for promo parameter
  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('promo') === '$1') {
      promoApplied = true;
    }
  });

  async function handleSubmit(e) {
    e.preventDefault();
    isLoading = true;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    isLoading = false;
    isSubmitted = true;

    // In reality, you would send this to your backend
    // await fetch('/api/jobs', {
    //   method: 'POST',
    //   body: JSON.stringify(formData)
    // });
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-32 pb-20">
  <div class="container mx-auto max-w-4xl px-4">
    <!-- Back Button -->
    <a href="/blog" class="inline-flex items-center text-[var(--primary)] hover:underline mb-8">
      <ArrowLeft class="w-4 h-4 mr-2" />
      Back to Blog
    </a>

    <!-- Header -->
    <div class="text-center mb-12">
      {#if promoApplied}
        <div class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-full mb-4">
          <div class="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
          $1 SPECIAL OFFER APPLIED
        </div>
      {/if}

      <h1 class="text-4xl md:text-5xl font-black text-gray-900 mb-4">
        Post a Job on RyderTech
      </h1>
      <p class="text-xl text-gray-600">
        Reach thousands of qualified Nigerian tech professionals
      </p>
    </div>

    <div class="grid lg:grid-cols-3 gap-8">
      <!-- Left Column - Form -->
      <div class="lg:col-span-2">
        {#if isSubmitted}
          <!-- Success State -->
          <div class="bg-white rounded-2xl p-8 border-2 border-green-200 text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle class="w-8 h-8 text-green-600" />
            </div>
            <h2 class="text-2xl font-black text-gray-900 mb-4">Job Posted Successfully!</h2>
            <!-- <p class="text-gray-600 mb-6">
              Your job listing is now live and visible to our community of 5,000+ tech professionals.
              You should start receiving applications within 24 hours.
            </p> -->
            <p class="text-gray-600 mb-6"> Job Posting still in beta mode not yet live. would be notify when live!</p>
            <div class="space-y-4">
              <a 
                href="/job-board" 
                class="inline-block w-full py-3 bg-[var(--primary)] text-white font-semibold rounded-xl hover:bg-[var(--primary-dark)] transition-colors"
              >
                View Your Job Posting
              </a>
              <a 
                href="/blog" 
                class="inline-block w-full py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 transition-colors"
              >
                Return to Blog
              </a>
            </div>
          </div>
        {:else}
          <!-- Form -->
          <form on:submit={handleSubmit} class="space-y-6">
            <div class="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 class="text-xl font-black text-gray-900 mb-6">Job Details</h3>
              
              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    bind:value={formData.company}
                    type="text"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    placeholder="Your company name"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    bind:value={formData.title}
                    type="text"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    placeholder="e.g., Senior Frontend Developer"
                  />
                </div>
              </div>
              
              <div class="mt-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  bind:value={formData.description}
                  required
                  rows="6"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  placeholder="Describe the role, requirements, and benefits..."
                ></textarea>
              </div>
              
              <div class="grid md:grid-cols-3 gap-6 mt-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    bind:value={formData.location}
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Lagos">Lagos</option>
                    <option value="Abuja">Abuja</option>
                    <option value="Port Harcourt">Port Harcourt</option>
                    <option value="Ibadan">Ibadan</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Job Type
                  </label>
                  <select
                    bind:value={formData.type}
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <input
                    bind:value={formData.email}
                    type="email"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    placeholder="contact@company.com"
                  />
                </div>
              </div>
            </div>
            
            <!-- Submit Button -->
            <button
              type="submit"
              disabled={isLoading}
              class="w-full py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {#if isLoading}
                <span class="flex items-center justify-center">
                  <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Processing...
                </span>
              {:else}
                <span class="flex items-center justify-center">
                  {#if promoApplied}
                    Post Job for $1
                  {:else}
                    Post Job ($49)
                  {/if}
                  <CheckCircle class="w-5 h-5 ml-2" />
                </span>
              {/if}
            </button>
            
            <p class="text-center text-sm text-gray-500">
              By posting, you agree to our <a href="/terms" class="text-[var(--primary)] hover:underline">Terms of Service</a>
            </p>
          </form>
        {/if}
      </div>
      
      <!-- Right Column - Benefits -->
      <div class="space-y-6">
        <!-- Pricing Card -->
        <div class="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white rounded-2xl p-6">
          <div class="text-center mb-6">
            <div class="text-5xl font-black mb-2">
              {#if promoApplied}
                $1
              {:else}
                $49
              {/if}
            </div>
            <p class="text-white/80">30-day job listing</p>
          </div>
          
          <ul class="space-y-4">
            <li class="flex items-center">
              <div class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <Users class="w-3 h-3" />
              </div>
              <span>Reach 5,000+ tech professionals</span>
            </li>
            <li class="flex items-center">
              <div class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <Shield class="w-3 h-3" />
              </div>
              <span>Spam-free applications</span>
            </li>
            <li class="flex items-center">
              <div class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <CheckCircle class="w-3 h-3" />
              </div>
              <span>Candidate filtering tools</span>
            </li>
          </ul>
          
          {#if !promoApplied}
            <div class="mt-6 pt-6 border-t border-white/20">
              <p class="text-center text-white/80 text-sm">
                Blog readers get special $1 pricing
              </p>
              <a 
                href="/blog" 
                class="block text-center mt-2 text-white font-semibold hover:underline"
              >
                Read blog first →
              </a>
            </div>
          {/if}
        </div>
        
        <!-- Stats -->
        <div class="bg-white rounded-2xl p-6 border border-gray-200">
          <h4 class="font-black text-gray-900 mb-4">Why RyderTech Jobs?</h4>
          <div class="space-y-4">
            <div>
              <div class="text-2xl font-black text-[var(--primary)]">24h</div>
              <p class="text-sm text-gray-600">Average time to first application</p>
            </div>
            <div>
              <div class="text-2xl font-black text-[var(--primary)]">80%</div>
              <p class="text-sm text-gray-600">Hiring success rate</p>
            </div>
            <div>
              <div class="text-2xl font-black text-[var(--primary)]">4.8★</div>
              <p class="text-sm text-gray-600">Employer satisfaction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>