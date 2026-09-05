<script lang="ts">
  import { env } from '$env/dynamic/public';
  import emailjs from '@emailjs/browser';
  import { Mic, MicOff, Send, Mail, Volume2, VolumeX, AlertCircle } from '@lucide/svelte';

  type Msg = { role: 'user' | 'assistant'; content: string };

  // --- Web Speech API types (not in TS DOM lib) ---
  interface SpeechRecognitionResult {
    transcript: string;
    confidence: number;
  }
  interface SpeechRecognitionEvent {
    results: { length: number; [i: number]: { 0: SpeechRecognitionResult; isFinal: boolean } };
  }
  interface SpeechRecognitionErrorEvent {
    error: string;
    message: string;
  }
  interface SpeechRecognitionLike {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    start: () => void;
    stop: () => void;
    onresult: ((e: SpeechRecognitionEvent) => void) | null;
    onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
  }

  let messages = $state<Msg[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm Ryder, RyderTech's AI assistant. Tap the mic and tell me what you're building — or type it. I'll help you find the right solution."
    }
  ]);
  let input = $state('');
  let sending = $state(false);
  let error = $state<string | null>(null);

  // Voice state
  let supported = $state(true);
  let listening = $state(false);
  let speaking = $state(false);
  let interim = $state('');
  let recognition = $state<SpeechRecognitionLike | null>(null);

  // Lead capture state
  let leadMode = $state(false);
  let leadCaptured = $state(false);
  let email = $state('');
  let submittingLead = $state(false);
  let leadError = $state<string | null>(null);

  // --- Init speech recognition (browser-native, free) ---
  $effect(() => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      supported = false;
      return;
    }
    const rec = new Ctor();
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (e: SpeechRecognitionEvent) => {
      let finalText = '';
      let interimText = '';
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i][0];
        if (e.results[i].isFinal) finalText += r.transcript;
        else interimText += r.transcript;
      }
      if (finalText) {
        input = finalText.trim();
        interim = '';
        // Auto-send once we have a final transcript
        send();
      } else {
        interim = interimText;
      }
    };
    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      error = `Mic error: ${e.error}. Try typing instead.`;
      listening = false;
    };
    rec.onend = () => {
      listening = false;
    };
    recognition = rec;
    return () => {
      try { rec.stop(); } catch { /* noop */ }
    };
  });

  function toggleMic() {
    if (!recognition) return;
    if (listening) {
      recognition.stop();
      listening = false;
    } else {
      error = null;
      interim = '';
      try {
        recognition.start();
        listening = true;
      } catch {
        error = 'Could not start mic. Check browser permissions.';
      }
    }
  }

  function speak(text: string) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.0;
      u.pitch = 1.0;
      u.onstart = () => (speaking = true);
      u.onend = () => (speaking = false);
      u.onerror = () => (speaking = false);
      window.speechSynthesis.speak(u);
    } catch {
      speaking = false;
    }
  }

  function stopSpeaking() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    speaking = false;
  }

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    error = null;
    messages = [...messages, { role: 'user', content: text }];
    input = '';
    interim = '';
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
        speak(data.reply);
        const userTurns = messages.filter((m) => m.role === 'user').length;
        if (userTurns >= 3 && !leadCaptured && !leadMode) {
          leadMode = true;
          const prompt =
            "Glad to help! Want a custom quote or a follow-up by email? Drop your email and RyderTech will reach out.";
          messages = [...messages, { role: 'assistant', content: prompt }];
          speak(prompt);
        }
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

  async function submitLead() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      leadError = 'Please enter a valid email.';
      return;
    }
    submittingLead = true;
    leadError = null;
    try {
      const serviceId = env.PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = env.PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = env.PUBLIC_EMAILJS_PUBLIC_KEY;
      if (serviceId && templateId && publicKey) {
        await emailjs.send(
          serviceId,
          templateId,
          {
            from_name: 'Voice Agent Lead',
            from_email: email,
            company: '',
            budget: '',
            timeline: '',
            message:
              'New lead captured from the on-site Voice Agent (Ryder). Visitor spoke with the AI assistant about RyderTech services.',
            lead_type: 'voice_agent'
          },
          { publicKey }
        );
      }
      leadCaptured = true;
      const thanks = "Thanks! RyderTech will follow up at " + email + ". You can also reach us anytime via 'Talk to a human'.";
      messages = [...messages, { role: 'assistant', content: thanks }];
      speak(thanks);
    } catch {
      leadError = 'Could not save your email. Please use "Talk to a human" instead.';
    } finally {
      submittingLead = false;
    }
  }

  // Scroll to bottom when messages change
  let listEl = $state<HTMLDivElement>();
  $effect(() => {
    messages.length;
    if (listEl) listEl.scrollTop = listEl.scrollHeight;
  });
