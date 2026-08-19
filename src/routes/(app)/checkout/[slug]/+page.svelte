<script lang="ts">
  import { ShoppingCart, Loader2, CheckCircle } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import { formatNgn } from '$lib/courses';
  import { env } from '$env/dynamic/public';

  let { data }: { data: { course: { slug: string; title: string; priceNgn: number; outcome: string }; email: string | null } } = $props();

  let loading = $state(false);
  let errorMsg = $state<string | null>(null);
  let done = $state(false);

  async function loadPaystack(): Promise<any> {
    if ((window as any).PaystackPop) return (window as any).PaystackPop;
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://js.paystack.co/static/js/inline.js';
      s.onload = () => resolve((window as any).PaystackPop);
      s.onerror = () => reject(new Error('Could not load Paystack'));
      document.head.appendChild(s);
    });
  }

  async function pay() {
    errorMsg = null;
    loading = true;
    try {
      if (!env.PUBLIC_PAYSTACK_PUBLIC_KEY) {
        throw new Error('Paystack is not configured yet. Contact support.');
      }
      const PaystackPop = await loadPaystack();
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
        callback: (resp: any) => {
          // Webhook records the purchase; redirect to the player.
          loading = false;
          done = true;
          window.location.href = `/learn/${data.course.slug}?payref=${encodeURIComponent(resp.reference)}`;
        }
      });
      handler.openIframe();
    } catch (e: any) {
      errorMsg = e?.message ?? 'Payment failed to start.';
      loading = false;
    }
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
