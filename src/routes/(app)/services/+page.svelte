<script>
    import { 
        Globe, Smartphone, Database, Cloud, Shield, Code,
        CheckCircle, ArrowRight, Zap, Users,
        MessageCircle, Mail
    } from '@lucide/svelte';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Badge } from '$lib/components/ui/badge';
    import { fade } from 'svelte/transition';

    const services = [
        {
            icon: Globe,
            title: 'Web Development',
            description: 'Custom web applications built with modern technologies like SvelteKit, React, and Node.js.',
            features: ['Responsive Design', 'SEO Optimized', 'Fast Performance', 'Modern Frameworks'],
            price: 'From $500 / ₦500,000',
            timeline: '4-8 weeks',
            projects: '50+ completed'
        },
        {
            icon: Smartphone,
            title: 'Mobile Apps',
            description: 'Cross-platform mobile applications for iOS and Android using React Native and Flutter.',
            features: ['Native Performance', 'Offline Capability', 'App Store Ready', 'Push Notifications'],
            price: 'From $700 / ₦1,000,000',
            timeline: '6-12 weeks',
            projects: '30+ completed'
        },
        {
            icon: Database,
            title: 'Backend Systems',
            description: 'Scalable server architecture, APIs, and database solutions for your business needs.',
            features: ['RESTful APIs', 'Microservices', 'Database Design', 'API Documentation'],
            price: 'From $600 / ₦700,000',
            timeline: '4-10 weeks',
            projects: '40+ completed'
        },
        {
            icon: Cloud,
            title: 'Cloud Solutions',
            description: 'Deployment, migration, and management of cloud infrastructure on AWS, Azure, and Google Cloud.',
            features: ['Cloud Migration', 'DevOps', 'Serverless Architecture', 'Auto Scaling'],
            price: 'From 1,000 / ₦1,200,000',
            timeline: '2-6 weeks',
            projects: '35+ completed'
        },
        {
            icon: Shield,
            title: 'Security & Compliance',
            description: 'Enterprise-grade security solutions and compliance frameworks for your applications.',
            features: ['Security Audits', 'GDPR Compliance', 'Data Protection', 'Penetration Testing'],
            price: 'From $1,000 / ₦1,500,000',
            timeline: '2-4 weeks',
            projects: '25+ completed'
        },
        {
            icon: Code,
            title: 'Custom Software',
            description: 'Tailored software solutions designed to solve your unique business challenges.',
            features: ['Custom Workflows', 'Integration', 'Maintenance', 'Technical Support'],
            price: 'Custom Quote',
            timeline: 'Varies',
            projects: '60+ completed'
        }
    ];

    const process = [
        {
            step: '01',
            title: 'Discovery & Planning',
            description: 'We analyze your requirements and create a detailed project plan.',
            icon: Users
        },
        {
            step: '02',
            title: 'Design & Prototyping',
            description: 'Create wireframes and prototypes to visualize your solution.',
            icon: Code
        },
        {
            step: '03',
            title: 'Development',
            description: 'Agile development with regular updates and feedback sessions.',
            icon: Zap
        },
        {
            step: '04',
            title: 'Testing & Quality',
            description: 'Comprehensive testing to ensure quality and performance.',
            icon: CheckCircle
        },
        {
            step: '05',
            title: 'Deployment',
            description: 'Smooth deployment and launch of your application.',
            icon: Cloud
        },
        {
            step: '06',
            title: 'Support & Maintenance',
            description: 'Ongoing support and maintenance services.',
            icon: Shield
        }
    ];
</script>

<svelte:head>
    <title>Our Services - RyderTech | Web, Mobile & Cloud Development</title>
    <meta name="description" content="Explore RyderTech's comprehensive software development services including web development, mobile apps, cloud solutions, and custom software." />
</svelte:head>

