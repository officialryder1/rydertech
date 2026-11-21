<script lang="ts">
	interface StepCardProps {
		step: string;
		title: string;
		description: string;
		icon: any;
	}
	let { step, title, description, icon: Icon }: StepCardProps = $props();
</script>

<div class="bg-white rounded-xl p-6 border border-gray-100 relative">
	<div class="absolute -top-3 left-6 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{step}</div>
	<div class="pt-6">
		<div class="p-3 rounded-xl bg-primary/10 text-primary mb-4">
			<Icon class="w-6 h-6" />
		</div>
		<h3 class="font-semibold text-gray-900 mb-2">{title}</h3>
		<p class="text-sm text-gray-600">{description}</p>
	</div>
</div>