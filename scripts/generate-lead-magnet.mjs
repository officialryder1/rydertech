// Generates the RyderTech lead-magnet PDF:
// "2026 Website Cost Guide for Nigerian Businesses"
// Run: node scripts/generate-lead-magnet.mjs
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '..', 'static');
const outFile = path.join(outDir, 'website-cost-guide-nigeria.pdf');

const doc = new PDFDocument({ size: 'A4', margin: 50, info: {
  Title: '2026 Website Cost Guide for Nigerian Businesses',
  Author: 'RyderTech',
  Subject: 'Website pricing in Nigeria — what to expect and how to avoid overpaying'
}});

const stream = fs.createWriteStream(outFile);
doc.pipe(stream);

// Brand colors
const PRIMARY = '#2563eb';   // blue-600
const DARK = '#1e293b';      // slate-800
const MUTED = '#64748b';     // slate-500
const LIGHT = '#f1f5f9';     // slate-100

function h1(text) {
  doc.fontSize(22).fillColor(DARK).font('Helvetica-Bold');
  doc.text(text, { paragraphGap: 6 });
}
function h2(text) {
  doc.moveDown(0.4);
  doc.fontSize(14).fillColor(PRIMARY).font('Helvetica-Bold');
  doc.text(text, { paragraphGap: 4 });
}
function body(text) {
  doc.fontSize(11).fillColor(DARK).font('Helvetica');
  doc.text(text, { paragraphGap: 4, lineGap: 2 });
}
function bullet(text) {
  doc.fontSize(11).fillColor(DARK).font('Helvetica');
  doc.text('•  ' + text, { indent: 12, paragraphGap: 2, lineGap: 2 });
}
function range(label, value) {
  doc.fontSize(11).fillColor(DARK).font('Helvetica');
  doc.text(label, { continued: true, width: 280 });
  doc.font('Helvetica-Bold').fillColor(PRIMARY).text(value, { align: 'right' });
  doc.moveDown(0.2);
}

// --- Cover band ---
doc.rect(0, 0, doc.page.width, 150).fill(PRIMARY);
doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(24);
doc.text('2026 Website Cost Guide', 50, 45, { width: doc.page.width - 100 });
doc.fontSize(13).font('Helvetica');
doc.text('for Nigerian Businesses', 50, 78, { width: doc.page.width - 100 });
doc.moveDown(2.5);

body('A practical, no-fluff breakdown of what it really costs to build a website in Nigeria — from a ₦250k brochure site to a ₦5M+ custom platform. Learn what drives price, which payment gateways to use, and how to avoid the most common (and expensive) mistakes.');

doc.moveDown(0.5);
doc.fontSize(9).fillColor(MUTED).font('Helvetica-Oblique');
doc.text('Prepared by RyderTech — web design & software development for Nigerian businesses. rydertech.ng', { paragraphGap: 2 });

// --- Section 1: Typical price ranges ---
h2('1. Typical Price Ranges (2026)');
range('Brochure / small business site (1–5 pages)', 'NGN 250,000 – 500,000');
range('Corporate website (5–15 pages)', 'NGN 500,000 – 1,200,000');
range('E-commerce store (basic)', 'NGN 800,000 – 1,800,000');
range('E-commerce store (advanced / multi-vendor)', 'NGN 2,000,000 – 5,000,000+');
range('Custom web app / SaaS MVP', 'NGN 1,500,000 – 5,000,000+');
doc.moveDown(0.3);
body('Prices vary by scope, design complexity, and integrations. The ranges above are typical for professional Nigerian agencies — not the cheapest freelancers, and not offshore enterprise shops.');

// --- Section 2: What affects cost ---
h2('2. What Actually Drives the Price');
bullet('Number of pages & custom design vs. template');
bullet('Functionality: payments, bookings, dashboards, APIs');
bullet('E-commerce: catalogue size, logistics, local + international payments');
bullet('Content: copywriting, photography, and product uploads');
bullet('CMS choice: WordPress (cheaper/faster) vs. custom build (scalable)');
bullet('Ongoing: hosting, domain, maintenance, and support retainers');

// --- Section 3: Payment gateways ---
h2('3. Payment Gateways for Nigerian Sites');
bullet('Paystack — easy setup, cards + bank transfer, ~1.5% fees');
bullet('Flutterwave — multi-currency, wider African coverage');
bullet('Remita / bank transfer — common for B2B and invoicing');
bullet('International: Stripe/PayPal only work with foreign-currency accounts');
doc.moveDown(0.3);
body('Tip: Most Nigerian customers trust bank transfer and card via Paystack/Flutterwave more than unfamiliar processors. Budget for gateway setup in your quote.');

// --- Section 4: Hidden costs ---
h2('4. Hidden Costs People Forget');
bullet('Domain name: NGN 5,000 – 25,000/year');
bullet('Hosting: NGN 30,000 – 200,000/year (depends on traffic)');
bullet('SSL certificate: often free (Let’s Encrypt) but some charge');
bullet('Maintenance & updates: NGN 30,000 – 150,000/month retainer');
bullet('Content & SEO: often outsourced separately');
bullet('Revisions beyond the agreed scope');

// --- Section 5: how to avoid overpaying ---
h2('5. How to Avoid Overpaying');
bullet('Get 2–3 written quotes with clear scope, not just a price');
bullet('Insist on a fixed scope document before paying');
bullet('Pay in milestones (30/40/30) tied to deliverables');
bullet('Own your code, domain, and hosting accounts');
bullet('Avoid "free website" traps that lock you into high monthly fees');
bullet('Ask who maintains it after launch — budget for year one');

// --- Section 6: checklist ---
h2('6. Pre-Launch Checklist');
bullet('Domain registered & you control the account');
bullet(' Hosting + SSL configured');
bullet(' Mobile-responsive & tested on real phones');
bullet(' WhatsApp / contact integration live');
bullet(' Basic SEO + Google Search Console submitted');
bullet(' Analytics (privacy-compliant) installed');
bullet(' Payment gateway tested with a real transaction');

// --- Closing CTA band ---
doc.moveDown(1);
doc.rect(0, doc.y, doc.page.width, 110).fill(LIGHT);
doc.fillColor(DARK).font('Helvetica-Bold').fontSize(14);
doc.text('Want a Transparent Quote?', 50, doc.y + 18, { width: doc.page.width - 100 });
doc.fontSize(11).fillColor(MUTED).font('Helvetica');
doc.text('RyderTech delivers fixed-scope websites for Nigerian businesses — no surprises. Get a free estimate at rydertech.ng/contact or WhatsApp +234 903 314 7769.', 50, doc.y + 6, { width: doc.page.width - 100 });

doc.end();

stream.on('finish', () => {
  const { size } = fs.statSync(outFile);
  console.log(`PDF written: ${outFile} (${(size / 1024).toFixed(1)} KB)`);
});
