/**
 * Nigerian Payment Gateway Fee & Payout Speed Calculator Engine
 * Pure functions — no DOM, no network. Unit-testable.
 */

export interface GatewayInput {
  monthlyVolume: number; // in NGN
  avgTicket: number; // in NGN
  transferPct: number; // 0-100 share of bank transfers / virtual accounts
  cardPct: number; // 0-100 share of local debit/credit cards
  intCardPct: number; // 0-100 share of international cards
}

export interface GatewayResultItem {
  id: 'paystack' | 'flutterwave' | 'monnify' | 'interswitch';
  name: string;
  monthlyFee: number;
  annualFee: number;
  effectiveRatePct: number;
  payoutSpeed: string;
  settlementReliability: 'High' | 'Very High' | 'Moderate';
  pros: string[];
  cons: string[];
  recommendedFor: string;
}

export interface EngineResult {
  monthlyVolume: number;
  totalTransactionsPerMonth: number;
  gateways: GatewayResultItem[];
  cheapestGateway: GatewayResultItem;
  fastestGateway: GatewayResultItem;
  maxAnnualSavings: number;
  verdict: string;
  recommendations: string[];
}

const USD_TO_NGN = 1500; // estimated exchange rate for international fees

export function calculateGateways(input: GatewayInput): EngineResult {
  const monthlyVolume = Math.max(0, input.monthlyVolume);
  const avgTicket = Math.max(500, input.avgTicket);
  const totalTx = avgTicket > 0 ? Math.round(monthlyVolume / avgTicket) : 0;

  const transferShare = Math.max(0, Math.min(100, input.transferPct)) / 100;
  const cardShare = Math.max(0, Math.min(100, input.cardPct)) / 100;
  const intShare = Math.max(0, Math.min(100, input.intCardPct)) / 100;

  // Normalize shares if they don't sum to 100%
  const totalShare = transferShare + cardShare + intShare;
  const tShare = totalShare > 0 ? transferShare / totalShare : 0.5;
  const cShare = totalShare > 0 ? cardShare / totalShare : 0.4;
  const iShare = totalShare > 0 ? intShare / totalShare : 0.1;

  const transferVol = monthlyVolume * tShare;
  const cardVol = monthlyVolume * cShare;
  const intVol = monthlyVolume * iShare;

  const transferTx = avgTicket > 0 ? transferVol / avgTicket : 0;
  const cardTx = avgTicket > 0 ? cardVol / avgTicket : 0;
  const intTx = avgTicket > 0 ? intVol / avgTicket : 0;

  // 1. PAYSTACK
  // Transfer/Card local: 1.5% + 100 NGN if > 2500 (flat waived if <= 2500)
  // Int: 3.9% + $1 (~1500 NGN)
  const paystackTransferFee = transferVol * 0.015 + transferTx * (avgTicket > 2500 ? 100 : 0);
  const paystackCardFee = cardVol * 0.015 + cardTx * (avgTicket > 2500 ? 100 : 0);
  const paystackIntFee = intVol * 0.039 + intTx * (1 * USD_TO_NGN);
  const paystackMonthly = paystackTransferFee + paystackCardFee + paystackIntFee;

  // 2. FLUTTERWAVE
  // Local: 1.4% + flat fee rules
  const flwTransferFee = transferVol * 0.014 + transferTx * 50;
  const flwCardFee = cardVol * 0.014;
  const flwIntFee = intVol * 0.038 + intTx * (1 * USD_TO_NGN);
  const flwMonthly = flwTransferFee + flwCardFee + flwIntFee;

  // 3. MONNIFY
  // Specialized in bank transfers: 1% capped at 1000 NGN for transfers. Cards: 1.5% + 100 NGN
  const monnifyTransferFee = transferVol * 0.01; // typically capped per tx
  const monnifyCardFee = cardVol * 0.015 + cardTx * 100;
  const monnifyIntFee = intVol * 0.04; // higher int card
  const monnifyMonthly = monnifyTransferFee + monnifyCardFee + monnifyIntFee;

  // 4. INTERSWITCH (WebPay)
  // Local: 1.5% + 100 NGN flat
  const iswTransferFee = transferVol * 0.015 + transferTx * 100;
  const iswCardFee = cardVol * 0.015 + cardTx * 100;
  const iswIntFee = intVol * 0.045;
  const iswMonthly = iswTransferFee + iswCardFee + iswIntFee;

  const gateways: GatewayResultItem[] = [
    {
      id: 'paystack',
      name: 'Paystack',
      monthlyFee: Math.round(paystackMonthly),
      annualFee: Math.round(paystackMonthly * 12),
      effectiveRatePct: monthlyVolume > 0 ? Number(((paystackMonthly / monthlyVolume) * 100).toFixed(2)) : 1.5,
      payoutSpeed: 'T+1 (Next working day)',
      settlementReliability: 'Very High',
      pros: ['Industry-gold-standard API & uptime', 'Robust developer tooling & plugins', 'Seamless international card processing'],
      cons: ['Flat fee per transaction adds up on low-ticket items', 'Standard local rate (1.5%)'],
      recommendedFor: 'SaaS, digital products, and businesses needing world-class developer SDKs & clean checkout.'
    },
    {
      id: 'monnify',
      name: 'Monnify',
      monthlyFee: Math.round(monnifyMonthly),
      annualFee: Math.round(monnifyMonthly * 12),
      effectiveRatePct: monthlyVolume > 0 ? Number(((monnifyMonthly / monthlyVolume) * 100).toFixed(2)) : 1.0,
      payoutSpeed: 'Instant / T+0',
      settlementReliability: 'High',
      pros: ['Lowest fees for bank transfers & virtual accounts', 'Instant settlement into commercial bank accounts', 'Excellent for heavy local collection models'],
      cons: ['Card payment integration is less robust than Paystack', 'International card support is limited'],
      recommendedFor: 'E-commerce, schools, religious institutions, and businesses with 70%+ bank transfer volume.'
    },
    {
      id: 'flutterwave',
      name: 'Flutterwave',
      monthlyFee: Math.round(flwMonthly),
      annualFee: Math.round(flwMonthly * 12),
      effectiveRatePct: monthlyVolume > 0 ? Number(((flwMonthly / monthlyVolume) * 100).toFixed(2)) : 1.4,
      payoutSpeed: 'T+1',
      settlementReliability: 'High',
      pros: ['Competitive percentage rates (1.4%)', 'Strong pan-African payout rails', 'Multiple currency support'],
      cons: ['Occasional merchant support bottlenecks', 'Dashboard complexity'],
      recommendedFor: 'Pan-African e-commerce and merchants looking to squeeze marginal percentage points on card volume.'
    },
    {
      id: 'interswitch',
      name: 'Interswitch (WebPay)',
      monthlyFee: Math.round(iswMonthly),
      annualFee: Math.round(iswMonthly * 12),
      effectiveRatePct: monthlyVolume > 0 ? Number(((iswMonthly / monthlyVolume) * 100).toFixed(2)) : 1.6,
      payoutSpeed: 'T+1',
      settlementReliability: 'Moderate',
      pros: ['Deep enterprise banking ties in Nigeria', 'Direct Verve & local card processing'],
      cons: ['Legacy integration experience', 'Higher setup and maintenance friction'],
      recommendedFor: 'Legacy enterprise corporations and government institutions.'
    }
  ];

  // Sort by annual fee ascending
  gateways.sort((a, b) => a.annualFee - b.annualFee);

  const cheapest = gateways[0];
  const mostExpensive = gateways[gateways.length - 1];
  const maxSavings = Math.max(0, mostExpensive.annualFee - cheapest.annualFee);

  const fastest = gateways.find((g) => g.id === 'monnify') || cheapest;

  let verdict = `At ₦${monthlyVolume.toLocaleString()} monthly volume, switching your primary collection to ${cheapest.name} saves up to ₦${maxSavings.toLocaleString()} annually in processing fees.`;
  if (tShare > 0.6) {
    verdict = `With over 60% of your volume in bank transfers, Monnify or optimized routing saves you significant fee capping compared to card-heavy gateways.`;
  } else if (iShare > 0.2) {
    verdict = `With significant international card volume (${Math.round(iShare * 100)}%), Paystack provides the most stable foreign exchange settlement and low failure rates.`;
  }

  const recommendations = [
    `Route bank transfers through ${tShare > 0.5 ? 'Monnify' : 'Paystack/Monnify'} to leverage lower percentage caps.`,
    `Implement automated reconciliation webhooks in SvelteKit/Supabase to instantly verify payments without manual admin checks.`,
    `For high-volume merchants (>₦20m/mo), negotiate custom enterprise pricing directly with gateway account managers.`,
    `RyderTech can architect a multi-gateway failover routing system so your checkout never drops a transaction during downtime.`
  ];

  return {
    monthlyVolume,
    totalTransactionsPerMonth: Math.round(totalTx),
    gateways,
    cheapestGateway: cheapest,
    fastestGateway: fastest,
    maxAnnualSavings: maxSavings,
    verdict,
    recommendations
  };
}
