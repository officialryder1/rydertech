/**
 * Smoke test for the publish-date gate. Run: node --experimental-strip-types scripts/smoke/post-publish.mts
 *
 * The gate decides what the public sees, so the boundary cases matter more than
 * the happy path: a post dated TODAY must be live, and the comparison must not
 * drift with the server timezone.
 */
import { isPublished, toDateKey, publishedOnly } from '../../src/lib/postPublish.ts';

let pass = 0;
let fail = 0;

function check(label: string, actual: unknown, expected: unknown) {
	const ok = JSON.stringify(actual) === JSON.stringify(expected);
	if (ok) pass++;
	else fail++;
	console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `\n        expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`}`);
}

const TODAY = new Date('2026-10-13T08:00:00Z');

// --- toDateKey: normalisation ---
check('toDateKey plain date', toDateKey('2026-10-13'), '2026-10-13');
check('toDateKey quoted-style w/ time', toDateKey('2026-10-13T09:30:00Z'), '2026-10-13');
check('toDateKey Date object', toDateKey(new Date('2026-10-13T00:00:00Z')), '2026-10-13');
check('toDateKey missing -> empty', toDateKey(undefined), '');
check('toDateKey garbage -> empty', toDateKey('not-a-date'), '');

// --- boundary: today is live, tomorrow is not ---
check('post dated TODAY is live', isPublished('2026-10-13', TODAY), true);
check('post dated YESTERDAY is live', isPublished('2026-10-12', TODAY), true);
check('post dated TOMORROW is NOT live', isPublished('2026-10-14', TODAY), false);
check('post dated far future is NOT live', isPublished('2026-10-23', TODAY), false);

// --- fail open: a typo must never unpublish a post ---
check('missing date fails OPEN (live)', isPublished(undefined, TODAY), true);
check('unparseable date fails OPEN (live)', isPublished('oops', TODAY), true);

// --- timezone: a UTC-evening "now" must not roll the date over early/late ---
check(
	'UTC late-evening now still counts today',
	isPublished('2026-10-13', new Date('2026-10-13T23:59:00Z')),
	true
);
check(
	'UTC midnight boundary publishes',
	isPublished('2026-10-14', new Date('2026-10-14T00:00:00Z')),
	true
);

// --- publishedOnly: the real drip set ---
const drip = [
	{ slug: 'ops-drain-calculator-launch', date: '2026-10-12' },
	{ slug: 'five-processes-stealing-hours', date: '2026-10-13' },
	{ slug: 'veripasshub-event-gate-costs-case-study', date: '2026-10-15' },
	{ slug: 'ai-agent-fails-without-workflow-automation', date: '2026-10-17' },
	{ slug: 'gym-owners-manual-checkin-revenue-loss', date: '2026-10-19' },
	{ slug: 'event-organizers-cut-gate-costs-qr', date: '2026-10-21' },
	{ slug: 'property-managers-automate-rent-cycle', date: '2026-10-23' }
];

check(
	'on Oct 13 the drip exposes 2 of 7',
	publishedOnly(drip, TODAY).map((p) => p.slug),
	['ops-drain-calculator-launch', 'five-processes-stealing-hours']
);

check(
	'on Oct 23 the drip exposes all 7',
	publishedOnly(drip, new Date('2026-10-23T12:00:00Z')).length,
	7
);

check(
	'on Oct 14 the Veripasshub case study flips live',
	publishedOnly(drip, new Date('2026-10-14T12:00:00Z')).map((p) => p.slug),
	['ops-drain-calculator-launch', 'five-processes-stealing-hours']
);

check(
	'on Oct 15 the Veripasshub case study IS live',
	publishedOnly(drip, new Date('2026-10-15T12:00:00Z')).map((p) => p.slug),
	[
		'ops-drain-calculator-launch',
		'five-processes-stealing-hours',
		'veripasshub-event-gate-costs-case-study'
	]
);

console.log(`\n${pass}/${pass + fail} pass`);
process.exit(fail === 0 ? 0 : 1);
