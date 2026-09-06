/**
 * GPT-6 Checker Engine
 * Scores business readiness for GPT-6-style AI agent adoption.
 *
 * Pure, deterministic, SSR-safe. No DOM, no network.
 * Returns a score + tailored recommendations.
 */

export interface Gpt6Input {
  /** Company size: 1-10 employees */
  companySize: number;
  /** How technical is the team? 1 (non-tech) to 5 (ML engineers) */
  technicalMaturity: number;
  /** Do they use AI/ChatGPT already? yes/no */
  currentAiUsage: 'none' | 'chatgpt' | 'api' | 'enterprise';
  /** What kind of work is most common? */
  workType: 'creative' | 'analytical' | 'operational' | 'customer-facing' | 'research';
  /** Data maturity: is data centralized & accessible? */
  dataReadiness: 'none' | 'some' | 'centralized' | 'ml-ready';
  /** Budget allocated for AI projects this year (in USD) */
  aiBudgetUsd: number;
  /** How fast do they need results? */
  urgency: 'exploring' | 'testing' | 'urgent';
}

export type ReadinessLevel = 'not-ready' | 'emerging' | 'prepared' | 'ready-to-scale';

export interface Gpt6Result {
  score: number;           // 0–100
  level: ReadinessLevel;
  levelLabel: string;
  /** How much faster GPT-6 can do this vs current approach */
  efficiencyGain: string;
  /** Potential cost reduction */
  costReduction: string;
  /** How soon they can adopt */
  adoptionTimeline: string;
  /** Risk factors to watch */
  risks: string[];
  /** Specific next steps */
  nextSteps: string[];
  /** Recommended RyderTech service to start with */
  recommendedService: string;
  recommendedServiceLink: string;
  /** Plain-language verdict */
  verdict: string;
}

const LEVEL_LABELS: Record<ReadinessLevel, string> = {
  'not-ready': 'Not Ready',
  'emerging': 'Emerging',
  'prepared': 'Prepared',
  'ready-to-scale': 'Ready to Scale'
};

