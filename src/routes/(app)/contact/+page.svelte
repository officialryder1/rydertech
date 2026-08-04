<script>
    import { supabase } from '$lib/supabaseClient';
    import { 
        Mail, Phone, MapPin, Send, Clock, MessageCircle,
        ArrowRight, CheckCircle, Star
    } from '@lucide/svelte';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Badge } from '$lib/components/ui/badge';
    import { fade } from 'svelte/transition';
    import { env } from '$env/dynamic/public';
    import emailjs from '@emailjs/browser';

    let formData = $state({
        name: '',
        email: '',
        company: '',
        budget: '',
        timeline: '',
        message: ''
    });

    let isSubmitting = $state(false);
    let submitted = $state(false);
    let error = $state(null)

    const testimonials = [
        {
            name: 'Chinwendu Kenneth',
            company: 'SOGCA',
            role: 'Admin',
            content: 'RyderTech transformed our entire digital infrastructure. Their web development team delivered a platform that increased our operational efficiency by 40%.',
            rating: 5
        },
        {
            name: 'Divine Favour',
            company: 'DbTravels',
            role: 'Founder & CEO',
            content: 'The travel booking platform developed by RyderTech has revolutionized our business. Our bookings have increased by 60% since launch!',
            rating: 5
        },
        {
            name: 'Fredrick Reuben',
            company: 'FindsNg',
            role: 'Founder & CTO',
            content: 'RyderTech delivered an exceptional e-commerce platform that perfectly aligned with our vision. It significantly boosted our online sales.',
            rating: 5
        },
        {
            name: 'Ani Emmanuel',
            company: 'therealmeglobal',
            role: 'CEO',
            content: 'RyderTech understood our brand and delivered a platform that truly represents who we are. Professional, fast, and reliable from start to finish.',
            rating: 5
        },
        {
            name: 'Prof Ken Nwakanma',
            company: 'UAAG',
            role: 'Founder',
            content: 'Working with RyderTech was seamless. They translated a complex vision into a clean, scalable product and supported us well beyond launch.',
            rating: 5
        },
        {
            name: 'Nancy Marcos',
            company: 'Reality Check with Nancy',
            role: 'CEO',
            content: 'Our new site looks incredible and performs even better. RyderTech nailed the brief and the engagement was a pleasure throughout.',
            rating: 5
        }
    ];

    async function handleSubmit(e) {
        e.preventDefault();
        isSubmitting = true;
        error = null;

        const serviceId = env.PUBLIC_EMAILJS_SERVICE_ID;
        const templateId = env.PUBLIC_EMAILJS_TEMPLATE_ID;
        const publicKey = env.PUBLIC_EMAILJS_PUBLIC_KEY;

        if (!serviceId || !templateId || !publicKey) {
            error = 'Email service is not configured. Please email us directly at rydertech.ng@gmail.com.';
            isSubmitting = false;
            return;
        }

        try {
            await emailjs.send(
                serviceId,
                templateId,
                {
                    from_name: formData.name,
                    from_email: formData.email,
                    company: formData.company,
                    budget: formData.budget,
                    timeline: formData.timeline,
                    message: formData.message
                },
                { publicKey }
            );

            // Best-effort backup copy in Supabase (non-blocking).
            supabase
                .from('contact_submissions')
                .insert([
                    {
                        name: formData.name,
                        email: formData.email,
                        company: formData.company,
                        budget: formData.budget,
                        timeline: formData.timeline,
                        message: formData.message,
                        submitted_at: new Date().toISOString(),
                        status: 'new'
                    }
                ])
                .then(({ error: supErr }) => {
                    if (supErr) console.warn('Supabase backup insert failed:', supErr);
                });

            submitted = true;

            // Reset form after success
            setTimeout(() => {
                submitted = false;
                formData = {
                    name: '',
                    email: '',
                    company: '',
                    budget: '',
                    timeline: '',
                    message: ''
                };
            }, 5000);
        } catch (err) {
            console.error('EmailJS submission error:', err);
            error = 'Failed to send message. Please try again or email us directly.';
        } finally {
            isSubmitting = false;
        }
    }
