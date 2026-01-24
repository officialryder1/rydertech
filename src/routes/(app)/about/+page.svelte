<script>
    import { 
        Users, Target, Eye, Heart, Award, Clock,
        ArrowRight, Mail, MessageCircle
    } from '@lucide/svelte';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardDescription, CardTitle } from '$lib/components/ui/card';
    import { Badge } from '$lib/components/ui/badge';

    const team = [
        {
            name: 'Official Ryder',
            role: 'Founder & CEO',
            bio: '6+ years in software development and business strategy.',
            image: '/api/placeholder/200/200'
        },
        {
            name: 'VIctor Onourah',
            role: 'Lead Developer',
            bio: 'Full-stack developer specializing in modern web technologies.',
            image: '/api/placeholder/200/200'
        },
        {
            name: 'Mike james',
            role: 'Mobile Specialist',
            bio: 'Cross-platform mobile development expert.',
            image: '/api/placeholder/200/200'
        },
        {
            name: 'Unstoppqble',
            role: 'UX/UI Designer',
            bio: 'Creating intuitive and beautiful user experiences.',
            image: '/api/placeholder/200/200'
        }
    ];

    const values = [
        {
            icon: Target,
            title: 'Excellence',
            description: 'We strive for perfection in every project we undertake.'
        },
        {
            icon: Heart,
            title: 'Passion',
            description: 'We love what we do and it shows in our work.'
        },
        {
            icon: Users,
            title: 'Collaboration',
            description: 'We work closely with our clients as partners.'
        },
        {
            icon: Eye,
            title: 'Innovation',
            description: 'We stay ahead of technology trends and best practices.'
        }
    ];
</script>

<svelte:head>
    <title>About Us - RyderTech | Our Story & Team</title>
    <meta name="description" content="Learn about RyderTech's mission, values, and the talented team behind our successful software development projects." />
</svelte:head>

<div class="min-h-screen bg-background pt-32">
    <!-- Hero Section -->
    <section class="py-20 px-4">
        <div class="container mx-auto max-w-6xl">
            <div class="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                    <Badge variant="secondary" class="mb-4">Our Story</Badge>
                    <h1 class="text-4xl md:text-6xl font-bold mb-6">
                        Building <span class="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Digital</span> Futures
                    </h1>
                    <p class="text-xl text-muted-foreground mb-8 leading-relaxed">
                        RyderTech was founded with a simple mission: to deliver exceptional software solutions 
                        that drive business growth and create meaningful digital experiences.
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4">
                        <a href="/contact">
                            <Button size="lg" class="text-lg px-8">
                                Get In Touch
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
                <div class="grid grid-cols-2 gap-4">
                    <Card class="p-6 text-center">
                        <Award class="w-12 h-12 text-primary mx-auto mb-4" />
                        <h3 class="text-2xl font-bold mb-2">50+</h3>
                        <p class="text-muted-foreground">Projects Completed</p>
                    </Card>
                    <Card class="p-6 text-center">
                        <Users class="w-12 h-12 text-primary mx-auto mb-4" />
                        <h3 class="text-2xl font-bold mb-2">30+</h3>
                        <p class="text-muted-foreground">Happy Clients</p>
                    </Card>
                    <Card class="p-6 text-center">
                        <Clock class="w-12 h-12 text-primary mx-auto mb-4" />
                        <h3 class="text-2xl font-bold mb-2">5+</h3>
                        <p class="text-muted-foreground">Years Experience</p>
                    </Card>
                    <Card class="p-6 text-center">
                        <Target class="w-12 h-12 text-primary mx-auto mb-4" />
                        <h3 class="text-2xl font-bold mb-2">99%</h3>
                        <p class="text-muted-foreground">Success Rate</p>
                    </Card>
                </div>
            </div>
        </div>
    </section>

    <!-- Values Section -->
    <section class="py-20 px-4 bg-muted/30">
        <div class="container mx-auto max-w-6xl">
            <div class="text-center mb-16">
                <Badge variant="outline" class="mb-4">Our Values</Badge>
                <h2 class="text-3xl md:text-4xl font-bold mb-4">What Drives Us</h2>
                <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Our core values guide everything we do, from project planning to final delivery.
                </p>
            </div>
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {#each values as value}
                    <Card class="text-center p-6 hover:shadow-lg transition-shadow duration-300">
                        <value.icon class="w-12 h-12 text-primary mx-auto mb-4" />
                        <CardTitle class="text-xl mb-3">{value.title}</CardTitle>
                        <CardDescription>{value.description}</CardDescription>
                    </Card>
                {/each}
            </div>
        </div>
    </section>

    <!-- Team Section -->
    <section class="py-20 px-4">
        <div class="container mx-auto max-w-6xl">
            <div class="text-center mb-16">
                <Badge variant="outline" class="mb-4">Our Team</Badge>
                <h2 class="text-3xl md:text-4xl font-bold mb-4">Meet the Experts</h2>
                <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Talented professionals dedicated to delivering exceptional results.
                </p>
            </div>
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {#each team as member}
                    <Card class="text-center p-6 hover:shadow-lg transition-shadow duration-300">
                        <img 
                            src={member.image} 
                            alt={member.name}
                            class="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                        />
                        <CardTitle class="text-lg mb-2">{member.name}</CardTitle>
                        <Badge variant="secondary" class="mb-3">{member.role}</Badge>
                        <CardDescription class="text-sm">{member.bio}</CardDescription>
                    </Card>
                {/each}
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 px-4 bg-linear-to-br from-primary via-accent to-[var(--primary-dark)] text-white ">
        <div class="container mx-auto max-w-4xl text-center">
            <h2 class="text-3xl md:text-4xl font-bold mb-6">Ready to Work With Us?</h2>
            <p class="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Join the growing list of businesses that trust RyderTech with their digital transformation.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/contact">
                    <Button variant="secondary" size="lg" class="text-lg">
                        <MessageCircle class="w-5 h-5 mr-2" />
                        Start Conversation
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