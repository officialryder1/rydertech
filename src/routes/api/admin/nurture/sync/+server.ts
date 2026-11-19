import { createSupabaseAdminClient } from '$lib/supabase/server';
import { json } from '@sveltejs/kit';

export async function POST() {
  const admin = createSupabaseAdminClient();

  try {
    let enrolled = 0;

    // Sync contact submissions
    const { data: contactLeads, error: contactError } = await admin
      .from('contact_submissions')
      .select('*')
      .gte('submitted_at', new Date(Date.now() - 30 * 86400000).toISOString())
      .order('submitted_at', { ascending: false });

    if (!contactError && contactLeads) {
      for (const lead of contactLeads) {
        const email = lead.from_email || lead.email;
        if (!email) continue;

        const { data: existing } = await admin
          .from('nurture_state')
          .select('email')
          .eq('email', email)
          .single();

        if (!existing) {
          const tool = mapLeadType(lead.lead_type || 'contact');
          const { error: enrollError } = await admin.rpc('enroll_nurture_lead', {
            p_email: email,
            p_tool: tool,
            p_name: lead.from_name || lead.name || lead.company || email.split('@')[0],
            p_captured_at: lead.submitted_at,
            p_lead_score: lead.lead_score,
            p_lead_tier: lead.lead_segment
          });
          if (!enrollError) enrolled++;
        }
      }
    }

    // Sync newsletter subscriptions (lab tools)
    const { data: magnetLeads, error: magnetError } = await admin
      .from('newsletter_subscriptions')
      .select('*')
      .gte('subscribed_at', new Date(Date.now() - 30 * 86400000).toISOString())
      .like('source', 'lead_magnet_%')
      .order('subscribed_at', { ascending: false });

    if (!magnetError && magnetLeads) {
      for (const lead of magnetLeads) {
        const email = lead.email;
        if (!email) continue;

        const { data: existing } = await admin
          .from('nurture_state')
          .select('email')
          .eq('email', email)
          .single();

        if (!existing) {
          const tool = mapLeadType(lead.source || 'contact');
          const { error: enrollError } = await admin.rpc('enroll_nurture_lead', {
            p_email: email,
            p_tool: tool,
            p_name: lead.company || lead.name || email.split('@')[0],
            p_captured_at: lead.subscribed_at,
            p_lead_score: lead.lead_score,
            p_lead_tier: lead.lead_segment
          });
          if (!enrollError) enrolled++;
        }
      }
    }

    return json({ success: true, enrolled });
  } catch (e: unknown) {
    console.error('Nurture sync error:', e);
    return json({ success: false, error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}

function mapLeadType(type: string): string {
  const map: Record<string, string> = {
    'lead_magnet_ops_drain': 'ops_drain',
    'lead_magnet_revleak': 'revleak',
    'lead_magnet_event_risk': 'event_risk',
    'lead_magnet_website_rater': 'website_rater',
    'lead_magnet_visibility': 'visibility',
    'lead_magnet_aeo_readiness': 'aeo',
    'lead_magnet_aeo': 'aeo',
    'lead_magnet_clausescan': 'clausescan',
    'lead_magnet_clausescan_contract': 'clausescan',
    'lead_magnet_gateway_calc': 'gateway_calc',
    'lead_magnet_agentic_cost': 'agentic_cost',
    'lead_magnet_agentic_workflow_cost': 'agentic_cost',
    'lead_magnet_q_day_readiness': 'q_day',
    'lead_magnet_q_day': 'q_day',
    'lead_magnet_gpt_6_checker': 'gpt6_checker',
    'lead_magnet_gpt6_checker': 'gpt6_checker',
    'lead_magnet_headline_studio': 'headline_studio',
    'lead_magnet_content_repurposer': 'content_repurposer',
    'lead_magnet_property_chatbot': 'property_chatbot',
    'lead_magnet_cost_estimator': 'cost_estimator',
    'lead_magnet_cost_guide': 'cost_estimator',
    'lead_magnet_agent_templates': 'agent_templates',
    'lead_magnet_automation_readiness': 'automation_readiness',
    'voice_agent': 'voice_agent',
    'ai_widget': 'ai_widget',
    'course_interest': 'course_interest',
    'contact': 'contact'
  };
  return map[type] || 'contact';
}