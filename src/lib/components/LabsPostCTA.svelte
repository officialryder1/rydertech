<script lang="ts">
  import { ArrowRight, Sparkles } from '@lucide/svelte';

  interface ToolInfo {
    name: string;
    description: string;
    color: string;
    icon: string;
  }

  // Tool metadata: slug -> { name, description, icon_color }
  const tools: Record<string, ToolInfo> = {
    'cost-estimator': {
      name: 'Website Cost Estimator',
      description: 'Get a tailored cost range for your web project in minutes — no signup required.',
      color: 'from-emerald-500/20 to-teal-500/20',
      icon: '💰',
    },
    'revleak': {
      name: 'RevLeak Auditor',
      description: 'Calculate exactly how much revenue your slow website is quietly losing each month.',
      color: 'from-blue-500/20 to-cyan-500/20',
      icon: '💧',
    },
    'website-rater': {
      name: 'AI Website Copy Analyzer',
      description: 'Paste your homepage URL and get AI-powered feedback on clarity, conversion, and SEO — in seconds.',
      color: 'from-violet-500/20 to-purple-500/20',
      icon: '🤖',
    },
    'ops-drain': {
      name: 'Ops Drain Calculator',
      description: 'See what your manual processes cost per year and how fast automation pays for itself.',
      color: 'from-amber-500/20 to-orange-500/20',
      icon: '⏳',
    },
    'event-access-risk': {
      name: 'Event Access Risk Scanner',
      description: 'Audit your event gate for clear-time bottlenecks, gatecrash exposure, and revenue at risk.',
      color: 'from-red-500/20 to-rose-500/20',
      icon: '🎫',
    },
    'gateway-calc': {
      name: 'Nigerian Payment Gateway Fee Calculator',
      description: 'Compare processing fees, settlement speeds, and transaction costs across Paystack, Monnify, Flutterwave, and Interswitch.',
      color: 'from-green-500/20 to-emerald-500/20',
      icon: '💳',
    },
    'gpt-6-checker': {
      name: 'GPT-6 Readiness Checker',
      description: 'Score how ready your business is for the next wave of AI agents that can operate computers, write code, and run QA autonomously.',
      color: 'from-indigo-500/20 to-blue-500/20',
      icon: '🧠',
    },
    'headline-studio': {
      name: 'Headline Studio',
      description: 'Generate 10 click-worthy headlines using proven formulas — for ads, emails, blog posts, and social.',
      color: 'from-pink-500/20 to-rose-500/20',
      icon: '📢',
    },
    'content-repurposer': {
      name: 'AI Content Repurposer',
      description: 'Turn one blog post or transcript into platform-native LinkedIn posts, Twitter threads, newsletter blurbs, and TikTok scripts.',
      color: 'from-cyan-500/20 to-blue-500/20',
      icon: '♻️',
    },
  };

  interface PostMetadata {
    labs_tool?: string;
  }

  let { postMetadata = null }: { postMetadata?: PostMetadata | null } = $props();

  // Try to get labs_tool from the post metadata
  let toolSlug = $derived(postMetadata?.labs_tool ?? null);
  let tool = $derived(toolSlug ? tools[toolSlug as string] : null);

  // If no tool mapped, don't render
  let show = $derived(!!tool);
</script>

{#if show}
  {@const t = tool!}
  <div class="mt-16 mb-12">
    <div class="rounded-3xl border-2 border-dashed border-primary/20 bg-primary/5 p-8 md:p-10">
      <div class="flex items-start gap-6">
        <div class="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br {t.color} flex items-center justify-center text-3xl">
          {t.icon}
        </div>
        <div class="flex-1">
          <div class="inline-flex items-center gap-2 bg-secondary/10 text-secondary font-semibold px-3 py-1 rounded-full text-xs mb-3">
            <Sparkles class="w-3 h-3" />
            Free AI Tool
          </div>
          <h3 class="text-2xl font-bold text-foreground mb-2">{t.name}</h3>
          <p class="text-muted-foreground mb-4 max-w-xl">
            {t.description}
          </p>
        </div>
      </div>
      <div class="mt-6 flex flex-col sm:flex-row gap-3">
        <a
          href={`/labs/${toolSlug}`}
          class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
        >
          Try {t.name} Free
          <ArrowRight class="w-4 h-4" />
        </a>
        <a
          href="/labs"
          class="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-muted-foreground hover:bg-muted rounded-xl transition-colors"
        >
          Browse All Labs Tools
        </a>
      </div>
    </div>
  </div>
{:else}
  <!-- Fallback: show a general labs CTA -->
  <div class="mt-16 mb-12">
    <div class="rounded-3xl border bg-card p-8 md:p-10 text-center">
      <div class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-3xl">
        🧪
      </div>
      <h3 class="text-2xl font-bold text-foreground mb-3">Free Tools That Actually Help</h3>
      <p class="text-muted-foreground mb-6 max-w-xl mx-auto">
        Every RyderTech Labs tool is free, instant, and built to solve a specific problem we see Nigerian businesses hit every day. No signup, no credit card.
      </p>
      <a
        href="/labs"
        class="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
      >
        Explore All Labs Tools
        <ArrowRight class="w-4 h-4" />
      </a>
    </div>
  </div>
{/if}
