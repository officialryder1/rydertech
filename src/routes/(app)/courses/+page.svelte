<script lang="ts">
  import { CheckCircle, ArrowRight, GraduationCap, Star } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import CourseLeadForm from '$lib/components/CourseLeadForm.svelte';
  import { courses, coursesItemListJsonLd, formatNgn } from '$lib/courses';
</script>

<svelte:head>
  <title>Courses - RyderTech | Learn AI Automation, Video & LLM Agents</title>
  <meta name="description" content="Hands-on RyderTech courses: AI automation mastery, AI video generation for ads, building LLM chatbots & agents, and no-code AI for business ops. Learn the skills we use on client projects." />
  <meta name="keywords" content="AI course Nigeria, AI automation course, AI video generation course, LLM chatbot course, no-code AI training, learn AI automation" />
  {@html `<script type="application/ld+json">${coursesItemListJsonLd().replace(/</g, '\\u003c')}</` + `script>`}
</svelte:head>

<div class="min-h-screen bg-background pt-32">
  <!-- Hero -->
  <section class="py-20 px-4">
    <div class="container mx-auto max-w-6xl text-center">
      <Badge variant="secondary" class="mb-4">RyderTech Courses</Badge>
      <h1 class="text-4xl md:text-6xl font-bold mb-6">
        Learn the AI Skills We <span class="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">Sell on Client Projects</span>
      </h1>
      <p class="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
        Practical, project-based courses in AI automation, generative video, and LLM agents — built by the studio that ships them. No fluff, just systems you can run.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="#catalog">
          <Button size="lg" class="text-lg px-8 text-white">
            Browse Courses <ArrowRight class="w-5 h-5 ml-2" />
          </Button>
        </a>
        <a href="/labs">
          <Button variant="outline" size="lg" class="text-lg px-8">
            Try a Free Tool <GraduationCap class="w-5 h-5 ml-2" />
          </Button>
        </a>
      </div>
    </div>
  </section>

  <!-- Catalog -->
  <section id="catalog" class="py-20 px-4 bg-muted/30">
    <div class="container mx-auto max-w-6xl">
      <div class="text-center mb-16">
        <Badge variant="outline" class="mb-4">Catalog</Badge>
        <h2 class="text-3xl md:text-4xl font-bold mb-4">Four Courses, One Goal: Ship AI That Works</h2>
        <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
          Every course ends with a working asset, not just a certificate.
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
        {#each courses as course}
          <Card class="group hover:shadow-lg transition-all duration-300 h-full flex flex-col">
            <CardHeader class="pb-4">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-primary/10 rounded-lg w-fit group-hover:scale-110 transition-transform duration-300">
                  <course.icon class="w-6 h-6 text-primary" />
                </div>
                <Badge variant="outline">{course.level}</Badge>
              </div>
              <CardTitle class="text-xl">{course.title}</CardTitle>
              <CardDescription class="text-base mt-2">{course.tagline}</CardDescription>
            </CardHeader>
            <CardContent class="flex-1 flex flex-col">
              <ul class="space-y-2 mb-6 flex-1">
                {#each course.outcomes.slice(0, 4) as outcome}
                  <li class="flex items-center text-sm text-muted-foreground">
                    <CheckCircle class="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {outcome}
                  </li>
                {/each}
              </ul>
              <div class="space-y-3 pt-4 border-t">
                <div class="flex justify-between text-sm">
                  <span class="text-muted-foreground">Price</span>
                  <span class="font-semibold text-primary">{formatNgn(course.priceNgn)}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-muted-foreground">Duration</span>
                  <span>{course.durationHours}h · {course.moduleCount} modules</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-muted-foreground">Format</span>
                  <span>{course.format}</span>
                </div>
                <a href={`/courses/${course.slug}`} class="w-full mt-4">
                  <Button variant="outline" class="w-full">
                    View Course <ArrowRight class="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        {/each}
      </div>
    </div>
  </section>

  <!-- Why learn with us -->
  <section class="py-20 px-4">
    <div class="container mx-auto max-w-6xl">
      <div class="text-center mb-16">
        <Badge variant="outline" class="mb-4">Why RyderTech</Badge>
        <h2 class="text-3xl md:text-4xl font-bold mb-4">Practitioner-Led, Not Theory-Led</h2>
      </div>
      <div class="grid md:grid-cols-3 gap-8">
        {#each [{ t: 'Built on Real Client Work', d: 'Our automations and agents run in production for paying clients — you learn the same patterns.' }, { t: 'Project-Based', d: 'Each course ends with a deployable asset: a workflow, an ad video, or a live bot.' }, { t: 'Tool-Agnostic Foundations', d: 'We teach the mental model so you can swap n8n, Gumloop, or your own stack later.' }] as benefit}
          <div class="text-center group">
            <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 mb-5">
              <Star class="w-7 h-7 text-primary" />
            </div>
            <h3 class="text-xl font-bold mb-3">{benefit.t}</h3>
            <p class="text-muted-foreground">{benefit.d}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Lead capture + CTA -->
  <section class="py-20 px-4 bg-primary text-white">
    <div class="container mx-auto max-w-5xl grid md:grid-cols-2 gap-10 items-center">
      <div>
        <h2 class="text-3xl md:text-4xl font-bold mb-6">Get Early-Bird Pricing</h2>
        <p class="text-xl opacity-90 mb-8 max-w-xl">
          New cohorts and course drops go to our list first — often at founder pricing. Join below.
        </p>
        <a href="/contact" class="inline-flex">
          <Button variant="secondary" size="lg" class="text-lg">
            Talk to Us <ArrowRight class="w-5 h-5 ml-2" />
          </Button>
        </a>
      </div>
      <div class="bg-white/5 rounded-2xl p-2">
        <CourseLeadForm courseTitle="RyderTech Courses" ctaLabel="Join the List" />
      </div>
    </div>
  </section>
</div>
