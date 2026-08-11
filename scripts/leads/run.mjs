// scripts/leads/run.mjs
// Lead researcher for RyderTech.
//
// Two input modes (combined into one leads.csv):
//   1. LIVE SCRAPE  - reads sources.json (public directory URLs) and extracts
//                     business name + website + city. No-key, but many NG
//                     directories are JS/Cloudflare protected, so results vary.
//   2. SEED LIST     - reads seed.csv (businesses YOU paste: name,website,city)
//                     and enriches each with a validated contact email.
//                     This is the reliable, legal path — you control the input.
//
// Output: scripts/leads/leads.csv  and  scripts/leads/leads.json
//   Columns: name, website, primaryEmail, allEmails, city, mxValid, source
//
// Usage:
//   node scripts/leads/run.mjs
//   node scripts/leads/run.mjs --no-scrape      # skip live sources, use seed only

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { scrapeSource } from './scrape.mjs';
import { enrichAll } from './enrich.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const noScrape = process.argv.includes('--no-scrape');

function csvEscape(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(rows) {
  const header = ['name', 'website', 'primaryEmail', 'allEmails', 'city', 'mxValid', 'segment', 'source'];
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push(
      [
        r.name,
        r.website,
        r.primaryEmail || '',
        (r.emails || []).join(' '),
        r.city || '',
        r.mxValid ? 'yes' : 'no',
        r.segment || 'general',
        r.source
      ]
        .map(csvEscape)
        .join(',')
    );
  }
  return lines.join('\n');
}

function parseSeedCsv(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  let currentSegment = 'general';
  const out = [];
  for (const line of lines) {
    if (line.startsWith('#')) {
      // A segment comment like `# --- ICP segment: events ---` sets the segment for following rows.
      const m = line.match(/ICP segment:\s*([a-z0-9 _-]+)/i);
      if (m) currentSegment = m[1].trim().toLowerCase().replace(/\s+/g, '_');
      continue;
    }
    const [name, website, city] = line.split(',').map((c) => c.trim());
    if (!website) continue;
    let domain = website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    out.push({ name: name || domain, website: domain, city: city || '', segment: currentSegment, source: 'seed.csv' });
  }
  return out;
}

async function main() {
  let all = [];

  // Mode 1: live scrape (optional)
  if (!noScrape) {
    try {
      const raw = await readFile(join(__dirname, 'sources.json'), 'utf8');
      const { sources } = JSON.parse(raw);
      console.log(`Scraping ${sources.length} live sources...`);
      for (const s of sources) {
        const listings = await scrapeSource(s.url);
        all.push(...listings);
      }
    } catch (e) {
      console.warn('No sources.json or scrape failed:', e.message);
    }
  } else {
    console.log('Skipping live scrape (--no-scrape).');
  }

  // Mode 2: seed list (reliable)
  try {
    const seedText = await readFile(join(__dirname, 'seed.csv'), 'utf8');
    const seed = parseSeedCsv(seedText);
    console.log(`Loaded ${seed.length} businesses from seed.csv.`);
    all.push(...seed);
  } catch {
    console.log('No seed.csv found — using live scrape only.');
  }

  // Dedupe by website domain
  const byDomain = new Map();
  for (const l of all) {
    const key = l.website.toLowerCase();
    if (!byDomain.has(key)) byDomain.set(key, l);
  }
  const unique = [...byDomain.values()];
  console.log(`Total ${all.length} raw -> ${unique.length} unique businesses.`);

  console.log('Enriching (MX validation)...');
  const enriched = await enrichAll(unique);
  enriched.sort((a, b) => {
    const rank = (v) => (v === 'yes' ? 2 : v === 'unknown' ? 1 : 0);
    return rank(b.mxValid) - rank(a.mxValid) || a.name.localeCompare(b.name);
  });

  const outCsv = join(__dirname, 'leads.csv');
  const outJson = join(__dirname, 'leads.json');
  await writeFile(outCsv, toCsv(enriched), 'utf8');
  await writeFile(outJson, JSON.stringify(enriched, null, 2), 'utf8');

  const reachable = enriched.filter((e) => e.mxValid).length;
  console.log(`\nDone. ${enriched.length} businesses, ${reachable} with a valid mail server.`);
  console.log(`Wrote: ${outCsv}`);
  console.log(`Wrote: ${outJson}`);
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
