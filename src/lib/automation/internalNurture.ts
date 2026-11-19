/**
 * Internal Lead Nurture Automation — RyderTech
 *
 * This module automates our own lead nurture pipeline:
 * 1. Watches for new leads in Supabase (contact_submissions + newsletter_subscriptions)
 * 2. Auto-enrolls them into the appropriate nurture sequence based on source tool
 * 3. Schedules and sends 3-touch nurture sequences via Gmail MCP
 * 4. Tracks delivery state in .nurture-state.json
 *
 * Architecture:
 * - Runs as a cron job (or can be triggered manually)
 * - Uses service-role Supabase client for reads/writes
 * - Sends via Gmail MCP (mcp__google_workspace__send_gmail_message)
 * - Idempotent: never re-sends the same touch to the same lead
 *
 * Nurture Sequences:
 * - ops_drain: calculator → touch1 (audit link), touch2 (3 automations), touch3 (call CTA)
 * - revleak: auditor → touch1 (audit link), touch2 (speed fixes), touch3 (call CTA)
 * - event_risk: scanner → touch1 (audit link), touch2 (QR gate demo), touch3 (call CTA)
 * - website_rater: analyzer → touch1 (audit link), touch2 (CRO tips), touch3 (call CTA)
 * - visibility: auditor → touch1 (audit link), touch2 (local SEO tips), touch3 (call CTA)
 * - aeo: readiness → touch1 (audit link), touch2 (AI search tips), touch3 (call CTA)
 * - clausescan: scanner → touch1 (audit link), touch2 (contract tips), touch3 (call CTA)
 * - automation_readiness: diagnostic → touch1 (blueprint link), touch2 (automation patterns), touch3 (call CTA)
 * - gateway_calc: calculator → touch1 (audit link), touch2 (payment tips), touch3 (call CTA)
 * - agentic_cost: calculator → touch1 (audit link), touch2 (agent patterns), touch3 (call CTA)
 * - q_day: readiness → touch1 (audit link), touch2 (PQC tips), touch3 (call CTA)
 * - gpt6_checker: readiness → touch1 (audit link), touch2 (agent prep), touch3 (call CTA)
 * - headline_studio: generator → touch1 (audit link), touch2 (headline tips), touch3 (call CTA)
 * - content_repurposer: generator → touch1 (audit link), touch2 (distribution tips), touch3 (call CTA)
 * - property_chatbot: chatbot → touch1 (lead report), touch2 (conversion tips), touch3 (call CTA)
 * - cost_estimator: estimator → touch1 (audit link), touch2 (budget tips), touch3 (call CTA)
 * - agent_templates: library → touch1 (audit link), touch2 (template tips), touch3 (call CTA)
 *
 * All tools route to a FALLBACK generic sequence if no specific template exists.
 */

import { createSupabaseAdminClient } from '$lib/supabase/server';
import { renderTouch } from '$lib/leads/nurture';

// ---- Configuration ----

const NURTURE_TOOL_MAP: Record<string, string> = {
	'lead_magnet_ops_drain': 'ops_drain',
	'lead_magnet_revleak': 'revleak',
	'lead_magnet_event_risk': 'event_risk',
	'lead_magnet_website_rater': 'website_rater',
	'lead_magnet_visibility': 'visibility',
	'lead_magnet_aeo_readiness': 'aeo',
	'lead_magnet_aeo': 'aeo',
	'lead_magnet_clausescan': 'clausescan',
	'lead_magnet_clausescan_contract': 'clausescan',
	'lead_magnet_gateway_calc': 'gateway_calc',
	'lead_magnet_agentic_cost': 'agentic_cost',
	'lead_magnet_agentic_workflow_cost': 'agentic_cost',
	'lead_magnet_q_day_readiness': 'q_day',
	'lead_magnet_q_day': 'q_day',
	'lead_magnet_gpt_6_checker': 'gpt6_checker',
	'lead_magnet_gpt6_checker': 'gpt6_checker',
	'lead_magnet_headline_studio': 'headline_studio',
	'lead_magnet_content_repurposer': 'content_repurposer',
	'lead_magnet_property_chatbot': 'property_chatbot',
	'lead_magnet_cost_estimator': 'cost_estimator',
	'lead_magnet_cost_guide': 'cost_estimator',
	'lead_magnet_agent_templates': 'agent_templates',
	'lead_magnet_automation_readiness': 'automation_readiness',
	'voice_agent': 'voice_agent',
	'ai_widget': 'ai_widget',
	'course_interest': 'course_interest',
	'contact': 'contact'
};

const TOUCH_OFFSETS = { 1: 0, 2: 2, 3: 5 }; // days after capture

