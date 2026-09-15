<script lang="ts">
  import { ArrowRight, X } from '@lucide/svelte';
  import { fade } from 'svelte/transition';
  import { onMount } from 'svelte';

  interface ToolInfo {
    name: string;
    desc: string;
  }

  interface PostMetadata {
    labs_tool?: string;
  }

  let { postMetadata = null }: { postMetadata?: PostMetadata | null } = $props();

  let visible = $state(true);
  let hasMounted = $state(false);

  const tools: Record<string, ToolInfo> = {
    'cost-estimator': { name: 'Cost Estimator', desc: 'Get your website build quote' },
    'revleak': { name: 'RevLeak Auditor', desc: 'See how much your slow site costs you' },
    'website-rater': { name: 'AI Copy Analyzer', desc: 'Get AI feedback on your site' },
    'ops-drain': { name: 'Ops Drain Calculator', desc: 'Calculate your automation ROI' },
    'event-access-risk': { name: 'Event Risk Scanner', desc: 'Audit your event gate risk' },
    'gateway-calc': { name: 'Payment Gateway Calculator', desc: 'Compare Nigeria gateway fees' },
    'gpt-6-checker': { name: 'GPT-6 Readiness', desc: 'Score your AI agent readiness' },
    'headline-studio': { name: 'Headline Studio', desc: 'Generate click-worthy headlines' },
    'content-repurposer': { name: 'Content Repurposer', desc: 'Turn one post into 10 pieces of content' },
  };

  const toolSlug = $derived(postMetadata?.labs_tool ?? null);
  const tool = $derived(toolSlug ? tools[toolSlug as string] : null);

  onMount(() => {
    hasMounted = true;
    // Auto-hide after 30s if user isn't interacting
    const timer = setTimeout(() => {
      visible = false;
    }, 30000);

    return () => clearTimeout(timer);
  });

  function handleClose() {
    visible = false;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('labsBannerClosed', '1');
    }
  }
</script>

{#if hasMounted && visible && tool}
  {@const t = tool!}
  <div
    class="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-2xl w-[90vw] max-w-4xl z-[50]"
    transition:fade={{ duration: 300 }}
  >
    <div class="relative flex items-center justify-between gap-4 rounded-2xl border border-primary/30 bg-white/90 backdrop-blur-md shadow-2xl shadow-black/10 p-5">
      <div class="flex-1">
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
            🧪
          </div>
          <div>
            <p class="text-sm font-semibold text-foreground">
              Liked this article? Try the <span class="text-primary">{t.name}</span>
            </p>
            <p class="text-xs text-muted-foreground">
              {t.desc} — free, instant, no signup.
            </p>
          </div>
        </div>
      </div>

      <a
        href={`/labs/${toolSlug}`}
        class="flex-shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors"
      >
        Open Tool
        <ArrowRight class="w-3 h-3" />
      </a>

      <button
        onclick={handleClose}
        class="absolute top-3 right-3 w-6 h-6 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
        aria-label="Close banner"
      >
        <X class="w-3 h-3 text-muted-foreground" />
      </button>
    </div>
  </div>
{:else if hasMounted && visible && !tool}
  <div
    class="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-4xl z-[50]"
    transition:fade={{ duration: 300 }}
  >
    <div class="relative flex items-center justify-between gap-4 rounded-2xl border border-primary/30 bg-white/90 backdrop-blur-md shadow-2xl shadow-black/10 p-5">
      <div class="flex-1">
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
            🧪
          </div>
          <div>
            <p class="text-sm font-semibold text-foreground">
              Want more tools like this?
            </p>
            <p class="text-xs text-muted-foreground">
              Browse all 14 free AI-powered labs tools — no signup required.
            </p>
          </div>
        </div>
      </div>

      <a
        href="/labs"
        class="flex-shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors"
      >
        Explore Labs
        <ArrowRight class="w-3 h-3" />
      </a>

      <button
        onclick={handleClose}
        class="absolute top-3 right-3 w-6 h-6 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
        aria-label="Close banner"
      >
        <X class="w-3 h-3 text-muted-foreground" />
      </button>
    </div>
  </div>
{/if}
