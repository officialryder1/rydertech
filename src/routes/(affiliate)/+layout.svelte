<script lang="ts">
    import '../../app.css';
    let { children } = $props()
    import AffiliatePopup from '$lib/components/AffiliatePopup.svelte';
    import AffiliateJoinModal from '$lib/components/AffiliateJoinModal.svelte';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment'

    let showAffiliatePopup = false;
    let showJoinModal = false;

    onMount(() => {
        if (browser) {
        // Check if user has seen the popup recently
        const lastClosed = localStorage.getItem('rydertech_affiliate_popup_closed');
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        
        if (!lastClosed || (Date.now() - parseInt(lastClosed)) > sevenDays) {
            // Show popup after 3 seconds
            setTimeout(() => {
            showAffiliatePopup = true;
            }, 3000);
        }
        }
    });

    function handlePopupClose() {
        showAffiliatePopup = false;
        localStorage.setItem('rydertech_affiliate_popup_closed', Date.now().toString());
    }
</script>

<AffiliatePopup 
  show={showAffiliatePopup}
  onClose={handlePopupClose}
/>


{@render children()}