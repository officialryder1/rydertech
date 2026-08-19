<script lang="ts">
  import { Mail, Lock, ArrowRight, Loader2 } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { supabase } from '$lib/supabaseClient';

  let email = $state('');
  let password = $state('');
  let mode = $state<'magic' | 'password'>('magic');
  let loading = $state(false);
  let message = $state<string | null>(null);
  let error = $state<string | null>(null);

  async function handleMagicLink(e: Event) {
    e.preventDefault();
    error = null;
    message = null;
    if (!email.includes('@')) {
      error = 'Enter a valid email address.';
      return;
    }
    loading = true;
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/account` }
    });
    loading = false;
    if (err) error = err.message;
    else message = 'Check your inbox for the login link.';
  }

  async function handlePassword(e: Event) {
    e.preventDefault();
    error = null;
    message = null;
    loading = true;
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    loading = false;
    if (err) error = err.message;
    else window.location.href = '/account';
  }
</script>

<svelte:head>
  <title>Login - RyderTech Courses</title>
  <meta name="description" content="Log in to access your RyderTech course videos." />
</svelte:head>

<div class="min-h-screen bg-background pt-32 pb-20 px-4">
  <div class="container mx-auto max-w-md">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold mb-2">Access Your Courses</h1>
      <p class="text-muted-foreground">Log in to watch purchased course videos.</p>
    </div>

    <div class="rounded-2xl border bg-card p-8 shadow-sm">
      <div class="flex gap-2 mb-6">
        <button
          class="flex-1 py-2 rounded-lg text-sm font-semibold {mode === 'magic' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}"
          onclick={() => (mode = 'magic')}
        >
          Email Link
        </button>
        <button
          class="flex-1 py-2 rounded-lg text-sm font-semibold {mode === 'password' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}"
          onclick={() => (mode = 'password')}
        >
          Password
        </button>
      </div>

      {#if mode === 'magic'}
        <form onsubmit={handleMagicLink} class="space-y-4">
          <div class="relative">
            <Mail class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input type="email" bind:value={email} placeholder="you@business.com" required disabled={loading} class="pl-9" />
          </div>
          <Button type="submit" class="w-full text-white" disabled={loading}>
            {#if loading}<Loader2 class="w-4 h-4 mr-2 animate-spin" />{:else}<ArrowRight class="w-4 h-4 mr-2" />{/if}
            Send Login Link
          </Button>
        </form>
      {:else}
        <form onsubmit={handlePassword} class="space-y-4">
          <div class="relative">
            <Mail class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input type="email" bind:value={email} placeholder="you@business.com" required disabled={loading} class="pl-9" />
          </div>
          <div class="relative">
            <Lock class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input type="password" bind:value={password} placeholder="Password" required disabled={loading} class="pl-9" />
          </div>
          <Button type="submit" class="w-full text-white" disabled={loading}>
            {#if loading}<Loader2 class="w-4 h-4 mr-2 animate-spin" />{:else}<ArrowRight class="w-4 h-4 mr-2" />{/if}
            Log In
          </Button>
        </form>
      {/if}

      {#if error}
        <p class="text-sm text-red-600 mt-4">{error}</p>
      {/if}
      {#if message}
        <p class="text-sm text-green-600 mt-4">{message}</p>
      {/if}
    </div>

    <p class="text-center text-sm text-muted-foreground mt-6">
      New here? <a href="/courses" class="text-primary font-medium">Browse courses →</a>
    </p>
  </div>
</div>
