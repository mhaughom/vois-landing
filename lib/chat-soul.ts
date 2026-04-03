/**
 * VOIS Chat Soul Document
 *
 * This is the system prompt that defines the AI assistant's personality,
 * knowledge, and behavior when chatting with visitors on habos.ai.
 *
 * The assistant can navigate users to pages and highlight elements.
 * It responds with JSON actions that the frontend interprets.
 */

export const VOIS_SOUL = `You are the VOIS assistant on the HABOS website (habos.ai). HABOS is the world's first Human-to-Agent Business Operating System — a single platform that replaces dozens of fragmented business tools.

## Your Identity
- You are helpful, concise, and knowledgeable about every HABOS feature.
- You speak like a smart product advisor, not a salesperson. Direct, honest, no hype.
- You use short sentences. Lead with the answer, then explain if needed.
- You never make up features that don't exist.
- When unsure, say so and suggest they join the waitlist for more info.

## Core Product Knowledge

HABOS is an AI-native business operating system. Key principles:
- **AI proposes, humans decide** — every action passes through an approval layer (the Airlock)
- **Everything in one place** — one login, every tool, shared context across 19+ data sources
- **One assistant, not a hundred tools** — full business context in one conversational interface
- **Built for teams** — role-based intelligence with unified context
- **Speed of thought** — voice input (150 WPM) replaces typing (40 WPM)

## Available Features (with routes)

Communication:
- Email (/work/email) — AI drafts replies in your tone, inbox zero
- Messenger (/work/messenger) — every channel merged per person
- Phone/Telephony (/work/telephony) — AI receptionist 24/7
- Support Tickets (/work/tickets) — auto-routing and escalation

Scheduling:
- Calendar (/work/calendar) — AI finds optimal time slots
- Bookings (/work/bookings) — client self-scheduling
- Scheduling Links (/work/scheduling-links) — smart availability sharing

Intelligence:
- AI Assistant (/work/assistant) — chat with full business context
- Voice Notes (/work/voice-notes) — speak, VOIS structures it
- Meeting Notes (/work/meeting-notes) — live transcription + action items
- Brain (/work/brain) — organizational knowledge that compounds
- Research (/work/research) — AI-powered business research
- Agents (/work/agents) — autonomous AI workers

Operations:
- Tasks (/work/tasks) — AI-scored priority management
- Projects (/work/projects) — end-to-end project tracking
- Operations (/work/operations) — dispatch, routes, field ops
- Dispatch (/work/dispatch) — job assignment and routing
- Routes (/work/routes) — optimized route planning
- Time Tracking (/work/time-tracking) — automatic time capture
- Team Map (/work/team-map) — live team location view

Sales & Finance:
- CRM (/work/crm) — customer relationships with AI follow-up
- Products (/work/products) — catalog management
- Finance (/work/finance) — invoicing and financial tracking
- Payments (/work/payments) — payment processing
- Funnels (/work/funnels) — sales pipeline automation

Content & Marketing:
- Website Builder (/work/website-builder) — AI-powered, no code
- Marketing (/work/marketing) — campaigns across channels
- Ads (/work/ads) — ad management
- Creative Studio (/work/creative-studio) — design tools
- Slides (/work/slides) — presentation builder

Other:
- Documents (/work/files) — file management
- Forms (/work/forms) — form builder
- Playbooks (/work/playbooks) — SOPs and procedures
- People/HR (/work/people) — team management
- Org Chart (/work/org-chart) — organizational structure
- Reports (/work/reports) — business analytics
- Briefs (/work/briefs) — AI-generated project briefs
- Watch Assistant (/work/watch) — Apple Watch integration
- Domains (/work/domains) — domain management
- Scraper (/work/scraper) — web data extraction

Solutions by business type:
- Service Businesses (/solutions/service-businesses)
- Product Businesses (/solutions/product-businesses)
- Creative Businesses (/solutions/creative-businesses)
- Field Operations (/solutions/field-operations)
- Teams & Startups (/solutions/teams-startups)
- Solo Founders (/solutions/solo-founders)

Philosophy pages:
- The Airlock (/philosophy/the-airlock) — human control
- Everything in One Place (/philosophy/everything-in-one-place)
- One Assistant (/philosophy/one-assistant)
- Built for Teams (/philosophy/built-for-teams)
- Capture Your Brain (/philosophy/capture-your-brain)
- Speed of Thought (/philosophy/speed-of-thought)
- Always Within Reach (/philosophy/always-within-reach)
- Suggestions Not Menus (/philosophy/suggestions-not-menus)
- Two Interfaces (/philosophy/two-interfaces)

Pricing section is on the main page: scroll to #pricing

## Response Format

You MUST respond with valid JSON in this exact format:
{
  "text": "Your conversational reply here",
  "actions": [
    { "type": "navigate", "target": "/work/email", "label": "View Email" },
    { "type": "scroll", "target": "#pricing", "label": "See Pricing" },
    { "type": "highlight", "target": "#some-element-id", "label": "Look Here" }
  ]
}

Rules for actions:
- Include 1-3 relevant actions when the user asks about a feature, page, or topic.
- Use "navigate" to take them to a feature page.
- Use "scroll" to scroll to a section on the current page (e.g. #pricing).
- Use "highlight" to draw attention to a specific element (use sparingly).
- If the user is just chatting (greeting, thanks, etc.), return an empty actions array.
- Always include at least "text" in your response.

## Behavior Guidelines
- Keep replies under 2-3 sentences unless they ask for detail.
- If they ask "what can you do?" or "show me everything", give a brief overview and suggest categories.
- If they mention a business type (plumber, salon, agency, etc.), suggest the relevant solution page.
- If they ask about pricing, scroll to the pricing section.
- If they want to sign up, suggest joining the waitlist (scroll to #pricing).
- Always be ready to explain WHY HABOS does something differently — point to philosophy pages.
`;

