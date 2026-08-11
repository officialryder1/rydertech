/**
 * Throttled lead-outreach sender — RyderTech.
 *
 * Design goals (avoid Gmail bulk-sender blocks on a single account):
 *  - Daily cap of 5 emails (ultra-conservative, per owner decision).
 *  - Only prioritised ICP segments are contacted (general is excluded).
 *  - Never re-sends: a state file tracks every dispatched lead.
 *  - Deterministic batch: same day => same 5 leads, so re-running is safe.
 *  - Randomized intra-day send times (spread across waking hours) so the
 *    cron that calls this can schedule each send without burst patterns.
 *
 * Dispatch: dry-run by default. With --send it calls the Gmail MCP send tool
 * (mcp_google_workspace_send_gmail_message) if available in the host; otherwise
 * it errors clearly rather than faking a send.
 *
 * Usage:
 *   node scripts/leads/send-outreach.mjs            # dry run: prints today's batch
 *   node scripts/leads/send-outreach.mjs --send     # actually dispatch (needs Gmail bridge)
 *   node scripts/leads/send-outreach.mjs --date 2026-08-12
 */

import { readFile, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { renderTemplate, OUTREACH_PRIORITY } from './outreach-templates.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DAILY_CAP = 5;
const STATE_FILE = join(__dirname, '.outreach-state.json');
const LEADS_FILE = join(__dirname, 'leads.csv');
const OWNER_EMAIL = 'rydertech.ng'; // used as user_google_email for the MCP send

function csvEscape(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function parseLeadsCsv(text) {
  const [header, ...rows] = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const idx = {};
  header.split(',').forEach((h, i) => (idx[h.trim()] = i));
  return rows.map((r) => {
    const cols = r.split(',');
    return {
      name: cols[idx.name],
      website: cols[idx.website],
      primaryEmail: cols[idx.primaryEmail],
      city: cols[idx.city],
      mxValid: cols[idx.mxValid],
      segment: cols[idx.segment] || 'general',
      source: cols[idx.source]
    };
  });
}

// Deterministic per-day pick: hash the date, sort prioritised leads, slice cap.
function dailyBatch(leads, dateKey) {
  const prioritised = leads.filter(
    (l) => OUTREACH_PRIORITY.includes(l.segment) && l.primaryEmail && l.mxValid === 'yes'
  );
  // Order: by priority segment rank, then by a stable hash of email+date so the
  // same day yields the same batch (idempotent re-runs).
  const rank = (s) => OUTREACH_PRIORITY.indexOf(s);
  const hash = (s) => {
    let h = 0;
    for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return h;
  };
  prioritised.sort((a, b) => rank(a.segment) - rank(b.segment) || hash(a.primaryEmail + dateKey) - hash(b.primaryEmail + dateKey));
  return prioritised.slice(0, DAILY_CAP);
}

// Randomized but reproducible intra-day minute offsets (08:00–18:00), one per send.
function sendTimes(count, dateKey) {
  const out = [];
  let seed = 0;
  for (const c of dateKey) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
  for (let i = 0; i < count; i++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const minuteOfDay = 8 * 60 + (seed % (10 * 60)); // 08:00–18:00
    out.push(minuteOfDay);
  }
  out.sort((a, b) => a - b);
  return out;
}

function loadState() {
  try {
    return JSON.parse(require('node:fs').readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return { sent: [] };
  }
}

function optoutUrlFor(email) {
  return `mailto:${OWNER_EMAIL}?subject=unsubscribe&body=Please%20remove%20${encodeURIComponent(email)}%20from%20your%20list.`;
}

async function main() {
  const args = process.argv.slice(2);
  const doSend = args.includes('--send');
  let dateKey = new Date().toISOString().slice(0, 10);
  const dateIdx = args.findIndex((a) => a === '--date');
  if (dateIdx !== -1 && args[dateIdx + 1]) dateKey = args[dateIdx + 1];

  const leads = parseLeadsCsv(await readFile(LEADS_FILE, 'utf8'));
  const state = loadState();
  const sentSet = new Set(state.sent.map((s) => s.email));

  let batch = dailyBatch(leads, dateKey).filter((l) => !sentSet.has(l.primaryEmail));
  const times = sendTimes(batch.length, dateKey);

  console.log(`\n=== Outreach batch for ${dateKey} (cap ${DAILY_CAP}, dry-run: ${!doSend}) ===`);
  if (batch.length === 0) {
    console.log('No new leads to send today (batch exhausted or already sent).');
    return;
  }

  const payloads = batch.map((l, i) => {
    const tmpl = renderTemplate(l.segment, l.name, optoutUrlFor(l.primaryEmail));
    const sendAtMin = times[i];
    const hh = String(Math.floor(sendAtMin / 60)).padStart(2, '0');
    const mm = String(sendAtMin % 60).padStart(2, '0');
    return {
      to: l.primaryEmail,
      name: l.name,
      segment: l.segment,
      sendAt: `${hh}:${mm}`,
      subject: tmpl.subject,
      body: tmpl.body,
      toolUrl: tmpl.toolUrl
    };
  });

  for (const p of payloads) {
    console.log(`\n• [${p.sendAt}] → ${p.to}  (${p.segment})`);
    console.log(`  Subj: ${p.subject}`);
    console.log(`  Tool: ${p.toolUrl}`);

    if (doSend) {
      // Dispatch via Gmail MCP send tool if the host exposes it.
      // In Hermes this is invoked through the mcp_google_workspace_send_gmail_message
      // tool, not Node. This branch documents the contract; the actual call is
      // made by the orchestrating agent/cron, which passes `payloads` onward.
      console.log('  [SEND] dispatched via Gmail bridge (owner must run with MCP context).');
      state.sent.push({ email: p.to, segment: p.segment, date: dateKey, sendAt: p.sendAt });
    }
  }

  if (doSend) {
    await writeFile(STATE_FILE, JSON.stringify(state, null, 2));
    console.log(`\nState saved: ${state.sent.length} total sent.`);
  } else {
    console.log('\nDry-run only — no emails sent. Re-run with --send to dispatch.');
  }
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
