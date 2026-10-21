<script>
  import { Shield, Users, Mail, MessageCircle, TrendingUp, Download, Search, ArrowRight, BarChart3, Settings, CheckCircle, XCircle, Eye, X, Building2, CheckCircle2, AlertCircle, ExternalLink } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';

  let { data } = $props();

  // Local UI state
  let activeTab = $state('overview');
  let searchQuery = $state('');
  let selectedLead = $state(null);
  let showLeadModal = $state(false);
  let leadFilter = $state('all');

  // Derived from server data
  const submissions = data.submissions;
  const newsletters = data.newsletters;
  const magnets = data.magnets;
  const stats = data.stats;
  const user = data.user;
  const findingsng = data.findingsng;
  const vendorData = data.vendors;

  // Lead segment helpers
  const segmentColors = {
    hot: 'bg-red-100 text-red-800 border-red-200',
    warm: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    cold: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const segmentIcons = {
    hot: '🔥',
    warm: '⏳',
    cold: '📋'
  };

  function getFilteredSubmissions() {
    let result = submissions;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(sub =>
        sub.name?.toLowerCase().includes(q) ||
        sub.email?.toLowerCase().includes(q) ||
        sub.company?.toLowerCase().includes(q)
      );
    }
    if (leadFilter !== 'all') {
      result = result.filter(sub => sub.lead_segment === leadFilter);
    }
    return result;
  }

  function getSegmentCount(segment) {
    return submissions.filter(s => s.lead_segment === segment).length;
  }

  function getNewsletterSegmentCount(segment) {
    return newsletters.filter(n => n.lead_segment === segment).length;
  }

  function getFilteredNewsletters() {
    let result = newsletters;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(sub =>
        sub.email?.toLowerCase().includes(q) ||
        sub.source?.toLowerCase().includes(q)
      );
    }
    return result;
  }

  function getStatusColor(status) {
    const colors = {
      'new': 'bg-blue-100 text-blue-800 border-blue-200',
      'contacted': 'bg-green-100 text-green-800 border-green-200',
      'replied': 'bg-purple-100 text-purple-800 border-purple-200',
      'closed': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || colors.new;
  }

  function convertToCSV(data) {
    if (!data.length) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row =>
      Object.values(row).map(field =>
        `"${String(field || '').replace(/"/g, '""')}"`
      ).join(',')
    );
    return [headers, ...rows].join('\n');
  }

  function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  function exportSubmissions() {
    const csv = convertToCSV(submissions);
    downloadCSV(csv, `rydertech-leads-${new Date().toISOString().split('T')[0]}.csv`);
  }

  function exportNewsletters() {
    const csv = convertToCSV(newsletters);
    downloadCSV(csv, `rydertech-newsletter-${new Date().toISOString().split('T')[0]}.csv`);
  }

  function exportMagnets() {
    const csv = convertToCSV(magnets);
    downloadCSV(csv, `rydertech-lead-magnets-${new Date().toISOString().split('T')[0]}.csv`);
  }

  function viewLeadDetails(submission) {
    selectedLead = submission;
    showLeadModal = true;
  }

  function closeLeadModal() {
    showLeadModal = false;
    selectedLead = null;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function formatPrice(tier) {
    if (tier.price_monthly == null) return 'Custom';
    const curr = tier.currency || 'USD';
    const symbol = curr === 'NGN' ? '₦' : curr === 'USD' ? '$' : curr === 'GBP' ? '£' : '';
    return `${symbol}${tier.price_monthly}/${tier.billing_cycle === 'monthly' ? 'mo' : 'yr'}`;
  }

  const verifiedBadge = 'bg-green-100 text-green-800 border-green-200';
  const unverifiedBadge = 'bg-yellow-100 text-yellow-800 border-yellow-200';
</script>

<svelte:head>
  <title>Admin Dashboard — RyderTech</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <header class="bg-white border-b border-gray-200">
    <div class="px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] rounded-lg flex items-center justify-center">
            <Shield class="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900">RyderTech Admin</h1>
            <p class="text-sm text-gray-500">Manage leads, subscribers & vendor intelligence</p>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-500">Hi, {user.email?.split('@')[0]}</span>
          <Button variant="outline" size="sm" class="flex items-center gap-2">
            <Settings class="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  </header>

  <div class="flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav class="p-4 space-y-2">
        {#each [
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'findingsng', label: 'FindingsNg', icon: TrendingUp },
          { id: 'vendors', label: 'Vendor Intel', icon: Building2 },
          { id: 'leads', label: 'Contact Leads', icon: Users },
          { id: 'magnets', label: 'Lead Magnets', icon: Download },
          { id: 'newsletter', label: 'Newsletter', icon: Mail }
        ] as tab}
          <button
            class={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onclick={() => activeTab = tab.id}
          >
            <tab.icon class="w-5 h-5" />
            <span class="font-medium">{tab.label}</span>
          </button>
        {/each}
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-6">
      <!-- Overview Tab -->
      {#if activeTab === 'overview'}
        <div class="space-y-6">
          <h2 class="text-2xl font-bold text-gray-900">Overview</h2>

          <!-- Stats Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {#each [
              { label: 'Contact Leads', value: stats.totalSubmissions, icon: Users, color: 'blue' },
              { label: 'Lead Magnets', value: stats.totalMagnets, icon: Download, color: 'orange' },
              { label: 'Newsletter', value: stats.totalSubscribers, icon: Mail, color: 'green' },
              { label: 'Pending', value: stats.pendingSubmissions, icon: MessageCircle, color: 'purple' }
            ] as stat}
              <Card class="hover:shadow-lg transition-shadow duration-300">
                <CardContent class="p-6">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p class="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                    <div class="p-3 rounded-lg bg-{stat.color}-100">
                      <stat.icon class="w-6 h-6 text-{stat.color}-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            {/each}
          </div>

          <!-- Status Breakdown + Lead Quality + This Week -->
          <div class="grid lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader><CardTitle>Lead Status Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div class="space-y-3">
                  {#each [
                    { label: 'New', count: stats.pendingSubmissions, color: 'blue' },
                    { label: 'Contacted', count: stats.contactedSubmissions, color: 'green' },
                    { label: 'Replied', count: stats.repliedSubmissions, color: 'purple' },
                    { label: 'Closed', count: stats.closedSubmissions, color: 'gray' }
                  ] as item}
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-600">{item.label}</span>
                      <Badge class="bg-{item.color}-100 text-{item.color}-800">{item.count}</Badge>
                    </div>
                  {/each}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Lead Quality Score</CardTitle></CardHeader>
              <CardContent>
                <div class="space-y-3">
                  {#each [
                    { label: 'Hot', count: getSegmentCount('hot'), icon: '🔥', color: 'red' },
                    { label: 'Warm', count: getSegmentCount('warm'), icon: '⏳', color: 'yellow' },
                    { label: 'Cold', count: getSegmentCount('cold'), icon: '📋', color: 'gray' }
                  ] as item}
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-600 flex items-center gap-2">{item.icon} {item.label}</span>
                      <Badge class="bg-{item.color}-100 text-{item.color}-800">{item.count}</Badge>
                    </div>
                  {/each}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>This Week</CardTitle></CardHeader>
              <CardContent>
                <div class="space-y-3">
                  <div class="flex items-center justify-between"><span class="text-sm text-gray-600">Contact Forms</span><span class="font-medium">{stats.weeklySubmissions}</span></div>
                  <div class="flex items-center justify-between"><span class="text-sm text-gray-600">Lead Magnets</span><span class="font-medium">{stats.weeklyMagnets}</span></div>
                  <div class="flex items-center justify-between"><span class="text-sm text-gray-600">Newsletter</span><span class="font-medium">{stats.weeklySubscribers}</span></div>
                  <div class="flex items-center justify-between"><span class="text-sm text-gray-600">Registered Users</span><span class="font-medium">{stats.totalUsers}</span></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Recent Leads + Subscribers -->
          <div class="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Recent Leads</CardTitle></CardHeader>
              <CardContent>
                <div class="space-y-4">
                  {#each submissions.slice(0, 5) as submission}
                    <div class="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                      <div><p class="font-medium text-gray-900">{submission.name}</p><p class="text-sm text-gray-500">{submission.email}</p></div>
                      <Badge class={getStatusColor(submission.status)}>{submission.status}</Badge>
                    </div>
                  {:else}
                    <p class="text-sm text-gray-500 text-center py-4">No leads yet</p>
                  {/each}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Recent Subscribers</CardTitle></CardHeader>
              <CardContent>
                <div class="space-y-4">
                  {#each newsletters.slice(0, 5) as subscriber}
                    <div class="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                      <div><p class="font-medium text-gray-900">{subscriber.email}</p><p class="text-sm text-gray-500 capitalize">{subscriber.source}</p></div>
                      <Badge class={segmentColors[subscriber.lead_segment] || segmentColors.cold}>{segmentIcons[subscriber.lead_segment] || '📋'} {subscriber.lead_segment}</Badge>
                    </div>
                  {:else}
                    <p class="text-sm text-gray-500 text-center py-4">No subscribers yet</p>
                  {/each}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      <!-- FindingsNg Tab -->
      {:else if activeTab === 'findingsng'}
        <div class="space-y-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">FindingsNg Segment</h2>
            <p class="text-gray-600 mt-1">Subscribers tagged <code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm">lead_tags @> ['findingsng']</code> — pricing-intel opt-ins from ops-drain leads.</p>
          </div>

          <!-- Top Stats Row -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent class="p-4 text-center"><p class="text-sm text-gray-600">Total</p><p class="text-2xl font-bold">{findingsng.stats.total}</p></CardContent></Card>
            <Card><CardContent class="p-4 text-center"><p class="text-sm text-gray-600">Hot</p><p class="text-2xl font-bold text-red-600">{findingsng.stats.hot}</p></CardContent></Card>
            <Card><CardContent class="p-4 text-center"><p class="text-sm text-gray-600">Warm</p><p class="text-2xl font-bold text-yellow-600">{findingsng.stats.warm}</p></CardContent></Card>
            <Card><CardContent class="p-4 text-center"><p class="text-sm text-gray-600">Cold</p><p class="text-2xl font-bold text-gray-600">{findingsng.stats.cold}</p></CardContent></Card>
          </div>

          <!-- Last Touch + Per Source -->
          <div class="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Last Touch</CardTitle><CardDescription>Most recent subscription in this segment</CardDescription></CardHeader>
              <CardContent>
                {#if findingsng.stats.lastTouch}
                  <p class="text-lg font-medium">{formatDate(findingsng.stats.lastTouch)}</p>
                {:else}
                  <p class="text-gray-500">No subscribers yet</p>
                {/if}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Per Source</CardTitle><CardDescription>Breakdown by capture source (unioned source + lead_source)</CardDescription></CardHeader>
              <CardContent>
                <div class="space-y-2">
                  {#each Object.entries(findingsng.stats.perSource || {}) as [src, count]}
                    <div class="flex items-center justify-between"><Badge variant="outline">{src}</Badge><span class="font-medium">{count}</span></div>
                  {:else}
                    <p class="text-gray-500 text-sm">No data</p>
                  {/each}
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Weekly Accumulation -->
          <Card>
            <CardHeader><CardTitle>Weekly Accumulation</CardTitle><CardDescription>New subscribers per ISO week (last 8 weeks)</CardDescription></CardHeader>
            <CardContent>
              {#if findingsng.stats.weekly.length > 0}
                <div class="flex items-end gap-2 h-40">
                  {#each findingsng.stats.weekly as [week, count]}
                    <div class="flex-1 flex flex-col items-center gap-1">
                      <span class="text-xs font-medium">{count}</span>
                      <div class="w-full bg-[var(--primary)]/20 rounded-t" style="height: {Math.max(4, count * 20)}px"></div>
                      <span class="text-xs text-gray-500">{week.slice(5)}</span>
                    </div>
                  {/each}
                </div>
              {:else}
                <p class="text-gray-500 text-sm">No weekly data yet</p>
              {/if}
            </CardContent>
          </Card>

          <!-- Subscriber List -->
          <Card>
            <CardHeader><CardTitle>FindingsNg Subscribers</CardTitle><CardDescription>{findingsng.stats.total} total</CardDescription></CardHeader>
            <CardContent class="p-0">
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                      <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Score</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    {#each findingsng.subs as sub}
                      <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 text-sm text-gray-900">{sub.email}</td>
                        <td class="px-6 py-4"><Badge variant="outline">{sub.source || sub.lead_source || '—'}</Badge></td>
                        <td class="px-6 py-4 text-center">{#if sub.lead_score != null}<span class="font-medium">{sub.lead_score}</span>{:else}<span class="text-gray-400">—</span>{/if}</td>
                        <td class="px-6 py-4"><Badge class={segmentColors[sub.lead_segment] || segmentColors.cold}>{segmentIcons[sub.lead_segment] || '📋'} {sub.lead_segment || 'cold'}</Badge></td>
                        <td class="px-6 py-4 text-sm text-gray-500">{formatDate(sub.subscribed_at)}</td>
                      </tr>
                    {:else}
                      <tr><td colspan="5" class="px-6 py-8 text-center text-gray-500">No FindingsNg subscribers yet</td></tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

      <!-- Vendor Intelligence Tab -->
      {:else if activeTab === 'vendors'}
        <div class="space-y-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Vendor Intelligence</h2>
            <p class="text-gray-600 mt-1">Pricing tiers and benchmarks for the FindingsNg marketplace. Verified badges driven by <code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm">is_verified</code> + <code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm">verified_date</code>.</p>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card><CardContent class="p-4 text-center"><p class="text-sm text-gray-600">Vendors</p><p class="text-2xl font-bold">{vendorData.stats.totalVendors}</p></CardContent></Card>
            <Card><CardContent class="p-4 text-center"><p class="text-sm text-gray-600">Pricing Tiers</p><p class="text-2xl font-bold">{vendorData.stats.totalTiers}</p></CardContent></Card>
            <Card><CardContent class="p-4 text-center"><p class="text-sm text-gray-600">Verified Tiers</p><p class="text-2xl font-bold text-green-600">{vendorData.stats.verifiedTiers}</p></CardContent></Card>
            <Card><CardContent class="p-4 text-center"><p class="text-sm text-gray-600">Unverified</p><p class="text-2xl font-bold text-yellow-600">{vendorData.stats.unverifiedTiers}</p></CardContent></Card>
            <Card><CardContent class="p-4 text-center"><p class="text-sm text-gray-600">Benchmarks</p><p class="text-2xl font-bold">{vendorData.stats.totalBenchmarks}</p></CardContent></Card>
          </div>

          <!-- Vendors Table -->
          <Card>
            <CardHeader><CardTitle>Vendors</CardTitle></CardHeader>
            <CardContent class="p-0">
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Website</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    {#each vendorData.list as v}
                      <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 font-medium text-gray-900">{v.name}</td>
                        <td class="px-6 py-4"><Badge class={v.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>{v.status}</Badge></td>
                        <td class="px-6 py-4 text-sm text-gray-600">{v.category}</td>
                        <td class="px-6 py-4 text-sm">
                          <a href={v.website_url} target="_blank" rel="noopener" class="text-[var(--primary)] hover:underline flex items-center gap-1">
                            {v.website_url?.replace(/^https?:\/\//, '')} <ExternalLink class="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    {:else}
                      <tr><td colspan="4" class="px-6 py-8 text-center text-gray-500">No vendors</td></tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <!-- Pricing Tiers Table -->
          <Card>
            <CardHeader><CardTitle>Pricing Tiers</CardTitle><CardDescription>Pattern-lock: is_verified + verified_date drive badges</CardDescription></CardHeader>
            <CardContent class="p-0">
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Billing Unit</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Limit</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    {#each vendorData.tiers as tier}
                      <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 font-medium text-gray-900">{tier.vendors?.name || '—'}</td>
                        <td class="px-6 py-4 text-sm text-gray-900">{tier.plan_name}</td>
                        <td class="px-6 py-4 text-sm">{formatPrice(tier)}</td>
                        <td class="px-6 py-4 text-sm text-gray-600">{tier.billing_unit}</td>
                        <td class="px-6 py-4 text-sm">{tier.unit_limit ?? '—'}</td>
                        <td class="px-6 py-4">
                          {#if tier.is_verified}
                            <Badge class={verifiedBadge}>
                              <CheckCircle2 class="w-3 h-3 mr-1" />Verified{#if tier.verified_date}<span class="ml-1 text-xs opacity-75">{tier.verified_date}</span>{/if}
                            </Badge>
                          {:else}
                            <Badge class={unverifiedBadge}><AlertCircle class="w-3 h-3 mr-1" />Unverified</Badge>
                          {/if}
                        </td>
                        <td class="px-6 py-4 text-sm">
                          {#if tier.source_url}
                            <a href={tier.source_url} target="_blank" rel="noopener" class="text-[var(--primary)] hover:underline flex items-center gap-1">Link <ExternalLink class="w-3 h-3" /></a>
                          {:else}
                            <span class="text-gray-400">—</span>
                          {/if}
                        </td>
                      </tr>
                    {:else}
                      <tr><td colspan="7" class="px-6 py-8 text-center text-gray-500">No pricing tiers</td></tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <!-- Benchmarks Table -->
          <Card>
            <CardHeader><CardTitle>Benchmarks</CardTitle><CardDescription>Category-level metrics with per-vendor values from vendor_benchmarks</CardDescription></CardHeader>
            <CardContent class="p-0">
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor Values</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    {#each vendorData.benchmarks as b}
                      <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 font-medium text-gray-900">{b.metric_name}</td>
                        <td class="px-6 py-4 text-sm text-gray-600">{b.metric_unit}</td>
                        <td class="px-6 py-4 text-sm text-gray-600">{b.category}</td>
                        <td class="px-6 py-4 text-sm">
                          {#if b.vendor_benchmarks?.length > 0}
                            <div class="space-y-1">
                              {#each b.vendor_benchmarks as vb}
                                <div class="flex items-center gap-2">
                                  <span class="font-medium">{vb.value}</span>
                                  {#if vb.is_verified}<Badge class={verifiedBadge}>Verified</Badge>{:else}<Badge class={unverifiedBadge}>Unverified</Badge>{/if}
                                </div>
                              {/each}
                            </div>
                          {:else}
                            <span class="text-gray-400">—</span>
                          {/if}
                        </td>
                        <td class="px-6 py-4 text-sm">
                          {#if b.source_url}
                            <a href={b.source_url} target="_blank" rel="noopener" class="text-[var(--primary)] hover:underline flex items-center gap-1">Link <ExternalLink class="w-3 h-3" /></a>
                          {:else}
                            <span class="text-gray-400">—</span>
                          {/if}
                        </td>
                      </tr>
                    {:else}
                      <tr><td colspan="5" class="px-6 py-8 text-center text-gray-500">No benchmarks</td></tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

      <!-- Leads Management Tab -->
      {:else if activeTab === 'leads'}
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div><h2 class="text-2xl font-bold text-gray-900">Contact Leads</h2><p class="text-gray-600">{submissions.length} total</p></div>
            <div class="flex items-center space-x-3">
              <div class="relative">
                <Search class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input type="text" bind:value={searchQuery} placeholder="Search leads..." class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <Button variant="outline" onclick={exportSubmissions}><Download class="w-4 h-4 mr-2" />Export</Button>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button class={`px-3 py-1.5 rounded-lg text-sm font-medium ${leadFilter === 'all' ? 'bg-[var(--primary)] text-white' : 'text-gray-600 hover:bg-gray-100'}`} onclick={() => leadFilter = 'all'}>All ({getSegmentCount('hot') + getSegmentCount('warm') + getSegmentCount('cold')})</button>
            <button class={`px-3 py-1.5 rounded-lg text-sm font-medium ${leadFilter === 'hot' ? 'bg-red-500 text-white' : 'text-red-600 hover:bg-red-50'}`} onclick={() => leadFilter = 'hot'}>Hot ({getSegmentCount('hot')})</button>
            <button class={`px-3 py-1.5 rounded-lg text-sm font-medium ${leadFilter === 'warm' ? 'bg-yellow-500 text-white' : 'text-yellow-600 hover:bg-yellow-50'}`} onclick={() => leadFilter = 'warm'}>Warm ({getSegmentCount('warm')})</button>
            <button class={`px-3 py-1.5 rounded-lg text-sm font-medium ${leadFilter === 'cold' ? 'bg-gray-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`} onclick={() => leadFilter = 'cold'}>Cold ({getSegmentCount('cold')})</button>
          </div>
          <Card>
            <CardContent class="p-0">
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                      <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Score</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Segment</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    {#each getFilteredSubmissions() as submission}
                      <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4"><div class="font-medium text-gray-900">{submission.name}</div><div class="text-sm text-gray-500">{submission.email}</div></td>
                        <td class="px-6 py-4 text-sm">{submission.company || '—'}</td>
                        <td class="px-6 py-4 text-center"><span class={`inline-flex w-10 h-10 rounded-full items-center justify-center text-sm font-bold ${submission.lead_score >= 70 ? 'bg-red-100 text-red-700' : submission.lead_score >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{submission.lead_score}</span></td>
                        <td class="px-6 py-4"><Badge class={segmentColors[submission.lead_segment] || segmentColors.cold}>{segmentIcons[submission.lead_segment] || '📋'} {submission.lead_segment}</Badge></td>
                        <td class="px-6 py-4"><Badge class={getStatusColor(submission.status)}>{submission.status}</Badge></td>
                        <td class="px-6 py-4 text-sm text-gray-500">{formatDate(submission.submitted_at)}</td>
                        <td class="px-6 py-4">
                          <Button size="sm" variant="outline" onclick={() => viewLeadDetails(submission)}><Eye class="w-4 h-4" /></Button>
                          {#if submission.status === 'new'}
                            <form method="POST" action="?/updateStatus" class="inline ml-2">
                              <input type="hidden" name="id" value={submission.id} />
                              <input type="hidden" name="status" value="contacted" />
                              <Button size="sm" type="submit"><CheckCircle class="w-4 h-4" /></Button>
                            </form>
                          {/if}
                        </td>
                      </tr>
                    {:else}
                      <tr><td colspan="7" class="px-6 py-8 text-center text-gray-500">No leads found</td></tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

      <!-- Lead Magnets Tab -->
      {:else if activeTab === 'magnets'}
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div><h2 class="text-2xl font-bold text-gray-900">Lead Magnets</h2><p class="text-gray-600">{magnets.length} captures (unioned source + lead_source)</p></div>
            <Button variant="outline" onclick={exportMagnets}><Download class="w-4 h-4 mr-2" />Export</Button>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            {#each [
              { label: 'Ops Drain', source: 'lead_magnet_ops_drain' },
              { label: 'RevLeak', source: 'lead_magnet_revleak' },
              { label: 'Event Risk', source: 'lead_magnet_event_risk' },
              { label: 'Website Rater', source: 'lead_magnet_website_rater' },
              { label: 'Cost Guide', source: 'lead_magnet_cost_guide' }
            ] as tool}
              <Card><CardContent class="p-4 text-center"><p class="text-sm text-gray-600">{tool.label}</p><p class="text-2xl font-bold">{magnets.filter(m => m.source === tool.source || m.lead_source === tool.source).length}</p></CardContent></Card>
            {/each}
          </div>
          <Card>
            <CardContent class="p-0">
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    {#each magnets as lead}
                      <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 text-sm">{lead.email}</td>
                        <td class="px-6 py-4"><Badge variant="outline">{lead.source || lead.lead_source}</Badge></td>
                        <td class="px-6 py-4 text-sm">{lead.company || '—'}</td>
                        <td class="px-6 py-4 text-sm text-gray-500">{formatDate(lead.subscribed_at)}</td>
                      </tr>
                    {:else}
                      <tr><td colspan="4" class="px-6 py-8 text-center text-gray-500">No lead magnet captures yet</td></tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

      <!-- Newsletter Tab -->
      {:else if activeTab === 'newsletter'}
        <div class="space-y-6">
          <div class="flex justify-between items-center">
            <div><h2 class="text-2xl font-bold text-gray-900">Newsletter Subscribers</h2><p class="text-gray-600">{newsletters.length} total</p></div>
            <Button onclick={exportNewsletters}><Download class="w-4 h-4 mr-2" />Export</Button>
          </div>
          <div class="flex items-center gap-2">
            <button class={`px-3 py-1.5 rounded-lg text-sm font-medium ${leadFilter === 'all' ? 'bg-[var(--primary)] text-white' : 'text-gray-600 hover:bg-gray-100'}`} onclick={() => leadFilter = 'all'}>All ({getNewsletterSegmentCount('hot') + getNewsletterSegmentCount('warm') + getNewsletterSegmentCount('cold')})</button>
            <button class={`px-3 py-1.5 rounded-lg text-sm font-medium ${leadFilter === 'hot' ? 'bg-red-500 text-white' : 'text-red-600 hover:bg-red-50'}`} onclick={() => leadFilter = 'hot'}>Hot ({getNewsletterSegmentCount('hot')})</button>
            <button class={`px-3 py-1.5 rounded-lg text-sm font-medium ${leadFilter === 'warm' ? 'bg-yellow-500 text-white' : 'text-yellow-600 hover:bg-yellow-50'}`} onclick={() => leadFilter = 'warm'}>Warm ({getNewsletterSegmentCount('warm')})</button>
            <button class={`px-3 py-1.5 rounded-lg text-sm font-medium ${leadFilter === 'cold' ? 'bg-gray-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`} onclick={() => leadFilter = 'cold'}>Cold ({getNewsletterSegmentCount('cold')})</button>
          </div>
          <Card>
            <CardContent class="p-0">
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                      <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Score</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    {#each getFilteredNewsletters() as sub}
                      <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 text-sm font-medium">{sub.email}</td>
                        <td class="px-6 py-4 text-sm">{sub.source || sub.lead_source || '—'}</td>
                        <td class="px-6 py-4 text-center">{#if sub.lead_score != null}<span class={`inline-flex w-10 h-10 rounded-full items-center justify-center text-sm font-bold ${sub.lead_score >= 70 ? 'bg-red-100 text-red-700' : sub.lead_score >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{sub.lead_score}</span>{:else}<span class="text-gray-400">—</span>{/if}</td>
                        <td class="px-6 py-4"><Badge class={segmentColors[sub.lead_segment] || segmentColors.cold}>{segmentIcons[sub.lead_segment] || '📋'} {sub.lead_segment || 'cold'}</Badge></td>
                        <td class="px-6 py-4 text-sm text-gray-500">{formatDate(sub.subscribed_at)}</td>
                      </tr>
                    {:else}
                      <tr><td colspan="5" class="px-6 py-8 text-center text-gray-500">No subscribers yet</td></tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      {/if}

      <!-- Lead Details Modal -->
      {#if showLeadModal && selectedLead}
        <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-bold">Lead Details</h2>
              <button onclick={closeLeadModal} class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"><X class="w-5 h-5" /></button>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
              <Card><CardContent class="space-y-2">
                <div><span class="text-gray-600">Name:</span> <span class="font-medium">{selectedLead.name}</span></div>
                <div><span class="text-gray-600">Email:</span> <span class="font-medium">{selectedLead.email}</span></div>
                <div><span class="text-gray-600">Company:</span> <span class="font-medium">{selectedLead.company || '—'}</span></div>
              </CardContent></Card>
              <Card><CardContent class="space-y-2">
                <div><span class="text-gray-600">Budget:</span> <span class="font-medium">{selectedLead.budget || '—'}</span></div>
                <div><span class="text-gray-600">Status:</span> <Badge class={getStatusColor(selectedLead.status)}>{selectedLead.status}</Badge></div>
                <div><span class="text-gray-600">Source:</span> <span class="font-medium">{selectedLead.lead_source || 'contact'}</span></div>
              </CardContent></Card>
            </div>
            <Card class="mt-4"><CardContent><p class="font-medium mb-2">Message</p><p class="text-gray-700 whitespace-pre-wrap">{selectedLead.message || 'No message provided.'}</p></CardContent></Card>
            <div class="flex gap-3 mt-6">
              {#if selectedLead.status !== 'contacted'}
                <form method="POST" action="?/updateStatus" class="flex-1">
                  <input type="hidden" name="id" value={selectedLead.id} />
                  <input type="hidden" name="status" value="contacted" />
                  <Button type="submit" class="w-full"><CheckCircle class="w-4 h-4 mr-2" />Mark Contacted</Button>
                </form>
              {/if}
              <form method="POST" action="?/updateStatus" class="flex-1">
                <input type="hidden" name="id" value={selectedLead.id} />
                <input type="hidden" name="status" value="closed" />
                <Button variant="outline" type="submit" class="w-full"><XCircle class="w-4 h-4 mr-2" />Close Lead</Button>
              </form>
            </div>
          </div>
        </div>
      {/if}
    </main>
  </div>
</div>
