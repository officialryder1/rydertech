<script lang="ts">
  import { onMount } from 'svelte';
  import { ShoppingCart, Loader2, CheckCircle } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import { formatNgn } from '$lib/courses';
  import { env } from '$env/dynamic/public';

  let { data }: { data: { course: { slug: string; title: string; priceNgn: number; outcome: string }; email: string | null } } = $props();

  let loading = $state(false);
  let errorMsg = $state<string | null>(null);
  let done = $state(false);
  let paystackReady = $state(false);

  // Eagerly load the Paystack inline script on mount so openIframe() runs
  // synchronously inside the click gesture (popup blockers kill async opens).
  onMount(() => {
    if ((window as any).PaystackPop) {
      paystackReady = true;
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://js.paystack.co/static/js/inline.js';
    s.onload = () => (paystackReady = true);
    s.onerror = () => (errorMsg = 'Could not load Paystack. Check your connection and retry.');
    document.head.appendChild(s);
  });

  function pay() {
    errorMsg = null;
    if (!env.PUBLIC_PAYSTACK_PUBLIC_KEY) {
      errorMsg = 'Paystack is not configured yet. Contact support.';
      return;
    }
    const PaystackPop = (window as any).PaystackPop;
    if (!PaystackPop) {
      errorMsg = 'Paystack is still loading — please wait a moment and retry.';
      return;
    }
    loading = true;
    const handler = PaystackPop.setup({
      key: env.PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: data.email ?? '',
      amount: data.course.priceNgn * 100, // kobo
      currency: 'NGN',
      ref: `ryd_${data.course.slug}_${Date.now()}`,
      metadata: { course_slug: data.course.slug, email: data.email },
      label: `RyderTech — ${data.course.title}`,
      onClose: () => {
        loading = false;
      },
      onError: (err: any) => {
        loading = false;
        errorMsg = typeof err === 'string' ? err : (err?.message ?? 'Payment could not open. Try again.');
      },
      callback: (resp: any) => {
        loading = false;
        done = true;
        window.location.href = `/learn/${data.course.slug}?payref=${encodeURIComponent(resp.reference)}`;
      }
    });
    // Synchronous within the user click — avoids popup-blocker rejection.
    handler.openIframe();
  }
</script>

<svelte:head>
  <title>Checkout — {data.course.title} | RyderTech</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="min-h-screen bg-background pt-32 pb-20 px-4">
  <div class="container mx-auto max-w-md">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold mb-2">Checkout</h1>
      <p class="text-muted-foreground">Secure payment via Paystack</p>
    </div>

    <div class="rounded-2xl border bg-card p-8 shadow-sm space-y-6">
      <div>
        <p class="text-sm text-muted-foreground">Course</p>
        <p class="text-lg font-semibold">{data.course.title}</p>
        <p class="text-sm text-muted-foreground">{data.course.outcome}</p>
      </div>
      <div class="flex items-center justify-between border-t pt-4">
        <span class="text-muted-foreground">Total</span>
        <span class="text-2xl font-bold text-primary">{formatNgn(data.course.priceNgn)}</span>
      </div>

      <Button class="w-full text-white text-lg" onclick={pay} disabled={loading}>
        {#if loading}
          <Loader2 class="w-5 h-5 mr-2 animate-spin" /> Opening Paystack…
        {:else}
          <ShoppingCart class="w-5 h-5 mr-2" /> Pay {formatNgn(data.course.priceNgn)}
        {/if}
      </Button>

      {#if errorMsg}
        <p class="text-sm text-red-600">{errorMsg}</p>
      {/if}
      {#if done}
        <p class="text-sm text-green-600 flex items-center gap-2"><CheckCircle class="w-4 h-4" /> Payment successful — opening your course…</p>
      {/if}
      <p class="text-xs text-center text-gray-500">Powered by Paystack · funds to a Nigerian bank account</p>
    </div>
  </div>
</div>
