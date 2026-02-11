<script>
    import '../../app.css';
    let { children } = $props()

</script>

<svelte:head>
  <title>Blog - RyderTech | Insights & Technology Articles</title>
  <meta name="description" content="Read the latest insights on web development, cloud computing, AI, and software architecture from the RyderTech team." />
  <meta name="viewport" content="width=device-width, initial-scale=1">
</svelte:head>

<main>
{@render children()}
</main>