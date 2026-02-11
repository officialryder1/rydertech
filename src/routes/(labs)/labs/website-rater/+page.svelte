<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import { enhance } from '$app/forms';
  import type { ActionResult } from '@sveltejs/kit';

  import { 
    ArrowLeft, 
    Globe, 
    Star, 
    Sparkles,
    Loader2,
    MessageSquare,
    Layout,
    Type,
    Palette,
    ThumbsUp,
    AlertCircle
  } from "@lucide/svelte";

  // Form result
  let { form } = $props()
  
  // State
  let websiteUrl = $state('');
  let isAnalyzing = $state(false);
  let showResults = $state(false);
  
  // Initialize with empty data
  let feedbackData = $state({
    score: 0,
    feedback: '',
    testedUrl: '',
    analysisDate: new Date().toISOString(),
    strengths: [],
    improvements: []
  });

  // Handle form result changes
  $effect(() => {
    if (form?.data?.success && form.data.data) {
      // Update feedback data with server response
      feedbackData = {
        ...form.data.data,
        testedUrl: form.data.data.testedUrl || websiteUrl,
        analysisDate: form.data.data.analysisDate || new Date().toISOString(),
        strengths: form.data.data.strengths || [],
        improvements: form.data.data.improvements || []
      };
      showResults = true;
      isAnalyzing = false;
    } else if (form?.data?.error) {
      isAnalyzing = false;
    }
  });

  // Form submit handler for enhanced form
  function handleSubmit({ form, data, action, cancel }: any) {
    isAnalyzing = true;
    showResults = false;
    return async ({ result, update }: any) => {
      await update();
    };
  }

  function resetAnalysis() {
    websiteUrl = '';
    showResults = false;
    form = null;
  }

  function setExampleUrl(url: string) {
    websiteUrl = url;
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.requestSubmit();
      }
    }, 100);
  }

  function getScoreColor(score: number) {
    if (score >= 9) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 8) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 7) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 6) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  }

  function getScoreEmoji(score: number) {
    if (score >= 9) return '🎉 Excellent';
    if (score >= 8) return '👍 Very Good';
    if (score >= 7) return '👌 Good';
    if (score >= 6) return '🤔 Okay';
    return '💪 Needs Work';
  }

  let scoreColor = $state()
  let scoreEmoji = $state()

  $effect(() => {
    scoreColor = getScoreColor(feedbackData.score);
    scoreEmoji = getScoreEmoji(feedbackData.score);
  })

</script>

