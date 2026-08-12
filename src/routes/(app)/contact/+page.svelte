<script>
    import { page } from '$app/stores';
    import { supabase } from '$lib/supabaseClient';
    import {
        Mail, Phone, MapPin, Send, Clock, MessageCircle, CalendarDays,
        ArrowRight, CheckCircle, Star
    } from '@lucide/svelte';

    // WhatsApp brand icon (not in this lucide version — inline SVG, same as WhatsAppFloat).
    const WhatsAppIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="h-5 w-5 fill-current" aria-hidden="true"><path d="M16.02 3.2c-7.08 0-12.82 5.74-12.82 12.82 0 2.26.6 4.46 1.73 6.4L3.2 28.8l6.5-1.7a12.78 12.78 0 0 0 6.32 1.62h.01c7.07 0 12.81-5.74 12.81-12.82 0-3.42-1.33-6.64-3.75-9.06A12.74 12.74 0 0 0 16.02 3.2zm0 23.28h-.01a10.69 10.69 0 0 1-5.45-1.49l-.39-.23-3.86 1.01 1.03-3.76-.25-.39a10.65 10.65 0 0 1-1.63-5.66c0-5.92 4.82-10.74 10.75-10.74 2.87 0 5.57 1.12 7.6 3.15a10.68 10.68 0 0 1 3.15 7.6c0 5.92-4.82 10.74-10.74 10.74zm5.89-8.02c-.32-.16-1.9-.94-2.2-1.05-.3-.11-.51-.16-.73.16-.21.32-.83 1.05-1.02 1.26-.19.21-.38.24-.7.08-.32-.16-1.36-.5-2.59-1.6-.96-.86-1.6-1.92-1.79-2.24-.19-.32-.02-.49.14-.65.14-.14.32-.38.48-.57.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.73-1.76-1-2.41-.26-.63-.53-.55-.73-.56-.19-.01-.4-.01-.62-.01a1.19 1.19 0 0 0-.86.4c-.3.32-1.13 1.1-1.13 2.69 0 1.58 1.16 3.11 1.32 3.33.16.21 2.27 3.47 5.5 4.86.77.33 1.37.53 1.84.68.77.25 1.48.21 2.03.13.62-.09 1.9-.78 2.17-1.53.27-.75.27-1.39.19-1.53-.08-.13-.29-.21-.61-.37z"/></svg>`;
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Badge } from '$lib/components/ui/badge';
    import { fade } from 'svelte/transition';
    import { env } from '$env/dynamic/public';
    import emailjs from '@emailjs/browser';

    // Which tool the lead came from (tools link with ?tool=ops-drain etc.)
    const toolLabels = {
        'ops-drain': 'Ops Drain Calculator',
        'revleak': 'RevLeak Auditor',
        'event-access-risk': 'Event Access Risk Scanner'
    };
    const tool = $derived($page.url.searchParams.get('tool') ?? '');
    const toolLabel = $derived(toolLabels[tool] ?? 'free tools');

    // WhatsApp is the reliable instant channel (confirmed working).
    const waPhone = '2349033147769';
    const waMessage = $derived(
        `Hi Victor — I just tried your ${toolLabel} and want to talk about the fix. Can we do a quick 15-min scoping call?`
    );
    const waUrl = $derived(`https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}`);

    // Calendar CTA auto-activates when owner sets PUBLIC_BOOKING_URL (e.g. Calendly).
    const bookingUrl = env.PUBLIC_BOOKING_URL;

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
            error = 'Email service is not configured. Please chat us on WhatsApp or email rydertech.ng@gmail.com directly.';
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
                    message: formData.message,
                    lead_source: tool ? `contact?tool=${tool}` : 'contact'
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
                        lead_source: tool ? `contact?tool=${tool}` : 'contact',
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
            error = 'Failed to send message. Please try WhatsApp or email us directly at rydertech.ng@gmail.com.';
        } finally {
            isSubmitting = false;
        }
    }
</script>

<svelte:head>
    <title>Book a Free Scoping Call - RyderTech</title>
    <meta name="description" content="Book a free 15-minute scoping call with RyderTech. Turn your ops drag, slow site, or event risk into a concrete build plan — WhatsApp reply in under 2 hours." />
</svelte:head>

<div class="min-h-screen bg-background pt-32" transition:fade>
    <!-- Hero Section -->
    <section class="py-16 px-4">
        <div class="container mx-auto max-w-6xl text-center">
            <Badge variant="secondary" class="mb-4">Free 15-Minute Scoping Call</Badge>
            <h1 class="text-4xl md:text-6xl font-bold mb-6">
                Let's Turn That Into a <span class="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">Plan</span>
            </h1>
            <p class="text-xl text-muted-foreground max-w-3xl mx-auto">
                {#if tool}
                    You ran the {toolLabel}. Book a call and we'll map the exact fix — no deck, just the numbers and a build quote.
                {:else}
                    Tell us where the drag is — manual processes, a slow site, or an event gate — and we'll scope the fix on a free 15-minute call.
                {/if}
            </p>
        </div>
    </section>

    <!-- Instant Book Band -->
    <section class="px-4 -mt-4">
        <div class="container mx-auto max-w-4xl">
            <Card class="border-primary/20 bg-primary/5">
                <CardContent class="py-6">
                    <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a href={waUrl} target="_blank" rel="noopener noreferrer" class="w-full sm:w-auto">
                            <Button size="lg" class="w-full gap-2 bg-[#25D366] hover:bg-[#1ebe5b] text-white">
                                {@html WhatsAppIcon}
                                Chat on WhatsApp
                            </Button>
                        </a>
                        {#if bookingUrl}
                            <a href={bookingUrl} target="_blank" rel="noopener noreferrer" class="w-full sm:w-auto">
                                <Button size="lg" variant="outline" class="w-full gap-2">
                                    <CalendarDays class="h-5 w-5" />
                                    Schedule on Calendar
                                </Button>
                            </a>
                        {/if}
                    </div>
                    <p class="text-center text-sm text-muted-foreground mt-3">
                        Average first reply: <strong>under 2 hours</strong> on WhatsApp · or pick a slot on the calendar.
                    </p>
                </CardContent>
            </Card>
        </div>
    </section>

    <!-- Contact Section -->
    <section class="py-16 px-4">
        <div class="container mx-auto max-w-6xl">
            <div class="grid lg:grid-cols-2 gap-12">
                <!-- Contact Form -->
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle class="text-2xl">Or Send Project Details</CardTitle>
                            <CardDescription>
                                Prefer email? Fill this out and we'll get back within 24 hours — or WhatsApp us for an instant reply.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {#if submitted}
                                <div class="text-center py-8">
                                    <CheckCircle class="w-16 h-16 text-green-500 mx-auto mb-4" />
                                    <h3 class="text-xl font-bold mb-2">Message Sent!</h3>
                                    <p class="text-muted-foreground mb-4">
                                        Thanks — we'll reply within 24 hours. For a faster answer, WhatsApp Victor directly.
                                    </p>
                                    <div class="flex flex-col sm:flex-row gap-3 justify-center">
                                        <a href={waUrl} target="_blank" rel="noopener noreferrer">
                                            <Button class="gap-2 bg-[#25D366] hover:bg-[#1ebe5b] text-white">
                                            {@html WhatsAppIcon} WhatsApp instead
                                            </Button>
                                        </a>
                                        <Button variant="outline" on:click={() => submitted = false}>
                                            Send Another
                                        </Button>
                                    </div>
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
                                            <label for="budget" class="block text-sm font-medium mb-2">Budget (₦)</label>
                                            <select
                                                id="budget"
                                                bind:value={formData.budget}
                                                class="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="">Select budget range</option>
                                                <option value="150k-500k">₦150k - ₦500k</option>
                                                <option value="500k-1.5m">₦500k - ₦1.5M</option>
                                                <option value="1.5m-5m">₦1.5M - ₦5M</option>
                                                <option value="5m-15m">₦5M - ₦15M</option>
                                                <option value="15m+">₦15M+</option>
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
                                            <option value="asap">ASAP (this month)</option>
                                            <option value="1-3 months">1-3 months</option>
                                            <option value="3-6 months">3-6 months</option>
                                            <option value="6-12 months">6-12 months</option>
                                            <option value="exploring">Just exploring</option>
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
                                    {@html WhatsAppIcon}
                                </div>
                                <div>
                                    <p class="font-semibold">WhatsApp</p>
                                    <a href={waUrl} target="_blank" rel="noopener" class="text-muted-foreground hover:text-primary">
                                        +234 903 314 7769
                                    </a>
                                </div>
                            </div>
                            <div class="flex items-center space-x-4">
                                <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Mail class="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p class="font-semibold">Email</p>
                                    <a href="mailto:rydertech.ng@gmail.com" class="text-muted-foreground hover:text-primary">
                                        rydertech.ng@gmail.com
                                    </a>
                                </div>
                            </div>
                            <div class="flex items-center space-x-4">
                                <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Phone class="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p class="font-semibold">Call</p>
                                    <a href="tel:+2349033147769" class="text-muted-foreground hover:text-primary">
                                        +234 903 314 7769
                                    </a>
                                </div>
                            </div>
                            <div class="flex items-center space-x-4">
                                <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <MapPin class="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p class="font-semibold">Office</p>
                                    <p class="text-muted-foreground">Jabi, Abuja</p>
                                </div>
                            </div>
                            <div class="flex items-center space-x-4">
                                <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Clock class="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p class="font-semibold">Response Time</p>
                                    <p class="text-muted-foreground">Under 2 hours on WhatsApp</p>
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
                                'Free 15-min scoping call',
                                'Fixed-price quote in 24h',
                                'Transparent, no hidden fees',
                                'Nigerian payments (Paystack/Flutterwave)',
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
                            <CardTitle>Quick Links</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div class="space-y-3">
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
                                <a href="/labs" class="w-full">
                                    <Button variant="outline" class="w-full justify-start">
                                        <ArrowRight class="w-4 h-4 mr-2" />
                                        Try the Free Tools
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
