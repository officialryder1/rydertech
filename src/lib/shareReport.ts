/**
 * shareReport.ts — uniform "shareable branded audit report" payload + encode/decode.
 *
 * Each lead-magnet tool builds a ReportPayload from its engine result, then we
 * base64url-encode it into a short URL (e.g. /labs/share?d=XXXX). The /labs/share
 * route decodes and renders a one-page on-brand report (screenshot / share / print).
 *
 * Pure + SSR-safe: encode/decode use only btoa/atob (browser) with a UTF-8 safe
 * wrapper; no DOM, no network. Kept tiny so the URL stays shareable.
 */

export type ToolId = 'revleak' | 'event-risk' | 'ops-drain' | 'visibility' | 'aeo' | 'clausescan' | 'gateway-calc' | 'gpt6-checker' | 'headline-studio' | 'content-repurposer';

export interface ReportRow {
  label: string;
  value: string;
  /** optional emphasis: 'good' | 'bad' tints the row */
  tone?: 'good' | 'bad' | 'neutral';
}

export interface ReportPayload {
  tool: ToolId;
  /** display title, e.g. "Revenue Leak Audit" */
  title: string;
  /** the single headline metric shown big */
  heroLabel: string;
  heroValue: string;
  heroTone?: 'good' | 'bad' | 'neutral';
  /** 1-line plain-language verdict */
  verdict: string;
  /** supporting rows */
  rows: ReportRow[];
  /** what RyderTech would do (2-4 bullets) */
  recommendations: string[];
  /** currency hint for formatting, optional */
  currency?: 'NGN' | 'USD';
  /** ISO date the audit was run */
  generatedAt: string;
  /** host tool URL so the report links back */
  sourceUrl: string;
}

