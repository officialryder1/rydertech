// Real execution test for localVisibility engine.
// esbuild bundles the TS to a temp ESM, then we assert on actual outputs.
import { build } from 'esbuild';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const out = join(mkdtempSync(join(tmpdir(), 'vis-')), 'engine.mjs');
await build({
  entryPoints: ['src/lib/localVisibility.ts'],
  bundle: true,
  format: 'esm',
  outfile: out,
  logLevel: 'error'
});

const mod = await import(pathToFileURL(out).href);
const { computeLocalVisibility } = mod;

let pass = 0, fail = 0;
const approx = (a, b, tol = 2) => Math.abs(a - b) <= tol;
function check(name, cond) {
  if (cond) { pass++; console.log('  ok  ', name); }
  else { fail++; console.log('  FAIL', name); }
}

// 1. Invisible SME: no website, no GBP, social-only restaurant in Lagos.
const invisible = computeLocalVisibility({
  businessName: 'Mama Nkechi Kitchen',
  category: 'restaurant', city: 'Lagos',
  haveWebsite: false, websiteResponsive: false,
  haveGoogleBusinessProfile: false, gbpVerified: false,
  gbpReviews: 0, gbpRating: 0,
  runPaidAds: false, socialOnly: true,
  avgCustomerValue: 5000, currency: 'NGN'
});
check('invisible: score is 0', invisible.score === 0);
check('invisible: findability=invisible', invisible.findability === 'invisible');
check('invisible: est searches Lagos restaurant = 12000', invisible.estMonthlySearches === 12000);
check('invisible: estMissed > 0', invisible.estMissed > 0);
check('invisible: revenueAtRisk = estMissed*12*5000', invisible.revenueAtRisk === Math.round(invisible.estMissed * 12 * 5000));
check('invisible: has "No website" gap', invisible.gaps.some(g => g.factor === 'No website'));
check('invisible: has social-only gap', invisible.gaps.some(g => g.factor === 'Social-only presence'));
check('invisible: severity critical', invisible.severity === 'critical');

// 2. Dominant: full stack, verified, 60 reviews, 4.8 stars, Abuja real estate.
const dominant = computeLocalVisibility({
  businessName: 'Prime Estates',
  category: 'real_estate', city: 'Abuja',
  haveWebsite: true, websiteResponsive: true,
  haveGoogleBusinessProfile: true, gbpVerified: true,
  gbpReviews: 60, gbpRating: 4.8,
  runPaidAds: false, socialOnly: false,
  avgCustomerValue: 250000, currency: 'NGN'
});
check('dominant: score >= 80', dominant.score >= 80);
check('dominant: findability=dominant', dominant.findability === 'dominant');
check('dominant: est searches Abuja real_estate = 8250', dominant.estMonthlySearches === Math.round(15000 * 0.55));
check('dominant: estMissed is a sliver (<200)', dominant.estMissed > 0 && dominant.estMissed < 200);
check('dominant: no critical gaps', !dominant.gaps.some(g => g.severity === 'critical'));

// 3. Findable (boundary): website + responsive + unverified GBP, Ibadan salon.
//     Scores 56 => classify as 'findable' (>=55). Verifies the boundary behaves.
const findableCase = computeLocalVisibility({
  businessName: 'Glow Studio',
  category: 'salon_barber', city: 'Ibadan',
  haveWebsite: true, websiteResponsive: true,
  haveGoogleBusinessProfile: true, gbpVerified: false,
  gbpReviews: 3, gbpRating: 4.0,
  runPaidAds: false, socialOnly: false,
  avgCustomerValue: 8000, currency: 'NGN'
});
check('findable: score 55-79', findableCase.score >= 55 && findableCase.score < 80);
check('findable: findability=findable', findableCase.findability === 'findable');
check('findable: has unverified-listing gap', findableCase.gaps.some(g => g.factor === 'Unverified listing'));

// 3b. Hard-to-find: website NON-responsive + unverified GBP, Port Harcourt gym.
//     Score = 18 (website) + 18 (GBP unverified) + 8 (not social-only) = 44 => hard-to-find.
const htf = computeLocalVisibility({
  businessName: 'Iron Hub',
  category: 'gym_fitness', city: 'Port Harcourt',
  haveWebsite: true, websiteResponsive: false,
  haveGoogleBusinessProfile: true, gbpVerified: false,
  gbpReviews: 0, gbpRating: 0,
  runPaidAds: false, socialOnly: false,
  avgCustomerValue: 15000, currency: 'NGN'
});
check('hard-to-find: score in 30-54 (got ' + htf.score + ')', htf.score >= 30 && htf.score < 55);
check('hard-to-find: findability=hard-to-find', htf.findability === 'hard-to-find');
check('hard-to-find: has unverified-listing gap', htf.gaps.some(g => g.factor === 'Unverified listing'));

// 4. Determinism: same input => same output.
const a = computeLocalVisibility({ businessName:'X', category:'other', city:'Kano', haveWebsite:true, websiteResponsive:true, haveGoogleBusinessProfile:true, gbpVerified:true, gbpReviews:20, gbpRating:4.5, runPaidAds:false, socialOnly:false, avgCustomerValue:1000, currency:'USD' });
const b = computeLocalVisibility({ businessName:'X', category:'other', city:'Kano', haveWebsite:true, websiteResponsive:true, haveGoogleBusinessProfile:true, gbpVerified:true, gbpReviews:20, gbpRating:4.5, runPaidAds:false, socialOnly:false, avgCustomerValue:1000, currency:'USD' });
check('deterministic: same result', JSON.stringify(a) === JSON.stringify(b));

// 5. Unknown city/unknown category fall back gracefully.
const fallback = computeLocalVisibility({ businessName:'Z', category:'cryptozoology', city:'atlantis', haveWebsite:true, websiteResponsive:true, haveGoogleBusinessProfile:true, gbpVerified:true, gbpReviews:5, gbpRating:3.0, runPaidAds:false, socialOnly:false, avgCustomerValue:1000, currency:'NGN' });
check('fallback: unknown category uses other=5000', fallback.estMonthlySearches === Math.round(5000 * 0.25));
check('fallback: low rating flagged', fallback.gaps.some(g => g.factor === 'Low star rating'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
