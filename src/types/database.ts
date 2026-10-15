// Database type definitions for FindingsNg
// Generated from supabase/migrations/0001_findingsng_schema.sql

export interface Database {
	public: {
		Tables: {
			vendors: {
				Row: {
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
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					slug: string;
					logo_url?: string | null;
					website_url: string;
					description: string;
					category: string;
					founded_year?: number | null;
					employee_range?: string | null;
					nigerian_focus?: boolean;
					status?: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					slug?: string;
					logo_url?: string | null;
					website_url?: string;
					description?: string;
					category?: string;
					founded_year?: number | null;
					employee_range?: string | null;
					nigerian_focus?: boolean;
					status?: string;
					created_at?: string;
					updated_at?: string;
				};
			};
			pricing_tiers: {
				Row: {
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
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					vendor_id: string;
					plan_name: string;
					price_monthly?: number | null;
					price_yearly?: number | null;
					currency?: string;
					billing_unit: string;
					billing_cycle?: string;
					unit_limit?: number | null;
					is_popular?: boolean;
					sort_order?: number;
					is_verified?: boolean;
					verified_date?: string | null;
					source_url?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					vendor_id?: string;
					plan_name?: string;
					price_monthly?: number | null;
					price_yearly?: number | null;
					currency?: string;
					billing_unit?: string;
					billing_cycle?: string;
					unit_limit?: number | null;
					is_popular?: boolean;
					sort_order?: number;
					is_verified?: boolean;
					verified_date?: string | null;
					source_url?: string | null;
					created_at?: string;
					updated_at?: string;
				};
			};
			features: {
				Row: {
					id: string;
					category: string;
					name: string;
					description: string | null;
					sort_order: number;
					created_at: string;
				};
				Insert: {
					id?: string;
					category: string;
					name: string;
					description?: string | null;
					sort_order?: number;
					created_at?: string;
				};
				Update: {
					id?: string;
					category?: string;
					name?: string;
					description?: string | null;
					sort_order?: number;
					created_at?: string;
				};
			};
			vendor_features: {
				Row: {
					id: string;
					vendor_id: string;
					feature_id: string;
					has_feature: boolean;
					notes: string | null;
				};
				Insert: {
					id?: string;
					vendor_id: string;
					feature_id: string;
					has_feature?: boolean;
					notes?: string | null;
				};
				Update: {
					id?: string;
					vendor_id?: string;
					feature_id?: string;
					has_feature?: boolean;
					notes?: string | null;
				};
			};
			benchmarks: {
				Row: {
					id: string;
					metric_name: string;
					metric_unit: string;
					category: string;
					source_url: string | null;
					notes: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					metric_name: string;
					metric_unit: string;
					category: string;
					source_url?: string | null;
					notes?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					metric_name?: string;
					metric_unit?: string;
					category?: string;
					source_url?: string | null;
					notes?: string | null;
					created_at?: string;
				};
			};
			vendor_benchmarks: {
				Row: {
					id: string;
					vendor_id: string;
					benchmark_id: string;
					value: string;
					is_verified: boolean;
					verified_date: string | null;
				};
				Insert: {
					id?: string;
					vendor_id: string;
					benchmark_id: string;
					value: string;
					is_verified?: boolean;
					verified_date?: string | null;
				};
				Update: {
					id?: string;
					vendor_id?: string;
					benchmark_id?: string;
					value?: string;
					is_verified?: boolean;
					verified_date?: string | null;
				};
			};
		};
	};
}
