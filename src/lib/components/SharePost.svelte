<script>
	import { browser } from '$app/environment';

	export let title = '';
	export let url = '';

	let currentUrl = '';

	if (browser) {
		currentUrl = url || window.location.href;
	}

	const encodedTitle = encodeURIComponent(title);
	const encodedUrl = encodeURIComponent(currentUrl);

	function copyToClipboard() {
		if (!browser) return;
		navigator.clipboard.writeText(currentUrl)
			.then(() => alert("🔗 Link copied to clipboard!"))
			.catch(() => alert("Failed to copy link."));
	}
</script>

{#if browser}
    <div class="m-10 flex flex-wrap gap-3 items-center">
        <span class="font-semibold text-sm text-base-content/70">Share this post:</span>

        <!-- WhatsApp -->
        <a href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`} target="_blank" rel="noopener" class="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600">
            WhatsApp
        </a>

        <!-- Twitter/X -->
        <a href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`} target="_blank" rel="noopener" class="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600">
            Twitter
        </a>

        <!-- LinkedIn -->
        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noopener" class="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded hover:bg-blue-800">
            LinkedIn
        </a>

        <!-- Facebook -->
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
            Facebook
        </a>

        <!-- Copy to Clipboard -->
        <button on:click={copyToClipboard} class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300">
            Copy Link
        </button>
    </div>
{/if}
