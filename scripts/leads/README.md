# RyderTech Lead Researcher

Find Nigerian businesses that likely need AI/web work, and produce a
reachable contact list.

## What it does
1. **Live scrape** (optional) — fetches public Nigerian business directory
   pages from `sources.json` and extracts business name + website + city.
   No API key. *Caveat:* many NG directories are JS-rendered / Cloudflare-
   protected / dead, so live results vary. Use as a bonus, not the core.
2. **Seed list** (reliable) — reads `seed.csv` (businesses YOU paste:
   `name,website,city`). This is the clean, legal, dependable path.
3. **Enrich** — for each domain, guesses `info@ / hello@ / admin@ / contact@
   / sales@ / support@` and runs an **MX lookup** to confirm the domain can
   receive mail (when DNS egress is available).
4. **Output** — `leads.csv` + `leads.json` with columns:
   `name, website, primaryEmail, allEmails, city, mxValid, source`

## Usage
```bash
node scripts/leads/run.mjs            # scrape sources.json + seed.csv
node scripts/leads/run.mjs --no-scrape # seed.csv only (recommended)
```

## Building your seed list
Paste businesses from anywhere you already browse: LinkedIn, a trade
association, a directory you can open in a browser, event attendee lists.
One per line in `seed.csv`:
```
Business Name,https://their-site.com,City
```
Lines starting with `#` are ignored.

## Honest caveats
- **Guessed emails are not verified per-address** — only the domain's mail
  server is checked (MX). Always personalize + verify before sending.
- **No bulk email is sent** by this tool. It only builds a list.
- **Respect privacy & anti-spam law** (Nigeria NDPR, CAN-SPAM, GDPR if EU).
  Cold outreach should be relevant, identified, and easy to opt out of.
- **Live scrape may be blocked** by target sites; that's expected.
- **MX validation needs outbound DNS.** In sandboxed CI without DNS egress
  it returns `unknown` — run locally or on a host with network for real
  `yes`/`no` values.

## Output file
`scripts/leads/leads.csv` — open in Excel/Sheets, filter by `mxValid`,
start with `primaryEmail`.
