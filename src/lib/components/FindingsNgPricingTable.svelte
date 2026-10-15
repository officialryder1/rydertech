<script lang="ts">
	import type { ComparisonRow, PricingTier, VendorBenchmark } from '$lib/findingsng.js';
	import { formatPrice, formatBillingUnit } from '$lib/findingsng.js';

	interface Props {
		rows: ComparisonRow[];
	}

	let { rows }: Props = $props();

	interface DisplayRow {
		key: string;
		plan: string;
		price: string;
		limit: string;
		verified: boolean;
		popular: boolean;
		note: string | null;
		source: string | null;
	}

	interface VendorGroup {
		id: string;
		name: string;
		website: string;
		quoteLed: boolean;
		metering: string;
		rows: DisplayRow[];
	}

	/**
	 * Benchmark values are stored as "<figure> - <provenance>". Split them so the
	 * figure sits in the price column and the provenance reads as a note rather
	 * than crowding the number.
	 */
	function splitBenchmarkValue(value: string): { figure: string; note: string | null } {
		const [figure, ...rest] = value.split(' - ');
		return { figure: figure.trim(), note: rest.length ? rest.join(' - ').trim() : null };
	}

	/** Name the metering model itself ("per product"), not the entry tier's limit. */
	function meteringModel(unit: string): string {
		switch (unit) {
			case 'product_count':
				return 'Metered per product';
			case 'sku_count':
				return 'Metered per SKU';
			case 'url_count':
				return 'Metered per URL';
			case 'seat':
				return 'Metered per seat';
			default:
				return unit.replace(/_/g, ' ');
		}
	}

	function fromTier(tier: PricingTier): DisplayRow {
		return {
			key: `tier-${tier.id}`,
			plan: tier.plan_name,
			price: formatPrice(tier.price_monthly, tier.currency, tier.billing_cycle),
			limit: formatBillingUnit(tier.billing_unit, tier.unit_limit) || 'Not stated',
			verified: tier.is_verified,
			popular: tier.is_popular,
			note: null,
			source: tier.source_url
		};
	}

	function fromBenchmark(bench: VendorBenchmark): DisplayRow {
		const { figure, note } = splitBenchmarkValue(bench.value);
		return {
			key: `bench-${bench.id}`,
			plan: bench.metric_name.replace(/_/g, ' '),
			price: figure,
			limit: bench.metric_unit,
			verified: bench.is_verified,
			popular: false,
			note,
			source: bench.source_url
		};
	}

	/**
	 * One flat group per vendor. Tier rows and benchmark rows render through the
	 * same cells, so a vendor can carry either or both without a branch per column.
	 */
	let groups = $derived(
		rows
			.map((r): VendorGroup | null => {
				const list: DisplayRow[] = [
					...r.tiers.map(fromTier),
					...r.benchmarks.map(fromBenchmark)
				];
				if (list.length === 0) return null;

				const entry = r.tiers[0];
				return {
					id: r.vendor.id,
					name: r.vendor.name,
					website: r.vendor.website_url,
					quoteLed: r.tiers.length === 0 && r.benchmarks.length > 0,
					metering: entry ? meteringModel(entry.billing_unit) : 'No published plan',
					rows: list
				};
			})
			.filter((g): g is VendorGroup => g !== null)
	);

	let verifiedCount = $derived(
		groups.reduce((n, g) => n + g.rows.filter((r) => r.verified).length, 0)
	);
	let unverifiedCount = $derived(
		groups.reduce((n, g) => n + g.rows.filter((r) => !r.verified).length, 0)
	);
</script>

<div class="findings-table">
	<div class="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02]">
		<div class="flex flex-wrap items-baseline justify-between gap-3 border-b border-white/8 px-6 py-5">
			<div>
				<h3 class="text-base font-semibold text-white">Pricing comparison</h3>
				<p class="mt-1 text-sm text-gray-400">
					Vendor-published tiers for the price-tracking category
				</p>
			</div>
			<p class="font-mono text-xs text-gray-400">
				{verifiedCount} verified{#if unverifiedCount > 0}, {unverifiedCount} unverified{/if}
			</p>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full min-w-[680px] border-collapse text-sm">
				<caption class="sr-only">
					Published pricing tiers and benchmark figures for price-tracking vendors. Rows marked
					unverified are not vendor-confirmed and are excluded from shareable surfaces.
				</caption>
				<thead>
					<tr class="border-b border-white/8">
						<th scope="col" class="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-400 uppercase">
							Vendor
						</th>
						<th scope="col" class="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-400 uppercase">
							Plan
						</th>
						<th scope="col" class="px-6 py-3 text-right text-xs font-medium tracking-wide text-gray-400 uppercase">
							Price
						</th>
						<th scope="col" class="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-400 uppercase">
							Metered on
						</th>
						<th scope="col" class="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-400 uppercase">
							Sourcing
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-white/5">
					{#each groups as group (group.id)}
						{#each group.rows as row, i (row.key)}
							<tr class="align-top transition-colors hover:bg-white/[0.03]">
								{#if i === 0}
									<td rowspan={group.rows.length} class="px-6 py-4">
										<a
											href={group.website}
											target="_blank"
											rel="noopener noreferrer"
											class="font-semibold text-white hover:text-[#06B6D4]"
										>
											{group.name}
										</a>
										<p class="mt-1.5 font-mono text-xs text-gray-400">{group.metering}</p>
										{#if group.quoteLed}
											<p class="mt-2 inline-block rounded-md border border-white/15 px-2 py-0.5 text-xs font-medium text-gray-300">
												Quote-led
											</p>
										{/if}
									</td>
								{/if}

								<td class="px-6 py-4">
									<span class="text-gray-300">{row.plan}</span>
									{#if row.popular}
										<span class="ml-2 rounded-md border border-[#06B6D4]/40 px-1.5 py-0.5 text-xs font-medium text-[#06B6D4]">
											Popular
										</span>
									{/if}
								</td>

								<td class="px-6 py-4 text-right font-mono whitespace-nowrap text-white">
									{row.price}
								</td>

								<td class="px-6 py-4 text-gray-400">{row.limit}</td>

								<td class="px-6 py-4">
									<div class="flex flex-wrap items-center gap-2">
										{#if row.verified}
											<span class="inline-block rounded-md border border-[#06B6D4]/40 px-2 py-0.5 text-xs font-medium text-[#06B6D4]">
												Verified
											</span>
										{:else}
											<span
												class="inline-block rounded-md border border-white/15 px-2 py-0.5 text-xs font-medium text-gray-400"
												title="Not vendor-confirmed. Excluded from shareable surfaces."
											>
												Unverified
											</span>
										{/if}
										{#if row.source}
											<a
												href={row.source}
												target="_blank"
												rel="noopener noreferrer"
												class="text-xs text-gray-400 underline decoration-white/20 hover:text-[#06B6D4] hover:decoration-[#06B6D4]/40"
											>
												Source
											</a>
										{/if}
									</div>
									{#if row.note}
										<p class="mt-1.5 text-xs leading-snug text-gray-400">{row.note}</p>
									{/if}
								</td>
							</tr>
						{/each}
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	{#if groups.length === 0}
		<div class="rounded-2xl border border-white/8 bg-white/[0.02] px-6 py-16 text-center">
			<p class="text-lg font-medium text-white">No pricing data yet</p>
			<p class="mt-2 text-sm text-gray-400">
				Vendor tiers land here as soon as the first sweep is verified.
			</p>
		</div>
	{/if}
</div>
