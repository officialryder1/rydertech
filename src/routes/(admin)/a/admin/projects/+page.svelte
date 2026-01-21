<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Copy, ExternalLink, Eye, EyeOff } from '@lucide/svelte';
  import { toast } from 'svelte-sonner';

  let projects: any[] = [];
  let loading = true;

  onMount(async () => {
    await loadProjects();
  });

  async function loadProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        reviews (
          id,
          rating,
          approved
        )
      `)
      .order('created_at', { ascending: false });

    if (!error) {
      projects = data || [];
    }
    loading = false;
  }

  async function createProject() {
    const projectName = prompt('Enter project name:');
    const clientName = prompt('Enter client name:');
    
    if (!projectName || !clientName) return;

    const { data, error } = await supabase
      .from('projects')
      .insert({
        project_name: projectName,
        client_name: clientName,
        is_published: true
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create project');
      return;
    }

    toast.success('Project created!');
    await loadProjects();
  }

  function getFeedbackLink(uuid: string) {
    return `${window.location.origin}/feedback/${uuid}`;
  }

  async function copyFeedbackLink(uuid: string) {
    await navigator.clipboard.writeText(getFeedbackLink(uuid));
    toast.success('Feedback link copied!');
  }

  async function togglePublish(project: any) {
    const { error } = await supabase
      .from('projects')
      .update({ is_published: !project.is_published })
      .eq('id', project.id);

    if (error) {
      toast.error('Failed to update');
      return;
    }

    await loadProjects();
    toast.success(`Project ${project.is_published ? 'unpublished' : 'published'}`);
  }
</script>

<div class="container mx-auto py-8">
  <div class="flex justify-between items-center mb-8">
    <div>
      <h1 class="text-3xl font-bold">Projects & Reviews</h1>
      <p class="text-gray-600">Manage client feedback links and reviews</p>
    </div>
    <Button onclick={createProject}>+ New Project</Button>
  </div>

  {#if loading}
    <div class="text-center py-12">Loading...</div>
  {:else}
    <div class="grid gap-6">
      {#each projects as project (project.id)}
        <Card>
          <CardHeader>
            <div class="flex justify-between items-start">
              <div>
                <CardTitle>{project.project_name}</CardTitle>
                <CardDescription>Client: {project.client_name}</CardDescription>
              </div>
              <div class="flex gap-2">
                <Badge variant={project.is_published ? 'default' : 'secondary'}>
                  {project.is_published ? 'Published' : 'Draft'}
                </Badge>
                {#if project.reviews && project.reviews.length > 0}
                  <Badge variant="outline">
                    {project.reviews.length} review{project.reviews.length === 1 ? '' : 's'}
                  </Badge>
                {/if}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <!-- Feedback Link -->
              <div>
                <p class="text-sm font-medium mb-2">Feedback Link:</p>
                <div class="flex gap-2">
                  <code class="flex-1 bg-gray-100 p-2 rounded text-sm truncate">
                    {getFeedbackLink(project.review_link_uuid)}
                  </code>
                  <Button variant="outline" size="sm" onclick={() => copyFeedbackLink(project.review_link_uuid)}>
                    <Copy class="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onclick={() => window.open(getFeedbackLink(project.review_link_uuid), '_blank')}>
                    <ExternalLink class="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-2">
                <Button variant="outline" size="sm" onclick={() => togglePublish(project)}>
                  {#if project.is_published}
                    <EyeOff class="h-4 w-4 mr-2" />
                    Unpublish
                  {:else}
                    <Eye class="h-4 w-4 mr-2" />
                    Publish
                  {/if}
                </Button>
                <Button variant="outline" size="sm" onclick={() => window.location.href = `/a/admin/reviews/${project.id}`}>
                  View Reviews ({project.reviews?.length || 0})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      {/each}
    </div>
  {/if}
</div>