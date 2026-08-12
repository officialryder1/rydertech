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

export type ToolId = 'revleak' | 'event-risk' | 'ops-drain';

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
