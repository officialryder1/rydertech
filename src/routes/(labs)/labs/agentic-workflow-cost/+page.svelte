<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Badge } from '$lib/components/ui/badge';
  import SEOMeta from '$lib/components/SEOMeta.svelte';
  import { supabase } from '$lib/supabaseClient';
  import { env } from '$env/dynamic/public';
  import emailjs from '@emailjs/browser';
  import {
    Bot,
    TrendingDown,
    Plus,
    X,
    ArrowLeft,
    CheckCircle2,
    AlertTriangle,
    Gauge,
    MessageSquare,
    Banknote,
    FileText,
  } from '@lucide/svelte';

  import {
    computeAgenticCost,
    formatMoney,
    recommendAgenticStack,
    type WorkflowTask,
    type EngineInput,
  } from '$lib/agenticWorkflowCost';
  import { reportFromAgenticCost, buildShareUrl } from '$lib/shareReport';
  import { scoreLead } from '$lib/leadScore';
  import { goto } from '$app/navigation';

  // Defaults model a realistic Lagos/SME using WhatsApp + M-Pesa manually.
  // Calibrated to yield a ~8-12 month payback to argue for the service.
  const PRESETS: Omit<WorkflowTask, 'id'>[] = [
    { label: 'WhatsApp order intake', people: 2, minutesEach: 30, frequency: 'daily', errorRatePct: 12, automatablePct: 85 },
    { label: 'M-Pesa reconciliation', people: 1, minutesEach: 90, frequency: 'daily', errorRatePct: 15, automatablePct: 80 },
    { label: 'Invoice chasing', people: 1, minutesEach: 45, frequency: 'weekly', errorRatePct: 8, automatablePct: 85 },
  ];

  let currency = $state<'NGN' | 'USD'>('NGN');
  let hourlyCost = $state(6500);
  let buildCost = $state(2_500_000);
  let monthlyRunCost = $state(50_000);
  let tasks = $state<WorkflowTask[]>(PRESETS.map((p, i) => ({ ...p, id: String(i + 1) })));

  let email = $state('');
  let company = $state('');
  let isSubmitting = $state(false);
  let unlocked = $state(false);
  let error = $state<string | null>(null);

  const input = $derived<EngineInput>({
    hourlyCost,
    tasks,
    buildCost,
    monthlyRunCost,
    currency,
  });

  const result = $derived(computeAgenticCost(input));
  const stack = $derived(recommendAgenticStack(result.tasks));
  const worthIt = $derived(result.paybackMonths !== null && result.paybackMonths <= 18);
  const money = (n: number) => formatMoney(n, currency);

  function getReport() {
    const payload = reportFromAgenticCost(result, currency);
    goto(buildShareUrl(payload));
  }

  function validEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function addTask() {
    tasks = [
      ...tasks,
      {
        id: crypto.randomUUID(),
        label: 'New manual task',
        people: 1,
        minutesEach: 30,
        frequency: 'weekly',
        errorRatePct: 10,
        automatablePct: 70,
      },
    ];
  }

  function removeTask(id: string) {
    tasks = tasks.filter((t) => t.id !== id);
  }

  function switchCurrency(next: 'NGN' | 'USD') {
    if (next === currency) return;
    currency = next;
    if (next === 'USD') {
      hourlyCost = 45;
      buildCost = 24000;
      monthlyRunCost = 400;
    } else {
      hourlyCost = 6500;
      buildCost = 2_500_000;
      monthlyRunCost = 50_000;
    }
  }

  function summaryText() {
    const lines = result.tasks.map(
      (t) => `- ${t.label}: ${t.totalHours}h/yr, ${money(t.annualCost)}/yr (recoverable ${money(t.recoverableCost)})`
    );
    return [
      `Annual cost of manual coordination: ${money(result.totalAnnualCost)}`,
      `Recoverable by AI agents: ${money(result.recoverableAnnualCost)}`,
      `Net annual saving: ${money(result.netAnnualSaving)}`,
      `Staff days freed per year: ${result.daysFreedPerYear}`,
      `Payback: ${result.paybackMonths === null ? 'never at this budget' : result.paybackMonths + ' months'}`,
      `First-year ROI: ${result.firstYearRoiPct}%`,
      `Severity: ${result.severity}`,
      '',
      'Tasks:',
      ...lines,
      '',
      'Recommended build:',
      ...stack.map((s) => `- ${s}`),
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
      // Always unlock — a delivery failure must never block the prospect.
      unlocked = true;
      try {
        localStorage.setItem('rydertech_agentic_cost_email', email);
        localStorage.setItem('rydertech_lead_captured', '1');
      } catch {}

      const lead = scoreLead({
        tool: 'agentic_cost',
        impactValue: result.recoverableAnnualCost,
        revenueAtRisk: result.recoverableAnnualCost,
        healthScore: 100 - Math.min(100, Math.round(result.recoverableAnnualHours / 20)),
      });
      const leadScoreVal = lead.points;
      const leadTier = lead.tier;

      const serviceId = env.PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = env.PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = env.PUBLIC_EMAILJS_PUBLIC_KEY;

      if (serviceId && templateId && publicKey) {
        await emailjs.send(
          serviceId,
          templateId,
          {
            from_name: company || 'Agentic Workflow Cost Calculator lead',
            from_email: email,
            company,
            budget: money(buildCost),
            timeline: result.paybackMonths === null ? 'n/a' : `${result.paybackMonths} month payback`,
            message: `New Agentic Workflow Cost Calculator result (source: /labs/agentic-workflow-cost). Lead score: ${leadScoreVal}/100 (${leadTier}).\n\n${summaryText()}`,
            lead_type: 'lead_magnet_agentic_cost',
            lead_score: leadScoreVal,
            lead_tier: leadTier,
          },
          { publicKey }
        );
      } else {
        console.warn('EmailJS not configured — agentic-cost lead not emailed:', email);
      }

      // Best-effort DB backup, non-blocking if Supabase is off.
      try {
        await supabase
          .from('newsletter_subscriptions')
          .insert([
            { email, source: 'lead_magnet_agentic_cost', subscribed_at: new Date().toISOString(), lead_score: leadScoreVal, lead_tier: leadTier },
          ])
          .select();
      } catch {
        console.info('Agentic-cost lead backup skipped (DB unavailable):', email);
      }
    } catch (err) {
      console.warn('Agentic-cost lead email failed:', err);
    } finally {
      isSubmitting = false;
    }
  }

  const severityCopy: Record<string, string> = {
    low: 'Lean operation. Automation here is optimisation, not rescue.',
    moderate: 'Meaningful drag. An AI agent can reclaim weeks of staff time every year.',
    high: 'Serious leakage. Your team is spending nearly full-time on glue work an agent could own.',
    critical: 'Critical. Manual coordination is now your largest hidden cost centre — and your biggest opportunity.',
  };