const TOOL_URLS: Record<string, string> = {
	ops_drain: '/labs/ops-drain',
	revleak: '/labs/revleak',
	event_risk: '/labs/event-access-risk',
	website_rater: '/labs/website-rater',
	visibility: '/labs/visibility',
	aeo: '/labs/aeo-readiness',
	clausescan: '/labs/clausescan',
	gateway_calc: '/labs/gateway-calc',
	agentic_cost: '/labs/agentic-workflow-cost',
	q_day: '/labs/q-day-readiness',
	gpt6_checker: '/labs/gpt-6-checker',
	headline_studio: '/labs/headline-studio',
	content_repurposer: '/labs/content-repurposer',
	property_chatbot: '/labs/property-chatbot',
	cost_estimator: '/labs/cost-estimator',
	agent_templates: '/labs/agent-templates',
	automation_readiness: '/labs/automation-readiness',
	voice_agent: '/services/ai',
	ai_widget: '/services/ai',
	course_interest: '/courses',
	contact: '/contact'
};

// Extended templates for all tools
const EXTENDED_TEMPLATES: Record<string, Record<number, { subject: string; body: (name: string, toolUrl: string) => string }>> = {
	website_rater: {
		1: {
			subject: 'Your Website Review — the 1-line version',
			body: (name, toolUrl) => `Hi ${name},\n\nThanks for running the Website Review. The headline: your site has specific, fixable gaps that are costing you leads and credibility every day.\n\nHere's your branded audit you can keep/share: https://rydertech.ng${toolUrl}\n\nIn two days I'll send the 3 quick wins that move the needle fastest.\n\n— Victor, RyderTech`
		},
		2: {
			subject: '3 quick wins for a higher-converting site',
			body: (name, toolUrl) => `Hi ${name},\n\nThe three fixes that consistently lift conversion for sites like yours:\n\n1. Above-the-fold clarity — headline + subhead + CTA in the first 3 seconds.\n2. Trust signals — logos, testimonials, concrete outcomes near every ask.\n3. Friction removal — kill fields, auto-fill, one-click actions where possible.\n\nImplement those and your score jumps 2-3 points. That's real revenue.\n\n— Victor, RyderTech`
		},
		3: {
			subject: 'Worth a 15-minute CRO audit?',
			body: (name, toolUrl) => `Hi ${name},\n\nI'll stop here. If the review showed gaps you want to close, the next step is a 15-minute CRO audit — I'll walk your live site, prioritize the fixes, and quote the implementation.\n\nBook it: https://rydertech.ng/contact\n\nIf now's not the time, reply "later" and I'll check back next quarter.\n\n— Victor, RyderTech`
		}
	},
	visibility: {
		1: {
			subject: 'Your Local Visibility audit — the 1-line version',
			body: (name, toolUrl) => `Hi ${name},\n\nThanks for running the Local Visibility Audit. The headline: customers near you are searching for what you do — and they're finding competitors instead.\n\nHere's your branded audit you can keep/share: https://rydertech.ng${toolUrl}\n\nIn two days I'll send the 3 local SEO moves that actually move the map pin.\n\n— Victor, RyderTech`
		},
		2: {
			subject: '3 local SEO moves that move the map pin',
			body: (name, toolUrl) => `Hi ${name},\n\nThe three things that consistently improve local rank for Nigerian businesses:\n\n1. GBP completeness — every field filled, photos weekly, Q&A answered.\n2. Review velocity — a system that asks happy customers at the moment of delight.\n3. Location pages — one per service area, with schema, not a single "Contact Us".\n\nDo those three and the map pack clicks compound.\n\n— Victor, RyderTech`
		},
		3: {
			subject: 'Worth a 15-minute local audit?',
			body: (name, toolUrl) => `Hi ${name},\n\nI'll stop here. If you want more map-pack visibility, the next step is a 15-minute local audit — I'll check your GBP health, citation consistency, and review gap vs competitors.\n\nBook it: https://rydertech.ng/contact\n\nIf the timing's off, reply "later" and I'll circle back.\n\n— Victor, RyderTech`
		}
	},
	aeo: {
		1: {
			subject: 'Your AI Search Readiness audit — the 1-line version',
			body: (name, toolUrl) => `Hi ${name},\n\nThanks for running the AI Search Readiness Audit. The headline: AI answer engines are citing your competitors for queries you should own.\n\nHere's your branded audit you can keep/share: https://rydertech.ng${toolUrl}\n\nIn two days I'll send the 3 content patterns that get cited.\n\n— Victor, RyderTech`
		},
		2: {
			subject: '3 content patterns that get cited by AI',
			body: (name, toolUrl) => `Hi ${name},\n\nThe three patterns AI engines consistently cite:\n\n1. Direct answers — H2 question → 40-60 word definitive answer → cite source.\n2. Structured data — FAQ, HowTo, Product schema on every key page.\n3. Authority signals — author bios, dates, citations, unique data points.\n\nPublish in that format and you become the source, not the alternative.\n\n— Victor, RyderTech`
		},
		3: {
			subject: 'Worth a 15-minute AEO audit?',
			body: (name, toolUrl) => `Hi ${name},\n\nI'll stop here. If you want to be the answer AI gives, the next step is a 15-minute AEO audit — I'll check your current citations, schema coverage, and content gaps vs competitors.\n\nBook it: https://rydertech.ng/contact\n\nIf now's not the time, reply "later" and I'll check back next quarter.\n\n— Victor, RyderTech`
		}
	},
	clausescan: {
		1: {
			subject: 'Your Contract Risk scan — the 1-line version',
			body: (name, toolUrl) => `Hi ${name},\n\nThanks for running ClauseScan. The headline: your contract has clauses that could cost you — and they're fixable before you sign.\n\nHere's your branded audit you can keep/share: https://rydertech.ng${toolUrl}\n\nIn two days I'll send the 3 red flags every Nigerian contract should check.\n\n— Victor, RyderTech`
		},
		2: {
			subject: '3 red flags in every Nigerian contract',
			body: (name, toolUrl) => `Hi ${name},\n\nThe three clauses that most often bite Nigerian businesses:\n\n1. One-sided indemnity — you indemnify them for everything; they indemnify you for nothing.\n2. Unilateral termination — they can fire you for convenience; you need cause.\n3. IP assignment — your work product becomes theirs, even pre-existing IP.\n\nRedline those three and you've neutralized 80% of the downside.\n\n— Victor, RyderTech`
		},
		3: {
			subject: 'Worth a 15-minute contract review?',
			body: (name, toolUrl) => `Hi ${name},\n\nI'll stop here. If you have a contract in play, the next step is a 15-minute review — I'll flag the risky clauses and give you redline wording.\n\nBook it: https://rydertech.ng/contact\n\nIf the deal's not ready, reply "later" and I'll check back.\n\n— Victor, RyderTech`
		}
	},
	gateway_calc: {
		1: {
			subject: 'Your Payment Gateway audit — the 1-line version',
			body: (name, toolUrl) => `Hi ${name},\n\nThanks for running the Payment Gateway Calculator. The headline: you're likely overpaying on processing fees — and the gap compounds monthly.\n\nHere's your branded audit you can keep/share: https://rydertech.ng${toolUrl}\n\nIn two days I'll send the 3 fee traps Nigerian merchants miss.\n\n— Victor, RyderTech`
		},
		2: {
			subject: '3 fee traps Nigerian merchants miss',
			body: (name, toolUrl) => `Hi ${name},\n\nThe three places fees hide:\n\n1. International card markup — 3.5-4.5% on foreign cards vs 1.5% local.\n2. Settlement delay cost — T+3 vs T+1 is free float for them, cash gap for you.\n3. Chargeback fees — ₦2,000-5,000 per dispute, often avoidable with 3DS.\n\nSwitch the right gateway and the savings pay for the migration in month one.\n\n— Victor, RyderTech`
		},
		3: {
			subject: 'Worth a 15-minute gateway optimization?',
			body: (name, toolUrl) => `Hi ${name},\n\nI'll stop here. If you want to stop leaking margin to processors, the next step is a 15-minute gateway audit — I'll model your exact volume mix and quote the switch.\n\nBook it: https://rydertech.ng/contact\n\nIf now's not the time, reply "later" and I'll circle back.\n\n— Victor, RyderTech`
		}
	},
	agentic_cost: {
		1: {
			subject: 'Your Agentic Workflow audit — the 1-line version',
			body: (name, toolUrl) => `Hi ${name},\n\nThanks for running the Agentic Workflow Cost Calculator. The headline: manual WhatsApp orders, M-Pesa reconciliation, and invoice chasing are costing you staff-days every month — and an AI agent pays for itself fast.\n\nHere's your branded audit you can keep/share: https://rydertech.ng${toolUrl}\n\nIn two days I'll send the 3 agent patterns that recover the most time.\n\n— Victor, RyderTech`
		},
		2: {
			subject: '3 agent patterns that recover the most staff time',
			body: (name, toolUrl) => `Hi ${name},\n\nThe three AI agent deployments with the fastest payback for Nigerian ops:\n\n1. WhatsApp order agent — reads messages, creates orders, confirms stock, replies.\n2. Reconciliation agent — matches Paystack/Flutterwave to invoices, flags gaps.\n3. Invoice chaser — polite follow-ups on overdue, escalates only real exceptions.\n\nEach replaces 2-4 hours of daily human work. The ROI is measurable in week one.\n\n— Victor, RyderTech`
		},
		3: {
			subject: 'Worth a 15-minute agent scoping call?',
			body: (name, toolUrl) => `Hi ${name},\n\nI'll stop here. If you want to deploy an agent that actually executes (not just chats), the next step is a 15-minute scoping call — I'll map your workflow and quote the build.\n\nBook it: https://rydertech.ng/contact\n\nIf the timing's off, reply "later" and I'll check back next quarter.\n\n— Victor, RyderTech`
		}
	},
	q_day: {
		1: {
			subject: 'Your Q-Day Readiness audit — the 1-line version',
			body: (name, toolUrl) => `Hi ${name},\n\nThanks for running the Q-Day Readiness Checker. The headline: post-quantum crypto is coming — and the migration window is narrower than most teams think.\n\nHere's your branded audit you can keep/share: https://rydertech.ng${toolUrl}\n\nIn two days I'll send the 3 PQC migration steps to start now.\n\n— Victor, RyderTech`
		},
		2: {
			subject: '3 PQC migration steps to start now',
			body: (name, toolUrl) => `Hi ${name},\n\nThe three things you can do today without breaking production:\n\n1. Inventory — list every TLS cert, SSH key, JWT signing key, VPN cert.\n2. Hybrid — enable hybrid KEM (X25519+Kyber) on load balancers and APIs.\n3. Crypto-agility — abstract key generation behind an interface so you can swap algorithms.\n\nStart these three and you're ahead of 95% of the market when standards finalize.\n\n— Victor, RyderTech`
		},
		3: {
			subject: 'Worth a 15-minute crypto-agility audit?',
			body: (name, toolUrl) => `Hi ${name},\n\nI'll stop here. If you want a concrete migration plan with timelines, the next step is a 15-minute crypto-agility audit — I'll inventory your surface and quote the phased migration.\n\nBook it: https://rydertech.ng/contact\n\nIf now's not the time, reply "later" and I'll circle back.\n\n— Victor, RyderTech`
		}
	},
	gpt6_checker: {
		1: {
			subject: 'Your GPT-6 Readiness audit — the 1-line version',
			body: (name, toolUrl) => `Hi ${name},\n\nThanks for running the GPT-6 Readiness Checker. The headline: autonomous agents are coming — and the businesses that prepare their data, workflows, and permissions now will deploy first.\n\nHere's your branded audit you can keep/share: https://rydertech.ng${toolUrl}\n\nIn two days I'll send the 3 prep steps that unlock agent readiness.\n\n— Victor, RyderTech`
		},
		2: {
			subject: '3 prep steps that unlock agent readiness',
			body: (name, toolUrl) => `Hi ${name},\n\nThe three foundations every agent deployment needs:\n\n1. Structured data — APIs with OpenAPI specs, not scraped HTML.\n2. Permission scopes — least-privilege tokens per agent task, not admin keys.\n3. Observability — every agent action logged, replayable, auditable.\n\nBuild those three and you can deploy agents safely the day models are ready.\n\n— Victor, RyderTech`
		},
		3: {
			subject: 'Worth a 15-minute agent-readiness audit?',
			body: (name, toolUrl) => `Hi ${name},\n\nI'll stop here. If you want to be agent-ready, the next step is a 15-minute readiness audit — I'll check your API surface, auth model, and data contracts.\n\nBook it: https://rydertech.ng/contact\n\nIf now's not the time, reply "later" and I'll check back next quarter.\n\n— Victor, RyderTech`
		}
	},
	headline_studio: {
		1: {
			subject: 'Your Headline Studio results — the 1-line version',
			body: (name, toolUrl) => `Hi ${name},\n\nThanks for using the Headline Studio. The headline: your best headline scored well — but the gap to "viral" is specific and closable.\n\nHere's your branded report you can keep/share: https://rydertech.ng${toolUrl}\n\nIn two days I'll send the 3 formulas that consistently outperform.\n\n— Victor, RyderTech`
		},
		2: {
			subject: '3 headline formulas that consistently outperform',
			body: (name, toolUrl) => `Hi ${name},\n\nThe three formulas with the highest CTR across Nigerian audiences:\n\n1. Curiosity + Number — "7 things your [competitor] won't tell you about [topic]"\n2. How-To + Outcome — "How to [achieve outcome] without [pain point]"\n3. Social Proof + Specificity — "How [known company] cut [metric] by [%] in [time]"\n\nTest those three formats and your CTR lifts 20-40%.\n\n— Victor, RyderTech`
		},
		3: {
			subject: 'Worth a 15-minute content strategy call?',
			body: (name, toolUrl) => `Hi ${name},\n\nI'll stop here. If you want a content system that compounds, the next step is a 15-minute strategy call — I'll map your topics to the formulas that convert.\n\nBook it: https://rydertech.ng/contact\n\nIf now's not the time, reply "later" and I'll check back.\n\n— Victor, RyderTech`
		}
	},
	content_repurposer: {
		1: {
			subject: 'Your Content Repurposer results — the 1-line version',
			body: (name, toolUrl) => `Hi ${name},\n\nThanks for using the Content Repurposer. The headline: one piece of content just became 6 platform-native posts — and the distribution is where the leverage lives.\n\nHere's your branded report you can keep/share: https://rydertech.ng${toolUrl}\n\nIn two days I'll send the 3 distribution habits that compound reach.\n\n— Victor, RyderTech`
		},
		2: {
			subject: '3 distribution habits that compound reach',
			body: (name, toolUrl) => `Hi ${name},\n\nThe three habits that turn one post into sustained traffic:\n\n1. LinkedIn first (long-form) → Twitter thread (hooks) → Newsletter (deep dive) same week.\n2. Remix: each platform gets native formatting, not cross-posted screenshots.\n3. Republish: the LinkedIn post becomes next month's newsletter intro with new data.\n\nSystematize those three and one idea feeds your calendar for 30 days.\n\n— Victor, RyderTech`
		},
		3: {
			subject: 'Worth a 15-minute content system call?',
			body: (name, toolUrl) => `Hi ${name},\n\nI'll stop here. If you want a content flywheel, the next step is a 15-minute call — I'll design your repurposing pipeline and the automation that runs it.\n\nBook it: https://rydertech.ng/contact\n\nIf now's not the time, reply "later" and I'll circle back.\n\n— Victor, RyderTech`
		}
	},
	property_chatbot: {
		1: {
			subject: 'Your Property Chatbot lead — the 1-line version',
			body: (name, toolUrl) => `Hi ${name},\n\nThanks for trying the Property Chatbot. The headline: a qualified prospect just told you exactly what they want, where, and when — and the lead is warm.\n\nHere's your branded lead report you can keep/share: https://rydertech.ng${toolUrl}\n\nIn two days I'll send the 3 follow-up moves that convert property leads.\n\n— Victor, RyderTech`
		},
		2: {
			subject: '3 follow-up moves that convert property leads',
			body: (name, toolUrl) => `Hi ${name},\n\nThe three moves that consistently close inspection-to-offer:\n\n1. Call within 2 hours — reference the specific property they viewed.\n2. Send a 1-page brochure — photos, price, amenities, location map.\n3. Propose 2 inspection slots — "Thursday 10am or Saturday 2pm?" reduces friction.\n\nDo those three and your inspection-to-offer rate jumps.\n\n— Victor, RyderTech`
		},
		3: {
			subject: 'Worth a 15-minute proptech call?',
			body: (name, toolUrl) => `Hi ${name},\n\nI'll stop here. If you want a chatbot that qualifies and books inspections 24/7, the next step is a 15-minute call — I'll show you the Veripasshub integration for property.\n\nBook it: https://rydertech.ng/contact\n\nIf now's not the time, reply "later" and I'll circle back.\n\n— Victor, RyderTech`
		}
	},
	cost_estimator: {
		1: {
			subject: 'Your Website Cost estimate — the 1-line version',
			body: (name, toolUrl) => `Hi ${name},\n\nThanks for using the Website Cost Estimator. The headline: your vision has a realistic price tag — and the scope-to-budget fit is the #1 predictor of project success.\n\nHere's your branded estimate you can keep/share: https://rydertech.ng${toolUrl}\n\nIn two days I'll send the 3 scope decisions that save the most budget.\n\n— Victor, RyderTech`
		},
		2: {
			subject: '3 scope decisions that save the most budget',
			body: (name, toolUrl) => `Hi ${name},\n\nThe three choices that keep a Nigerian web project on budget:\n\n1. Phase 1 = core user journey only; everything else is Phase 2+.\n2. Use Supabase Auth + Storage + Realtime — kills 3 vendor contracts.\n3. Design system first (Tailwind + shadcn) — no custom CSS debt.\n\nThose three decisions typically save 30-40% vs a "build everything" quote.\n\n— Victor, RyderTech`
		},
		3: {
			subject: 'Worth a 15-minute scoping call?',
			body: (name, toolUrl) => `Hi ${name},\n\nI'll stop here. If you want a phased build plan with fixed milestones, the next step is a 15-minute scoping call — I'll break your estimate into phases with dates and deliverables.\n\nBook it: https://rydertech.ng/contact\n\nIf now's not the time, reply "later" and I'll check back next quarter.\n\n— Victor, RyderTech`
		}
	},
	agent_templates: {
		1: {
			subject: 'Your Agent Template library access — the 1-line version',
			body: (name, toolUrl) => `Hi ${name},\n\nThanks for browsing the Agent Template Library. The headline: pre-built n8n workflows for WhatsApp orders, inventory sync, M-Pesa reconciliation, and Paystack automation — ready to deploy.\n\nHere's your branded access you can keep/share: https://rydertech.ng${toolUrl}\n\nIn two days I'll send the 3 templates with the fastest ROI.\n\n— Victor, RyderTech`
		},
		2: {
			subject: '3 templates with the fastest ROI',
			body: (name, toolUrl) => `Hi ${name},\n\nThe three n8n templates that pay for themselves in week one:\n\n1. WhatsApp → Order → Supabase — customer messages, agent creates order, confirms stock.\n2. Paystack Webhook → Invoice PDF → Email → Slack — zero manual reconciliation.\n3. Inventory Threshold → Supplier PO → WhatsApp — auto-reorder before stockout.\n\nImport, connect credentials, activate. That's it.\n\n— Victor, RyderTech`
		},
		3: {
			subject: 'Worth a 15-minute n8n build call?',
			body: (name, toolUrl) => `Hi ${name},\n\nI'll stop here. If you want custom workflows beyond the templates, the next step is a 15-minute call — I'll map your processes to n8n and quote the build.\n\nBook it: https://rydertech.ng/contact\n\nIf now's not the time, reply "later" and I'll circle back.\n\n— Victor, RyderTech`
		}
	},
	automation_readiness: {
		1: {
			subject: 'Your Automation Readiness blueprint — the 1-line version',
			body: (name, toolUrl) => `Hi ${name},\n\nThanks for running the Automation Readiness Diagnostic. The headline: you now have a prioritized roadmap of exactly which workflows to automate first, with Nigerian build costs and payback periods.\n\nHere's your full blueprint you can keep/share: https://rydertech.ng${toolUrl}\n\nIn two days I'll send the 3 automation patterns that recover the most staff time for firms your size.\n\n— Victor, RyderTech`
		},
		2: {
			subject: '3 automation patterns that recover the most staff time',
			body: (name, toolUrl) => `Hi ${name},\n\nThe three automations with the fastest payback for Nigerian SMBs:\n\n1. Invoicing & billing — webhook → PDF → auto-send. Kills monthly reconciliation.\n2. Client onboarding — self-serve forms → database → welcome sequence. No copy-paste.\n3. Reporting — scheduled job aggregates data → emails digest. Zero manual pulls.\n\nIf any of those are still human-powered in your shop, that's exactly what we'd automate first.\n\n— Victor, RyderTech`
		},
		3: {
			subject: 'Worth a 15-minute scoping call?',
			body: (name, toolUrl) => `Hi ${name},\n\nI'll stop here. If the roadmap made you wince, the next step is a 15-minute scoping call — I'll show you what automating your top task actually looks like and what it costs.\n\nGrab a slot: https://rydertech.ng/contact\n\nIf the timing's off, just reply "later" and I'll check back next quarter.\n\n— Victor, RyderTech`
		}
	}
};

