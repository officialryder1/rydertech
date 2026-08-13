/**
 * Lead nurture state + templates — RyderTech.
 *
 * Source of truth for inbound leads = our own Gmail inbox (EmailJS notifies
 * rydertech.ng@gmail.com with the lead's email in the body). The nurture cron
 * searches Gmail, extracts lead emails, then uses THIS script to track state
 * and pick the right template. Gmail send itself is done by the cron via the
 * Gmail MCP tool (Node can't send mail here).
 *
 * Sequence (relative to capture date):
 *   Touch 1 — capture day: instant value + shareable report link
 *   Touch 2 — +2 days:    educational insight / social proof
 *   Touch 3 — +5 days:    soft booking ask
 *
 * CLI:
 *   node scripts/leads/nurture.mjs --add <email> <tool>
 *   node scripts/leads/nurture.mjs --due          # prints next-due actions as JSON lines
 *   node scripts/leads/nurture.mjs --touch <email> <n>
 *   node scripts/leads/nurture.mjs --list
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_FILE = join(__dirname, '.nurture-state.json');

const TOUCH_OFFSET_DAYS = { 1: 0, 2: 2, 3: 5 };

function load() {
  if (!existsSync(STATE_FILE)) return { leads: [] };
  try {
    return JSON.parse(readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return { leads: [] };
  }
}
function save(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}
const todayKey = () => new Date().toISOString().slice(0, 10);
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

// ---- Templates (tool + touch) ----
const TEMPLATES = {
  ops_drain: {
    1: {
      subject: 'Your Ops Drain audit — the 1-line version',
      body: (name) =>
        `Hi ${name},\n\nThanks for running the Ops Drain Calculator. The headline: the manual work you logged is costing real money every single month — and most of it is recoverable.\n\nHere's your branded audit you can keep/share: https://rydertech.ng/labs/ops-drain\n\nTomorrow I'll send the 3 fastest ways teams like yours claw that time back.\n\n— Victor, RyderTech`
    },
    2: {
      subject: '3 ways teams like yours kill manual drain',
      body: (name) =>
        `Hi ${name},\n\nQuick, no-fluff. The three automations that recover the most staff time for firms your size:\n\n1. Invoicing & billing — webhook → PDF → auto-send. Kills the monthly reconciliation block.\n2. Client onboarding — self-serve forms → database → welcome sequence. No more copy-paste.\n3. Reporting — a scheduled job that aggregates your data and emails a digest. Zero manual pulls.\n\nIf any of those are still human-powered in your shop, that's exactly what we'd automate first.\n\n— Victor, RyderTech`
    },
    3: {
      subject: 'Worth a 15-minute scoping call?',
      body: (name) =>
        `Hi ${name},\n\nI'll stop here so I'm not cluttering your inbox. If the numbers from the calculator made you wince, the next step is a 15-minute scoping call — I'll show you what automating your top task actually looks like and what it costs.\n\nGrab a slot: https://rydertech.ng/contact\n\nIf the timing's off, just reply "later" and I'll check back next quarter.\n\n— Victor, RyderTech`
    }
  },
  revleak: {
    1: {
      subject: 'Your RevLeak audit — the 1-line version',
      body: (name) =>
        `Hi ${name},\n\nThanks for running the RevLeak Auditor. The headline: a slow site is quietly costing you orders every single month, and the leak is recoverable.\n\nHere's your branded audit you can keep/share: https://rydertech.ng/labs/revleak\n\nIn two days I'll send what actually fixes it (beyond "make it faster").\n\n— Victor, RyderTech`
    },
    2: {
      subject: 'What actually fixes a slow site (beyond "optimize")',
      body: (name) =>
        `Hi ${name},\n\nThe real speed killers for most Nigerian sites:\n\n1. Uncompressed images + no modern formats (WebP/AVIF) — often 60%+ of page weight.\n2. Render-blocking JS/CSS and third-party scripts dragging first paint.\n3. No edge/CDN delivery — visitors far from your server wait.\n\nFix those three and load time usually drops under 2s. That's where the leaked revenue comes back.\n\n— Victor, RyderTech`
    },
    3: {
      subject: 'Worth a 15-minute performance audit?',
      body: (name) =>
        `Hi ${name},\n\nI'll stop here. If the leak number surprised you, the next step is a 15-minute performance audit — I'll measure your real Core Web Vitals on actual devices and quote the fix.\n\nBook it: https://rydertech.ng/contact\n\nIf now's not the time, reply "later" and I'll circle back.\n\n— Victor, RyderTech`
    }
  },
  event_risk: {
    1: {
      subject: 'Your Event Access Risk audit — the 1-line version',
      body: (name) =>
        `Hi ${name},\n\nThanks for running the Event Access Risk Scanner. The headline: your gate has a measurable bottleneck and a real revenue-exposure gap right now.\n\nHere's your branded audit you can keep/share: https://rydertech.ng/labs/event-access-risk\n\nIn two days I'll show what a QR-verified gate looks like for an event your size.\n\n— Victor, RyderTech`
    },
    2: {
      subject: 'What a QR-verified gate looks like',
      body: (name) =>
        `Hi ${name},\n\nA QR-verified gate (vs manual lists):\n\n1. Guests scan a signed, single-use invite — in under 1 second, no name lookups.\n2. Live headcount + gate-speed dashboard, so you see a backup before it happens.\n3. Offline-capable scanners — gates keep working if the venue wifi drops.\n\nResult: queues shrink, gatecrash exposure drops, and you get a real headcount at the end.\n\n— Victor, RyderTech`
    },
    3: {
      subject: 'Worth a 15-minute scoping call?',
      body: (name) =>
        `Hi ${name},\n\nI'll stop here. If your next event needs a gate that doesn't fail in public, the next step is a 15-minute scoping call — I'll map what Veripasshub would look like for your venue.\n\nBook it: https://rydertech.ng/contact\n\nIf the season's not right, reply "later" and I'll check back.\n\n— Victor, RyderTech`
    }
  }
};

const FALLBACK = {
  1: { subject: 'Your RyderTech audit', body: (n) => `Hi ${n},\n\nThanks for trying our tool. Here's your audit you can keep/share: https://rydertech.ng/labs\n\n— Victor, RyderTech` },
  2: { subject: 'A quick tip from RyderTech', body: (n) => `Hi ${n},\n\nSmall thing: most business process drag is recoverable with a focused automation. Happy to show you what yours looks like.\n\n— Victor, RyderTech` },
  3: { subject: 'Worth a quick call?', body: (n) => `Hi ${n},\n\nIf any of this is on your radar, grab a 15-min scoping call: https://rydertech.ng/contact\n\n— Victor, RyderTech` }
};

const TOOL_KEY = { ops_drain: 'ops_drain', ops: 'ops_drain', revleak: 'revleak', rev: 'revleak', event_risk: 'event_risk', event: 'event_risk' };

export function renderTouch(tool, touch, name) {
  const t = (TEMPLATES[TOOL_KEY[tool] || ''] || {})[touch] || FALLBACK[touch];
  return { subject: t.subject, body: t.body(name || 'there') };
}

// ---- CLI ----
function main() {
  const args = process.argv.slice(2);
  const state = load();

  if (args[0] === '--add') {
    const email = args[1];
    const tool = args[2] || 'general';
    const extra = args[3] ? JSON.parse(args[3]) : {}; // { lead_score, lead_tier }
    let lead = state.leads.find((l) => l.email === email);
    if (!lead) {
      lead = { email, tool, capturedAt: todayKey(), touches: [], lead_score: extra.lead_score ?? null, lead_tier: extra.lead_tier ?? null };
      state.leads.push(lead);
      save(state);
      console.log(`ADDED ${email} (${tool}) score=${lead.lead_score ?? 'n/a'} tier=${lead.lead_tier ?? 'n/a'}`);
    } else {
      // Merge score if incoming and previously missing
      if (lead.lead_score == null && extra.lead_score != null) {
        lead.lead_score = extra.lead_score;
        lead.lead_tier = extra.lead_tier;
        save(state);
      }
      console.log(`EXISTS ${email}`);
    }
    return;
  }

  if (args[0] === '--touch') {
    const email = args[1];
    const n = parseInt(args[2], 10);
    const lead = state.leads.find((l) => l.email === email);
    if (lead && !lead.touches.includes(n)) {
      lead.touches.push(n);
      save(state);
      console.log(`MARKED touch ${n} for ${email}`);
    } else {
      console.log(`NO-OP touch ${n} for ${email}`);
    }
    return;
  }

  if (args[0] === '--list') {
    for (const l of state.leads) console.log(`${l.email}\t${l.tool}\tcaptured ${l.capturedAt}\ttouches [${l.touches.join(',')}]`);
    return;
  }

  if (args[0] === '--due') {
    const today = todayKey();
    for (const l of state.leads) {
      for (const touch of [1, 2, 3]) {
        if (l.touches.includes(touch)) continue;
        const due = daysBetween(l.capturedAt, today) >= (TOUCH_OFFSET_DAYS[touch] ?? 99);
        if (due) {
          console.log(JSON.stringify({ email: l.email, tool: l.tool, touch }));
          break; // one action per lead per run
        }
      }
    }
    return;
  }

  console.log('Usage: --add <email> <tool> | --due | --touch <email> <n> | --list');
}

main();
