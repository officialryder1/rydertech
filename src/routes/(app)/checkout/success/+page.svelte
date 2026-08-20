<script lang="ts">
  import { CheckCircle, Loader2, ArrowRight } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';

  let { data }: { data: { courseTitle: string; courseSlug: string; reference: string; paid: boolean } } = $props();
</script>

<svelte:head>
  <title>Payment Success | RyderTech</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="min-h-screen bg-background pt-32 pb-20 px-4">
  <div class="container mx-auto max-w-md text-center">
    <div class="rounded-2xl border bg-card p-8 shadow-sm space-y-5">
      {#if data.paid}
        <CheckCircle class="w-14 h-14 text-green-600 mx-auto" />
        <h1 class="text-2xl font-bold">You're enrolled!</h1>
        <p class="text-muted-foreground">
          Payment confirmed for <span class="font-semibold">{data.courseTitle}</span>.
        </p>
        <a href={`/learn/${data.courseSlug}`}>
          <Button class="w-full text-white text-lg">
            Start Learning <ArrowRight class="w-5 h-5 ml-2" />
          </Button>
        </a>
      {:else}
        <Loader2 class="w-14 h-14 text-primary mx-auto animate-spin" />
        <h1 class="text-2xl font-bold">Confirming payment…</h1>
        <p class="text-muted-foreground">
          We're verifying your payment for <span class="font-semibold">{data.courseTitle}</span>. This usually takes a few seconds.
        </p>
        <p class="text-xs text-gray-500">Reference: {data.reference}</p>
        <p class="text-sm text-muted-foreground">
          If you're not redirected shortly, <a class="underline" href={`/learn/${data.courseSlug}`}>click here to access your course</a>.
        </p>
      {/if}
    </div>
  </div>
</div>
