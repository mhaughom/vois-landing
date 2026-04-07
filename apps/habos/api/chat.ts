import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

const ACTIONS_MARKER = '<<ACTIONS>>';
const BREAK_MARKER = '\n---\n';

const SYSTEM_PROMPT = `You are the HABOS assistant on the HABOS website (habos.ai). HABOS is the world's first Human-to-Agent Business Operating System — a single platform that replaces the dozen fragmented tools trades and small businesses juggle every day: scheduling, dispatch, invoicing, CRM, marketing, and more.

## Your Identity
- You talk like a knowledgeable colleague who has been in the trades, not a product advisor or salesperson.
- Direct and warm. No hype, no jargon walls. Think "shop talk with a smart friend."
- Use trades-fluent vocabulary naturally: job costing, dispatch board, technician routing, invoice on-site, service agreements, estimate-to-invoice, crew scheduling, change orders, work orders.
- Write at a 5th-7th grade reading level. Short words beat long ones. "Use" not "utilize." "Fix" not "remediate."
- You never fabricate features, pricing, or capabilities that don't exist.
- When you're unsure or the question is outside your knowledge, say so honestly and suggest they talk to the team: "That's a great question — I'd want the team to give you the right answer. Want me to connect you?" Then suggest navigating to /support.

## How You Chat

You are texting, not writing an essay. Imagine you're messaging a busy contractor between jobs.
- Send 2-3 short messages separated by --- on its own line.
- Each message is its own thought — like hitting "send" between them.
- Keep most messages to 1-2 sentences. Short and punchy.
- NEVER repeat text from a previous message. Each message after --- must be new content.
- **ALWAYS end with a follow-up question as the last message.** The question should feel natural and move the conversation forward. Examples: "What trade are you in?", "How are you handling scheduling right now?", "Want to see how that works?"
- When someone asks for detail, a single longer message is fine. Use markdown (**bold**, *italic*, bullet lists) to make it scannable. Still end with a question as a separate message.
- Don't use headers (#), code blocks, or horizontal rules.

Example (feature question):
HABOS **Email** drafts replies in your tone and keeps your inbox clean — basically AI-powered inbox zero.
---
It also auto-categorizes incoming mail so the important stuff surfaces first.
---
Want me to show you how it works?

Example (casual greeting):
Hey! Welcome to HABOS.
---
What are you looking for? I can walk you through any of our features.

## Concrete Value Language

Always ground benefits in real numbers a business owner understands:
- Time: "Save 10+ hours a week — that's $500+ in billable time you're leaving on the table."
- Money: "Most shops waste $2,000/month on tools that don't talk to each other."
- Cost of inaction: "Every week without automated scheduling is another week of double-bookings and missed jobs."
- Growth: "Businesses using one system for dispatch + invoicing collect payment 3x faster on average."

Use these naturally when relevant — don't force them into every message.

## Objection Handling

When a visitor pushes back, follow this flow: **Acknowledge, Reframe, Reduce Risk, Progress**.

**Pricing / "too expensive":**
1. "Totally fair — every dollar matters when you're running a business."
2. "Most of our users replace 3-5 separate tools. That's usually $300-500/month saved, plus the hours you get back."
3. "You can join the waitlist and lock in founding member pricing — zero commitment."
4. Ask what tools they're currently paying for.

**Competitor mentions / "I already use [X]":**
1. "Nice — [X] does some things well."
2. "Where most people hit a wall is when their CRM doesn't talk to their dispatch board, or invoices live in a different app. That's the gap HABOS fills."
3. Never badmouth competitors. Explore their pain points instead.
4. "What's the one thing you wish [X] did better?"

**"Just browsing" / not ready:**
1. "No pressure at all."
2. "While you're here — want me to show you the one feature most contractors say they wish they'd found sooner?"
3. Keep it light and useful. Don't push.

**"Is this real?" / skepticism:**
1. "Fair question — lots of tools promise the world."
2. Share a specific capability relevant to what they've been browsing.
3. "Join the waitlist and you'll be first to try it. No credit card, no commitment."

## Talk to Our Team

If you cannot answer confidently, if the visitor asks about custom pricing, enterprise needs, or complex integrations, or if they seem frustrated, proactively suggest talking to the team:
- "Want to talk to someone on our team? They can walk you through this in detail."
- Then include a navigate action to /support.

## Navigation Actions

After your last message segment, if you want to suggest navigation actions, add them using this exact format:

<<ACTIONS>>
[{"type":"navigate","target":"/work/email","label":"View Email"}]

Action types:
- "navigate" — go to a /work/* page or /support
- "scroll" — scroll to a homepage section anchor (#hero, #retrieve, #faq, #pricing)
- "email_capture" — show an inline email form in the chat (see Email Capture section)
- "book_meeting" — show a meeting booking button (see Meeting Booking section)

Include 1-3 relevant actions when the user asks about a feature.
When suggesting the user talk to the team, include: {"type":"navigate","target":"/support","label":"Talk to our team"}
If no actions are needed, do NOT include the <<ACTIONS>> section.

## Contact Capture (PRIORITY)

Capturing the visitor's contact info is your #1 priority after the first meaningful exchange. Visitors get distracted and leave — if you don't have their email/phone, that lead is gone forever.

**Timing:** After your FIRST helpful response (answering their question or greeting them), include the contact capture action. Do NOT wait for multiple exchanges.

**How to ask:** Keep it natural and low-friction. Frame it as staying in touch:
- "Drop your email and number so I can send you the details — takes 2 seconds."
- "Want me to send you a breakdown? Leave your info and I'll fire it over."
- "In case you need to run — drop your contact info so we can follow up."

Include a contact_capture action:
<<ACTIONS>>
[{"type":"email_capture","label":"Stay in touch"}]

Rules:
- Include email_capture in your FIRST response that answers a real question. Don't delay.
- NEVER gate information behind the form. Answer their question first, then show the form.
- Only include email_capture ONCE per conversation. If you already asked, don't ask again.
- If the visitor has already shared their info (you'll see this in context), thank them and move on.
- After capturing contact info, continue qualifying as normal.

## Meeting Booking

When a visitor shows strong intent — they've asked detailed questions, discussed pricing, or mentioned their team size — suggest booking a quick demo.

Do NOT suggest this too early. Wait for 4-5 meaningful exchanges minimum, or when they explicitly ask to talk to someone.

Include a book_meeting action:
<<ACTIONS>>
[{"type":"book_meeting","target":"https://calendly.com/hello-tryvois/30min","label":"Book a 15-min demo"}]

Only suggest booking once per conversation. You can combine it with other actions.

## ROI Calculator

When you know the visitor's trade, team size, and current tools — calculate their estimated savings. Use this formula:

- **Admin hours saved**: team_size × 4 hours/week (industry average for scheduling, dispatch, invoicing overhead)
- **Dollar value**: admin_hours × $50/hour (average billable rate for trades)
- **Tool consolidation**: count_of_current_tools × $50/month average per tool
- **Monthly ROI**: dollar_value_per_week × 4 + tool_consolidation_savings

Present it as a clear breakdown, like:
"Here's a quick ROI estimate for your **12-person HVAC** crew:
- **Admin time saved**: ~48 hrs/week × $50 = **$2,400/week**
- **Tools replaced** (6 tools): ~**$300/month** saved
- **Monthly value**: ~**$9,900+/month** back in productivity and savings"

Only calculate when you have enough data (team size at minimum). Keep numbers conservative — it's better to under-promise. Round to clean numbers. Don't present exact HABOS pricing (we don't have public pricing yet — say "founding member pricing is available on the waitlist").`;

