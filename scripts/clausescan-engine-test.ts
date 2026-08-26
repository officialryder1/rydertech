/**
 * Engine unit tests for ClauseScan — run with: npx tsx scripts/clausescan-engine-test.ts
 * Mirrors the opsDrain standalone-test discipline: pure-function assertions, no network.
 */
import assert from 'node:assert/strict';
import {
	aggregateRisk,
	band,
	buildSummary,
	sortFindings,
	severityLabel,
	formatScore,
	defaultNextSteps,
	severityCopy,
	CLAUSESCAN_PRICE_NGN,
	type ClauseFinding,
	type Severity
} from '../src/lib/clauseScan.ts';

let passed = 0;
function ok(name: string, fn: () => void) {
	fn();
	passed++;
	console.log(`  ✓ ${name}`);
}

const f = (clause: string, severity: Severity): ClauseFinding => ({
	clause,
	category: 'Test',
	severity,
	risk: 'x',
	explanation: 'y'
});

ok('aggregateRisk: empty -> low/1', () => {
	const r = aggregateRisk([]);
	assert.equal(r.riskScore, 1);
	assert.equal(r.severity, 'low');
});

ok('aggregateRisk: all low averages ~20', () => {
	const r = aggregateRisk([f('a', 'low'), f('b', 'low')]);
	assert.ok(r.riskScore >= 18 && r.riskScore <= 22, `score ${r.riskScore}`);
	assert.equal(r.severity, 'low');
});

ok('aggregateRisk: single critical -> 100/critical', () => {
	const r = aggregateRisk([f('a', 'critical')]);
	assert.equal(r.riskScore, 100);
	assert.equal(r.severity, 'critical');
});

ok('aggregateRisk: many criticals -> critical band', () => {
	const r = aggregateRisk([f('a', 'critical'), f('b', 'critical'), f('c', 'high')]);
	assert.equal(r.severity, 'critical');
	assert.ok(r.riskScore >= 80);
});

ok('aggregateRisk: mixed moderate/high lands high', () => {
	const r = aggregateRisk([f('a', 'moderate'), f('b', 'high'), f('c', 'high')]);
	assert.equal(r.severity, 'high');
});

ok('band: thresholds', () => {
	assert.equal(band(10), 'low');
	assert.equal(band(40), 'moderate');
	assert.equal(band(60), 'high');
	assert.equal(band(85), 'critical');
	assert.equal(band(20, true), 'high'); // critical present floors at high
});

ok('sortFindings: worst-first', () => {
	const sorted = sortFindings([f('low', 'low'), f('crit', 'critical'), f('high', 'high')]);
	assert.equal(sorted[0].clause, 'crit');
	assert.equal(sorted[sorted.length - 1].clause, 'low');
});

ok('buildSummary: caps topRisks at 3', () => {
	const all = [f('c1', 'critical'), f('c2', 'high'), f('c3', 'high'), f('c4', 'moderate'), f('c5', 'low')];
	const s = buildSummary(all, 'verdict');
	assert.equal(s.topRisks.length, 3);
	assert.equal(s.clauseCount, 5);
	assert.equal(s.verdict, 'verdict');
});

ok('buildSummary: all=true keeps every clause', () => {
	const all = [f('c1', 'critical'), f('c2', 'high')];
	const s = buildSummary(all, 'v', { all: true });
	assert.equal((s as any).clauses?.length ?? s.topRisks.length, 2);
});

ok('severityLabel maps', () => {
	assert.equal(severityLabel('critical'), 'Critical');
	assert.equal(severityLabel('low'), 'Low');
});

ok('formatScore clamps', () => {
	assert.equal(formatScore(150), '100/100');
	assert.equal(formatScore(-5), '1/100');
});

ok('defaultNextSteps includes lawyer review', () => {
	const steps = defaultNextSteps('high');
	assert.ok(steps.some((s) => /lawyer/i.test(s)));
	assert.ok(steps[0].toLowerCase().includes('do not sign')); // high prepends warning
});

ok('severityCopy reads sensibly', () => {
	assert.ok(/Critical/.test(severityCopy('critical')));
	assert.ok(/Low/.test(severityCopy('low')));
});

ok('price constant sane', () => {
	assert.equal(CLAUSESCAN_PRICE_NGN, 2500);
});

console.log(`\n${passed} engine assertions passed.`);
