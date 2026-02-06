<script>
  import { 
    Search, 
    Filter, 
    MapPin, 
    Briefcase, 
    Calendar, 
    Building, 
    ArrowRight,
    Star,
    TrendingUp,
    CheckCircle,
    X,
    Bookmark,
    Mail,
    Bell,
    Smartphone,
    Palette,
    Cloud,
    Database,
  } from '@lucide/svelte';
  import { onMount } from 'svelte';

  // Job categories
  const categories = [
    { id: 'all', name: 'All Jobs', count: 45, icon: Briefcase, color: 'from-blue-500 to-cyan-500' },
    { id: 'web', name: 'Web Development', count: 18, icon: Briefcase, color: 'from-purple-500 to-pink-500' },
    { id: 'mobile', name: 'Mobile Apps', count: 8, icon: Smartphone, color: 'from-green-500 to-emerald-500' },
    { id: 'design', name: 'UI/UX Design', count: 7, icon: Palette, color: 'from-orange-500 to-red-500' },
    { id: 'devops', name: 'DevOps', count: 5, icon: Cloud, color: 'from-indigo-500 to-blue-500' },
    { id: 'data', name: 'Data Science', count: 4, icon: Database, color: 'from-amber-500 to-yellow-500' },
    { id: 'marketing', name: 'Digital Marketing', count: 3, icon: TrendingUp, color: 'from-rose-500 to-pink-500' }
  ];

  // Job types
  const jobTypes = [
    { id: 'fulltime', name: 'Full-time', count: 28 },
    { id: 'parttime', name: 'Part-time', count: 7 },
    { id: 'contract', name: 'Contract', count: 6 },
    { id: 'remote', name: 'Remote', count: 32 },
    { id: 'internship', name: 'Internship', count: 4 }
  ];

  // Locations
  const locations = [
    { id: 'remote', name: 'Remote', count: 32 },
    { id: 'lagos', name: 'Lagos', count: 18 },
    { id: 'abuja', name: 'Abuja', count: 12 },
    { id: 'port-harcourt', name: 'Port Harcourt', count: 8 },
    { id: 'ibadan', name: 'Ibadan', count: 5 },
    { id: 'international', name: 'International', count: 6 }
  ];

  // Sample jobs data
  const jobs = [
    {
      id: 1,
      title: 'Senior Frontend Developer (Svelte/React)',
      company: 'RyderTech',
      logo: 'RT',
      location: 'Lagos/Remote',
      type: 'Full-time',
      salary: '₦500,000 - ₦800,000',
      posted: '2 days ago',
      description: 'We are looking for an experienced Frontend Developer to join our team. Must have experience with Svelte, React, and modern JavaScript.',
      requirements: ['3+ years experience', 'Svelte/React', 'TypeScript', 'REST APIs'],
      category: 'web',
      featured: true,
      urgent: true
    },
    {
      id: 2,
      title: 'Backend Engineer (Node.js/Python)',
      company: 'FindsNg',
      logo: 'FN',
      location: 'Remote',
      type: 'Full-time',
      salary: '₦600,000 - ₦900,000',
      posted: '1 day ago',
      description: 'Build scalable backend systems for our e-commerce platform. Experience with microservices and cloud infrastructure required.',
      requirements: ['4+ years experience', 'Node.js/Python', 'PostgreSQL', 'AWS'],
      category: 'web',
      featured: true,
      urgent: false
    },
    {
      id: 3,
      title: 'Mobile App Developer (React Native)',
      company: 'CouqleQuest',
      logo: 'CQ',
      location: 'Abuja',
      type: 'Contract',
      salary: '₦400,000 - ₦600,000',
      posted: '3 days ago',
      description: 'Develop and maintain our cross-platform mobile application. Experience with React Native and mobile app deployment required.',
      requirements: ['2+ years experience', 'React Native', 'iOS/Android', 'Firebase'],
      category: 'mobile',
      featured: false,
      urgent: true
    },
    {
      id: 4,
      title: 'UI/UX Designer',
      company: 'SweetEdge',
      logo: 'SE',
      location: 'Lagos',
      type: 'Full-time',
      salary: '₦350,000 - ₦550,000',
      posted: '5 days ago',
      description: 'Design beautiful and intuitive user interfaces for our fashion e-commerce platform.',
      requirements: ['3+ years experience', 'Figma', 'User Research', 'Prototyping'],
      category: 'design',
      featured: false,
      urgent: false
    },
    {
      id: 5,
      title: 'DevOps Engineer',
      company: 'RyderXchange',
      logo: 'RX',
      location: 'Remote',
      type: 'Full-time',
      salary: '$3,000 - $5,000',
      posted: '1 week ago',
      description: 'Manage our blockchain infrastructure and ensure high availability of our exchange platform.',
      requirements: ['AWS/GCP', 'Docker/Kubernetes', 'CI/CD', 'Blockchain'],
      category: 'devops',
      featured: true,
      urgent: false
    },
    {
      id: 6,
      title: 'Digital Marketing Specialist',
      company: 'Discova',
      logo: 'DV',
      location: 'Remote',
      type: 'Part-time',
      salary: '₦250,000 - ₦400,000',
      posted: '2 weeks ago',
      description: 'Drive user acquisition and engagement for our multi-vendor platform.',
      requirements: ['SEO/SEM', 'Social Media', 'Analytics', 'Content Creation'],
      category: 'marketing',
      featured: false,
      urgent: false
    },
    {
      id: 7,
      title: 'Data Analyst',
      company: 'Sanuary Wealth Foundation',
      logo: 'SWF',
      location: 'Port Harcourt',
      type: 'Full-time',
      salary: '₦300,000 - ₦450,000',
      posted: '1 week ago',
      description: 'Analyze donor data and create reports for our NGO operations.',
      requirements: ['SQL', 'Excel', 'Data Visualization', 'Statistics'],
      category: 'data',
      featured: false,
      urgent: false
    },
    {
      id: 8,
      title: 'Full Stack Developer',
      company: 'DbTravels',
      logo: 'DBT',
      location: 'Lagos',
      type: 'Full-time',
      salary: '₦450,000 - ₦700,000',
      posted: '4 days ago',
      description: 'Work on our travel booking platform with both frontend and backend development.',
      requirements: ['JavaScript/TypeScript', 'React', 'Node.js', 'MongoDB'],
      category: 'web',
      featured: false,
      urgent: false
    }
  ];

  // State
  let selectedCategory = $state('all');
  let selectedType = $state('');
  let selectedLocation = $state('');
  let searchQuery = $state('');
  let showFilters = $state(false);
  let savedJobs = $state([]);
  let filteredJobs = $state([...jobs]);
  let featuredJobs = $state(jobs.filter(job => job.featured));
  let urgentJobs = $state(jobs.filter(job => job.urgent));

  // Filter jobs
  function filterJobs() {
    let results = [...jobs];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(job => 
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query)
      );
    }
    
    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      results = results.filter(job => job.category === selectedCategory);
    }
    
    // Type filter
    if (selectedType) {
      results = results.filter(job => job.type.toLowerCase() === selectedType);
    }
    
    // Location filter
    if (selectedLocation) {
      results = results.filter(job => 
        job.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }
    
    filteredJobs = results;
    featuredJobs = results.filter(job => job.featured);
    urgentJobs = results.filter(job => job.urgent);
  }

  // Clear all filters
  function clearFilters() {
    selectedCategory = 'all';
    selectedType = '';
    selectedLocation = '';
    searchQuery = '';
    filterJobs();
  }

  // Toggle save job
  function toggleSaveJob(jobId) {
    if (savedJobs.includes(jobId)) {
      savedJobs = savedJobs.filter(id => id !== jobId);
    } else {
      savedJobs = [...savedJobs, jobId];
    }
    // Save to localStorage
    localStorage.setItem('rydertech_saved_jobs', JSON.stringify(savedJobs));
  }

  // Load saved jobs
  onMount(() => {
    const saved = localStorage.getItem('rydertech_saved_jobs');
    if (saved) {
      savedJobs = JSON.parse(saved);
    }
  });

  // Watch for filter changes
  $effect(() => {
    filterJobs();
  });
