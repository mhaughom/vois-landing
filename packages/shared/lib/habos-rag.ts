/**
 * Shared HABOS knowledge base + retrieval.
 *
 * Extracted from apps/habos/api/chat.ts so it can be reused by:
 * - The habos chat endpoint (website chat panel)
 * - The research-agent support-reply suggester (/api/support/suggest-reply)
 *
 * Keep this file as the single source of truth for HABOS product facts.
 * When HABOS capabilities change, update this file and both consumers will
 * automatically reflect the change.
 */

export interface RagDoc {
  route: string;
  title: string;
  category: string;
  content: string;
  keywords: string[];
}

export const RAG_DOCS: RagDoc[] = [
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

export interface ScoredDoc {
  doc: RagDoc;
  score: number;
}

/**
 * Score every RAG doc against a query and return the top K.
 * Simple keyword-based scoring — no embeddings. Good enough for a small
 * knowledge base; upgrade to pgvector if the doc count grows past ~100.
 */
export function scoreRelevantDocs(query: string, topK = 5): ScoredDoc[] {
  const q = query.toLowerCase();
  return RAG_DOCS.map((doc): ScoredDoc => {
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
}

/**
 * Render the top-K relevant docs as a markdown block suitable for injection
 * into a Claude prompt as "## Relevant Features". Returns empty string when
 * nothing matches.
 */
export function retrieveContext(query: string, topK = 5): string {
  const scored = scoreRelevantDocs(query, topK);
  if (scored.length === 0) return '';
  return (
    '\n\n## Relevant Features (from RAG retrieval)\n' +
    scored
      .map((s) => `- **${s.doc.title}** (${s.doc.route}): ${s.doc.content}`)
      .join('\n')
  );
}

/**
 * HABOS tone guide for email replies (shorter than chat.ts's full SYSTEM_PROMPT).
 * Used by the research-agent's suggest-reply endpoint. Keep this in sync with
 * the identity + writing-style sections of chat.ts SYSTEM_PROMPT — the goal is
 * for chat replies and email replies to sound like the same person.
 */
export const HABOS_EMAIL_TONE_GUIDE = `You are writing as Mathias Haughom, founder of HABOS (habos.ai). HABOS is the world's first Human-to-Agent Business Operating System — a single platform that replaces the dozen fragmented tools trades and small businesses juggle every day.

Voice and style:
- Talk like a knowledgeable colleague who has been in the trades, not a product advisor or salesperson.
- Direct and warm. No hype, no jargon walls.
- Use trades-fluent vocabulary naturally where it fits: job costing, dispatch, technician routing, invoice on-site, service agreements, crew scheduling.
- Write at a 5th-7th grade reading level. Short words beat long ones.
- Never fabricate features, pricing, or capabilities. If you're unsure, say so honestly and offer to connect them with the team.

Concrete value language (use naturally when relevant, don't force):
- Time: "Save 10+ hours a week — that's $500+ in billable time you're leaving on the table."
- Money: "Most shops waste $2,000/month on tools that don't talk to each other."
- Growth: "Businesses using one system for dispatch + invoicing collect payment 3x faster."

Objection handling flow: Acknowledge, Reframe, Reduce Risk, Progress. Never badmouth competitors — explore the asker's pain points instead.

Escalation: If you can't answer confidently, or the question is outside what the knowledge base supports, say so honestly and offer to have the team follow up. Do not guess.`;
