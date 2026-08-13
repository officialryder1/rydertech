// Real execution test for aeoReadiness engine.
import { build } from 'esbuild';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const out = join(mkdtempSync(join(tmpdir(), 'aeo-')), 'engine.mjs');
await build({ entryPoints: ['src/lib/aeoReadiness.ts'], bundle: true, format: 'esm', outfile: out, logLevel: 'error' });
const { computeAeoReadiness } = await import(pathToFileURL(out).href);

let pass = 0, fail = 0;
function check(name, cond) {
	if (cond) { pass++; console.log('  ok  ', name); }
	else { fail++; console.log('  FAIL', name); }
}

// 1. Invisible: no website, nothing.
const inv = computeAeoReadiness({
  haveWebsite:false, hasStructuredData:false, hasFAQContent:false, entityClear:false,
  citedByAuthorities:false, hasKnowledgePresence:false, contentFresh:false,
  hasLocalSignal:false, monthlyVisitors:0, avgCustomerValue:5000, currency:'NGN'
});
check('invisible: score 0', inv.score === 0);
check('invisible: readiness=invisible', inv.readiness === 'invisible');
check('invisible: severity critical', inv.severity === 'critical');
check('invisible: has "No crawlable website" gap', inv.gaps.some(g => g.factor === 'No crawlable website'));
check('invisible: estMissed 0 (no visitors)', inv.estMissed === 0 && inv.revenueAtRisk === 0);

// 2. Dominant: full AEO stack, 5000 visitors, NGN.
const dom = computeAeoReadiness({
  haveWebsite:true, hasStructuredData:true, hasFAQContent:true, entityClear:true,
  citedByAuthorities:true, hasKnowledgePresence:true, contentFresh:true,
  hasLocalSignal:true, monthlyVisitors:5000, avgCustomerValue:25000, currency:'NGN'
});
check('dominant: score 100', dom.score === 100);
check('dominant: readiness=dominant', dom.readiness === 'dominant');
check('dominant: estMonthlyAnswers = 5000*0.04 = 200', dom.estMonthlyAnswers === 200);
check('dominant: estMissed ~0 (<10)', dom.estMissed >= 0 && dom.estMissed < 10);
check('dominant: no critical gaps', !dom.gaps.some(g => g.severity === 'critical'));

// 3. Partial: website + structured data + fresh, but no FAQ / no entity / no authority.
const partial = computeAeoReadiness({
  haveWebsite:true, hasStructuredData:true, hasFAQContent:false, entityClear:false,
  citedByAuthorities:false, hasKnowledgePresence:false, contentFresh:true,
  hasLocalSignal:false, monthlyVisitors:1000, avgCustomerValue:8000, currency:'NGN'
});
check('partial: score 30-54', partial.score >= 30 && partial.score < 55);
check('partial: readiness=partial', partial.readiness === 'partial');
check('partial: has "No direct-answer (FAQ) content" gap', partial.gaps.some(g => g.factor.includes('FAQ')));
check('partial: has "Unclear entity definition" gap', partial.gaps.some(g => g.factor.includes('entity')));
// revenue math: estMonthlyAnswers=40, estMissed=40*(1-0.40)=24, rev = 24*12*8000*0.1
check('partial: revenueAtRisk = round(24*12*8000*0.1)=230400', partial.revenueAtRisk === Math.round(24*12*8000*0.1));

// 4. Ready boundary: website + structured + FAQ + entity = 65 => ready (>=55).
const ready = computeAeoReadiness({
  haveWebsite:true, hasStructuredData:true, hasFAQContent:true, entityClear:true,
  citedByAuthorities:false, hasKnowledgePresence:false, contentFresh:false,
  hasLocalSignal:false, monthlyVisitors:0, avgCustomerValue:1000, currency:'USD'
});
check('ready: score 65 (got ' + ready.score + ')', ready.score === 65);
check('ready: readiness=ready', ready.readiness === 'ready');

// 5. Determinism.
const a = computeAeoReadiness({ haveWebsite:true, hasStructuredData:true, hasFAQContent:true, entityClear:true, citedByAuthorities:true, hasKnowledgePresence:true, contentFresh:true, hasLocalSignal:true, monthlyVisitors:300, avgCustomerValue:100, currency:'USD' });
const b = computeAeoReadiness({ haveWebsite:true, hasStructuredData:true, hasFAQContent:true, entityClear:true, citedByAuthorities:true, hasKnowledgePresence:true, contentFresh:true, hasLocalSignal:true, monthlyVisitors:300, avgCustomerValue:100, currency:'USD' });
check('deterministic: same result', JSON.stringify(a) === JSON.stringify(b));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