</script>

<div class="flex h-[34rem] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
  <!-- Header -->
  <div class="flex items-center gap-2 bg-primary px-4 py-3 text-white">
    <Mic class="h-5 w-5" />
    <div class="flex-1">
      <p class="text-sm font-semibold">Ryder · Voice Agent</p>
      <p class="text-[11px] opacity-80">Tap the mic to speak · RyderTech</p>
    </div>
    {#if speaking}
      <button aria-label="Stop speaking" onclick={stopSpeaking} class="opacity-80 hover:opacity-100">
        <VolumeX class="h-4 w-4" />
      </button>
    {/if}
  </div>

  <!-- Messages -->
  <div bind:this={listEl} class="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-4 py-3">
    {#each messages as m}
      <div class="flex {m.role === 'user' ? 'justify-end' : 'justify-start'}">
        <div
          class="max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm {m.role === 'user'
            ? 'bg-primary text-white'
            : 'bg-white text-gray-800 border border-gray-200'}"
        >
          {m.content}
        </div>
      </div>
    {/each}

    {#if listening && interim}
      <div class="flex justify-end">
        <div class="max-w-[85%] rounded-2xl bg-primary/20 px-3 py-2 text-sm italic text-gray-600">
          {interim}…
        </div>
      </div>
    {/if}

    {#if sending}
      <div class="flex justify-start">
        <div class="rounded-2xl bg-white px-3 py-2 text-sm text-gray-500 border border-gray-200">
          <span class="inline-flex gap-1">
            <span class="animate-bounce">·</span><span class="animate-bounce [animation-delay:0.1s]">·</span><span class="animate-bounce [animation-delay:0.2s]">·</span>
          </span>
        </div>
      </div>
    {/if}

    {#if error}
      <div class="flex justify-center">
        <div class="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-600">
          <AlertCircle class="h-3 w-3" />
          {error}
        </div>
      </div>
    {/if}
  </div>

  <!-- Lead capture -->
  {#if leadMode && !leadCaptured}
    <div class="border-t border-amber-200 bg-amber-50 px-4 py-3">
      <div class="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-amber-800">
        <Mail class="h-3.5 w-3.5" />
        Get a follow-up from RyderTech
      </div>
      <div class="flex gap-2">
        <input
          type="email"
          placeholder="you@company.com"
          bind:value={email}
          onkeydown={(e) => e.key === 'Enter' && submitLead()}
          class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <button
          onclick={submitLead}
          disabled={submittingLead}
          class="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {#if submittingLead}…{:else}Send{/if}
        </button>
      </div>
      {#if leadError}
        <p class="mt-1 text-xs text-red-600">{leadError}</p>
      {/if}
    </div>
  {/if}

  <!-- Input row -->
  <div class="border-t border-gray-200 bg-white px-3 py-3">
    {#if !supported}
      <p class="mb-2 flex items-center gap-1 text-xs text-amber-600">
        <AlertCircle class="h-3 w-3" />
        Voice not supported in this browser — type your message below.
      </p>
    {/if}
    <div class="flex items-center gap-2">
      {#if supported}
        <button
          aria-label={listening ? 'Stop listening' : 'Start listening'}
          onclick={toggleMic}
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full {listening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-primary text-white hover:bg-primary/90'}"
        >
          {#if listening}
            <MicOff class="h-5 w-5" />
          {:else}
            <Mic class="h-5 w-5" />
          {/if}
        </button>
      {/if}
      <input
        type="text"
        placeholder={listening ? 'Listening…' : 'Type or speak your message'}
        bind:value={input}
        onkeydown={onKey}
        disabled={listening}
        class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:bg-gray-100"
      />
      <button
        onclick={send}
        disabled={sending || !input.trim()}
        aria-label="Send message"
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
      >
        <Send class="h-4 w-4" />
      </button>
    </div>
    {#if listening}
      <p class="mt-1.5 text-center text-xs text-red-500">● Listening — tap the mic to stop</p>
    {:else if speaking}
      <p class="mt-1.5 text-center text-xs text-primary">
        <Volume2 class="inline h-3 w-3" /> Speaking — tap the header to stop
      </p>
    {/if}
  </div>
</div>