export function computeGpt6Readiness(input: Gpt6Input): Gpt6Result {
  let score = 0;

  // 1. Company size (0-15 points)
  if (input.companySize >= 50) score += 15;
  else if (input.companySize >= 20) score += 12;
  else if (input.companySize >= 10) score += 10;
  else if (input.companySize >= 5) score += 7;
  else score += 5;

  // 2. Technical maturity (0-20 points)
  score += input.technicalMaturity * 4;

  // 3. Current AI usage (0-15 points)
  const aiUsagePoints = { none: 0, chatgpt: 6, api: 12, enterprise: 15 };
  score += aiUsagePoints[input.currentAiUsage];

  // 4. Data readiness (0-20 points)
  const dataPoints = { none: 0, some: 8, centralized: 15, 'ml-ready': 20 };
  score += dataPoints[input.dataReadiness];

  // 5. Work type compatibility with GPT-6 (0-15 points)
  // GPT-6 excels at operational + customer-facing + analytical tasks
  const workTypePoints = { creative: 10, analytical: 15, operational: 12, 'customer-facing': 15, research: 13 };
  score += workTypePoints[input.workType];

  // 6. Budget (0-10 points)
  if (input.aiBudgetUsd >= 50000) score += 10;
  else if (input.aiBudgetUsd >= 20000) score += 8;
  else if (input.aiBudgetUsd >= 5000) score += 6;
  else if (input.aiBudgetUsd >= 1000) score += 4;
  else score += 2;

  // 7. Urgency (0-5 points)
  const urgencyPoints = { exploring: 5, testing: 4, urgent: 3 };
  score += urgencyPoints[input.urgency];

  // Clamp 0–100
  score = Math.max(0, Math.min(100, score));

  // Determine level
  let level: ReadinessLevel;
  if (score >= 80) level = 'ready-to-scale';
  else if (score >= 60) level = 'prepared';
  else if (score >= 35) level = 'emerging';
  else level = 'not-ready';

  // Efficiency gain estimate
  const efficiencyGain =
    input.workType === 'operational' || input.workType === 'customer-facing'
      ? '60-80% faster'
      : input.workType === 'analytical'
      ? '40-60% faster'
      : input.workType === 'research'
      ? '30-50% faster'
      : '20-40% faster';

  // Cost reduction estimate
  const costReduction =
    score >= 70
      ? '40-60% cost reduction on agent-driven tasks'
      : score >= 40
      ? '20-40% cost reduction'
      : '5-20% cost reduction (focus on proof-of-concepts first)';

  // Adoption timeline
  const adoptionTimeline =
    level === 'ready-to-scale'
      ? 'Ready in 1-2 months'
      : level === 'prepared'
      ? 'Ready in 3-6 months'
      : level === 'emerging'
      ? 'Ready in 6-12 months'
      : '12+ months — start with AI literacy training';

  // Risks
  const risks: string[] = [];
  if (input.dataReadiness === 'none' || input.dataReadiness === 'some') {
    risks.push('Data access — GPT-6 needs clean, connected data to act reliably');
  }
  if (input.technicalMaturity <= 2) {
    risks.push('Technical debt — legacy systems can bottleneck agent workflows');
  }
  if (input.currentAiUsage === 'none') {
    risks.push('AI naivety — team may over-trust outputs without proper eval');
  }
  if (input.aiBudgetUsd < 5000) {
    risks.push('Underfunded — GPT-6 API costs can spike with autonomous agents');
  }
  if (risks.length === 0) risks.push('No major blockers identified — move fast but instrument everything');

  // Next steps
  const nextSteps: string[] = [];
  if (input.dataReadiness !== 'ml-ready') {
    nextSteps.push('Audit data access — inventory APIs, databases, and documents GPT-6 agents will need');
  }
  if (input.currentAiUsage === 'none') {
    nextSteps.push('Start with ChatGPT Business for your team to learn the tools before going autonomous');
  }
  if (input.technicalMaturity <= 2) {
    nextSteps.push('Partner with an AI development agency (like RyderTech) rather than building in-house');
  }
  if (input.workType === 'operational' || input.workType === 'customer-facing') {
    nextSteps.push('Build a small agent prototype: 1 workflow, 1 week, measurable outcome');
  }
  if (input.aiBudgetUsd >= 20000) {
    nextSteps.push('Allocate budget for an AI agent pilot — scope, build, measure in 2-week sprints');
  }
  if (nextSteps.length === 0) {
    nextSteps.push("You're well-positioned — start with a bounded agent workflow in your highest-impact area");
  }

  // Service recommendation based on readiness + work type
  let recommendedService: string;
  let recommendedServiceLink: string;
  if (level === 'ready-to-scale' || level === 'prepared') {
    recommendedService = 'AI Agent Automation — autonomous workflows for your team';
    recommendedServiceLink = '/services/ai';
  } else if (level === 'emerging') {
    recommendedService = 'AI Strategy & Readiness Audit — get your data and team GPT-6 ready';
    recommendedServiceLink = '/services/ai';
  } else {
    recommendedService = 'AI Training Workshop — bring your team up to speed on generative AI';
    recommendedServiceLink = '/services/ai';
  }

  const verdict =
    level === 'ready-to-scale'
      ? `Your business is well-positioned to adopt GPT-6 agents at scale. ${efficiencyGain} efficiency gains are achievable on ${workTypeLabel(input.workType)} tasks.`
      : level === 'prepared'
      ? `You have solid foundations for GPT-6 adoption. With focus on ${risks.length > 0 ? risks[0].toLowerCase() : 'data readiness'}, you can move to production agents.`
      : level === 'emerging'
      ? `You're on the right path but need to address data access and technical readiness before GPT-6 agents can operate autonomously.`
      : `GPT-6 represents a leap most businesses aren't ready for yet. Start with basic AI training and simple ChatGPT use cases before scaling to autonomous agents.`;

  return {
    score,
    level,
    levelLabel: LEVEL_LABELS[level],
    efficiencyGain,
    costReduction,
    adoptionTimeline,
    risks,
    nextSteps,
    recommendedService,
    recommendedServiceLink,
    verdict
  };
}

function workTypeLabel(t: Gpt6Input['workType']): string {
  const labels = {
    creative: 'creative content',
    analytical: 'data analysis',
    operational: 'operations',
    'customer-facing': 'customer service',
    research: 'research'
  };
  return labels[t];
}
