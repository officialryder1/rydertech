<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { supabase } from '$lib/supabaseClient';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { CheckCircle, AlertCircle } from '@lucide/svelte';
  import StarRating from '$lib/components/ui/star-rating.svelte';
  import { toast } from 'svelte-sonner';

  let project: any = null;
  let loading = true;
  let error: string | null = null;
  let submitted = false;
  
  let formData = {
    clientName: '',
    rating: 0,
    feedback: '',
    testimonial: '',
  };

  $: reviewLink = typeof window !== 'undefined' ? window.location.href : '';

  onMount(async () => {
    const uuid = $page.params.uuid;
    
    try {
      const { data, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('review_link_uuid', uuid)
        .single();

      if (projectError) throw projectError;
      if (!data) throw new Error('Project not found');
      
      project = data;
    } catch (err) {
      error = 'Invalid or expired feedback link';
      console.error(err);
    } finally {
      loading = false;
    }
  });

  async function submitReview() {
    if (!project || !formData.rating || !formData.feedback) {
      toast.error('Please provide a rating and feedback');
      return;
    }

    try {
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          project_id: project.id,
          client_name: formData.clientName || project.client_name,
          rating: formData.rating,
          feedback: formData.feedback,
          testimonial: formData.testimonial
        });

      if (reviewError) throw reviewError;
      
      submitted = true;
      toast.success('Thank you for your feedback!');
      
      // Optional: Send notification email to yourself
      await sendNotificationEmail();
    } catch (err) {
      toast.error('Failed to submit review');
      console.error(err);
    }
  }

  async function sendNotificationEmail() {
    // Implement email notification using Supabase Edge Functions or your email service
    // This is a placeholder for your email integration
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(reviewLink);
    toast.success('Link copied to clipboard!');
  }
</script>

<div class="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-12 px-4">
  <div class="max-w-2xl mx-auto">
    {#if loading}
      <div class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading feedback form...</p>
      </div>
    {:else if error}
      <Alert variant="destructive">
        <AlertCircle class="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    {:else if submitted}
      <Card class="border-green-200 bg-green-50">
        <CardHeader>
          <div class="flex items-center gap-2">
            <CheckCircle class="h-6 w-6 text-green-600" />
            <CardTitle class="text-green-800">Thank You!</CardTitle>
          </div>
          <CardDescription class="text-green-700">
            Your feedback has been submitted successfully. We appreciate your time!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <p class="text-gray-700">
              Your review helps us improve our services and helps other clients make informed decisions.
            </p>
            <div class="flex gap-2">
              <Button onclick={() => window.location.href = '/'}>
                Return to Home
              </Button>
              <Button variant="outline" onclick={() => window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(`Just completed a project with @RyderTech! ${reviewLink}`))}>
                Share on Twitter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    {:else if project}
      <Card>
        <CardHeader>
          <CardTitle>Share Your Feedback</CardTitle>
          <CardDescription>
            How was your experience working with us on "{project.project_name}"?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-6">
            <!-- Project Info -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-semibold text-gray-900">Project Details</h3>
              <p class="text-sm text-gray-600 mt-1">{project.project_name}</p>
              {#if project.description}
                <p class="text-sm text-gray-500 mt-2">{project.description}</p>
              {/if}
            </div>

            <!-- Rating -->
            <div class="space-y-2">
              <Label for="rating">Overall Rating *</Label>
              <div class="flex items-center gap-4">
                <StarRating bind:value={formData.rating} editable />
                <span class="text-sm text-gray-600">{formData.rating}/5</span>
              </div>
            </div>

            <!-- Feedback -->
            <div class="space-y-2">
              <Label for="feedback">Your Feedback *</Label>
              <Textarea
                id="feedback"
                bind:value={formData.feedback}
                placeholder="What did you like about our service? Any areas for improvement?"
                rows={4}
                required
              />
            </div>

            <!-- Testimonial (Optional) -->
            <div class="space-y-2">
              <Label for="testimonial">Testimonial (Optional)</Label>
              <Textarea
                id="testimonial"
                bind:value={formData.testimonial}
                placeholder="Would you like to share a testimonial for our website? (This may be featured publicly)"
                rows={3}
              />
            </div>

            <!-- Name -->
            <div class="space-y-2">
              <Label for="clientName">Your Name (Optional)</Label>
              <Input
                id="clientName"
                bind:value={formData.clientName}
                placeholder={project.client_name}
              />
            </div>

            <!-- Submit -->
            <Button onclick={submitReview} size="lg" class="w-full">
              Submit Review
            </Button>

            <!-- Share Link -->
            <div class="pt-6 border-t">
              <p class="text-sm text-gray-600 mb-2">Share this feedback page:</p>
              <div class="flex gap-2">
                <Input value={reviewLink} readonly class="flex-1" />
                <Button variant="outline" onclick={copyToClipboard}>
                  Copy Link
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    {/if}
  </div>
</div>