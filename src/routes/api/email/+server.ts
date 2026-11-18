import { json } from '@sveltejs/kit';
import { Resend } from 'resend';
import { z } from 'zod';
import { env } from '$env/dynamic/private';

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

		return json({ success: true });
	} catch (error) {
		console.error('Email API error:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to send' },
			{ status: 500 }
		);
	}
}