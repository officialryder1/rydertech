<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { Share2 } from '@lucide/svelte';

  export let title: string = '';
  export let url: string = '';

  // Reactive + always fresh — fixes the client-side-nav stale-URL bug
  // (the old version captured window.location.href once at module load).
  let currentUrl: string = url || '';

  $: if (browser) {
    currentUrl = url || window.location.href;
  }
  onMount(() => {
    if (browser) currentUrl = url || window.location.href;
    () => {};
  });
  $: encodedTitle = encodeURIComponent(title);
  $: encodedUrl = encodeURIComponent(currentUrl);

  async function copyToClipboard() {
    if (!browser) return;
    // Prefer the Clipboard API; fall back to prompt() for older browsers.
    try {
      await navigator.clipboard.writeText(currentUrl);
      // Lightweight, non-blocking confirmation (no alert() jank)
      const el = document.createElement('div');
      el.textContent = '🔗 Link copied!';
      el.className = 'fixed bottom-4 right-4 bg-gray-800/90 text-white text-xs px-3 py-1.5 rounded shadow-lg z-50';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2000);
    } catch {
      prompt('Copy this link:', currentUrl);
    }
  }

  async function nativeShare() {
    if (!browser) return;
    if (navigator.share) {
      try {
        await navigator.share({ title, url: currentUrl });
        return;
      } catch (e) {
        // User cancelled / unsupported — fall back to clipboard
      }
    }
    copyToClipboard();
  }
</script>

{#if browser}
  <div class="m-10 flex flex-wrap gap-3 items-center">
    <span class="font-semibold text-sm text-base-content/70">Share this post:</span>

    <!-- Mobile: native share sheet is the primary action -->
    <button
      onclick={nativeShare}
      class="px-4 py-2 text-sm font-medium text-white bg-primary rounded hover:bg-primary/90 flex items-center gap-1"
      aria-label="Share this post"
    >
      <Share2 class="w-4 h-4" />
      Share
    </button>

    <!-- WhatsApp -->
    <a
      href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
      target="_blank"
      rel="noopener"
      class="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600"
    >
      WhatsApp
    </a>

    <!-- X (Twitter) -->
    <a
      href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
      target="_blank"
      rel="noopener"
      class="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
    >
      X
    </a>

    <!-- LinkedIn -->
    <a
      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
      target="_blank"
      rel="noopener"
      class="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded hover:bg-blue-800"
    >
      LinkedIn
    </a>

    <!-- Copy to Clipboard -->
    <button
      onclick={copyToClipboard}
      class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
    >
      Copy Link
    </button>
  </div>
{/if}