// ---- Helper Functions ----

function mapLeadTypeToTool(leadType: string): string {
	return NURTURE_TOOL_MAP[leadType] || 'general';
}

function getToolUrl(tool: string): string {
	return TOOL_URLS[tool] || '/labs';
}

function getTemplate(tool: string, touch: number) {
	// Check extended templates first
	if (EXTENDED_TEMPLATES[tool]?.[touch]) {
		return EXTENDED_TEMPLATES[tool][touch];
	}
	// Fall back to nurture.mjs renderTouch (which has ops_drain, revleak, event_risk)
	const rendered = renderTouch(tool, touch, 'there');
	return {
		subject: rendered.subject,
		body: (name: string) => rendered.body
	};
}

function getLeadName(lead: any): string {
	// Try to extract a reasonable name from lead data
	if (lead.from_name) return lead.from_name;
	if (lead.company) return lead.company;
	if (lead.name) return lead.name;
	if (lead.source_company) return lead.source_company;
	const email = lead.from_email || lead.email || lead.source_email;
	if (email) return email.split('@')[0];
	return 'there';
}

function daysSinceCapture(capturedAt: string): number {
	const captured = new Date(capturedAt);
	const now = new Date();
	return Math.floor((now.getTime() - captured.getTime()) / 86400000);
}

