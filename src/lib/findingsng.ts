import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.js';

export type Db = Database;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = SupabaseClient<any, any, any>;

export interface Vendor {
	id: string;
	name: string;
	slug: string;
	logo_url: string | null;
	website_url: string;
	description: string;
	category: string;
	founded_year: number | null;
	employee_range: string | null;
	nigerian_focus: boolean;
	status: string;
}

export interface PricingTier {
	id: string;
	vendor_id: string;
	plan_name: string;
	price_monthly: number | null;
	price_yearly: number | null;
	currency: string;
	billing_unit: string;
	billing_cycle: string;
	unit_limit: number | null;
	is_popular: boolean;
	sort_order: number;
	is_verified: boolean;
	verified_date: string | null;
	source_url: string | null;
}

export interface VendorBenchmark {
	id: string;
	vendor_id: string;
	benchmark_id: string;
	value: string;
	is_verified: boolean;
	verified_date: string | null;
	metric_name: string;
	metric_unit: string;
	category: string;
	source_url: string | null;
}

export interface ComparisonRow {
	vendor: Vendor;
	tiers: PricingTier[];
	benchmarks: VendorBenchmark[];
}

/**
 * Fetch vendors with their pricing tiers for comparison.
 * Only verified tiers are marked for shareable surfaces.
 */
export async function fetchComparisonData(
	supabase: AnySupabase,
	category: string,
	options: { verifiedOnly?: boolean } = {}
): Promise<ComparisonRow[]> {
	const { data: vendors, error: vendorsError } = await supabase
		.from('vendors')
		.select('*')
		.eq('category', category)
		.eq('status', 'published');

	if (vendorsError) throw vendorsError;
	if (!vendors || vendors.length === 0) return [];

	const vendorIds = vendors.map((v) => v.id);

	let tiersQuery = supabase
		.from('pricing_tiers')
		.select('*')
		.in('vendor_id', vendorIds)
		.order('sort_order', { ascending: true });

	const { data: tiers, error: tiersError } = await tiersQuery;
	if (tiersError) throw tiersError;

	const { data: benchmarks, error: benchmarksError } = await supabase
		.from('vendor_benchmarks')
		.select('*, benchmarks(metric_name, metric_unit, category, source_url)')
		.in('vendor_id', vendorIds);

	if (benchmarksError) throw benchmarksError;

	return vendors.map((vendor) => {
		const vendorTiers = (tiers || []).filter((t) => t.vendor_id === vendor.id);
		const vendorBenchmarks = (benchmarks || []).filter((b) => b.vendor_id === vendor.id);

		// Pattern-lock: separate verified vs unverified data
		const verifiedTiers = options.verifiedOnly
			? vendorTiers.filter((t) => t.is_verified)
			: vendorTiers;

		return {
			vendor,
			tiers: verifiedTiers,
			benchmarks: vendorBenchmarks
		};
	});
}

/**
 * Format price for display.
 */
export function formatPrice(
	price: number | null,
	currency: string,
	billingCycle: string
): string {
	if (price === null) return 'Contact sales';
	if (price === 0) return 'Free';
	const symbol = currency === 'USD' ? '$' : currency === 'NGN' ? '₦' : `${currency} `;
	const cycle = billingCycle === 'monthly' ? '/mo' : billingCycle === 'yearly' ? '/yr' : '';
	return `${symbol}${price.toLocaleString()}${cycle}`;
}

/**
 * Format billing unit for display.
 */
export function formatBillingUnit(unit: string, limit: number | null): string {
	if (!limit) return '';
	switch (unit) {
		case 'product_count':
			return `${limit.toLocaleString()} products`;
		case 'sku_count':
			return `${limit.toLocaleString()} SKUs`;
		case 'url_count':
			return `${limit.toLocaleString()} URLs`;
		case 'seat':
			return `${limit} seats`;
		default:
			return limit.toLocaleString();
	}
}
