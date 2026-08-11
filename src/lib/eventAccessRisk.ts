/**
 * Event Access Risk Engine
 * Converts guest-check-in inputs into gate bottleneck time, gatecrash exposure,
 * staffing-cost delta, and the Veripasshub-shaped remediation.
 * Pure functions — no DOM, no network. Reuses opsDrain's formatMoney for output.
 */

export type CheckInMethod = 'manual' | 'spreadsheet' | 'qr';

export interface EngineInput {
	/** total invited guests expected at the gate */
	guestCount: number;
	/** entry points / gates operating at once */
	gateCount: number;
	/** how long the whole guest crowd is expected to arrive (peak window), minutes */
	peakArrivalMinutes: number;
	/** total event staff-time that gates must be manned, hours */
	eventDurationHours: number;
	/** current check-in method */
	method: CheckInMethod;
	/** a pre-event access list is cross-checked at the gate */
	accessListUsed: boolean;
	/** guests receive printed lists / paper invites that can be forged or shared */
	onsitePrinting: boolean;
	/** fully-loaded wage per gate staff hour */
	staffWage: number;
	/** average ticket / cover value per guest (revenue at risk from gatecrash) */
	avgTicketValue: number;
	/** display currency for money formatting */
	currency: 'NGN' | 'USD';
}

export interface EngineResult {
	/** minutes the last guest waits at the gate under the chosen method */
	gateTimeMin: number;
	/** minutes the same crowd would wait under QR verification */
	gateTimeMinQr: number;
	/** time saved by switching to QR, minutes */
	gateTimeSavedMin: number;
	/** estimated guests who slip through under the current method, % */
	gatecrashPct: number;
	/** estimated number of guests exposed */
	exposedGuests: number;
	/** revenue exposed to gatecrash under current method */
	revenueAtRisk: number;
	/** staff cost to run gates under current method */
	staffCostCurrent: number;
	/** staff cost under QR verification */
	staffCostQr: number;
	/** annualised staffing saving from QR (single event extrapolated) */
	staffingDelta: number;
	/** human-readable severity tier */
	severity: 'low' | 'moderate' | 'high' | 'critical';
	/** what the bottleneck costs in plain terms */
	verdict: string;
	/** the Veripasshub-shaped remediation list */
	enhancements: string[];
}

const CHECK_IN_MINUTES: Record<CheckInMethod, number> = {
	manual: 2.5, // name lookup, cross-check, mark off, wave through
	spreadsheet: 1.2, // find row, tick, but offline/typo-prone
	qr: 0.5 // scan and walk
};

const BASE_GATECRASH_PCT: Record<CheckInMethod, number> = {
	manual: 25, // no real identity binding
	spreadsheet: 15, // a name on a list is easy to spoof
	qr: 6 // signed, single-use invite
};

const clamp = (n: number, min: number, max: number) =>
	Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;

const round = (n: number) => (Number.isFinite(n) ? Math.round(n * 100) / 100 : 0);

/** Total time for all gates, running flat-out, to process the whole crowd. */
function gateClearTime(guestCount: number, minutesPerCheckIn: number, gateCount: number): number {
	const gates = Math.max(gateCount, 1);
	return (guestCount * minutesPerCheckIn) / gates;
}

function estimateGatecrash(input: EngineInput): { pct: number; base: number } {
	const base = BASE_GATECRASH_PCT[input.method];
	let pct = base;
	if (input.accessListUsed) pct *= 0.6; // pre-checked list trims off-list attempts
	if (input.onsitePrinting) {
		// printed lists / paper invites are easy to duplicate or hand off
		pct += input.method === 'qr' ? 2 : 8;
	}
	return { pct: clamp(pct, 0, 60), base };
}

export function computeEventRisk(input: EngineInput): EngineResult {
	const guestCount = clamp(input.guestCount, 0, 5_000_000);
	const gateCount = clamp(input.gateCount, 1, 5_000);
	const peakArrivalMinutes = clamp(input.peakArrivalMinutes, 1, 24 * 60);
	const eventDurationHours = clamp(input.eventDurationHours, 0.5, 72);
	const staffWage = clamp(input.staffWage, 0, 1_000_000);
	const avgTicketValue = clamp(input.avgTicketValue, 0, 100_000_000);

	const minutesCurrent = CHECK_IN_MINUTES[input.method];
	const minutesQr = CHECK_IN_MINUTES.qr;

	// Gate bottleneck: time to clear the crowd at the current method vs QR.
	const gateTimeMin = Math.ceil(gateClearTime(guestCount, minutesCurrent, gateCount));
	const gateTimeMinQr = Math.ceil(gateClearTime(guestCount, minutesQr, gateCount));
	const gateTimeSavedMin = Math.max(0, gateTimeMin - gateTimeMinQr);

	// Throughput needed during the peak window drives how many staff gates need.
	const throughputNeededPerMin = guestCount / peakArrivalMinutes; // people/min arriving
	const gateThroughputPerMin = 1 / minutesCurrent; // people/min a gate handles
	const staffNeededCurrent = Math.max(1, Math.ceil(throughputNeededPerMin / gateThroughputPerMin));
	// QR is faster, so fewer gates needed; a couple of floaters cover the rest.
	const staffNeededQr = Math.max(2, Math.ceil(gateCount / 3) + 1);

	const staffCostCurrent = round(staffNeededCurrent * staffWage * eventDurationHours);
	const staffCostQr = round(staffNeededQr * staffWage * eventDurationHours);
	const staffingDelta = round(staffCostCurrent - staffCostQr);

	// Gatecrash exposure.
	const { pct: gatecrashPct } = estimateGatecrash(input);
	const exposedGuests = Math.round((guestCount * gatecrashPct) / 100);
	const revenueAtRisk = round(exposedGuests * avgTicketValue);

	// Severity tier.
	let severity: EngineResult['severity'] = 'low';
	if (gateTimeMin > 60 || gatecrashPct > 25) severity = 'critical';
	else if (gateTimeMin > 30 || gatecrashPct > 15) severity = 'high';
	else if (gateTimeMin > 10 || gatecrashPct > 8) severity = 'moderate';

	const verdict =
		severity === 'critical'
			? 'Critical. Your gate will fail in public — long queues and a porous perimeter.'
			: severity === 'high'
				? 'High risk. Expect visible queues and meaningful gatecrash exposure.'
				: severity === 'moderate'
					? 'Moderate friction. Guests feel the wait; a percentage walk in free.'
					: 'Currently manageable — but QR removes the remaining drag and exposure.';

	const enhancements = [
		'Digital guest list with QR invitations — each invite signed, single-use, scanned in <1s at the gate.',
		'Real-time gate dashboard — live headcount, check-in rate, and alerting the moment a gate backs up.',
		'Pre-event self check-in / invite validation — guests confirm attendance, cutting gate friction by up to 40%.',
		'Tiered access (VIP / GA / staff) encoded in the QR — no list-scanning, no disputes at the door.',
		'Offline-capable scanner — gates keep working even if the venue network drops.'
	];

	return {
		gateTimeMin,
		gateTimeMinQr,
		gateTimeSavedMin,
		gatecrashPct: round(gatecrashPct),
		exposedGuests,
		revenueAtRisk,
		staffCostCurrent,
		staffCostQr,
		staffingDelta,
		severity,
		verdict,
		enhancements
	};
}