// ---- Main Automation Class ----

export class InternalNurtureAutomation {
	private supabase = createSupabaseAdminClient();
	private sentLog: Array<{ leadId: string; email: string; touch: number; messageId: string; sentAt: string }> = [];

	/**
	 * Find new leads that haven't been enrolled in nurture yet
	 */
	async findNewLeads(): Promise<any[]> {
		const admin = this.supabase;

		// Get leads from contact_submissions (last 7 days)
		const { data: contactLeads, error: contactError } = await admin
			.from('contact_submissions')
			.select('*')
			.gte('submitted_at', new Date(Date.now() - 7 * 86400000).toISOString())
			.order('submitted_at', { ascending: false });

		if (contactError) {
			console.error('Error fetching contact leads:', contactError);
		}

		// Get leads from newsletter_subscriptions (last 7 days, lab tools only)
		const { data: newsletterLeads, error: newsletterError } = await admin
			.from('newsletter_subscriptions')
			.select('*')
			.gte('subscribed_at', new Date(Date.now() - 7 * 86400000).toISOString())
			.like('source', 'lead_magnet_%')
			.order('subscribed_at', { ascending: false });

		if (newsletterError) {
			console.error('Error fetching newsletter leads:', newsletterError);
		}

		// Combine and deduplicate by email
		const allLeads = [...(contactLeads || []), ...(newsletterLeads || [])];
		const seen = new Set<string>();
		const uniqueLeads = allLeads.filter(lead => {
			const email = lead.from_email || lead.email || lead.source_email;
			if (!email || seen.has(email)) return false;
			seen.add(email);
			return true;
		});

		return uniqueLeads;
	}

