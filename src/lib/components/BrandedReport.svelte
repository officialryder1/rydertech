<script lang="ts">
  import type { ReportPayload } from '$lib/shareReport';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  export let report: ReportPayload;

  let shareUrl = '';
  let copied = false;

  // Resolve full share URL (works in browser; SSR falls back to relative).
  onMount(() => {
    shareUrl = `${location.origin}/labs/share?d=${$page.url.searchParams.get('d') ?? ''}`;
  });

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      copied = true;
      setTimeout(() => (copied = false), 1800);
    } catch {
      copied = false;
    }
  }

  const toneColor: Record<string, string> = {
    good: '#15803d',
    bad: '#b91c1c',
    neutral: '#0f172a'
  };

  const toolLabel: Record<string, string> = {
    revleak: 'Revenue Leak Auditor',
    'event-risk': 'Event Access Risk Scanner',
    'ops-drain': 'Ops Drain Calculator',
    visibility: 'Local Visibility Audit'
  };
</script>

<article class="report" style="--brand:#1E40AF;--brand-dark:#1E3A8A;--gold:#D4AF37;--gold-dark:#B8860B;">
  <header class="report-head">
    <div class="brand">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <rect x="2" y="2" width="28" height="28" rx="7" fill="#1E40AF"/>
        <path d="M9 21l4-8 4 5 3-6 3 9" fill="none" stroke="#D4AF37" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <div class="brand-text">
        <span class="brand-name">RYDERTECH</span>
        <span class="brand-sub">{toolLabel[report.tool] ?? 'Audit'}</span>
      </div>
    </div>
    <div class="report-meta">Free audit · {report.generatedAt}</div>
  </header>

  <h1 class="report-title">{report.title}</h1>

  <section class="hero" class:bad={report.heroTone === 'bad'}>
    <div class="hero-label">{report.heroLabel}</div>
    <div class="hero-value">{report.heroValue}</div>
  </section>

  <p class="verdict">{report.verdict}</p>

  <table class="rows">
    <tbody>
      {#each report.rows as row}
        <tr>
          <td class="row-label">{row.label}</td>
          <td class="row-value" style="color:{toneColor[row.tone ?? 'neutral']}">{row.value}</td>
        </tr>
      {/each}
    </tbody>
  </table>

  <section class="recs">
    <h2>What RyderTech would do</h2>
    <ul>
      {#each report.recommendations as rec}
        <li>{rec}</li>
      {/each}
    </ul>
  </section>

  <footer class="cta">
    <div class="cta-text">
      <strong>Get this fixed by RyderTech.</strong>
      <span>Custom build · measured against this baseline · Nigerian & African teams.</span>
    </div>
    <a class="cta-btn" href="/contact">Book a scoping call →</a>
    <div class="cta-foot">
      rydertech.ng · {report.sourceUrl.replace('https://', '')}
    </div>
  </footer>

  <div class="share-bar no-print">
    <button class="share-btn" on:click={copyLink}>{copied ? 'Link copied ✓' : 'Copy share link'}</button>
    <a class="share-btn ghost" href={report.sourceUrl} target="_blank" rel="noopener">Run your own →</a>
    <button class="share-btn ghost" on:click={() => window.print()}>Print / PDF</button>
  </div>
</article>

<style>
  .report {
    max-width: 760px;
    margin: 0 auto;
    background: #ffffff;
    color: #0f172a;
    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
    padding: 40px 44px 32px;
    box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
    border-top: 6px solid var(--gold);
    border-radius: 4px;
  }
  .report-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 18px;
    border-bottom: 1px solid #e2e8f0;
  }
  .brand { display: flex; align-items: center; gap: 12px; }
  .brand-text { display: flex; flex-direction: column; line-height: 1.1; }
  .brand-name { font-weight: 800; letter-spacing: 0.14em; font-size: 18px; color: var(--brand); }
  .brand-sub { font-size: 12px; color: #64748b; letter-spacing: 0.02em; }
  .report-meta { font-size: 12px; color: #94a3b8; }
  .report-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 30px;
    margin: 26px 0 18px;
    color: #0f172a;
    font-weight: 700;
  }
  .hero {
    background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);
    border-left: 5px solid var(--brand);
    border-radius: 10px;
    padding: 22px 26px;
    margin-bottom: 18px;
  }
  .hero.bad { background: linear-gradient(135deg, #fef2f2 0%, #f8fafc 100%); border-left-color: #b91c1c; }
  .hero-label { font-size: 14px; color: #475569; text-transform: uppercase; letter-spacing: 0.06em; }
  .hero-value { font-size: 40px; font-weight: 800; color: var(--brand); margin-top: 6px; }
  .hero.bad .hero-value { color: #b91c1c; }
  .verdict { font-size: 16px; line-height: 1.55; color: #334155; margin: 0 0 22px; font-style: italic; }
  .rows { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  .rows td { padding: 12px 4px; border-bottom: 1px solid #eef2f7; font-size: 15px; }
  .row-label { color: #475569; }
  .row-value { text-align: right; font-weight: 700; }
  .recs h2 {
    font-size: 14px; text-transform: uppercase; letter-spacing: 0.06em;
    color: var(--brand); margin: 0 0 12px;
  }
  .recs ul { margin: 0; padding-left: 18px; }
  .recs li { font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 6px; }
  .cta {
    margin-top: 28px; background: var(--brand); color: #fff;
    border-radius: 12px; padding: 22px 26px;
    display: flex; flex-direction: column; gap: 10px;
  }
  .cta-text { display: flex; flex-direction: column; gap: 2px; }
  .cta-text strong { font-size: 17px; }
  .cta-text span { font-size: 13px; color: #dbeafe; }
  .cta-btn {
    align-self: flex-start; background: var(--gold); color: #1a1205;
    font-weight: 700; padding: 10px 18px; border-radius: 8px;
    text-decoration: none; font-size: 14px;
  }
  .cta-foot { font-size: 11px; color: #bfdbfe; letter-spacing: 0.02em; }
  .share-bar { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
  .share-btn {
    background: var(--brand); color: #fff; border: none; cursor: pointer;
    padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
    text-decoration: none;
  }
  .share-btn.ghost { background: #fff; color: var(--brand); border: 1px solid var(--brand); }
  @media print {
    .report { box-shadow: none; max-width: 100%; }
    .no-print { display: none !important; }
  }
</style>