<div class="min-h-screen bg-background pt-32" transition:fade>
    <!-- Hero Section -->
    <section class="py-20 px-4">
        <div class="container mx-auto max-w-6xl text-center">
            <Badge variant="secondary" class="mb-4">Our Services</Badge>
            <h1 class="text-4xl md:text-6xl font-bold mb-6">
                Comprehensive <span class="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">Development</span> Services
            </h1>
            <p class="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                We offer end-to-end software development solutions tailored to your business needs. 
                From concept to deployment, we're with you every step of the way.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/contact">
                    <Button size="lg" class="text-lg px-8 text-white">
                        Start Your Project
                        <ArrowRight class="w-5 h-5 ml-2" />
                    </Button>
                </a>
                <a href="/work">
                    <Button variant="outline" size="lg" class="text-lg px-8">
                        View Our Work
                    </Button>
                </a>
            </div>
        </div>
    </section>

    <!-- Services Grid -->
    <section class="py-20 px-4 bg-muted/30">
        <div class="container mx-auto max-w-6xl">
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {#each services as service}
                    <Card class="group hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                        <CardHeader class="pb-4">
                            <div class="p-3 bg-primary/10 rounded-lg w-fit group-hover:scale-110 transition-transform duration-300 mb-4">
                                <service.icon class="w-6 h-6 text-primary" />
                            </div>
                            <CardTitle class="text-xl">{service.title}</CardTitle>
                            <CardDescription class="text-base mt-2">{service.description}</CardDescription>
                        </CardHeader>
                        <CardContent class="flex-1 flex flex-col">
                            <ul class="space-y-2 mb-6 flex-1">
                                {#each service.features as feature}
                                    <li class="flex items-center text-sm text-muted-foreground">
                                        <CheckCircle class="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                        {feature}
                                    </li>
                                {/each}
                            </ul>
                            <div class="space-y-3 pt-4 border-t">
                                <div class="flex justify-between text-sm">
                                    <span class="text-muted-foreground">Starting at</span>
                                    <span class="font-semibold text-primary">{service.price}</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-muted-foreground">Timeline</span>
                                    <span>{service.timeline}</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-muted-foreground">Projects</span>
                                    <span>{service.projects}</span>
                                </div>
                            </div>
                            <a href="/contact" class="w-full mt-4">
                                <Button variant="outline" class="w-full">
                                    Get Quote
                                    <ArrowRight class="w-4 h-4 ml-2" />
                                </Button>
                            </a>
                        </CardContent>
                    </Card>
                {/each}
            </div>
        </div>
    </section>

    <!-- Process Section -->
    <section class="py-20 px-4">
        <div class="container mx-auto max-w-6xl">
            <div class="text-center mb-16">
                <Badge variant="outline" class="mb-4">Our Process</Badge>
                <h2 class="text-3xl md:text-4xl font-bold mb-4">How We Work</h2>
                <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Our proven development process ensures quality, transparency, and successful project delivery.
                </p>
            </div>

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {#each process as step}
                    <div class="text-center group">
                        <div class="relative mb-6">
                            <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                                <step.icon class="w-8 h-8 text-primary" />
                            </div>
                            <div class="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                                {step.step}
                            </div>
                        </div>
                        <h3 class="text-xl font-bold mb-3">{step.title}</h3>
                        <p class="text-muted-foreground">{step.description}</p>
                    </div>
                {/each}
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 px-4 bg-primary text-white">
        <div class="container mx-auto max-w-4xl text-center">
            <h2 class="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Project?</h2>
            <p class="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Let's discuss your project requirements and create a custom solution that drives your business forward.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/contact">
                    <Button variant="secondary" size="lg" class="text-lg">
                        <MessageCircle class="w-5 h-5 mr-2" />
                        Schedule Call
                    </Button>
                </a>
                <a href="mailto:hello@rydertech.com">
                    <Button variant="outline" size="lg" class="text-lg bg-transparent border-white text-white hover:bg-white hover:text-primary">
                        <Mail class="w-5 h-5 mr-2" />
                        Send Email
                    </Button>
                </a>
            </div>
        </div>
    </section>
</div>