</script>

<div class="min-h-screen bg-gray-50">
  <!-- Hero Section -->
  <section class="pt-32 pb-20 px-4 bg-gradient-to-br from-[var(--primary)] via-[var(--primary-dark)] to-[var(--secondary)] relative overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
    </div>

    <div class="container mx-auto max-w-6xl relative z-10">
      <div class="text-center text-white">
        <!-- Badge -->
        <div class="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 text-sm font-semibold mb-6">
          <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>{jobs.length} ACTIVE JOBS</span>
        </div>
        
        <!-- Main Heading -->
        <h1 class="text-4xl md:text-6xl font-black mb-6">
          Find Your Dream <span class="text-[var(--secondary-light)]">Tech Job</span>
        </h1>
        
        <!-- Subheading -->
        <p class="text-xl text-white/90 max-w-2xl mx-auto mb-10">
          Discover top tech opportunities in Nigeria. Connect with innovative companies hiring developers, designers, and tech professionals.
        </p>
        
        <!-- Search Bar -->
        <div class="max-w-3xl mx-auto">
          <div class="bg-white rounded-2xl p-2 shadow-2xl">
            <div class="flex flex-col md:flex-row gap-2">
              <!-- Search Input -->
              <div class="flex-1 flex items-center px-4 py-3">
                <Search class="w-5 h-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  bind:value={searchQuery}
                  placeholder="Search jobs by title, company, or keyword..."
                  class="w-full focus:outline-none text-gray-900 placeholder-gray-500"
                />
              </div>
              
              <!-- Filter Toggle -->
              <button
                onclick={() => showFilters = !showFilters}
                class="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <Filter class="w-4 h-4 mr-2" />
                Filters
              </button>
              
              <!-- Search Button -->
              <button
                onclick={filterJobs}
                class="px-8 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Search Jobs
              </button>
            </div>
          </div>
          
          <!-- Stats -->
          <div class="flex flex-wrap justify-center gap-8 mt-8">
            <div class="text-center">
              <div class="text-2xl font-black text-white">{jobs.length}+</div>
              <div class="text-white/80 text-sm">Active Jobs</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-black text-white">{jobs.filter(j => j.urgent).length}</div>
              <div class="text-white/80 text-sm">Urgent Hirings</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-black text-white">{featuredJobs.length}</div>
              <div class="text-white/80 text-sm">Featured Jobs</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-black text-white">32</div>
              <div class="text-white/80 text-sm">Remote Positions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Filters Panel -->
  {#if showFilters}
    <div class="bg-white border-b border-gray-200 py-6 px-4">
      <div class="container mx-auto max-w-6xl">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-gray-900">Filter Jobs</h3>
          <button
            onclick={clearFilters}
            class="text-sm text-[var(--primary)] hover:text-[var(--primary-dark)] font-semibold flex items-center"
          >
            <X class="w-4 h-4 mr-1" />
            Clear All
          </button>
        </div>
        
        <div class="grid md:grid-cols-3 gap-6">
          <!-- Job Type Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">Job Type</label>
            <div class="space-y-2">
              {#each jobTypes as type}
                <label class="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="jobType"
                    value={type.id}
                    bind:group={selectedType}
                    class="hidden peer"
                  />
                  <div class="w-5 h-5 border-2 border-gray-300 rounded-full mr-3 peer-checked:border-[var(--primary)] peer-checked:bg-[var(--primary)] relative">
                    <div class="absolute inset-1 bg-white rounded-full peer-checked:hidden"></div>
                  </div>
                  <span class="text-gray-700 peer-checked:text-[var(--primary)] peer-checked:font-semibold">
                    {type.name}
                  </span>
                  <span class="ml-auto text-gray-500 text-sm">({type.count})</span>
                </label>
              {/each}
            </div>
          </div>
          
          <!-- Location Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">Location</label>
            <div class="space-y-2">
              {#each locations as location}
                <label class="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="location"
                    value={location.id}
                    bind:group={selectedLocation}
                    class="hidden peer"
                  />
                  <div class="w-5 h-5 border-2 border-gray-300 rounded-full mr-3 peer-checked:border-[var(--primary)] peer-checked:bg-[var(--primary)] relative">
                    <div class="absolute inset-1 bg-white rounded-full peer-checked:hidden"></div>
                  </div>
                  <span class="text-gray-700 peer-checked:text-[var(--primary)] peer-checked:font-semibold">
                    {location.name}
                  </span>
                  <span class="ml-auto text-gray-500 text-sm">({location.count})</span>
                </label>
              {/each}
            </div>
          </div>
          
          <!-- Quick Actions -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">Quick Actions</label>
            <div class="space-y-3">
              <button
                onclick={() => {
                  selectedType = 'remote';
                  showFilters = false;
                }}
                class="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-medium"
              >
                💼 Show Remote Jobs
              </button>
              <button
                onclick={() => {
                  selectedType = 'fulltime';
                  showFilters = false;
                }}
                class="w-full text-left px-4 py-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors font-medium"
              >
                ⚡ Full-time Positions
              </button>
              <button
                onclick={() => {
                  // Show urgent jobs
                  selectedCategory = 'all';
                  selectedType = '';
                  selectedLocation = '';
                  searchQuery = '';
                  showFilters = false;
                }}
                class="w-full text-left px-4 py-3 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors font-medium"
              >
                🔥 Urgent Hirings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Main Content -->
  <div class="py-12 px-4">
    <div class="container mx-auto max-w-6xl">
      <!-- Categories -->
      <div class="mb-12">
        <h2 class="text-2xl font-black text-gray-900 mb-6">Browse by Category</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {#each categories as category}
            <button
              onclick={() => selectedCategory = category.id}
              class="text-center p-4 rounded-2xl border-2 border-gray-100 hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5 transition-all duration-300 group"
              class:border-[var(--primary)]={selectedCategory === category.id}
              class:bg-gradient-to-br={selectedCategory === category.id}
              class:from-[var(--primary)]={selectedCategory === category.id}
            >
              <div class="w-10 h-10 bg-gradient-to-br {category.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <category.icon class="w-5 h-5 text-white" />
              </div>
              <div class="font-semibold text-gray-900 text-sm mb-1">{category.name}</div>
              <div class="text-xs text-gray-500">({category.count})</div>
            </button>
          {/each}
        </div>
      </div>

      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Left Column - Job Listings -->
        <div class="lg:col-span-2">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-2xl font-black text-gray-900">
                {#if searchQuery || selectedCategory !== 'all' || selectedType || selectedLocation}
                  {filteredJobs.length} Jobs Found
                {:else}
                  Latest Job Opportunities
                {/if}
              </h2>
              <p class="text-gray-600">
                {#if searchQuery}
                  Searching for "{searchQuery}"
                {:else if selectedCategory !== 'all'}
                  Showing {categories.find(c => c.id === selectedCategory)?.name} jobs
                {:else if selectedType}
                  Showing {jobTypes.find(t => t.id === selectedType)?.name} jobs
                {:else if selectedLocation}
                  Showing jobs in {locations.find(l => l.id === selectedLocation)?.name}
                {:else}
                  Browse all available positions
                {/if}
              </p>
            </div>
            
            <div class="text-sm text-gray-500">
              Sorted by: <span class="font-semibold text-gray-900">Newest</span>
            </div>
          </div>

          <!-- Featured Jobs Banner -->
          {#if featuredJobs.length > 0 && selectedCategory === 'all' && !searchQuery && !selectedType && !selectedLocation}
            <div class="mb-6 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 border border-[var(--primary)]/20 rounded-2xl p-4">
              <div class="flex items-center">
                <Star class="w-5 h-5 text-amber-500 mr-3" />
                <div class="flex-1">
                  <h4 class="font-bold text-gray-900">Featured Jobs</h4>
                  <p class="text-sm text-gray-600">Top companies are hiring now</p>
                </div>
                <span class="px-3 py-1 bg-[var(--primary)] text-white text-xs font-semibold rounded-full">
                  {featuredJobs.length} featured
                </span>
              </div>
            </div>
          {/if}

          <!-- Job Listings -->
          <div class="space-y-4">
            {#each filteredJobs as job}
              <div class="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-[var(--primary)]/30 hover:shadow-xl transition-all duration-300 group">
                <div class="flex flex-col md:flex-row md:items-start gap-6">
                  <!-- Company Logo -->
                  <div class="flex-shrink-0">
                    <div class="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] rounded-2xl flex items-center justify-center">
                      <span class="text-white font-black text-lg">{job.logo}</span>
                    </div>
                  </div>
                  
                  <!-- Job Details -->
                  <div class="flex-1">
                    <div class="flex flex-col md:flex-row md:items-start justify-between mb-3">
                      <div>
                        <div class="flex items-center space-x-3 mb-2">
                          <h3 class="text-xl font-black text-gray-900 group-hover:text-[var(--primary)] transition-colors">
                            {job.title}
                          </h3>
                          {#if job.featured}
                            <span class="px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold rounded-full">
                              Featured
                            </span>
                          {/if}
                          {#if job.urgent}
                            <span class="px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-semibold rounded-full">
                              Urgent
                            </span>
                          {/if}
                        </div>
                        
                        <div class="flex items-center text-gray-600 mb-4">
                          <Building class="w-4 h-4 mr-2" />
                          <span class="font-semibold mr-4">{job.company}</span>
                          <MapPin class="w-4 h-4 mr-2" />
                          <span class="mr-4">{job.location}</span>
                          <Briefcase class="w-4 h-4 mr-2" />
                          <span>{job.type}</span>
                        </div>
                      </div>
                      
                      <!-- Salary -->
                      <div class="text-right mb-4 md:mb-0">
                        <div class="text-lg font-black text-gray-900">{job.salary}</div>
                        <div class="text-sm text-gray-500">monthly</div>
                      </div>
                    </div>
                    
                    <!-- Description -->
                    <p class="text-gray-600 mb-4 line-clamp-2">
                      {job.description}
                    </p>
                    
                    <!-- Requirements Tags -->
                    <div class="flex flex-wrap gap-2 mb-6">
                      {#each job.requirements as req}
                        <span class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                          {req}
                        </span>
                      {/each}
                    </div>
                    
                    <!-- Footer -->
                    <div class="flex flex-col md:flex-row md:items-center justify-between">
                      <div class="flex items-center text-sm text-gray-500 mb-4 md:mb-0">
                        <Calendar class="w-4 h-4 mr-2" />
                        <span>Posted {job.posted}</span>
                      </div>
                      
                      <div class="flex items-center space-x-3">
                        <button
                          onclick={() => toggleSaveJob(job.id)}
                          class="p-2 rounded-lg border border-gray-300 hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-colors"
                          title={savedJobs.includes(job.id) ? 'Remove from saved' : 'Save job'}
                        >
                          <Bookmark class="w-5 h-5 {savedJobs.includes(job.id) ? 'fill-[var(--primary)] text-[var(--primary)]' : 'text-gray-400'}" />
                        </button>
                        
                        <a
                          href="/job-board/{job.id}"
                          class="px-6 py-2.5 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center"
                        >
                          View Details
                          <ArrowRight class="w-4 h-4 ml-2" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            {:else}
              <!-- No Jobs Found -->
              <div class="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search class="w-8 h-8 text-gray-400" />
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-3">No jobs found</h3>
                <p class="text-gray-600 mb-6 max-w-md mx-auto">
                  We couldn't find any jobs matching your criteria. Try adjusting your filters or search terms.
                </p>
                <button
                  onclick={clearFilters}
                  class="px-6 py-3 bg-[var(--primary)] text-white font-semibold rounded-xl hover:bg-[var(--primary-dark)] transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            {/each}
          </div>
        </div>

        <!-- Right Column - Sidebar -->
        <div class="space-y-6">
          <!-- Post Job CTA -->
          <div class="bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-2xl p-6 text-white">
            <div class="text-center mb-6">
              <div class="text-4xl font-black mb-2">$1</div>
              <p class="text-white/90">Post a job for 30 days</p>
            </div>
            
            <ul class="space-y-4 mb-8">
              <li class="flex items-center">
                <CheckCircle class="w-5 h-5 text-green-300 mr-3" />
                <span>Reach 5,000+ professionals</span>
              </li>
              <li class="flex items-center">
                <CheckCircle class="w-5 h-5 text-green-300 mr-3" />
                <span>Featured placement</span>
              </li>
              <li class="flex items-center">
                <CheckCircle class="w-5 h-5 text-green-300 mr-3" />
                <span>Candidate management tools</span>
              </li>
            </ul>
            
            <a
              href="/post-a-job"
              class="block w-full py-3.5 bg-white text-[var(--primary-dark)] font-bold rounded-xl text-center hover:bg-gray-100 transition-colors mb-3"
            >
              Post a Job for $1
            </a>
            
            <p class="text-center text-sm text-white/70">
              Limited time offer for employers
            </p>
          </div>

          <!-- Saved Jobs -->
          <div class="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 class="font-bold text-gray-900 mb-4 flex items-center">
              <Bookmark class="w-5 h-5 text-[var(--primary)] mr-2" />
              Saved Jobs ({savedJobs.length})
            </h3>
            
            {#if savedJobs.length > 0}
              <div class="space-y-3">
                {#each jobs.filter(job => savedJobs.includes(job.id)).slice(0, 3) as job}
                  <a
                    href="/job-board/{job.id}"
                    class="block p-3 rounded-xl border border-gray-100 hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5 transition-colors"
                  >
                    <div class="font-semibold text-gray-900 text-sm mb-1">{job.title}</div>
                    <div class="text-xs text-gray-500">{job.company} • {job.location}</div>
                  </a>
                {/each}
                
                {#if savedJobs.length > 3}
                  <a
                    href="/saved-jobs"
                    class="block text-center text-sm text-[var(--primary)] font-semibold hover:underline pt-2"
                  >
                    View all saved jobs →
                  </a>
                {/if}
              </div>
            {:else}
              <p class="text-gray-500 text-sm text-center py-4">
                No saved jobs yet. Click the bookmark icon to save jobs.
              </p>
            {/if}
          </div>

          <!-- Urgent Jobs -->
          {#if urgentJobs.length > 0}
            <div class="bg-white rounded-2xl p-6 border border-red-100 bg-gradient-to-br from-red-50 to-white">
              <h3 class="font-bold text-gray-900 mb-4 flex items-center">
                <div class="w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                  <TrendingUp class="w-3 h-3 text-white" />
                </div>
                Urgent Hirings
              </h3>
              
              <div class="space-y-3">
                {#each urgentJobs as job}
                  <a
                    href="/job-board/{job.id}"
                    class="block p-3 rounded-xl border border-red-100 hover:border-red-300 transition-colors"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <span class="px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-semibold rounded-full">
                        Urgent
                      </span>
                      <span class="text-xs text-gray-500">{job.posted}</span>
                    </div>
                    <div class="font-semibold text-gray-900 text-sm mb-1">{job.title}</div>
                    <div class="text-xs text-gray-500">{job.company} • {job.salary}</div>
                  </a>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Subscribe to Alerts -->
          <div class="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 class="font-bold text-gray-900 mb-4 flex items-center">
              <Bell class="w-5 h-5 text-[var(--primary)] mr-2" />
              Get Job Alerts
            </h3>
            
            <p class="text-gray-600 text-sm mb-4">
              Get notified when new jobs matching your criteria are posted.
            </p>
            
            <div class="space-y-3">
              <input
                type="email"
                placeholder="Your email address"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
              
              <select class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent">
                <option value="">Select job category</option>
                {#each categories.filter(c => c.id !== 'all') as category}
                  <option value={category.id}>{category.name}</option>
                {/each}
              </select>
              
              <button class="w-full py-3 bg-[var(--primary)] text-white font-semibold rounded-xl hover:bg-[var(--primary-dark)] transition-colors flex items-center justify-center">
                <Mail class="w-4 h-4 mr-2" />
                Subscribe to Alerts
              </button>
            </div>
          </div>

          <!-- Stats -->
          <div class="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 class="font-bold text-gray-900 mb-6">Job Market Insights</h3>
            
            <div class="space-y-4">
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-sm text-gray-600">Web Development</span>
                  <span class="text-sm font-semibold text-gray-900">40%</span>
                </div>
                <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full" style="width: 40%"></div>
                </div>
              </div>
              
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-sm text-gray-600">Remote Jobs</span>
                  <span class="text-sm font-semibold text-gray-900">71%</span>
                </div>
                <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style="width: 71%"></div>
                </div>
              </div>
              
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-sm text-gray-600">₦500k+ Salaries</span>
                  <span class="text-sm font-semibold text-gray-900">65%</span>
                </div>
                <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style="width: 65%"></div>
                </div>
              </div>
            </div>
            
            <div class="mt-6 pt-6 border-t border-gray-200">
              <p class="text-sm text-gray-600">
                <span class="font-semibold text-gray-900">Tip:</span> Apply within 3 days for 80% higher response rate.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      {#if filteredJobs.length > 0}
        <div class="mt-12 flex justify-center">
          <nav class="flex items-center space-x-2">
            <button class="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">
              Previous
            </button>
            <button class="px-4 py-2 bg-[var(--primary)] text-white rounded-xl font-semibold">
              1
            </button>
            <button class="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">
              2
            </button>
            <button class="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">
              3
            </button>
            <span class="px-2 text-gray-500">...</span>
            <button class="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">
              10
            </button>
            <button class="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">
              Next
            </button>
          </nav>
        </div>
      {/if}
    </div>
  </div>

  <!-- CTA Section -->
  <section class="py-20 px-4 bg-gradient-to-br from-gray-900 to-gray-800">
    <div class="container mx-auto max-w-4xl text-center">
      <div class="text-white">
        <h2 class="text-4xl font-black mb-6">
          Ready to Find Your <span class="text-[var(--secondary-light)]">Next Opportunity?</span>
        </h2>
        <p class="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          Join thousands of tech professionals who found their dream jobs through RyderTech.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/post-resume"
            class="px-8 py-4 bg-[var(--secondary)] text-white font-bold rounded-xl hover:bg-[var(--secondary-dark)] transition-colors"
          >
            Post Your Resume
          </a>
          <button
            onclick={() => document.querySelector('#subscribe-email').scrollIntoView({ behavior: 'smooth' })}
            class="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:border-white/60 hover:bg-white/10 transition-colors"
          >
            Get Job Alerts
          </button>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>