<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Progress } from "$lib/components/ui/progress";
  import { Badge } from "$lib/components/ui/badge";
  import { ArrowLeft, ArrowRight, Calculator, Mail, MessageSquare, Sparkles, ChevronRight, Clock, Layers, Palette, Globe, DollarSign, RefreshCw } from "@lucide/svelte";
  import { fade } from "svelte/transition";


  
  // Currency types and state
  type Currency = 'USD' | 'NGN';
  let selectedCurrency: Currency = 'NGN'; // Default to NGN for Nigerian users
  
  // Exchange rate (you can fetch this from an API or update periodically)
  const exchangeRate = 1500; // Example: 1 USD = 1500 NGN
  
  // Types
  type ProjectType = 'business-website' | 'landing-page' | 'web-app' | 'ecommerce';
  type PageCount = '1-3' | '4-7' | '8-15' | 'not-sure';
  type Timeline = 'asap' | '1-2-months' | 'flexible';
  type Budget = 'under-1000' | '1000-3000' | '3000-7000' | '7000-plus';

  // State
  let currentStep = 1;
  let totalSteps = 7;
  
  // User responses
  let projectType: ProjectType | null = null;
  let pageCount: PageCount | null = null;
  let features: string[] = [];
  let hasDesigns: 'yes' | 'no' | 'partial' | null = null;
  let timeline: Timeline | null = null;
  let budget: Budget | null = null;
  
  // Results
  let showResults = false;
  let costRangeUSD = { min: 0, max: 0 };
  let costBreakdown: { category: string; impact: 'low' | 'medium' | 'high'; description: string }[] = [];
  let timelineEstimate = '';
  
  // Lead capture
  let userEmail = '';
  let emailSubmitted = false;

  // Question options with NGN equivalents in descriptions
  const projectOptions = [
    { 
      id: 'business-website', 
      label: 'Business Website', 
      description: 'Company site with multiple pages and information',
      baseUSD: 750
    },
    { 
      id: 'landing-page', 
      label: 'Landing Page', 
      description: 'Single page for marketing campaigns or product launch',
      baseUSD: 200
    },
    { 
      id: 'web-app', 
      label: 'Web App / Platform', 
      description: 'Interactive application with user accounts',
      baseUSD: 2000
    },
    { 
      id: 'ecommerce', 
      label: 'E-commerce Store', 
      description: 'Online store with products and payments',
      baseUSD: 1500
    }
  ];

  const pageOptions = [
    { id: '1-3', label: '1-3 pages', description: 'Simple site with core information' },
    { id: '4-7', label: '4-7 pages', description: 'Standard business website' },
    { id: '8-15', label: '8-15 pages', description: 'Comprehensive website with multiple sections' },
    { id: 'not-sure', label: 'Not sure', description: 'Will figure it out later' }
  ];

  const featureOptions = [
    { 
      id: 'authentication', 
      label: 'Authentication / User Accounts', 
      description: 'User login, registration, profiles',
      costUSD: 200
    },
    { 
      id: 'payments', 
      label: 'Payments', 
      description: 'Online payments, subscriptions, invoicing',
      costUSD: 250
    },
    { 
      id: 'admin-dashboard', 
      label: 'Admin Dashboard', 
      description: 'Backend for managing content and users',
      costUSD: 200
    },
    { 
      id: 'integrations', 
      label: 'Third-party Integrations', 
      description: 'Connect with other services (CRM, email, etc.)',
      costUSD: 300
    }
  ];

  const designOptions = [
    { id: 'yes', label: 'Yes', description: 'Fully designed in Figma or similar' },
    { id: 'no', label: 'No', description: 'Need design from scratch' },
    { id: 'partial', label: 'Partially', description: 'Some designs exist, need completion' }
  ];

  const timelineOptions = [
    { id: 'asap', label: 'ASAP', description: 'Ready to start immediately' },
    { id: '1-2-months', label: '1-2 months', description: 'Can start within next few months' },
    { id: 'flexible', label: 'Flexible', description: 'No specific timeline' }
  ];

  const budgetOptions = [
    { 
      id: 'under-500', 
      label: selectedCurrency === 'USD' ? 'Below $500' : 'Below ₦750,000', 
      description: selectedCurrency === 'USD' ? 'Basic landing page range' : 'Basic landing page range' 
    },
    { 
      id: '500-1500', 
      label: selectedCurrency === 'USD' ? '$500 – $1,500' : '₦750,000 – ₦4,500,000', 
      description: selectedCurrency === 'USD' ? 'Standard business website range' : 'Standard business website range' 
    },
    { 
      id: '1500-7000', 
      label: selectedCurrency === 'USD' ? '$1,500 – $7,000' : '₦4,500,000 – ₦10,500,000', 
      description: selectedCurrency === 'USD' ? 'Feature-rich website range' : 'Feature-rich website range' 
    },
    { 
      id: '7000-plus', 
      label: selectedCurrency === 'USD' ? '$7,000+' : '₦10,500,000+', 
      description: selectedCurrency === 'USD' ? 'Complex web application range' : 'Complex web application range' 
    }
  ];

  // Currency functions
  function convertToNGN(usdAmount: number): number {
    return Math.round(usdAmount * exchangeRate);
  }

  function formatCurrency(amount: number, currency: Currency): string {
    if (currency === 'NGN') {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    }
  }

  function toggleCurrency() {
    selectedCurrency = selectedCurrency === 'USD' ? 'NGN' : 'USD';
    // Update budget option labels when currency changes
    budgetOptions.forEach(option => {
      if (option.id === 'under-1000') {
        option.label = selectedCurrency === 'USD' ? 'Below $1,000' : 'Below ₦1,500,000';
      } else if (option.id === '1000-3000') {
        option.label = selectedCurrency === 'USD' ? '$1,000 – $3,000' : '₦1,500,000 – ₦4,500,000';
      } else if (option.id === '3000-7000') {
        option.label = selectedCurrency === 'USD' ? '$3,000 – $7,000' : '₦4,500,000 – ₦10,500,000';
      } else if (option.id === '7000-plus') {
        option.label = selectedCurrency === 'USD' ? '$7,000+' : '₦10,500,000+';
      }
    });
  }

  // Step handlers
  function selectProjectType(type: ProjectType) {
    projectType = type;
    nextStep();
  }

  function selectPageCount(count: PageCount) {
    pageCount = count;
    nextStep();
  }

  function toggleFeature(featureId: string) {
    if (features.includes(featureId)) {
      features = features.filter(f => f !== featureId);
    } else {
      features = [...features, featureId];
    }
  }

  function selectDesigns(option: 'yes' | 'no' | 'partial') {
    hasDesigns = option;
    nextStep();
  }

  function selectTimeline(option: Timeline) {
    timeline = option;
    nextStep();
  }

  function selectBudget(option: Budget) {
    budget = option;
    nextStep();
  }

  function nextStep() {
    if (currentStep < totalSteps) {
      currentStep++;
      if (currentStep === totalSteps) {
        calculateEstimate();
      }
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
    }
  }

  function resetEstimator() {
    currentStep = 1;
    projectType = null;
    pageCount = null;
    features = [];
    hasDesigns = null;
    timeline = null;
    budget = null;
    showResults = false;
    emailSubmitted = false;
    userEmail = '';
  }

  // Estimation logic
  function calculateEstimate() {
    let baseCost = 0;
    
    // Base cost by project type
    const selectedProject = projectOptions.find(p => p.id === projectType);
    baseCost = selectedProject?.baseUSD || 3000;
    
    // Adjust for pages
    switch (pageCount) {
      case '4-7': baseCost *= 1.3; break;
      case '8-15': baseCost *= 1.7; break;
      case 'not-sure': baseCost *= 1.2; break;
    }
    
    // Adjust for features
    features.forEach(featureId => {
      const feature = featureOptions.find(f => f.id === featureId);
      if (feature) baseCost += feature.costUSD;
    });
    
    // Adjust for designs
    if (hasDesigns === 'no') baseCost += 1500;
    else if (hasDesigns === 'partial') baseCost += 750;
    
    // Calculate range (±30%)
    costRangeUSD = {
      min: Math.round(baseCost * 0.7),
      max: Math.round(baseCost * 1.3)
    };
    
    // Generate breakdown
    costBreakdown = [
      {
        category: 'Design',
        impact: hasDesigns === 'no' ? 'high' : (hasDesigns === 'partial' ? 'medium' : 'low'),
        description: hasDesigns === 'no' 
          ? 'Complete design from scratch' 
          : hasDesigns === 'partial'
          ? 'Partially designed, needs completion'
          : 'Designs provided, saving time'
      },
      {
        category: 'Development',
        impact: features.length > 2 ? 'high' : (features.length > 0 ? 'medium' : 'low'),
        description: features.length > 0 
          ? `${features.length} advanced feature${features.length > 1 ? 's' : ''} selected` 
          : 'Standard development'
      },
      {
        category: 'Complexity',
        impact: projectType === 'web-app' || projectType === 'ecommerce' ? 'high' : 'medium',
        description: projectType === 'web-app' 
          ? 'Interactive application' 
          : projectType === 'ecommerce'
          ? 'E-commerce functionality'
          : 'Standard website'
      }
    ];
    
    // Timeline estimate
    if (timeline === 'asap') {
      timelineEstimate = '6-8 weeks (expedited)';
    } else if (projectType === 'landing-page') {
      timelineEstimate = '3-4 weeks';
    } else if (projectType === 'web-app' || projectType === 'ecommerce') {
      timelineEstimate = '10-16 weeks';
    } else {
      timelineEstimate = '6-10 weeks';
    }
    
    showResults = true;
    currentStep = totalSteps;
  }

  function submitEmail() {
    if (userEmail && userEmail.includes('@')) {
      // In production: Send to your backend/email service
      console.log('Email captured:', userEmail, {
        projectType,
        pageCount,
        features,
        hasDesigns,
        timeline,
        budget,
        costRangeUSD,
        selectedCurrency
      });
      emailSubmitted = true;
      
      // Optional: Redirect to contact page after 2 seconds
      setTimeout(() => {
        // window.location.href = '/contact';
      }, 2000);
    }
  }

  // Get current cost range based on selected currency
  $: currentCostRange = selectedCurrency === 'USD' 
    ? costRangeUSD 
    : { 
        min: convertToNGN(costRangeUSD.min), 
        max: convertToNGN(costRangeUSD.max) 
      };