	/**
	 * Check if lead is already in nurture state
	 */
	async isLeadInNurture(email: string): Promise<boolean> {
		const { data } = await this.supabase
			.from('nurture_state')
			.select('email')
			.eq('email', email)
			.single();
		return !!data;
	}

	/**
	 * Enroll lead into nurture sequence
	 */
	async enrollLead(lead: any): Promise<void> {
		const email = lead.from_email || lead.email || lead.source_email;
		const tool = mapLeadTypeToTool(lead.lead_type || lead.source || 'contact');
		const name = getLeadName(lead);
		const capturedAt = lead.submitted_at || lead.subscribed_at || new Date().toISOString();
		const leadScore = lead.lead_score;
		const leadTier = lead.lead_tier;

		console.log(`Enrolling ${email} (${tool}) into nurture...`);

		// Call nurture.mjs --add via the existing CLI pattern
		// For now, we'll directly insert into a nurture_state table
		const { error } = await this.supabase
			.from('nurture_state')
			.upsert({
				email,
				tool,
				name,
				captured_at: capturedAt,
				touches_sent: [],
				lead_score: leadScore,
				lead_tier: leadTier,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			}, {
				onConflict: 'email'
			});

		if (error) {
			console.error(`Failed to enroll ${email}:`, error);
		} else {
			console.log(`Enrolled ${email} (${tool})`);
		}
	}

