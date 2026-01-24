<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { supabase } from '$lib/supabaseClient';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Check, X, Trash2, ChevronLeft } from '@lucide/svelte';
  import StarRating from '$lib/components/ui/star-rating.svelte';
  // Remove svelte-sonner import for now or use client wrapper

  let project: any = null;
  let reviews: any[] = [];
  let loading = true;

  onMount(async () => {
    await loadData();
  });

  async function loadData() {
    const projectId = $page.params.projectId;
    
    try {
      // Load project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;
      project = projectData;

      // Load reviews for this project
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;
      reviews = reviewsData || [];
    } catch (err: any) {
      console.error('Error loading data:', err);
      showToast('Failed to load data', 'error');
    } finally {
      loading = false;
    }
  }

  async function approveReview(reviewId: string) {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ approved: true })
        .eq('id', reviewId);

      if (error) throw error;
      
      showToast('Review approved!', 'success');
      await loadData(); // Refresh the list
    } catch (err: any) {
      console.error('Error approving review:', err);
      showToast('Failed to approve review', 'error');
    }
  }

  async function rejectReview(reviewId: string) {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ approved: false })
        .eq('id', reviewId);

      if (error) throw error;
      
      showToast('Review rejected', 'success');
      await loadData(); // Refresh the list
    } catch (err: any) {
      console.error('Error rejecting review:', err);
      showToast('Failed to reject review', 'error');
    }
  }

  async function deleteReview(reviewId: string) {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      
      showToast('Review deleted', 'success');
      await loadData(); // Refresh the list
    } catch (err: any) {
      console.error('Error deleting review:', err);
      showToast('Failed to delete review', 'error');
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Simple toast function without external library
  function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    toast.textContent = message;
    
    // Add to DOM
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  // Copy testimonial to clipboard
  async function copyTestimonial(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Testimonial copied to clipboard!', 'success');
    } catch (err) {
      showToast('Failed to copy testimonial', 'error');
    }
  }
</script>

<div class="container mx-auto py-8">
  <!-- Header -->
  <div class="mb-8">
    <Button variant="ghost" size="sm" onclick={() => window.history.back()}>
      <ChevronLeft class="h-4 w-4 mr-2" />
      Back to Projects
    </Button>
    
    <div class="mt-4">
      <h1 class="text-3xl font-bold">Reviews for {project?.project_name}</h1>
      <p class="text-gray-600">Client: {project?.client_name}</p>
      {#if project}
        <p class="text-sm text-gray-500 mt-1">
          Feedback Link: /feedback/{project.review_link_uuid}
        </p>
      {/if}
    </div>
  </div>

  {#if loading}
    <div class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading reviews...</p>
    </div>
  {:else if !project}
    <Card>
      <CardContent class="py-12 text-center">
        <p class="text-gray-500">Project not found.</p>
      </CardContent>
    </Card>
  {:else if reviews.length === 0}
    <Card>
      <CardContent class="py-12 text-center">
        <p class="text-gray-500">No reviews yet for this project.</p>
        <p class="text-sm text-gray-400 mt-2">Share the feedback link with your client to collect reviews.</p>
        {#if project}
          <div class="mt-4 p-3 bg-gray-50 rounded-lg">
            <p class="text-sm font-medium mb-2">Feedback Link:</p>
            <code class="text-sm bg-white p-2 rounded border block truncate">
              {typeof window !== 'undefined' ? `${window.location.origin}/feedback/${project.review_link_uuid}` : ''}
            </code>
            <Button 
              variant="outline" 
              size="sm" 
              class="mt-2"
              onclick={() => {
                if (typeof window !== 'undefined') {
                  navigator.clipboard.writeText(`${window.location.origin}/feedback/${project.review_link_uuid}`);
                  showToast('Link copied to clipboard!', 'success');
                }
              }}
            >
              Copy Link
            </Button>
          </div>
        {/if}
      </CardContent>
    </Card>
  {:else}
    <div class="space-y-6">
      <!-- Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent class="pt-6">
            <div class="text-center">
              <p class="text-3xl font-bold">{reviews.length}</p>
              <p class="text-sm text-gray-600">Total Reviews</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="pt-6">
            <div class="text-center">
              <p class="text-3xl font-bold">
                {reviews.filter(r => r.approved).length}
              </p>
              <p class="text-sm text-gray-600">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="pt-6">
            <div class="text-center">
              <p class="text-3xl font-bold">
                {(reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)}
              </p>
              <p class="text-sm text-gray-600">Average Rating</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Reviews List -->
      <div class="space-y-4">
        {#each reviews as review (review.id)}
          <Card class={review.approved ? 'border-green-500' : ''}>
            <CardHeader>
              <div class="flex justify-between items-start">
                <div>
                  <div class="flex items-center gap-2 mb-2">
                    <CardTitle class="text-lg">{review.client_name || 'Anonymous'}</CardTitle>
                    {#if review.approved}
                      <Badge variant="default">Approved</Badge>
                    {:else}
                      <Badge variant="outline">Pending</Badge>
                    {/if}
                  </div>
                  <div class="flex items-center gap-4">
                    <StarRating value={review.rating || 0} size="sm" />
                    <span class="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                  </div>
                </div>
                <div class="flex gap-2">
                  {#if !review.approved}
                    <Button variant="outline" size="sm" onclick={() => approveReview(review.id)} title="Approve">
                      <Check class="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onclick={() => rejectReview(review.id)} title="Reject">
                      <X class="h-4 w-4" />
                    </Button>
                  {/if}
                  <Button variant="outline" size="sm" onclick={() => deleteReview(review.id)} title="Delete">
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent class="space-y-4">
              <!-- Rating -->
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-700">Rating:</span>
                <span class="text-gray-800">{review.rating}/5</span>
              </div>

              <!-- Feedback -->
              <div>
                <p class="text-sm font-medium text-gray-700 mb-1">Feedback:</p>
                <p class="text-gray-800 bg-gray-50 p-3 rounded whitespace-pre-wrap">{review.feedback}</p>
              </div>

              <!-- Testimonial -->
              {#if review.testimonial}
                <div>
                  <p class="text-sm font-medium text-gray-700 mb-1">Testimonial:</p>
                  <div class="italic text-gray-700 bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                    "{review.testimonial}"
                  </div>
                </div>
              {/if}

              <!-- Actions -->
              {#if review.testimonial}
                <div class="flex gap-2">
                  <Button 
                    size="sm" 
                    onclick={() => copyTestimonial(review.testimonial)}
                  >
                    Copy Testimonial
                  </Button>
                </div>
              {/if}
            </CardContent>
          </Card>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>