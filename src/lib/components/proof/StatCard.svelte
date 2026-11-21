<script lang="ts">
	import { TrendingUp, CheckCircle } from '@lucide/svelte';

	interface Props {
		title: string;
		value: string;
		icon: any;
		description: string;
		trend: string;
	}

	let { title, value, icon: Icon, description, trend }: Props = $props();
</script>

<div class="bg-white rounded-xl p-6 border border-gray-100 hover:border-primary/20 transition-colors">
	<div class="flex items-start justify-between mb-4">
		<div class="p-3 rounded-xl bg-primary/10 text-primary">
			<Icon class="w-6 h-6" />
		</div>
		<TrendingUp class="w-5 h-5 text-green-500" />
	</div>
	<div class="text-3xl font-bold text-gray-900 mb-1">{value}</div>
	<div class="text-sm font-medium text-gray-600 mb-1">{title}</div>
	<div class="text-xs text-gray-500 mb-2">{description}</div>
	<div class="text-xs text-green-600 font-medium">{trend}</div>
</div>