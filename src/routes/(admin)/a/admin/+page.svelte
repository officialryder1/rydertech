<script>
  import { Shield, Users, Mail, MessageCircle, TrendingUp, Download, Search, ArrowRight, BarChart3, Settings, CheckCircle, XCircle, Eye, X, Building2, CheckCircle2, AlertCircle, ExternalLink, Bell, Zap, Target, Calendar, Filter, ChevronDown, ChevronUp, MoreHorizontal, Edit, Trash2, FileText, PieChart, Activity, AlertTriangle, Star, Flag, Clock, RefreshCw, Send, List, History } from '@lucide/svelte';
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
    let hotLeadsAlert = $state(true);
    let dateRange = $state('week'); // 'week' | 'month' | 'quarter'
    let sortBy = $state('score'); // 'score' | 'date' | 'source'
    let sortOrder = $state('desc'); // 'asc' | 'desc'
    let showAdvancedFilters = $state(false);

    // Nurture automation state
    let nurtureStats = $state({ totalEnrolled: 0, activeSequences: 0, touchesSent30d: 0, completed: 0 });
    let nurtureLeads = $state([]);
    let dueTouches = $state([]);
    let sendLog = $state([]);
    let previewTouchData = $state(null);
    let nurtureLoading = $state(false);

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

  // ---- Intelligence Layer Helpers ----
  function getHotLeads() {
  	return submissions.filter(s => s.lead_segment === 'hot').sort((a, b) => b.lead_score - a.lead_score);
  }

  function getWeeklyTrend() {
  	const weeks = 8;
  	const now = new Date();
  	const trend = [];
  	for (let i = weeks - 1; i >= 0; i--) {
  		const weekStart = new Date(now);
  		weekStart.setDate(now.getDate() - now.getDay() - 7 * i);
  		weekStart.setHours(0, 0, 0, 0);
  		const weekEnd = new Date(weekStart);
  		weekEnd.setDate(weekEnd.getDate() + 6);
  		weekEnd.setHours(23, 59, 59, 999);
		
  		const weekLeads = submissions.filter(s => {
  			const d = new Date(s.submitted_at);
  			return d >= weekStart && d <= weekEnd;
  		});
  		const weekMagnets = magnets.filter(m => {
  			const d = new Date(m.subscribed_at);
  			return d >= weekStart && d <= weekEnd;
  		});
  		const weekNewsletters = newsletters.filter(n => {
  			const d = new Date(n.subscribed_at);
  			return d >= weekStart && d <= weekEnd;
  		});
		
  		trend.push({
  			week: weekStart.toISOString().slice(0, 10),
  			leads: weekLeads.length,
  			magnets: weekMagnets.length,
  			newsletters: weekNewsletters.length,
  			hot: weekLeads.filter(l => l.lead_segment === 'hot').length
  		});
  	}
  	return trend;
  }

  function getSourceAttribution() {
  	const sources = {};
	
  	[...submissions, ...magnets, ...newsletters].forEach(item => {
  		const src = item.lead_source || item.source || 'direct';
  		if (!sources[src]) sources[src] = { leads: 0, magnets: 0, hot: 0, avgScore: 0 };
  		if (item.lead_score != null) {
  			sources[src].avgScore = (sources[src].avgScore * (sources[src].leads + sources[src].magnets) + item.lead_score) / (sources[src].leads + sources[src].magnets + 1);
  		}
  		if (submissions.includes(item)) sources[src].leads++;
  		if (magnets.includes(item)) sources[src].magnets++;
  		if (item.lead_segment === 'hot') sources[src].hot++;
  	});
	
  	return Object.entries(sources)
  		.map(([source, data]) => ({ source, ...data, avgScore: Math.round(data.avgScore) }))
  		.sort((a, b) => (b.leads + b.magnets) - (a.leads + a.magnets))
  		.slice(0, 10);
  }

  function getConversionFunnel() {
  	const totalLeads = submissions.length + magnets.length + newsletters.length;
  	const contacted = submissions.filter(s => s.status === 'contacted').length + submissions.filter(s => s.status === 'replied').length;
  	const replied = submissions.filter(s => s.status === 'replied').length;
  	// Scoping calls would be tracked separately; for now estimate from hot leads
  	const scoping = getHotLeads().length;
  	const paid = 0; // Would come from CRM/Stripe integration
	
  	return [
  		{ stage: 'Total Leads', count: totalLeads, pct: 100, color: 'blue' },
  		{ stage: 'Contacted', count: contacted, pct: totalLeads > 0 ? Math.round((contacted / totalLeads) * 100) : 0, color: 'green' },
  		{ stage: 'Replied', count: replied, pct: totalLeads > 0 ? Math.round((replied / totalLeads) * 100) : 0, color: 'purple' },
  		{ stage: 'Scoping Calls', count: scoping, pct: totalLeads > 0 ? Math.round((scoping / totalLeads) * 100) : 0, color: 'amber' },
  		{ stage: 'Paid', count: paid, pct: totalLeads > 0 ? Math.round((paid / totalLeads) * 100) : 0, color: 'emerald' }
  	];
  }

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
  	// Sort
  	result = [...result].sort((a, b) => {
  		if (sortBy === 'score') return sortOrder === 'desc' ? (b.lead_score || 0) - (a.lead_score || 0) : (a.lead_score || 0) - (b.lead_score || 0);
  		if (sortBy === 'date') return sortOrder === 'desc' ? new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime() : new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
  		if (sortBy === 'source') return sortOrder === 'desc' ? (a.lead_source || '').localeCompare(b.lead_source || '') : (b.lead_source || '').localeCompare(a.lead_source || '');
  		return 0;
  	});
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

    // ---- Nurture Automation Functions ----
    async function fetchNurtureData() {
      nurtureLoading = true;
      try {
        const [statsRes, leadsRes, dueRes, logRes] = await Promise.all([
          fetch('/api/admin/nurture/stats').then(r => r.json()),
          fetch('/api/admin/nurture/leads').then(r => r.json()),
          fetch('/api/admin/nurture/due').then(r => r.json()),
          fetch('/api/admin/nurture/log').then(r => r.json())
        ]);
        nurtureStats = statsRes.data || nurtureStats;
        nurtureLeads = leadsRes.data || [];
        dueTouches = dueRes.data || [];
        sendLog = logRes.data || [];
      } catch (e) {
        console.error('Failed to fetch nurture data:', e);
      } finally {
        nurtureLoading = false;
      }
    }

    async function runNurtureCycle() {
      nurtureLoading = true;
      try {
        const res = await fetch('/api/admin/nurture/run', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          await fetchNurtureData();
          alert(`Cycle complete: ${data.enrolled} enrolled, ${data.touchesSent} touches sent, ${data.errors} errors`);
        } else {
          alert('Cycle failed: ' + data.error);
        }
      } catch (e) {
        console.error('Nurture cycle failed:', e);
        alert('Cycle failed: ' + e.message);
      } finally {
        nurtureLoading = false;
      }
    }

    async function triggerFullSync() {
      nurtureLoading = true;
      try {
        const res = await fetch('/api/admin/nurture/sync', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          await fetchNurtureData();
          alert(`Sync complete: ${data.enrolled} new leads enrolled`);
        } else {
          alert('Sync failed: ' + data.error);
        }
      } catch (e) {
        console.error('Full sync failed:', e);
        alert('Sync failed: ' + e.message);
      } finally {
        nurtureLoading = false;
      }
    }

    async function refreshDueTouches() {
      try {
        const res = await fetch('/api/admin/nurture/due');
        const data = await res.json();
        dueTouches = data.data || [];
      } catch (e) {
        console.error('Failed to refresh due touches:', e);
      }
    }

    async function sendManualTouch(email, tool, name, touch) {
      try {
        const res = await fetch('/api/admin/nurture/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, tool, name, touch })
        });
        const data = await res.json();
        if (data.success) {
          await fetchNurtureData();
          alert(`Touch ${touch} sent to ${email}`);
        } else {
          alert('Send failed: ' + data.error);
        }
      } catch (e) {
        console.error('Manual send failed:', e);
        alert('Send failed: ' + e.message);
      }
    }

    function previewTouch(tool, touch, name = 'there') {
      const toolUrls = {
        ops_drain: '/labs/ops-drain',
        revleak: '/labs/revleak',
        event_risk: '/labs/event-access-risk',
        website_rater: '/labs/website-rater',
        visibility: '/labs/visibility',
        aeo: '/labs/aeo-readiness',
        clausescan: '/labs/clausescan',
        gateway_calc: '/labs/gateway-calc',
        agentic_cost: '/labs/agentic-workflow-cost',
        q_day: '/labs/q-day-readiness',
        gpt6_checker: '/labs/gpt-6-checker',
        headline_studio: '/labs/headline-studio',
        content_repurposer: '/labs/content-repurposer',
        property_chatbot: '/labs/property-chatbot',
        cost_estimator: '/labs/cost-estimator',
        agent_templates: '/labs/agent-templates',
        automation_readiness: '/labs/automation-readiness',
        voice_agent: '/services/ai',
        ai_widget: '/services/ai',
        course_interest: '/courses',
        contact: '/contact'
      };
      const toolUrl = toolUrls[tool] || '/labs';
    
      // Templates matching internalNurture.ts
      const templates = {
        ops_drain: {
          1: { subject: 'Your Ops Drain audit — the 1-line version', body: (n, u) => `Hi ${n},\n\nThanks for running the Ops Drain Calculator. The headline: you're losing hours every week to manual work that a simple workflow could handle.\n\nHere's your branded audit you can keep/share: https://rydertech.ng${u}\n\nIn two days I'll send the 3 automations that recover the most staff time.\n\n— Victor, RyderTech` },
          2: { subject: '3 automations that recover the most staff time', body: (n, u) => `Hi ${n},\n\nThe three workflows that consistently pay for themselves in month one:\n\n1. Invoicing & billing — webhook → PDF → auto-send. Kills monthly reconciliation.\n2. Client onboarding — self-serve forms → database → welcome sequence. No copy-paste.\n3. Reporting — scheduled job aggregates data → emails digest. Zero manual pulls.\n\nIf any of those are still human-powered in your shop, that's exactly what we'd automate first.\n\n— Victor, RyderTech` },
          3: { subject: 'Worth a 15-minute scoping call?', body: (n, u) => `Hi ${n},\n\nI'll stop here. If the audit made you wince, the next step is a 15-minute scoping call — I'll show you what automating your top task actually looks like and what it costs.\n\nGrab a slot: https://rydertech.ng/contact\n\nIf the timing's off, just reply "later" and I'll check back next quarter.\n\n— Victor, RyderTech` }
        },
        revleak: {
          1: { subject: 'Your RevLeak audit — the 1-line version', body: (n, u) => `Hi ${n},\n\nThanks for running the RevLeak Auditor. The headline: your funnel has specific, measurable leaks — and each one is fixable.\n\nHere's your branded audit you can keep/share: https://rydertech.ng${u}\n\nIn two days I'll send the 3 speed fixes that lift conversion fastest.\n\n— Victor, RyderTech` },
          2: { subject: '3 speed fixes that lift conversion', body: (n, u) => `Hi ${n},\n\nThe three fixes that consistently lift funnel conversion:\n\n1. Above-the-fold clarity — headline + outcome + CTA in 3 seconds.\n2. Trust density — logos, outcomes, specifics near every ask.\n3. Friction removal — kill fields, auto-fill, one-click where possible.\n\nImplement those and your leak score drops 2-3 points. That's real revenue.\n\n— Victor, RyderTech` },
          3: { subject: 'Worth a 15-minute CRO audit?', body: (n, u) => `Hi ${n},\n\nI'll stop here. If you want to close the leaks, the next step is a 15-minute CRO audit — I'll walk your live funnel, prioritize fixes, and quote the implementation.\n\nBook it: https://rydertech.ng/contact\n\nIf now's not the time, reply "later" and I'll check back next quarter.\n\n— Victor, RyderTech` }
        },
        website_rater: {
          1: { subject: 'Your Website Review — the 1-line version', body: (n, u) => `Hi ${n},\n\nThanks for running the Website Review. The headline: your site has specific, fixable gaps that are costing you leads and credibility every day.\n\nHere's your branded audit you can keep/share: https://rydertech.ng${u}\n\nIn two days I'll send the 3 quick wins that move the needle fastest.\n\n— Victor, RyderTech` },
          2: { subject: '3 quick wins for a higher-converting site', body: (n, u) => `Hi ${n},\n\nThe three fixes that consistently lift conversion for sites like yours:\n\n1. Above-the-fold clarity — headline + subhead + CTA in the first 3 seconds.\n2. Trust signals — logos, testimonials, concrete outcomes near every ask.\n3. Friction removal — kill fields, auto-fill, one-click actions where possible.\n\nImplement those and your score jumps 2-3 points. That's real revenue.\n\n— Victor, RyderTech` },
          3: { subject: 'Worth a 15-minute CRO audit?', body: (n, u) => `Hi ${n},\n\nI'll stop here. If the review showed gaps you want to close, the next step is a 15-minute CRO audit — I'll walk your live site, prioritize the fixes, and quote the implementation.\n\nBook it: https://rydertech.ng/contact\n\nIf now's not the time, reply "later" and I'll check back next quarter.\n\n— Victor, RyderTech` }
        }
      };
    
      const t = templates[tool]?.[touch] || { subject: 'Preview', body: () => 'Template not found' };
      const subject = t.subject;
      const body = t.body(name, toolUrl);
    
      previewTouchData = { tool, touch, subject, body };
    }

    // Load nurture data when tab is activated
    let previousTab = 'overview';
    $effect(() => {
      if (activeTab === 'nurture' && previousTab !== 'nurture') {
        fetchNurtureData();
      }
      previousTab = activeTab;
    });
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
                { id: 'nurture', label: 'Nurture', icon: Zap },
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
              <!-- Hot Leads Alert Banner -->
              {#if hotLeadsAlert && getHotLeads().length > 0}
                <div class="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div class="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle class="w-5 h-5 text-red-600" />
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-red-800">{getHotLeads().length} hot lead{getHotLeads().length !== 1 ? 's' : ''} this week</p>
                    <p class="text-sm text-red-700">Prioritize outreach to high-score leads before they cool down.</p>
                  </div>
                  <Button variant="outline" size="sm" onclick={() => { activeTab = 'leads'; leadFilter = 'hot'; hotLeadsAlert = false; }}>
                    View Hot Leads
                  </Button>
                  <button onclick={() => hotLeadsAlert = false} class="text-red-500 hover:text-red-700">
                    <X class="w-5 h-5" />
                  </button>
                </div>
              {/if}

              <div class="flex items-center justify-between">
                <h2 class="text-2xl font-bold text-gray-900">Overview</h2>
                <div class="flex items-center gap-2">
                  <Button variant="outline" size="sm" onclick={() => showAdvancedFilters = !showAdvancedFilters}>
                    <Filter class="w-4 h-4 mr-1" /> Advanced
                  </Button>
                </div>
              </div>

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

              <!-- Lead Quality Score + Source Attribution + Conversion Funnel -->
              <div class="grid lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader><CardTitle class="flex items-center gap-2"><Star class="w-4 h-4 text-amber-500" /> Lead Quality Score</CardTitle></CardHeader>
                  <CardContent>
                    <div class="space-y-3">
                      {#each [
                        { label: 'Hot', count: getSegmentCount('hot'), icon: '🔥', color: 'red', pct: stats.totalSubmissions > 0 ? Math.round((getSegmentCount('hot') / stats.totalSubmissions) * 100) : 0 },
                        { label: 'Warm', count: getSegmentCount('warm'), icon: '⏳', color: 'yellow', pct: stats.totalSubmissions > 0 ? Math.round((getSegmentCount('warm') / stats.totalSubmissions) * 100) : 0 },
                        { label: 'Cold', count: getSegmentCount('cold'), icon: '📋', color: 'gray', pct: stats.totalSubmissions > 0 ? Math.round((getSegmentCount('cold') / stats.totalSubmissions) * 100) : 0 }
                      ] as item}
                        <div class="flex items-center justify-between">
                          <span class="text-sm text-gray-600 flex items-center gap-2">{item.icon} {item.label}</span>
                          <div class="flex items-center gap-3">
                            <Badge class="bg-{item.color}-100 text-{item.color}-800">{item.count}</Badge>
                            <span class="text-xs text-gray-500">{item.pct}%</span>
                          </div>
                        </div>
                      {/each}
                      <div class="pt-2 border-t">
                        <div class="flex items-center justify-between text-sm">
                          <span class="text-gray-600">Total Scored</span>
                          <span class="font-medium">{stats.totalSubmissions}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle class="flex items-center gap-2"><Target class="w-4 h-4 text-blue-500" /> Top Sources</CardTitle></CardHeader>
                  <CardContent>
                    <div class="space-y-2">
                      {#each getSourceAttribution() as src}
                        <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900 truncate">{src.source}</p>
                            <p class="text-xs text-gray-500">{src.leads} leads • {src.magnets} magnets • {src.hot} hot</p>
                          </div>
                          <div class="text-right">
                            <p class="text-sm font-medium text-gray-900">{src.avgScore}/100</p>
                            <p class="text-xs text-gray-500">Avg Score</p>
                          </div>
                        </div>
                      {:else}
                        <p class="text-sm text-gray-500 text-center py-4">No source data yet</p>
                      {/each}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle class="flex items-center gap-2"><Activity class="w-4 h-4 text-green-500" /> Conversion Funnel</CardTitle></CardHeader>
                  <CardContent>
                    <div class="space-y-3">
                      {#each getConversionFunnel() as stage}
                        <div>
                          <div class="flex items-center justify-between text-sm mb-1">
                            <span class="text-gray-600">{stage.stage}</span>
                            <span class="font-medium">{stage.count} ({stage.pct}%)</span>
                          </div>
                          <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div class="h-full bg-{stage.color}-500 rounded-full transition-all" style="width: {stage.pct}%"></div>
                          </div>
                        </div>
                      {/each}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <!-- Weekly Trend Chart -->
              <Card>
                <CardHeader><CardTitle class="flex items-center gap-2"><BarChart3 class="w-4 h-4 text-purple-500" /> Weekly Trend (8 Weeks)</CardTitle></CardHeader>
                <CardContent>
                  <div class="flex items-end gap-2 h-48">
                    {#each getWeeklyTrend() as week}
                      <div class="flex-1 flex flex-col items-center gap-1">
                        <span class="text-xs font-medium text-gray-600">{week.leads + week.magnets + week.newsletters}</span>
                        <div class="w-full flex gap-1" style="height: {Math.max(4, (week.leads + week.magnets + week.newsletters) * 12)}px">
                          <div class="flex-1 bg-blue-500" style="width: {week.leads > 0 ? (week.leads / (week.leads + week.magnets + week.newsletters || 1)) * 100 : 0}%"></div>
                          <div class="flex-1 bg-orange-500" style="width: {week.magnets > 0 ? (week.magnets / (week.leads + week.magnets + week.newsletters || 1)) * 100 : 0}%"></div>
                          <div class="flex-1 bg-green-500" style="width: {week.newsletters > 0 ? (week.newsletters / (week.leads + week.magnets + week.newsletters || 1)) * 100 : 0}%"></div>
                        </div>
                        <span class="text-xs text-gray-500">{week.week.slice(5)}</span>
                        {#if week.hot > 0}
                          <span class="text-xs text-red-600 font-medium">🔥 {week.hot}</span>
                        {/if}
                      </div>
                    {/each}
                  </div>
                  <div class="mt-4 flex items-center gap-4 text-xs text-gray-500">
                    <span class="flex items-center gap-1"><span class="w-3 h-3 bg-blue-500 rounded" /> Contact Forms</span>
                    <span class="flex items-center gap-1"><span class="w-3 h-3 bg-orange-500 rounded" /> Lead Magnets</span>
                    <span class="flex items-center gap-1"><span class="w-3 h-3 bg-green-500 rounded" /> Newsletter</span>
                    <span class="flex items-center gap-1 text-red-600">🔥 Hot Leads</span>
                  </div>
                </CardContent>
              </Card>

              <!-- Recent Hot Leads Priority Table -->
              {#if getHotLeads().length > 0}
                <Card class="border-red-200 bg-red-50">
                  <CardHeader><CardTitle class="flex items-center gap-2"><Flag class="w-4 h-4 text-red-500" /> Hot Leads - Action Required</CardTitle></CardHeader>
                  <CardContent>
                    <div class="overflow-x-auto">
                      <table class="w-full">
                        <thead class="bg-red-100 border-b border-red-200">
                          <tr>
                            <th class="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase">Lead</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase">Company</th>
                            <th class="px-4 py-2 text-center text-xs font-medium text-red-700 uppercase">Score</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase">Source</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase">Date</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase">Action</th>
                          </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-red-100">
                          {#each getHotLeads().slice(0, 10) as lead}
                            <tr class="hover:bg-red-50">
                              <td class="px-4 py-3">
                                <div class="font-medium text-gray-900">{lead.name}</div>
                                <div class="text-sm text-gray-500">{lead.email}</div>
                              </td>
                              <td class="px-4 py-3 text-sm">{lead.company || '—'}</td>
                              <td class="px-4 py-3 text-center">
                                <span class="inline-flex w-10 h-10 rounded-full items-center justify-center text-sm font-bold bg-red-100 text-red-700">{lead.lead_score}</span>
                              </td>
                              <td class="px-4 py-3"><Badge variant="outline">{lead.lead_source || 'direct'}</Badge></td>
                              <td class="px-4 py-3 text-sm text-gray-500">{formatDate(lead.submitted_at)}</td>
                              <td class="px-4 py-3">
                                <form method="POST" action="?/updateStatus" class="inline">
                                  <input type="hidden" name="id" value={lead.id} />
                                  <input type="hidden" name="status" value="contacted" />
                                  <Button size="sm" type="submit"><CheckCircle class="w-4 h-4" /></Button>
                                </form>
                              </td>
                            </tr>
                          {/each}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              {/if}

              <!-- Recent Leads + Subscribers -->
              <div class="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader class="flex items-center justify-between">
                    <CardTitle>Recent Leads</CardTitle>
                    <Button variant="ghost" size="sm" onclick={() => activeTab = 'leads'}>View all <ArrowRight class="w-3 h-3 ml-1" /></Button>
                  </CardHeader>
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
                  <CardHeader class="flex items-center justify-between">
                    <CardTitle>Recent Subscribers</CardTitle>
                    <Button variant="ghost" size="sm" onclick={() => activeTab = 'newsletter'}>View all <ArrowRight class="w-3 h-3 ml-1" /></Button>
                  </CardHeader>
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
          
                <!-- Advanced Filters -->
                {#if showAdvancedFilters}
                  <div class="flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-lg border">
                    <div class="flex items-center gap-2">
                      <Label class="text-sm">Sort by:</Label>
                      <select bind:value={sortBy} class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
                        <option value="score">Lead Score</option>
                        <option value="date">Date</option>
                        <option value="source">Source</option>
                      </select>
                    </div>
                    <div class="flex items-center gap-2">
                      <Label class="text-sm">Order:</Label>
                      <select bind:value={sortOrder} class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                      </select>
                    </div>
                    <div class="flex items-center gap-2">
                      <Label class="text-sm">Date Range:</Label>
                      <select bind:value={dateRange} class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="quarter">This Quarter</option>
                      </select>
                    </div>
                    <Button variant="ghost" size="sm" onclick={() => showAdvancedFilters = false}><X class="w-4 h-4 mr-1" /> Hide</Button>
                  </div>
                {/if}

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

                        <!-- Nurture Automation Tab -->
                        {:else if activeTab === 'nurture'}
                  <div class="space-y-6">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div><h2 class="text-2xl font-bold text-gray-900">Nurture Automation</h2><p class="text-gray-600">Monitor and control automated lead nurture sequences</p></div>
                      <div class="flex items-center gap-2">
                        <Button variant="outline" size="sm" onclick={() => runNurtureCycle()}>
                          <Zap class="w-4 h-4 mr-2" /> Run Cycle
                        </Button>
                        <Button variant="primary" size="sm" onclick={() => triggerFullSync()}>
                          <RefreshCw class="w-4 h-4 mr-2" /> Full Sync
                        </Button>
                      </div>
                    </div>

                    <!-- Nurture Pipeline Stats -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {#each [
                        { label: 'Enrolled', value: nurtureStats?.totalEnrolled || 0, icon: Users, color: 'blue' },
                        { label: 'Active Sequences', value: nurtureStats?.activeSequences || 0, icon: Zap, color: 'amber' },
                        { label: 'Touches Sent (30d)', value: nurtureStats?.touchesSent30d || 0, icon: Mail, color: 'green' },
                        { label: 'Completed', value: nurtureStats?.completed || 0, icon: CheckCircle2, color: 'purple' }
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

                    <!-- Due Touches Queue -->
                    <Card>
                      <CardHeader class="flex items-center justify-between">
                        <CardTitle class="flex items-center gap-2"><Clock class="w-4 h-4 text-blue-500" /> Due for Next Touch</CardTitle>
                        <Button variant="ghost" size="sm" onclick={() => refreshDueTouches()}>
                          <RefreshCw class="w-4 h-4 mr-1" /> Refresh
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div class="overflow-x-auto">
                          <table class="w-full">
                            <thead class="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tool</th>
                                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Next Touch</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Since Capture</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                              </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                              {#each dueTouches as touch}
                                <tr class="hover:bg-gray-50">
                                  <td class="px-6 py-4">
                                    <div class="font-medium text-gray-900">{touch.email}</div>
                                    <div class="text-sm text-gray-500">{touch.name}</div>
                                  </td>
                                  <td class="px-6 py-4">
                                    <Badge variant="outline">{touch.tool}</Badge>
                                  </td>
                                  <td class="px-6 py-4 text-center">
                                    <span class={`inline-flex w-10 h-10 rounded-full items-center justify-center text-sm font-bold ${touch.nextTouch === 1 ? 'bg-blue-100 text-blue-700' : touch.nextTouch === 2 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                      Touch {touch.nextTouch}
                                    </span>
                                  </td>
                                  <td class="px-6 py-4 text-sm text-gray-600">{touch.daysSinceCapture}d</td>
                                  <td class="px-6 py-4">
                                    {#if touch.leadScore != null}
                                      <span class={`inline-flex w-10 h-10 rounded-full items-center justify-center text-sm font-bold ${touch.leadScore >= 70 ? 'bg-red-100 text-red-700' : touch.leadScore >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {touch.leadScore}
                                      </span>
                                    {:else}
                                      <span class="text-gray-400">—</span>
                                    {/if}
                                  </td>
                                  <td class="px-6 py-4">
                                    <Button size="sm" variant="outline" onclick={() => sendManualTouch(touch.email, touch.tool, touch.name, touch.nextTouch)}>
                                      <Send class="w-4 h-4 mr-1" /> Send Now
                                    </Button>
                                  </td>
                                </tr>
                              {:else}
                                <tr><td colspan="6" class="px-6 py-8 text-center text-gray-500">No touches due — all caught up!</td></tr>
                              {/each}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>

                    <!-- All Nurture Leads Table -->
                    <Card>
                      <CardHeader><CardTitle class="flex items-center gap-2"><List class="w-4 h-4 text-gray-500" /> All Enrolled Leads</CardTitle></CardHeader>
                      <CardContent>
                        <div class="overflow-x-auto">
                          <table class="w-full">
                            <thead class="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tool</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Touches Sent</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Due</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Captured</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                              </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                              {#each nurtureLeads as lead}
                                <tr class="hover:bg-gray-50">
                                  <td class="px-6 py-4">
                                    <div class="font-medium text-gray-900">{lead.email}</div>
                                  </td>
                                  <td class="px-6 py-4">
                                    <Badge variant="outline">{lead.tool}</Badge>
                                  </td>
                                  <td class="px-6 py-4 text-sm">{lead.name}</td>
                                  <td class="px-6 py-4 text-center">
                                    <div class="flex items-center justify-center gap-1">
                                      {#each [1,2,3] as t}
                                        <span class={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${lead.touchesSent.includes(t) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                          {t}
                                        </span>
                                      {/each}
                                    </div>
                                  </td>
                                  <td class="px-6 py-4 text-center">
                                    {#if lead.touchesSent.length >= 3}
                                      <Badge class="bg-green-100 text-green-800">Complete</Badge>
                                    {:else if lead.nextTouch}
                                      <span class="text-sm font-medium text-blue-600">Touch {lead.nextTouch} ({lead.daysSinceCapture}d)</span>
                                    {:else}
                                      <span class="text-gray-400">—</span>
                                    {/if}
                                  </td>
                                  <td class="px-6 py-4 text-sm text-gray-500">{formatDate(lead.capturedAt)}</td>
                                  <td class="px-6 py-4">
                                    <div class="flex items-center gap-2">
                                      <Button size="sm" variant="ghost" onclick={() => previewTouch(lead.tool, lead.nextTouch || 1, lead.name)}>
                                        <Eye class="w-4 h-4" />
                                      </Button>
                                      {#if lead.touchesSent.length < 3 && lead.nextTouch && lead.daysSinceCapture >= (lead.nextTouch === 1 ? 0 : lead.nextTouch === 2 ? 2 : 5)}
                                        <Button size="sm" variant="outline" onclick={() => sendManualTouch(lead.email, lead.tool, lead.name, lead.nextTouch)}>
                                          <Send class="w-4 h-4 mr-1" /> Send
                                        </Button>
                                      {/if}
                                    </div>
                                  </td>
                                </tr>
                              {:else}
                                <tr><td colspan="7" class="px-6 py-8 text-center text-gray-500">No leads enrolled yet — run a sync to enroll recent leads</td></tr>
                              {/each}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>

                    <!-- Touch Preview Modal -->
                    {#if previewTouchData}
                      <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                          <div class="flex justify-between items-center mb-6">
                            <h2 class="text-xl font-bold">Touch Preview — {previewTouchData.tool} • Touch {previewTouchData.touch}</h2>
                            <button onclick={() => previewTouchData = null} class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"><X class="w-5 h-5" /></button>
                          </div>
                          <div class="space-y-4">
                            <div class="bg-gray-50 p-4 rounded-lg">
                              <p class="text-sm font-medium text-gray-600">Subject</p>
                              <p class="font-medium text-gray-900 mt-1">{previewTouchData.subject}</p>
                            </div>
                            <div class="bg-gray-50 p-4 rounded-lg">
                              <p class="text-sm font-medium text-gray-600">Body</p>
                              <pre class="whitespace-pre-wrap text-sm text-gray-700 mt-1 font-sans">{previewTouchData.body}</pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    {/if}

                    <!-- Recent Send Log -->
                    <Card>
                      <CardHeader><CardTitle class="flex items-center gap-2"><History class="w-4 h-4 text-gray-500" /> Recent Send Log</CardTitle></CardHeader>
                      <CardContent>
                        <div class="overflow-x-auto">
                          <table class="w-full">
                            <thead class="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tool</th>
                                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Touch</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent At</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message ID</th>
                              </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                              {#each sendLog.slice(0, 20) as log}
                                <tr class="hover:bg-gray-50">
                                  <td class="px-6 py-4 text-sm">{log.email}</td>
                                  <td class="px-6 py-4"><Badge variant="outline">{log.tool}</Badge></td>
                                  <td class="px-6 py-4 text-center"><span class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Touch {log.touch}</span></td>
                                  <td class="px-6 py-4 text-sm text-gray-500">{formatDate(log.sentAt)}</td>
                                  <td class="px-6 py-4 text-xs text-gray-500 font-mono">{log.messageId}</td>
                                </tr>
                              {:else}
                                <tr><td colspan="5" class="px-6 py-8 text-center text-gray-500">No sends logged yet</td></tr>
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
