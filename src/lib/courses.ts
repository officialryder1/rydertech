import {
  Bot,
  Clapperboard,
  MessagesSquare,
  Workflow
} from '@lucide/svelte';
import type { Component } from 'svelte';

/**
 * RyderTech Courses — single source of truth for the /courses catalog.
 *
 * To add a course: append one object to `courses` below. The hub page, the
 * [slug] detail page, the sitemap, and the JSON-LD all read from this array —
 * no new route code required.
 *
 * `checkoutUrl` points at the external host (Gumroad/Podia) that owns payment
 * + content delivery. RyderTech owns the SEO, the lead, and the relationship.
 */

export interface CourseModule {
  title: string;
  lessons: string[];
}

export interface Course {
  slug: string;
  title: string;
  tagline: string;
  category: 'AI Automation' | 'Generative Video' | 'LLM / Agents' | 'No-Code AI';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  /** Price in Naira. Display string is derived; keep number for sorting/filtering. */
  priceNgn: number;
  durationHours: number;
  moduleCount: number;
  format: 'Self-paced video' | 'Live cohort' | 'Self-paced + live Q&A';
  /** Short outcome the buyer gets. Drives the hero CTA. */
  outcome: string;
  description: string;
  /** 3-5 bullets shown on cards and detail. */
  outcomes: string[];
  audience: string[];
  curriculum: CourseModule[];
  icon: Component;
  /** External checkout/delivery URL (Gumroad/Podia). Set per course. */
  checkoutUrl: string;
}

const ngn = (n: number) => '₦' + n.toLocaleString('en-NG');

