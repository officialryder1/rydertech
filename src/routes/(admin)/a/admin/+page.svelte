<script>
  import { Shield, Users, Mail, MessageCircle, TrendingUp, Download, Search, ArrowRight, BarChart3, Settings, Bell, CheckCircle, XCircle, Eye, X, FileText } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { fade } from 'svelte/transition';

  let { data } = $props();

  // Local UI state
  let activeTab = $state('overview');
  let searchQuery = $state('');
  let selectedLead = $state(null);
  let showLeadModal = $state(false);

  // Derived from server data
  const submissions = data.submissions;
  const newsletters = data.newsletters;
  const magnets = data.magnets;
  const stats = data.stats;
  const user = data.user;

  // Real percentage change vs previous period
  function getChange(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  const subChange = getChange(stats.weeklySubmissions, stats.monthlySubmissions - stats.weeklySubmissions);
  const newsChange = getChange(stats.weeklySubscribers, stats.monthlySubscribers - stats.weeklySubscribers);
  const magChange = getChange(stats.weeklyMagnets, stats.monthlyMagnets - stats.weeklyMagnets);

  function getFilteredSubmissions() {
    if (!searchQuery) return submissions;
    const q = searchQuery.toLowerCase();
    return submissions.filter(sub =>
      sub.name?.toLowerCase().includes(q) ||
      sub.email?.toLowerCase().includes(q) ||
      sub.company?.toLowerCase().includes(q)
    );
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

  function getPriority(budget) {
    if (!budget) return 'low';
    if (budget.includes('50k+') || budget.includes('25k-50k')) return 'high';
    if (budget.includes('10k-25k')) return 'medium';
    return 'low';
  }

  function getPriorityColor(priority) {
    const colors = {
      'high': 'bg-red-100 text-red-800 border-red-200',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'low': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[priority] || colors.low;
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
            <p class="text-sm text-gray-500">Manage leads and subscribers</p>
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
              { label: 'Contact Leads', value: stats.totalSubmissions, change: subChange, icon: Users, color: 'blue' },
              { label: 'Lead Magnets', value: stats.totalMagnets, change: magChange, icon: Download, color: 'orange' },
              { label: 'Newsletter', value: stats.totalSubscribers, change: newsChange, icon: Mail, color: 'green' },
              { label: 'Pending', value: stats.pendingSubmissions, change: null, icon: MessageCircle, color: 'purple' }
            ] as stat}
              <Card class="hover:shadow-lg transition-shadow duration-300">
                <CardContent class="p-6">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p class="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                      {#if stat.change !== null}
                        <p class="text-xs {stat.change >= 0 ? 'text-green-600' : 'text-red-600'} mt-1">
                          {stat.change >= 0 ? '+' : ''}{stat.change}% this week
                        </p>
                      {/if}
                    </div>
                    <div class="p-3 rounded-lg bg-{stat.color}-100">
                      <stat.icon class="w-6 h-6 text-{stat.color}-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            {/each}
          </div>

          <!-- Status Breakdown -->
          <div class="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Status Breakdown</CardTitle>
                <CardDescription>Current status of all contact submissions</CardDescription>
              </CardHeader>
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
              <CardHeader>
                <CardTitle>This Week</CardTitle>
                <CardDescription>New captures in the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Contact Forms</span>
                    <span class="font-medium">{stats.weeklySubmissions}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Lead Magnets</span>
                    <span class="font-medium">{stats.weeklyMagnets}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Newsletter</span>
                    <span class="font-medium">{stats.weeklySubscribers}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Registered Users</span>
                    <span class="font-medium">{stats.totalUsers}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Recent Leads Preview -->
          <div class="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader class="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle>Recent Leads</CardTitle>
                  <CardDescription>Latest contact form submissions</CardDescription>
                </div>
                <Button variant="outline" size="sm" onclick={exportSubmissions}>
                  <Download class="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div class="space-y-4">
                  {#each submissions.slice(0, 5) as submission}
                    <div class="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                      <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10 rounded-full flex items-center justify-center">
                          <Users class="w-5 h-5 text-[var(--primary)]" />
                        </div>
                        <div>
                          <p class="font-medium text-gray-900">{submission.name}</p>
                          <p class="text-sm text-gray-500">{submission.email}</p>
                        </div>
                      </div>
                      <div class="text-right">
                        <Badge class={getStatusColor(submission.status)}>
                          {submission.status}
                        </Badge>
                        <p class="text-xs text-gray-500 mt-1">
                          {new Date(submission.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  {:else}
                    <p class="text-sm text-gray-500 text-center py-4">No leads yet</p>
                  {/each}
                </div>
                {#if submissions.length > 0}
                  <Button variant="ghost" class="w-full mt-4" onclick={() => activeTab = 'leads'}>
                    View All Leads
                    <ArrowRight class="w-4 h-4 ml-2" />
                  </Button>
                {/if}
              </CardContent>
            </Card>

            <Card>
              <CardHeader class="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle>Recent Subscribers</CardTitle>
                  <CardDescription>Latest newsletter signups</CardDescription>
                </div>
                <Button variant="outline" size="sm" onclick={exportNewsletters}>
                  <Download class="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div class="space-y-4">
                  {#each newsletters.slice(0, 5) as subscriber}
                    <div class="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                      <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                          <Mail class="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p class="font-medium text-gray-900">{subscriber.email}</p>
                          <p class="text-sm text-gray-500 capitalize">{subscriber.source}</p>
                        </div>
                      </div>
                      <p class="text-sm text-gray-500">
                        {new Date(subscriber.subscribed_at).toLocaleDateString()}
                      </p>
                    </div>
                  {:else}
                    <p class="text-sm text-gray-500 text-center py-4">No subscribers yet</p>
                  {/each}
                </div>
                {#if newsletters.length > 0}
                  <Button variant="ghost" class="w-full mt-4" onclick={() => activeTab = 'newsletter'}>
                    View All Subscribers
                    <ArrowRight class="w-4 h-4 ml-2" />
                  </Button>
                {/if}
              </CardContent>
            </Card>
          </div>
        </div>

      <!-- Leads Management Tab -->
      {:else if activeTab === 'leads'}
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Contact Leads</h2>
              <p class="text-gray-600">{submissions.length} total submissions</p>
            </div>
            <div class="flex items-center space-x-3">
              <div class="relative">
                <Search class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  bind:value={searchQuery}
                  placeholder="Search leads..."
                  class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                />
              </div>
              <Button variant="outline" onclick={exportSubmissions}>
                <Download class="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          <Card>
            <CardContent class="p-0">
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    {#each getFilteredSubmissions() as submission}
                      <tr class="hover:bg-gray-50 transition-colors">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div class="font-medium text-gray-900">{submission.name}</div>
                            <div class="text-sm text-gray-500">{submission.email}</div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {submission.company || '—'}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {submission.budget || 'Not specified'}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <Badge class={getPriorityColor(getPriority(submission.budget))}>
                            {getPriority(submission.budget)}
                          </Badge>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <Badge class={getStatusColor(submission.status)}>
                            {submission.status}
                          </Badge>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(submission.submitted_at).toLocaleDateString()}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onclick={() => viewLeadDetails(submission)}
                          >
                            <Eye class="w-4 h-4 mr-1" />
                            View
                          </Button>
                          {#if submission.status === 'new'}
                            <form method="POST" action="?/updateStatus" class="inline">
                              <input type="hidden" name="id" value={submission.id} />
                              <input type="hidden" name="status" value="contacted" />
                              <Button size="sm" type="submit">
                                <CheckCircle class="w-4 h-4 mr-1" />
                                Contacted
                              </Button>
                            </form>
                          {/if}
                        </td>
                      </tr>
                    {:else}
                      <tr>
                        <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                          No leads found
                        </td>
                      </tr>
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
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Lead Magnets</h2>
              <p class="text-gray-600">{magnets.length} captures from /labs tools</p>
            </div>
            <Button variant="outline" onclick={exportMagnets}>
              <Download class="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <!-- Tool breakdown -->
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            {#each ['ops-drain', 'revleak', 'event-access-risk', 'cost-estimator', 'website-rater'] as tool}
              <Card>
                <CardContent class="p-4 text-center">
                  <p class="text-sm text-gray-600">{tool}</p>
                  <p class="text-2xl font-bold">{magnets.filter(m => m.tool_slug === tool).length}</p>
                </CardContent>
              </Card>
            {/each}
          </div>

          <Card>
            <CardContent class="p-0">
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tool</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    {#each magnets as lead}
                      <tr class="hover:bg-gray-50 transition-colors">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.email}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline">{lead.tool_slug}</Badge>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.name || '—'}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.company || '—'}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(lead.captured_at).toLocaleDateString()}
                        </td>
                      </tr>
                    {:else}
                      <tr>
                        <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                          No lead magnet captures yet
                        </td>
                      </tr>
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
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Newsletter Subscribers</h2>
              <p class="text-gray-600">{newsletters.length} total subscribers</p>
            </div>
            <Button onclick={exportNewsletters}>
              <Download class="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <Card>
            <CardContent class="p-0">
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription Date</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    {#each newsletters as subscriber}
                      <tr class="hover:bg-gray-50 transition-colors">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center">
                            <div class="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mr-3">
                              <Mail class="w-4 h-4 text-green-600" />
                            </div>
                            <div class="font-medium text-gray-900">{subscriber.email}</div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {subscriber.source}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(subscriber.subscribed_at).toLocaleDateString()}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <Badge class="bg-green-100 text-green-800 border-green-200">
                            Active
                          </Badge>
                        </td>
                      </tr>
                    {:else}
                      <tr>
                        <td colspan="4" class="px-6 py-8 text-center text-gray-500">
                          No subscribers yet
                        </td>
                      </tr>
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
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-scale-in">
            <!-- Modal Header -->
            <div class="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] p-6 text-white">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-2xl font-bold">Lead Details</h2>
                  <p class="text-white/80">Complete contact form submission</p>
                </div>
                <button
                  onclick={closeLeadModal}
                  class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Modal Content -->
            <div class="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
              <div class="grid md:grid-cols-2 gap-6 mb-6">
                <!-- Contact Information -->
                <Card>
                  <CardHeader>
                    <CardTitle class="flex items-center gap-2">
                      <Users class="w-5 h-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent class="space-y-3">
                    <div class="flex justify-between">
                      <span class="text-gray-600">Name:</span>
                      <span class="font-medium">{selectedLead.name}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Email:</span>
                      <a href="mailto:{selectedLead.email}" class="font-medium text-[var(--primary)] hover:underline">
                        {selectedLead.email}
                      </a>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Company:</span>
                      <span class="font-medium">{selectedLead.company || 'Not provided'}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Submitted:</span>
                      <span class="font-medium">
                        {new Date(selectedLead.submitted_at).toLocaleDateString()} at {new Date(selectedLead.submitted_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <!-- Project Details -->
                <Card>
                  <CardHeader>
                    <CardTitle class="flex items-center gap-2">
                      <FileText class="w-5 h-5" />
                      Project Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent class="space-y-3">
                    <div class="flex justify-between">
                      <span class="text-gray-600">Budget:</span>
                      <Badge variant="outline">{selectedLead.budget || 'Not specified'}</Badge>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Timeline:</span>
                      <Badge variant="outline">{selectedLead.timeline || 'Not specified'}</Badge>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Priority:</span>
                      <Badge class={getPriorityColor(getPriority(selectedLead.budget))}>
                        {getPriority(selectedLead.budget)}
                      </Badge>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Status:</span>
                      <Badge class={getStatusColor(selectedLead.status)}>
                        {selectedLead.status}
                      </Badge>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Source:</span>
                      <span class="font-medium">{selectedLead.lead_source || 'contact'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <!-- Project Message -->
              <Card>
                <CardHeader>
                  <CardTitle class="flex items-center gap-2">
                    <MessageCircle class="w-5 h-5" />
                    Project Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div class="bg-gray-50 rounded-lg p-4 border">
                    <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedLead.message || 'No message provided.'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <!-- Action Buttons -->
              <div class="flex flex-wrap gap-3 mt-6 pt-6 border-t">
                {#if selectedLead.status !== 'contacted'}
                  <form method="POST" action="?/updateStatus">
                    <input type="hidden" name="id" value={selectedLead.id} />
                    <input type="hidden" name="status" value="contacted" />
                    <Button type="submit" class="flex-1 min-w-[200px]">
                      <CheckCircle class="w-4 h-4 mr-2" />
                      Mark as Contacted
                    </Button>
                  </form>
                {:else}
                  <Button disabled class="flex-1 min-w-[200px]">
                    <CheckCircle class="w-4 h-4 mr-2" />
                    Already Contacted
                  </Button>
                {/if}

                <Button
                  variant="outline"
                  onclick={() => window.open(`mailto:${selectedLead.email}?subject=Regarding your inquiry&body=Hi ${selectedLead.name},`, '_blank')}
                  class="flex-1 min-w-[200px]"
                >
                  <Mail class="w-4 h-4 mr-2" />
                  Send Email
                </Button>

                <form method="POST" action="?/updateStatus">
                  <input type="hidden" name="id" value={selectedLead.id} />
                  <input type="hidden" name="status" value="closed" />
                  <Button variant="outline" type="submit" class="flex-1 min-w-[200px]">
                    <XCircle class="w-4 h-4 mr-2" />
                    Close Lead
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </main>
  </div>
</div>

<style>
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }
  .animate-scale-in {
    animation: scaleIn 0.3s ease-out;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
</style>
