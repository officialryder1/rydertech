/**
 * Lead outreach email templates — RyderTech.
 *
 * One template per ICP segment. Each is single-touch, identifies the sender,
 * states a concrete value, links the relevant lead magnet, and includes an
 * explicit opt-out (Nigeria NDPR / CAN-SPAM compliant). No aggressive sales
 * language, no tracking-pixel spam signals.
 *
 * Personalization tokens: {{name}} {{tool_url}} {{tool_name}} {{optout_url}}
 */

export const SEGMENT_TEMPLATES = {
  event_organizers: {
    subject: 'Your event gate: how long will guests actually wait?',
    toolUrl: 'https://rydertech.ng/labs/event-access-risk',
    toolName: 'Event Access Risk Scanner',
    body: (name) => `Hi ${name},\n
RyderTech here. We build access-control and guest-check-in systems (Veripasshub), and the one thing that quietly ruins an event is the gate — long queues, guests slipping in on shared invites, and no real headcount until it's over.\n
We made a free 30-second tool that shows you exactly where your gate breaks: how long it backs up, how many guests slip in free, and what it costs. It even generates a live scannable invite QR so you can see the fix work.\n
→ ${'{{tool_url}}'}\n
If venue/access control is on your radar this season, I'm happy to walk you through it. If this isn't relevant, just reply "no" and I won't follow up.\n
— Victor, RyderTech`
  },

  smes: {
    subject: 'Is your website quietly losing you sales?',
    toolUrl: 'https://rydertech.ng/labs/revleak',
    toolName: 'RevLeak Auditor',
    body: (name) => `Hi ${name},\n
RyderTech here. Every second past ~2s of load time, a slice of your visitors leave before they ever convert — and that revenue shows up nowhere on your P&L.\n
We built a free calculator that puts a number on it: plug in your traffic, conversion rate, and load time, and it shows your monthly/annual revenue leak. No signup, takes 20 seconds.\n
→ ${'{{tool_url}}'}\n
If the number surprises you, we do the speed fix too. If this isn't relevant, just reply "no" and I won't follow up.\n
— Victor, RyderTech`
  },

  'ops-heavy_businesses': {
    subject: 'What are your manual processes actually costing you?',
    toolUrl: 'https://rydertech.ng/labs/ops-drain',
    toolName: 'Ops Drain Calculator',
    body: (name) => `Hi ${name},\n
RyderTech here. Most teams never calculate what their manual processes cost — invoicing, onboarding, reporting, data entry — until they automate and see the hours come back.\n
We made a free calculator: enter your real numbers and it shows the annual cost, the staff-days recovered, and how fast an automation build pays for itself. It emails you a scoped build plan.\n
→ ${'{{tool_url}}'}\n
If ops efficiency is on your roadmap, I'm glad to talk through it. If not relevant, just reply "no" and I won't follow up.\n
— Victor, RyderTech`
  },

  saas: {
    subject: 'Two free diagnostics for your product team',
    toolUrl: 'https://rydertech.ng/labs/revleak',
    toolName: 'RevLeak Auditor + Ops Drain Calculator',
    body: (name) => `Hi ${name},\n
RyderTech here — we build web/AI products and automation for Nigerian and African teams. Two free tools we made might be useful to your team:\n
• RevLeak Auditor — quantify revenue lost to slow load times: ${'https://rydertech.ng/labs/revleak'}\n
• Ops Drain Calculator — cost your manual processes and see automation payback: ${'https://rydertech.ng/labs/ops-drain'}\n
Both are free, no signup. If you ever need a build partner for product or internal tooling, I'm easy to reach. If this isn't relevant, reply "no" and I won't follow up.\n
— Victor, RyderTech`
  },

  // Generic fallback for "general" segment — deprioritized, broad value.
  general: {
    subject: 'Free tools we built for Nigerian businesses',
    toolUrl: 'https://rydertech.ng/labs',
    toolName: 'RyderTech Labs',
    body: (name) => `Hi ${name},\n
RyderTech here — we build web and AI software. We put together a few free diagnostic tools for business owners:\n
• Ops Drain Calculator — cost of manual processes\n
• RevLeak Auditor — revenue lost to slow site speed\n
• Event Access Risk Scanner — event gate bottleneck + live QR demo\n
All free, no signup: ${'https://rydertech.ng/labs'}\n
If you ever need custom software or automation, I'm glad to talk. Reply "no" to opt out of future notes.\n
— Victor, RyderTech`
  }
};

// Segments we actively outreach to, in priority order (best ICP first).
export const OUTREACH_PRIORITY = [
  'event_organizers',
  'smes',
  'ops-heavy_businesses',
  'saas'
  // 'general' intentionally excluded from active outreach
];

export function renderTemplate(segment, name, optoutUrl) {
  const t = SEGMENT_TEMPLATES[segment] || SEGMENT_TEMPLATES.general;
  const body = t.body(name).replace(/{{tool_url}}/g, t.toolUrl);
  return {
    subject: t.subject,
    body: body.replace(/{{optout_url}}/g, optoutUrl || 'mailto:?subject=unsubscribe'),
    toolUrl: t.toolUrl,
    toolName: t.toolName
  };
}
