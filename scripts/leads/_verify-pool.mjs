/** Throwaway pool-verification probe (delete after run). Reproduces ONLY the eligibility
 *  predicate of send-outreach.mjs, importing OUTREACH_PRIORITY from the canonical module
 *  so the segment list cannot diverge. Does NOT reproduce dailyBatch selection. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { OUTREACH_PRIORITY } from './outreach-templates.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const text = readFileSync(join(here, 'leads.csv'), 'utf8');
const [header, ...rows] = text.split('\n').map((l) => l.trim()).filter(Boolean);
const idx = {};
header.split(',').forEach((h, i) => (idx[h.trim()] = i));
const leads = rows.map((r) => {
  const cols = r.split(',');
  return { primaryEmail: cols[idx.primaryEmail], mxValid: cols[idx.mxValid], segment: cols[idx.segment] || 'general' };
});

const eligible = leads.filter((l) => OUTREACH_PRIORITY.includes(l.segment) && l.primaryEmail && l.mxValid === 'yes');
const state = JSON.parse(readFileSync(join(here, '.outreach-state.json'), 'utf8'));
const sentSet = new Set(state.sent.map((s) => s.email));

const remaining = eligible.filter((l) => !sentSet.has(l.primaryEmail));

const bySeg = {};
for (const l of leads) bySeg[l.segment] = (bySeg[l.segment] || 0) + 1;
// eligible unsent by segment
const remBySeg = {};
for (const l of remaining) remBySeg[l.segment] = (remBySeg[l.segment] || 0) + 1;

console.log('pool rows:', leads.length);
console.log('state entries:', state.sent.length, '| distinct emails:', sentSet.size);
console.log('eligible (priority+mxValid+email):', eligible.length);
console.log('remaining unsent eligible:', remaining.length);
console.log('segment breakdown (all rows):', JSON.stringify(bySeg));
console.log('remaining by segment:', JSON.stringify(remBySeg));
console.log('last state date:', state.sent[state.sent.length - 1].date);

const poolEmails = new Set(leads.map((l) => l.primaryEmail));
const orphans = [...sentSet].filter((e) => !poolEmails.has(e));
console.log('state emails absent from pool (must be 0):', orphans.length, orphans.join(','));

// why are non-eligible rows excluded?
const ineligible = leads.filter((l) => !(OUTREACH_PRIORITY.includes(l.segment) && l.primaryEmail && l.mxValid === 'yes'));
const reasons = {};
for (const l of ineligible) {
  const why = [];
  if (!OUTREACH_PRIORITY.includes(l.segment)) why.push(`segment=${l.segment}`);
  if (!l.primaryEmail) why.push('no-email');
  if (l.mxValid !== 'yes') why.push(`mxValid=${l.mxValid}`);
  const k = why.join('+');
  reasons[k] = (reasons[k] || 0) + 1;
}
console.log('ineligible rows and reasons:', JSON.stringify(reasons), '| total ineligible:', ineligible.length);

if (remaining.length) console.log('UNSENT ELIGIBLE:', remaining.map((l) => `${l.primaryEmail} (${l.segment})`).join(' | '));
