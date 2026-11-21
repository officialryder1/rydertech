<script lang="ts">
	import { CheckCircle } from '@lucide/svelte';

	interface Props {
		title: string;
		description: string;
		icon: any;
		details: string[];
	}

	let { title, description, icon: Icon, details }: Props = $props();
</script>

<div class="bg-white rounded-xl p-6 border border-gray-100 hover:border-primary/20 transition-colors">
	<div class="p-3 rounded-xl bg-primary/10 text-primary mb-4">
		<Icon class="w-6 h-6" />
	</div>
	<h3 class="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
	<p class="text-sm text-gray-600 mb-4">{description}</p>
	<ul class="space-y-2">
		{#each details as detail}
			<li class="flex items-start gap-2 text-sm text-gray-600">
				<CheckCircle class="w-4 h-4 text-primary/60 mt-0.5 flex-shrink-0" />
				<span>{detail}</span>
			</li>
		{/each}
	</ul>
</div>