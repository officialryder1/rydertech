<script>
  import { onMount } from 'svelte';
  import { 
    Calendar, User, Clock, ArrowRight, Search, 
    Tag, BookOpen, TrendingUp, Filter, ChevronDown,
    Share2, Bookmark, Eye, MessageCircle, Heart,
    Zap, Sparkles, Star, Crown, Award, Rocket,
    Play, Pause, Volume2, ThumbsUp, BookmarkCheck,
    ExternalLink, Menu, X, Moon, Sun, Cloud, Settings, GitBranch, Check, Code, Download, FileText, Palette, Shield,
  } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Input } from '$lib/components/ui/input';

  // Enhanced blog posts with audio and video content
  const blogPosts = [
    {
      id: 1,
      title: 'The Future of Web Development: Svelte vs React in 2024',
      excerpt: 'Exploring the performance benefits and developer experience differences between Svelte and React for modern web applications.',
      content: 'Full content would go here...',
      author: {
        name: 'Alex Ryder',
        role: 'Lead Developer',
        avatar: '/api/placeholder/100/100',
        verified: true
      },
      publishDate: '2024-01-15',
      readTime: '8 min read',
      category: 'Web Development',
      tags: ['Svelte', 'React', 'Performance', 'JavaScript', 'Frontend'],
      image: '/api/placeholder/600/400',
      featured: true,
      views: 1247,
      comments: 23,
      likes: 89,
      audioUrl: '/audio/svelte-react-comparison.mp3',
      videoUrl: '/video/web-dev-trends.mp4',
      difficulty: 'Intermediate',
      hasVideo: true,
      hasAudio: true,
      premium: false,
      rating: 4.8
    },
    {
      id: 2,
      title: 'Building Scalable Cloud Architecture with AWS Serverless',
      excerpt: 'Best practices for designing and implementing serverless architectures that scale efficiently with your business needs.',
      content: 'Full content would go here...',
      author: {
        name: 'Sarah Chen',
        role: 'Cloud Architect',
        avatar: '/api/placeholder/100/100',
        verified: true
      },
      publishDate: '2024-01-12',
      readTime: '12 min read',
      category: 'Cloud Computing',
      tags: ['AWS', 'Serverless', 'Architecture', 'Scalability', 'DevOps'],
      image: '/api/placeholder/600/400',
      featured: true,
      views: 892,
      comments: 15,
      likes: 67,
      audioUrl: '/audio/cloud-architecture.mp3',
      difficulty: 'Advanced',
      hasVideo: false,
      hasAudio: true,
      premium: true,
      rating: 4.9
    },
    {
      id: 3,
      title: 'AI Integration: Transforming Business Applications',
      excerpt: 'How to effectively integrate AI and machine learning capabilities into your existing business applications.',
      content: 'Full content would go here...',
      author: {
        name: 'Mike Rodriguez',
        role: 'AI Specialist',
        avatar: '/api/placeholder/100/100',
        verified: true
      },
      publishDate: '2024-01-08',
      readTime: '10 min read',
      category: 'Artificial Intelligence',
      tags: ['AI', 'Machine Learning', 'Integration', 'Business', 'Automation'],
      image: '/api/placeholder/600/400',
      featured: false,
      views: 1563,
      comments: 31,
      likes: 142,
      difficulty: 'Intermediate',
      hasVideo: true,
      hasAudio: false,
      premium: false,
      rating: 4.7
    },
    {
      id: 4,
      title: 'Mobile-First Design: Creating Exceptional User Experiences',
      excerpt: 'Strategies for designing mobile applications that provide seamless user experiences across all devices.',
      content: 'Full content would go here...',
      author: {
        name: 'Emily Watson',
        role: 'UX Designer',
        avatar: '/api/placeholder/100/100',
        verified: true
      },
      publishDate: '2024-01-05',
      readTime: '6 min read',
      category: 'UI/UX Design',
      tags: ['Mobile', 'Design', 'UX', 'Responsive', 'Figma'],
      image: '/api/placeholder/600/400',
      featured: false,
      views: 734,
      comments: 12,
      likes: 45,
      difficulty: 'Beginner',
      hasVideo: false,
      hasAudio: false,
      premium: false,
      rating: 4.5
    },
    {
      id: 5,
      title: 'The Power of Real-time Applications with WebSockets',
      excerpt: 'Building responsive real-time applications using WebSockets and modern web technologies.',
      content: 'Full content would go here...',
      author: {
        name: 'Alex Ryder',
        role: 'Lead Developer',
        avatar: '/api/placeholder/100/100',
        verified: true
      },
      publishDate: '2024-01-02',
      readTime: '9 min read',
      category: 'Web Development',
      tags: ['WebSockets', 'Real-time', 'Node.js', 'Performance', 'Socket.io'],
      image: '/api/placeholder/600/400',
      featured: false,
      views: 1023,
      comments: 18,
      likes: 78,
      difficulty: 'Intermediate',
      hasVideo: true,
      hasAudio: true,
      premium: false,
      rating: 4.6
    },
    {
      id: 6,
      title: 'Security Best Practices for Modern Web Applications',
      excerpt: 'Essential security measures every developer should implement to protect web applications from common vulnerabilities.',
      content: 'Full content would go here...',
      author: {
        name: 'Sarah Chen',
        role: 'Cloud Architect',
        avatar: '/api/placeholder/100/100',
        verified: true
      },
      publishDate: '2023-12-28',
      readTime: '11 min read',
      category: 'Security',
      tags: ['Security', 'Web', 'Best Practices', 'OWASP', 'Authentication'],
      image: '/api/placeholder/600/400',
      featured: false,
      views: 1289,
      comments: 27,
      likes: 96,
      difficulty: 'Advanced',
      hasVideo: false,
      hasAudio: true,
      premium: true,
      rating: 4.9
    }
  ];

  const categories = [
    'All',
    'Web Development',
    'Cloud Computing',
    'Artificial Intelligence',
    'UI/UX Design',
    'Security',
    'Mobile Development'
  ];

  const difficultyLevels = [
    { level: 'Beginner', color: 'bg-green-100 text-green-800' },
    { level: 'Intermediate', color: 'bg-blue-100 text-blue-800' },
    { level: 'Advanced', color: 'bg-purple-100 text-purple-800' }
  ];

  // State
  let selectedCategory = $state('All');
  let searchQuery = $state('');
  let filteredPosts = $state(blogPosts);
  let featuredPost = $state(blogPosts.find(post => post.featured));
  let savedPosts = $state(new Set());
  let likedPosts = $state(new Set());
  let darkMode = $state(false);
  let audioPlaying = $state(null);
  let readingProgress = $state(0);
  let showMobileMenu = $state(false);

  // Filter posts based on category and search
  function filterPosts() {
    let filtered = blogPosts;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query)) ||
        post.author.name.toLowerCase().includes(query)
      );
    }

    filteredPosts = filtered;
  }

  function toggleSave(postId) {
    if (savedPosts.has(postId)) {
      savedPosts.delete(postId);
    } else {
      savedPosts.add(postId);
    }
  }

  function toggleLike(postId) {
    if (likedPosts.has(postId)) {
      likedPosts.delete(postId);
    } else {
      likedPosts.add(postId);
    }
  }

  function toggleAudio(postId) {
    audioPlaying = audioPlaying === postId ? null : postId;
  }

  function toggleDarkMode() {
    darkMode = !darkMode;
    document.documentElement.classList.toggle('dark', darkMode);
  }

  $effect(() => {
    filterPosts();
  });

  onMount(() => {
    // Reading progress simulation
    const interval = setInterval(() => {
      readingProgress = (readingProgress + 1) % 100;
    }, 1000);

    return () => clearInterval(interval);
  });

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function getDifficultyColor(level) {
    return difficultyLevels.find(d => d.level === level)?.color || 'bg-gray-100 text-gray-800';
  }