export const courses: Course[] = [
  {
    slug: 'ai-automation-mastery',
    title: 'AI Automation Mastery',
    tagline: 'Build no-code + LLM workflows that run your business while you sleep.',
    category: 'AI Automation',
    level: 'Intermediate',
    priceNgn: 80000,
    durationHours: 9,
    moduleCount: 8,
    format: 'Self-paced video',
    outcome: 'Ship 5 production automations (lead capture → CRM → follow-up) by graduation.',
    description:
      'The flagship RyderTech course. Learn to design, build, and operate real business automations using n8n / Make, LLM agents, and webhooks — wired into the tools SMEs already use (Gmail, Sheets, WhatsApp, Calendly). We go beyond toy demos: error handling, rate limits, human-in-the-loop approvals, and monitoring so your flows survive contact with production.',
    outcomes: [
      'Architect automation workflows with n8n / Make + LLM nodes',
      'Connect Gmail, Google Sheets, WhatsApp, and Calendly via webhooks',
      'Add LLM agents for classification, drafting, and routing',
      'Build human-in-the-loop approvals and error retries',
      'Monitor, log, and cost-optimize live automations'
    ],
    audience: ['Founders', 'Ops managers', 'Virtual assistants', 'Agency owners'],
    curriculum: [
      { title: 'Automation Foundations', lessons: ['What to automate (and what not to)', 'n8n vs Make mental model', 'Your first trigger → action flow'] },
      { title: 'Connecting Your Stack', lessons: ['Gmail & Sheets nodes', 'Webhooks 101', 'WhatsApp Business API bridge'] },
      { title: 'LLM Agents in Flows', lessons: ['Prompting nodes', 'Classification & routing', 'Drafting replies safely'] },
      { title: 'Production Hardening', lessons: ['Error handling & retries', 'Human approval steps', 'Rate limits & cost caps'] },
      { title: 'Capstone', lessons: ['Lead → CRM → follow-up pipeline', 'Monitoring dashboard'] }
    ],
    icon: Workflow,
    checkoutUrl: 'https://rydertech.gumroad.com/l/ai-automation-mastery'
  },
  {
    slug: 'ai-video-generation-ads',
    title: 'AI Video Generation for Ads',
    tagline: 'Produce scroll-stopping ad creatives with AI video pipelines.',
    category: 'Generative Video',
    level: 'Beginner',
    priceNgn: 80000,
    durationHours: 7,
    moduleCount: 7,
    format: 'Self-paced video',
    outcome: 'Render 10 ad-ready video variations from one product shot.',
    description:
      'Turn static product images and a brief into multiple ad-ready video variations using modern AI video models (image-to-video, keyframe animation, and audio). Covers prompting for motion, brand-consistent styling, caption overlays, and an assembly workflow that outputs vertical (TikTok/Reels) and square (Meta) cuts for paid social.',
    outcomes: [
      'Animate product images into video with image-to-video models',
      'Storyboard with keyframes for consistent motion',
      'Generate synchronized audio / voiceover',
      'Export vertical + square cuts for Meta & TikTok',
      'Batch-produce 10 variations from one asset'
    ],
    audience: ['Marketers', 'E-commerce owners', 'Content creators', 'Ad agencies'],
    curriculum: [
      { title: 'AI Video Landscape', lessons: ['Model families & when to use each', 'Rights & disclosure'] },
      { title: 'From Image to Motion', lessons: ['Image-to-video prompting', 'Keyframe control'] },
      { title: 'Audio & Polish', lessons: ['Voiceover generation', 'Caption overlays'] },
      { title: 'Ad-Ready Export', lessons: ['Vertical vs square cuts', 'Batch variation workflow'] }
    ],
    icon: Clapperboard,
    checkoutUrl: 'https://rydertech.gumroad.com/l/ai-video-ads'
  },
  {
    slug: 'llm-chatbots-agents',
    title: 'Build LLM Chatbots & Agents',
    tagline: 'Ship a grounded WhatsApp/web assistant with RAG on your own data.',
    category: 'LLM / Agents',
    level: 'Intermediate',
    priceNgn: 60000,
    durationHours: 8,
    moduleCount: 7,
    format: 'Self-paced + live Q&A',
    outcome: 'Deploy a support bot that answers from your knowledge base.',
    description:
      'Build conversational assistants and autonomous agents grounded in your business data. Reuses the same patterns behind RyderTech’s live AI demo and WhatsApp assistant: retrieval-augmented generation (RAG), tool-calling, and a deployment path to WhatsApp and web. Includes guardrails, hallucination control, and a clean handoff-to-human escape hatch.',
    outcomes: [
      'Build a RAG knowledge base over your docs',
      'Add tool-calling (booking, lookup, escalate)',
      'Deploy to WhatsApp and web chat',
      'Control hallucinations with guardrails',
      'Wire a human handoff fallback'
    ],
    audience: ['Founders', 'Support leads', 'Developers', 'Agencies'],
    curriculum: [
      { title: 'RAG Basics', lessons: ['Chunking & embeddings', 'Retrieval patterns'] },
      { title: 'Tools & Agents', lessons: ['Function calling', 'Multi-step agents'] },
      { title: 'Deployment', lessons: ['WhatsApp bridge', 'Web widget'] },
      { title: 'Safety', lessons: ['Guardrails', 'Human handoff'] }
    ],
    icon: MessagesSquare,
    checkoutUrl: 'https://rydertech.gumroad.com/l/llm-chatbots-agents'
  },
  {
    slug: 'no-code-ai-business-ops',
    title: 'No-Code AI for Business Ops',
    tagline: 'Apply AI to the repetitive work that drains your team.',
    category: 'No-Code AI',
    level: 'Beginner',
    priceNgn: 45000,
    durationHours: 5,
    moduleCount: 6,
    format: 'Self-paced video',
    outcome: 'Cut a real weekly manual process by 70%.',
    description:
      'A pragmatic entry point for non-technical operators. Map your recurring busywork, then apply AI assistants and simple automations to reclaim hours every week. Connects directly to the Ops-Drain diagnostic on RyderTech /labs — bring a process, leave with it automated.',
    outcomes: [
      'Map and score repetitive processes',
      'Set up AI assistants for drafts & summaries',
      'Automate one weekly workflow end-to-end',
      'Measure the time saved (ROI)'
    ],
    audience: ['SME owners', 'Operations staff', 'Freelancers', 'Team leads'],
    curriculum: [
      { title: 'Find the Drain', lessons: ['Process mapping', 'Ops-Drain scoring'] },
      { title: 'AI Assistants', lessons: ['Drafting & summarization', 'Inbox triage'] },
      { title: 'Automate', lessons: ['Your first no-code flow', 'Measure ROI'] }
    ],
    icon: Bot,
    checkoutUrl: 'https://rydertech.gumroad.com/l/no-code-ai-ops'
  }
];

export const courseBySlug = (slug: string): Course | undefined =>
  courses.find((c) => c.slug === slug);

export const formatNgn = ngn;

/** JSON-LD ItemList for the /courses hub (Schema.org Course list). */
export function coursesItemListJsonLd(): string {
  const base = 'https://rydertech.ng';
  const list = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: courses.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Course',
        name: c.title,
        description: c.tagline,
        url: `${base}/courses/${c.slug}`,
        provider: {
          '@type': 'Organization',
          name: 'RyderTech',
          sameAs: 'https://twitter.com/official_ryder0'
        },
        offers: {
          '@type': 'Offer',
          price: c.priceNgn,
          priceCurrency: 'NGN',
          url: c.checkoutUrl,
          availability: 'https://schema.org/InStock'
        }
      }
    }))
  };
  return JSON.stringify(list);
}

/** JSON-LD for a single course detail page. */
export function courseJsonLd(c: Course): string {
  const base = 'https://rydertech.ng';
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: c.title,
    description: c.outcome,
    provider: {
      '@type': 'Organization',
      name: 'RyderTech',
      sameAs: 'https://twitter.com/official_ryder0'
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: c.format.includes('Live') ? 'https://schema.org/OnlineEvent' : 'https://schema.org/Online',
      courseWorkload: `PT${c.durationHours}H`
    },
    offers: {
      '@type': 'Offer',
      price: c.priceNgn,
      priceCurrency: 'NGN',
      url: c.checkoutUrl,
      availability: 'https://schema.org/InStock'
    }
  };
  return JSON.stringify(data);
}
