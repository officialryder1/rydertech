// scripts/leads/scrape.mjs
// Fetches a public Nigerian business listing page and extracts
// candidate businesses: { name, website, city, source }.
// No API key required. Uses only built-in fetch (Node 18+).

const CITY_HINTS = [
  'lagos', 'abuja', 'fct', 'port harcourt', 'ph', 'ibadan', 'kano',
  'benin', 'aba', 'onitsha', 'enugu', 'kaduna', 'jos', 'ilorin',
  'abeokuta', 'warri', 'calabar', 'uyo', 'owerri', 'aba'
];

// Extract a likely city from free text.
export function detectCity(text = '') {
  const t = text.toLowerCase();
  for (const c of CITY_HINTS) {
    if (t.includes(c)) return c === 'ph' ? 'port harcourt' : c === 'fct' ? 'abuja' : c;
  }
  return '';
}

// Pull clean visible business names from a listing page.
// Strategy: collect <a> tags that point to an external site, use their
// link text (or nearest heading) as the business name.
export function extractListings(html, sourceUrl) {
  const listings = [];
  const seen = new Set();

  // Match <a ... href="URL" ...>TEXT</a>  (single-line tolerant)
  const aRe = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = aRe.exec(html)) !== null) {
    const href = m[1];
    const rawText = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    // Only external links (skip in-page anchors, relative, mailto, tel)
    if (!/^https?:\/\//i.test(href)) continue;
    if (/google|facebook|twitter|instagram|linkedin|whatsapp|wa\.me/i.test(href)) continue;

    const domain = safeDomain(href);
    if (!domain) continue;
    if (isCommonDirectory(domain)) continue; // skip the directory's own domain

    const name = rawText || domain;
    if (name.length < 2 || name.length > 80) continue;

    const key = domain.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    listings.push({
      name,
      website: domain,
      city: detectCity(rawText + ' ' + sourceUrl),
      source: sourceUrl
    });
  }
  return listings;
}

export function safeDomain(url) {
  try {
    const u = new URL(url);
    let h = u.hostname.replace(/^www\./, '');
    // keep only second-level + tld (drop subdomains for grouping, but keep full host for output)
    return h;
  } catch {
    return '';
  }
}

function isCommonDirectory(domain) {
  const d = domain.toLowerCase();
  return /(google|bing|facebook|instagram|linkedin|twitter|wikipedia|youtube|t\.co|bit\.ly|goo\.gl|amazon|tripadvisor)\./.test(d);
}

// Fetch + parse one source URL. Returns array of listings.
export async function scrapeSource(sourceUrl, { timeoutMs = 15000 } = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(sourceUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; RyderTechLeadResearcher/1.0; +https://rydertech.ng)'
      }
    });
    if (!res.ok) {
      console.warn(`  ! ${sourceUrl} -> HTTP ${res.status}`);
      return [];
    }
    const html = await res.text();
    const listings = extractListings(html, sourceUrl);
    console.log(`  ✓ ${sourceUrl} -> ${listings.length} listings`);
    return listings;
  } catch (err) {
    console.warn(`  ! ${sourceUrl} -> ${err.name === 'AbortError' ? 'timeout' : err.message}`);
    return [];
  } finally {
    clearTimeout(t);
  }
}
