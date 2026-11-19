import { createSupabaseAdminClient } from '$lib/supabase/server';
import { json } from '@sveltejs/kit';

export async function POST({ request }: { request: Request }) {
  const admin = createSupabaseAdminClient();

  try {
    const { email, tool, name, touch } = await request.json();

    if (!email || !tool || !touch) {
      return json({ success: false, error: 'Missing required fields: email, tool, touch' }, { status: 400 });
    }

    // Get template
    const template = getTemplate(tool, touch, name);
    const subject = template.subject;
    const body = template.body;

    // Send via Gmail MCP (this would be called via the MCP tool from the frontend)
    // For now, we'll log the send and return success
    // The actual Gmail send happens via the frontend calling the MCP tool

    // Log the send
    const { error: logError } = await admin
      .from('nurture_send_log')
      .insert({
        email,
        tool,
        touch,
        subject,
        body: body.substring(0, 5000),
        message_id: `manual-${Date.now()}`,
        sent_at: new Date().toISOString()
      });

    if (logError) throw logError;

    // Mark touch as sent in nurture_state
    const { error: markError } = await admin.rpc('mark_nurture_touch_sent', {
      p_email: email,
      p_touch: touch
    });

    if (markError) throw markError;

    return json({ success: true, messageId: `manual-${Date.now()}` });
  } catch (e: unknown) {
    console.error('Nurture send error:', e);
    return json({ success: false, error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}

function getTemplate(tool: string, touch: number, name: string = 'there') {
  const toolUrls: Record<string, string> = {
    ops_drain: '/labs/ops-drain',
    revleak: '/labs/revleak',
    event_risk: '/labs/event-access-risk',
    website_rater: '/labs/website-rater',
    visibility: '/labs/visibility',
    aeo: '/labs/aeo-readiness',
    clausescan: '/labs/clausescan',
    gateway_calc: '/labs/gateway-calc',
    agentic_cost: '/labs/agentic-workflow-cost',
    q_day: '/labs/q-day-readiness',
    gpt6_checker: '/labs/gpt-6-checker',
    headline_studio: '/labs/headline-studio',
    content_repurposer: '/labs/content-repurposer',
    property_chatbot: '/labs/property-chatbot',
    cost_estimator: '/labs/cost-estimator',
    agent_templates: '/labs/agent-templates',
    automation_readiness: '/labs/automation-readiness',
    voice_agent: '/services/ai',
    ai_widget: '/services/ai',
    course_interest: '/courses',
    contact: '/contact'
  };

  const toolUrl = toolUrls[tool] || '/labs';

  // Simplified templates matching the frontend
  const templates: Record<string, Record<number, { subject: string; body: string }>> = {
    ops_drain: {
      1: {
        subject: 'Your Ops Drain audit — the 1-line version',
        body: `Hi ${name},\n\nThanks for running the Ops Drain Calculator. The headline: you're losing hours every week to manual work that a simple workflow could handle.\n\nHere's your branded audit you can keep/share: https://rydertech.ng${toolUrl}\n\nIn two days I'll send the 3 automations that recover the most staff time.\n\n— Victor, RyderTech`
      },
      2: {
        subject: '3 automations that recover the most staff time',
        body: `Hi ${name},\n\nThe three workflows that consistently pay for themselves in month one:\n\n1. Invoicing & billing — webhook → PDF → auto-send. Kills monthly reconciliation.\n2. Client onboarding — self-serve forms → database → welcome sequence. No copy-paste.\n3. Reporting — scheduled job aggregates data → emails digest. Zero manual pulls.\n\nIf any of those are still human-powered in your shop, that's exactly what we'd automate first.\n\n— Victor, RyderTech`
      },
      3: {
        subject: 'Worth a 15-minute scoping call?',
        body: `Hi ${name},\n\nI'll stop here. If the audit made you wince, the next step is a 15-minute scoping call — I'll show you what automating your top task actually looks like and what it costs.\n\nGrab a slot: https://rydertech.ng/contact\n\nIf the timing's off, just reply "later" and I'll check back next quarter.\n\n— Victor, RyderTech`
      }
    },
    revleak: {
      1: {
        subject: 'Your RevLeak audit — the 1-line version',
        body: `Hi ${name},\n\nThanks for running the RevLeak Auditor. The headline: your funnel has specific, measurable leaks — and each one is fixable.\n\nHere's your branded audit you can keep/share: https://rydertech.ng${toolUrl}\n\nIn two days I'll send the 3 speed fixes that lift conversion fastest.\n\n— Victor, RyderTech`
      },
      2: {
        subject: '3 speed fixes that lift conversion',
        body: `Hi ${name},\n\nThe three fixes that consistently lift funnel conversion:\n\n1. Above-the-fold clarity — headline + outcome + CTA in 3 seconds.\n2. Trust density — logos, outcomes, specifics near every ask.\n3. Friction removal — kill fields, auto-fill, one-click where possible.\n\nImplement those and your leak score drops 2-3 points. That's real revenue.\n\n— Victor, RyderTech`
      },
      3: {
        subject: 'Worth a 15-minute CRO audit?',
        body: `Hi ${name},\n\nI'll stop here. If you want to close the leaks, the next step is a 15-minute CRO audit — I'll walk your live funnel, prioritize fixes, and quote the implementation.\n\nBook it: https://rydertech.ng/contact\n\nIf now's not the time, reply "later" and I'll check back next quarter.\n\n— Victor, RyderTech`
      }
    },
    website_rater: {
      1: {
        subject: 'Your Website Review — the 1-line version',
        body: `Hi ${name},\n\nThanks for running the Website Review. The headline: your site has specific, fixable gaps that are costing you leads and credibility every day.\n\nHere's your branded audit you can keep/share: https://rydertech.ng${toolUrl}\n\nIn two days I'll send the 3 quick wins that move the needle fastest.\n\n— Victor, RyderTech`
      },
      2: {
        subject: '3 quick wins for a higher-converting site',
        body: `Hi ${name},\n\nThe three fixes that consistently lift conversion for sites like yours:\n\n1. Above-the-fold clarity — headline + subhead + CTA in the first 3 seconds.\n2. Trust signals — logos, testimonials, concrete outcomes near every ask.\n3. Friction removal — kill fields, auto-fill, one-click actions where possible.\n\nImplement those and your score jumps 2-3 points. That's real revenue.\n\n— Victor, RyderTech`
      },
      3: {
        subject: 'Worth a 15-minute CRO audit?',
        body: `Hi ${name},\n\nI'll stop here. If the review showed gaps you want to close, the next step is a 15-minute CRO audit — I'll walk your live site, prioritize the fixes, and quote the implementation.\n\nBook it: https://rydertech.ng/contact\n\nIf now's not the time, reply "later" and I'll check back next quarter.\n\n— Victor, RyderTech`
      }
    }
  };

  const t = templates[tool]?.[touch] || { subject: 'Preview', body: 'Template not found' };
  return t;
}