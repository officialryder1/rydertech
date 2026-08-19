<script lang="ts">
  import { Mail, CheckCircle, ArrowRight } from '@lucide/svelte';
  import { supabase } from '$lib/supabaseClient';
  import { env } from '$env/dynamic/public';
  import emailjs from '@emailjs/browser';

  // Course-interest lead capture. Reuses the proven EmailJS path (same service
  // + template as the contact form / lead magnet). Always reveals the CTA so a
  // prospect is never blocked, and best-effort backs up to Supabase.
  let { courseTitle = 'RyderTech Courses', ctaLabel = 'Get Early-Access Pricing' } = $props();

  let email = $state('');
  let name = $state('');
  let isSubmitting = $state(false);
  let submitted = $state(false);
  let error = $state<string | null>(null);

  function validEmail(v: string) {
    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v);
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
      // Reveal success state immediately — never block the prospect.
      submitted = true;
      try {
        localStorage.setItem('rydertech_course_lead', email);
      } catch {}

      const serviceId = env.PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = env.PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = env.PUBLIC_EMAILJS_PUBLIC_KEY;

      if (serviceId && templateId && publicKey) {
        await emailjs.send(
          serviceId,
          templateId,
          {
            from_name: name || 'Course Prospect',
            from_email: email,
            company: '',
            budget: '',
            timeline: '',
            message: `New course-interest lead: ${courseTitle} (source: /courses).`,
            lead_type: 'course_interest'
          },
          { publicKey }
        );
      } else {
        console.warn('EmailJS not configured — course lead not emailed:', email);
      }

      // Best-effort backup (non-blocking if DB is off).
      try {
        await supabase
          .from('newsletter_subscriptions')
          .insert([{ email, source: 'course_interest', course: courseTitle, subscribed_at: new Date().toISOString() }])
          .select();
      } catch {
        console.info('Course lead backup skipped (DB unavailable):', email);
      }
    } catch (err) {
      console.warn('Course lead email failed:', err);
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="rounded-2xl border border-primary/20 bg-linear-to-br from-blue-50 to-white p-6 shadow-sm">
  <div class="flex items-center gap-3 mb-3">
    <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
      <Mail class="w-5 h-5 text-primary" />
    </div>
    <h3 class="text-lg font-bold text-gray-900">{ctaLabel}</h3>
  </div>
  <p class="text-sm text-muted-foreground mb-4">
    Join the waitlist for <span class="font-semibold text-gray-900">{courseTitle}</span>. We'll send enrollment + early-bird pricing to your inbox.
  </p>

  {#if !submitted}
    <form onsubmit={handleSubmit} class="space-y-3">
      <input
        type="text"
        bind:value={name}
        placeholder="Your name (optional)"
        disabled={isSubmitting}
        class="w-full px-3 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 placeholder-gray-400"
      />
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
          Joining…
        {:else}
          {ctaLabel} <ArrowRight class="w-4 h-4" />
        {/if}
      </button>
      <p class="text-center text-xs text-gray-500">No spam. Unsubscribe anytime.</p>
    </form>
  {:else}
    <div class="space-y-3">
      <div class="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm">
        <CheckCircle class="w-4 h-4" />
        You're on the list — check your inbox.
      </div>
      <a
        href="/courses"
        class="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white font-semibold rounded-xl hover:opacity-95 transition"
      >
        Browse All Courses <ArrowRight class="w-4 h-4" />
      </a>
    </div>
  {/if}
</div>
