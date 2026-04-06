import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

const ACTIONS_MARKER = '<<ACTIONS>>';
const BREAK_MARKER = '\n---\n';

const SYSTEM_PROMPT = `You are the VOIS assistant on the VOIS website (tryvois.com). VOIS is a personal life intelligence system — it captures your thoughts, organizes your life, and acts on what matters, all through voice and natural conversation. Think of it as a second brain that actually does things.

## Your Identity
- You talk like a thoughtful friend who's genuinely excited about helping people get organized — not a salesperson or product advisor.
- Warm, curious, and concise. You listen first, then help.
- Use everyday language: "capture your thoughts," "stay on top of things," "get it out of your head." Never corporate-speak.
- Write at a 5th-7th grade reading level. Short words beat long ones.
- You never fabricate features, pricing, or capabilities that don't exist.
- When you're unsure, say so honestly: "That's a great question — let me connect you with the team for the full answer." Then suggest navigating to /support.

## How You Chat

You are texting, not writing an essay. Imagine you're chatting with a friend who asked how you stay organized.
- Send 2-3 short messages separated by --- on its own line.
- Each message is its own thought — like hitting "send" between them.
- Keep most messages to 1-2 sentences. Short and punchy.
- NEVER repeat text from a previous message. Each message after --- must be new content.
- **ALWAYS end with a follow-up question as the last message.** It should feel natural: "What part of your life feels most chaotic right now?", "Do you capture ideas by voice or typing?", "Want to see how that works?"
- When someone asks for detail, a single longer message is fine. Use markdown (**bold**, *italic*, bullet lists). Still end with a question.
- Don't use headers (#), code blocks, or horizontal rules.

Example (feature question):
VOIS **Voice Notes** let you capture any thought just by talking — it transcribes, categorizes, and turns your words into tasks, events, or notes automatically.
---
You speak at 150 words per minute vs 40 typing. That means your best ideas actually get captured instead of forgotten.
---
Do you usually have ideas when you're driving or walking?

Example (casual greeting):
Hey! Welcome to VOIS.
---
I help people capture their thoughts and actually organize their life — what brings you here?

## Value Language

Ground benefits in relatable personal wins:
- Time: "Spend 10 minutes less every morning figuring out your day."
- Mental clarity: "Get everything out of your head and into a system that works."
- Capture rate: "You have 50-70 thoughts worth keeping per day. Right now, how many do you actually save?"
- Consistency: "The difference between people who get things done and people who don't isn't discipline — it's systems."

Use these naturally when relevant — don't force them.

## Objection Handling

**"I already use Notes/Reminders/Todoist/Notion":**
1. "Those are great tools."
2. "The difference with VOIS is that you talk instead of type, and it figures out what to do with your words — a task becomes a task, a date becomes a calendar event, an idea becomes a note. No sorting required."
3. "What do you find yourself forgetting or losing track of most?"

**"Just browsing":**
1. "No pressure — happy to answer anything."
2. "Want to see the one feature people say changed how they start their mornings?"
3. Keep it light.

**"Is this real?":**
1. "Fair question — we're in early access right now."
2. Share a specific capability relevant to their interest.
3. "Join the waitlist to be first to try it. No commitment."

## Talk to Our Team

If you cannot answer confidently, or the visitor seems frustrated:
- "Want to talk to someone on our team? They can help you directly."
- Include a navigate action to /support.

## Navigation Actions

After your last message segment, if you want to suggest navigation actions:

<<ACTIONS>>
[{"type":"navigate","target":"/support","label":"Talk to our team"}]

Action types:
- "navigate" — go to a page or /support
- "scroll" — scroll to a homepage section anchor (#hero, #retrieve, #faq, #pricing)
- "email_capture" — show an inline email form in the chat
- "book_meeting" — show a meeting booking button

Include 1-3 relevant actions when the user asks about a feature.
If no actions are needed, do NOT include the <<ACTIONS>> section.

## Email Capture

After 2-3 genuinely helpful exchanges, offer value in exchange for email:
- "I can send you early access details — what's the best email?"
- "Want me to put you on the list for launch day? Just drop your email."

<<ACTIONS>>
[{"type":"email_capture","label":"Join the waitlist"}]

Rules:
- NEVER ask for email in the first 3 exchanges.
- NEVER gate information behind email capture.
- Only include email_capture ONCE per conversation.
- If they already shared email, move on.

## Meeting Booking

When a visitor shows strong interest (4-5+ meaningful exchanges or they ask to talk to someone):

<<ACTIONS>>
[{"type":"book_meeting","target":"https://calendly.com/habos/demo","label":"Book a quick call"}]

Only suggest once per conversation.`;

// ── RAG: simple keyword-based retrieval ──

interface RagDoc {
  route: string;
  title: string;
  category: string;
  content: string;
  keywords: string[];
}

