<script lang="ts">
  import VoiceAgent from '$lib/components/VoiceAgent.svelte';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { ArrowLeft, Mic, MessageSquare, Mail } from '@lucide/svelte';

  let showInfo = $state(true);
</script>

<svelte:head>
  <title>Voice Agent — Talk to Ryder | RyderTech Labs</title>
  <meta
    name="description"
    content="Speak with Ryder, RyderTech's AI assistant. Tap the mic and talk — it replies aloud. A free voice-enabled AI demo."
  />
</svelte:head>

<div class="min-h-screen bg-background">
  <!-- Top bar -->
  <div class="border-b border-border/60 bg-card/40 backdrop-blur">
    <div class="container mx-auto flex max-w-5xl items-center gap-3 px-4 py-4">
      <Button variant="ghost" size="sm" class="gap-1" href="/labs">
        <ArrowLeft class="h-4 w-4" />
        Back to Labs
      </Button>
      <span class="text-sm text-muted-foreground">Voice Agent</span>
    </div>
  </div>

  <div class="container mx-auto max-w-5xl px-4 py-8 md:py-12">
    <div class="grid gap-8 md:grid-cols-[1fr_20rem]">
      <!-- Left: the agent -->
      <div class="flex flex-col items-center gap-4">
        <VoiceAgent />
        <p class="text-center text-xs text-muted-foreground">
          Best in Chrome/Edge · Requires mic permission · Works over HTTPS
        </p>
      </div>

      <!-- Right: info panel -->
      <div class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Mic class="h-5 w-5 text-primary" />
              Talk to Ryder
            </CardTitle>
            <CardDescription>Voice-enabled AI assistant for RyderTech services.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-3 text-sm text-muted-foreground">
            <div class="flex items-start gap-2">
              <MessageSquare class="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Tap the mic and speak your question — Ryder replies aloud.</span>
            </div>
            <div class="flex items-start gap-2">
              <Mail class="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>After a few turns, drop your email for a follow-up from the team.</span>
            </div>
            <div class="flex items-start gap-2">
              <Mic class="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Prefer typing? Use the text input — same AI, same answers.</span>
            </div>
          </CardContent>
        </Card>

        <Card class="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle class="text-base">How it works</CardTitle>
          </CardHeader>
          <CardContent class="space-y-2 text-sm text-muted-foreground">
            <p><span class="font-medium text-foreground">1.</span> Tap the mic and ask about web, mobile, or AI services.</p>
            <p><span class="font-medium text-foreground">2.</span> Ryder answers in real time — spoken + on screen.</p>
            <p><span class="font-medium text-foreground">3.</span> Share your email to get a custom quote.</p>
          </CardContent>
        </Card>

        <Button class="w-full gap-2" size="lg" href="/contact">
          Talk to a human
          <ArrowLeft class="h-4 w-4 rotate-180" />
        </Button>
      </div>
    </div>
  </div>
</div>