<div class="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90 py-8">
  <div class="container mx-auto px-4 max-w-3xl">
    <!-- Header -->
    <div class="mb-8 md:mb-12">
      <a href="/labs" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft class="w-4 h-4" />
        Back to RyderTech Labs
      </a>
      
      <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
            <Globe class="w-8 h-8 text-primary" />
            Website Quick Feedback
          </h1>
          <p class="text-muted-foreground text-lg">
            Get instant AI feedback on your website's design and messaging.
          </p>
        </div>
        <div class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
          <Sparkles class="w-3 h-3" />
          Powered by AI
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="space-y-8">
      {#if !showResults}
        <!-- Input Card -->
        <Card class="border-muted/30 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Get AI Feedback</CardTitle>
            <CardDescription>
              Enter your website URL for a quick review of design and messaging.
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <!-- Form with enhanced submission -->
            <form 
              method="POST" 
              action="?/rateWebsite" 
              use:enhance={handleSubmit}
             
            >
              <div class="space-y-4">
                <div class="flex flex-col sm:flex-row gap-3">
                  <div class="flex-1">
                    <Input
                      type="url"
                      name="url"
                      placeholder="https://yourwebsite.com"
                      bind:value={websiteUrl}
                      class="h-12 text-lg"
                      required
                      disabled={isAnalyzing}
                    />
                  </div>
                  <Button 
                    type="submit"
                    size="lg"
                    disabled={!websiteUrl.trim() || isAnalyzing}
                    class="h-12 px-8 gap-2 min-w-[140px]"
                  >
                    {#if isAnalyzing}
                      <Loader2 class="w-5 h-5 animate-spin" />
                      Analyzing...
                    {:else}
                      <Sparkles class="w-5 h-5" />
                      Get Feedback
                    {/if}
                  </Button>
                </div>
                
                <!-- Error display -->
                {#if form?.data?.error}
                  <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p class="text-red-700">{form.data.error}</p>
                  </div>
                {/if}
              </div>
            </form>

            <!-- Example URLs -->
            <div class="pt-4 border-t border-muted/20">
              <p class="text-sm font-medium mb-3 text-muted-foreground">Try examples:</p>
              <div class="flex flex-wrap gap-2">
                {#each ['https://example.com', 'https://apple.com', 'https://stripe.com'] as exampleUrl}
                  <button 
                    type="button"
                    onclick={() => setExampleUrl(exampleUrl)}
                    class="text-xs px-3 py-1.5 rounded-lg border border-muted/30 hover:border-primary/30 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isAnalyzing}
                  >
                    {exampleUrl}
                  </button>
                {/each}
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- What We Check -->
        <Card class="border-muted/30 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>What We Review</CardTitle>
            <CardDescription>
              Our AI focuses on the essentials of good website design.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="flex items-start gap-3 p-3 rounded-lg border border-muted/20 hover:border-primary/20 transition-colors">
                <div class="p-2 rounded-lg bg-blue-500/10">
                  <Layout class="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p class="font-medium">Layout & Design</p>
                  <p class="text-sm text-muted-foreground">Visual appeal and structure</p>
                </div>
              </div>
              
              <div class="flex items-start gap-3 p-3 rounded-lg border border-muted/20 hover:border-primary/20 transition-colors">
                <div class="p-2 rounded-lg bg-purple-500/10">
                  <Type class="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p class="font-medium">Messaging</p>
                  <p class="text-sm text-muted-foreground">Clarity of communication</p>
                </div>
              </div>
              
              <div class="flex items-start gap-3 p-3 rounded-lg border border-muted/20 hover:border-primary/20 transition-colors">
                <div class="p-2 rounded-lg bg-emerald-500/10">
                  <Palette class="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p class="font-medium">Visual Appeal</p>
                  <p class="text-sm text-muted-foreground">Color, typography, images</p>
                </div>
              </div>
              
              <div class="flex items-start gap-3 p-3 rounded-lg border border-muted/20 hover:border-primary/20 transition-colors">
                <div class="p-2 rounded-lg bg-amber-500/10">
                  <MessageSquare class="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p class="font-medium">User Experience</p>
                  <p class="text-sm text-muted-foreground">Ease of use & navigation</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      {:else}
        <!-- Results Card -->
        <Card class="border-muted/30 bg-card/50 backdrop-blur-sm">
          <CardContent class="p-6 md:p-8">
            <!-- Results Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <Globe class="w-5 h-5 text-muted-foreground" />
                  <span class="text-sm text-muted-foreground truncate">{feedbackData.testedUrl}</span>
                </div>
                <h2 class="text-2xl font-bold">AI Feedback</h2>
                <p class="text-muted-foreground text-sm">
                  Reviewed on {new Date(feedbackData.analysisDate).toLocaleDateString()}
                </p>
              </div>
              
              <Button variant="outline" size="sm" onclick={resetAnalysis} class="gap-2">
                <Sparkles class="w-4 h-4" />
                New Analysis
              </Button>
            </div>

            <!-- Overall Score -->
            <div class="text-center mb-8">
              <div class="inline-flex flex-col items-center">
                <div class={`mb-2 text-sm font-medium px-3 py-1 rounded-full border ${scoreColor}`}>
                  {scoreEmoji}
                </div>
                
                <div class="flex items-baseline justify-center gap-2">
                  <span class="text-6xl md:text-7xl font-bold">{feedbackData.score.toFixed(1)}</span>
                  <span class="text-2xl text-muted-foreground">/10</span>
                </div>
                
                <div class="flex items-center justify-center gap-1 mt-2">
                  {#each Array(10) as _, i}
                    <div class="w-6 h-1.5 rounded-full {i < Math.round(feedbackData.score) ? 'bg-primary' : 'bg-muted/30'}"></div>
                  {/each}
                </div>
              </div>
            </div>

            <!-- AI Feedback -->
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare class="w-5 h-5 text-primary" />
                  AI Feedback
                </h3>
                <div class="prose prose-sm max-w-none">
                  <p class="text-muted-foreground leading-relaxed">
                    {feedbackData.feedback || 'No feedback available.'}
                  </p>
                </div>
              </div>

              <!-- Strengths -->
              {#if feedbackData.strengths && feedbackData.strengths.length > 0}
                <div>
                  <h4 class="text-sm font-semibold mb-3 flex items-center gap-2">
                    <ThumbsUp class="w-4 h-4 text-emerald-500" />
                    What's Working Well
                  </h4>
                  <div class="space-y-2">
                    {#each feedbackData.strengths as strength}
                      <div class="flex items-start gap-2 text-sm">
                        <div class="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></div>
                        <span class="text-muted-foreground">{strength}</span>
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}

              <!-- Improvements -->
              {#if feedbackData.improvements && feedbackData.improvements.length > 0}
                <div>
                  <h4 class="text-sm font-semibold mb-3 flex items-center gap-2">
                    <AlertCircle class="w-4 h-4 text-amber-500" />
                    Areas to Consider
                  </h4>
                  <div class="space-y-2">
                    {#each feedbackData.improvements as improvement}
                      <div class="flex items-start gap-2 text-sm">
                        <div class="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></div>
                        <span class="text-muted-foreground">{improvement}</span>
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>

            <!-- CTA -->
            <div class="mt-8 pt-6 border-t border-muted/20">
              <div class="text-center space-y-4">
                <p class="text-sm text-muted-foreground">
                  Need help implementing these suggestions?
                </p>
                <div class="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" class="gap-2">
                    <Globe class="w-5 h-5" />
                    Get Professional Help
                  </Button>
                  <Button variant="outline" size="lg" onclick={resetAnalysis} class="gap-2">
                    <Sparkles class="w-5 h-5" />
                    Analyze Another Website
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Tips Card -->
        <Card class="border-muted/30 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Tips for Great Websites</CardTitle>
            <CardDescription>
              Quick principles to improve your website's score.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span class="text-xs font-medium text-primary">1</span>
                </div>
                <div>
                  <p class="font-medium">Clear Value Proposition</p>
                  <p class="text-sm text-muted-foreground">Visitors should understand what you offer in under 5 seconds.</p>
                </div>
              </div>
              
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span class="text-xs font-medium text-primary">2</span>
                </div>
                <div>
                  <p class="font-medium">Strong Visual Hierarchy</p>
                  <p class="text-sm text-muted-foreground">Guide visitors' eyes to what matters most.</p>
                </div>
              </div>
              
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span class="text-xs font-medium text-primary">3</span>
                </div>
                <div>
                  <p class="font-medium">Mobile-Friendly Design</p>
                  <p class="text-sm text-muted-foreground">Over 60% of web traffic comes from mobile devices.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      {/if}
    </div>

    <!-- Simple Disclaimer -->
    <div class="mt-8 pt-8 border-t border-muted/20">
      <p class="text-xs text-muted-foreground/60 text-center">
        This tool provides AI-powered suggestions for informational purposes. 
        © {new Date().getFullYear()} RyderTech Labs
      </p>
    </div>
  </div>
</div>

<style>
  .prose {
    color: hsl(var(--muted-foreground));
  }
  
  .prose p {
    margin-top: 0;
    margin-bottom: 0;
  }
</style>