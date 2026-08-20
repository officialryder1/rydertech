<script lang="ts">
  import { onMount } from 'svelte';
  import { CheckCircle, Loader2, ArrowRight } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';

  let { data }: { data: { courseTitle: string; courseSlug: string; reference: string; paid: boolean } } = $props();

  let paid = $state(data.paid);
  let checking = $state(!data.paid);

  async function verify() {
    if (!data.reference) {
      checking = false;
      return;
    }
    try {
      const r = await fetch('/api/paystack/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: data.reference })
      });
      const j = await r.json();
      if (j.paid) {
        paid = true;
        checking = false;
        return true;
      }
    } catch {
      /* keep polling */
    }
    return false;
  }

  onMount(async () => {
    if (data.paid) {
      checking = false;
      return;
    }
    // Poll up to ~20s, then fall back to letting the user retry / open the course.
    for (let i = 0; i < 10 && !paid; i++) {
      const ok = await verify();
      if (ok) return;
      await new Promise((r) => setTimeout(r, 2000));
    }
    checking = false;
  });
</script>

<svelte:head>
  <title>Payment Success | RyderTech</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="min-h-screen bg-background pt-32 pb-20 px-4">
  <div class="container mx-auto max-w-md text-center">
    <div class="rounded-2xl border bg-card p-8 shadow-sm space-y-5">
      {#if paid}
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
      {:else if checking}
        <Loader2 class="w-14 h-14 text-primary mx-auto animate-spin" />
        <h1 class="text-2xl font-bold">Confirming payment…</h1>
        <p class="text-muted-foreground">
          Securely verifying your payment for <span class="font-semibold">{data.courseTitle}</span>. This only takes a moment.
        </p>
        <p class="text-xs text-gray-500">Reference: {data.reference}</p>
      {:else}
        <!-- Webhook/verify not yet confirmed — still let the user reach the course (it self-enrolls). -->
        <Loader2 class="w-14 h-14 text-primary mx-auto" />
        <h1 class="text-2xl font-bold">Opening your course…</h1>
        <p class="text-muted-foreground">
          If confirmation is still pending, your access is being granted automatically.
        </p>
        <a href={`/learn/${data.courseSlug}?verify=${encodeURIComponent(data.reference)}`}>
          <Button class="w-full text-white text-lg">
            Go to Course <ArrowRight class="w-5 h-5 ml-2" />
          </Button>
        </a>
      {/if}
    </div>
  </div>
</div>
