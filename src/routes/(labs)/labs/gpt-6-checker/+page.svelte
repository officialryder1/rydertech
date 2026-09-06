<script lang="ts">
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import SEOMeta from '$lib/components/SEOMeta.svelte';
  import { supabase } from '$lib/supabaseClient';
  import { env } from '$env/dynamic/public';
  import emailjs from '@emailjs/browser';
  import {
    computeGpt6Readiness,
    type Gpt6Input
  } from '$lib/gpt6Checker';
  import { reportFromGpt6, buildShareUrl } from '$lib/shareReport';
  import { scoreLead } from '$lib/leadScore';
  import { goto } from '$app/navigation';
  import {
    Bot, Brain, BarChart3, CheckCircle, Clock, TrendingUp, ArrowLeft,
    PartyPopper, Send, Globe, Database, Shield, Zap, Cloud,
    Code2, Users, Target
  } from '@lucide/svelte';

  const PRESET: Gpt6Input = {
    companySize: 10,
    technicalMaturity: 2,
    currentAiUsage: 'none',
    workType: 'operational',
    dataReadiness: 'none',
    aiBudgetUsd: 1000,
    urgency: 'exploring'
  };

  let businessName = $state('');
  let email = $state('');
  let companySize = $state(PRESET.companySize);
  let technicalMaturity = $state(PRESET.technicalMaturity);
  let currentAiUsage = $state<Preset['currentAiUsage']>(PRESET.currentAiUsage);
  let workType = $state<Preset['workType']>(PRESET.workType);
  let dataReadiness = $state<Preset['dataReadiness']>(PRESET.dataReadiness);
  let aiBudgetUsd = $state(PRESET.aiBudgetUsd);
  let urgency = $state<Preset['urgency']>(PRESET.urgency);

  let isSubmitting = $state(false);
  let unlocked = $state(false);
  let error = $state<string | null>(null);

  interface Preset {
    currentAiUsage: 'none' | 'chatgpt' | 'api' | 'enterprise';
    workType: 'creative' | 'analytical' | 'operational' | 'customer-facing' | 'research';
    dataReadiness: 'none' | 'some' | 'centralized' | 'ml-ready';
    urgency: 'exploring' | 'testing' | 'urgent';
  }

  const input = $derived<Gpt6Input>({
    companySize,
    technicalMaturity,
    currentAiUsage,
    workType,
    dataReadiness,
    aiBudgetUsd,
    urgency
  });

  const result = $derived(computeGpt6Readiness(input));

  function validEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function summaryText() {
    return [
      `Business: ${businessName || '(not named)'}`,
      `GPT-6 readiness score: ${result.score}/100 (${result.levelLabel})`,
      `Efficiency gain: ${result.efficiencyGain}`,
      `Cost reduction: ${result.costReduction}`,
      `Adoption timeline: ${result.adoptionTimeline}`,
      '',
      'Risks:',
      ...result.risks.map(r => `- ${r}`),
      '',
      'Next steps:',
      ...result.nextSteps.map(s => `- ${s}`)
    ].join('\n');
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
      unlocked = true; // never block on a delivery failure
      try {
        localStorage.setItem('rydertech_gpt6_email', email);
        localStorage.setItem('rydertech_lead_captured', '1');
      } catch {}

      const lead = scoreLead({
        tool: 'gpt6-checker',
        impactValue: result.score,
        revenueAtRisk: 0,
        healthScore: result.score
      });

      const templateParams = {
        from_name: businessName || 'GPT-6 Readiness lead',
        from_email: email,
        company: businessName || '',
        budget: `$${aiBudgetUsd}`,
        timeline: `${result.levelLabel} (${result.score}/100)`,
        message: `New GPT-6 Readiness Audit (source: /labs/gpt-6-checker). Lead score: ${lead.points}/100 (${lead.tier}).\n\n${summaryText()}`,
        lead_type: 'gpt6_checker',
        lead_score: lead.points,
        lead_tier: lead.tier,
        tool: 'GPT-6 Readiness Checker'
      };

      // Fire-and-forget EmailJS + Supabase — never block the prospect
      const serviceId = env.PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = env.PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = env.PUBLIC_EMAILJS_PUBLIC_KEY;

      if (serviceId && templateId && publicKey) {
        await emailjs.send(serviceId, templateId, templateParams, { publicKey });
      } else {
        console.warn('EmailJS not configured — GPT-6 lead not emailed:', email);
      }

      try {
        await supabase.from('newsletter_subscriptions').insert([{
          email,
          source: 'lead_magnet_gpt6',
          company: businessName || '',
          lead_score: lead.points,
          lead_tier: lead.tier,
          lead_type: 'gpt6_checker'
        }]).select();
      } catch {
        console.info('GPT-6 lead backup skipped (DB unavailable):', email);
      }
    } catch (err) {
      console.warn('GPT-6 lead email failed:', err);
    } finally {
      isSubmitting = false;
    }
  }

  function getReport() {
    const payload = reportFromGpt6(result, businessName);
    goto(buildShareUrl(payload));
  }

  const scoreColor = result.score >= 80 ? 'text-green-600' :
    result.score >= 60 ? 'text-amber-600' :
    result.score >= 35 ? 'text-orange-600' : 'text-red-600';
