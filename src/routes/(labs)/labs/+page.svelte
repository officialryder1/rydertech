<!-- +page.svelte -->
<script lang="ts">
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { ArrowRight, Sparkles, Calculator, FileText, LayoutGrid, Brain, CheckCircle, Mail, Timer, ScanLine, Gauge, Zap, ArrowUpRight, Star } from "@lucide/svelte";
  import NewsLetterModel from "$lib/components/NewsLetterModel.svelte";
  import { fade, fly } from "svelte/transition";

  let showNewsletter = $state(false);

  function handleNewsletterClose() {
    showNewsletter = false;
    localStorage.setItem("rydertech_newsletter_closed", "true");
    setTimeout(() => {
      localStorage.removeItem("rydertech_newsletter_closed");
    }, 7 * 24 * 60 * 60 * 1000);
  }

  async function handleNewsletterSubscribe(email: string) {
    console.log("Subscribing email:", email);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    localStorage.setItem("rydertech_newsletter_subscribed", "true");
  }

  let cards = [
    {
      title: "Website Cost Estimator",
      description: "Get a rough estimate of what it would cost to build your website based on your idea.",
      icon: Calculator,
      href: "/labs/cost-estimator",
      action: "Estimate Cost",
      tag: "Planning",
      accent: "from-blue-500/20 to-cyan-500/20"
    },
    {
      title: "Website Copy Analyzer",
      description: "Analyze your homepage copy and get AI-powered feedback on clarity and conversion.",
      icon: FileText,
      href: "/labs/website-rater",
      action: "Analyze Copy",
      tag: "AI Review",
      accent: "from-violet-500/20 to-purple-500/20"
    },
    {
      title: "Ops Drain Calculator",
      description: "Calculate what your manual processes cost per year, and how fast automation pays for itself.",
      icon: Timer,
      href: "/labs/ops-drain",
      action: "Calculate My Drain",
      tag: "Automation",
      accent: "from-emerald-500/20 to-green-500/20"
    },
    {
      title: "Event Access Risk Scanner",
      description: "See how long your event gate backs up, how many guests slip in free, and what it costs — with a live QR demo.",
      icon: ScanLine,
      href: "/labs/event-access-risk",
      action: "Scan My Risk",
      tag: "Live Demo",
      accent: "from-amber-500/20 to-orange-500/20"
    },
    {
      title: "RevLeak Auditor",
      description: "Calculate how much revenue your slow website leaks every month from lost conversions.",
      icon: Gauge,
      href: "/labs/revleak",
      action: "Audit My Leak",
      tag: "Revenue",
      accent: "from-rose-500/20 to-pink-500/20"
    },
    {
      title: "Finance Tracker",
      description: "Track and analyze your personal or business finances with AI-powered insights.",
      icon: Brain,
      href: "https://flow-spense.pages.dev/",
      action: "Track Finances",
      tag: "External",
      accent: "from-indigo-500/20 to-blue-500/20"
    },
    {
      title: "MVP Feature Planner",
      description: "Prioritize features for your app or product MVP with AI-powered recommendations.",
      icon: LayoutGrid,
      href: "#",
      comingSoon: true,
      action: "Notify Me When Ready",
      tag: "Soon",
      accent: "from-slate-500/20 to-gray-500/20"
    }
  ];

  const stats = [
    { value: "50+", label: "Products shipped" },
    { value: "7", label: "Free AI tools" },
    { value: "0", label: "Signups required" },
    { value: "24/7", label: "Always available" }
  ];
</script>

<svelte:head>
  <title>RyderTech Labs — Free AI Tools for Founders</title>
  <meta
    name="description"
    content="Free AI-powered tools by RyderTech to help founders plan, validate, and build better digital products. Cost estimators, analyzers, and calculators."
  />
</svelte:head>

<NewsLetterModel show={showNewsletter} onClose={handleNewsletterClose} onSubscribe={handleNewsletterSubscribe} />