</script>



<div class="min-h-screen bg-gradient-to-b from-background via-background/95 to-[var(--secondary)]/5 py-8">
  <div class="container mx-auto px-4 max-w-4xl">
    <!-- Header -->
    <div class="mb-8 md:mb-12">
      <a href="/labs" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft class="w-4 h-4" />
        Back to RyderTech Labs
      </a>
      
      <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div class="flex-1">
          <h1 class="text-3xl md:text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
            <Calculator class="w-8 h-8 text-primary" />
            Website Cost Estimator
          </h1>
          <p class="text-muted-foreground text-lg">
            Get a rough estimate of what it would cost to build your website based on your idea.
          </p>
        </div>
        
        <div class="flex items-center gap-4">
          <Badge variant="outline" class="gap-1 ">
            <Sparkles class="w-3 h-3" />
            Free Tool
          </Badge>
          
          <!-- Currency Toggle -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">Currency:</span>
            <Button 
              variant="outline" 
              size="sm" 
              onclick={toggleCurrency}
              class="gap-2 h-9"
            >
              {#if selectedCurrency === 'USD'}
                
                  <DollarSign class="w-4 h-4" />
                  USD
               
              {:else}
                
                  <Globe class="w-4 h-4" />
                  NGN
               
              {/if}
              <RefreshCw class="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Currency Info Banner -->
    <Card class="mb-6 border-primary/20 bg-primary/5">
      <CardContent class="p-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div class="flex items-center gap-3">
            <Globe class="w-5 h-5 text-primary" />
            <div>
              <p class="text-sm font-medium">
                {selectedCurrency === 'USD' ? 'Estimates shown in US Dollars (USD)' : 'Estimates shown in Nigerian Naira (NGN)'}
              </p>
              <p class="text-xs text-muted-foreground">
                {selectedCurrency === 'USD' 
                  ? `Exchange rate: 1 USD ≈ ₦${exchangeRate.toLocaleString()} NGN`
                  : `Exchange rate: ₦${exchangeRate.toLocaleString()} NGN ≈ 1 USD`
                }
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onclick={toggleCurrency}
            class="text-xs h-8"
          >
            Switch to {selectedCurrency === 'USD' ? 'NGN' : 'USD'}
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Main Content -->
    <div class="grid lg:grid-cols-3 gap-8">
      <!-- Progress & Steps -->
      <div class="lg:col-span-2 space-y-8">
        {#if !showResults}
          <!-- Progress Bar -->
          <Card class="border-muted/50">
            <CardContent class="pt-6">
              <div class="space-y-4">
                <div class="flex justify-between text-sm text-muted-foreground">
                  <span>Step {currentStep} of {totalSteps}</span>
                  <span>{Math.round((currentStep / totalSteps) * 100)}% complete</span>
                </div>
                <Progress value={(currentStep / totalSteps) * 100} class="h-2" />
              </div>
            </CardContent>
          </Card>

          <!-- Step Content -->
          <Card class="border-muted/50 min-h-[400px]">
            <CardContent class="p-6 md:p-8">
              {#key currentStep}
                <div transition:fade|local>
                  <!-- Step 1: Project Type -->
                  {#if currentStep === 1}
                    <div class="space-y-6">
                      <div>
                        <h2 class="text-2xl font-semibold mb-2">What do you want to build?</h2>
                        <p class="text-muted-foreground">Select the type of project that matches your needs.</p>
                      </div>
                      
                      <div class="grid sm:grid-cols-2 gap-4">
                        {#each projectOptions as option}
                          <Button
                            variant={projectType === option.id ? 'default' : 'outline'}
                            class="h-auto py-6 px-4 flex flex-col items-start justify-start text-left hover:border-primary/50 transition-all group"
                            onclick={() => selectProjectType(option.id as ProjectType)}
                          >
                            <div class="flex items-start w-full mb-2">
                              <div class="flex-1">
                                <span class="font-medium text-base block">{option.label}</span>
                                <span class="text-sm text-muted-foreground">{option.description}</span>
                              </div>
                              <ChevronRight class="w-4 h-4 mt-1" />
                            </div>
                            <div class="text-xs text-muted-foreground/70 mt-2">
                              Starting from {formatCurrency(option.baseUSD, 'USD')} 
                              {selectedCurrency === 'NGN' && ` (≈ ${formatCurrency(convertToNGN(option.baseUSD), 'NGN')})`}
                            </div>
                          </Button>
                        {/each}
                      </div>
                    </div>

                  <!-- Step 2: Page Count -->
                  {:else if currentStep === 2}
                    <div class="space-y-6">
                      <div>
                        <h2 class="text-2xl font-semibold mb-2">How many pages or screens?</h2>
                        <p class="text-muted-foreground">This helps us understand the scope of your project.</p>
                      </div>
                      
                      <div class="grid gap-4">
                        {#each pageOptions as option}
                          <Button
                            variant={pageCount === option.id ? 'default' : 'outline'}
                            class="h-auto py-6 px-4 justify-start text-left hover:border-primary/50"
                            onclick={() => selectPageCount(option.id as PageCount)}
                          >
                            <div class="flex items-center w-full">
                              <div class="flex-1">
                                <span class="font-medium text-base block">{option.label}</span>
                                <span class="text-sm text-muted-foreground">{option.description}</span>
                              </div>
                              <ChevronRight class="w-4 h-4" />
                            </div>
                          </Button>
                        {/each}
                      </div>
                    </div>

                  <!-- Step 3: Features -->
                  {:else if currentStep === 3}
                    <div class="space-y-6">
                      <div>
                        <h2 class="text-2xl font-semibold mb-2">Do you need any advanced features?</h2>
                        <p class="text-muted-foreground">Select all that apply (optional).</p>
                      </div>
                      
                      <div class="grid sm:grid-cols-2 gap-4">
                        {#each featureOptions as option}
                          <Button
                            variant={features.includes(option.id) ? 'default' : 'outline'}
                            class="h-auto py-6 px-4 flex flex-col items-start justify-start text-left hover:border-primary/50"
                            onclick={() => toggleFeature(option.id)}
                          >
                            <div class="flex items-start w-full mb-2">
                              <div class="flex-1">
                                <span class="font-medium text-base block">{option.label}</span>
                                <span class="text-sm text-muted-foreground">{option.description}</span>
                              </div>
                              <div class="w-5 h-5 rounded-full border-2 ml-4 mt-1 flex items-center justify-center flex-shrink-0">
                                {#if features.includes(option.id)}
                                  <div class="w-3 h-3 rounded-full bg-primary"></div>
                                {/if}
                              </div>
                            </div>
                            <div class="text-xs text-muted-foreground/70 mt-2">
                              +{formatCurrency(option.costUSD, 'USD')} 
                              {selectedCurrency === 'NGN' && ` (+${formatCurrency(convertToNGN(option.costUSD), 'NGN')})`}
                            </div>
                          </Button>
                        {/each}
                      </div>
                      
                      <div class="pt-4">
                        <Button 
                          onclick={nextStep}
                          class="w-full sm:w-auto gap-2"
                        >
                          Continue
                          <ArrowRight class="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                  <!-- Step 4: Designs -->
                  {:else if currentStep === 4}
                    <div class="space-y-6">
                      <div>
                        <h2 class="text-2xl font-semibold mb-2">Do you already have designs?</h2>
                        <p class="text-muted-foreground">Existing designs can reduce the overall cost.</p>
                      </div>
                      
                      <div class="grid gap-4">
                        {#each designOptions as option}
                          <Button
                            variant={hasDesigns === option.id ? 'default' : 'outline'}
                            class="h-auto py-6 px-4 justify-start text-left hover:border-primary/50"
                            onclick={() => selectDesigns(option.id as any)}
                          >
                            <div class="flex items-center w-full">
                              <div class="flex-1">
                                <span class="font-medium text-base block">{option.label}</span>
                                <span class="text-sm text-muted-foreground">{option.description}</span>
                              </div>
                              <ChevronRight class="w-4 h-4" />
                            </div>
                          </Button>
                        {/each}
                      </div>
                    </div>

                  <!-- Step 5: Timeline -->
                  {:else if currentStep === 5}
                    <div class="space-y-6">
                      <div>
                        <h2 class="text-2xl font-semibold mb-2">What's your timeline?</h2>
                        <p class="text-muted-foreground">Understanding urgency helps with planning.</p>
                      </div>
                      
                      <div class="grid gap-4">
                        {#each timelineOptions as option}
                          <Button
                            variant={timeline === option.id ? 'default' : 'outline'}
                            class="h-auto py-6 px-4 justify-start text-left hover:border-primary/50"
                            onclick={() => selectTimeline(option.id as Timeline)}
                          >
                            <div class="flex items-center w-full">
                              <Clock class="w-5 h-5 mr-4 text-muted-foreground" />
                              <div class="flex-1">
                                <span class="font-medium text-base block">{option.label}</span>
                                <span class="text-sm text-muted-foreground">{option.description}</span>
                              </div>
                              <ChevronRight class="w-4 h-4" />
                            </div>
                          </Button>
                        {/each}
                      </div>
                    </div>

                  <!-- Step 6: Budget -->
                  {:else if currentStep === 6}
                    <div class="space-y-6">
                      <div>
                        <h2 class="text-2xl font-semibold mb-2">What's your budget comfort range?</h2>
                        <p class="text-muted-foreground">This helps us match your expectations (optional, but helpful).</p>
                      </div>
                      
                      <div class="grid gap-4">
                        {#each budgetOptions as option}
                          <Button
                            variant={budget === option.id ? 'default' : 'outline'}
                            class="h-auto py-6 px-4 justify-start text-left hover:border-primary/50"
                            onclick={() => selectBudget(option.id as Budget)}
                          >
                            <div class="flex items-center w-full">
                              <div class="flex-1">
                                <span class="font-medium text-base block">{option.label}</span>
                                <span class="text-sm text-muted-foreground">{option.description}</span>
                              </div>
                              <ChevronRight class="w-4 h-4" />
                            </div>
                          </Button>
                        {/each}
                      </div>
                    </div>
                  {/if}
                </div>
              {/key}

              <!-- Navigation Buttons -->
              <div class="flex justify-between pt-8 border-t border-muted/30 mt-8">
                {#if currentStep > 1}
                  <Button variant="ghost" onclick={prevStep} class="gap-2">
                    <ArrowLeft class="w-4 h-4" />
                    Back
                  </Button>
                {:else}
                  <div></div>
                {/if}
                
                {#if currentStep === 3 || currentStep === 6}
                  <Button onclick={nextStep} class="gap-2 ml-auto">
                    {currentStep === 6 ? 'See Estimate' : 'Continue'}
                    <ArrowRight class="w-4 h-4" />
                  </Button>
                {/if}
              </div>
            </CardContent>
          </Card>
        {:else}
          <!-- Results Screen -->
          <Card class="border-muted/50">
            <CardContent class="p-6 md:p-8">
              <div class="space-y-8">
                <!-- Success Header -->
                <div class="text-center space-y-4">
                  <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Calculator class="w-8 h-8 text-primary" />
                  </div>
                  <h2 class="text-2xl font-semibold">Your Estimated Cost Range</h2>
                </div>

                <!-- Currency Toggle on Results -->
                <div class="flex justify-center">
                  <div class="inline-flex items-center bg-muted rounded-lg p-1">
                    <Button
                      variant={selectedCurrency === 'NGN' ? 'default' : 'ghost'}
                      size="sm"
                      onclick={() => selectedCurrency = 'NGN'}
                      class="gap-2 px-4"
                    >
                      <Globe class="w-4 h-4" />
                      NGN
                    </Button>
                    <Button
                      variant={selectedCurrency === 'USD' ? 'default' : 'ghost'}
                      size="sm"
                      onclick={() => selectedCurrency = 'USD'}
                      class="gap-2 px-4"
                    >
                      <DollarSign class="w-4 h-4" />
                      USD
                    </Button>
                  </div>
                </div>

                <!-- Cost Range Display -->
                <div class="text-center space-y-4">
                  <div class="inline-flex items-baseline justify-center gap-2">
                    <span class="text-5xl md:text-6xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      {formatCurrency(currentCostRange.min, selectedCurrency)}
                    </span>
                    <span class="text-2xl text-muted-foreground">–</span>
                    <span class="text-5xl md:text-6xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      {formatCurrency(currentCostRange.max, selectedCurrency)}
                    </span>
                  </div>
                  
                  <!-- Dual Currency Display -->
                  <div class="text-sm text-muted-foreground">
                    {#if selectedCurrency === 'USD'}
                      <p>
                        ≈ {formatCurrency(convertToNGN(currentCostRange.min), 'NGN')} – {formatCurrency(convertToNGN(currentCostRange.max), 'NGN')} in NGN
                      </p>
                    {:else}
                      <p>
                        ≈ {formatCurrency(costRangeUSD.min, 'USD')} – {formatCurrency(costRangeUSD.max, 'USD')} in USD
                      </p>
                    {/if}
                  </div>
                  
                  <p class="text-muted-foreground text-sm">
                    This is a rough estimate, not a final quote. Actual costs may vary based on specific requirements.
                  </p>
                </div>

                <!-- Cost Breakdown -->
                <div class="space-y-6">
                  <h3 class="text-xl font-semibold">Cost Breakdown</h3>
                  <div class="grid gap-4">
                    {#each costBreakdown as item}
                      <div class="flex items-center justify-between p-4 rounded-lg border border-muted/50 bg-card/50">
                        <div class="flex items-center gap-4">
                          {#if item.category === 'Design'}
                            <Palette class="w-5 h-5 text-blue-500" />
                          {:else if item.category === 'Development'}
                            <Layers class="w-5 h-5 text-emerald-500" />
                          {:else}
                            <Sparkles class="w-5 h-5 text-amber-500" />
                          {/if}
                          <div>
                            <div class="font-medium">{item.category}</div>
                            <div class="text-sm text-muted-foreground">{item.description}</div>
                          </div>
                        </div>
                        <Badge variant={item.impact === 'high' ? 'default' : item.impact === 'medium' ? 'outline' : 'secondary'}>
                          {item.impact === 'high' ? 'High Impact' : item.impact === 'medium' ? 'Medium Impact' : 'Low Impact'}
                        </Badge>
                      </div>
                    {/each}
                  </div>
                </div>

                <!-- Timeline Estimate -->
                <div class="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div class="flex items-center gap-3">
                    <Clock class="w-5 h-5 text-primary" />
                    <div>
                      <div class="font-medium">Estimated Timeline</div>
                      <div class="text-muted-foreground">Projects like this typically take {timelineEstimate} to complete</div>
                    </div>
                  </div>
                </div>

                <!-- Educational Insight -->
                <div class="space-y-4">
                  <h3 class="text-xl font-semibold">Why This Cost?</h3>
                  <div class="p-4 rounded-lg bg-card border border-muted/50">
                    <p class="text-muted-foreground mb-3">
                      Based on your selections, this estimate includes professional design (if needed), 
                      responsive development, and {features.length > 0 ? 'advanced features like ' + features.map(f => 
                        featureOptions.find(o => o.id === f)?.label).join(', ') : 'standard functionality'}.
                      The range accounts for potential scope changes and ensures quality delivery.
                    </p>
                    <p class="text-sm text-muted-foreground/70">
                      <strong>Note:</strong> {selectedCurrency === 'NGN' 
                        ? 'NGN estimates are based on current exchange rates and may vary.' 
                        : 'USD estimates are converted to NGN using current exchange rates.'}
                    </p>
                  </div>
                </div>

                <!-- Lead Capture -->
                <div class="space-y-6 pt-6 border-t border-muted/30">
                  <div class="text-center space-y-2">
                    <h3 class="text-xl font-semibold">Want a Detailed Proposal?</h3>
                    <p class="text-muted-foreground">Get an accurate quote and project plan from RyderTech.</p>
                  </div>

                  {#if !emailSubmitted}
                    <div class="space-y-4">
                      <div class="grid sm:grid-cols-2 gap-4">
                        <Button 
                          variant="outline" 
                          class="h-auto py-4 flex flex-col gap-2"
                          onclick={() => window.location.href = '/contact'}
                        >
                          <MessageSquare class="w-5 h-5" />
                          <div>
                            <div class="font-medium">Talk to RyderTech</div>
                            <div class="text-xs text-muted-foreground">Schedule a free consultation</div>
                          </div>
                        </Button>

                        <Button 
                          variant="outline"
                          class="h-auto py-4 flex flex-col gap-2"
                          onclick={() => {
                            document.getElementById('email-section')?.scrollIntoView({ behavior: 'smooth' });
                            document.getElementById('email-input')?.focus();
                          }}
                        >
                          <Mail class="w-5 h-5" />
                          <div>
                            <div class="font-medium">Save This Estimate</div>
                            <div class="text-xs text-muted-foreground">Get it via email in {selectedCurrency}</div>
                          </div>
                        </Button>
                      </div>

                      <div id="email-section" class="pt-4">
                        <div class="flex gap-2">
                          <input
                            id="email-input"
                            type="email"
                            placeholder="your@email.com"
                            bind:value={userEmail}
                            class="flex-1 px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                          <Button onclick={submitEmail} disabled={!userEmail.includes('@')}>
                            Send Estimate
                          </Button>
                        </div>
                        <p class="text-xs text-muted-foreground mt-2">
                          We'll send this estimate and keep you updated on new tools. No spam.
                        </p>
                      </div>
                    </div>
                  {:else}
                    <div class="text-center space-y-4 p-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <div class="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
                        <Sparkles class="w-6 h-6 text-emerald-500" />
                      </div>
                      <div>
                        <h4 class="font-semibold text-lg">Estimate Sent!</h4>
                        <p class="text-muted-foreground">
                          Check your inbox at {userEmail}. We've sent the estimate in {selectedCurrency}.
                        </p>
                      </div>
                    </div>
                  {/if}
                </div>

                <!-- Restart CTA -->
                <div class="text-center pt-4">
                  <Button variant="ghost" onclick={resetEstimator} class="gap-2">
                    <Calculator class="w-4 h-4" />
                    Start New Estimate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        {/if}
      </div>

      <!-- Sidebar / Info Panel -->
      <div class="space-y-6">
        <Card class="border-muted/50">
          <CardHeader>
            <CardTitle class="text-lg">How This Works</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span class="text-xs font-medium text-primary">1</span>
              </div>
              <div>
                <div class="font-medium">Answer Simple Questions</div>
                <div class="text-sm text-muted-foreground">Takes 2 minutes or less</div>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span class="text-xs font-medium text-primary">2</span>
              </div>
              <div>
                <div class="font-medium">Get AI-Powered Estimate</div>
                <div class="text-sm text-muted-foreground">Based on 50+ past projects</div>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span class="text-xs font-medium text-primary">3</span>
              </div>
              <div>
                <div class="font-medium">Save or Discuss</div>
                <div class="text-sm text-muted-foreground">Get detailed proposal if interested</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card class="border-muted/50">
          <CardHeader>
            <CardTitle class="text-lg">Currency Information</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="flex items-center gap-2">
              <Globe class="w-4 h-4 text-primary" />
              <span class="text-sm">Default: Nigerian Naira (₦)</span>
            </div>
            <div class="flex items-center gap-2">
              <RefreshCw class="w-4 h-4 text-primary" />
              <span class="text-sm">Switch between USD/NGN anytime</span>
            </div>
            <div class="flex items-center gap-2">
              <Calculator class="w-4 h-4 text-primary" />
              <span class="text-sm">Exchange rate: 1 USD = ₦{exchangeRate.toLocaleString()}</span>
            </div>
            <div class="text-xs text-muted-foreground pt-2 border-t border-muted/30">
              Rates updated regularly. Final quotes may vary based on market conditions.
            </div>
          </CardContent>
        </Card>

        <Card class="border-dashed border-2 border-muted/30 bg-transparent">
          <CardContent class="p-6">
            <div class="text-center space-y-3">
              <MessageSquare class="w-8 h-8 text-muted-foreground/50 mx-auto" />
              <div>
                <div class="font-medium text-muted-foreground/70">Need More Accuracy?</div>
                <p class="text-sm text-muted-foreground/60 mt-1">
                  This is a rough estimate. For detailed quotes in NGN or USD, talk to our team.
                </p>
              </div>
              <Button variant="outline" size="sm" onclick={() => window.location.href = '/contact'}>
                Schedule Consultation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Disclaimer Footer -->
    <div class="mt-12 pt-8 border-t border-muted/30">
      <p class="text-sm text-muted-foreground/70 text-center">
        <strong>Disclaimer:</strong> This tool provides rough estimates based on typical project scopes. 
        Final quotes may vary based on specific requirements, design complexity, and project timeline. 
        NGN estimates are calculated using current exchange rates and may fluctuate. 
        This is not a binding price quote. © {new Date().getFullYear()} RyderTech Labs.
      </p>
      <p class="text-xs text-muted-foreground/60 text-center mt-2">
        Exchange rate: 1 USD = ₦{exchangeRate.toLocaleString()} NGN (as of {new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })})
      </p>
    </div>
  </div>
</div>
