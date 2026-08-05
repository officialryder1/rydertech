// scripts/leads/enrich.mjs
// For each business website, guess a likely contact email and check whether
// the domain can receive mail (MX record lookup). No email is sent.
//
// NOTE: MX lookup needs outbound DNS. In sandboxed environments without DNS
// egress, lookups fail with ECONNREFUSED — we record mxValid:'unknown' and
// still emit the guessed emails so the list stays usable.

import dns from 'node:dns/promises';

const LOCAL_PARTS = ['info', 'hello', 'admin', 'contact', 'sales', 'support'];

// Guess candidate emails for a domain (we validate MX, not the address).
export function guessEmails(domain) {
  const d = domain.toLowerCase().replace(/^www\./, '');
  return LOCAL_PARTS.map((p) => `${p}@${d}`);
}

// Does the domain have mail servers? Returns 'yes' | 'no' | 'unknown'.
export async function hasMailServer(domain, { timeoutMs = 8000 } = {}) {
  const t = setTimeout(() => {}, timeoutMs); // no-op timer; dns has its own timeout
  try {
    const records = await dns.resolveMx(domain);
    clearTimeout(t);
    return Array.isArray(records) && records.length > 0 ? 'yes' : 'no';
  } catch (err) {
    clearTimeout(t);
    // ECONNREFUSED / ENOTFOUND / timeout => DNS unavailable in this env.
    if (err && (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.code === 'EAI_AGAIN')) {
      return 'unknown';
    }
    return 'no';
  }
}

// Enrich a single listing. Adds: emails[], mxValid, primaryEmail.
export async function enrichListing(listing) {
  const domain = listing.website.toLowerCase().replace(/^www\./, '');
  const emails = guessEmails(domain);
  let mxValid = 'unknown';
  try {
    mxValid = await hasMailServer(domain);
  } catch {
    mxValid = 'unknown';
  }
  // Always emit a primary guess; prefer it when MX says the domain can receive.
  const primaryEmail = mxValid === 'no' ? '' : emails[0];
  return {
    ...listing,
    emails,
    primaryEmail,
    mxValid
  };
}

// Enrich many listings with limited concurrency.
export async function enrichAll(listings, { concurrency = 8 } = {}) {
  const out = [];
  let i = 0;
  async function worker() {
    while (i < listings.length) {
      const idx = i++;
      const enriched = await enrichListing(listings[idx]);
      out.push(enriched);
      process.stdout.write('.');
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, listings.length) }, worker);
  await Promise.all(workers);
  process.stdout.write('\n');
  return out;
}