// ── RAG: simple keyword-based retrieval (upgrade to pgvector embeddings later) ──

interface RagDoc {
  route: string;
  title: string;
  category: string;
  content: string;
  keywords: string[];
}

const RAG_DOCS: RagDoc[] = [
  { route: '/work/email', title: 'Email', category: 'Communication', content: 'AI-powered email that drafts replies in your tone. Inbox zero without the effort.', keywords: ['email', 'inbox', 'mail', 'reply', 'draft'] },
  { route: '/work/messenger', title: 'Messenger', category: 'Communication', content: 'Unified messaging across all channels merged per contact.', keywords: ['messenger', 'chat', 'sms', 'text', 'message'] },
  { route: '/work/telephony', title: 'Phone', category: 'Communication', content: 'AI receptionist that answers calls and books appointments 24/7.', keywords: ['phone', 'call', 'telephony', 'receptionist'] },
  { route: '/work/calendar', title: 'Calendar', category: 'Scheduling', content: 'AI-powered calendar that finds optimal meeting times.', keywords: ['calendar', 'schedule', 'meeting', 'appointment'] },
  { route: '/work/bookings', title: 'Bookings', category: 'Scheduling', content: 'Client self-scheduling with reminders and no-show protection.', keywords: ['booking', 'reservation', 'appointment'] },
  { route: '/work/voice-notes', title: 'Voice Notes', category: 'Intelligence', content: 'Capture ideas by speaking. 150 WPM instead of 40.', keywords: ['voice', 'record', 'dictate', 'transcribe', 'note'] },
  { route: '/work/meeting-notes', title: 'Meeting Notes', category: 'Intelligence', content: 'Live transcription with auto-extracted action items.', keywords: ['meeting', 'transcript', 'minutes', 'notes'] },
  { route: '/work/assistant', title: 'AI Assistant', category: 'Intelligence', content: 'Chat with full business context across all your data.', keywords: ['assistant', 'ai', 'chat', 'help', 'agent'] },
  { route: '/work/brain', title: 'The Brain', category: 'Intelligence', content: '19 data sources, one unified understanding.', keywords: ['brain', 'knowledge', 'search', 'memory'] },
  { route: '/work/tasks', title: 'Tasks', category: 'Operations', content: 'AI-scored priority task management.', keywords: ['task', 'todo', 'priority', 'assign'] },
  { route: '/work/projects', title: 'Projects', category: 'Operations', content: 'End-to-end project tracking with AI timelines.', keywords: ['project', 'timeline', 'milestone', 'plan'] },
  { route: '/work/crm', title: 'CRM', category: 'Sales', content: 'Customer relationships with AI follow-up reminders.', keywords: ['crm', 'customer', 'contact', 'lead', 'sales', 'pipeline'] },
  { route: '/work/finance', title: 'Finance', category: 'Sales', content: 'Invoicing, expense tracking, financial reporting.', keywords: ['finance', 'invoice', 'expense', 'billing', 'payment', 'money'] },
  { route: '/work/payments', title: 'Payments', category: 'Sales', content: 'Payment processing and tracking.', keywords: ['payment', 'pay', 'charge', 'stripe'] },
  { route: '/work/website-builder', title: 'Website Builder', category: 'Marketing', content: 'AI-powered no-code website builder.', keywords: ['website', 'site', 'builder', 'landing page', 'web'] },
  { route: '/work/marketing', title: 'Marketing', category: 'Marketing', content: 'Campaigns across email, social, and ads.', keywords: ['marketing', 'campaign', 'social', 'promote'] },
  { route: '/work/ads', title: 'Ads', category: 'Marketing', content: 'Ad management and optimization.', keywords: ['ads', 'advertise', 'google ads', 'facebook ads'] },
  { route: '/work/dispatch', title: 'Dispatch', category: 'Operations', content: 'Field team job assignment and routing.', keywords: ['dispatch', 'field', 'job', 'technician', 'route'] },
  { route: '/work/operations', title: 'Operations', category: 'Operations', content: 'Complete operations management for field businesses.', keywords: ['operations', 'ops', 'field', 'manage'] },
  { route: '/work/reports', title: 'Reports', category: 'Intelligence', content: 'AI-generated business analytics and dashboards.', keywords: ['report', 'analytics', 'dashboard', 'metrics', 'data'] },
  { route: '/work/tickets', title: 'Support Tickets', category: 'Communication', content: 'Auto-routing support tickets with escalation.', keywords: ['ticket', 'support', 'help desk', 'issue'] },
  { route: '/work/forms', title: 'Forms', category: 'Other', content: 'Form builder connected to your workflows.', keywords: ['form', 'survey', 'questionnaire', 'input'] },
  { route: '/work/people', title: 'People / HR', category: 'Other', content: 'Team management and HR tools.', keywords: ['people', 'hr', 'team', 'employee', 'staff', 'hire'] },
  { route: '/work/research', title: 'Research', category: 'Intelligence', content: 'AI-powered business research and competitive intelligence.', keywords: ['research', 'competitive', 'market', 'analysis'] },
  { route: '/work/agents', title: 'AI Agents', category: 'Intelligence', content: 'Autonomous AI workers that handle tasks end-to-end.', keywords: ['agent', 'autonomous', 'automate', 'worker'] },
  { route: '/work/creative-studio', title: 'Creative Studio', category: 'Marketing', content: 'Design tools for social media, presentations, and marketing materials.', keywords: ['creative', 'design', 'graphic', 'image', 'photo'] },
  { route: '/work/slides', title: 'Slides', category: 'Marketing', content: 'AI-powered presentation builder.', keywords: ['slides', 'presentation', 'deck', 'powerpoint'] },
  { route: '#pricing', title: 'Pricing', category: 'General', content: 'Simple pricing. Join waitlist for founding member pricing.', keywords: ['price', 'cost', 'plan', 'how much', 'free', 'trial', 'waitlist', 'sign up'] },
  { route: '/solutions/service-businesses', title: 'For Service Businesses', category: 'Solutions', content: 'For plumbers, electricians, HVAC, cleaning, contractors.', keywords: ['service', 'plumber', 'electrician', 'hvac', 'cleaning', 'contractor'] },
  { route: '/solutions/creative-businesses', title: 'For Creative Businesses', category: 'Solutions', content: 'For agencies, designers, photographers, creative studios.', keywords: ['agency', 'designer', 'photographer', 'creative', 'studio'] },
  { route: '/solutions/solo-founders', title: 'For Solo Founders', category: 'Solutions', content: 'Operate like a serious company without employees.', keywords: ['solo', 'founder', 'solopreneur', 'entrepreneur', 'one person'] },
  { route: '/solutions/teams-startups', title: 'For Teams & Startups', category: 'Solutions', content: 'Scale operations without scaling headcount.', keywords: ['team', 'startup', 'scale', 'grow'] },
  { route: '/philosophy/the-airlock', title: 'The Airlock', category: 'Philosophy', content: 'AI proposes, you decide. Human control over every action.', keywords: ['airlock', 'control', 'safety', 'approval', 'human'] },
  { route: '/philosophy/everything-in-one-place', title: 'Everything in One Place', category: 'Philosophy', content: 'One login, every tool, shared context.', keywords: ['unified', 'one place', 'integrated', 'all-in-one'] },
];

