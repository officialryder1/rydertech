<script lang="ts">
  import BrandedReport from '$lib/components/BrandedReport.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<svelte:head>
  <title>Audit Report · RyderTech</title>
  <meta name="robots" content="noindex" />
</svelte:head>

{#if data.report}
  <div class="wrap">
    <BrandedReport report={data.report} />
  </div>
{:else}
  <div class="wrap error">
    <h1>Report not found</h1>
    <p>This audit link is invalid or expired.</p>
    <a class="home" href="/labs">Back to RyderTech Labs →</a>
  </div>
{/if}

<style>
  .wrap {
    max-width: 820px;
    margin: 40px auto;
    padding: 0 16px;
  }
  .error {
    text-align: center;
    font-family: 'Inter', system-ui, sans-serif;
    color: #0f172a;
  }
  .error h1 { font-family: 'Playfair Display', Georgia, serif; }
  .home {
    display: inline-block;
    margin-top: 16px;
    color: #1e40af;
    font-weight: 600;
    text-decoration: none;
  }
</style>