</script>

<svelte:head>
    <title>Contact Us - RyderTech | Get In Touch</title>
    <meta name="description" content="Get in touch with RyderTech for your software development needs. Let's discuss your project and create something amazing together." />
</svelte:head>

<div class="min-h-screen bg-background pt-32" transition:fade>
    <!-- Hero Section -->
    <section class="py-20 px-4">
        <div class="container mx-auto max-w-6xl text-center">
            <Badge variant="secondary" class="mb-4">Get In Touch</Badge>
            <h1 class="text-4xl md:text-6xl font-bold mb-6">
                Let's <span class="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">Build</span> Together
            </h1>
            <p class="text-xl text-muted-foreground max-w-3xl mx-auto">
                Ready to start your project? Contact us for a free consultation and let's discuss how we can help bring your ideas to life.
            </p>
        </div>
    </section>

    <!-- Contact Section -->
    <section class="py-20 px-4">
        <div class="container mx-auto max-w-6xl">
            <div class="grid lg:grid-cols-2 gap-12">
                <!-- Contact Form -->
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle class="text-2xl">Send us a Message</CardTitle>
                            <CardDescription>
                                Fill out the form below and we'll get back to you within 24 hours.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {#if submitted}
                                <div class="text-center py-8">
                                    <CheckCircle class="w-16 h-16 text-green-500 mx-auto mb-4" />
                                    <h3 class="text-xl font-bold mb-2">Message Sent!</h3>
                                    <p class="text-muted-foreground mb-4">
                                        Thank you for your message. We'll get back to you soon.
                                    </p>
                                    <Button on:click={() => submitted = false}>
                                        Send Another Message
                                    </Button>
                                </div>
                            {:else}
                                <form onsubmit={handleSubmit} class="space-y-6">
                                    <div class="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label for="name" class="block text-sm font-medium mb-2">Name *</label>
                                            <input
                                                id="name"
                                                type="text"
                                                bind:value={formData.name}
                                                required
                                                class="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="Your full name"
                                            />
                                        </div>
                                        <div>
                                            <label for="email" class="block text-sm font-medium mb-2">Email *</label>
                                            <input
                                                id="email"
                                                type="email"
                                                bind:value={formData.email}
                                                required
                                                class="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div class="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label for="company" class="block text-sm font-medium mb-2">Company</label>
                                            <input
                                                id="company"
                                                type="text"
                                                bind:value={formData.company}
                                                class="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="Your company"
                                            />
                                        </div>
                                        <div>
                                            <label for="budget" class="block text-sm font-medium mb-2">Budget</label>
                                            <select
                                                id="budget"
                                                bind:value={formData.budget}
                                                class="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="">Select budget range</option>
                                                <option 
                                                value="100h-500h">$100 - $500</option>
                                                <option 
                                                value="500h-1000k">$500 - $1000</option>
                                                <option 
                                                value="1k-10k">$1,000 - $10,000</option>
                                                <option value="10k-25k">$10,000 - $25,000</option>
                                                <option value="25k-50k">$25,000 - $50,000</option>
                                                <option value="50k+">$50,000+</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label for="timeline" class="block text-sm font-medium mb-2">Timeline</label>
                                        <select
                                            id="timeline"
                                            bind:value={formData.timeline}
                                            class="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        >
                                            <option value="">Select timeline</option>
                                            <option value="1-3 months">1-3 months</option>
                                            <option value="3-6 months">3-6 months</option>
                                            <option value="6-12 months">6-12 months</option>
                                            <option value="12+ months">12+ months</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label for="message" class="block text-sm font-medium mb-2">Project Details *</label>
                                        <textarea
                                            id="message"
                                            bind:value={formData.message}
                                            required
                                            rows="5"
                                            class="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="Tell us about your project..."
                                        ></textarea>
                                    </div>

                                    {#if error}
                                        <div class="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                                            {error}
                                        </div>
                                    {/if}

                                    <Button 
                                        type="submit" 
                                        class="w-full" 
                                        size="lg"
                                        disabled={isSubmitting}
                                    >
                                        {#if isSubmitting}
                                            <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                            Sending...
                                        {:else}
                                            <Send class="w-5 h-5 mr-2" />
                                            Send Message
                                        {/if}
                                    </Button>
                                </form>
                            {/if}
                        </CardContent>
                    </Card>
                </div>

                <!-- Contact Information -->
                <div class="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent class="space-y-4">
                            <div class="flex items-center space-x-4">
                                <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Mail class="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p class="font-semibold">Email</p>
                                    <a href="mailto:hello@rydertech.com" class="text-muted-foreground hover:text-primary">
                                        rydertech.ng@gmail.com
                                    </a>
                                </div>
                            </div>
                            <div class="flex items-center space-x-4">
                                <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Phone class="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p class="font-semibold">Phone</p>
                                    <a href="tel:+15551234567" class="text-muted-foreground hover:text-primary">
                                        +234 903 3147 769
                                    </a>
                                </div>
                            </div>
                            <div class="flex items-center space-x-4">
                                <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <MapPin class="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p class="font-semibold">Office</p>
                                    <p class="text-muted-foreground"> Jabi, Abuja</p>
                                </div>
                            </div>
                            <div class="flex items-center space-x-4">
                                <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Clock class="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p class="font-semibold">Response Time</p>
                                    <p class="text-muted-foreground">Within 24 hours</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Why Choose RyderTech?</CardTitle>
                        </CardHeader>
                        <CardContent class="space-y-3">
                            {#each [
                                'Free initial consultation',
                                'Detailed project proposal',
                                'Transparent pricing',
                                'Regular progress updates',
                                'Post-launch support'
                            ] as benefit}
                                <div class="flex items-center space-x-3">
                                    <CheckCircle class="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <span class="text-sm">{benefit}</span>
                                </div>
                            {/each}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Connect</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div class="space-y-3">
                                <a href="https://calendly.com/rydertech/consultation" target="_blank" class="w-full">
                                    <Button variant="outline" class="w-full justify-start">
                                        <MessageCircle class="w-4 h-4 mr-2" />
                                        Schedule a Call
                                    </Button>
                                </a>
                                <a href="/services" class="w-full">
                                    <Button variant="outline" class="w-full justify-start">
                                        <ArrowRight class="w-4 h-4 mr-2" />
                                        View Services
                                    </Button>
                                </a>
                                <a href="/work" class="w-full">
                                    <Button variant="outline" class="w-full justify-start">
                                        <ArrowRight class="w-4 h-4 mr-2" />
                                        See Our Work
                                    </Button>
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    </section>

    <!-- Testimonials Section -->
    <section class="py-20 px-4 bg-linear-to-br from-gray-50 to-white">
        <div class="container mx-auto max-w-6xl">
            <div class="text-center mb-16">
                <Badge variant="secondary" class="mb-4">Client Love</Badge>
                <h2 class="text-4xl md:text-5xl font-bold mb-4">
                    What Our <span class="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">Clients Say</span>
                </h2>
                <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Businesses across Nigeria trust RyderTech to build the systems that move them forward.
                </p>
            </div>

            <div class="grid md:grid-cols-3 gap-8">
                {#each testimonials as t}
                    <Card class="hover:shadow-xl transition-shadow duration-300">
                        <CardContent class="pt-6">
                            <div class="flex items-center space-x-1 mb-4 text-yellow-400">
                                {#each Array(t.rating) as _}
                                    <Star class="w-4 h-4 fill-current" />
                                {/each}
                            </div>
                            <p class="text-muted-foreground mb-6 italic">"{t.content}"</p>
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    <span class="font-bold text-primary">{t.name.charAt(0)}</span>
                                </div>
                                <div>
                                    <p class="font-semibold text-sm">{t.name}</p>
                                    <p class="text-xs text-muted-foreground">{t.role}, {t.company}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                {/each}
            </div>

            <div class="text-center mt-12">
                <a href="/reviews" class="text-primary font-semibold hover:underline">
                    Read more reviews <ArrowRight class="w-4 h-4 inline" />
                </a>
            </div>
        </div>
    </section>
</div>