<script>
    import FindsNg from '$lib/assets/findsng.png';
    import KingCourt from '$lib/assets/king-court.png';
    import { ExternalLink, ArrowRight, Sparkles, Quote, Globe, Building2, Check } from '@lucide/svelte';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent } from '$lib/components/ui/card';
    import { Badge } from '$lib/components/ui/badge';
    import { fade, fly } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';
    import { browser } from '$app/environment';

    // --- Case-study data (real builds; NDA builds shown as private/client work) ---
    const caseStudies = [
        {
            slug: 'findsng',
            title: 'FindsNg',
            filter: 'Web Apps',
            category: 'Web & E-Commerce',
            tagline: 'Multi-vendor marketplace engine',
            summary: 'A high-scale marketplace where hundreds of vendors sell from one storefront — vendor dashboards, commissions, and a frictionless checkout.',
            image: FindsNg,
            featured: true,
            metrics: [
                { value: 'Multi-tenant', label: 'Vendor architecture' },
                { value: 'Stripe', label: 'Payments & payouts' },
                { value: 'Mobile-first', label: 'Buyer UX' }
            ],
            results: ['Hundreds of concurrent vendors', 'Built-in commission & payout engine', 'Sub-2s product load times'],
            tech: ['SvelteKit', 'Node.js', 'PostgreSQL', 'Stripe'],
            liveUrl: 'https://findsng.vercel.app/'
        },
        {
            slug: 'ryderx',
            title: 'RyderXchange',
            filter: 'Mobile Apps',
            category: 'Mobile & Fintech',
            tagline: 'Secure banking & transactions app',
            summary: 'A secure mobile banking experience with biometric auth and real-time transactions — built for trust and speed.',
            image: '/image/ryderx.png',
            metrics: [
                { value: 'Biometric', label: 'Auth layer' },
                { value: 'Real-time', label: 'Transactions' },
                { value: 'iOS + Android', label: 'Cross-platform' }
            ],
            results: ['Biometric login & step-up auth', 'Live balance & transfer feeds', 'Offline-first resilience'],
            tech: ['React Native', 'Supabase', 'Plaid API', 'AWS'],
            liveUrl: 'https://ryderx.vercel.app/'
        },
        {
            slug: 'kingcourt',
            title: 'King Court Restaurant',
            filter: 'Custom Software',
            category: 'Custom Software',
            tagline: 'Booking & table management',
            summary: 'An end-to-end reservation and operations system — live table management, order tracking, and a polished guest booking flow.',
            image: KingCourt,
            metrics: [
                { value: 'Live', label: 'Table grid' },
                { value: 'Order', label: 'Tracking' },
                { value: 'Vercel', label: 'Hosted' }
            ],
            results: ['Real-time table availability', 'Kitchen order sync', 'Branded booking widget'],
            tech: ['Svelte', 'Supabase', 'Vercel'],
            liveUrl: 'https://king-restaurant.vercel.app/'
        },
        {
            slug: 'flowspense',
            title: 'FLOW-SPENSE',
            filter: 'Mobile Apps',
            category: 'Mobile & PWA',
            tagline: 'Personal finance, simplified',
            summary: 'A personal-finance PWA with expense tracking, budgets, and insights — installable like a native app, usable offline.',
            image: '/flow.png',
            metrics: [
                { value: 'PWA', label: 'Installable' },
                { value: 'Offline', label: 'Capable' },
                { value: 'Insights', label: 'Dashboards' }
            ],
            results: ['Auto-categorised spending', 'Budget alerts & trends', 'Works with no signal'],
            tech: ['SvelteKit', 'Node.js', 'PWA', 'Cloudflare'],
            liveUrl: 'https://flow-spense.pages.dev/'
        },
        {
            slug: 'maison',
            title: 'Maison',
            filter: 'Web Apps',
            category: 'Web & Real Estate',
            tagline: 'Discreet property advisory',
            summary: 'A luxury real-estate advisory site with curated residence listings, private-viewing booking, and an elegant, conversion-focused buyer journey.',
            image: '/work-maison.png',
            metrics: [
                { value: '₦850M', label: 'Top listing' },
                { value: 'Search', label: 'Smart filters' },
                { value: 'Dark', label: '+ Light mode' }
            ],
            results: ['Curated residence catalogue', 'Private viewing enquiry flow', 'Premium, on-brand UX'],
            tech: ['SvelteKit', 'Tailwind CSS', 'Vercel'],
            liveUrl: 'https://maison-estate-ten.vercel.app/'
        },
        {
            slug: 'realestate',
            title: 'Real Estate Platform',
            filter: 'Web Apps',
            category: 'Web & AI',
            tagline: 'Listings, tours & AI match',
            summary: 'A property listing and management system with virtual tours and AI-powered recommendations that surface the right homes to every buyer.',
            image: null,
            nda: true,
            metrics: [
                { value: 'AI', label: 'Recommendations' },
                { value: 'Virtual', label: 'Tours' },
                { value: 'Enterprise', label: 'Scale' }
            ],
            results: ['Smart property matching', 'Immersive virtual walkthroughs', 'Agent lead routing'],
            tech: ['Vue.js', 'Laravel', 'MySQL', 'AWS']
        },
        {
            slug: 'supplychain',
            title: 'Supply Chain Management',
            filter: 'Custom Software',
            category: 'Enterprise Software',
            tagline: 'Logistics & inventory at scale',
            summary: 'An enterprise supply-chain solution with inventory optimization and live logistics tracking across warehouses and regions.',
            image: null,
            nda: true,
            metrics: [
                { value: 'Optimised', label: 'Inventory' },
                { value: 'Live', label: 'Tracking' },
                { value: 'Azure', label: 'Cloud' }
            ],
            results: ['Demand-based stocking', 'Multi-warehouse visibility', 'Route & ETA tracking'],
            tech: ['Angular', 'Java', 'Oracle', 'Azure']
        }
    ];

    const featured = caseStudies.find((p) => p.featured);
    const rest = caseStudies.filter((p) => !p.featured);

    const filters = ['All', 'Web Apps', 'Mobile Apps', 'Custom Software'];
    let activeFilter = $state('All');
    let visible = $state(rest);

    function applyFilter(f) {
        activeFilter = f;
        visible = f === 'All' ? rest : rest.filter((p) => p.filter === f);
    }

    // Credibility band
    const stats = [
        { value: '50+', label: 'Happy clients' },
        { value: '100+', label: 'Projects shipped' },
        { value: '99%', label: 'Client satisfaction' },
        { value: '5★', label: 'Average rating' }
    ];

    // Category icon for placeholder (NDA) cards
    const categoryIcon = {
        'Web & AI': Globe,
        'Enterprise Software': Building2
    };

    // Scroll-reveal action — uses INLINE styles (not a CSS class) so the element
    // can never get stuck hidden. Once revealed we set opacity:1 and never reset it;
    // inline styles also beat any stylesheet rule, so there's no specificity race.
    function reveal(node) {
        if (!browser) return;
        node.style.opacity = '0';
        node.style.transform = 'translateY(28px)';
        node.style.transition =
            'opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)';
        let shown = false;
        const show = () => {
            if (shown) return;
            shown = true;
            node.style.opacity = '1';
            node.style.transform = 'none';
            io.disconnect();
            clearTimeout(fb);
        };
        const io = new IntersectionObserver(
            (entries) => entries.forEach((e) => { if (e.isIntersecting) show(); }),
            { threshold: 0.12 }
        );
        io.observe(node);
        // Fallback: reveal even if intersection never fires (above-the-fold, etc.)
        const fb = setTimeout(show, 1200);
        return {
            destroy() {
                io.disconnect();
                clearTimeout(fb);
            }
        };
    }
