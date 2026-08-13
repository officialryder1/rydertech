import { build } from 'esbuild';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const out = join(mkdtempSync(join(tmpdir(), 'aeos-')), 'sr.mjs');
await build({ entryPoints: ['src/lib/shareReport.ts'], bundle: true, format: 'esm', outfile: out, logLevel: 'error' });
const { reportFromAeo } = await import(pathToFileURL(out).href);

const o2 = join(mkdtempSync(join(tmpdir(), 'aeoe-')), 'e.mjs');
await build({ entryPoints: ['src/lib/aeoReadiness.ts'], bundle: true, format: 'esm', outfile: o2, logLevel: 'error' });
const { computeAeoReadiness } = await import(pathToFileURL(o2).href);

const r = computeAeoReadiness({
  haveWebsite:false, hasStructuredData:false, hasFAQContent:false, entityClear:false,
  citedByAuthorities:false, hasKnowledgePresence:false, contentFresh:false,
  hasLocalSignal:false, monthlyVisitors:0, avgCustomerValue:5000, currency:'NGN'
});
const payload = reportFromAeo(r, 'NGN', 'RyderTech');
const url = `/labs/share?d=${encodeURIComponent(JSON.stringify(payload))}`;
const d = JSON.parse(decodeURIComponent(url.split('d=')[1]));
const ok = d.tool === 'aeo' && d.heroValue === '0/100' && d.rows.length === 4;
console.log('payload tool:', d.tool, '| hero:', d.heroValue, '| rows:', d.rows.length);
console.log(ok ? 'AEO SHARE ROUNDTRIP OK' : 'AEO SHARE ROUNDTRIP FAIL');
process.exit(ok ? 0 : 1);