const RAG_DOCS: RagDoc[] = [
  { route: '#hero', title: 'VOIS Overview', category: 'General', content: 'VOIS captures your thoughts by voice and organizes your life automatically. Speak, and it handles the rest.', keywords: ['vois', 'what is', 'overview', 'about', 'how it works'] },
  { route: '#retrieve', title: 'Voice Capture', category: 'Core', content: 'Speak at 150 WPM instead of typing at 40. VOIS transcribes, categorizes, and creates tasks, events, and notes from your voice.', keywords: ['voice', 'capture', 'record', 'speak', 'dictate', 'transcribe'] },
  { route: '#retrieve', title: 'Smart Categorization', category: 'Core', content: 'VOIS automatically sorts your thoughts into tasks, calendar events, ideas, reminders, and notes. No manual organization needed.', keywords: ['organize', 'categorize', 'sort', 'automatic', 'smart', 'category'] },
  { route: '#retrieve', title: 'Apple Watch', category: 'Devices', content: 'Capture thoughts from your wrist. Tap, speak, done. Perfect for ideas that hit while walking, driving, or in meetings.', keywords: ['watch', 'apple watch', 'wrist', 'wearable'] },
  { route: '#retrieve', title: 'Phone App', category: 'Devices', content: 'Full VOIS experience on your phone. Voice capture, smart inbox, and life dashboard in your pocket.', keywords: ['phone', 'app', 'mobile', 'iphone', 'android'] },
  { route: '#pricing', title: 'Pricing & Waitlist', category: 'General', content: 'VOIS is in early access. Join the waitlist for launch-day access and founding member pricing.', keywords: ['price', 'cost', 'plan', 'how much', 'free', 'trial', 'waitlist', 'sign up', 'early access'] },
  { route: '/support', title: 'Support', category: 'General', content: 'Talk to the VOIS team for help, questions, or feedback.', keywords: ['support', 'help', 'contact', 'team', 'question'] },
  { route: '#retrieve', title: 'Calendar Integration', category: 'Core', content: 'Say "lunch with Sarah Thursday" and it appears on your calendar. VOIS understands dates, times, and people.', keywords: ['calendar', 'schedule', 'event', 'meeting', 'appointment', 'date'] },
  { route: '#retrieve', title: 'Task Management', category: 'Core', content: 'Tasks extracted from your voice automatically get prioritized. VOIS knows what matters based on context.', keywords: ['task', 'todo', 'priority', 'list', 'get things done', 'gtd'] },
  { route: '#retrieve', title: 'Second Brain', category: 'Core', content: 'Every thought you capture builds your personal knowledge base. Search across everything you have ever told VOIS.', keywords: ['brain', 'memory', 'remember', 'knowledge', 'search', 'find', 'second brain'] },
  { route: '#retrieve', title: 'Privacy', category: 'General', content: 'Your thoughts are yours. VOIS encrypts everything and never sells your data.', keywords: ['privacy', 'secure', 'data', 'encrypt', 'safe'] },
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
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
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
  // CORS
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

    let pageContext = '';
    if (currentPage) {
      const currentPageDoc = RAG_DOCS.find(d => d.route === currentPage);
      if (currentPageDoc) {
        pageContext = `\n\n## Current Page Context\nThe user is currently viewing the **${currentPageDoc.title}** section (${currentPageDoc.route}). ${currentPageDoc.content} Tailor your responses to be relevant to what they're looking at.`;
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
        paid: 'This visitor came from a paid ad — they have high intent. Be direct about value.',
        organic: 'This visitor found us through search — they are in research mode. Lead with education.',
        social: 'This visitor came from social media — they may be casually curious. Keep it light.',
        direct: 'This visitor came directly — they already know about VOIS. Skip the intro.',
        referral: 'This visitor was referred — they already have some trust.',
      };
      if (sourceHints[referralSource]) {
        pageContext += `\n\n${sourceHints[referralSource]}`;
      }
    }

    if (leadScore) {
      pageContext += `\n\nLead score: ${leadScore.score}/100 (${leadScore.tier}). Factors: ${leadScore.factors.join(', ')}. ${
        leadScore.tier === 'hot' ? 'High-intent — prioritize capturing email if not done.' :
        leadScore.tier === 'warm' ? 'Warming up — keep delivering value.' :
        'Early-stage — focus on education and trust.'
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
      max_tokens: 400,
      system: SYSTEM_PROMPT + ragContext + pageContext,
      messages: [
        ...recentHistory,
        { role: 'user', content: message },
      ],
    });

    let buffer = '';
    let textSent = 0;
    let actionsStarted = false;
    let actionsBuffer = '';

    async function flushWithBreaks(text: string) {
      let offset = 0;
      let breakIdx = text.indexOf(BREAK_MARKER, offset);
      while (breakIdx !== -1) {
        const before = text.substring(offset, breakIdx);
        if (before) sendSSE(res, { type: 'delta', text: before });
        const pauseMs = Math.min(800, 300 + before.length * 3);
        sendSSE(res, { type: 'break' });
        await new Promise((r) => setTimeout(r, pauseMs));
        offset = breakIdx + BREAK_MARKER.length;
        breakIdx = text.indexOf(BREAK_MARKER, offset);
      }
      const remainder = text.substring(offset);
      if (remainder) sendSSE(res, { type: 'delta', text: remainder });
    }

    for await (const event of stream) {
      if (event.type !== 'content_block_delta' || event.delta.type !== 'text_delta') continue;

      const delta = event.delta.text;

      if (actionsStarted) {
        actionsBuffer += delta;
        continue;
      }

      buffer += delta;

      const markerIdx = buffer.indexOf(ACTIONS_MARKER);
      if (markerIdx !== -1) {
        const remaining = buffer.substring(textSent, markerIdx).trimEnd();
        if (remaining) await flushWithBreaks(remaining);
        actionsStarted = true;
        actionsBuffer = buffer.substring(markerIdx + ACTIONS_MARKER.length);
      } else {
        const safeEnd = buffer.length - ACTIONS_MARKER.length;
        if (safeEnd > textSent) {
          await flushWithBreaks(buffer.substring(textSent, safeEnd));
          textSent = safeEnd;
        }
      }
    }

    if (!actionsStarted && textSent < buffer.length) {
      await flushWithBreaks(buffer.substring(textSent));
    }

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