<div class="min-h-screen bg-background" transition:fade>
  <!-- Hero -->
  <section class="relative overflow-hidden">
    <!-- Animated gradient backdrop -->
    <div class="absolute inset-0 -z-10">
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_55%)]"></div>
      <div
        class="absolute -top-40 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-pulse"
      ></div>
      <div
        class="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl animate-pulse"
        style="animation-delay: 1.5s"
      ></div>
    </div>

    <div class="container mx-auto px-4 pt-20 pb-12 md:pt-28 md:pb-16">
      <div class="max-w-3xl mx-auto text-center space-y-6">
        <div
          in:fly={{ y: 12, duration: 500 }}
          class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
        >
          <Sparkles class="w-4 h-4 text-primary" />
          <span class="text-sm font-medium text-primary tracking-wide">EXPERIMENTAL LABS</span>
        </div>

        <h1 in:fly={{ y: 16, duration: 600 }} class="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
          RyderTech <span class="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">Labs</span>
        </h1>

        <p in:fly={{ y: 16, duration: 700 }} class="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto">
          Free AI tools to help founders plan, validate, and build better digital products.
        </p>

        <p in:fly={{ y: 16, duration: 800 }} class="text-muted-foreground/80 max-w-2xl mx-auto">
          Interactive tools built by our engineers using cutting-edge AI. Experiment, calculate, and validate — completely free. No signup required.
        </p>

        <div in:fly={{ y: 16, duration: 900 }} class="pt-2">
          <Button size="lg" class="gap-2 group shadow-lg shadow-primary/20" href="#tools">
            Explore Tools
            <ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>

      <!-- Stat strip -->
      <div
        in:fly={{ y: 20, duration: 900 }}
        class="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
      >
        {#each stats as s}
          <div class="text-center rounded-2xl border border-border/60 bg-card/60 backdrop-blur px-4 py-5">
            <div class="text-2xl md:text-3xl font-bold text-foreground">{s.value}</div>
            <div class="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Tools Grid -->
  <section class="container mx-auto px-4 py-12 md:py-16" id="tools">
    <div class="text-center mb-10">
      <h2 class="text-2xl md:text-3xl font-bold text-foreground">Tools you can use right now</h2>
      <p class="text-muted-foreground mt-2">Pick one and get instant, AI-powered answers.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each cards as card, i}
        <div in:fly={{ y: 18, duration: 500, delay: i * 60 }} class="h-full">
          <Card
            class="group relative h-full overflow-hidden border-border/60 bg-card/60 backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/40"
          >
            <!-- hover glow -->
            <div
              class="absolute -inset-px rounded-xl bg-gradient-to-br {card.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
            ></div>

            <CardHeader class="flex items-start gap-4 pb-3">
              <div
                class="shrink-0 w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/20"
              >
                <svelte:component this={card.icon} class="w-5 h-5 text-primary" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <CardTitle class="text-base font-semibold text-foreground leading-tight">{card.title}</CardTitle>
                </div>
                <span
                  class="inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                >
                  {card.tag}
                </span>
              </div>
            </CardHeader>

            <CardContent class="text-muted-foreground flex flex-col flex-1">
              <CardDescription class="flex-1">{card.description}</CardDescription>
              <Button
                variant={card.comingSoon ? "outline" : "default"}
                class="mt-4 w-full gap-1.5 group/btn"
                href={card.href}
                disabled={card.comingSoon}
              >
                {card.action}
                {#if !card.comingSoon}
                  <ArrowUpRight class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                {/if}
              </Button>
            </CardContent>
          </Card>
        </div>
      {/each}

      <!-- Coming Soon Card -->
      <div in:fly={{ y: 18, duration: 500, delay: cards.length * 60 }} class="h-full">
        <Card class="h-full border-dashed border-2 border-muted/30 bg-transparent flex flex-col justify-center">
          <CardHeader class="pb-3">
            <div class="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4">
              <Sparkles class="w-6 h-6 text-muted-foreground/50" />
            </div>
            <CardTitle class="text-xl text-muted-foreground/70">More Tools Coming</CardTitle>
            <CardDescription class="text-muted-foreground/60">
              We're constantly building new tools to help founders and product teams.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" class="w-full text-muted-foreground/60" disabled>Subscribe for Updates</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>

  <!-- Trust Section -->
  <section class="container mx-auto px-4 py-16 md:py-20">
    <div class="max-w-5xl mx-auto">
      <div class="grid md:grid-cols-5 gap-8 items-center">
        <div class="md:col-span-3 space-y-6">
          <div class="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <CheckCircle class="w-4 h-4 text-primary" />
            BUILT BY EXPERTS
          </div>

          <h2 class="text-3xl md:text-4xl font-bold text-foreground">Real Tools from Real Product Builders</h2>

          <p class="text-lg text-muted-foreground">
            These aren't just demos. Each tool is built by RyderTech engineers using the same
            technologies and best practices we apply to client projects.
          </p>

          <p class="text-muted-foreground/80">
            We've built 50+ digital products for startups and enterprises. These tools showcase our
            approach to problem-solving and technical excellence.
          </p>

          <div class="pt-2">
            <Button variant="outline" size="lg" class="gap-2 group" href="/contact">
              Need this built professionally?
              <ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>

        <div class="md:col-span-2">
          <div class="relative rounded-2xl border border-border/60 bg-card/60 backdrop-blur p-8 overflow-hidden">
            <div class="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl"></div>
            <div class="space-y-4 relative">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span class="font-medium text-foreground">Production-Ready Code</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                <span class="font-medium text-foreground">Real AI Integration</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-purple-500"></div>
                <span class="font-medium text-foreground">Scalable Architecture</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-amber-500"></div>
                <span class="font-medium text-foreground">Enterprise Security</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Footer -->
  <section class="container mx-auto px-4 pb-20">
    <div
      class="relative max-w-4xl mx-auto text-center rounded-3xl p-8 md:p-14 border border-primary/15 bg-gradient-to-b from-primary/10 to-transparent overflow-hidden"
    >
      <div class="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-primary/15 blur-3xl"></div>
      <div class="relative">
        <div class="inline-flex items-center gap-1.5 mb-4 text-primary">
          <Star class="w-4 h-4 fill-primary" />
          <Star class="w-4 h-4 fill-primary" />
          <Star class="w-4 h-4 fill-primary" />
          <Star class="w-4 h-4 fill-primary" />
          <Star class="w-4 h-4 fill-primary" />
        </div>
        <h2 class="text-2xl md:text-3xl font-bold mb-4 text-foreground">Ready to Build Something Great?</h2>
        <p class="text-muted-foreground mb-8 max-w-xl mx-auto">
          These tools give you a glimpse of how we work. Let's discuss how we can apply this
          expertise to your project.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" class="gap-2 px-8 shadow-lg shadow-primary/20" href="/contact">
            <Mail class="w-4 h-4" />
            Contact RyderTech
          </Button>
          <Button size="lg" variant="outline" class="gap-2" onclick={() => (showNewsletter = true)}>
            Join Labs Newsletter
          </Button>
        </div>
        <p class="text-sm text-muted-foreground/60 mt-6">No spam. Just occasional updates about new tools and technical insights.</p>
      </div>
    </div>
  </section>
</div>
