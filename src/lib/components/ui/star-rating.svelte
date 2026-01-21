<script lang="ts">
  import { Star } from '@lucide/svelte';
  
  export let value = 0;
  export let editable = false;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };
  
  function setRating(rating: number) {
    if (editable) {
      value = rating;
    }
  }
</script>

<div class="flex items-center gap-1">
  {#each Array(5) as _, i}
    <button
      type="button"
      class={`transition-colors ${editable ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
      on:click={() => setRating(i + 1)}
      disabled={!editable}
    >
      <Star
  class={`
    ${sizes[size]}
    ${i < value ? 'fill-yellow-400 stroke-yellow-400' : 'fill-gray-200 stroke-gray-300'}
  `}
/>
    </button>
  {/each}
</div>