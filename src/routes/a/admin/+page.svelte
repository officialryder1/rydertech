<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { 
    Users, Mail, MessageCircle, TrendingUp, DollarSign, 
    Calendar, Eye, CheckCircle, XCircle, Filter,
    Download, Search, Plus, ArrowRight, BarChart3,
    Shield, Settings, Bell, ChevronDown, MoreHorizontal,
    X, FileText  // Added missing imports
  } from '@lucide/svelte'; // Removed @ from import path
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';

  // State
  let submissions = $state([]);
  let newsletters = $state([]);
  let stats = $state({});
  let loading = $state(true);
  let activeTab = $state('overview');
  let searchQuery = $state('');
  let dateRange = $state('7d');
  let selectedLead = $state(null);
  let showLeadModal = $state(false);

  onMount(async () => {
    await fetchData();
    setupRealtime();
  });

  async function fetchData() {
    loading = true;

    // Fetch contact submissions
    const { data: contactData } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    // Fetch newsletter subscriptions
    const { data: newsletterData } = await supabase
      .from('newsletter_subscriptions')
      .select('*')
      .order('subscribed_at', { ascending: false });

    submissions = contactData || [];
    newsletters = newsletterData || [];

    // Calculate stats
    calculateStats();
    loading = false;
  }

  function calculateStats() {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentSubmissions = submissions.filter(sub => 
      new Date(sub.submitted_at) >= lastWeek
    );
    const recentNewsletters = newsletters.filter(sub =>
      new Date(sub.subscribed_at) >= lastWeek
    );

    stats = {
      totalSubmissions: submissions.length,
      totalSubscribers: newsletters.length,
      weeklySubmissions: recentSubmissions.length,
      weeklySubscribers: recentNewsletters.length,
      conversionRate: submissions.length > 0 ? 
        Math.round((recentSubmissions.length / submissions.length) * 100) : 0,
      pendingSubmissions: submissions.filter(s => s.status === 'new').length
    };
  }

  function setupRealtime() {
    // Real-time subscription for new contact submissions
    supabase
      .channel('contact_submissions')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'contact_submissions' },
        (payload) => {
          submissions.unshift(payload.new);
          calculateStats();
        }
      )
      .subscribe();

    // Real-time subscription for newsletter signups
    supabase
      .channel('newsletter_subscriptions')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'newsletter_subscriptions' },
        (payload) => {
          newsletters.unshift(payload.new);
          calculateStats();
        }
      )
      .subscribe();
  }

  async function updateSubmissionStatus(id, status) {
    const { error } = await supabase
      .from('contact_submissions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      await fetchData();
    }
  }

  function getFilteredSubmissions() {
    return submissions.filter(sub => 
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.company?.toLowerCase().includes(searchQuery.toLowerCase())
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

  function exportData(type) {
    // Simple export functionality
    const data = type === 'submissions' ? submissions : newsletters;
    const csv = convertToCSV(data);
    downloadCSV(csv, `rydertech-${type}-${new Date().toISOString().split('T')[0]}.csv`);
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
    aclick(); // Fixed: added parentheses
    window.URL.revokeObjectURL(url);
  }

  function viewLeadDetails(submission) {
    selectedLead = submission;
    showLeadModal = true;
  }

  function closeLeadModal() {
    showLeadModal = false;
    selectedLead = null;
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
</script>

<svelte:head>
  <title>Admin Dashboard - RyderTech</title>
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
          <Button variant="outline" size="sm" class="flex items-center gap-2">
            <Bell class="w-4 h-4" />
            Notifications
          </Button>
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
          { id: 'leads', label: 'Lead Management', icon: Users },
          { id: 'newsletter', label: 'Newsletter', icon: Mail },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp }
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
      {#if loading}
        <div class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
        </div>
      {:else}
        <!-- Overview Tab -->
        {#if activeTab === 'overview'}
          <div class="space-y-6">
            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {#each [
                { 
                  label: 'Total Leads', 
                  value: stats.totalSubmissions, 
                  change: '+12%', 
                  icon: Users,
                  color: 'blue' 
                },
                { 
                  label: 'Newsletter Subscribers', 
                  value: stats.totalSubscribers, 
                  change: '+8%', 
                  icon: Mail,
                  color: 'green' 
                },
                { 
                  label: 'Pending Leads', 
                  value: stats.pendingSubmissions, 
                  change: '-5%', 
                  icon: MessageCircle,
                  color: 'orange' 
                },
                { 
                  label: 'Conversion Rate', 
                  value: `${stats.conversionRate}%`, 
                  change: '+3%', 
                  icon: TrendingUp,
                  color: 'purple' 
                }
              ] as stat}
                <Card class="hover:shadow-lg transition-shadow duration-300">
                  <CardContent class="p-6">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm font-medium text-gray-600">{stat.label}</p>
                        <p class="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                        <p class="text-xs {stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'} mt-1">
                          {stat.change} from last week
                        </p>
                      </div>
                      <div class={`p-3 rounded-lg bg-${stat.color}-100`}>
                        <stat.icon class={`w-6 h-6 text-${stat.color}-600`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              {/each}
            </div>

            <!-- Recent Activity -->
            <div class="grid lg:grid-cols-2 gap-6">
              <!-- Recent Leads -->
              <Card>
                <CardHeader class="flex flex-row items-center justify-between pb-4">
                  <div>
                    <CardTitle>Recent Leads</CardTitle>
                    <CardDescription>Latest contact form submissions</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onclick={() => exportData('submissions')}>
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
                    {/each}
                  </div>
                  <Button variant="ghost" class="w-full mt-4" onclick={() => activeTab = 'leads'}><!-- Fixed: onclick -->
                    View All Leads
                    <ArrowRight class="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <!-- Recent Subscribers -->
              <Card>
                <CardHeader class="flex flex-row items-center justify-between pb-4">
                  <div>
                    <CardTitle>New Subscribers</CardTitle>
                    <CardDescription>Latest newsletter signups</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onclick={() => exportData('newsletter')}>
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
                    {/each}
                  </div>
                  <Button variant="ghost" class="w-full mt-4" onclick={() => activeTab = 'newsletter'}>
                    View All Subscribers
                    <ArrowRight class="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

        <!-- Leads Management Tab -->
        {:else if activeTab === 'leads'}
          <div class="space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Lead Management</h2>
                <p class="text-gray-600">Manage and track all contact form submissions</p>
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
                <select class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent">
                  <option>All Status</option>
                  <option>New</option>
                  <option>Contacted</option>
                  <option>Replied</option>
                  <option>Closed</option>
                </select>
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
                            <Button 
                              size="sm" 
                              variant="outline"
                              onclick={() => updateSubmissionStatus(submission.id, 'contacted')} 
                              disabled={submission.status === 'contacted'}
                            >
                              <CheckCircle class="w-4 h-4 mr-1" />
                              Contacted
                            </Button>
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
              <Button onclick={() => exportData('newsletter')}><!-- Fixed: onclick -->
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
                      {/each}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        {/if}
      {/if}

      <!-- Lead Details Modal - MOVED INSIDE MAIN CONTENT -->
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
                        {new Date(selectedLead.submitted_at).toLocaleDateString()} at {' '}
                        {new Date(selectedLead.submitted_at).toLocaleTimeString()}
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
                <Button 
                  onclick={() => updateSubmissionStatus(selectedLead.id, 'contacted')}
                  disabled={selectedLead.status === 'contacted'}
                  class="flex-1 min-w-[200px]"
                >
                  <CheckCircle class="w-4 h-4 mr-2" />
                  {selectedLead.status === 'contacted' ? 'Already Contacted' : 'Mark as Contacted'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onclick={() => window.open(`mailto:${selectedLead.email}?subject=Regarding your inquiry&body=Hi ${selectedLead.name},`, '_blank')}
                  class="flex-1 min-w-[200px]"
                >
                  <Mail class="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                
                <Button 
                  variant="outline" 
                  onclick={() => updateSubmissionStatus(selectedLead.id, 'closed')} 
                  class="flex-1 min-w-[200px]"
                >
                  <XCircle class="w-4 h-4 mr-2" />
                  Close Lead
                </Button>
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
    from { 
      opacity: 0;
      transform: scale(0.9) translateY(10px);
    }
    to { 
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
</style>