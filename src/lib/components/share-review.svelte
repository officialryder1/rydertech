<script lang="ts">
  import { Twitter, Linkedin, Link, Mail, Facebook } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import { toast } from 'svelte-sonner';

  export let url: string;
  export let text = "Check out this amazing project we just completed!";
  export let hashtags = "webdevelopment, design, agency";

  function shareOnTwitter() {
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}&hashtags=${hashtags}`;
    window.open(shareUrl, '_blank', 'width=550,height=420');
  }

  function shareOnLinkedIn() {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank');
  }

  function shareOnFacebook() {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=550,height=420');
  }

  function shareViaEmail() {
    const subject = "Check out this project";
    const body = `${text}\n\n${url}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  }
</script>

<div class="flex flex-wrap gap-2">
  <Button variant="outline" size="sm" on:click={shareOnTwitter}>
    <Twitter class="h-4 w-4 mr-2" />
    Twitter
  </Button>
  <Button variant="outline" size="sm" on:click={shareOnLinkedIn}>
    <Linkedin class="h-4 w-4 mr-2" />
    LinkedIn
  </Button>
  <Button variant="outline" size="sm" on:click={shareOnFacebook}>
    <Facebook class="h-4 w-4 mr-2" />
    Facebook
  </Button>
  <Button variant="outline" size="sm" on:click={shareViaEmail}>
    <Mail class="h-4 w-4 mr-2" />
    Email
  </Button>
  <Button variant="outline" size="sm" on:click={copyLink}>
    <Link class="h-4 w-4 mr-2" />
    Copy Link
  </Button>
</div>