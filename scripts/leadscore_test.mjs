import { build } from 'esbuild';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const out = join(mkdtempSync(join(tmpdir(), 'ls-')), 'e.mjs');
await build({ entryPoints: ['src/lib/leadScore.ts'], bundle: true, format: 'esm', outfile: out, logLevel: 'error' });
const { scoreLead, TIER_LABEL } = await import(pathToFileURL(out).href);

let pass = 0, fail = 0;
function check(name, cond) { if (cond) { pass++; console.log('  ok  ', name); } else { fail++; console.log('  FAIL', name); } }

// 1. Hot: huge ops drain (₦5M impact, ₦5M revenue at risk)
const hot = scoreLead({ tool: 'ops_drain', impactValue: 5_000_000, revenueAtRisk: 5_000_000, healthScore: 80 });
check('hot: points >= 60', hot.points >= 60);
check('hot: tier hot', hot.tier === 'hot');
check('hot: has reasons', hot.reasons.length > 0);

// 2. Warm: moderate revleak (₦500k impact)
const warm = scoreLead({ tool: 'revleak', impactValue: 500_000, revenueAtRisk: 500_000, healthScore: 60 });
check('warm: 30-59', warm.points >= 30 && warm.points < 60);
check('warm: tier warm', warm.tier === 'warm');

// 3. Cool: tiny impact, healthy
const cool = scoreLead({ tool: 'cost_estimator', impactValue: 20_000, revenueAtRisk: 20_000, healthScore: 95 });
check('cool: points < 30', cool.points < 30);
check('cool: tier cool', cool.tier === 'cool');

// 4. Severe health gap boosts score (invisible locally, score 0)
const severe = scoreLead({ tool: 'visibility', impactValue: 200_000, revenueAtRisk: 200_000, healthScore: 0 });
check('severe: health 0 → warm/hot', severe.points >= 30);
check('severe: mentions severe gap', severe.reasons.some(r => r.includes('Severe')));

// 5. revenueAtRisk delta adds urgency only when materially larger
const delta = scoreLead({ tool: 'ops_drain', impactValue: 1_000_000, revenueAtRisk: 5_000_000 });
check('delta: revenueAtRisk >> impact → higher than impact-only', delta.points > scoreLead({ tool:'ops_drain', impactValue:1_000_000, revenueAtRisk:1_000_000 }).points);

// 6. impact curve rises steeply then saturates
const a = scoreLead({ tool:'ops_drain', impactValue: 1_000_000, revenueAtRisk: 1_000_000 }).points;
const b = scoreLead({ tool:'ops_drain', impactValue: 10_000_000, revenueAtRisk: 10_000_000 }).points;
check('saturation: ₦10M scores higher than ₦1M', b > a);

// 7. determinism
const x = scoreLead({ tool:'aeo', impactValue: 800_000, revenueAtRisk: 800_000, healthScore: 20 });
const y = scoreLead({ tool:'aeo', impactValue: 800_000, revenueAtRisk: 800_000, healthScore: 20 });
check('deterministic', JSON.stringify(x) === JSON.stringify(y));

// 8. TIER_LABEL maps
check('TIER_LABEL.hot = Hot', TIER_LABEL.hot === 'Hot');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
