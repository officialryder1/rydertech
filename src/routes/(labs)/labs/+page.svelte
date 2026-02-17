<!-- +page.svelte -->
<script lang="ts">
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { ArrowRight, Sparkles, Calculator, FileText, LayoutGrid, Brain, CheckCircle, Mail, Bell } from "@lucide/svelte";
  import NewsLetterModel from "$lib/components/NewsLetterModel.svelte";
  import { fade } from "svelte/transition";
  
  // Define your theme colors
  const theme = {
    border: 'hsl(var(--border))',
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    muted: 'hsl(var(--muted))',
    background: 'hsl(var(--background))',
  };
  let showNewsletter = $state(false);

  function handleNewsletterClose() {
    showNewsletter = false;
    // Remember that user closed the modal (don't show for 7 days)
    localStorage.setItem('rydertech_newsletter_closed', 'true');
    setTimeout(() => {
      localStorage.removeItem('rydertech_newsletter_closed');
    }, 7 * 24 * 60 * 60 * 1000); // 7 days
  }

   async function handleNewsletterSubscribe(email) {
    // Here you would integrate with your actual email service
    console.log('Subscribing email:', email);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Store subscription in localStorage
    localStorage.setItem('rydertech_newsletter_subscribed', 'true');
    
    // In a real app, you would send this to your backend/email service
    // Example with fetch:
    /*
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) throw new Error('Subscription failed');
    } catch (error) {
      console.error('Subscription error:', error);
      throw error;
    }
    */
  }

  let cards = [
    {
      title: 'Website Cost Estimator',
      description: 'Get a rough estimate of what it would cost to build your website based on your idea.',
      icon: Calculator,
      href: '/labs/cost-estimator',
      action: 'Estimate Cost'
    },
    {
      title: 'Website Copy Analyzer',
      description: 'Analyze your homepage copy and get AI-powered feedback on clarity and conversion.',
      icon: FileText,
      href: '/labs/website-rater',
      action: 'Analyze Copy'
    },
    {
      title: 'MVP Feature Planner',
      description: 'Prioritize features for your app or product MVP with AI-powered recommendations.',
      icon: LayoutGrid,
      href: '#',
      comingSoon: true,
      action: 'Notify Me When Ready'
    },
    {
      title: 'Finance Tracker',
      description: 'Track and analyze your personal or business finances with AI-powered insights.',
      icon: Brain,
      href: 'https://flow-spense.pages.dev/',
      action: 'Track Finances'
    }
  ];

  
</script>

<div class="min-h-screen bg-gradient-to-b from-background via-background/95 to-[var(--secondary)]/5" transition:fade>
  <!-- Hero Section -->
  <section class="container mx-auto px-4 pt-16 pb-8 md:pt-24 md:pb-12">
    <div class="max-w-3xl mx-auto text-center space-y-6">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
        <Sparkles class="w-4 h-4 text-primary" />
        <span class="text-sm font-medium text-primary">EXPERIMENTAL LABS</span>
      </div>

      <NewsLetterModel 
        show={showNewsletter}
        onClose={handleNewsletterClose}
        onSubscribe={handleNewsletterSubscribe}
    />
      
      <h1 class="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
        RyderTech <span class="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">Labs</span>
      </h1>
      
      <p class="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto">
        Free AI tools to help founders plan, validate, and build better digital products.
      </p>
      
      <p class="text-muted-foreground/80 max-w-2xl mx-auto">
        Interactive tools built by our engineers using cutting-edge AI. Experiment, calculate, 
        and validate—completely free. No signup required.
      </p>
      
      <Button size="lg" class="gap-2 mt-4 group" href="#tools">
        Explore Tools
        <ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </Button>
    </div>
  </section>

  <!-- Tools Grid -->
  <section class="container mx-auto px-4 py-12 md:py-10" id="#tools">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each cards as card}
        <Card class="hover:shadow-lg transition-shadow group">
          <CardHeader class="flex items-center gap-4 pb-4">
            <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <svelte:component this={card.icon} class="w-5 h-5 text-primary" />
            </div>
            <CardTitle class="text-lg font-semibold text-foreground">{card.title}</CardTitle>
          </CardHeader>
          <CardContent class="text-muted
-foreground">
            <CardDescription>{card.description}</CardDescription>
            <Button 
              variant={card.comingSoon ? "outline" : "default"} 
              class="mt-4 w-full"
              href={card.href}
              disabled={card.comingSoon}
            >
              {card.action}
            </Button>
          </CardContent>
        </Card>
      {/each}

      <!-- Coming Soon Card -->
      <Card class="border-dashed border-2 border-muted/30 bg-transparent">
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
          <Button variant="ghost" class="w-full text-muted-foreground/60" disabled>
            Subscribe for Updates
          </Button>
        </CardContent>
      </Card>
    </div>
  </section>

  <!-- Trust Section -->
  <section class="container mx-auto px-4 py-16 md:py-24">
    <div class="max-w-4xl mx-auto">
      <div class="grid md:grid-cols-5 gap-8 items-center">
        <div class="md:col-span-3 space-y-6">
          <div class="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <CheckCircle class="w-4 h-4 text-primary" />
            BUILT BY EXPERTS
          </div>
          
          <h2 class="text-3xl md:text-4xl font-bold text-foreground">
            Real Tools from Real Product Builders
          </h2>
          
          <p class="text-lg text-muted-foreground">
            These aren't just demos. Each tool is built by RyderTech engineers using the same 
            technologies and best practices we apply to client projects.
          </p>
          
          <p class="text-muted-foreground/80">
            We've built over 50+ digital products for startups and enterprises. 
            These tools showcase our approach to problem-solving and technical excellence.
          </p>
          
          <div class="pt-4">
            <Button variant="outline" size="lg" class="gap-2 group" href="/contact">
              Need this built professionally?
              <ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
        
        <div class="md:col-span-2">
          <div class="bg-linear-to-br from-primary/5 to-[var(--secondary)]/5 border border-muted/50 rounded-2xl p-8 backdrop-blur-sm">
            <div class="space-y-4">
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
  <section class="container mx-auto px-4 py-16">
    <div class="max-w-3xl mx-auto text-center">
      <div class="bg-gradient-to-b from-primary/10 to-transparent rounded-3xl p-8 md:p-12 border border-primary/10">
        <h2 class="text-2xl md:text-3xl font-bold mb-4 text-foreground">
          Ready to Build Something Great?
        </h2>
        <p class="text-muted-foreground mb-8 max-w-xl mx-auto">
          These tools give you a glimpse of how we work. Let's discuss how we can apply 
          this expertise to your project.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" class="gap-2 px-8" href="/contact">
            <Mail class="w-4 h-4" />
            Contact RyderTech
          </Button>
          <Button size="lg" variant="outline" class="gap-2">
            Join Labs Newsletter
          </Button>
        </div>
        <p class="text-sm text-muted-foreground/60 mt-6">
          No spam. Just occasional updates about new tools and technical insights.
        </p>
      </div>
    </div>
  </section>
</div>