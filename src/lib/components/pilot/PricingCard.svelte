<script lang="ts">
	import { CheckCircle, ArrowRight } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	interface PricingCardProps {
		tier: string;
		price: string;
		description: string;
		features: string[];
		cta: string;
		featured?: boolean;
	}
	let { tier, price, description, features, cta, featured = false }: PricingCardProps = $props();
</script>

<div class="relative bg-white rounded-xl p-6 border {featured ? 'border-primary/30 shadow-lg shadow-primary/5' : 'border-gray-100'} {featured ? 'ring-2 ring-primary/20' : ''} flex flex-col">
	{#if featured}
		<div class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">Most Popular</div>
	{/if}
	<div class="mb-4">
		<h3 class="font-semibold text-gray-900">{tier}</h3>
		<p class="text-sm text-gray-500 mt-1">{description}</p>
	</div>
	<div class="mb-6">
		<div class="text-4xl font-bold text-gray-900">{price}</div>
		<div class="text-sm text-gray-500">one-time • credited to full build</div>
	</div>
	<ul class="space-y-3 mb-6 flex-1">
		{#each features as feature}
			<li class="flex items-start gap-3 text-sm text-gray-600">
				<CheckCircle class="w-5 h-5 text-primary/60 mt-0.5 flex-shrink-0" />
				<span>{feature}</span>
			</li>
		{/each}
	</ul>
	<Button variant={featured ? 'default' : 'outline'} class="w-full gap-2" href="/contact">
		{cta}
		<ArrowRight class="w-4 h-4" />
	</Button>
</div>