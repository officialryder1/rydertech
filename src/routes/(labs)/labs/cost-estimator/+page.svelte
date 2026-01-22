<script>
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Progress } from '$lib/components/ui/progress';
    import { Button } from '$lib/components/ui/button';
    import { ArrowRight } from '@lucide/svelte';
    import EstimateCard from '$lib/components/EstimateCard.svelte';
</script>

<section class="py-12 px-4">
  <Card class="w-full max-w-3xl mx-auto">
    <CardHeader>
      <CardTitle class="text-2xl">Cost Estimator Lab</CardTitle>
      <CardDescription class="mt-2 text-lg">
        Use our cost estimator to get an instant estimate for your software project. Answer a few simple questions about your project requirements, and receive a detailed cost breakdown.
      </CardDescription>
    </CardHeader>
    <CardContent class="mt-6">
      <p class="mb-4">
        Our cost estimator is designed to help you understand the potential costs associated with your software project. Whether you're building a mobile app, web application, or custom software solution, our tool provides a quick and easy way to get an estimate based on your specific needs.
      </p>
      <p>
        Ready to get started? Click the button below to begin the estimation process and receive your instant cost estimate.
      </p>
    </CardContent>
  </Card>
  <div class="mt-8">
    <Button variant="primary" href="/labs/cost-estimator/estimate">
      Start Estimation
      <ArrowRight class="ml-2 h-4 w-4" />
    </Button>

    <EstimateCard />
  </div>


</section>