	/**
	 * Get leads due for a nurture touch
	 */
	async getDueTouches(): Promise<Array<{ email: string; tool: string; name: string; touch: number; capturedAt: string }>> {
		const { data: leads, error } = await this.supabase
			.from('nurture_state')
			.select('*')
			.lt('touches_sent', '[1,2,3]'); // Not all touches sent

		if (error || !leads) return [];

		const due: Array<{ email: string; tool: string; name: string; touch: number; capturedAt: string }> = [];

		for (const lead of leads) {
			const touchesSent = lead.touches_sent || [];
			const capturedAt = lead.captured_at;
			const daysSince = daysSinceCapture(capturedAt);

			for (const touch of [1, 2, 3]) {
				if (touchesSent.includes(touch)) continue;
				if (daysSince >= TOUCH_OFFSETS[touch]) {
					due.push({
						email: lead.email,
						tool: lead.tool,
						name: lead.name,
						touch,
						capturedAt
					});
					break; // Only one touch per lead per run
				}
			}
		}

		return due;
	}

	/**
	 * Send a nurture touch via Gmail MCP
	 */
	async sendTouch(email: string, tool: string, name: string, touch: number): Promise<string | null> {
		const toolUrl = getToolUrl(tool);
		const template = getTemplate(tool, touch);
		const subject = template.subject;
		const body = template.body(name, toolUrl);

		console.log(`Sending touch ${touch} to ${email} (${tool})...`);

		try {
			// Use the Gmail MCP to send
			const result = await this.sendViaGmailMCP(email, subject, body);
			return result;
		} catch (e) {
			console.error(`Failed to send touch ${touch} to ${email}:`, e);
			return null;
		}
	}

