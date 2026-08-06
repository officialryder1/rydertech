<script lang="ts">
  import { onMount } from 'svelte';
  import { Brain, Send, X, MessageCircle, ArrowUpRight } from '@lucide/svelte';

  type Msg = { role: 'user' | 'assistant'; content: string };

  let open = $state(false);
  let messages = $state<Msg[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm Ryder, RyderTech's AI assistant. Ask me about our web, mobile, or AI services — or tell me what you're building and I'll point you the right way."
    }
  ]);
  let input = $state('');
  let sending = $state(false);
  let error = $state<string | null>(null);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    error = null;
    messages = [...messages, { role: 'user', content: text }];
    input = '';
    sending = true;
    try {
      const res = await fetch('/api/ai-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      });
      const data = await res.json();
      if (!res.ok) {
        error = data.error || 'Something went wrong.';
      } else {
        messages = [...messages, { role: 'assistant', content: data.reply }];
      }
    } catch {
      error = 'Network error. Please try again or contact us.';
    } finally {
      sending = false;
    }
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  // Scroll to bottom when messages change
  let listEl = $state<HTMLDivElement>();
  $effect(() => {
    messages.length;
    if (listEl) listEl.scrollTop = listEl.scrollHeight;
  });
</script>

<!-- Floating bubble -->
<button
  aria-label="Open AI assistant"
  onclick={() => (open = !open)}
  class="fixed bottom-24 right-5 z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition hover:scale-105"
>
  {#if open}
    <X class="h-6 w-6" />
  {:else}
    <Brain class="h-6 w-6" />
  {/if}
</button>

<!-- Chat panel -->
{#if open}
  <div
    class="fixed bottom-[22rem] right-5 z-50 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
  >
    <!-- Header -->
    <div class="flex items-center gap-2 bg-primary px-4 py-3 text-white">
      <Brain class="h-5 w-5" />
      <div class="flex-1">
        <p class="text-sm font-semibold">Ryder · AI Assistant</p>
        <p class="text-[11px] opacity-80">RyderTech — Web, Mobile & AI Studio</p>
      </div>
      <button aria-label="Close" onclick={() => (open = false)} class="opacity-80 hover:opacity-100">
        <X class="h-4 w-4" />
      </button>
    </div>

    <!-- Messages -->
    <div bind:this={listEl} class="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-4 py-3">
      {#each messages as m}
        <div class="flex {m.role === 'user' ? 'justify-end' : 'justify-start'}">
          <div
            class="max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm {m.role ===
            'user'
              ? 'bg-primary text-white'
              : 'bg-white text-gray-800 border border-gray-200'}"
          >
            {m.content}
          </div>
        </div>
      {/each}
      {#if sending}
        <div class="flex justify-start">
          <div class="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-400">
            Ryder is typing…
          </div>
        </div>
      {/if}
      {#if error}
        <div class="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>
      {/if}
    </div>

    <!-- Input -->
    <div class="border-t border-gray-200 bg-white p-3">
      <div class="flex items-end gap-2">
        <textarea
          bind:value={input}
          onkeydown={onKey}
          rows="1"
          placeholder="Ask about our AI services…"
          class="max-h-24 flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        ></textarea>
        <button
          onclick={send}
          disabled={sending || !input.trim()}
          aria-label="Send"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition hover:opacity-95 disabled:opacity-40"
        >
          <Send class="h-4 w-4" />
        </button>
      </div>
      <a
        href="/contact"
        class="mt-2 flex items-center justify-center gap-1 rounded-xl border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
      >
        Talk to a human <ArrowUpRight class="h-3 w-3" />
      </a>
    </div>
  </div>
{/if}
