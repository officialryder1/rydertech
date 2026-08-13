<script lang="ts">
	// Shared in-page retargeting + cross-link banner for all /labs tools.
	// Injected once in (labs)/labs/+layout.svelte. After a visitor captures their
	// audit (signalled via localStorage flag set by the tool), this surfaces their
	// lead tier + links to the OTHER tools so one visit becomes a full-funnel tour.
	import { onMount } from 'svelte';
	import { TIER_LABEL, type Tier } from '$lib/leadScore';

	let {
		tier = null as Tier | null,
		points = 0,
		toolKey = ''
	}: { tier?: Tier | null; points?: number; toolKey?: string } = $props();

	let visible = $state(false);
	let dismissed = $state(false);

	const ALL_TOOLS = [
		{ slug: 'cost-estimator', title: 'Website Cost Estimator' },
		{ slug: 'website-rater', title: 'AI Website Rater' },
		{ slug: 'revleak', title: 'RevLeak Auditor' },
		{ slug: 'ops-drain', title: 'Ops Drain Calculator' },
		{ slug: 'event-access-risk', title: 'Event Access Risk Scanner' },
		{ slug: 'visibility', title: 'Local Visibility Audit' },
		{ slug: 'aeo-readiness', title: 'AI Search Readiness Audit' }
	];

	onMount(() => {
		try {
			const captured = localStorage.getItem('rydertech_lead_captured') === '1';
			const dismissedAll = localStorage.getItem('rydertech_retarget_dismissed') === '1';
			visible = captured && !dismissedAll;
		} catch {
			visible = false;
		}
	});

	function dismiss() {
		dismissed = true;
		visible = false;
		try {
			localStorage.setItem('rydertech_retarget_dismissed', '1');
		} catch {}
	}

	const tierColor: Record<Tier, string> = {
		cool: 'bg-slate-100 text-slate-700 border-slate-300',
		warm: 'bg-amber-100 text-amber-800 border-amber-300',
		hot: 'bg-rose-100 text-rose-800 border-rose-300'
	};

	const others = $derived(ALL_TOOLS.filter((t) => t.slug !== toolKey).slice(0, 4));
</script>

{#if visible}
	<div class="fixed inset-x-0 bottom-0 z-50 px-4 pb-4" transition:fade={{ duration: 250 }}>
		<div
			class="mx-auto max-w-3xl rounded-2xl border border-primary/30 bg-card/95 shadow-2xl backdrop-blur"
		>
			<div class="flex items-start gap-3 p-4 sm:p-5">
				<div class="flex-1 min-w-0">
					<div class="flex flex-wrap items-center gap-2">
						{#if tier}
							<span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide {tierColor[tier]}">
								{TIER_LABEL[tier]} lead · {points}/100
							</span>
						{/if}
						<span class="text-sm font-semibold text-foreground">Your audit is unlocked — don't stop here.</span>
					</div>
					<p class="mt-1.5 text-sm text-muted-foreground">
						Businesses that run more than one diagnostic convert faster. Explore the others free:
					</p>
					<div class="mt-3 flex flex-wrap gap-2">
						{#each others as t}
							<a
								href="/labs/{t.slug}"
								class="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-primary/50 hover:bg-primary/5"
							>
								{t.title} →
							</a>
						{/each}
					</div>
				</div>
				<button
					type="button"
					onclick={dismiss}
					class="shrink-0 rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
					aria-label="Dismiss"
				>
					✕
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.fixed { animation: slideup 0.25s ease-out; }
	@keyframes slideup {
		from { transform: translateY(100%); opacity: 0; }
		to { transform: translateY(0); opacity: 1; }
	}
</style>
