<script>
    import { onMount } from 'svelte';
    import { ExternalLink, Github, ArrowRight, Filter, Eye } from '@lucide/svelte';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Badge } from '$lib/components/ui/badge';

    const projects = [
        {
            title: 'E-Commerce Platform',
            description: 'A full-featured online store with inventory management, payment processing, and customer analytics.',
            image: '/api/placeholder/600/400',
            category: 'Web Development',
            technologies: ['SvelteKit', 'Node.js', 'PostgreSQL', 'Stripe'],
            liveUrl: '#',
            githubUrl: '#',
            featured: true
        },
        {
            title: 'Mobile Banking App',
            description: 'Secure mobile banking application with biometric authentication and real-time transactions.',
            image: '/api/placeholder/600/400',
            category: 'Mobile Development',
            technologies: ['React Native', 'Firebase', 'Plaid API', 'AWS'],
            liveUrl: '#',
            githubUrl: '#',
            featured: true
        },
        {
            title: 'Healthcare Management System',
            description: 'Comprehensive healthcare platform for patient records, appointments, and telemedicine.',
            image: '/api/placeholder/600/400',
            category: 'Custom Software',
            technologies: ['React', 'Python', 'MongoDB', 'Docker'],
            liveUrl: '#',
            githubUrl: '#',
            featured: false
        },
        {
            title: 'Real Estate Platform',
            description: 'Property listing and management system with virtual tours and AI-powered recommendations.',
            image: '/api/placeholder/600/400',
            category: 'Web Development',
            technologies: ['Vue.js', 'Laravel', 'MySQL', 'AWS'],
            liveUrl: '#',
            githubUrl: '#',
            featured: false
        },
        {
            title: 'Fitness Tracking App',
            description: 'Cross-platform fitness app with workout plans, progress tracking, and social features.',
            image: '/api/placeholder/600/400',
            category: 'Mobile Development',
            technologies: ['Flutter', 'Node.js', 'MongoDB', 'Google Fit'],
            liveUrl: '#',
            githubUrl: '#',
            featured: false
        },
        {
            title: 'Supply Chain Management',
            description: 'Enterprise supply chain solution with inventory optimization and logistics tracking.',
            image: '/api/placeholder/600/400',
            category: 'Custom Software',
            technologies: ['Angular', 'Java', 'Oracle', 'Azure'],
            liveUrl: '#',
            githubUrl: '#',
            featured: false
        }
    ];

    const categories = ['All', 'Web Development', 'Mobile Development', 'Custom Software'];
    let activeCategory = $state('All');
    let filteredProjects = $state(projects);

    function filterProjects(category) {
        activeCategory = category;
        if (category === 'All') {
            filteredProjects = projects;
        } else {
            filteredProjects = projects.filter(project => project.category === category);
        }
    }
</script>

<svelte:head>
    <title>Our Work - RyderTech | Portfolio & Case Studies</title>
    <meta name="description" content="Explore RyderTech's portfolio of successful projects including web applications, mobile apps, and custom software solutions." />
</svelte:head>

<div class="min-h-screen bg-background pt-32">
    <!-- Hero Section -->
    <section class="py-20 px-4">
        <div class="container mx-auto max-w-6xl text-center">
            <Badge variant="secondary" class="mb-4">Our Portfolio</Badge>
            <h1 class="text-4xl md:text-6xl font-bold mb-6">
                Featured <span class="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Projects</span>
            </h1>
            <p class="text-xl text-muted-foreground max-w-3xl mx-auto">
                Discover how we've helped businesses transform their ideas into successful digital products.
            </p>
        </div>
    </section>

    <!-- Filter Section -->
    <section class="py-8 px-4 bg-muted/30">
        <div class="container mx-auto max-w-6xl">
            <div class="flex flex-wrap justify-center gap-4">
                {#each categories as category}
                    <Button
                        variant={activeCategory === category ? "default" : "outline"}
                        onclick={() => filterProjects(category)}
                        class="flex items-center gap-2"
                    >
                        {#if activeCategory === category}
                            <Filter class="w-4 h-4" />
                        {/if}
                        {category}
                    </Button>
                {/each}
            </div>
        </div>
    </section>

    <!-- Projects Grid -->
    <section class="py-20 px-4">
        <div class="container mx-auto max-w-6xl">
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {#each filteredProjects as project}
                    <Card class="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <div class="relative overflow-hidden">
                            <img 
                                src={project.image} 
                                alt={project.title}
                                class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {#if project.featured}
                                <Badge class="absolute top-3 left-3 bg-primary">Featured</Badge>
                            {/if}
                            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                                <Button size="sm" variant="secondary">
                                    <Eye class="w-4 h-4 mr-2" />
                                    View Details
                                </Button>
                            </div>
                        </div>
                        <CardHeader>
                            <CardTitle class="text-xl">{project.title}</CardTitle>
                            <CardDescription>{project.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div class="flex flex-wrap gap-2 mb-4">
                                {#each project.technologies as tech}
                                    <Badge variant="outline" class="text-xs">{tech}</Badge>
                                {/each}
                            </div>
                            <div class="flex gap-3">
                                {#if project.liveUrl}
                                    <a href={project.liveUrl} target="_blank" class="flex-1">
                                        <Button variant="outline" size="sm" class="w-full">
                                            <ExternalLink class="w-4 h-4 mr-2" />
                                            Live Demo
                                        </Button>
                                    </a>
                                {/if}
                                {#if project.githubUrl}
                                    <a href={project.githubUrl} target="_blank" class="flex-1">
                                        <Button variant="outline" size="sm" class="w-full">
                                            <Github class="w-4 h-4 mr-2" />
                                            Code
                                        </Button>
                                    </a>
                                {/if}
                            </div>
                        </CardContent>
                    </Card>
                {/each}
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 px-4 bg-gradient-to-br from-[var(--primary)] via-[var(--accent)] to-[var(--primary-dark)] text-white">
        <div class="container mx-auto max-w-4xl text-center">
            <h2 class="text-3xl md:text-4xl font-bold mb-6">Have a Project in Mind?</h2>
            <p class="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Let's work together to bring your vision to life with our expert development services.
            </p>
            <a href="/contact">
                <Button variant="secondary" size="lg" class="text-lg">
                    Start Your Project
                    <ArrowRight class="w-5 h-5 ml-2" />
                </Button>
            </a>
        </div>
    </section>
</div>