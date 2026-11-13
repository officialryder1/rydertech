/**
 * Gmail nurture template — FindingsNg / 90-Day Automation Audit.
 *
 * Source of truth for the Gmail send path. Node can't send mail here, so the
 * cron renders these templates and dispatches them through the Gmail MCP tool.
 *
 * Sequence per tool:
 *   Touch 1 — capture day: instant value + shareable report link
 *   Touch 2 — +2 days:    educational insight / social proof
 *   Touch 3 — +5 days:    soft booking ask
 *
 * Template map: { tool: { touch: { subject, body } } }
 * Rendered params: {{name}}  (or "there")
 */

export const GMAIL_TEMPLATES = {
  ops_drain: {
    1: {
      subject: "Your Ops Drain audit — the 1-line version",
      body: (name) =>
        `Hi ${name},

Thanks for running the Ops Drain Calculator. The headline: the manual work you logged is costing real money every single month — and most of it is recoverable.

Here's your branded audit you can keep/share: https://rydertech.ng/labs/ops-drain

Tomorrow I'll send the 3 fastest ways teams like yours claw that time back.

— Victor, RyderTech`,
    },
    2: {
      subject: "3 ways teams like yours kill manual drain",
      body: (name) =>
        `Hi ${name},

Quick, no-fluff. The three automations that recover the most staff time for firms your size:

1. Invoicing & billing — webhook → PDF → auto-send. Kills the monthly reconciliation block.
2. Client onboarding — self-serve forms → database → welcome sequence. No more copy-paste.
3. Reporting — a scheduled job that aggregates your data and emails a digest. Zero manual pulls.

If any of those are still human-powered in your shop, that's exactly what we'd automate first.

— Victor, RyderTech`,
    },
    3: {
      subject: "Worth a 15-minute scoping call?",
      body: (name) =>
        `Hi ${name},

I'll stop here so I'm not cluttering your inbox. If the numbers from the calculator made you wince, the next step is a 15-minute scoping call — I'll show you what automating your top task actually looks like and what it costs.

Grab a slot: https://rydertech.ng/contact

If the timing's off, just reply "later" and I'll check back next quarter.

— Victor, RyderTech`,
    },
  },
  revleak: {
    1: {
      subject: "Your RevLeak audit — the 1-line version",
      body: (name) =>
        `Hi ${name},

Thanks for running the RevLeak Auditor. The headline: a slow site is quietly costing you orders every single month, and the leak is recoverable.

Here's your branded audit you can keep/share: https://rydertech.ng/labs/revleak

In two days I'll send what actually fixes it (beyond "make it faster").

— Victor, RyderTech`,
    },
    2: {
      subject: "What actually fixes a slow site (beyond \"optimize\")",
      body: (name) =>
        `Hi ${name},

The real speed killers for most Nigerian sites:

1. Uncompressed images + no modern formats (WebP/AVIF) — often 60%+ of page weight.
2. Render-blocking JS/CSS and third-party scripts dragging first paint.
3. No edge/CDN delivery — visitors far from your server wait.

Fix those three and load time usually drops under 2s. That's where the leaked revenue comes back.

— Victor, RyderTech`,
    },
    3: {
      subject: "Worth a 15-minute performance audit?",
      body: (name) =>
        `Hi ${name},

I'll stop here. If the leak number surprised you, the next step is a 15-minute performance audit — I'll measure your real Core Web Vitals on actual devices and quote the fix.

Book it: https://rydertech.ng/contact

If now's not the time, reply "later" and I'll circle back.

— Victor, RyderTech`,
    },
  },
  event_risk: {
    1: {
      subject: "Your Event Access Risk audit — the 1-line version",
      body: (name) =>
        `Hi ${name},

Thanks for running the Event Access Risk Scanner. The headline: your gate has a measurable bottleneck and a real revenue-exposure gap right now.

Here's your branded audit you can keep/share: https://rydertech.ng/labs/event-access-risk

In two days I'll show what a QR-verified gate looks like for an event your size.

— Victor, RyderTech`,
    },
    2: {
      subject: "What a QR-verified gate looks like",
      body: (name) =>
        `Hi ${name},

A QR-verified gate (vs manual lists):

1. Guests scan a signed, single-use invite — in under 1 second, no name lookups.
2. Live headcount + gate-speed dashboard, so you see a backup before it happens.
3. Offline-capable scanners — gates keep working if the venue wifi drops.

Result: queues shrink, gatecrash exposure drops, and you get a real headcount at the end.

— Victor, RyderTech`,
    },
    3: {
      subject: "Worth a 15-minute scoping call?",
      body: (name) =>
        `Hi ${name},

I'll stop here. If your next event needs a gate that doesn't fail in public, the next step is a 15-minute scoping call — I'll map what Veripasshub would look like for your venue.

Book it: https://rydertech.ng/contact

If the season's not right, reply "later" and I'll check back.

— Victor, RyderTech`,
    },
  },
};

// Fallback for any tool not in the map (deferred / general leads).
export const GMAIL_FALLBACK = {
  1: {
    subject: "Your RyderTech audit",
    body: (n) =>
      `Hi ${n},

Thanks for trying our tool. Here's your audit you can keep/share: https://rydertech.ng/labs

— Victor, RyderTech`,
  },
  2: {
    subject: "A quick tip from RyderTech",
    body: (n) =>
      `Hi ${n},

Small thing: most business process drag is recoverable with a focused automation. Happy to show you what yours looks like.

— Victor, RyderTech`,
  },
  3: {
    subject: "Worth a quick call?",
    body: (n) =>
      `Hi ${n},

If any of this is on your radar, grab a 15-min scoping call: https://rydertech.ng/contact

— Victor, RyderTech`,
  },
};