function retrieveContext(query: string, topK = 5): string {
  const q = query.toLowerCase();
  const scored = RAG_DOCS.map((doc) => {
    let score = 0;
    for (const kw of doc.keywords) {
      if (q.includes(kw.toLowerCase())) score += 2;
    }
    if (q.includes(doc.title.toLowerCase())) score += 3;
    if (q.includes(doc.category.toLowerCase())) score += 1;
    const words = q.split(/\s+/);
    for (const w of words) {
      if (w.length < 3) continue;
      for (const kw of doc.keywords) {
        if (kw.includes(w) || w.includes(kw)) score += 1;
      }
    }
    return { doc, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  if (scored.length === 0) return '';

  return '\n\n## Relevant Features (from RAG retrieval)\n' +
    scored.map((s) => `- **${s.doc.title}** (${s.doc.route}): ${s.doc.content}`).join('\n');
}

function sendSSE(res: VercelResponse, data: Record<string, unknown>) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

// ── Rate limiting (in-memory, per serverless instance) ──
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 20; // max requests per window per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

import { getCorsOrigin, setCorsHeaders } from './_cors';

const MAX_MESSAGE_LENGTH = 500;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS — restrict to known origins
  const allowedOrigin = getCorsOrigin(req);
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Rate limiting
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
    || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }

  const { message, history, currentPage, language, emailCaptured, returningVisitor, referralSource, leadScore } = req.body as {
    message: string;
    history?: { role: 'user' | 'assistant'; text: string }[];
    currentPage?: string;
    language?: string;
    emailCaptured?: boolean;
    returningVisitor?: { visitCount: number; lastPages: string[] };
    referralSource?: string;
    leadScore?: { score: number; tier: string; factors: string[] };
  };

  if (!message) return res.status(400).json({ error: 'Message required' });
  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)` });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const client = new Anthropic({ apiKey });

    const ragContext = retrieveContext(message);

    // Build page-aware context so the AI knows where the user is browsing
    let pageContext = '';
    if (currentPage) {
      const currentPageDoc = RAG_DOCS.find(d => d.route === currentPage);
      if (currentPageDoc) {
        pageContext = `\n\n## Current Page Context\nThe user is currently viewing the **${currentPageDoc.title}** page (${currentPageDoc.route}). ${currentPageDoc.content} Tailor your responses to be relevant to what they're looking at when appropriate.`;
      } else if (currentPage.startsWith('/solutions/')) {
        pageContext = `\n\n## Current Page Context\nThe user is browsing a solutions page (${currentPage}). They're likely evaluating HABOS for their business type.`;
      } else if (currentPage.startsWith('/philosophy/')) {
        pageContext = `\n\n## Current Page Context\nThe user is reading about HABOS philosophy (${currentPage}). They're interested in the principles behind the product.`;
      }
    }

    if (emailCaptured) {
      pageContext += '\n\nNote: The visitor has already shared their email address. Do NOT ask for it again or include email_capture actions.';
    }

    if (returningVisitor && returningVisitor.visitCount > 1) {
      const pages = returningVisitor.lastPages.join(', ') || 'the site';
      pageContext += `\n\nNote: This is a returning visitor (visit #${returningVisitor.visitCount}). They previously browsed: ${pages}. Reference their prior interest when relevant but don't be creepy about it.`;
    }

    if (referralSource) {
      const sourceHints: Record<string, string> = {
        paid: 'This visitor came from a paid ad — they are likely comparing options with high intent. Be direct about value, move toward booking faster.',
        organic: 'This visitor found us through search — they are in research mode. Lead with education and value before any ask.',
        social: 'This visitor came from social media — they may be casually curious. Keep it light and engaging.',
        direct: 'This visitor came directly — they already know about us. Skip the intro, get to specifics.',
        referral: 'This visitor was referred — they already have some trust. Lean into that.',
      };
      if (sourceHints[referralSource]) {
        pageContext += `\n\n${sourceHints[referralSource]}`;
      }
    }

    if (leadScore) {
      pageContext += `\n\nLead score: ${leadScore.score}/100 (${leadScore.tier}). Factors: ${leadScore.factors.join(', ')}. ${
        leadScore.tier === 'hot' ? 'This is a high-intent lead — prioritize booking a demo or capturing email if not already done.' :
        leadScore.tier === 'warm' ? 'This lead is warming up — keep delivering value and look for the right moment to ask for email.' :
        'This is an early-stage visitor — focus on education and building trust. No hard asks yet.'
      }`;
    }

    // Language instruction — respond in the user's interface language
    const LOCALE_TO_LANGUAGE: Record<string, string> = {
      no: 'Norwegian (Norsk)', sv: 'Swedish (Svenska)', da: 'Danish (Dansk)',
      de: 'German (Deutsch)', fr: 'French (Français)', es: 'Spanish (Español)',
      nl: 'Dutch (Nederlands)', fi: 'Finnish (Suomi)', it: 'Italian (Italiano)',
      pt: 'Portuguese (Português)', ar: 'Arabic (العربية)', hi: 'Hindi (हिन्दी)',
      ja: 'Japanese (日本語)', ko: 'Korean (한국어)', zh: 'Chinese Simplified (简体中文)',
    };
    const userLanguage = language ? LOCALE_TO_LANGUAGE[language] : undefined;
    if (userLanguage) {
      pageContext += `\n\n**LANGUAGE REQUIREMENT**: The user's interface is in **${userLanguage}**. You MUST write every response entirely in ${userLanguage}. This includes all messages, questions, and action labels.`;
    }

    const recentHistory = (history || []).slice(-30).map((h) => ({
      role: h.role as 'user' | 'assistant',
      content: h.text,
    }));

    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT + ragContext + pageContext,
      messages: [
        ...recentHistory,
        { role: 'user', content: message },
      ],
    });

    let buffer = '';
    let actionsStarted = false;
    let actionsBuffer = '';

    // We accumulate the FULL response in `buffer`, then only process it once
    // the stream ends. This avoids all marker-splitting issues — no partial
    // BREAK_MARKER or ACTIONS_MARKER can slip through chunk boundaries.

    for await (const event of stream) {
      if (event.type !== 'content_block_delta' || event.delta.type !== 'text_delta') continue;

      const delta = event.delta.text;
      buffer += delta;
    }

    // Split off actions block if present
    const actionsIdx = buffer.indexOf(ACTIONS_MARKER);
    let textContent: string;
    if (actionsIdx !== -1) {
      textContent = buffer.substring(0, actionsIdx).trimEnd();
      actionsBuffer = buffer.substring(actionsIdx + ACTIONS_MARKER.length);
      actionsStarted = true;
    } else {
      textContent = buffer;
    }

    // Split on break markers and emit each bubble as delta + break
    const segments = textContent.split(BREAK_MARKER);
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i].trim();
      if (seg) sendSSE(res, { type: 'delta', text: seg });
      if (i < segments.length - 1) sendSSE(res, { type: 'break' });
    }

    // Parse actions from the actions buffer
    let actions: unknown[] = [];
    if (actionsBuffer.trim()) {
      try {
        actions = JSON.parse(actionsBuffer.trim());
      } catch { /* ignore malformed actions */ }
    }

    sendSSE(res, { type: 'done', actions });
    res.end();
  } catch (err: unknown) {
    console.error('Chat API error:', err);
    sendSSE(res, { type: 'error', text: "Sorry, I'm having trouble right now. Try asking about a specific feature!" });
    res.end();
  }
}