// ---- UTF-8 safe base64url (works in browser + Node 18+) ----
function toB64Url(str: string): string {
  const b64 = btoa(unescape(encodeURIComponent(str)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64Url(b64url: string): string {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  return decodeURIComponent(escape(atob(b64)));
}

export function encodeReport(p: ReportPayload): string {
  return toB64Url(JSON.stringify(p));
}

export function decodeReport(d: string): ReportPayload | null {
  try {
    const obj = JSON.parse(fromB64Url(d));
    if (!obj || !obj.tool || !obj.title) return null;
    return obj as ReportPayload;
  } catch {
    return null;
  }
}

export function buildShareUrl(p: ReportPayload): string {
  return `/labs/share?d=${encodeReport(p)}`;
}

// ---- Per-tool builders (import the engine result types) ----

import type { EngineResult as RevLeakResult } from './revLeak';
import type { EngineResult as EventRiskResult } from './eventAccessRisk';
import { formatMoney } from './opsDrain';
import type { EngineResult as OpsDrainResult } from './opsDrain';
import type { EngineResult as LocalVisibilityResult } from './localVisibility';
import type { EngineResult as AeoResult } from './aeoReadiness';
import type { SummaryResult } from './clauseScan';
import type { EngineResult as GatewayCalcResult } from './gatewayCalc';
import { severityLabel } from './clauseScan';

const todayIso = () => new Date().toISOString().slice(0, 10);

export function reportFromRevLeak(r: RevLeakResult, currency: 'NGN' | 'USD'): ReportPayload {
  const money = (n: number) => formatMoney(n, currency);
  return {
    tool: 'revleak',
    title: 'Revenue Leak Audit',
    heroLabel: 'Revenue lost per year to a slow site',
    heroValue: money(r.annualLeak),
    heroTone: r.severity === 'critical' || r.severity === 'high' ? 'bad' : 'neutral',
    verdict: r.verdict,
    rows: [
      { label: 'Conversion lost to slow load', value: `${r.lostConversionPct}%`, tone: 'bad' },
      { label: 'Orders lost / month', value: `${r.lostOrdersPerMonth.toLocaleString()}`, tone: 'bad' },
      { label: 'Monthly revenue leak', value: money(r.monthlyLeak), tone: 'bad' },
      { label: 'Recoverable / year', value: money(r.recoverableAnnual), tone: 'good' }
    ],
    recommendations: r.enhancements.slice(0, 4),
    currency,
    generatedAt: todayIso(),
    sourceUrl: 'https://rydertech.ng/labs/revleak'
  };
}

export function reportFromEventRisk(r: EventRiskResult, currency: 'NGN' | 'USD'): ReportPayload {
  const money = (n: number) => formatMoney(n, currency);
  return {
    tool: 'event-risk',
    title: 'Event Access Risk Audit',
    heroLabel: 'Revenue exposed at the gate',
    heroValue: money(r.revenueAtRisk),
    heroTone: r.severity === 'critical' || r.severity === 'high' ? 'bad' : 'neutral',
    verdict: r.verdict,
    rows: [
      { label: 'Gate queue (current method)', value: `${r.gateTimeMin} min`, tone: 'bad' },
      { label: 'With QR verification', value: `${r.gateTimeMinQr} min`, tone: 'good' },
      { label: 'Guests slipping in free', value: `${r.gatecrashPct}% (${r.exposedGuests.toLocaleString()})`, tone: 'bad' },
      { label: 'Staffing saving (QR)', value: money(r.staffingDelta), tone: 'good' }
    ],
    recommendations: r.enhancements.slice(0, 4),
    currency,
    generatedAt: todayIso(),
    sourceUrl: 'https://rydertech.ng/labs/event-access-risk'
  };
}

export function reportFromOpsDrain(r: OpsDrainResult, currency: 'NGN' | 'USD'): ReportPayload {
  const money = (n: number) => formatMoney(n, currency);
  return {
    tool: 'ops-drain',
    title: 'Ops Drain Audit',
    heroLabel: 'Annual cost of manual processes',
    heroValue: money(r.totalAnnualCost),
    heroTone: r.severity === 'critical' || r.severity === 'high' ? 'bad' : 'neutral',
    verdict:
      r.paybackMonths === null
        ? 'Automation does not yet pay back at this saving rate — but the recovered time is real.'
        : `Automation pays for itself in ${r.paybackMonths} months at ${r.firstYearRoiPct}% first-year ROI.`,
    rows: [
      { label: 'Staff-days lost / year', value: `${Math.round(r.recoverableAnnualHours / 8).toLocaleString()} days`, tone: 'bad' },
      { label: 'Recoverable cost / year', value: money(r.recoverableAnnualCost), tone: 'good' },
      { label: 'Net annual saving', value: money(r.netAnnualSaving), tone: 'good' },
      { label: 'Payback period', value: r.paybackMonths === null ? '—' : `${r.paybackMonths} mo`, tone: 'neutral' }
    ],
    recommendations: [
      'Custom workflow automation — API-first backend replacing the manual handoffs.',
      'Central ops dashboard so the recovered time stays recovered.',
      'Phased build: highest-ROI task first, measured against this baseline.'
    ],
    currency,
    generatedAt: todayIso(),
    sourceUrl: 'https://rydertech.ng/labs/ops-drain'
  };
}

export function reportFromLocalVisibility(
  r: LocalVisibilityResult,
  currency: 'NGN' | 'USD',
  businessName: string
): ReportPayload {
  const money = (n: number) => formatMoney(n, currency);
  const findLabel = r.findability.charAt(0).toUpperCase() + r.findability.slice(1);
  return {
    tool: 'visibility',
    title: 'Local Visibility Audit',
    heroLabel: 'Local visibility score',
    heroValue: `${r.score}/100`,
    heroTone: r.score < 55 ? 'bad' : 'neutral',
    verdict: r.verdict || `${businessName || 'Your business'} — see the gaps below.`,
    rows: [
      { label: 'Findability', value: findLabel, tone: r.score < 30 ? 'bad' : r.score < 55 ? 'bad' : 'neutral' },
      { label: 'Est. local searches / mo', value: r.estMonthlySearches.toLocaleString(), tone: 'neutral' },
      { label: 'Customers lost / mo', value: r.estMissed.toLocaleString(), tone: 'bad' },
      { label: 'Revenue left on table / yr', value: money(r.revenueAtRisk), tone: 'bad' }
    ],
    recommendations: r.enhancements.slice(0, 4),
    currency,
    generatedAt: todayIso(),
    sourceUrl: 'https://rydertech.ng/labs/visibility'
  };
}

export function reportFromAeo(
  r: AeoResult,
  currency: 'NGN' | 'USD',
  businessName: string
): ReportPayload {
  const money = (n: number) => formatMoney(n, currency);
  const readLabel = r.readiness.charAt(0).toUpperCase() + r.readiness.slice(1);
  return {
    tool: 'aeo',
    title: 'AI Search Readiness Audit',
    heroLabel: 'AI-search readiness score',
    heroValue: `${r.score}/100`,
    heroTone: r.score < 55 ? 'bad' : 'neutral',
    verdict: r.verdict,
    rows: [
      { label: 'Readiness', value: readLabel, tone: r.score < 30 ? 'bad' : r.score < 55 ? 'bad' : 'neutral' },
      { label: 'Est. answer surfaces / mo', value: r.estMonthlyAnswers.toLocaleString(), tone: 'neutral' },
      { label: 'Citations missed / mo', value: r.estMissed.toLocaleString(), tone: 'bad' },
      { label: 'Revenue left on table / yr', value: money(r.revenueAtRisk), tone: 'bad' }
    ],
    recommendations: r.enhancements.slice(0, 4),
    currency,
    generatedAt: todayIso(),
    sourceUrl: 'https://rydertech.ng/labs/aeo-readiness'
  };
}

export function reportFromClauseScan(r: SummaryResult): ReportPayload {
  const worst = r.topRisks[0];
  const heroTone = r.severity === 'critical' || r.severity === 'high' ? 'bad' : 'neutral';
  return {
    tool: 'clausescan',
    title: 'Contract Risk Scan',
    heroLabel: 'Contract risk score',
    heroValue: `${r.riskScore}/100`,
    heroTone,
    verdict: r.verdict || severityCopyLocal(r.severity),
    rows: [
      { label: 'Risk band', value: severityLabel(r.severity), tone: heroTone === 'bad' ? 'bad' : 'neutral' },
      { label: 'Clauses assessed', value: `${r.clauseCount}`, tone: 'neutral' },
      {
        label: 'Top risk',
        value: worst ? `${worst.clause} (${severityLabel(worst.severity)})` : '—',
        tone: worst && (worst.severity === 'critical' || worst.severity === 'high') ? 'bad' : 'neutral'
      },
      { label: 'What it means', value: worst ? worst.risk : 'Balanced contract', tone: heroTone === 'bad' ? 'bad' : 'good' }
    ],
    recommendations: [
      'Full ClauseScan report flags every risk + gives you redline wording.',
      'Have a lawyer review the critical/high clauses before you sign.',
      'Negotiate mutual liability & termination — not one-sided.',
      'Book a scope call and RyderTech can automate your contract intake.'
    ],
    generatedAt: todayIso(),
    sourceUrl: 'https://rydertech.ng/labs/clausescan'
  };
}

function severityCopyLocal(s: SummaryResult['severity']): string {
  switch (s) {
    case 'critical':
      return 'Critical exposure — some clauses could cost you dearly.';
    case 'high':
      return 'High risk — renegotiate the flagged clauses before signing.';
    case 'moderate':
      return 'Moderate risk — a few one-sided terms worth pushing back on.';
    default:
      return 'Low risk — mostly balanced, with minor items to note.';
  }
}

export function reportFromGatewayCalc(r: GatewayCalcResult, currency: 'NGN' | 'USD'): ReportPayload {
  const money = (n: number) => formatMoney(n, currency);
  return {
    tool: 'gateway-calc',
    title: 'Payment Gateway Fee Audit',
    heroLabel: 'Max potential annual savings',
    heroValue: money(r.maxAnnualSavings),
    heroTone: r.maxAnnualSavings > 50000 ? 'good' : 'neutral',
    verdict: r.verdict,
    rows: [
      { label: 'Monthly Volume', value: money(r.monthlyVolume), tone: 'neutral' },
      { label: 'Cheapest Gateway', value: r.cheapestGateway.name, tone: 'good' },
      { label: 'Cheapest Annual Fee', value: money(r.cheapestGateway.annualFee), tone: 'good' },
      { label: 'Fastest Payout', value: r.fastestGateway.name, tone: 'neutral' }
    ],
    recommendations: r.recommendations.slice(0, 4),
    currency,
    generatedAt: todayIso(),
    sourceUrl: 'https://rydertech.ng/labs/gateway-calc'
  };
}

// ---- GPT-6 Checker ----
import type { Gpt6Result } from './gpt6Checker';

export function reportFromGpt6(r: Gpt6Result, businessName: string): ReportPayload {
  const levelEmoji = r.score >= 80 ? '🟢' : r.score >= 60 ? '🟡' : r.score >= 35 ? '🟠' : '🔴';
  return {
    tool: 'gpt6-checker',
    title: 'GPT-6 Readiness Audit',
    heroLabel: 'Readiness score',
    heroValue: `${r.score}/100`,
    heroTone: r.score >= 70 ? 'good' : r.score >= 40 ? 'neutral' : 'bad',
    verdict: `${levelEmoji} ${businessName || 'Your business'} — ${r.verdict}`,
    rows: [
      { label: 'Readiness level', value: r.levelLabel, tone: r.score >= 70 ? 'good' : r.score >= 40 ? 'neutral' : 'bad' },
      { label: 'Efficiency gain', value: r.efficiencyGain, tone: 'good' },
      { label: 'Cost reduction', value: r.costReduction, tone: 'good' },
      { label: 'Adoption timeline', value: r.adoptionTimeline, tone: 'neutral' }
    ],
    recommendations: r.nextSteps.slice(0, 4),
    generatedAt: todayIso(),
    sourceUrl: 'https://rydertech.ng/labs/gpt-6-checker'
  };
}

// ---- Headline Studio ----
import type { HeadlineResult } from './headlineStudio';

export function reportFromHeadlineStudio(r: HeadlineResult, topic: string): ReportPayload {
  const topScore = r.topPicks[0]?.clickbaitScore ?? 0;
  return {
    tool: 'headline-studio',
    title: 'Headline Studio Report',
    heroLabel: 'Best headline score',
    heroValue: `${topScore}/100`,
    heroTone: topScore >= 70 ? 'good' : topScore >= 40 ? 'neutral' : 'bad',
    verdict: topScore >= 70
      ? `Strong headlines — your topic "${topic}" is primed for clicks.`
      : `Headline opportunity — tweak the formula and test variants.`,
    rows: [
      { label: 'Total headlines generated', value: `${r.headlines.length}`, tone: 'neutral' },
      { label: 'Average score', value: `${Math.round(r.headlines.reduce((a, h) => a + h.clickbaitScore, 0) / r.headlines.length)}/100`, tone: 'neutral' },
      { label: 'Best headline', value: r.topPicks[0]?.text.slice(0, 80) || '—', tone: 'good' },
      { label: 'Top style', value: r.topPicks[0] ? STYLE_LABELS_SHORT[r.topPicks[0].style] : '—', tone: 'neutral' }
    ],
    recommendations: [
      'Test your top 3 headlines A/B-style and measure CTR on each platform.',
      'Use curiosity + numbers for the highest-scoring formula on your audience.',
      'Repurpose the winning formula across email, social, and ads.',
      'Try the AI Content Repurposer to expand your piece across 6 platforms.'
    ],
    generatedAt: todayIso(),
    sourceUrl: 'https://rydertech.ng/labs/headline-studio'
  };
}

// ---- Content Repurposer ----
import type { RepurposedPost } from '$lib/content-repurposer/types';

export function reportFromContentRepurposer(posts: RepurposedPost[], sourceContent: string): ReportPayload {
  const platformList = [...new Set(posts.map(p => p.platform))];
  return {
    tool: 'content-repurposer',
    title: 'Content Repurposer Report',
    heroLabel: 'Platforms covered',
    heroValue: `${platformList.length}`,
    heroTone: platformList.length >= 4 ? 'good' : 'neutral',
    verdict: `Generated ${posts.length} platform-native posts from your source content.`,
    rows: [
      { label: 'Source length', value: `${sourceContent.length} chars`, tone: 'neutral' },
      { label: 'Posts generated', value: `${posts.length}`, tone: 'good' },
      { label: 'Platforms', value: platformList.join(', '), tone: 'neutral' },
      { label: 'Avg post length', value: `${Math.round(posts.reduce((a, p) => a + p.estimatedCharacterCount, 0) / posts.length)} chars`, tone: 'neutral' }
    ],
    recommendations: [
      'Publish the LinkedIn and Twitter posts within 48h of your original content.',
      'Tailor each post with platform-native hashtags and mentions.',
      'Use the AI Headline Studio to craft hooks for your next piece.',
      'Track engagement per platform and double down on the winners.'
    ],
    generatedAt: todayIso(),
    sourceUrl: 'https://rydertech.ng/labs/content-repurposer'
  };
}

const STYLE_LABELS_SHORT: Record<string, string> = {
  curiosity: 'Curiosity',
  'how-to': 'How-To',
  question: 'Question',
  listicle: 'Listicle',
  breaking: 'Breaking',
  command: 'Command',
  'problem-agitate': 'PAS',
  'benefit-driven': 'Benefit-Driven',
  'social-proof': 'Social Proof',
  'fear-scarcity': 'Fear/Scarcity'
};
