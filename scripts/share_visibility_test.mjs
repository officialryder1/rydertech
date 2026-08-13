import { build } from 'esbuild';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const out = join(mkdtempSync(join(tmpdir(), 'shr-')), 'sr.mjs');
await build({ entryPoints: ['src/lib/shareReport.ts'], bundle: true, format: 'esm', outfile: out, logLevel: 'error' });
const { reportFromLocalVisibility } = await import(pathToFileURL(out).href);

const o2 = join(mkdtempSync(join(tmpdir(), 'vis-')), 'e.mjs');
await build({ entryPoints: ['src/lib/localVisibility.ts'], bundle: true, format: 'esm', outfile: o2, logLevel: 'error' });
const { computeLocalVisibility } = await import(pathToFileURL(o2).href);

const r = computeLocalVisibility({
  businessName: 'Mama Nkechi Kitchen', category: 'restaurant', city: 'Lagos',
  haveWebsite: false, websiteResponsive: false, haveGoogleBusinessProfile: false,
  gbpVerified: false, gbpReviews: 0, gbpRating: 0, runPaidAds: false,
  socialOnly: true, avgCustomerValue: 5000, currency: 'NGN'
});
const payload = reportFromLocalVisibility(r, 'NGN', 'Mama Nkechi Kitchen');
const url = `/labs/share?d=${encodeURIComponent(JSON.stringify(payload))}`;
const d = JSON.parse(decodeURIComponent(url.split('d=')[1]));
const ok = d.tool === 'visibility' && d.heroValue === '0/100' && d.rows.length === 4;
console.log('payload tool:', d.tool, '| hero:', d.heroValue, '| rows:', d.rows.length);
console.log(ok ? 'SHARE ROUNDTRIP OK' : 'SHARE ROUNDTRIP FAIL');
process.exit(ok ? 0 : 1);
