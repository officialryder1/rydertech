import { env } from '$env/dynamic/public';
import emailjs from '@emailjs/browser';

export interface LeadEmailParams {
	from_name: string;
	from_email: string;
	company?: string;
	budget?: string;
	timeline?: string;
	message: string;
	lead_type?: string;
	lead_score?: number;
	lead_tier?: string;
	lead_source?: string;
}

async function tryResend(params: LeadEmailParams): Promise<boolean> {
	try {
		const res = await fetch('/api/email', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(params)
		});
		return res.ok;
	} catch {
		return false;
	}
}

async function tryEmailJS(params: LeadEmailParams): Promise<boolean> {
	const serviceId = env.PUBLIC_EMAILJS_SERVICE_ID;
	const templateId = env.PUBLIC_EMAILJS_TEMPLATE_ID;
	const publicKey = env.PUBLIC_EMAILJS_PUBLIC_KEY;

	if (!serviceId || !templateId || !publicKey) return false;

	try {
		await emailjs.send(serviceId, templateId, params, { publicKey });
		return true;
	} catch {
		return false;
	}
}

export async function sendLeadEmail(params: LeadEmailParams): Promise<void> {
	// 1. Primary: Resend (server-side, better deliverability)
	if (await tryResend(params)) return;

	// 2. Fallback: EmailJS (client-side, no server dependency)
	if (await tryEmailJS(params)) return;

	// 3. Both failed — caller handles error (Supabase backup runs regardless)
	throw new Error('Both Resend and EmailJS failed');
}