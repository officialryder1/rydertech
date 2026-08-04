<script lang="ts">
  import { Download, Mail, CheckCircle, Gift, ArrowRight } from '@lucide/svelte';
  import { supabase } from '$lib/supabaseClient';

  // Gate the lead-magnet PDF behind an email capture.
  // Works without Supabase (DB may be off) — always reveals the download
  // locally and best-effort saves the lead if the DB is reachable.

  let { pdfUrl = '/website-cost-guide-nigeria.pdf' } = $props();

  let email = $state('');
  let isSubmitting = $state(false);
  let unlocked = $state(false);
  let error = $state<string | null>(null);

  function validEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = null;
    if (!validEmail(email)) {
      error = 'Please enter a valid email address.';
      return;
    }
    isSubmitting = true;
    try {
      // Best-effort lead capture (non-blocking if DB is off).
      try {
        await supabase
          .from('newsletter_subscriptions')
          .insert([{ email, source: 'lead_magnet_cost_guide', subscribed_at: new Date().toISOString() }])
          .select();
      } catch (dbErr) {
        // Ignore — the user still gets the PDF; we log locally only.
        console.info('Lead save skipped (DB unavailable):', email);
      }
      // Persist locally so we don't re-prompt.
      try {
        localStorage.setItem('rydertech_lead_magnet_email', email);
      } catch {}
      unlocked = true;
    } catch (err) {
      // Even on unexpected error, still unlock so the user isn't blocked.
      unlocked = true;
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="rounded-2xl border border-primary/20 bg-linear-to-br from-blue-50 to-white p-6 shadow-sm">
  <div class="flex items-center gap-3 mb-3">
    <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
      <Gift class="w-5 h-5 text-primary" />
    </div>
    <h3 class="text-lg font-bold text-gray-900">Free Download: Website Cost Guide 2026</h3>
  </div>
  <p class="text-sm text-muted-foreground mb-4">
    Get the complete pricing breakdown for Nigerian websites — typical ranges, payment gateways, hidden costs, and a pre-launch checklist. Enter your email to unlock the PDF.
  </p>

  {#if !unlocked}
    <form onsubmit={handleSubmit} class="space-y-3">
      <div class="relative">
        <Mail class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="email"
          bind:value={email}
          placeholder="you@business.com"
          required
          disabled={isSubmitting}
          class="w-full pl-9 pr-3 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 placeholder-gray-400"
        />
      </div>
      {#if error}
        <p class="text-sm text-red-600">{error}</p>
      {/if}
      <button
        type="submit"
        disabled={isSubmitting}
        class="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white font-semibold rounded-xl hover:opacity-95 transition disabled:opacity-50"
      >
        {#if isSubmitting}
          Unlocking…
        {:else}
          Get the Free Guide <ArrowRight class="w-4 h-4" />
        {/if}
      </button>
      <p class="text-center text-xs text-gray-500">No spam. Unsubscribe anytime.</p>
    </form>
  {:else}
    <div class="space-y-3">
      <div class="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm">
        <CheckCircle class="w-4 h-4" />
        Your guide is ready — download below.
      </div>
      <a
        href={pdfUrl}
        download
        class="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white font-semibold rounded-xl hover:opacity-95 transition"
      >
        <Download class="w-4 h-4" />
        Download PDF Guide
      </a>
      <p class="text-center text-xs text-gray-500">
        Want a custom quote? <a href="/contact" class="text-primary font-medium">Talk to RyderTech →</a>
      </p>
    </div>
  {/if}
</div>
