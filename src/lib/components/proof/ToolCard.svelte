<script lang="ts">
	import { ChevronRight } from '@lucide/svelte';

	interface Tool {
		name: string;
		path: string;
		category: string;
		status: 'live' | 'beta';
	}

	interface Props {
		tool: Tool;
	}

	let { tool }: Props = $props();
</script>

<a href={tool.path} class="group bg-white rounded-xl p-5 border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all duration-200 flex flex-col h-full">
	<div class="flex items-start justify-between mb-3">
		<div class="px-2 py-1 rounded-full text-xs font-medium {tool.status === 'live' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}">
			{tool.status === 'live' ? 'Live' : 'Beta'}
		</div>
		<ChevronRight class="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
	</div>
	<h3 class="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">{tool.name}</h3>
	<p class="text-xs text-gray-500 uppercase tracking-wider mb-auto">{tool.category}</p>
	<div class="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
		<span>→ View tool</span>
		<ChevronRight class="w-3 h-3 group-hover:text-primary transition-colors" />
	</div>
</a>