	/**
	 * Send email via Gmail MCP (mcp__google_workspace__send_gmail_message)
	 */
	async sendViaGmailMCP(to: string, subject: string, body: string): Promise<string> {
		// This will be called via the MCP tool from the orchestrator
		// For now, return a placeholder - actual send happens via MCP tool call
		throw new Error('Gmail MCP send must be called via MCP tool from orchestrator');
	}

	/**
	 * Mark touch as sent in nurture state
	 */
	async markTouchSent(email: string, touch: number, messageId: string): Promise<void> {
		const { error } = await this.supabase
			.from('nurture_state')
			.update({
				touches_sent: this.supabase.rpc('array_append', { arr: 'touches_sent', elem: touch }),
				updated_at: new Date().toISOString()
			})
			.eq('email', email);

		if (error) {
			// Fallback: read-modify-write
			const { data: lead } = await this.supabase
				.from('nurture_state')
				.select('touches_sent')
				.eq('email', email)
				.single();

			if (lead) {
				const touches = [...(lead.touches_sent || []), touch];
				await this.supabase
					.from('nurture_state')
					.update({ touches_sent: touches, updated_at: new Date().toISOString() })
					.eq('email', email);
			}
		}

		// Log the send
		this.sentLog.push({
			leadId: email,
			email,
			touch,
			messageId,
			sentAt: new Date().toISOString()
		});
	}

