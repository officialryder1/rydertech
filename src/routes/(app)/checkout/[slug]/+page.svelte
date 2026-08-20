<script lang="ts">
  import { ShoppingCart, Loader2 } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import { formatNgn } from '$lib/courses';
  import { env } from '$env/dynamic/public';

  let { data }: { data: { course: { slug: string; title: string; priceNgn: number; outcome: string }; email: string | null } } = $props();

  let loading = $state(false);
  let errorMsg = $state<string | null>(null);

  function pay() {
    errorMsg = null;
    if (!env.PUBLIC_PAYSTACK_PUBLIC_KEY) {
      errorMsg = 'Paystack is not configured yet. Contact support.';
      return;
    }
    if (!data.email) {
      errorMsg = 'No email on your account. Contact support.';
      return;
    }
    loading = true;
    const reference = `ryd_${data.course.slug}_${Date.now()}`;
    fetch('/api/paystack/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email, courseSlug: data.course.slug, reference })
    })
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (!ok || !j.authorization_url) {
          loading = false;
          errorMsg = j.error ?? 'Could not start payment. Try again.';
          return;
        }
        // Hosted redirect — immune to popup blockers, surfaces real errors.
        window.location.href = j.authorization_url;
      })
      .catch(() => {
        loading = false;
        errorMsg = 'Network error starting payment. Check your connection.';
      });
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
      <p class="text-xs text-center text-gray-500">Powered by Paystack · funds to a Nigerian bank account</p>
    </div>
  </div>
</div>