</script>

<svelte:head>
  <title>Blog - RyderTech | Insights & Technology Articles</title>
  <meta name="description" content="Read the latest insights on web development, cloud computing, AI, and software architecture from the RyderTech team." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 pt-32">
  <!-- Animated Background -->
  <div class="fixed inset-0 pointer-events-none">
    <div class="absolute top-20 right-20 w-72 h-72 bg-[var(--primary)]/5 rounded-full blur-3xl animate-pulse"></div>
    <div class="absolute bottom-40 left-10 w-96 h-96 bg-[var(--secondary)]/5 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
  </div>

  <!-- Floating Action Buttons -->
  <div class="fixed bottom-6 right-6 z-40 flex flex-col space-y-3">
    <Button 
      size="icon" 
      class="w-12 h-12 rounded-full shadow-lg bg-white dark:bg-gray-800 hover:scale-110 transition-transform"
      on:click={toggleDarkMode}
    >
      {#if darkMode}
        <Sun class="w-5 h-5" />
      {:else}
        <Moon class="w-5 h-5" />
      {/if}
    </Button>
    <Button 
      size="icon" 
      class="w-12 h-12 rounded-full shadow-lg bg-[var(--primary)] text-white hover:scale-110 transition-transform"
      on:click={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <ArrowRight class="w-5 h-5 rotate-90" />
    </Button>
  </div>

  <!-- Reading Progress -->
  <div class="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 z-50">
    <div 
      class="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] transition-all duration-300"
      style="width: {readingProgress}%"
    ></div>
  </div>

  <!-- Hero Section -->
  <section class="relative py-20 px-4">
    <div class="container mx-auto max-w-6xl text-center relative z-10">
      <div class="inline-flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-[var(--primary)] font-semibold mb-6 border border-white/20">
        <Sparkles class="w-4 h-4" />
        <span>Latest Tech Insights</span>
      </div>
      
      <h1 class="text-4xl md:text-7xl font-black mb-6 leading-tight">
        <span class="bg-gradient-to-r from-[var(--primary)] via-[var(--primary-dark)] to-[var(--secondary)] bg-clip-text text-transparent">
          RyderTech
        </span>
        <br />
        <span class="text-gray-900 dark:text-white">Blog</span>
      </h1>
      
      <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
        Dive deep into cutting-edge technology, expert tutorials, and industry insights. 
        <span class="text-[var(--primary)] font-semibold">Learn, build, and innovate</span> with our comprehensive guides.
      </p>

      <!-- Interactive Search -->
      <div class="relative max-w-2xl mx-auto group">
        <Search class="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--primary)] transition-colors" />
        <Input
          type="text"
          bind:value={searchQuery}
          placeholder="Search articles, tutorials, or technologies..."
          class="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[var(--primary)] shadow-lg rounded-2xl transition-all duration-300 group-hover:shadow-xl"
        />
        <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
          <kbd class="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
            ⌘K
          </kbd>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="flex flex-wrap justify-center gap-6 mt-8">
        {#each [
          { icon: BookOpen, label: 'Articles', value: '50+' },
          { icon: User, label: 'Experts', value: '10+' },
          { icon: Eye, label: 'Monthly Views', value: '50K+' },
          { icon: ThumbsUp, label: 'Community', value: '5K+' }
        ] as stat}
          <div class="text-center group">
            <div class="w-16 h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <stat.icon class="w-6 h-6 text-[var(--primary)]" />
            </div>
            <div class="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Featured Post - Enhanced -->
  {#if featuredPost}
    <section class="relative py-16 px-4">
      <div class="container mx-auto max-w-6xl">
        <div class="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-600/20 backdrop-blur-sm">
          <div class="grid lg:grid-cols-2 gap-0">
            <!-- Featured Image with Overlay -->
            <div class="relative h-96 lg:h-full min-h-[400px] group">
              <img 
                src={featuredPost.image} 
                alt={featuredPost.title}
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              
              <!-- Badges -->
              <div class="absolute top-6 left-6 flex flex-wrap gap-2">
                <Badge class="bg-[var(--secondary)] text-gray-900 border-none shadow-lg">
                  <Crown class="w-3 h-3 mr-1" />
                  Featured
                </Badge>
                {#if featuredPost.premium}
                  <Badge class="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 border-none shadow-lg">
                    <Star class="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                {/if}
                <Badge class={getDifficultyColor(featuredPost.difficulty) + " shadow-lg"}>
                  {featuredPost.difficulty}
                </Badge>
              </div>

              <!-- Audio Player -->
              {#if featuredPost.hasAudio}
                <div class="absolute bottom-6 left-6">
                  <Button 
                    size="icon" 
                    class="rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:scale-110 transition-transform shadow-lg"
                    on:click={() => toggleAudio(featuredPost.id)}
                  >
                    {#if audioPlaying === featuredPost.id}
                      <Pause class="w-4 h-4" />
                    {:else}
                      <Play class="w-4 h-4" />
                    {/if}
                  </Button>
                </div>
              {/if}
            </div>

            <!-- Featured Content -->
            <div class="p-8 lg:p-12 flex flex-col justify-center relative">
              <!-- Author -->
              <div class="flex items-center space-x-3 mb-6">
                <img 
                  src={featuredPost.author.avatar} 
                  alt={featuredPost.author.name}
                  class="w-12 h-12 rounded-full border-2 border-white dark:border-gray-600 shadow-lg"
                />
                <div>
                  <div class="flex items-center space-x-2">
                    <span class="font-semibold text-gray-900 dark:text-white">{featuredPost.author.name}</span>
                    {#if featuredPost.author.verified}
                      <Badge class="bg-blue-100 text-blue-800 border-none text-xs">
                        <Star class="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    {/if}
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{featuredPost.author.role}</p>
                </div>
              </div>

              <!-- Content -->
              <Badge variant="outline" class="w-fit mb-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                {featuredPost.category}
              </Badge>
              
              <h2 class="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4 leading-tight">
                {featuredPost.title}
              </h2>
              
              <p class="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                {featuredPost.excerpt}
              </p>

              <!-- Meta Information -->
              <div class="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <div class="flex items-center space-x-2">
                  <Calendar class="w-4 h-4" />
                  <span>{formatDate(featuredPost.publishDate)}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <Clock class="w-4 h-4" />
                  <span>{featuredPost.readTime}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <Star class="w-4 h-4 text-yellow-500" />
                  <span>{featuredPost.rating}</span>
                </div>
              </div>

              <!-- Engagement Stats -->
              <div class="flex items-center space-x-6 mb-6">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  class={`flex items-center space-x-2 ${likedPosts.has(featuredPost.id) ? 'text-red-500' : ''}`}
                  on:click={() => toggleLike(featuredPost.id)}
                >
                  <Heart class="w-4 h-4 {likedPosts.has(featuredPost.id) ? 'fill-current' : ''}" />
                  <span>{featuredPost.likes + (likedPosts.has(featuredPost.id) ? 1 : 0)}</span>
                </Button>
                <Button variant="ghost" size="sm" class="flex items-center space-x-2">
                  <MessageCircle class="w-4 h-4" />
                  <span>{featuredPost.comments}</span>
                </Button>
                <Button variant="ghost" size="sm" class="flex items-center space-x-2">
                  <Eye class="w-4 h-4" />
                  <span>{featuredPost.views}</span>
                </Button>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-wrap gap-3">
                <Button size="lg" class="flex-1 min-w-[200px] bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] hover:shadow-lg transition-all duration-300">
                  Read Full Article
                  <ArrowRight class="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  class="w-12 h-12 rounded-xl border-2"
                  on:click={() => toggleSave(featuredPost.id)}
                >
                  {#if savedPosts.has(featuredPost.id)}
                    <BookmarkCheck class="w-5 h-5 text-[var(--primary)]" />
                  {:else}
                    <Bookmark class="w-5 h-5" />
                  {/if}
                </Button>
                <Button variant="outline" size="icon" class="w-12 h-12 rounded-xl border-2">
                  <Share2 class="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  {/if}

  <!-- Continue from previous code... -->

  <!-- Trending Topics Section -->
  <section class="py-16 px-4">
    <div class="container mx-auto max-w-6xl">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
          <span class="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
            Trending
          </span>
          Topics
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Explore the most discussed technologies and frameworks in the developer community
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {#each [
          { 
            topic: 'AI & Machine Learning', 
            trend: '+42%', 
            articles: '28', 
            icon: Zap,
            color: 'from-purple-500 to-pink-500',
            description: 'Transform your applications with intelligent features'
          },
          { 
            topic: 'Web3 & Blockchain', 
            trend: '+67%', 
            articles: '19', 
            icon: TrendingUp,
            color: 'from-orange-500 to-red-500',
            description: 'Build decentralized applications of the future'
          },
          { 
            topic: 'Cloud Native', 
            trend: '+35%', 
            articles: '42', 
            icon: Cloud,
            color: 'from-blue-500 to-cyan-500',
            description: 'Scalable architectures for modern applications'
          },
          { 
            topic: 'DevOps & SRE', 
            trend: '+28%', 
            articles: '31', 
            icon: Settings,
            color: 'from-green-500 to-emerald-500',
            description: 'Streamline development and operations workflows'
          }
        ] as trend}
          <Card class="group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 backdrop-blur-sm">
            <CardContent class="p-6 text-center">
              <div class={`w-16 h-16 bg-gradient-to-r ${trend.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <trend.icon class="w-8 h-8 text-white" />
              </div>
              <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-2">{trend.topic}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">{trend.description}</p>
              <div class="flex items-center justify-between text-sm">
                <span class="text-green-500 font-semibold">{trend.trend}</span>
                <span class="text-gray-500">{trend.articles} articles</span>
              </div>
            </CardContent>
          </Card>
        {/each}
      </div>
    </div>
  </section>

  <!-- Learning Paths Section -->
  <section class="py-16 px-4 bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5 dark:from-gray-800 dark:to-gray-700">
    <div class="container mx-auto max-w-6xl">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
          Structured 
          <span class="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
            Learning Paths
          </span>
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Follow curated learning journeys from beginner to expert level
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        {#each [
          {
            title: 'Full-Stack Development',
            level: 'Beginner to Advanced',
            duration: '6 months',
            courses: '24',
            progress: 65,
            color: 'from-blue-500 to-purple-600',
            skills: ['React', 'Node.js', 'Database', 'Deployment'],
            description: 'Master both frontend and backend technologies'
          },
          {
            title: 'Cloud Engineering',
            level: 'Intermediate to Expert',
            duration: '4 months',
            courses: '18',
            progress: 40,
            color: 'from-green-500 to-blue-600',
            skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
            description: 'Become a cloud infrastructure expert'
          },
          {
            title: 'AI & Data Science',
            level: 'Advanced',
            duration: '8 months',
            courses: '32',
            progress: 25,
            color: 'from-purple-500 to-pink-600',
            skills: ['Python', 'TensorFlow', 'MLOps', 'Big Data'],
            description: 'Build intelligent systems and models'
          }
        ] as path}
          <Card class="group hover:shadow-2xl transition-all duration-500 border-0 bg-white dark:bg-gray-800 backdrop-blur-sm overflow-hidden">
            <div class={`h-2 bg-gradient-to-r ${path.color}`}></div>
            <CardContent class="p-6">
              <div class="flex items-start justify-between mb-4">
                <h3 class="font-bold text-xl text-gray-900 dark:text-white">{path.title}</h3>
                <Badge class="bg-gradient-to-r {path.color} text-white border-none">
                  {path.level.split(' ')[0]}
                </Badge>
              </div>
              
              <p class="text-gray-600 dark:text-gray-300 mb-4">{path.description}</p>
              
              <div class="space-y-3 mb-6">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Duration</span>
                  <span class="font-semibold">{path.duration}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Courses</span>
                  <span class="font-semibold">{path.courses}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Progress</span>
                  <span class="font-semibold">{path.progress}%</span>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                <div 
                  class={`h-2 rounded-full bg-gradient-to-r ${path.color} transition-all duration-1000`}
                  style="width: {path.progress}%"
                ></div>
              </div>

              <!-- Skills -->
              <div class="flex flex-wrap gap-2 mb-4">
                {#each path.skills as skill}
                  <Badge variant="outline" class="text-xs">
                    {skill}
                  </Badge>
                {/each}
              </div>

              <Button class="w-full bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-700 dark:to-gray-600 hover:shadow-lg transition-all duration-300">
                Start Learning Path
                <Rocket class="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        {/each}
      </div>
    </div>
  </section>

  <!-- Community Spotlight -->
  <section class="py-16 px-4">
    <div class="container mx-auto max-w-6xl">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
          Community
          <span class="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
            Spotlight
          </span>
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Featured projects and success stories from our developer community
        </p>
      </div>

      <div class="grid lg:grid-cols-2 gap-8">
        <!-- Success Story -->
        <Card class="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 border-0 shadow-xl">
          <CardContent class="p-8">
            <div class="flex items-center mb-6">
              <img 
                src="/api/placeholder/80/80" 
                alt="Sarah Johnson"
                class="w-16 h-16 rounded-full border-4 border-white dark:border-gray-700 shadow-lg"
              />
              <div class="ml-4">
                <h3 class="font-bold text-lg text-gray-900 dark:text-white">Sarah Johnson</h3>
                <p class="text-gray-600 dark:text-gray-300">Full-Stack Developer</p>
                <div class="flex items-center space-x-1 mt-1">
                  {#each Array(5) as _, i}
                    <Star class="w-4 h-4 {i < 4 ? 'text-yellow-500 fill-current' : 'text-gray-300'}" />
                  {/each}
                </div>
              </div>
            </div>
            
            <blockquote class="text-gray-700 dark:text-gray-300 italic mb-6 leading-relaxed">
              "The learning paths on RyderTech Blog transformed my career. I went from junior developer to team lead in 18 months. The practical projects and expert guidance were invaluable."
            </blockquote>
            
            <div class="flex items-center justify-between">
              <div>
                <p class="font-semibold text-gray-900 dark:text-white">Projects Completed</p>
                <p class="text-2xl font-black text-[var(--primary)]">24</p>
              </div>
              <div>
                <p class="font-semibold text-gray-900 dark:text-white">Salary Increase</p>
                <p class="text-2xl font-black text-green-500">+85%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Community Project -->
        <Card class="bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/20 border-0 shadow-xl overflow-hidden">
          <div class="h-48 bg-gradient-to-r from-green-400 to-blue-500 relative">
            <img 
              src="/api/placeholder/600/400" 
              alt="Open Source Project"
              class="w-full h-full object-cover"
            />
            <div class="absolute top-4 right-4">
              <Badge class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white">
                <TrendingUp class="w-3 h-3 mr-1" />
                Trending
              </Badge>
            </div>
          </div>
          <CardContent class="p-6">
            <h3 class="font-bold text-xl text-gray-900 dark:text-white mb-2">EcoTrack - Sustainability Dashboard</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-4">
              Open-source platform for tracking and reducing carbon footprint. Built with SvelteKit and Supabase.
            </p>
            
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-4 text-sm text-gray-500">
                <div class="flex items-center space-x-1">
                  <Star class="w-4 h-4" />
                  <span>428 stars</span>
                </div>
                <div class="flex items-center space-x-1">
                  <GitBranch class="w-4 h-4" />
                  <span>67 forks</span>
                </div>
              </div>
              <Badge class="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Open Source
              </Badge>
            </div>

            <div class="flex items-center space-x-3">
              <Button size="sm" class="flex-1">
                <ExternalLink class="w-4 h-4 mr-2" />
                View Project
              </Button>
              <Button variant="outline" size="sm">
                <Star class="w-4 h-4 mr-2" />
                Star
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>

  <!-- Weekly Newsletter -->
  <section class="py-16 px-4 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white">
    <div class="container mx-auto max-w-4xl text-center">
      <div class="bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/20">
        <div class="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Rocket class="w-10 h-10 text-white" />
        </div>
        
        <h2 class="text-3xl md:text-4xl font-black mb-4">
          Join 10,000+ Developers
        </h2>
        
        <p class="text-xl opacity-90 mb-8 max-w-2xl mx-auto leading-relaxed">
          Get weekly insights, exclusive tutorials, and early access to new content. 
          Plus, receive our free <span class="font-semibold">"Advanced JavaScript Patterns"</span> ebook.
        </p>

        <div class="grid md:grid-cols-3 gap-4 mb-8 text-left">
          {#each [
            'Weekly curated articles',
            'Exclusive video content',
            'Early access to courses',
            'Community discounts',
            'Career advice',
            'Project ideas'
          ] as benefit, i}
            <div class="flex items-center space-x-3">
              <div class="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Check class="w-3 h-3 text-white" />
              </div>
              <span class="text-white/90">{benefit}</span>
            </div>
          {/each}
        </div>

        <div class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Enter your email"
            class="flex-1 py-3 px-4 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:border-white"
          />
          <Button size="lg" class="bg-white text-[var(--primary)] hover:bg-gray-100 font-semibold">
            Subscribe Now
            <ArrowRight class="w-4 h-4 ml-2" />
          </Button>
        </div>
        
        <p class="text-white/70 text-sm mt-4">
          No spam. Unsubscribe at any time. 
          <span class="font-semibold">Join our community today!</span>
        </p>
      </div>
    </div>
  </section>

  <!-- Expert Contributors -->
  <section class="py-16 px-4">
    <div class="container mx-auto max-w-6xl">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
          Meet Our
          <span class="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
            Experts
          </span>
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Learn from industry professionals with years of experience
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {#each [
          {
            name: 'Alex Ryder',
            role: 'Lead Developer',
            expertise: ['Svelte', 'React', 'Node.js'],
            articles: 42,
            followers: '12.4K',
            avatar: '/api/placeholder/100/100',
            verified: true
          },
          {
            name: 'Sarah Chen',
            role: 'Cloud Architect',
            expertise: ['AWS', 'Azure', 'Kubernetes'],
            articles: 28,
            followers: '8.7K',
            avatar: '/api/placeholder/100/100',
            verified: true
          },
          {
            name: 'Mike Rodriguez',
            role: 'AI Specialist',
            expertise: ['Python', 'TensorFlow', 'ML'],
            articles: 35,
            followers: '15.2K',
            avatar: '/api/placeholder/100/100',
            verified: true
          },
          {
            name: 'Emily Watson',
            role: 'UX Designer',
            expertise: ['Figma', 'UI Design', 'Research'],
            articles: 19,
            followers: '6.3K',
            avatar: '/api/placeholder/100/100',
            verified: true
          }
        ] as expert}
          <Card class="group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 bg-white dark:bg-gray-800 backdrop-blur-sm text-center">
            <CardContent class="p-6">
              <div class="relative inline-block mb-4">
                <img 
                  src={expert.avatar} 
                  alt={expert.name}
                  class="w-20 h-20 rounded-full border-4 border-white dark:border-gray-700 shadow-lg group-hover:scale-110 transition-transform duration-300"
                />
                {#if expert.verified}
                  <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                    <Check class="w-3 h-3 text-white" />
                  </div>
                {/if}
              </div>
              
              <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-1">{expert.name}</h3>
              <p class="text-gray-600 dark:text-gray-300 text-sm mb-4">{expert.role}</p>
              
              <div class="flex flex-wrap justify-center gap-1 mb-4">
                {#each expert.expertise.slice(0, 2) as skill}
                  <Badge variant="outline" class="text-xs">
                    {skill}
                  </Badge>
                {/each}
              </div>
              
              <div class="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div>
                  <div class="font-semibold text-gray-900 dark:text-white">{expert.articles}</div>
                  <div>Articles</div>
                </div>
                <div>
                  <div class="font-semibold text-gray-900 dark:text-white">{expert.followers}</div>
                  <div>Followers</div>
                </div>
              </div>
              
              <Button variant="outline" class="w-full">
                Follow Expert
              </Button>
            </CardContent>
          </Card>
        {/each}
      </div>
    </div>
  </section>

  <!-- Resources & Tools -->
  <section class="py-16 px-4 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
    <div class="container mx-auto max-w-6xl">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
          Free
          <span class="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
            Resources
          </span>
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Downloadable templates, cheatsheets, and tools to boost your productivity
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each [
          {
            title: 'React Component Library',
            type: 'Starter Template',
            downloads: '2.4K',
            size: '4.2 MB',
            icon: Download,
            color: 'from-blue-500 to-cyan-500'
          },
          {
            title: 'AWS Architecture Guide',
            type: 'PDF Guide',
            downloads: '1.8K',
            size: '3.1 MB',
            icon: FileText,
            color: 'from-orange-500 to-red-500'
          },
          {
            title: 'JavaScript Cheatsheet',
            type: 'Quick Reference',
            downloads: '5.7K',
            size: '1.2 MB',
            icon: BookOpen,
            color: 'from-yellow-500 to-orange-500'
          },
          {
            title: 'Figma UI Kit',
            type: 'Design System',
            downloads: '3.2K',
            size: '8.5 MB',
            icon: Palette,
            color: 'from-purple-500 to-pink-500'
          },
          {
            title: 'Docker Compose Templates',
            type: 'Configuration',
            downloads: '2.1K',
            size: '2.3 MB',
            icon: Settings,
            color: 'from-green-500 to-emerald-500'
          },
          {
            title: 'API Security Checklist',
            type: 'Best Practices',
            downloads: '4.3K',
            size: '0.8 MB',
            icon: Shield,
            color: 'from-red-500 to-pink-500'
          }
        ] as resource}
          <Card class="group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 bg-white dark:bg-gray-800 backdrop-blur-sm">
            <CardContent class="p-6">
              <div class={`w-12 h-12 bg-gradient-to-r ${resource.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <resource.icon class="w-6 h-6 text-white" />
              </div>
              
              <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-2">{resource.title}</h3>
              <Badge variant="outline" class="mb-4">{resource.type}</Badge>
              
              <div class="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span>{resource.downloads} downloads</span>
                <span>{resource.size}</span>
              </div>
              
              <Button class="w-full bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-700 dark:to-gray-600">
                <Download class="w-4 h-4 mr-2" />
                Download Free
              </Button>
            </CardContent>
          </Card>
        {/each}
      </div>
    </div>
  </section>

</div>

<style>
  /* Enhanced animations */
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  .animate-float {
    animation: float 6s ease-in-out infinite;
  }

  /* Smooth scrolling */
  html {
    scroll-behavior: smooth;
  }

  /* Custom selection */
  ::selection {
    background: var(--primary);
    color: white;
  }

  /* Gradient text animation */
  .gradient-text-animate {
    background: linear-gradient(-45deg, var(--primary), var(--secondary), var(--primary-dark), var(--primary));
    background-size: 400% 400%;
    animation: gradient 8s ease infinite;
  }

  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
</style>