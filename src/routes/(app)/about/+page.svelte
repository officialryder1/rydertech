<script>
    import {
        Globe, Sparkles, Target, Users, Award, Rocket, Code2, ShieldCheck,
        ArrowRight, Mail, MessageCircle, Zap, Compass, Layers, Heart, Eye, Flag, MapPin, Check
    } from '@lucide/svelte';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardDescription, CardTitle } from '$lib/components/ui/card';
    import { Badge } from '$lib/components/ui/badge';
    import { fade, fly } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';

    const stats = [
        { icon: Rocket, value: '100+', label: 'Products shipped' },
        { icon: Users, value: '50+', label: 'Clients served' },
        { icon: Award, value: '99%', label: 'Client satisfaction' },
        { icon: Globe, value: 'Worldwide', label: 'Remote delivery' }
    ];

    const values = [
        { icon: Target, title: 'Outcome obsession', description: 'We measure success by the result, not the deliverable — revenue, efficiency, and growth.' },
        { icon: Sparkles, title: 'Craft', description: 'Senior engineers and designers. No shortcuts, no template slop. Every line earns its place.' },
        { icon: ShieldCheck, title: 'Trust & discretion', description: 'NDA-grade handling of your data, your IP, and the details you would not post publicly.' },
        { icon: Globe, title: 'Global standard', description: 'We build to the bar of the best studios in the world — then price for the markets we know best.' }
    ];

    const process = [
        { icon: Compass, step: '01', title: 'Discover', description: 'We pressure-test the idea, map the users, and define what "winning" looks like in numbers.' },
        { icon: Layers, step: '02', title: 'Design', description: 'Product-thinking and interface design that feel inevitable — fast, clear, and on-brand.' },
        { icon: Code2, step: '03', title: 'Build', description: 'Modern web, mobile, and cloud stacks with AI baked in where it actually moves the needle.' },
        { icon: Rocket, step: '04', title: 'Scale', description: 'We ship, measure, and harden — then hand you the keys with docs and a path to scale.' }
    ];

    const regions = [
        { icon: MapPin, name: 'Lagos', note: 'Commercial & fintech hub' },
        { icon: MapPin, name: 'Abuja', note: 'HQ — strategy & delivery' },
        { icon: MapPin, name: 'Port Harcourt', note: 'Enterprise & energy' },
        { icon: Globe, name: 'Remote / Worldwide', note: 'Async, borderless delivery' }
    ];

    // Honest leadership: real founder anchored; disciplines shown as functions (no invented people).
    const leadership = [
        { initials: 'VO', name: 'Victor Onourah', role: 'Founder & CEO', bio: '6+ years building software and the companies behind it. Sets the bar for craft and client outcomes.' }
    ];
    const disciplines = [
        { initials: 'ENG', name: 'Engineering', note: 'Web, mobile & cloud' },
        { initials: 'AI', name: 'AI & ML', note: 'LLMs, vision, automation' },
        { initials: 'UX', name: 'Product Design', note: 'Research & interface' },
        { initials: 'CS', name: 'Client Success', note: 'Delivery & support' }
    ];
</script>

