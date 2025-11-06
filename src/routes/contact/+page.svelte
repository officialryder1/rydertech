<script>
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
    import { 
        Mail, Phone, MapPin, Send, Clock, MessageCircle,
        ArrowRight, CheckCircle
    } from '@lucide/svelte';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Badge } from '$lib/components/ui/badge';

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

    async function handleSubmit(e) {
        e.preventDefault();
        isSubmitting = true;
        error = null

        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        submitted = true;
        isSubmitting = false;

        try {
            const { data, error: supabaseError } = await supabase
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
                .select()

                if (supabaseError) throw supabaseError;

                submitted = true;

                // Send Email Notification
                // await sendEmailNotification(formData);

        } catch (err) {
            console.error('Form submission error:', err);
            error = 'Failed to send message. Please try again.'
        } finally {
            isSubmitting = false;
        }

        // async function sendEmailNotification(formData) {
        //     // integrate with supabase Edge function 
        //     const {error} = await supabase
        //         .from('email_notifications')
        //         .insert([
        //             {
        //                 to_email: 'rydertech.ng@gmail.com',
        //                 subject: `New Contact Form Submission from ${formData.name}`,
        //                 template: 'contact_form',
        //                 data: formData,
        //                 status: 'pending'
        //             }
        //         ])
        // }

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
    }
</script>

<svelte:head>
    <title>Contact Us - RyderTech | Get In Touch</title>
    <meta name="description" content="Get in touch with RyderTech for your software development needs. Let's discuss your project and create something amazing together." />
</svelte:head>

<div class="min-h-screen bg-background pt-32">
    <!-- Hero Section -->
    <section class="py-20 px-4">
        <div class="container mx-auto max-w-6xl text-center">
            <Badge variant="secondary" class="mb-4">Get In Touch</Badge>
            <h1 class="text-4xl md:text-6xl font-bold mb-6">
                Let's <span class="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Build</span> Together
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
                                        hello@rydertech.com
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
                                        +1 (555) 123-4567
                                    </a>
                                </div>
                            </div>
                            <div class="flex items-center space-x-4">
                                <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <MapPin class="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p class="font-semibold">Office</p>
                                    <p class="text-muted-foreground">San Francisco, CA</p>
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
</div>