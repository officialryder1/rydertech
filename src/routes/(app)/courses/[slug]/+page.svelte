<script lang="ts">
  import { CheckCircle, ArrowRight, Clock, Layers, Signal, Users, ShoppingCart } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import CourseLeadForm from '$lib/components/CourseLeadForm.svelte';
  import { courseJsonLd, formatNgn, type Course } from '$lib/courses';

  let { data }: { data: { course: Course } } = $props();
  const course = data.course;
  const canonical = `https://rydertech.ng/courses/${course.slug}`;
</script>

<svelte:head>
  <title>{course.title} - RyderTech Course | {course.category}</title>
  <meta name="description" content={course.description} />
  <meta name="keywords" content={`${course.title}, ${course.category}, AI course Nigeria, learn ${course.category}, RyderTech course`} />
  <link rel="canonical" href={canonical} />
  <meta property="og:title" content={`${course.title} — RyderTech`} />
  <meta property="og:description" content={course.outcome} />
  <meta property="og:url" content={canonical} />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  {@html `<script type="application/ld+json">${courseJsonLd(course).replace(/</g, '\\u003c')}</` + `script>`}
</svelte:head>

<div class="min-h-screen bg-background pt-32">
  <!-- Hero -->
  <section class="py-16 px-4">
    <div class="container mx-auto max-w-6xl">
      <a href="/courses" class="text-sm text-muted-foreground hover:text-primary inline-flex items-center mb-6">
        ← All Courses
      </a>
      <div class="grid lg:grid-cols-3 gap-10">
        <div class="lg:col-span-2">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-3 bg-primary/10 rounded-lg">
              <course.icon class="w-7 h-7 text-primary" />
            </div>
            <Badge variant="outline">{course.category}</Badge>
            <Badge variant="secondary">{course.level}</Badge>
          </div>
          <h1 class="text-4xl md:text-5xl font-bold mb-4">{course.title}</h1>
          <p class="text-xl text-primary font-semibold mb-6">{course.tagline}</p>
          <p class="text-lg text-muted-foreground mb-8">{course.description}</p>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div class="rounded-xl border bg-muted/30 p-4">
              <Clock class="w-5 h-5 text-primary mb-2" />
              <p class="text-sm text-muted-foreground">Duration</p>
              <p class="font-semibold">{course.durationHours}h</p>
            </div>
            <div class="rounded-xl border bg-muted/30 p-4">
              <Layers class="w-5 h-5 text-primary mb-2" />
              <p class="text-sm text-muted-foreground">Modules</p>
              <p class="font-semibold">{course.moduleCount}</p>
            </div>
            <div class="rounded-xl border bg-muted/30 p-4">
              <Signal class="w-5 h-5 text-primary mb-2" />
              <p class="text-sm text-muted-foreground">Format</p>
              <p class="font-semibold text-sm">{course.format}</p>
            </div>
            <div class="rounded-xl border bg-muted/30 p-4">
              <Users class="w-5 h-5 text-primary mb-2" />
              <p class="text-sm text-muted-foreground">Level</p>
              <p class="font-semibold">{course.level}</p>
            </div>
          </div>

          <h2 class="text-2xl font-bold mb-4">What You'll Be Able to Do</h2>
          <ul class="space-y-3 mb-8">
            {#each course.outcomes as outcome}
              <li class="flex items-center text-muted-foreground">
                <CheckCircle class="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                {outcome}
              </li>
            {/each}
          </ul>

          <h2 class="text-2xl font-bold mb-4">Who This Is For</h2>
          <div class="flex flex-wrap gap-2 mb-8">
            {#each course.audience as a}
              <Badge variant="outline" class="text-sm py-1 px-3">{a}</Badge>
            {/each}
          </div>
        </div>

        <!-- Sticky purchase card -->
        <div class="lg:col-span-1">
          <div class="sticky top-28 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle class="text-lg">Enroll</CardTitle>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="text-3xl font-bold text-primary">{formatNgn(course.priceNgn)}</div>
                <p class="text-sm text-muted-foreground">{course.format} · lifetime access</p>
                <a href={course.checkoutUrl} target="_blank" rel="noopener noreferrer" class="w-full">
                  <Button class="w-full text-white text-lg">
                    <ShoppingCart class="w-5 h-5 mr-2" />
                    Enroll on Gumroad
                  </Button>
                </a>
                <p class="text-xs text-center text-gray-500">
                  Secure checkout via Gumroad. Content delivered after purchase.
                </p>
              </CardContent>
            </Card>
            <CourseLeadForm courseTitle={course.title} ctaLabel="Join Waitlist" />
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Curriculum -->
  <section class="py-16 px-4 bg-muted/30">
    <div class="container mx-auto max-w-4xl">
      <h2 class="text-3xl font-bold mb-10 text-center">Curriculum</h2>
      <div class="space-y-4">
        {#each course.curriculum as module, i}
          <Card>
            <CardHeader>
              <CardTitle class="text-lg flex items-center gap-3">
                <span class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </span>
                {module.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul class="space-y-2">
                {#each module.lessons as lesson}
                  <li class="flex items-center text-muted-foreground text-sm">
                    <CheckCircle class="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {lesson}
                  </li>
                {/each}
              </ul>
            </CardContent>
          </Card>
        {/each}
      </div>
    </div>
  </section>

  <!-- Bottom CTA -->
  <section class="py-20 px-4 bg-primary text-white">
    <div class="container mx-auto max-w-4xl text-center">
      <h2 class="text-3xl md:text-4xl font-bold mb-6">{course.outcome}</h2>
      <p class="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
        Enroll today and start building. Questions? Talk to the team that teaches it.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href={course.checkoutUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="secondary" size="lg" class="text-lg">
            <ShoppingCart class="w-5 h-5 mr-2" />
            Enroll Now
          </Button>
        </a>
        <a href="/contact">
          <Button variant="outline" size="lg" class="text-lg bg-transparent border-white text-white hover:bg-white hover:text-primary">
            Ask a Question <ArrowRight class="w-5 h-5 ml-2" />
          </Button>
        </a>
      </div>
    </div>
  </section>
</div>