</script>

<svelte:head>
    <title>Our Work — RyderTech Case Studies | Web, Mobile & AI Builds</title>
    <meta name="description" content="Real RyderTech case studies: marketplaces, fintech apps, booking systems, and AI platforms we've shipped for clients across Nigeria and beyond. See the results — then build yours." />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Our Work — RyderTech Case Studies" />
    <meta property="og:description" content="Marketplaces, fintech apps, booking systems, and AI platforms we've shipped. See what we built — and what it did for our clients." />
    <meta property="og:url" content="https://rydertech.ng/work" />
    <meta name="twitter:card" content="summary_large_image" />
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "RyderTech Work & Case Studies",
        "url": "https://rydertech.ng/work",
        "isPartOf": { "@type": "WebSite", "name": "RyderTech", "url": "https://rydertech.ng" },
        "about": { "@type": "ProfessionalService", "name": "RyderTech", "url": "https://rydertech.ng" }
    }
    </script>
</svelte:head>

<div class="min-h-screen bg-white overflow-hidden">
    <!-- Hero -->
    <section class="relative pt-32 pb-20 px-4 overflow-hidden">
        <!-- glow -->
        <div class="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-[var(--primary)]/20 blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-32 -left-24 w-[24rem] h-[24rem] rounded-full bg-[var(--secondary)]/15 blur-3xl pointer-events-none"></div>

        <div class="container mx-auto max-w-6xl relative z-10 text-center" in:fade={{ duration: 500 }}>
            <div class="inline-flex items-center space-x-2 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-full px-4 py-2 text-sm text-[var(--primary)] font-semibold mb-6">
                <div class="w-2 h-2 bg-[var(--secondary)] rounded-full animate-pulse"></div>
                <span>PROVEN BUILDS · REAL OUTCOMES</span>
            </div>

            <h1 class="text-5xl md:text-7xl font-black leading-tight">
                Proof, not <span class="gradient-text">promises.</span>
            </h1>

            <p class="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mt-6 leading-relaxed">
                See what we've built for founders and enterprises — and exactly what it did for their business.
                <span class="text-gray-900 font-semibold">Then let's build yours.</span>
            </p>

            <div class="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                <Button href="/contact" size="lg" class="text-base creative-button">
                    <span class="flex items-center">Start your project <ArrowRight class="w-5 h-5 ml-2" /></span>
                </Button>
                <Button href="/services/ai" variant="outline" size="lg" class="text-base border-[var(--primary)]/30 text-[var(--primary)] hover:bg-[var(--primary)]/5">
                    <span class="flex items-center"><Sparkles class="w-5 h-5 mr-2" /> Explore AI builds</span>
                </Button>
            </div>
        </div>
    </section>

    <!-- Credibility band -->
    <section class="px-4 pb-8">
        <div class="container mx-auto max-w-6xl">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                {#each stats as s}
                    <div class="glass-card rounded-2xl px-6 py-8 text-center border border-white/40">
                        <div class="text-3xl md:text-4xl font-black gradient-text">{s.value}</div>
                        <div class="text-gray-500 text-sm mt-1 font-medium">{s.label}</div>
                    </div>
                {/each}
            </div>
        </div>
    </section>

    <!-- Featured case study -->
    {#if featured}
        <section class="px-4 py-12">
            <div class="container mx-auto max-w-6xl reveal-card" use:reveal>
                <div class="flex items-center gap-3 mb-6">
                    <Sparkles class="w-5 h-5 text-[var(--secondary)]" />
                    <span class="text-sm font-bold tracking-widest text-[var(--primary)] uppercase">Featured Build</span>
                </div>

                <Card class="overflow-hidden border-0 shadow-2xl reveal-card">
                    <div class="grid lg:grid-cols-2">
                        <div class="relative min-h-[18rem] lg:min-h-full bg-gradient-to-br from-[#1E40AF] via-[#06B6D4] to-[#1E3A8A]">
                            <img src={featured.image} alt={featured.title} class="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                            <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                            <Badge class="absolute top-4 left-4 bg-[var(--secondary)] text-black font-bold">Client favourite</Badge>
                        </div>

                        <CardContent class="p-8 md:p-10 flex flex-col justify-center">
                            <div class="text-sm font-semibold text-[var(--primary)] mb-2">{featured.category}</div>
                            <h2 class="text-3xl md:text-4xl font-black mb-1">{featured.title}</h2>
                            <p class="text-lg text-[var(--secondary-dark)] font-semibold mb-4">{featured.tagline}</p>
                            <p class="text-gray-600 leading-relaxed mb-6">{featured.summary}</p>

                            <div class="grid grid-cols-3 gap-3 mb-6">
                                {#each featured.metrics as m}
                                    <div class="rounded-xl bg-gray-50 border border-gray-100 p-3 text-center">
                                        <div class="font-black text-[var(--primary)] text-sm md:text-base leading-tight">{m.value}</div>
                                        <div class="text-[11px] text-gray-500 mt-1">{m.label}</div>
                                    </div>
                                {/each}
                            </div>

                            <div class="flex flex-wrap gap-2 mb-6">
                                {#each featured.tech as t}
                                    <Badge variant="outline" class="text-xs">{t}</Badge>
                                {/each}
                            </div>

                            <div class="mt-auto">
                                <Button href={featured.liveUrl} target="_blank" rel="noopener" class="creative-button">
                                    <span class="flex items-center"><ExternalLink class="w-4 h-4 mr-2" /> View it live</span>
                                </Button>
                            </div>
                        </CardContent>
                    </div>
                </Card>
            </div>
        </section>
    {/if}

    <!-- Filter pills -->
    <section class="px-4 py-6">
        <div class="container mx-auto max-w-6xl">
            <div class="flex flex-wrap justify-center gap-3">
                {#each filters as f}
                    <button
                        onclick={() => applyFilter(f)}
                        class={activeFilter === f
                            ? 'px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 border bg-[var(--primary)] text-white border-[var(--primary)] shadow-md'
                            : 'px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 border bg-white text-gray-600 border-gray-200 hover:border-[var(--primary)]/40 hover:text-[var(--primary)]'}
                    >
                        {f}
                    </button>
                {/each}
            </div>
        </div>
    </section>

    <!-- Case study grid -->
    <section class="px-4 py-10">
        <div class="container mx-auto max-w-6xl">
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {#each visible as project (project.slug)}
                    <div use:reveal class="reveal-card flex flex-col h-full">
                    <Card class="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
                        <div class="relative h-52 overflow-hidden bg-gradient-to-br from-[#1E40AF] via-[#06B6D4] to-[#1E3A8A]">
                            {#if project.image}
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                />
                            {:else}
                                {@const Icon = categoryIcon[project.category] ?? Building2}
                                <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1E40AF] to-[#1E3A8A]">
                                    <Icon class="w-14 h-14 text-white/80" />
                                </div>
                            {/if}
                            {#if project.nda}
                                <Badge class="absolute top-3 left-3 bg-gray-900/80 text-white">Private / NDA client</Badge>
                            {/if}
                            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300"></div>
                        </div>

                        <CardContent class="p-6 flex flex-col flex-1">
                            <div class="text-xs font-bold tracking-wide text-[var(--primary)] uppercase mb-1">{project.category}</div>
                            <h3 class="text-xl font-black mb-1">{project.title}</h3>
                            <p class="text-sm text-[var(--secondary-dark)] font-semibold mb-3">{project.tagline}</p>
                            <p class="text-gray-600 text-sm leading-relaxed mb-4">{project.summary}</p>

                            <div class="grid grid-cols-3 gap-2 mb-4">
                                {#each project.metrics as m}
                                    <div class="rounded-lg bg-gray-50 border border-gray-100 p-2 text-center">
                                        <div class="font-bold text-[var(--primary)] text-xs leading-tight">{m.value}</div>
                                        <div class="text-[10px] text-gray-500 mt-0.5">{m.label}</div>
                                    </div>
                                {/each}
                            </div>

                            <ul class="space-y-1.5 mb-5">
                                {#each project.results as r}
                                    <li class="flex items-start gap-2 text-sm text-gray-700">
                                        <Check class="w-4 h-4 text-[var(--secondary)] mt-0.5 shrink-0" />
                                        <span>{r}</span>
                                    </li>
                                {/each}
                            </ul>

                            <div class="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                                <div class="flex flex-wrap gap-1.5">
                                    {#each project.tech.slice(0, 3) as t}
                                        <Badge variant="outline" class="text-[10px]">{t}</Badge>
                                    {/each}
                                </div>
                                {#if project.liveUrl}
                                    <a href={project.liveUrl} target="_blank" rel="noopener" class="flex items-center gap-1 text-[var(--primary)] text-sm font-semibold hover:gap-2 transition-all">
                                        Live <ExternalLink class="w-3.5 h-3.5" />
                                    </a>
                                {:else}
                                    <a href="/contact" class="flex items-center gap-1 text-[var(--primary)] text-sm font-semibold hover:gap-2 transition-all">
                                        Ask <ArrowRight class="w-3.5 h-3.5" />
                                    </a>
                                {/if}
                            </div>
                        </CardContent>
                    </Card>
                    </div>
                {/each}
            </div>

            {#if visible.length === 0}
                <p class="text-center text-gray-500 py-12">No builds in this category yet — but we're shipping daily. <a href="/contact" class="text-[var(--primary)] font-semibold">Tell us what you need.</a></p>
            {/if}
        </div>
    </section>

    <!-- Testimonial spotlight -->
    <section class="px-4 py-14 bg-gradient-to-br from-[#1E40AF] to-[#1E3A8A] text-white">
        <div class="container mx-auto max-w-4xl text-center" in:fly={{ y: 24, duration: 500, easing: cubicOut }}>
            <Quote class="w-10 h-10 mx-auto mb-6 text-[var(--secondary)]" />
            <p class="text-2xl md:text-3xl font-semibold leading-snug">
                "The travel booking platform developed by RyderTech revolutionized our business. Our bookings have <span class="text-[var(--secondary)] font-bold">increased by 60%</span> since launch."
            </p>
            <div class="mt-6 text-[var(--secondary)] font-bold">Divine Favour</div>
            <div class="text-white/70 text-sm">Founder & CEO, DbTravels</div>
        </div>
    </section>

    <!-- Final CTA -->
    <section class="relative px-4 py-24 overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-[#1E40AF] via-[#06B6D4] to-[#1E3A8A] opacity-95"></div>
        <div class="absolute -top-20 right-10 w-72 h-72 rounded-full bg-[var(--secondary)]/20 blur-3xl pointer-events-none"></div>
        <div class="container mx-auto max-w-4xl text-center relative z-10 text-white" in:fade={{ duration: 500 }}>
            <h2 class="text-3xl md:text-5xl font-black mb-5">Your project could be our next case study.</h2>
            <p class="text-xl opacity-90 max-w-2xl mx-auto mb-10">
                Tell us what you're building. We'll show you exactly how we'd ship it — with the same obsession for results our clients rave about.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <Button href="/contact" size="lg" variant="secondary" class="text-base font-bold">
                    Get a free build plan <ArrowRight class="w-5 h-5 ml-2" />
                </Button>
                <Button href="/labs" size="lg" variant="outline" class="text-base border-white/40 text-white hover:bg-white/10">
                    Try a free tool first
                </Button>
            </div>
        </div>
    </section>
    </div>