	/**
	 * Run one automation cycle
	 */
	async runCycle(): Promise<{ enrolled: number; touchesSent: number; errors: number }> {
		console.log(`[${new Date().toISOString()}] Starting nurture automation cycle...`);

		let enrolled = 0;
		let touchesSent = 0;
		let errors = 0;

		// 1. Find and enroll new leads
		const newLeads = await this.findNewLeads();
		for (const lead of newLeads) {
			const email = lead.from_email || lead.email || lead.source_email;
			if (!email) continue;

			const inNurture = await this.isLeadInNurture(email);
			if (!inNurture) {
				try {
					await this.enrollLead(lead);
					enrolled++;
				} catch (e) {
					console.error(`Failed to enroll ${email}:`, e);
					errors++;
				}
			}
		}

		// 2. Send due touches
		const dueTouches = await this.getDueTouches();
		for (const { email, tool, name, touch, capturedAt } of dueTouches) {
			try {
				const messageId = await this.sendTouch(email, tool, name, touch);
				if (messageId) {
					await this.markTouchSent(email, touch, messageId);
					touchesSent++;
				} else {
					errors++;
				}
			} catch (e) {
				console.error(`Error sending touch ${touch} to ${email}:`, e);
				errors++;
			}
		}

		console.log(`Cycle complete: ${enrolled} enrolled, ${touchesSent} touches sent, ${errors} errors`);
		return { enrolled, touchesSent, errors };
	}
}

// ---- Database Schema (run in Supabase SQL Editor) ----

export const NURTURE_STATE_SCHEMA = `
-- Nurture State Table — tracks inbound lead nurture sequence progress
-- Run in Supabase SQL Editor

create table if not exists public.nurture_state (
  email text primary key,
  tool text not null,                    -- 'ops_drain', 'revleak', 'website_rater', etc.
  name text not null default 'there',
  captured_at timestamptz not null,
  touches_sent int[] not null default '{}', -- which touches have been sent [1,2,3]
  lead_score int,
  lead_tier text,                        -- 'hot'/'warm'/'cold'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_nurture_captured on public.nurture_state(captured_at desc);
create index if not exists idx_nurture_tool on public.nurture_state(tool);

-- RLS: only service-role can access
alter table public.nurture_state enable row level security;
-- No policies = no anon/authenticated access; service-role bypasses RLS
`;

// ---- Orchestrator (to be called via cron or manually) ----

export async function runNurtureAutomation() {
	const automation = new InternalNurtureAutomation();
	return await automation.runCycle();
}

// For manual testing
export async function testNurtureEmail(tool: string, touch: number, name: string = 'Test User') {
	const toolUrl = getToolUrl(tool);
	const template = getTemplate(tool, touch);
	return {
		subject: template.subject,
		body: template.body(name, toolUrl)
	};
}