<script lang="ts">
  import { ArrowLeft, PlayCircle, Lock } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';

  let { data }: { data: { course: { slug: string; title: string; outcome: string }; videos: { youtube_id: string; title: string | null; position: number }[] } } = $props();
  let active = $state(data.videos[0]?.youtube_id ?? '');
</script>

<svelte:head>
  <title>{data.course.title} — Watch | RyderTech</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="min-h-screen bg-background pt-24 pb-16 px-4">
  <div class="container mx-auto max-w-5xl">
    <a href="/account" class="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
      <ArrowLeft class="w-4 h-4 mr-1" /> Back to My Courses
    </a>
    <h1 class="text-2xl font-bold mb-1">{data.course.title}</h1>
    <p class="text-muted-foreground mb-6">{data.course.outcome}</p>

    {#if data.videos.length === 0}
      <div class="rounded-2xl border border-dashed bg-muted/30 p-12 text-center">
        <Lock class="w-10 h-10 text-primary mx-auto mb-3" />
        <p class="text-muted-foreground">Videos are being uploaded. Check back soon.</p>
      </div>
    {:else}
      <div class="grid lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          {#if active}
            <div class="aspect-video w-full rounded-xl overflow-hidden bg-black">
              <iframe
                class="w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${active}`}
                title="Course video"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
          {/if}
        </div>
        <div class="lg:col-span-1">
          <h2 class="font-semibold mb-3">Lessons</h2>
          <div class="space-y-2">
            {#each data.videos as v, i}
              <button
                class="w-full text-left flex items-center gap-3 p-3 rounded-lg border {active === v.youtube_id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}"
                onclick={() => (active = v.youtube_id)}
              >
                <PlayCircle class="w-5 h-5 text-primary flex-shrink-0" />
                <span class="text-sm">{v.title ?? `Lesson ${i + 1}`}</span>
              </button>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
