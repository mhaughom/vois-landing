// Feature content for each face of the hexcube, mapped by TRI_LABELS name
export interface FeatureInfo {
  headline: string;
  body: string;
  closingLine: string;
  demoKey: string;
}

export const FEATURE_MAP: Record<string, FeatureInfo> = {
  'Your Assistant': {
    headline: 'An AI that knows your entire business.',
    body: 'VOIS learns your processes, preferences, history, and context. It doesn\'t just answer questions — it anticipates needs, drafts responses, and acts on your behalf across every tool you use.',
    closingLine: 'Other assistants need instructions. VOIS already knows.',
    demoKey: 'voice-notes',
  },
  'Your Super-Assistant': {
    headline: 'Voice, watch, inbox, memory — one brain.',
    body: 'Speak to your watch, dictate in the car, forward an email, or drop a note. Every input lands in one intelligent system that routes, prioritizes, and remembers everything.',
    closingLine: 'One brain. Every interface.',
    demoKey: 'calendar',
  },
  'Your Day': {
    headline: 'Every morning, planned for you.',
    body: 'VOIS reviews your tasks, calendar, deadlines, and priorities overnight. Each morning you get a proposed schedule with themed time blocks, prep notes for meetings, and flagged items that need attention.',
    closingLine: 'Your day shouldn\'t start with decisions. It should start with a plan.',
    demoKey: 'tasks',
  },
  'Meetings': {
    headline: 'Prepared. Transcribed. Acted on.',
    body: 'Personalized briefings before every meeting. Live transcription with speaker diarization during. Action items extracted and routed to the right projects and people after.',
    closingLine: 'Other tools transcribe. VOIS prepares, captures, and acts.',
    demoKey: 'meeting-notes',
  },
  'Projects': {
    headline: 'Know what needs you before it stalls.',
    body: 'AI health scoring monitors task completion, activity patterns, and timeline progress. When a project goes quiet or a milestone slips, VOIS flags it proactively and suggests next steps.',
    closingLine: 'Dashboards show what happened. VOIS tells you what to do next.',
    demoKey: 'projects',
  },
  'Operations': {
    headline: 'Your business monitors itself.',
    body: 'VOIS watches KPIs, workflows, and recurring processes. When something deviates from normal — a delayed delivery, a missed SLA, a budget overrun — it alerts you with context and recommended action.',
    closingLine: 'Stop firefighting. Start preventing.',
    demoKey: 'research',
  },
  'Clients': {
    headline: 'Every relationship, full context.',
    body: 'VOIS builds rich profiles from every interaction — meetings, emails, notes, tasks. Before any conversation you see the full history, sentiment trends, and AI-suggested talking points.',
    closingLine: 'Your CRM shouldn\'t be a database. It should be a memory.',
    demoKey: 'mail',
  },
  'Documents': {
    headline: 'Talk it out. Get a document back.',
    body: 'Describe what you need — a project brief, a proposal, a weekly update — and VOIS generates a structured document from your voice, pulling context from your projects and data.',
    closingLine: 'Stop staring at blank pages. Start talking.',
    demoKey: 'documents',
  },
  'Finance': {
    headline: 'Every dollar, one view.',
    body: 'Revenue, expenses, invoices, and forecasts unified in a single AI-powered dashboard. VOIS categorizes transactions, flags anomalies, and answers natural-language questions about your numbers.',
    closingLine: 'Your books should explain themselves.',
    demoKey: 'reports',
  },
  'Website': {
    headline: 'Your site, built by AI.',
    body: 'Describe your business and VOIS generates a complete website — copy, layout, images, SEO. Update it by voice. Connect forms, booking, and payments without touching code.',
    closingLine: 'Your website shouldn\'t need a developer.',
    demoKey: 'custom-apps',
  },
  'AI Agents': {
    headline: 'First ten hires don\'t need salaries.',
    body: 'Build your AI team in an org chart. Assign agents to roles — researcher, writer, analyst, ops. Each has responsibilities, tools, budgets, and reporting lines. They plan before acting and pause for approval.',
    closingLine: 'ChatGPT answers questions. VOIS agents complete missions.',
    demoKey: 'agents',
  },
  'Reports': {
    headline: 'Speak your report in 90 seconds.',
    body: 'Upload a template and VOIS extracts every field. Fill the entire report by voice — AI interviews you one field at a time and pre-fills what it already knows from your data.',
    closingLine: 'Ten questions. Done.',
    demoKey: 'reports',
  },
  'Your Team': {
    headline: 'Every employee, a super-assistant.',
    body: 'Give every team member their own AI assistant that knows company context, processes, and history. Onboarding, daily planning, knowledge lookup, and task management — personalized per role.',
    closingLine: 'Scale your best practices to every seat.',
    demoKey: 'team-view',
  },
  'Playbooks': {
    headline: 'Your SOPs, alive and enforced.',
    body: 'Turn standard operating procedures into living workflows. VOIS monitors compliance, guides team members through each step, and flags deviations before they become problems.',
    closingLine: 'SOPs shouldn\'t live in binders. They should run themselves.',
    demoKey: 'live-view',
  },
  'Field to Office': {
    headline: 'The information gap, eliminated.',
    body: 'A technician finishes a job and speaks a 30-second update. The office sees it instantly — structured, filed, and linked to the right project, client, and invoice. No phone calls, no data entry.',
    closingLine: 'The field is never a day behind again.',
    demoKey: 'voice-notes',
  },
  'The Airlock': {
    headline: 'AI power. Human control.',
    body: 'Every AI action goes through the Airlock — a preview card with cryptographic confirmation. The AI proposes, you review the exact output, then approve. Nothing is sent, created, or modified without your explicit sign-off.',
    closingLine: 'Trust isn\'t a setting. It\'s an architecture.',
    demoKey: 'agents',
  },
  'Your Memory': {
    headline: 'Ask anything you\'ve ever said or read.',
    body: 'Search across all 19 data sources — voice recordings, emails, documents, meeting transcripts, CRM notes — with semantic search. VOIS finds the answer even when you can\'t remember which app it was in.',
    closingLine: 'Your second brain, with perfect recall.',
    demoKey: 'research',
  },
  'Growth Engine': {
    headline: 'Share a meeting note. Gain a customer.',
    body: 'Shared meeting notes become a growth channel. Recipients see your company preview, get a promo offer, and sign up into a workspace pre-seeded from their own company data.',
    closingLine: 'Your product sells itself through the work it does.',
    demoKey: 'meeting-notes',
  },
};
