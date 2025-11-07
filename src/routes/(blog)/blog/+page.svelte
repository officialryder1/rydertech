<script>
  import { onMount } from 'svelte';
  import { 
    Calendar, User, Clock, ArrowRight, Search, 
    Tag, BookOpen, TrendingUp, Filter, ChevronDown,
    Share2, Bookmark, Eye, MessageCircle
  } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Input } from '$lib/components/ui/input';
  
  let { data } = $props()
  console.log(data)

  let blogPosts = data?.posts;

  // Blog posts data
  // const blogPosts = [
  //   {
  //     id: 1,
  //     title: 'The Future of Web Development: Svelte vs React in 2024',
  //     excerpt: 'Exploring the performance benefits and developer experience differences between Svelte and React for modern web applications.',
  //     content: 'Full content would go here...',
  //     author: 'Alex Ryder',
  //     publishDate: '2024-01-15',
  //     readTime: '8 min read',
  //     category: 'Web Development',
  //     tags: ['Svelte', 'React', 'Performance', 'JavaScript'],
  //     image: '/api/placeholder/600/400',
  //     featured: true,
  //     views: 1247,
  //     comments: 23
  //   },
  //   {
  //     id: 2,
  //     title: 'Building Scalable Cloud Architecture with AWS Serverless',
  //     excerpt: 'Best practices for designing and implementing serverless architectures that scale efficiently with your business needs.',
  //     content: 'Full content would go here...',
  //     author: 'Sarah Chen',
  //     publishDate: '2024-01-12',
  //     readTime: '12 min read',
  //     category: 'Cloud Computing',
  //     tags: ['AWS', 'Serverless', 'Architecture', 'Scalability'],
  //     image: '/api/placeholder/600/400',
  //     featured: true,
  //     views: 892,
  //     comments: 15
  //   },
  //   {
  //     id: 3,
  //     title: 'AI Integration: Transforming Business Applications',
  //     excerpt: 'How to effectively integrate AI and machine learning capabilities into your existing business applications.',
  //     content: 'Full content would go here...',
  //     author: 'Mike Rodriguez',
  //     publishDate: '2024-01-08',
  //     readTime: '10 min read',
  //     category: 'Artificial Intelligence',
  //     tags: ['AI', 'Machine Learning', 'Integration', 'Business'],
  //     image: '/api/placeholder/600/400',
  //     featured: false,
  //     views: 1563,
  //     comments: 31
  //   },
  //   {
  //     id: 4,
  //     title: 'Mobile-First Design: Creating Exceptional User Experiences',
  //     excerpt: 'Strategies for designing mobile applications that provide seamless user experiences across all devices.',
  //     content: 'Full content would go here...',
  //     author: 'Emily Watson',
  //     publishDate: '2024-01-05',
  //     readTime: '6 min read',
  //     category: 'UI/UX Design',
  //     tags: ['Mobile', 'Design', 'UX', 'Responsive'],
  //     image: '/api/placeholder/600/400',
  //     featured: false,
  //     views: 734,
  //     comments: 12
  //   },
  //   {
  //     id: 5,
  //     title: 'The Power of Real-time Applications with WebSockets',
  //     excerpt: 'Building responsive real-time applications using WebSockets and modern web technologies.',
  //     content: 'Full content would go here...',
  //     author: 'Alex Ryder',
  //     publishDate: '2024-01-02',
  //     readTime: '9 min read',
  //     category: 'Web Development',
  //     tags: ['WebSockets', 'Real-time', 'Node.js', 'Performance'],
  //     image: '/api/placeholder/600/400',
  //     featured: false,
  //     views: 1023,
  //     comments: 18
  //   },
  //   {
  //     id: 6,
  //     title: 'Security Best Practices for Modern Web Applications',
  //     excerpt: 'Essential security measures every developer should implement to protect web applications from common vulnerabilities.',
  //     content: 'Full content would go here...',
  //     author: 'Sarah Chen',
  //     publishDate: '2023-12-28',
  //     readTime: '11 min read',
  //     category: 'Security',
  //     tags: ['Security', 'Web', 'Best Practices', 'OWASP'],
  //     image: '/api/placeholder/600/400',
  //     featured: false,
  //     views: 1289,
  //     comments: 27
  //   }
  // ];

  const categories = [
    'All',
    'Web Development',
    'Cloud Computing',
    'Artificial Intelligence',
    'UI/UX Design',
    'Security',
    'Mobile Development'
  ];

  const popularTags = [
    'Svelte', 'React', 'AWS', 'AI', 'Security', 
    'Performance', 'Design', 'JavaScript', 'Node.js'
  ];

  // State
  let selectedCategory = $state('All');
  let searchQuery = $state('');
  let filteredPosts = $state(blogPosts);
  let featuredPost = $state(blogPosts.find(post => post.featured));

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
        post.author.toLowerCase().includes(query)
      );
    }

    filteredPosts = filtered;
  }

  $effect(() => {
    filterPosts();
  });

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
</script>