</script>

<svelte:head>
  <title>GPT-6 Readiness Checker — Is Your Business Ready for AI Agents? | RyderTech Labs</title>
  <meta name="description" content="GPT-6 Astra can operate your computer, write production code, and run QA checks autonomously. Score your business's readiness for GPT-6 AI agents in 60 seconds. Free audit." />
  <link rel="canonical" href="https://rydertech.ng/labs/gpt-6-checker" />
</svelte:head>

<SEOMeta data={{
  title: 'GPT-6 Readiness Checker — Is Your Business Ready for AI Agents? | RyderTech Labs',
  description: 'GPT-6 Astra can operate your computer, write production code, and run QA checks autonomously. Score your business readiness for GPT-6 AI agents in 60 seconds. Free audit.',
  canonical: 'https://rydertech.ng/labs/gpt-6-checker',
  image: 'https://rydertech.ng/og-image.jpg'
}} />

<div class="min-h-screen bg-background">
  <div class="container mx-auto max-w-6xl px-4 py-10">
    <a
      href="/labs"
      class="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
    >
      <ArrowLeft class="h-4 w-4" />
      Back to Labs
    </a>

    <header class="mb-10 max-w-3xl">
      <Badge variant="secondary" class="mb-3">AI Readiness Audit</Badge>
      <h1 class="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
        Is your business ready for GPT-6 AI agents?
      </h1>
      <p class="mt-4 text-lg text-muted-foreground">
        GPT-6 Astra can operate computers, write production code, and run QA checks without human intervention.
        Score your readiness in 60 seconds — no signup required.
      </p>
    </header>

    <div class="grid gap-8 lg:grid-cols-[1fr_400px]">
      <!-- INPUTS -->
      <section class="space-y-6">
        <Card>
          <CardHeader class="pb-4">
            <CardTitle class="flex items-center gap-2 text-base">
              <Bot class="h-4 w-4 text-primary" />
              Your business profile
            </CardTitle>
            <CardDescription>Answer these 7 questions about your team and goals.</CardDescription>
          </CardHeader>
          <CardContent class="grid gap-5">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-foreground">Business name</label>
              <input
                type="text"
                bind:value={businessName}
                placeholder="e.g. RyderTech"
                class="w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-foreground">Company size</label>
              <input
                type="range"
                min="1"
                max="100"
                bind:value={companySize}
                class="w-full"
              />
              <div class="text-center text-sm text-muted-foreground">{companySize} people</div>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-foreground">
                Technical maturity ({technicalMaturity}/5)
              </label>
              <input
                type="range"
                min="1"
                max="5"
                bind:value={technicalMaturity}
                class="w-full"
              />
              <div class="text-center text-xs text-muted-foreground">
                1 = non-technical team, 5 = ML engineers
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-foreground">Current AI usage</label>
              <select
                bind:value={currentAiUsage}
                class="w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="none">None — we haven't adopted AI</option>
                <option value="chatgpt">ChatGPT / Copilot for some tasks</option>
                <option value="api">We use AI APIs in products</option>
                <option value="enterprise">Enterprise AI platform in place</option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-foreground">Primary work type</label>
              <select
                bind:value={workType}
                class="w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="creative">Creative / content</option>
                <option value="analytical">Data analysis / reporting</option>
                <option value="operational">Operations / admin</option>
                <option value="customer-facing">Customer service</option>
                <option value="research">Research & development</option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-foreground">Data readiness</label>
              <select
                bind:value={dataReadiness}
                class="w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="none">No centralized data</option>
                <option value="some">Some data in spreadsheets/APIs</option>
                <option value="centralized">Centralized database</option>
                <option value="ml-ready">ML-ready data pipeline</option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-foreground">AI tool budget this year (USD)</label>
              <input
                type="number"
                min="0"
                step="1000"
                bind:value={aiBudgetUsd}
                class="w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-foreground">How urgent is this?</label>
              <select
                bind:value={urgency}
                class="w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="exploring">Exploring / learning</option>
                <option value="testing">Actively testing</option>
                <option value="urgent">Need results fast</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </section>

      <!-- RESULTS -->
      <aside class="space-y-6 lg:sticky lg:top-8 lg:self-start">
        <Card>
          <CardHeader class="pb-3">
            <CardDescription class="flex items-center gap-1.5">
              <BarChart3 class="h-3.5 w-3.5" />
              GPT-6 readiness score
            </CardDescription>
            <div class="flex items-end gap-2">
              <p class="text-5xl font-bold {scoreColor}">{result.score}/100</p>
              <span class="mb-1 text-lg text-muted-foreground">/ 100</span>
            </div>
            <p class="text-sm text-muted-foreground">
              Level: <span class="font-medium text-foreground">{result.levelLabel}</span>
            </p>
          </CardHeader>
          <CardContent>
            <div class="space-y-3 border-t pt-4 text-sm">
              <div class="flex justify-between">
                <dt class="text-muted-foreground">Efficiency gain</dt>
                <dd class="font-medium">{result.efficiencyGain}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-muted-foreground">Cost reduction</dt>
                <dd class="font-medium">{result.costReduction}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-muted-foreground">Timeline</dt>
                <dd class="font-medium">{result.adoptionTimeline}</dd>
              </div>
            </div>

            <div class="mt-4 rounded-lg border border-border/30 bg-primary/5 p-3 text-sm">
              <p class="text-foreground">{result.verdict}</p>
            </div>

            {#if result.risks.length}
              <div class="mt-4 space-y-2">
                <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Risks to watch
                </p>
                {#each result.risks as risk}
                  <div class="flex gap-2 text-sm">
                    <span class="mt-0.5 text-destructive">⚠</span>
                    <span class="text-muted-foreground">{risk}</span>
                  </div>
                {/each}
              </div>
            {/if}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="text-base">Recommended next step</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3 text-sm">
            {#each result.nextSteps as step}
              <div class="flex gap-2">
                <CheckCircle class="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                <span class="text-muted-foreground">{step}</span>
              </div>
            {/each}
            <Button href={result.recommendedServiceLink} class="mt-4 w-full">
              {result.recommendedService}
            </Button>
          </CardContent>
        </Card>

        <!-- Lead capture -->
        <Card>
          <CardContent class="pt-6">
            {#if !unlocked}
              <h3 class="text-lg font-semibold">Get your GPT-6 readiness checklist</h3>
              <p class="mt-1.5 text-sm text-muted-foreground">
                We'll send you a PDF checklist with the exact steps to prepare for GPT-6 AI agents.
              </p>
              <form onsubmit={handleSubmit} class="mt-4 space-y-3">
                <input
                  type="text"
                  bind:value={businessName}
                  placeholder="Company name"
                  class="w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="email"
                  bind:value={email}
                  placeholder="you@business.com"
                  required
                  class="w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {#if error}
                  <p class="text-xs text-destructive">{error}</p>
                {/if}
                <Button type="submit" disabled={isSubmitting} class="w-full">
                  {isSubmitting ? 'Sending…' : 'Send me the checklist'}
                </Button>
              </form>
            {:else}
              <h3 class="flex items-center gap-2 text-lg font-semibold text-primary">
                <PartyPopper class="h-5 w-5" />
                Your GPT-6 checklist is on the way
              </h3>
              <p class="mt-2 text-sm text-muted-foreground">
                Check your inbox at {email}. We'll also follow up with a no-pressure strategy call if you'd like.
              </p>
              <Button variant="outline" class="mt-3 w-full gap-2" onclick={getReport}>
                <TrendingUp class="h-4 w-4" />
                Get shareable audit report
              </Button>
              <Button href="/contact?tool=gpt-6-checker" class="mt-2 w-full">
                Book a GPT-6 strategy call
              </Button>
            {/if}
          </CardContent>
        </Card>
      </aside>
    </div>
  </div>
</div>
