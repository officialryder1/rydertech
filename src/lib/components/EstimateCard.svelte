<script lang="ts">
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Progress } from '$lib/components/ui/progress';
  import { Button } from '$lib/components/ui/button';
  import { ArrowRight } from '@lucide/svelte';
  
  export let currentStep = 1;
  export let totalSteps = 6;
  
  const progress = (currentStep / totalSteps) * 100;
</script>

<Card class="w-full max-w-2xl mx-auto">
  <CardHeader>
    <CardTitle>Project Cost Estimator</CardTitle>
    <CardDescription>
      Answer a few questions to get an instant estimate
    </CardDescription>
    <Progress value={progress} class="mt-4" />
  </CardHeader>
  <CardContent>
    <slot />
    <div class="flex justify-between mt-8">
      <Button variant="outline" on:click={() => currentStep--} disabled={currentStep === 1}>
        Back
      </Button>
      <Button on:click={() => currentStep++}>
        Next
        <ArrowRight class="ml-2 h-4 w-4" />
      </Button>
    </div>
  </CardContent>
</Card>