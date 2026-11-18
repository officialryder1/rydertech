import { json } from '@sveltejs/kit';
import { Resend } from 'resend';
import { z } from 'zod';
import { env } from '$env/dynamic/private';
import { createSupabaseAdminClient } from '$lib/supabase/server';

const schema = z.object({
	from_name: z.string().min(1),
	from_email: z.string().email(),
	company: z.string().optional(),
	budget: z.string().optional(),
	timeline: z.string().optional(),
	message: z.string().min(1),
	lead_type: z.string().optional(),
	lead_score: z.number().optional(),
	lead_tier: z.string().optional(),
	lead_source: z.string().optional()
});

function getResend() {
	return new Resend(env.RESEND_API_KEY);
}

function pickSupabaseTable(leadType?: string): string {
	if (!leadType) return 'contact_submissions';
	if (leadType.startsWith('lead_magnet_')) return 'newsletter_subscriptions';
	if (leadType === 'voice_agent' || leadType === 'ai_widget' || leadType === 'course_interest') return 'newsletter_subscriptions';
	return 'contact_submissions';
}

function buildSupabaseRow(data: z.infer<typeof schema>, table: string) {
	const base = {
		email: data.from_email,
		company: data.company || null,
		budget: data.budget || null,
		timeline: data.timeline || null,
		message: data.message,
		lead_score: data.lead_score ?? null,
		lead_tier: data.lead_tier || null,
		lead_source: data.lead_source || null,
		submitted_at: new Date().toISOString()
	};

	if (table === 'contact_submissions') {
		return {
			...base,
			name: data.from_name,
			status: 'new'
		};
	}

	// newsletter_subscriptions
	return {
		...base,
		source: data.lead_type || 'unknown',
		subscribed_at: new Date().toISOString()
	};
}

export async function POST({ request }) {
	try {
		const body = await request.json();
		const data = schema.parse(body);

		const html = `
      <h2>New Lead: ${data.lead_type || 'Contact Form'}</h2>
      <p><strong>Name:</strong> ${data.from_name}</p>
      <p><strong>Email:</strong> ${data.from_email}</p>
      <p><strong>Company:</strong> ${data.company || '—'}</p>
      <p><strong>Budget:</strong> ${data.budget || '—'}</p>
      <p><strong>Timeline:</strong> ${data.timeline || '—'}</p>
      <p><strong>Lead Score:</strong> ${data.lead_score ?? '—'} (${data.lead_tier || '—'})</p>
      <p><strong>Source:</strong> ${data.lead_source || '—'}</p>
      <hr />
      <p><strong>Message:</strong></p>
      <pre>${data.message}</pre>
    `;

		const resend = getResend();
		await resend.emails.send({
			from: 'RyderTech Leads <onboarding@rydertech.ng>',
			to: 'rydertech.ng@gmail.com',
			subject: `New ${data.lead_type?.replace('lead_magnet_', '').replace('_', ' ') || 'Contact'} Lead: ${data.from_name}`,
			html,
			reply_to: data.from_email
		});

		// Server-side Supabase write (service role, bypasses RLS) — guaranteed audit trail
		let dbError: { table: string; message: string } | null = null;
		try {
			const admin = createSupabaseAdminClient();
			const table = pickSupabaseTable(data.lead_type);
			const row = buildSupabaseRow(data, table);
			const { error } = await admin.from(table).insert([row]);
			if (error) {
				console.error('Supabase admin insert failed:', error);
				dbError = { table, message: error.message };
			}
		} catch (dbErr) {
			console.error('Supabase admin client error:', dbErr);
			dbError = { table: 'unknown', message: dbErr instanceof Error ? dbErr.message : String(dbErr) };
		}

		return json({ success: true, dbError });
	} catch (error) {
		console.error('Email API error:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to send' },
			{ status: 500 }
		);
	}
}