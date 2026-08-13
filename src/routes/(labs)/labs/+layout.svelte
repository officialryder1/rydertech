<script>
    import '../../../app.css';
    import { page } from '$app/stores';
    import LeadRetargetBanner from '$lib/components/LeadRetargetBanner.svelte';

    let { children } = $props();

    // Derive the active tool slug from the URL, e.g. /labs/ops-drain -> 'ops-drain'
    const toolSlug = $derived($page.url.pathname.replace('/labs/', '').replace(/\/$/, '') || 'labs');
</script>

<main>
    {@render children()}
    <LeadRetargetBanner toolKey={toolSlug} />
</main>
