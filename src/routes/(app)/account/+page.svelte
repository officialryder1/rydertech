<script lang="ts">
  import { GraduationCap, ArrowRight, PlayCircle, LogOut } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { supabase } from '$lib/supabaseClient';
  import { courseBySlug } from '$lib/courses';
  import type { Course } from '$lib/courses';

  let { data }: { data: { email: string | null; myCourses: (Course & { priceNgn: number })[] } } = $props();

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }
</script>

<svelte:head>
  <title>My Courses - RyderTech</title>
  <meta name="description" content="Your purchased RyderTech courses." />
</svelte:head>

<div class="min-h-screen bg-background pt-32 pb-20 px-4">
  <div class="container mx-auto max-w-4xl">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-4">
      <div>
        <h1 class="text-3xl font-bold mb-1">My Courses</h1>
        <p class="text-muted-foreground">{data.email}</p>
      </div>
      <Button variant="outline" onclick={logout}>
        <LogOut class="w-4 h-4 mr-2" /> Log Out
      </Button>
    </div>

    {#if data.myCourses.length === 0}
      <div class="rounded-2xl border border-dashed bg-muted/30 p-12 text-center">
        <GraduationCap class="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 class="text-xl font-semibold mb-2">No courses yet</h2>
        <p class="text-muted-foreground mb-6">Enroll in a course to start learning.</p>
        <a href="/courses"><Button class="text-white">Browse Courses <ArrowRight class="w-4 h-4 ml-2" /></Button></a>
      </div>
    {:else}
      <div class="grid md:grid-cols-2 gap-6">
        {#each data.myCourses as course}
          {@const Icon = courseBySlug(course.slug)?.icon}
          <Card class="group hover:shadow-lg transition-all">
            <CardHeader>
              <div class="flex items-center gap-3 mb-2">
                <div class="p-3 bg-primary/10 rounded-lg">
                  {#if Icon}<Icon class="w-6 h-6 text-primary" />{/if}
                </div>
                <CardTitle class="text-lg">{course.title}</CardTitle>
              </div>
              <p class="text-sm text-muted-foreground">{course.outcome}</p>
            </CardHeader>
            <CardContent>
              <a href={`/learn/${course.slug}`}>
                <Button class="w-full text-white">
                  <PlayCircle class="w-4 h-4 mr-2" /> Start Learning
                </Button>
              </a>
            </CardContent>
          </Card>
        {/each}
      </div>
    {/if}
  </div>
</div>
