<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { 
    ShieldCheck, 
    Zap, 
    BarChart3, 
    ArrowRight, 
    Code2 
  } from "@lucide/svelte";
  import Scale from "$lib/assets/scale.png";
  
  // Example Niche Data
  const niche = "Fintech & WealthTech";
  const painPoints = [
    { icon: ShieldCheck, title: "Compliance-First", desc: "HIPAA and SOC2 isn't an afterthought for us." },
    { icon: Zap, title: "Sub-Second Latency", desc: "Engineered for high-frequency financial data." },
    { icon: BarChart3, title: "Legacy Migration", desc: "Moving COBOL/Old SQL to modern cloud infra." }
  ];
</script>

<section class="relative py-40 px-6 lg:py-32 bg-background overflow-hidden">
  <div class="container max-w-6xl mx-auto text-center relative z-10">
    <Badge variant="outline" class="mb-4 px-4 py-1 border-primary/30 text-primary">
      2026 {niche} Specialized Agency
    </Badge>
    
    <h1 class="text-5xl lg:text-7xl font-bold tracking-tight mb-6">
      Stop building apps that <br />
      <span class="text-primary italic">break at scale.</span>
    </h1>
    
    <p class="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
      RydeTech provides specialized engineering for {niche} companies who need more than just "clean code." We build mission-critical infrastructure.
    </p>

    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <Button size="lg" class="gap-2">
        Get a Tech Audit <ArrowRight size={18} />
      </Button>
      <Button size="lg" variant="outline">View Case Studies</Button>
    </div>
  </div>
</section>

<section class="py-20 bg-background">
  <div class="container max-w-5xl mx-auto px-6 space-y-24">
    
    <div class="grid md:grid-cols-2 gap-12 items-center">
      <div>
        <h3 class="text-3xl font-bold mb-4">The "Success Trap"</h3>
        <p class="text-muted-foreground leading-relaxed">
          Growth is great until your infrastructure can't keep up. We see it 
          constantly: brilliant companies held hostage by tech debt. 
          RydeTech was founded to break that cycle.
        </p>
      </div>
      <div class="bg-muted aspect-video rounded-xl flex items-center justify-center border border-dashed">
         <img src={Scale} alt="Scale">
      </div>
    </div>

    <div class="grid md:grid-cols-2 gap-12 items-center">
      <div class="order-2 md:order-1 bg-primary/5 aspect-video rounded-xl flex items-center justify-center">
         <span class="text-primary/60 italic">"RydeTech reduced our deployment time by 80%" — CTO of Finly</span>
      </div>
      <div class="order-1 md:order-2">
        <h3 class="text-3xl font-bold mb-4">Tactical Engineering</h3>
        <p class="text-muted-foreground leading-relaxed">
          We don't just throw developers at a problem. We embed deeply into your 
          business logic to ensure every line of code we write adds to your 
          bottom line.
        </p>
      </div>
    </div>

  </div>
</section>

<section class="py-20 bg-muted/30">
  <div class="container max-w-6xl mx-auto px-6">
    <div class="text-center mb-16">
      <h2 class="text-3xl font-bold">Why Generalist Agencies Fail {niche}</h2>
    </div>

    <div class="grid md:grid-cols-3 gap-8">
      {#each painPoints as item}
        <Card.Root class="border-none shadow-lg bg-background">
          <Card.Header>
            <div class="p-3 w-fit rounded-lg bg-primary/10 text-primary mb-4">
              <svelte:component this={item.icon} size={28} />
            </div>
            <Card.Title>{item.title}</Card.Title>
            <Card.Description class="text-base">
              {item.desc}
            </Card.Description>
          </Card.Header>
        </Card.Root>
      {/each}
    </div>
  </div>
</section>

<section class="py-24 px-6">
  <div class="container max-w-4xl mx-auto bg-primary rounded-3xl p-12 text-primary-foreground text-center relative overflow-hidden">
    <div class="absolute inset-0 opacity-10 pointer-events-none">
      <Code2 size={400} class="absolute -right-20 -bottom-20 rotate-12" />
    </div>

    <h2 class="text-4xl font-bold mb-6 relative z-10">Ready to scale your platform?</h2>
    <p class="text-lg opacity-90 mb-8 relative z-10">
      Book a 15-minute engineering consult. No sales pitch, just a technical deep dive into your roadmap.
    </p>
    <div class="flex justify-center relative z-10">
       <Button size="lg" variant="secondary" class="font-bold text-primary">
        Schedule Discovery Call
      </Button>
    </div>
  </div>
</section>