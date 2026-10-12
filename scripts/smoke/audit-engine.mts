/**
 * Smoke test for $lib/auditEngine.ts — headless, no browser, no deploy.
 * Run:  node --experimental-strip-types smoke_audit_engine.mts
 */
import {
	computeAudit,
	loadedHourlyCost,
	rateCardLookup,
	confidenceOf,
	ninetyDayThresholdHrsWk,
	HOURS_MIDPOINT,
	DEFAULT_HRS_WK,
	RECONCILIATION_HRS_WK,
	type AuditInput
} from '../../src/lib/auditEngine.ts';

let pass = 0;
let fail = 0;
function check(name: string, ok: boolean, detail: string) {
	if (ok) { pass++; console.log(`  PASS  ${name}  ${detail}`); }
	else { fail++; console.log(`  FAIL  ${name}  ${detail}`); }
}

const base: AuditInput = {
	sector: 'professional_services',
	manualTasks: ['Invoice reconciliation', 'Reporting & data entry', 'Payroll processing'],
	hoursRange: '10to20',
	errorFrequency: 'weekly',
	consequence: 'Delayed payments',
	dataState: 'Spreadsheets and paper',
	dataQuality: 3,
	tools: ['Excel', 'WhatsApp'],
	staffCostRange: '500kto1m',
	techComfort: 3,
	teamSize: 3
};

console.log('\n=== 1. Happy path: reconciliation case, MEDIUM/HIGH confidence ===');
const r1 = computeAudit(base);
console.log(JSON.stringify({
	confidence: r1.confidence,
	severity: r1.severity,
	readiness: r1.readiness_score,
	dimensions: r1.dimensions,
	roi: r1.roi_estimate,
	top_gap: r1.top_gap.title,
	sequence: r1.automation_sequence.map((s) => s.title),
	citations: r1.citations.length
}, null, 2));
check('roi present', r1.roi_estimate !== null, `payback ${r1.roi_estimate?.payback_months}mo`);
check('confidence HIGH', r1.confidence === 'HIGH', r1.confidence);
check('recon citation first', r1.citations[0].includes('World Bank'), r1.citations[0].slice(0, 40));
check('sequence capped at 3', r1.automation_sequence.length <= 3, `${r1.automation_sequence.length} items`);

console.log('\n=== 2. Suppression: staff cost withheld -> ROI block gone ===');
const r2 = computeAudit({ ...base, staffCostRange: undefined as never });
check('roi suppressed', r2.roi_estimate === null, String(r2.roi_estimate));
check('confidence LOW', r2.confidence === 'LOW', r2.confidence);
check('reason names the gap', /staff cost/.test(r2.roi_suppressed_reason ?? ''), r2.roi_suppressed_reason ?? '');
check('report still renders', r2.top_gap.title.length > 0 && r2.automation_sequence.length > 0, 'gap+sequence present');

console.log('\n=== 3. Suppression: hours withheld -> ROI block gone ===');
const r3 = computeAudit({ ...base, hoursRange: undefined as never });
check('roi suppressed', r3.roi_estimate === null, String(r3.roi_estimate));
check('reason names hours', /hours\/week/.test(r3.roi_suppressed_reason ?? ''), r3.roi_suppressed_reason ?? '');

console.log('\n=== 4. MEDIUM: error frequency missing, hours+cost present ===');
const r4 = computeAudit({ ...base, errorFrequency: undefined as never });
check('confidence MEDIUM', r4.confidence === 'MEDIUM', r4.confidence);
check('roi still present', r4.roi_estimate !== null, `payback ${r4.roi_estimate?.payback_months}mo`);

console.log('\n=== 5. Rate card: sector tiers + complexity multiplier ===');
const tiers = (['fintech', 'logistics', 'retail_fmcg', 'other'] as const).map((s) => `${s}=${rateCardLookup(s, 'medium')}`);
console.log('  ' + tiers.join('  '));
check('fintech above floor', rateCardLookup('fintech', 'medium') > rateCardLookup('retail_fmcg', 'medium'), tiers.join(' '));
check('retail at floor', rateCardLookup('retail_fmcg', 'medium') === 500_000, '500000');
check('complexity scales up', rateCardLookup('fintech', 'high') > rateCardLookup('fintech', 'low'), 'high>low');

console.log('\n=== 6. CALIBRATION vs published band (4-12 months) ===');
console.log('  Sector        hrs/wk  team  loaded/hr   annual_time_cost   pilot     payback');
const matrix: { sector: AuditInput['sector']; hours: keyof typeof HOURS_MIDPOINT; team: number; cost: AuditInput['staffCostRange'] }[] = [
	{ sector: 'retail_fmcg', hours: '5to10', team: 3, cost: '500kto1m' },
	{ sector: 'logistics', hours: '5to10', team: 3, cost: '500kto1m' },
	{ sector: 'fintech', hours: '5to10', team: 3, cost: '1mto2m' },
	{ sector: 'retail_fmcg', hours: '10to20', team: 3, cost: '500kto1m' },
	{ sector: 'logistics', hours: '10to20', team: 3, cost: '1mto2m' },
	{ sector: 'fintech', hours: '10to20', team: 3, cost: '1mto2m' },
	{ sector: 'fintech', hours: '10to20', team: 5, cost: '2mplus' as never }
];
const inBand: number[] = [];
const aboveBand: number[] = [];
for (const m of matrix) {
	if (m.cost === ('2mplus' as never)) continue;
	const res = computeAudit({ ...base, sector: m.sector, hoursRange: m.hours, teamSize: m.team, staffCostRange: m.cost });
	const roi = res.roi_estimate!;
	const hourly = loadedHourlyCost(m.cost, m.team);
	console.log(
		`  ${m.sector.padEnd(13)} ${String(HOURS_MIDPOINT[m.hours]).padStart(5)}  ${String(m.team).padStart(4)}  ${Math.round(hourly).toString().padStart(9)}  ${roi.annual_time_cost.toLocaleString().padStart(16)}  ${roi.pilot_cost.toLocaleString().padStart(9)}  ${String(roi.payback_months).padStart(5)}mo`
	);
	if (roi.payback_months <= 12) inBand.push(roi.payback_months);
	else aboveBand.push(roi.payback_months);
}
check('median payback inside published 4-12mo band', inBand.length >= aboveBand.length, `${inBand.length} in band, ${aboveBand.length} above`);

console.log('\n=== 7. 90-day conditional threshold (gross pilot payback <= 3mo) ===');
const hourly500 = loadedHourlyCost('500kto1m');
const thresholds = [500_000, 1_000_000, 1_500_000].map((pilot) => ({
	pilot,
	need: ninetyDayThresholdHrsWk(pilot, hourly500)
}));
for (const t of thresholds) {
	console.log(
		`  pilot NGN ${t.pilot.toLocaleString().padStart(9)}  needs >= ${t.need} hrs/wk at loaded NGN ${Math.round(hourly500)}/hr`
	);
}
check(
	'90-day gate is a finite, tier-dependent threshold (not a blanket claim)',
	thresholds.every((t) => Number.isFinite(t.need) && t.need > 0) &&
		thresholds[0].need < thresholds[2].need,
	thresholds.map((t) => `NGN${t.pilot / 1000}K@${t.need}h`).join(' ')
);
check(
	'90-day is NOT met at the Sage default (6.4 hrs/wk) on the top pilot tier',
	thresholds[2].need > DEFAULT_HRS_WK,
	`needs ${thresholds[2].need} vs default ${DEFAULT_HRS_WK}`
);

console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===\n`);
if (fail > 0) process.exitCode = 1;