</script>

<SEOMeta
  data={{
    title: 'Agentic Workflow Cost Calculator — What Manual Coordination Costs Your Business | RyderTech',
    description:
      'Calculate the annual cost of WhatsApp orders, M-Pesa reconciliation, invoice chasing, and other manual tasks an AI agent could automate. Free, instant, no signup to calculate.',
    canonical: 'https://rydertech.ng/labs/agentic-workflow-cost',
  }}
/>

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
      <Badge variant="secondary" class="mb-3">AI Agent Automation Diagnostic</Badge>
      <h1 class="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
        Your manual coordination has a price tag.
      </h1>
      <p class="mt-4 text-lg text-muted-foreground">
        WhatsApp orders, M-Pesa reconciliation, invoice chasing — these glue tasks consume real staff time every day. Enter your numbers and see what an AI agent could reclaim for your business.
      </p>
    </header>

    <div class="grid gap-8 lg:grid-cols-[1fr_400px]">
      <!-- INPUTS -->
      <section class="space-y-6">
        <Card>
          <CardHeader class="pb-4">
            <div class="flex items-center justify-between">
              <CardTitle class="flex items-center gap-2 text-base">
                <Banknote class="h-4 w-4 text-primary" />
                Your numbers
              </CardTitle>
              <div class="flex gap-1 rounded-lg border p-1">
                {#each ['NGN', 'USD'] as c}
                  <button
                    type="button"
                    onclick={() => switchCurrency(c as 'NGN' | 'USD')}
                    class="rounded px-3 py-1 text-xs font-medium transition {currency === c
                      ? 'bg-primary text-white'
                      : 'text-muted-foreground hover:text-foreground'}"
                  >
                    {c}
                  </button>
                {/each}
              </div>
            </div>
          </CardHeader>
          <CardContent class="grid gap-4 sm:grid-cols-3">
            <label class="block">
              <span class="mb-1.5 block text-xs text-muted-foreground">Staff cost / hour</span>
              <Input type="number" min="0" bind:value={hourlyCost} />
            </label>
            <label class="block">
              <span class="mb-1.5 block text-xs text-muted-foreground">Automation build budget</span>
              <Input type="number" min="0" bind:value={buildCost} />
            </label>
            <label class="block">
              <span class="mb-1.5 block text-xs text-muted-foreground">Monthly run cost</span>
              <Input type="number" min="0" bind:value={monthlyRunCost} />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-4">
            <CardTitle class="flex items-center gap-2 text-base">
              <MessageSquare class="h-4 w-4 text-primary" />
              Manual coordination tasks
            </CardTitle>
            <CardDescription>Add every repeated task your team does by hand — WhatsApp orders, M-Pesa reconciliation, invoice chasing, etc.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            {#each tasks as task, i (task.id)}
              <div class="rounded-lg border bg-muted/30 p-4">
                <div class="mb-3 flex items-center gap-3">
                  <Input bind:value={task.label} placeholder="Task name" class="flex-1 font-medium" />
                  <span class="whitespace-nowrap text-xs text-muted-foreground">
                    {money(result.tasks[i]?.annualCost ?? 0)}/yr
                  </span>
                  <button
                    type="button"
                    onclick={() => removeTask(task.id)}
                    class="text-muted-foreground transition hover:text-destructive"
                    aria-label="Remove task"
                  >
                    <X class="h-4 w-4" />
                  </button>
                </div>

                <div class="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  <label class="block">
                    <span class="mb-1 block text-[10px] uppercase text-muted-foreground">People</span>
                    <Input type="number" min="0" bind:value={task.people} class="h-8 text-sm" />
                  </label>
                  <label class="block">
                    <span class="mb-1 block text-[10px] uppercase text-muted-foreground">Mins each</span>
                    <Input type="number" min="0" bind:value={task.minutesEach} class="h-8 text-sm" />
                  </label>
                  <label class="block">
                    <span class="mb-1 block text-[10px] uppercase text-muted-foreground">Frequency</span>
                    <select
                      bind:value={task.frequency}
                      class="border-input h-8 w-full rounded-md border bg-transparent px-2 text-sm outline-none focus-visible:border-ring"
                    >
                      {#each ['daily', 'weekly', 'monthly'] as f}
                        <option value={f}>{f}</option>
                      {/each}
                    </select>
                  </label>
                  <label class="block">
                    <span class="mb-1 block text-[10px] uppercase text-muted-foreground">Rework %</span>
                    <Input type="number" min="0" max="100" bind:value={task.errorRatePct} class="h-8 text-sm" />
                  </label>
                  <label class="block">
                    <span class="mb-1 block text-[10px] uppercase text-muted-foreground">Automatable %</span>
                    <Input type="number" min="0" max="100" bind:value={task.automatablePct} class="h-8 text-sm" />
                  </label>
                </div>
              </div>
            {/each}

            <Button variant="outline" class="w-full gap-2" onclick={addTask}>
              <Plus class="h-4 w-4" />
              Add another manual task
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-4">
            <CardTitle class="flex items-center gap-2 text-base">
              <Bot class="h-4 w-4 text-primary" />
              How AI agents replace this work
            </CardTitle>
            <CardDescription>Each recoverable task is one an autonomous agent could own end-to-end.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-3 text-sm text-muted-foreground">
            <div class="flex items-center gap-2">
              <span class="font-medium text-foreground">{result.totalAnnualHours.toLocaleString()}h</span>
              <span>consumed annually on manual glue tasks</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-medium text-primary">{money(result.recoverableAnnualCost)}</span>
              <span>of that is automatable by AI agents</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-medium text-destructive">{money(result.netAnnualSaving)}</span>
              <span>net annual saving after agent run costs</span>
            </div>
          </CardContent>
        </Card>
      </section>

      <!-- RESULTS -->
      <aside class="space-y-6 lg:sticky lg:top-8 lg:self-start">
        <Card>
          <CardHeader class="pb-3">
            <CardDescription class="flex items-center gap-1.5">
              <TrendingDown class="h-3.5 w-3.5" />
              Your annual cost of manual coordination
            </CardDescription>
            <p class="text-4xl font-bold {worthIt ? 'text-destructive' : 'text-foreground'}">
              {money(result.totalAnnualCost)}
            </p>
            <p class="text-sm text-muted-foreground">
              <span class="font-medium text-destructive">{result.daysFreedPerYear}</span> staff-days
              consumed every year on tasks an agent could own.
            </p>
          </CardHeader>
          <CardContent>
            <dl class="space-y-3 border-t pt-4 text-sm">
              <div class="flex justify-between">
                <dt class="text-muted-foreground">Hours consumed / year</dt>
                <dd class="font-medium">{result.totalAnnualHours.toLocaleString()}h</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-muted-foreground">Recoverable by agents / yr</dt>
                <dd class="font-medium text-primary">{money(result.recoverableAnnualCost)}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-muted-foreground">Net annual saving</dt>
                <dd class="font-medium {result.netAnnualSaving > 0 ? '' : 'text-destructive'}">
                  {money(result.netAnnualSaving)}
                </dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-muted-foreground">Payback period</dt>
                <dd class="font-medium">
                  {result.paybackMonths === null ? 'Never at this budget' : `${result.paybackMonths} months`}
                </dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-muted-foreground">First-year ROI</dt>
                <dd class="font-medium {result.firstYearRoiPct >= 0 ? 'text-primary' : 'text-destructive'}">
                  {result.firstYearRoiPct}%
                </dd>
              </div>
            </dl>

            <div
              class="mt-4 flex gap-2 rounded-lg border p-3 text-sm {worthIt
                ? 'border-primary/30 bg-primary/5'
                : 'border-destructive/30 bg-destructive/5'}"
            >
              {#if worthIt}
                <CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>This build pays for itself in under 18 months. Worth doing now.</span>
              {:else if result.paybackMonths === null}
                <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <span>At this budget the automation costs more than it saves. Reduce scope or run cost.</span>
              {:else}
                <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span>Payback is {result.paybackMonths} months — long. Trim scope or target higher-volume tasks first.</span>
              {/if}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            {#if !unlocked}
              <h3 class="text-lg font-semibold">Get the agentic blueprint</h3>
              <p class="mt-1.5 text-sm text-muted-foreground">
                We'll send the scoped build plan for the exact tasks you entered — which agents to deploy, which APIs to connect, and what each phase costs.
              </p>
              <form onsubmit={handleSubmit} class="mt-4 space-y-3">
                <Input type="text" bind:value={company} placeholder="Company" />
                <Input type="email" bind:value={email} placeholder="you@company.com" required />
                {#if error}
                  <p class="text-xs text-destructive">{error}</p>
                {/if}
                <Button type="submit" disabled={isSubmitting} class="w-full">
                  {isSubmitting ? 'Sending…' : 'Send me the blueprint'}
                </Button>
              </form>
            {:else}
              <h3 class="flex items-center gap-2 text-lg font-semibold text-primary">
                <Gauge class="h-5 w-5" />
                Your recommended build
              </h3>
              <ul class="mt-4 space-y-3">
                {#each stack as item}
                  <li class="flex gap-2.5 text-sm text-muted-foreground">
                    <span class="mt-0.5 text-primary">▸</span>
                    <span>{item}</span>
                  </li>
                {/each}
              </ul>
              <Button href="/contact?tool=agentic-workflow-cost" class="mt-5 w-full">Book a scoping call</Button>
              <Button variant="outline" class="mt-2 w-full gap-2" onclick={getReport}>
                <Gauge class="h-4 w-4" /> Get shareable audit report
              </Button>
              <a href="/services/ai" class="mt-2 block text-center text-sm text-muted-foreground hover:text-foreground">Or see how we build agentic automations →</a>
            {/if}
          </CardContent>
        </Card>
      </aside>
    </div>
  </div>
</div>
