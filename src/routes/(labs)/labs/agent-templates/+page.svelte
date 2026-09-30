<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Download, ExternalLink } from '@lucide/svelte';
  import { Bot } from '@lucide/svelte';

  const templates = [
    {
      id: 'whatsapp-order-manager',
      title: 'WhatsApp Order Manager',
      description: 'AI-powered order intake for Nigerian SMEs. Parses WhatsApp messages, checks inventory, generates Paystack invoices, and logs orders.',
      icon: Bot,
      tools: ['n8n', 'WhatsApp', 'Paystack'],
      tags: ['WhatsApp', 'M-Pesa', 'Paystack', 'AI Agent', 'Order Management', 'Nigeria', 'SME'],
      difficulty: 'Beginner',
      setup_time: '15-30 min',
      download_url: '/labs-templates/whatsapp-order-manager.json',
      blog_post: '/blog/whatsapp-order-automation-n8n-template-2026',
      estimated_roi: '₦1,294,000/year',
      featured: true
    }
  ];

  const difficultyColors: Record<string, string> = {
    Beginner: 'bg-green-500/20 text-green-400',
    Intermediate: 'bg-orange-500/20 text-orange-400',
    Advanced: 'bg-red-500/20 text-red-400'
  };
</script>

<main class="min-h-screen bg-slate-950 text-slate-100">
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold text-white mb-4">Agent Template Library</h1>
      <p class="text-slate-400 mb-8">
        Free, pre-built agentic workflow templates for African businesses. Each template includes
        a downloadable n8n/Make JSON file, setup guide, and ROI calculator.
      </p>

      <div class="space-y-6">
        {#each templates as template (template.id)}
          <Card class="bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors">
            <CardHeader>
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <svelte:component this={template.icon} class="w-6 h-6 text-primary" />
                  <CardTitle class="text-white">{template.title}</CardTitle>
                </div>
                {#if template.featured}
                  <Badge class="bg-amber-500/20 text-amber-400">Featured</Badge>
                {/if}
              </div>
              <CardDescription class="text-slate-300 mt-1">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div class="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" class={difficultyColors[template.difficulty]}>
                  {template.difficulty}
                </Badge>
                <Badge variant="outline" class="bg-blue-500/20 text-blue-400">
                  {template.setup_time}
                </Badge>
                <div class="flex flex-wrap gap-1">
                  {#each template.tags as tag}
                    <Badge variant="secondary" class="text-xs bg-slate-800/50 text-slate-400">
                      {tag}
                    </Badge>
                  {/each}
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span class="text-slate-500">Tools:</span>
                  <span class="text-slate-300">{template.tools.join(' • ')}</span>
                </div>
                <div>
                  <span class="text-slate-500">Estimated ROI:</span>
                  <span class="text-green-400 font-medium">{template.estimated_roi}</span>
                </div>
              </div>

              <div class="flex gap-3">
                <a
                  href={template.download_url}
                  download={template.id + '.json'}
                  class="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90"
                >
                  <Download class="w-4 h-4 mr-2" />
                  Download Template
                </a>
                <a
                  href={template.blog_post}
                  class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  <ExternalLink class="w-4 h-4 mr-2" />
                  View Guide
                </a>
              </div>
            </CardContent>
          </Card>
        {/each}
      </div>

      <div class="mt-8 p-6 bg-slate-900/30 border border-slate-800 rounded-lg">
        <h2 class="text-xl font-semibold text-white mb-2">Want a custom template?</h2>
        <p class="text-slate-400 mb-4">
          Need an agent workflow for your specific business? We build custom n8n/Make
          templates starting at ₦150,000. Includes full setup, training, and 30 days of support.
        </p>
        <a href="https://calendly.com/rydertech/automation-consult" class="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90">
          Book a free 15-min consultation
        </a>
      </div>
    </div>
  </div>
</main>
