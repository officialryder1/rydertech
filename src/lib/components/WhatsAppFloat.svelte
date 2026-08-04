<script lang="ts">
  // Site-wide WhatsApp contact button.
  // Number format: wa.me expects digits only, no + or spaces.
  const phone = '2349033147769';
  const defaultMessage = 'Hi RyderTech! I saw your website and would like to discuss a project.';
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(defaultMessage)}`;

  let showTooltip = $state(false);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="fixed bottom-6 right-6 z-[90] flex items-center gap-3"
  onmouseenter={() => (showTooltip = true)}
  onmouseleave={() => (showTooltip = false)}
>
  <!-- Tooltip -->
  {#if showTooltip}
    <div
      class="hidden sm:block bg-white text-gray-800 text-sm font-medium px-4 py-2 rounded-xl shadow-2xl border border-gray-100 animate-in fade-in slide-in-from-right-2"
    >
      Chat with us on WhatsApp
    </div>
  {/if}

  <!-- Button -->
  <a
    href={waUrl}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat with RyderTech on WhatsApp"
    class="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-2xl shadow-[#25D366]/30 transition-all duration-300 hover:scale-110 hover:bg-[#1ebe5b]"
  >
    <!-- Pulse ring -->
    <span class="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping group-hover:opacity-0"></span>

    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      class="relative h-7 w-7 fill-white"
      aria-hidden="true"
    >
      <path
        d="M16.02 3.2c-7.08 0-12.82 5.74-12.82 12.82 0 2.26.6 4.46 1.73 6.4L3.2 28.8l6.5-1.7a12.78 12.78 0 0 0 6.32 1.62h.01c7.07 0 12.81-5.74 12.81-12.82 0-3.42-1.33-6.64-3.75-9.06A12.74 12.74 0 0 0 16.02 3.2zm0 23.28h-.01a10.69 10.69 0 0 1-5.45-1.49l-.39-.23-3.86 1.01 1.03-3.76-.25-.39a10.65 10.65 0 0 1-1.63-5.66c0-5.92 4.82-10.74 10.75-10.74 2.87 0 5.57 1.12 7.6 3.15a10.68 10.68 0 0 1 3.15 7.6c0 5.92-4.82 10.74-10.74 10.74zm5.89-8.02c-.32-.16-1.9-.94-2.2-1.05-.3-.11-.51-.16-.73.16-.21.32-.83 1.05-1.02 1.26-.19.21-.38.24-.7.08-.32-.16-1.36-.5-2.59-1.6-.96-.86-1.6-1.92-1.79-2.24-.19-.32-.02-.49.14-.65.14-.14.32-.38.48-.57.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.73-1.76-1-2.41-.26-.63-.53-.55-.73-.56-.19-.01-.4-.01-.62-.01a1.19 1.19 0 0 0-.86.4c-.3.32-1.13 1.1-1.13 2.69 0 1.58 1.16 3.11 1.32 3.33.16.21 2.27 3.47 5.5 4.86.77.33 1.37.53 1.84.68.77.25 1.48.21 2.03.13.62-.09 1.9-.78 2.17-1.53.27-.75.27-1.39.19-1.53-.08-.13-.29-.21-.61-.37z"
      />
    </svg>
  </a>
</div>
