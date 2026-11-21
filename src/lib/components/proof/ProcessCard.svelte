<script lang="ts">
	import { Zap, Mail, BarChart2 } from '@lucide/svelte';

	interface Props {
		step: string;
		title: string;
		description: string;
		icon: any;
	}

	let { step, title, description, icon: Icon }: Props = $props();
</script>

<div class="bg-white rounded-xl p-6 border border-gray-100">
	<div class="text-xs font-bold text-primary mb-2">{step}</div>
	<div class="flex items-start gap-3">
		<div class="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
			<Icon class="w-5 h-5" />
		</div>
		<div>
			<h4 class="font-semibold text-gray-900 mb-1">{title}</h4>
			<p class="text-sm text-gray-600">{description}</p>
		</div>
	</div>
</div>