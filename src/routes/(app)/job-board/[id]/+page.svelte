<!-- src/routes/job-board/[id]/+page.svelte -->
<script>
  import {
    ArrowLeft,
    MapPin,
    Briefcase,
    DollarSign,
    Clock,
    Calendar,
    Building,
    Users,
    Globe,
    Mail,
    Share2,
    Bookmark,
    CheckCircle,
    FileText,
    ExternalLink,
    Shield,
    TrendingUp
  } from '@lucide/svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  // Get job ID from route params
  let jobId = $state(0);
  
  // Sample job data - in real app, fetch from API
  const job = {
    id: 1,
    title: 'Senior Frontend Developer (Svelte/React)',
    company: 'RyderTech',
    logo: 'RT',
    location: 'Lagos, Nigeria (Hybrid)',
    type: 'Full-time',
    salary: '₦500,000 - ₦800,000 monthly',
    posted: '2 days ago',
    description: 'We are looking for an experienced Senior Frontend Developer to join our innovative team. You will be responsible for building and maintaining modern web applications using Svelte and React.',
    
    responsibilities: [
      'Develop and maintain high-quality web applications using Svelte and React',
      'Collaborate with designers to implement pixel-perfect UI/UX',
      'Write clean, maintainable, and efficient code',
      'Participate in code reviews and technical discussions',
      'Optimize applications for maximum speed and scalability',
      'Implement responsive designs that work across all devices'
    ],
    
    requirements: [
      '3+ years of experience in frontend development',
      'Strong proficiency in Svelte, React, and TypeScript',
      'Experience with modern JavaScript (ES6+)',
      'Knowledge of RESTful APIs and GraphQL',
      'Familiarity with Git and Agile methodologies',
      'Excellent problem-solving skills'
    ],
    
    benefits: [
      'Competitive salary with performance bonuses',
      'Health insurance coverage',
      'Flexible working hours and remote options',
      'Professional development budget',
      'Latest MacBook Pro or equivalent',
      'Team building events and retreats'
    ],
    
    aboutCompany: 'RyderTech is Nigeria\'s leading web design and software agency, helping businesses transform their digital presence. We work with clients across Africa to build innovative solutions.',
    
    companySize: '11-50 employees',
    website: 'https://rydertech.com',
    applyLink: 'https://forms.gle/apply-here',
    
    featured: true,
    urgent: true,
    applications: 24,
    views: 156,
    
    similarJobs: [
      {
        id: 2,
        title: 'Backend Engineer (Node.js)',
        company: 'FindsNg',
        location: 'Remote',
        salary: '₦600,000+',
        type: 'Full-time',
        posted: '1 day ago'
      },
      {
        id: 3,
        title: 'React Native Developer',
        company: 'CouqleQuest',
        location: 'Abuja',
        salary: '₦400,000+',
        type: 'Contract',
        posted: '3 days ago'
      },
      {
        id: 4,
        title: 'UI/UX Designer',
        company: 'SweetEdge',
        location: 'Lagos',
        salary: '₦350,000+',
        type: 'Full-time',
        posted: '5 days ago'
      }
    ]
  };

  let isSaved = $state(false);
  let showShareModal = $state(false);

  // Load saved status
  onMount(() => {
    const savedJobs = JSON.parse(localStorage.getItem('rydertech_saved_jobs') || '[]');
    isSaved = savedJobs.includes(job.id);
  });

  function toggleSave() {
    const savedJobs = JSON.parse(localStorage.getItem('rydertech_saved_jobs') || '[]');
    
    if (isSaved) {
      const newSaved = savedJobs.filter(id => id !== job.id);
      localStorage.setItem('rydertech_saved_jobs', JSON.stringify(newSaved));
    } else {
      savedJobs.push(job.id);
      localStorage.setItem('rydertech_saved_jobs', JSON.stringify(savedJobs));
    }
    
    isSaved = !isSaved;
  }

  function shareJob() {
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this job: ${job.title} at ${job.company}`,
        url: window.location.href
      });
    } else {
      showShareModal = true;
    }
  }
</script>

<div class="min-h-screen bg-gray-50 py-30">
  <!-- Back Button -->
  <div class="pt-28 pb-6 px-4">
    <div class="container mx-auto max-w-6xl">
      <a href="/job-board" class="inline-flex items-center text-[var(--primary)] hover:underline">
        <ArrowLeft class="w-4 h-4 mr-2" />
        Back to Job Board
      </a>
    </div>
  </div>

  <!-- Main Content -->
  <div class="pb-20 px-4">
    <div class="container mx-auto max-w-6xl">
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Left Column - Job Details -->
        <div class="lg:col-span-2">
          <!-- Job Header Card -->
          <div class="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
            <div class="flex flex-col md:flex-row md:items-start gap-6 mb-6">
              <!-- Company Logo -->
              <div class="flex-shrink-0">
                <div class="w-20 h-20 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] rounded-2xl flex items-center justify-center">
                  <span class="text-white font-black text-2xl">{job.logo}</span>
                </div>
              </div>
              
              <!-- Job Info -->
              <div class="flex-1">
                <div class="flex flex-wrap items-center gap-2 mb-4">
                  {#if job.featured}
                    <span class="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-full">
                      Featured
                    </span>
                  {/if}
                  {#if job.urgent}
                    <span class="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-semibold rounded-full">
                      Urgent Hiring
                    </span>
                  {/if}
                </div>
                
                <h1 class="text-3xl font-black text-gray-900 mb-4">{job.title}</h1>
                
                <div class="flex flex-wrap gap-4 mb-6">
                  <div class="flex items-center text-gray-600">
                    <Building class="w-5 h-5 mr-2" />
                    <span class="font-semibold">{job.company}</span>
                  </div>
                  <div class="flex items-center text-gray-600">
                    <MapPin class="w-5 h-5 mr-2" />
                    <span>{job.location}</span>
                  </div>
                  <div class="flex items-center text-gray-600">
                    <Briefcase class="w-5 h-5 mr-2" />
                    <span>{job.type}</span>
                  </div>
                  <div class="flex items-center text-gray-600">
                    <Calendar class="w-5 h-5 mr-2" />
                    <span>Posted {job.posted}</span>
                  </div>
                </div>
                
                <!-- Salary -->
                <div class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                  <DollarSign class="w-5 h-5 text-green-600 mr-2" />
                  <span class="text-xl font-black text-green-700">{job.salary}</span>
                </div>
              </div>
              
              <!-- Action Buttons -->
              <div class="flex flex-col sm:flex-row lg:flex-col gap-3">
                <button
                  on:click={toggleSave}
                  class="px-4 py-2.5 border border-gray-300 rounded-xl hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-colors flex items-center justify-center"
                >
                  <Bookmark class="w-5 h-5 {isSaved ? 'fill-[var(--primary)] text-[var(--primary)]' : 'text-gray-400'}" />
                  <span class="ml-2">{isSaved ? 'Saved' : 'Save'}</span>
                </button>
                <button
                  on:click={shareJob}
                  class="px-4 py-2.5 border border-gray-300 rounded-xl hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-colors flex items-center justify-center"
                >
                  <Share2 class="w-5 h-5 text-gray-400" />
                  <span class="ml-2">Share</span>
                </button>
              </div>
            </div>
            
            <!-- Stats -->
            <div class="flex flex-wrap gap-6 pt-6 border-t border-gray-200">
              <div class="text-center">
                <div class="text-2xl font-black text-gray-900">{job.applications}</div>
                <div class="text-sm text-gray-600">Applications</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-black text-gray-900">{job.views}</div>
                <div class="text-sm text-gray-600">Views</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-black text-gray-900">24h</div>
                <div class="text-sm text-gray-600">Avg. Response Time</div>
              </div>
            </div>
          </div>

          <!-- Job Description -->
          <div class="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
            <h2 class="text-2xl font-black text-gray-900 mb-6">Job Description</h2>
            <p class="text-gray-700 leading-relaxed mb-8">
              {job.description}
            </p>
            
            <div class="space-y-8">
              <!-- Responsibilities -->
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-4">Key Responsibilities</h3>
                <ul class="space-y-3">
                  {#each job.responsibilities as responsibility}
                    <li class="flex items-start">
                      <CheckCircle class="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span class="text-gray-700">{responsibility}</span>
                    </li>
                  {/each}
                </ul>
              </div>
              
              <!-- Requirements -->
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-4">Requirements</h3>
                <ul class="space-y-3">
                  {#each job.requirements as requirement}
                    <li class="flex items-start">
                      <Shield class="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span class="text-gray-700">{requirement}</span>
                    </li>
                  {/each}
                </ul>
              </div>
              
              <!-- Benefits -->
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-4">Benefits & Perks</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {#each job.benefits as benefit}
                    <div class="flex items-center p-3 bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5 rounded-xl">
                      <TrendingUp class="w-5 h-5 text-[var(--primary)] mr-3" />
                      <span class="text-gray-700">{benefit}</span>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          </div>

          <!-- About Company -->
          <div class="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 class="text-2xl font-black text-gray-900 mb-6">About {job.company}</h2>
            <p class="text-gray-700 leading-relaxed mb-6">
              {job.aboutCompany}
            </p>
            
            <div class="flex flex-wrap gap-6">
              <div class="flex items-center">
                <Users class="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <div class="font-semibold text-gray-900">Company Size</div>
                  <div class="text-gray-600">{job.companySize}</div>
                </div>
              </div>
              
              <div class="flex items-center">
                <Globe class="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <div class="font-semibold text-gray-900">Website</div>
                  <a href={job.website} class="text-[var(--primary)] hover:underline" target="_blank">
                    {job.website.replace('https://', '')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Apply & Similar Jobs -->
        <div class="space-y-8">
          <!-- Apply Card -->
          <div class="bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-2xl p-6 text-white">
            <h3 class="text-xl font-black mb-6">Apply for this Job</h3>
            
            <div class="space-y-4 mb-8">
              <div class="flex items-center">
                <CheckCircle class="w-5 h-5 text-green-300 mr-3" />
                <span>Apply in 2 minutes</span>
              </div>
              <div class="flex items-center">
                <CheckCircle class="w-5 h-5 text-green-300 mr-3" />
                <span>No account required</span>
              </div>
              <div class="flex items-center">
                <CheckCircle class="w-5 h-5 text-green-300 mr-3" />
                <span>Get notified when viewed</span>
              </div>
            </div>
            
            <a
              href={job.applyLink}
              target="_blank"
              class="block w-full py-4 bg-white text-[var(--primary-dark)] font-bold rounded-xl text-center hover:bg-gray-100 transition-colors mb-4"
            >
              Apply Now
              <ExternalLink class="w-4 h-4 inline ml-2" />
            </a>
            
            <p class="text-center text-sm text-white/70">
              Application goes directly to {job.company}
            </p>
          </div>

          <!-- Similar Jobs -->
          <div class="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 class="text-lg font-bold text-gray-900 mb-6">Similar Jobs</h3>
            
            <div class="space-y-4">
              {#each job.similarJobs as similarJob}
                <a
                  href="/job-board/{similarJob.id}"
                  class="block p-4 rounded-xl border border-gray-100 hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5 transition-colors group"
                >
                  <div class="flex items-center justify-between mb-2">
                    <div class="font-semibold text-gray-900 group-hover:text-[var(--primary)]">
                      {similarJob.title}
                    </div>
                    <span class="text-xs text-gray-500">{similarJob.posted}</span>
                  </div>
                  <div class="text-sm text-gray-600 mb-2">{similarJob.company}</div>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center text-sm text-gray-500">
                      <MapPin class="w-3 h-3 mr-1" />
                      <span class="mr-4">{similarJob.location}</span>
                      <Briefcase class="w-3 h-3 mr-1" />
                      <span>{similarJob.type}</span>
                    </div>
                    <div class="font-semibold text-gray-900">{similarJob.salary}</div>
                  </div>
                </a>
              {/each}
            </div>
            
            <a
              href="/job-board"
              class="block mt-6 text-center text-[var(--primary)] font-semibold hover:underline"
            >
              View all jobs →
            </a>
          </div>

          <!-- Application Tips -->
          <div class="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Application Tips</h3>
            
            <div class="space-y-4">
              <div class="flex items-start">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <span class="text-blue-600 font-bold">1</span>
                </div>
                <div>
                  <div class="font-semibold text-gray-900">Tailor Your Resume</div>
                  <div class="text-sm text-gray-600">Highlight relevant skills mentioned in the job description</div>
                </div>
              </div>
              
              <div class="flex items-start">
                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <span class="text-green-600 font-bold">2</span>
                </div>
                <div>
                  <div class="font-semibold text-gray-900">Include Portfolio</div>
                  <div class="text-sm text-gray-600">Add links to your GitHub or live projects</div>
                </div>
              </div>
              
              <div class="flex items-start">
                <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <span class="text-purple-600 font-bold">3</span>
                </div>
                <div>
                  <div class="font-semibold text-gray-900">Follow Up</div>
                  <div class="text-sm text-gray-600">Send a polite follow-up email after 1 week</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Share Modal -->
  {#if showShareModal}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={() => showShareModal = false}>
      <div class="bg-white rounded-2xl p-6 max-w-md w-full" on:click|stopPropagation>
        <h3 class="text-xl font-bold text-gray-900 mb-4">Share Job</h3>
        <p class="text-gray-600 mb-6">Copy the link to share this job with others:</p>
        
        <div class="flex gap-2 mb-6">
          <input
            type="text"
            readonly
            value={window.location.href}
            class="flex-1 px-4 py-2 border border-gray-300 rounded-xl bg-gray-50"
          />
          <button
            on:click={() => {
              navigator.clipboard.writeText(window.location.href);
              showShareModal = false;
            }}
            class="px-4 py-2 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary-dark)] transition-colors"
          >
            Copy
          </button>
        </div>
        
        <button
          on:click={() => showShareModal = false}
          class="w-full py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  {/if}
</div>