<svelte:head>
  <title>Blog - RyderTech | Insights & Technology Articles</title>
  <meta name="description" content="Read the latest insights on web development, cloud computing, AI, and software architecture from the RyderTech team." />
</svelte:head>

<div class="min-h-screen bg-background pt-32">
  <!-- Hero Section -->
  <section class="py-20 px-4 bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5">
    <div class="container mx-auto max-w-6xl text-center">
      <Badge variant="secondary" class="mb-4">Blog & Insights</Badge>
      <h1 class="text-4xl md:text-6xl font-bold mb-6">
        RyderTech <span class="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] bg-clip-text text-transparent">Blog</span>
      </h1>
      <p class="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
        Expert insights, tutorials, and thought leadership on software development, 
        cloud architecture, AI integration, and modern web technologies.
      </p>
      <div class="relative max-w-2xl mx-auto">
        <Search class="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          bind:value={searchQuery}
          placeholder="Search articles, topics, or authors..."
          class="pl-12 pr-4 py-3 text-lg border-2 border-gray-200 focus:border-[var(--primary)]"
        />
      </div>
    </div>
  </section>

  <!-- Featured Post -->
  {#if featuredPost}
    <section class="py-16 px-4">
      <div class="container mx-auto max-w-6xl">
        <div class="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div class="grid lg:grid-cols-2 gap-8">
            <!-- Featured Image -->
            <div class="relative h-80 lg:h-full">
              <img 
                src={featuredPost.image} 
                alt={featuredPost.title}
                class="w-full h-full object-cover"
              />
              <div class="absolute top-4 left-4">
                <Badge class="bg-[var(--secondary)] text-gray-900 border-none">
                  Featured
                </Badge>
              </div>
            </div>

            <!-- Featured Content -->
            <div class="p-8 lg:p-12 flex flex-col justify-center">
              <Badge variant="outline" class="w-fit mb-4">
                {featuredPost.category}
              </Badge>
              
              <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {featuredPost.title}
              </h2>
              
              <p class="text-lg text-muted-foreground mb-6 leading-relaxed">
                {featuredPost.excerpt}
              </p>

              <!-- Meta Information -->
              <div class="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                <div class="flex items-center space-x-2">
                  <User class="w-4 h-4" />
                  <span>{featuredPost.author}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <Calendar class="w-4 h-4" />
                  <span>{formatDate(featuredPost.publishDate)}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <Clock class="w-4 h-4" />
                  <span>{featuredPost.readTime}</span>
                </div>
              </div>

              <!-- Tags -->
              <div class="flex flex-wrap gap-2 mb-6">
                {#each featuredPost.tags.slice(0, 3) as tag}
                  <Badge variant="outline" class="text-xs">
                    <Tag class="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                {/each}
              </div>

              <!-- Stats -->
              <div class="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                <div class="flex items-center space-x-1">
                  <Eye class="w-4 h-4" />
                  <span>{featuredPost.views} views</span>
                </div>
                <div class="flex items-center space-x-1">
                  <MessageCircle class="w-4 h-4" />
                  <span>{featuredPost.comments} comments</span>
                </div>
              </div>

              <Button size="lg" class="w-fit">
                <a href={featuredPost.path}>Read Full Article</a>
                <ArrowRight class="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  {/if}

  <!-- Blog Content -->
  <section class="py-16 px-4">
    <div class="container mx-auto max-w-6xl">
      <div class="grid lg:grid-cols-4 gap-8">
        <!-- Sidebar -->
        <div class="lg:col-span-1 space-y-8">
          <!-- Categories -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Filter class="w-5 h-5" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-2">
              {#each categories as category}
                <button
                  class={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === category
                      ? 'bg-[var(--primary)] text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  on:click={() => selectedCategory = category}
                >
                  <div class="flex items-center justify-between">
                    <span>{category}</span>
                    {#if category !== 'All'}
                      <span class="text-xs opacity-70">
                        {blogPosts.filter(post => post.category === category).length}
                      </span>
                    {/if}
                  </div>
                </button>
              {/each}
            </CardContent>
          </Card>

          <!-- Popular Tags -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Tag class="w-5 h-5" />
                Popular Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="flex flex-wrap gap-2">
                {#each popularTags as tag}
                  <Badge 
                    variant="outline" 
                    class="cursor-pointer hover:bg-[var(--primary)] hover:text-white transition-colors"
                    on:click={() => {
                      searchQuery = tag;
                      selectedCategory = 'All';
                    }}
                  >
                    {tag}
                  </Badge>
                {/each}
              </div>
            </CardContent>
          </Card>

          <!-- Newsletter CTA -->
          <Card class="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white">
            <CardContent class="p-6 text-center">
              <BookOpen class="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h3 class="font-bold text-lg mb-2">Stay Updated</h3>
              <p class="text-white/80 text-sm mb-4">
                Get the latest articles and insights delivered to your inbox.
              </p>
              <Button variant="secondary" class="w-full">
                Subscribe to Newsletter
              </Button>
            </CardContent>
          </Card>
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-3">
          <!-- Header -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">
                {#if selectedCategory === 'All'}
                  All Articles
                {:else}
                  {selectedCategory}
                {/if}
                <span class="text-gray-500 text-lg ml-2">
                  ({filteredPosts.length})
                </span>
              </h2>
              <p class="text-gray-600">
                {#if searchQuery}
                  Search results for "{searchQuery}"
                {:else}
                  Latest insights and tutorials
                {/if}
              </p>
            </div>

            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-600">Sort by:</span>
              <select class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-sm">
                <option>Latest</option>
                <option>Most Popular</option>
                <option>Trending</option>
              </select>
            </div>
          </div>

          <!-- Blog Posts Grid -->
          {#if filteredPosts.length > 0}
            <div class="grid md:grid-cols-2 gap-8">
              {#each filteredPosts as post}
                <Card class="group hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-[var(--primary)]/20">
                  <!-- Post Image -->
                  <div class="relative h-48 overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {#if post.featured}
                      <div class="absolute top-3 left-3">
                        <Badge class="bg-[var(--secondary)] text-gray-900 border-none text-xs">
                          Featured
                        </Badge>
                      </div>
                    {/if}
                  </div>

                  <CardContent class="p-6">
                    <!-- Category -->
                    <Badge variant="outline" class="mb-3 text-xs">
                      {post.category}
                    </Badge>

                    <!-- Title -->
                    <h3 class="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
                      {post.title}
                    </h3>

                    <!-- Excerpt -->
                    <p class="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>

                    <!-- Meta Information -->
                    <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div class="flex items-center space-x-4">
                        <div class="flex items-center space-x-1">
                          <User class="w-4 h-4" />
                          <span>{post.author}</span>
                        </div>
                        <div class="flex items-center space-x-1">
                          <Calendar class="w-4 h-4" />
                          <span>{formatDate(post.publishDate)}</span>
                        </div>
                      </div>
                      <div class="flex items-center space-x-1">
                        <Clock class="w-4 h-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>

                    <!-- Tags -->
                    <div class="flex flex-wrap gap-1 mb-4">
                      {#each post.tags.slice(0, 2) as tag}
                        <Badge variant="outline" class="text-xs">
                          {tag}
                        </Badge>
                      {/each}
                    </div>

                    <!-- Stats and Actions -->
                    <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div class="flex items-center space-x-4 text-xs text-gray-500">
                        <div class="flex items-center space-x-1">
                          <Eye class="w-3 h-3" />
                          <span>{post.views}</span>
                        </div>
                        <div class="flex items-center space-x-1">
                          <MessageCircle class="w-3 h-3" />
                          <span>{post.comments}</span>
                        </div>
                      </div>
                      <div class="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
                          <Bookmark class="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
                          <Share2 class="w-3 h-3" />
                        </Button>
                        <a href={post.path}><Button size="sm" class="h-8">
                          Read
                          <ArrowRight class="w-3 h-3 ml-1" />
                        </Button></a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              {/each}
            </div>
          {:else}
            <!-- No Results -->
            <Card class="text-center py-16">
              <CardContent>
                <BookOpen class="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 class="text-xl font-bold text-gray-900 mb-2">No articles found</h3>
                <p class="text-gray-600 mb-6">
                  {#if searchQuery}
                    No results found for "{searchQuery}". Try different keywords or browse all categories.
                  {:else}
                    No articles available in this category yet.
                  {/if}
                </p>
                <Button 
                  variant="outline" 
                  on:click={() => {
                    selectedCategory = 'All';
                    searchQuery = '';
                  }}
                >
                  View All Articles
                </Button>
              </CardContent>
            </Card>
          {/if}

          <!-- Load More Button -->
          {#if filteredPosts.length > 0 && filteredPosts.length >= 6}
            <div class="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Articles
                <ArrowRight class="w-4 h-4 ml-2" />
              </Button>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="py-20 px-4 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white">
    <div class="container mx-auto max-w-4xl text-center">
      <h2 class="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Business?</h2>
      <p class="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
        Let's discuss how our expertise can help you build the next generation of digital solutions.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="secondary" size="lg" class="text-lg">
          Start Your Project
          <ArrowRight class="w-5 h-5 ml-2" />
        </Button>
        <Button variant="outline" size="lg" class="text-lg bg-transparent border-white text-white hover:bg-white hover:text-[var(--primary)]">
          Browse Our Services
        </Button>
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

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>