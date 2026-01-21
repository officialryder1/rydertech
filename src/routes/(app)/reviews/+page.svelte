<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { Star, Quote, Filter, Calendar, Star as StarIcon } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';

  let reviews: any[] = [];
  let loading = true;
  let filter = 'all'; // all, 5-star, recent
  let stats = {
    total: 0,
    averageRating: 0,
    fiveStar: 0
  };

  onMount(async () => {
    await loadReviews();
  });

  async function loadReviews() {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        projects (
          project_name,
          client_name
        )
      `)
      .eq('approved', true)
      .order('created_at', { ascending: false });

    if (!error) {
      reviews = data || [];
      calculateStats();
    }
    loading = false;
  }

  function calculateStats() {
    stats.total = reviews.length;
    stats.averageRating = reviews.length > 0 
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
      : 0;
    stats.fiveStar = reviews.filter(r => r.rating === 5).length;
  }

  function getFilteredReviews() {
    let filtered = [...reviews];
    
    if (filter === '5-star') {
      filtered = filtered.filter(r => r.rating === 5);
    } else if (filter === 'recent') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      filtered = filtered.filter(r => new Date(r.created_at) > oneMonthAgo);
    }
    
    return filtered;
  }
</script>

<svelte:head>
  <title>Client Reviews - RyderTech</title>
  <meta name="description" content="Read verified reviews from our satisfied clients. See what businesses say about working with RyderTech." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-gray-50 to-white">
  <!-- Hero -->
  <section class="pt-32 pb-20 px-4">
    <div class="container mx-auto max-w-6xl">
      <div class="text-center">
        <div class="inline-flex items-center space-x-2 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-full px-4 py-2 text-sm text-[var(--primary)] font-semibold mb-6">
          <Quote class="w-4 h-4" />
          <span>VERIFIED REVIEWS</span>
        </div>
        <h1 class="text-5xl md:text-7xl font-black text-gray-900 mb-6">
          Client <span class="gradient-text">Success Stories</span>
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Real feedback from businesses we've helped transform with technology. 
          Every review is verified from completed projects.
        </p>
        
        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
          <div class="text-center p-6 rounded-2xl bg-white border border-gray-200">
            <div class="text-4xl font-black text-[var(--primary)] mb-2">{stats.total}</div>
            <div class="text-gray-600">Total Reviews</div>
          </div>
          <div class="text-center p-6 rounded-2xl bg-white border border-gray-200">
            <div class="text-4xl font-black text-[var(--primary)] mb-2">{stats.averageRating.toFixed(1)}</div>
            <div class="text-gray-600">Avg. Rating</div>
          </div>
          <div class="text-center p-6 rounded-2xl bg-white border border-gray-200">
            <div class="text-4xl font-black text-[var(--primary)] mb-2">{stats.fiveStar}</div>
            <div class="text-gray-600">5-Star Reviews</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Reviews Section -->
  <section class="pb-20 px-4">
    <div class="container mx-auto max-w-6xl">
      <!-- Filters -->
      <div class="flex flex-wrap justify-center gap-4 mb-12">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'}
          on:click={() => filter = 'all'}
        >
          All Reviews
        </Button>
        <Button 
          variant={filter === '5-star' ? 'default' : 'outline'}
          on:click={() => filter = '5-star'}
        >
          <StarIcon class="w-4 h-4 mr-2" />
          5-Star Reviews
        </Button>
        <Button 
          variant={filter === 'recent' ? 'default' : 'outline'}
          on:click={() => filter = 'recent'}
        >
          <Calendar class="w-4 h-4 mr-2" />
          Recent (30 Days)
        </Button>
      </div>

      {#if loading}
        <div class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading reviews...</p>
        </div>
      {:else if getFilteredReviews().length === 0}
        <div class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <Quote class="w-16 h-16 mx-auto" />
          </div>
          <p class="text-gray-500 text-lg">No reviews found.</p>
        </div>
      {:else}
        <!-- Reviews Grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {#each getFilteredReviews() as review}
            <div class="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-[var(--primary)]/20 transition-all duration-300 hover:shadow-xl group">
              <!-- Rating -->
              <div class="flex items-center mb-4">
                {#each Array(5) as _, i}
                  <Star class="w-5 h-5 {i < review.rating ? 'fill-[var(--secondary)] text-[var(--secondary)]' : 'fill-gray-200 text-gray-300'}" />
                {/each}
                <span class="ml-2 text-sm font-semibold text-gray-700">{review.rating}.0</span>
              </div>
              
              <!-- Content -->
              <p class="text-gray-700 mb-6 leading-relaxed italic">
                "{review.testimonial || review.feedback}"
              </p>
              
              <!-- Client Info -->
              <div class="flex items-center justify-between pt-6 border-t border-gray-100">
                <div>
                  <h4 class="font-black text-gray-900">{review.client_name}</h4>
                  <p class="text-sm text-gray-600">{review.projects?.project_name}</p>
                </div>
                <div class="text-xs text-gray-500">
                  {new Date(review.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </section>

  <!-- CTA Section -->
  <section class="py-20 px-4 bg-gradient-to-r from-[var(--primary-dark)] to-[var(--primary)]">
    <div class="container mx-auto max-w-4xl text-center">
      <h2 class="text-4xl md:text-5xl font-black text-white mb-6">
        Want to Share Your Experience?
      </h2>
      <p class="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
        If you've worked with us and would like to leave a review, 
        contact us and we'll send you a personalized feedback link.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="/contact" class="px-8 py-4 bg-white text-[var(--primary)] font-black rounded-xl hover:bg-gray-100 transition-all duration-300 text-lg">
          Contact Us
        </a>
        <a href="/#testimonials" class="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:border-white/60 hover:bg-white/10 transition-all duration-300">
          View More Testimonials
        </a>
      </div>
    </div>
  </section>
</div>