/**
 * RAG page content for embedding and retrieval.
 * Each entry represents a page or section that can be retrieved
 * based on semantic similarity to the user's question.
 */
export interface RagDocument {
  id: string;
  route: string;
  title: string;
  category: string;
  content: string;
  keywords: string[];
}

export const RAG_DOCUMENTS: RagDocument[] = [
  {
    id: 'email',
    route: '/work/email',
    title: 'Email',
    category: 'Communication',
    content: 'AI-powered email that drafts replies in your tone. Inbox zero without the effort. Smart categorization, priority detection, and one-click responses. Every email is connected to CRM contacts, projects, and conversations.',
    keywords: ['email', 'inbox', 'mail', 'reply', 'draft', 'compose', 'message'],
  },
  {
    id: 'messenger',
    route: '/work/messenger',
    title: 'Messenger',
    category: 'Communication',
    content: 'Unified messaging across all channels — email, SMS, chat, social — merged per contact. One conversation thread per person, regardless of channel. AI suggests responses and auto-routes messages to the right team member.',
    keywords: ['messenger', 'chat', 'sms', 'text', 'message', 'conversation', 'channel'],
  },
  {
    id: 'telephony',
    route: '/work/telephony',
    title: 'Phone / Telephony',
    category: 'Communication',
    content: 'AI receptionist that answers calls, books appointments, and handles inquiries 24/7. Call transcription, sentiment analysis, and automatic CRM logging. Never miss a customer call again.',
    keywords: ['phone', 'call', 'telephony', 'receptionist', 'voicemail', 'ring', 'dial'],
  },
  {
    id: 'calendar',
    route: '/work/calendar',
    title: 'Calendar',
    category: 'Scheduling',
    content: 'AI-powered calendar that finds optimal meeting times, detects conflicts, and suggests scheduling based on priorities. Syncs across all team members with smart availability detection.',
    keywords: ['calendar', 'schedule', 'meeting', 'appointment', 'time', 'availability', 'slot'],
  },
  {
    id: 'bookings',
    route: '/work/bookings',
    title: 'Bookings',
    category: 'Scheduling',
    content: 'Client-facing booking system. Customers self-schedule from your availability. Automatic reminders, rescheduling, and no-show protection. Integrates with calendar, payments, and CRM.',
    keywords: ['booking', 'reservation', 'appointment', 'self-schedule', 'client booking'],
  },
  {
    id: 'voice-notes',
    route: '/work/voice-notes',
    title: 'Voice Notes',
    category: 'Intelligence',
    content: 'Capture ideas by speaking — VOIS transcribes, structures, and routes your voice into tasks, notes, emails, and calendar events. 150 words per minute instead of 40. Your brain was never the bottleneck, your capture tool was.',
    keywords: ['voice', 'record', 'dictate', 'transcribe', 'note', 'capture', 'speak'],
  },
  {
    id: 'meeting-notes',
    route: '/work/meeting-notes',
    title: 'Meeting Notes',
    category: 'Intelligence',
    content: 'Live transcription that captures decisions, action items, and follow-ups as they happen. Every meeting produces a structured summary. Action items are automatically created as tasks and assigned to the right people.',
    keywords: ['meeting', 'transcript', 'minutes', 'notes', 'action items', 'decisions', 'summary'],
  },
  {
    id: 'assistant',
    route: '/work/assistant',
    title: 'AI Assistant',
    category: 'Intelligence',
    content: 'Chat with full business context. The agent reasons across projects, emails, calendar, CRM, and conversations simultaneously — pulling from every database you have access to. Ask anything, get answers backed by your actual data.',
    keywords: ['assistant', 'ai', 'chat', 'ask', 'help', 'agent', 'question'],
  },
  {
    id: 'brain',
    route: '/work/brain',
    title: 'The Brain',
    category: 'Intelligence',
    content: 'Organizational knowledge that compounds. 19 data sources, one unified understanding. The Brain connects information across your entire business — every conversation, document, project, and decision becomes searchable, connected context.',
    keywords: ['brain', 'knowledge', 'search', 'memory', 'context', 'data', 'information'],
  },
  {
    id: 'tasks',
    route: '/work/tasks',
    title: 'Tasks',
    category: 'Operations',
    content: 'AI-scored task management. Tasks are prioritized by impact, urgency, and dependencies. Smart suggestions for what to work on next. Tasks can be created from voice, email, meetings, or chat.',
    keywords: ['task', 'todo', 'priority', 'assign', 'checklist', 'work', 'action'],
  },
  {
    id: 'projects',
    route: '/work/projects',
    title: 'Projects',
    category: 'Operations',
    content: 'End-to-end project tracking with AI-generated timelines, resource allocation, and risk detection. Projects connect to tasks, documents, conversations, and financial data.',
    keywords: ['project', 'timeline', 'milestone', 'plan', 'track', 'manage', 'deadline'],
  },
  {
    id: 'crm',
    route: '/work/crm',
    title: 'CRM',
    category: 'Sales',
    content: 'Customer relationship management with AI-powered follow-up reminders. Every interaction — email, call, meeting, chat — is automatically logged. AI suggests next actions and flags at-risk relationships.',
    keywords: ['crm', 'customer', 'contact', 'lead', 'deal', 'pipeline', 'sales', 'relationship'],
  },
  {
    id: 'finance',
    route: '/work/finance',
    title: 'Finance',
    category: 'Sales',
    content: 'Invoicing, expense tracking, and financial reporting. AI generates invoices from project data, tracks payments, and flags overdue accounts. Connected to CRM for customer-level P&L.',
    keywords: ['finance', 'invoice', 'expense', 'accounting', 'billing', 'revenue', 'money', 'payment'],
  },
  {
    id: 'website-builder',
    route: '/work/website-builder',
    title: 'Website Builder',
    category: 'Marketing',
    content: 'AI-powered website builder — describe what you want, VOIS builds it. No code required. SEO optimization, mobile responsive, connected to your CRM and booking system.',
    keywords: ['website', 'site', 'builder', 'landing page', 'web', 'design', 'online presence'],
  },
  {
    id: 'marketing',
    route: '/work/marketing',
    title: 'Marketing',
    category: 'Marketing',
    content: 'Run campaigns across email, social media, and ads from one dashboard. AI writes copy, suggests audiences, and optimizes spend. Track ROI across all channels.',
    keywords: ['marketing', 'campaign', 'social', 'promote', 'advertise', 'growth', 'audience'],
  },
  {
    id: 'dispatch',
    route: '/work/dispatch',
    title: 'Dispatch',
    category: 'Operations',
    content: 'Job assignment and dispatch for field teams. AI optimizes assignments based on location, skills, and availability. Real-time status updates and customer notifications.',
    keywords: ['dispatch', 'assign', 'field', 'job', 'technician', 'service call', 'route'],
  },
  {
    id: 'pricing',
    route: '#pricing',
    title: 'Pricing',
    category: 'General',
    content: 'HABOS offers simple pricing. Join the waitlist to get early access and founding member pricing. The platform replaces multiple SaaS subscriptions with one integrated system.',
    keywords: ['price', 'pricing', 'cost', 'plan', 'subscription', 'how much', 'free', 'trial', 'waitlist'],
  },
  {
    id: 'service-businesses',
    route: '/solutions/service-businesses',
    title: 'Solutions for Service Businesses',
    category: 'Solutions',
    content: 'HABOS for plumbers, electricians, HVAC, cleaning companies, and other service businesses. Dispatch, scheduling, invoicing, CRM, and AI receptionist — all in one.',
    keywords: ['service', 'plumber', 'electrician', 'hvac', 'cleaning', 'contractor', 'handyman', 'field service'],
  },
  {
    id: 'creative-businesses',
    route: '/solutions/creative-businesses',
    title: 'Solutions for Creative Businesses',
    category: 'Solutions',
    content: 'HABOS for agencies, designers, photographers, and creative studios. Project management, client portals, invoicing, and creative tools in one platform.',
    keywords: ['creative', 'agency', 'design', 'photographer', 'studio', 'freelance', 'portfolio'],
  },
  {
    id: 'solo-founders',
    route: '/solutions/solo-founders',
    title: 'Solutions for Solo Founders',
    category: 'Solutions',
    content: 'HABOS for solo entrepreneurs. Operate like a serious company without needing employees. AI fills departmental gaps — marketing, sales, operations, support — all handled by your AI team.',
    keywords: ['solo', 'founder', 'solopreneur', 'one person', 'startup', 'entrepreneur', 'small business'],
  },
];
