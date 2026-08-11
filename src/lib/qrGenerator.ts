import QRCode from 'qrcode';

/**
 * Reuses the Veripasshub QR engine pattern (qrcode.toDataURL).
 * Generates a scannable invite QR for the Event Access Risk Scanner live demo.
 * Client-only — best-effort, never blocks the page on failure.
 */
export async function generateInviteQR(value: string): Promise<string> {
	try {
		return await QRCode.toDataURL(value, {
			width: 240,
			margin: 1,
			color: { dark: '#0a0a0a', light: '#ffffff' }
		});
	} catch (err) {
		console.error('QR generation failed:', err);
		return '';
	}
}