<svelte:head>
    <title>About RyderTech — Software & AI Studio, Built for the World</title>
    <meta name="description" content="RyderTech is a software and AI studio born in Nigeria and built for a global stage — engineering web, mobile, and AI products that compete worldwide." />
    <meta property="og:title" content="About RyderTech — Software & AI Studio" />
    <meta property="og:description" content="Born in Nigeria. Built for the world. We engineer web, mobile, and AI products that compete on a global stage." />
    <meta property="og:url" content="https://rydertech.ng/about" />
    <meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<div class="min-h-screen bg-white overflow-hidden">

    <!-- HERO (dark, international) -->
    <section class="relative pt-32 pb-24 px-4 overflow-hidden bg-gradient-to-br from-[#0f1e4d] via-[#1E40AF] to-[#0b1228] text-white">
        <div class="absolute -top-32 -right-24 w-[26rem] h-[26rem] rounded-full bg-[#06B6D4]/20 blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-32 -left-24 w-[22rem] h-[22rem] rounded-full bg-[#D4AF37]/20 blur-3xl pointer-events-none"></div>

        <div class="container mx-auto max-w-6xl relative z-10" in:fade={{ duration: 500 }}>
            <div class="inline-flex items-center space-x-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm text-white/90 font-semibold mb-6">
                <div class="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse"></div>
                <span>ABOUT RYDERTECH</span>
            </div>

            <h1 class="text-5xl md:text-7xl font-black leading-tight">
                Born in Africa.<br />Built for the <span class="text-[#FBBF24]">world.</span>
            </h1>

            <p class="text-xl md:text-2xl text-white/80 max-w-3xl mt-6 leading-relaxed">
                RyderTech is a software &amp; AI studio that engineers web, mobile, and cloud products
                to a global standard — then ships them from Lagos to London, Abuja to anywhere.
            </p>

            <div class="flex flex-col sm:flex-row gap-4 mt-10">
                <a href="/contact">
                    <Button size="lg" variant="secondary" class="text-base font-bold">
                        Start a project <ArrowRight class="w-5 h-5 ml-2" />
                    </Button>
                </a>
                <a href="/work">
                    <Button size="lg" variant="outline" class="text-base border-white/40 text-white hover:bg-white/10">
                        See our work
                    </Button>
                </a>
            </div>

            <!-- stat band -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
                {#each stats as s}
                    <div class="glass-card rounded-2xl px-6 py-7 text-center border border-white/20">
                        <s.icon class="w-7 h-7 mx-auto mb-3 text-[#FBBF24]" />
                        <div class="text-2xl md:text-3xl font-black">{s.value}</div>
                        <div class="text-white/70 text-sm mt-1">{s.label}</div>
                    </div>
                {/each}
            </div>
        </div>
    </section>

    <!-- STORY + WHERE WE BUILD -->
    <section class="px-4 py-20">
        <div class="container mx-auto max-w-6xl">
            <div class="grid lg:grid-cols-2 gap-12 items-start">
                <div in:fly={{ y: 24, duration: 500, easing: cubicOut }}>
                    <Badge class="mb-4 bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">Our Story</Badge>
                    <h2 class="text-3xl md:text-4xl font-black mb-5 leading-tight">A studio with a global bar and a founder's obsession.</h2>
                    <p class="text-lg text-gray-600 leading-relaxed mb-4">
                        RyderTech started with a simple, stubborn belief: businesses in Nigeria and across Africa
                        deserve software that is as sharp, fast, and reliable as anything shipped from Silicon Valley or London —
                        without the enterprise price tag or the hand-off to juniors.
                    </p>
                    <p class="text-lg text-gray-600 leading-relaxed mb-4">
                        Six years on, we engineer production-grade web apps, mobile products, and AI systems for founders,
                        enterprises, and governments — and we do it with the same discipline we'd demand for our own company.
                    </p>
                    <p class="text-lg text-gray-600 leading-relaxed">
                        We are not an agency that disappears after launch. We are the technical co-founder you wish you'd hired earlier.
                    </p>
                </div>

                <div in:fly={{ y: 24, duration: 500, delay: 80, easing: cubicOut }}>
                    <div class="rounded-3xl p-8 bg-gradient-to-br from-[#1E40AF] to-[#1E3A8A] text-white shadow-2xl">
                        <div class="flex items-center gap-3 mb-6">
                            <Globe class="w-6 h-6 text-[#FBBF24]" />
                            <h3 class="text-xl font-black">Where we build</h3>
                        </div>
                        <div class="grid sm:grid-cols-2 gap-4">
                            {#each regions as r}
                                <div class="rounded-xl bg-white/10 border border-white/15 p-4">
                                    <r.icon class="w-5 h-5 text-[#FBBF24] mb-2" />
                                    <div class="font-bold">{r.name}</div>
                                    <div class="text-white/70 text-sm">{r.note}</div>
                                </div>
                            {/each}
                        </div>
                        <p class="text-white/70 text-sm mt-6 leading-relaxed">
                            Local roots, borderless delivery. We work in your timezone when it matters and async when it doesn't.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- VALUES -->
    <section class="px-4 py-20 bg-gray-50">
        <div class="container mx-auto max-w-6xl">
            <div class="text-center mb-14" in:fly={{ y: 20, duration: 500, easing: cubicOut }}>
                <Badge variant="outline" class="mb-4">What we believe</Badge>
                <h2 class="text-3xl md:text-4xl font-black mb-4">Four standards we never trade.</h2>
                <p class="text-xl text-gray-500 max-w-2xl mx-auto">The principles that show up in every engagement — from first call to final deploy.</p>
            </div>
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {#each values as v}
                    <Card class="p-7 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                        <div class="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center mb-5">
                            <v.icon class="w-6 h-6 text-[var(--primary)]" />
                        </div>
                        <CardTitle class="text-lg mb-2">{v.title}</CardTitle>
                        <CardDescription class="text-sm leading-relaxed">{v.description}</CardDescription>
                    </Card>
                {/each}
            </div>
        </div>
    </section>

    <!-- PROCESS -->
    <section class="px-4 py-20">
        <div class="container mx-auto max-w-6xl">
            <div class="text-center mb-14" in:fly={{ y: 20, duration: 500, easing: cubicOut }}>
                <Badge class="mb-4 bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">How we work</Badge>
                <h2 class="text-3xl md:text-4xl font-black mb-4">From idea to scale, in four moves.</h2>
                <p class="text-xl text-gray-500 max-w-2xl mx-auto">A clear, senior-led process — no mystery, no junior gap.</p>
            </div>
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {#each process as p}
                    <div class="relative p-7 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-shadow duration-300">
                        <div class="text-4xl font-black text-[var(--primary)]/15 mb-3">{p.step}</div>
                        <p.icon class="w-7 h-7 text-[var(--secondary-dark)] mb-3" />
                        <h3 class="text-lg font-black mb-2">{p.title}</h3>
                        <p class="text-sm text-gray-500 leading-relaxed">{p.description}</p>
                    </div>
                {/each}
            </div>
        </div>
    </section>

    <!-- LEADERSHIP / TEAM -->
    <section class="px-4 py-20 bg-gray-50">
        <div class="container mx-auto max-w-6xl">
            <div class="text-center mb-14" in:fly={{ y: 20, duration: 500, easing: cubicOut }}>
                <Badge variant="outline" class="mb-4">Leadership &amp; craft</Badge>
                <h2 class="text-3xl md:text-4xl font-black mb-4">Senior by default.</h2>
                <p class="text-xl text-gray-500 max-w-2xl mx-auto">The people who own your outcome — and the disciplines behind every build.</p>
            </div>

            <!-- anchor founder -->
            <div class="max-w-xl mx-auto mb-10">
                {#each leadership as l}
                    <Card class="p-8 text-center border-0 shadow-xl">
                        <div class="w-24 h-24 rounded-full mx-auto mb-5 bg-gradient-to-br from-[#1E40AF] to-[#1E3A8A] flex items-center justify-center text-white text-2xl font-black">
                            {l.initials}
                        </div>
                        <CardTitle class="text-xl mb-1">{l.name}</CardTitle>
                        <Badge class="mb-4 bg-[var(--primary)]/10 text-[var(--primary)]">{l.role}</Badge>
                        <CardDescription class="text-sm leading-relaxed">{l.bio}</CardDescription>
                    </Card>
                {/each}
            </div>

            <!-- disciplines -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                {#each disciplines as d}
                    <div class="p-6 rounded-2xl bg-white border border-gray-100 text-center shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div class="w-14 h-14 rounded-xl mx-auto mb-4 bg-[var(--secondary)]/15 flex items-center justify-center text-[var(--secondary-dark)] font-black text-sm">
                            {d.initials}
                        </div>
                        <div class="font-bold">{d.name}</div>
                        <div class="text-gray-500 text-sm mt-1">{d.note}</div>
                    </div>
                {/each}
            </div>
        </div>
    </section>

    <!-- CTA -->
    <section class="relative px-4 py-24 overflow-hidden bg-gradient-to-br from-[#1E40AF] via-[#06B6D4] to-[#1E3A8A] text-white">
        <div class="absolute -top-20 right-10 w-72 h-72 rounded-full bg-[#D4AF37]/20 blur-3xl pointer-events-none"></div>
        <div class="container mx-auto max-w-4xl text-center relative z-10" in:fade={{ duration: 500 }}>
            <h2 class="text-3xl md:text-5xl font-black mb-5">Let's build something the world notices.</h2>
            <p class="text-xl opacity-90 max-w-2xl mx-auto mb-10">
                Tell us what you're making. We'll show you exactly how we'd ship it — with the same bar we hold for every client.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/contact">
                    <Button size="lg" variant="secondary" class="text-base font-bold">
                        Start your project <ArrowRight class="w-5 h-5 ml-2" />
                    </Button>
                </a>
                <a href="mailto:rydertech.ng@gmail.com">
                    <Button size="lg" variant="outline" class="text-base border-white/40 text-white hover:bg-white/10">
                        <Mail class="w-5 h-5 mr-2" /> rydertech.ng@gmail.com
                    </Button>
                </a>
            </div>
        </div>
    </section>
</div>
