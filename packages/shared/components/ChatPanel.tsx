import React, { useState, useRef, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, ExternalLink, LifeBuoy, Mail, Check, Loader2, Calendar } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';
import { waitlistService } from '../lib/supabase';
import { Analytics } from '../lib/analytics';
import { initVisitorProfile, getVisitorProfile, isReturningVisitor, getVisitorId, updateVisitorPages, setVisitorEmail, getReferralSource, calculateLeadScore } from '../lib/visitorProfile';

// ═══════════════════════════════════════════════════════════════════
// Chat Navigation Context — lets the AI navigate pages & highlight elements
// ═══════════════════════════════════════════════════════════════════

export interface ChatAction {
  type: 'navigate' | 'highlight' | 'scroll' | 'email_capture' | 'book_meeting';
  /** Route path for navigate, CSS selector or element ID for highlight/scroll */
  target: string;
  /** Optional label shown as a clickable chip in the chat */
  label?: string;
}

export interface ChatMessageData {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  /** Actions the assistant can attach (navigate links, highlight targets) */
  actions?: ChatAction[];
  /** Debug: how many bubbles the AI replied with for this response (set on last bubble) */
  _debugBubbleCount?: number;
}

interface ChatNavContextValue {
  /** Navigate to a route and optionally highlight an element */
  navigateTo: (path: string) => void;
  /** Highlight a DOM element by selector — adds a pulsing ring overlay */
  highlightElement: (selector: string) => void;
  /** Clear any active highlight */
  clearHighlight: () => void;
  /** Scroll an element into view by selector */
  scrollToElement: (selector: string) => void;
}

const ChatNavContext = createContext<ChatNavContextValue>({
  navigateTo: () => {},
  highlightElement: () => {},
  clearHighlight: () => {},
  scrollToElement: () => {},
});

export const useChatNav = () => useContext(ChatNavContext);

// ═══════════════════════════════════════════════════════════════════
// Highlight Overlay — renders a pulsing ring around a target element
// ═══════════════════════════════════════════════════════════════════

const HighlightOverlay: React.FC<{ selector: string | null; onClear: () => void }> = ({ selector, onClear }) => {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!selector) { setRect(null); return; }
    const el = document.querySelector(selector);
    if (!el) { setRect(null); return; }

    const update = () => setRect(el.getBoundingClientRect());
    update();

    // Re-measure on scroll/resize
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    // Auto-clear after 4s
    const timer = setTimeout(onClear, 4000);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
      clearTimeout(timer);
    };
  }, [selector, onClear]);

  if (!rect) return null;

  const pad = 8;
  return (
    <div
      className="fixed inset-0 z-[60] pointer-events-none"
      onClick={onClear}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="absolute rounded-xl"
        style={{
          top: rect.top - pad,
          left: rect.left - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.5), 0 0 24px rgba(59, 130, 246, 0.15)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// Intent matcher — maps user questions to navigation actions
// This is the groundwork for AI-powered navigation.
// Replace this with a real LLM call when ready.
// ═══════════════════════════════════════════════════════════════════

interface IntentMatch {
  reply: string;
  actions: ChatAction[];
}

const INTENT_PATTERNS: { patterns: RegExp[]; match: IntentMatch }[] = [
  {
    patterns: [/email/i, /mail/i, /inbox/i],
    match: {
      reply: "Here's our Email feature — AI drafts replies in your tone and keeps your inbox clean.",
      actions: [
        { type: 'navigate', target: '/work/email', label: 'View Email' },
      ],
    },
  },
  {
    patterns: [/calendar/i, /schedule/i, /booking/i],
    match: {
      reply: "Check out our Calendar & Scheduling tools — AI finds the perfect time slots.",
      actions: [
        { type: 'navigate', target: '/work/calendar', label: 'View Calendar' },
        { type: 'navigate', target: '/work/bookings', label: 'View Bookings' },
      ],
    },
  },
  {
    patterns: [/task/i, /todo/i, /project/i],
    match: {
      reply: "Our task management uses AI scoring to surface what matters most.",
      actions: [
        { type: 'navigate', target: '/work/tasks', label: 'View Tasks' },
        { type: 'navigate', target: '/work/projects', label: 'View Projects' },
      ],
    },
  },
  {
    patterns: [/voice/i, /record/i, /note/i, /transcri/i],
    match: {
      reply: "Voice Notes capture your thoughts instantly — just speak and HABOS structures it.",
      actions: [
        { type: 'navigate', target: '/work/voice-notes', label: 'Voice Notes' },
        { type: 'navigate', target: '/work/meeting-notes', label: 'Meeting Notes' },
      ],
    },
  },
  {
    patterns: [/crm/i, /customer/i, /contact/i, /lead/i],
    match: {
      reply: "The CRM keeps every customer interaction in one place with AI-powered follow-up reminders.",
      actions: [
        { type: 'navigate', target: '/work/crm', label: 'View CRM' },
      ],
    },
  },
  {
    patterns: [/website/i, /site builder/i, /landing page/i],
    match: {
      reply: "Build your website with our AI-powered builder — no code required.",
      actions: [
        { type: 'navigate', target: '/work/website-builder', label: 'Website Builder' },
      ],
    },
  },
  {
    patterns: [/pric/i, /cost/i, /plan/i, /how much/i],
    match: {
      reply: "Let me take you to our pricing section.",
      actions: [
        { type: 'scroll', target: '#pricing', label: 'View Pricing' },
      ],
    },
  },
  {
    patterns: [/phone/i, /call/i, /telephon/i],
    match: {
      reply: "Our AI receptionist answers calls, books appointments, and handles inquiries 24/7.",
      actions: [
        { type: 'navigate', target: '/work/telephony', label: 'View Phone' },
      ],
    },
  },
  {
    patterns: [/agent/i, /assistant/i, /ai/i, /brain/i],
    match: {
      reply: "Every employee gets a personal AI agent with full business context.",
      actions: [
        { type: 'navigate', target: '/work/assistant', label: 'AI Assistant' },
        { type: 'navigate', target: '/work/brain', label: 'The Brain' },
      ],
    },
  },
  {
    patterns: [/marketing/i, /ads/i, /campaign/i, /social/i],
    match: {
      reply: "Run campaigns across email, social, and ads — all from one dashboard.",
      actions: [
        { type: 'navigate', target: '/work/marketing', label: 'Marketing' },
        { type: 'navigate', target: '/work/ads', label: 'Ads' },
      ],
    },
  },
  {
    patterns: [/invoice/i, /payment/i, /financ/i, /billing/i],
    match: {
      reply: "Handle invoicing, payments, and financial tracking in one place.",
      actions: [
        { type: 'navigate', target: '/work/finance', label: 'Finance' },
        { type: 'navigate', target: '/work/payments', label: 'Payments' },
      ],
    },
  },
];

function matchIntent(text: string): IntentMatch | null {
  for (const { patterns, match } of INTENT_PATTERNS) {
    if (patterns.some((p) => p.test(text))) return match;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════
// Page-aware proactive suggestions
// ═══════════════════════════════════════════════════════════════════

interface PageSuggestion {
  message: string;
  suggestion: string;
  /** Delay in ms before showing the proactive popup. Defaults to DEFAULT_PROACTIVE_DELAY_MS. */
  delay?: number;
  /** Scroll depth (0-1) that also triggers the popup. Undefined = no scroll trigger. */
  scrollTrigger?: number;
  /** Exit-intent message shown when mouse leaves viewport (desktop only). */
  exitMessage?: string;
  /** Exit-intent suggestion sent as chat message on click. */
  exitSuggestion?: string;
}

const PAGE_SUGGESTIONS: Record<string, PageSuggestion> = {
  // Homepage — time to orient (25s, no scroll trigger)
  '/': { message: 'Welcome! Want a quick tour?', suggestion: 'What can HABOS do for my business?', delay: 25000, exitMessage: 'Leaving already? Got any questions before you go?', exitSuggestion: "What's holding you back?" },

  // Feature hub (30s + 40% scroll)
  '/work': { message: 'Exploring features?', suggestion: 'Which tools are right for my business?', delay: 30000, scrollTrigger: 0.4, exitMessage: 'Before you go — want a quick recommendation?', exitSuggestion: 'Which tools fit my business?' },

  // Feature pages (35s + 50% scroll)
  '/work/crm': { message: 'Need help with customer management?', suggestion: 'How does the CRM work?', delay: 35000, scrollTrigger: 0.5, exitMessage: 'Still have questions about the CRM?', exitSuggestion: 'How is it different from HubSpot?' },
  '/work/email': { message: 'Curious about AI-powered email?', suggestion: 'How does HABOS handle email?', delay: 35000, scrollTrigger: 0.5, exitMessage: 'Want to see how AI email actually works?', exitSuggestion: 'Show me a quick demo' },
  '/work/calendar': { message: 'Exploring scheduling?', suggestion: 'How does the AI calendar work?', delay: 35000, scrollTrigger: 0.5 },
  '/work/tasks': { message: 'Looking at task management?', suggestion: 'How does AI prioritize tasks?', delay: 35000, scrollTrigger: 0.5 },
  '/work/projects': { message: 'Checking out project tools?', suggestion: 'How does project tracking work?', delay: 35000, scrollTrigger: 0.5 },
  '/work/voice-notes': { message: 'Interested in voice capture?', suggestion: 'How do voice notes work?', delay: 35000, scrollTrigger: 0.5 },
  '/work/meeting-notes': { message: 'Exploring meeting tools?', suggestion: 'How does meeting transcription work?', delay: 35000, scrollTrigger: 0.5 },
  '/work/assistant': { message: 'Curious about the AI assistant?', suggestion: 'What can the AI assistant do?', delay: 35000, scrollTrigger: 0.5 },
  '/work/brain': { message: 'Exploring The Brain?', suggestion: 'How does The Brain connect my data?', delay: 35000, scrollTrigger: 0.5 },
  '/work/finance': { message: 'Looking at finance tools?', suggestion: 'How does invoicing and tracking work?', delay: 35000, scrollTrigger: 0.5 },
  '/work/payments': { message: 'Exploring payments?', suggestion: 'How does payment processing work?', delay: 35000, scrollTrigger: 0.5 },
  '/work/website-builder': { message: 'Building a website?', suggestion: 'How does the AI website builder work?', delay: 35000, scrollTrigger: 0.5 },
  '/work/marketing': { message: 'Exploring marketing?', suggestion: 'How do AI campaigns work?', delay: 35000, scrollTrigger: 0.5 },
  '/work/telephony': { message: 'Checking out phone features?', suggestion: 'How does the AI receptionist work?', delay: 35000, scrollTrigger: 0.5 },
  '/work/messenger': { message: 'Exploring messaging?', suggestion: 'How does unified messaging work?', delay: 35000, scrollTrigger: 0.5 },
  '/work/reports': { message: 'Looking at analytics?', suggestion: 'What reports can HABOS generate?', delay: 35000, scrollTrigger: 0.5 },
  '/work/agents': { message: 'Curious about AI agents?', suggestion: 'What can AI agents automate?', delay: 35000, scrollTrigger: 0.5 },
  '/work/dispatch': { message: 'Exploring dispatch?', suggestion: 'How does job dispatch work?', delay: 35000, scrollTrigger: 0.5, exitMessage: 'Curious how dispatch saves time?', exitSuggestion: 'How much time can I save?' },
  '/work/bookings': { message: 'Setting up bookings?', suggestion: 'How does client scheduling work?', delay: 35000, scrollTrigger: 0.5 },
  '/work/tickets': { message: 'Looking at support tools?', suggestion: 'How does ticket management work?', delay: 35000, scrollTrigger: 0.5 },
  '/work/people': { message: 'Exploring team management?', suggestion: 'How do HR tools work in HABOS?', delay: 35000, scrollTrigger: 0.5 },
  '/work/creative-studio': { message: 'Checking out design tools?', suggestion: 'What can Creative Studio do?', delay: 35000, scrollTrigger: 0.5 },
  '/work/slides': { message: 'Building presentations?', suggestion: 'How does the AI slide builder work?', delay: 35000, scrollTrigger: 0.5 },
  '/work/research': { message: 'Doing research?', suggestion: 'How does AI research work?', delay: 35000, scrollTrigger: 0.5 },
  '/work/forms': { message: 'Building forms?', suggestion: 'How do forms connect to workflows?', delay: 35000, scrollTrigger: 0.5 },
  '/work/ads': { message: 'Running ads?', suggestion: 'How does ad management work?', delay: 35000, scrollTrigger: 0.5 },
  '/work/operations': { message: 'Exploring operations?', suggestion: 'How does operations management work?', delay: 35000, scrollTrigger: 0.5 },

  // Solution pages (45s + 50% scroll)
  '/solutions/service-businesses': { message: 'Running a service business?', suggestion: 'How can HABOS help service companies?', delay: 45000, scrollTrigger: 0.5, exitMessage: 'Still deciding? Happy to help.', exitSuggestion: 'What makes HABOS different?' },
  '/solutions/solo-founders': { message: 'Building solo?', suggestion: 'How does HABOS help solo founders?', delay: 45000, scrollTrigger: 0.5 },
  '/solutions/teams-startups': { message: 'Growing a team?', suggestion: 'How does HABOS help teams scale?', delay: 45000, scrollTrigger: 0.5 },
  '/solutions/creative-businesses': { message: 'Running a creative business?', suggestion: 'How does HABOS help creatives?', delay: 45000, scrollTrigger: 0.5 },
};

const DEFAULT_PROACTIVE_DELAY_MS = 25000;
const MIN_TIME_ON_PAGE_MS = 10000;

// ═══════════════════════════════════════════════════════════════════
// Inline Email Capture — rendered inside chat when AI triggers email_capture
// ═══════════════════════════════════════════════════════════════════

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface InlineEmailCaptureProps {
  onSubmit: (email: string) => Promise<void>;
  isSubmitted: boolean;
  t: (key: string) => string;
  currentPage: string;
}

const InlineEmailCapture: React.FC<InlineEmailCaptureProps> = ({ onSubmit, isSubmitted, t, currentPage }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isSubmitted) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-xl border border-green-100 text-sm text-green-700">
        <Check size={14} />
        {t('emailSuccess')}
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_REGEX.test(trimmed)) { setError(t('emailInvalid')); return; }
    setError('');
    setLoading(true);
    try {
      await onSubmit(trimmed);
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-1.5">
      <div className="flex items-center gap-1.5 rounded-xl bg-white border border-gray-200 px-2.5 py-1.5 focus-within:border-blue-400 transition-colors">
        <Mail size={14} className="text-gray-400 shrink-0" />
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
          placeholder={t('emailPlaceholder')}
          className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none min-w-0"
        />
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="shrink-0 px-3 py-1 text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : t('emailSubmit')}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
    </form>
  );
};

// ═══════════════════════════════════════════════════════════════════
// Calendly popup widget — lazy loaded on first click
// ═══════════════════════════════════════════════════════════════════

const CALENDLY_WIDGET_URL = 'https://assets.calendly.com/assets/external/widget.js';
let calendlyLoaded = false;

function loadCalendlyScript(): Promise<void> {
  if (calendlyLoaded) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = CALENDLY_WIDGET_URL;
    script.async = true;
    script.onload = () => { calendlyLoaded = true; resolve(); };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function openCalendlyPopup(url: string) {
  try {
    await loadCalendlyScript();
    (window as any).Calendly?.initPopupWidget({ url });
  } catch {
    window.open(url, '_blank', 'noopener');
  }
}

// ═══════════════════════════════════════════════════════════════════
// Chat Panel Component
// ═══════════════════════════════════════════════════════════════════

const PANEL_WIDTH = 380;

interface ChatPanelProps {
  onToggle?: (isOpen: boolean) => void;
}

// Session storage keys
const STORAGE_KEY_MESSAGES = 'habos-chat-messages';
const STORAGE_KEY_DISMISSED = 'habos-chat-dismissed-routes';
const STORAGE_KEY_EXIT_DISMISSED = 'habos-chat-exit-dismissed-routes';
const STORAGE_KEY_CAPTURED_EMAIL = 'habos-chat-captured-email';

const MAX_PERSISTED_MESSAGES = 50;

function loadPersistedMessages(): ChatMessageData[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MESSAGES);
    if (raw) {
      const parsed = JSON.parse(raw) as ChatMessageData[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(-MAX_PERSISTED_MESSAGES);
    }
  } catch { /* ignore */ }
  return null;
}

/** Map route paths to readable page names for return visitor greetings */
function pageNameFromPath(path: string): string {
  const names: Record<string, string> = {
    '/work/crm': 'CRM', '/work/email': 'Email', '/work/calendar': 'Calendar',
    '/work/tasks': 'Tasks', '/work/projects': 'Projects', '/work/dispatch': 'Dispatch',
    '/work/voice-notes': 'Voice Notes', '/work/meeting-notes': 'Meeting Notes',
    '/work/assistant': 'AI Assistant', '/work/brain': 'The Brain',
    '/work/finance': 'Finance', '/work/payments': 'Payments',
    '/work/website-builder': 'Website Builder', '/work/marketing': 'Marketing',
    '/work/telephony': 'Phone', '/work/messenger': 'Messenger',
    '/work/reports': 'Reports', '/work/agents': 'AI Agents',
    '/work/bookings': 'Bookings', '/work/tickets': 'Tickets',
    '/work/people': 'People', '/work/creative-studio': 'Creative Studio',
    '/work/slides': 'Slides', '/work/research': 'Research',
    '/work/forms': 'Forms', '/work/ads': 'Ads', '/work/operations': 'Operations',
  };
  return names[path] || path.replace('/work/', '').replace(/-/g, ' ');
}

function loadDismissedRoutes(): Set<string> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_DISMISSED);
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* ignore */ }
  return new Set();
}

function loadExitDismissedRoutes(): Set<string> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_EXIT_DISMISSED);
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* ignore */ }
  return new Set();
}

export default function ChatPanel({ onToggle }: ChatPanelProps) {
  const { t } = useTranslation('chat-panel');
  const navigate = useNavigate();
  const location = useLocation();
  const currentSuggestion = PAGE_SUGGESTIONS[location.pathname] || null;
  const [isOpen, setIsOpen] = useState(false);
  const [showProactive, setShowProactive] = useState(false);
  const dismissedRoutesRef = useRef<Set<string>>(loadDismissedRoutes());
  const proactiveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessageData[]>(() => {
    // Try loading persisted messages from localStorage
    const persisted = loadPersistedMessages();
    if (persisted) return persisted;

    // Initialize visitor profile (creates on first visit, updates visitCount on return)
    initVisitorProfile();

    // Personalized greeting for returning visitors
    if (isReturningVisitor()) {
      const profile = getVisitorProfile();
      const pages = (profile?.lastPages || [])
        .filter(p => p.startsWith('/work/'))
        .slice(-3)
        .map(pageNameFromPath);
      const greeting = pages.length > 0
        ? t('returnGreetingWithPages', { pages: pages.join(', ') })
        : t('returnGreeting');
      return [{ id: 1, role: 'assistant', text: greeting }];
    }

    return [{ id: 1, role: 'assistant', text: t('introMessage') }];
  });
  const [input, setInput] = useState('');

  // Initialize visitor profile on mount (handles first visit and return visits)
  useEffect(() => { initVisitorProfile(); }, []);

  // Track pages visited for return visitor recognition
  useEffect(() => {
    updateVisitorPages(location.pathname);
  }, [location.pathname]);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages.slice(-MAX_PERSISTED_MESSAGES))); }
    catch { /* storage full or unavailable */ }
  }, [messages]);

  // Persist dismissed routes whenever they change
  const persistDismissed = useCallback(() => {
    try { sessionStorage.setItem(STORAGE_KEY_DISMISSED, JSON.stringify([...dismissedRoutesRef.current])); }
    catch { /* ignore */ }
  }, []);

  // Exit-intent state
  const exitDismissedRef = useRef<Set<string>>(loadExitDismissedRoutes());
  const [showExitIntent, setShowExitIntent] = useState(false);
  const pageEnteredAtRef = useRef<number>(Date.now());
  const persistExitDismissed = useCallback(() => {
    try { sessionStorage.setItem(STORAGE_KEY_EXIT_DISMISSED, JSON.stringify([...exitDismissedRef.current])); }
    catch { /* ignore */ }
  }, []);

  // Email capture state — reads from persistent visitor profile
  const [capturedEmail, setCapturedEmail] = useState<string | null>(() => {
    return getVisitorProfile()?.capturedEmail ?? null;
  });
  const [emailCaptureShown, setEmailCaptureShown] = useState(false);

  const handleEmailSubmit = useCallback(async (email: string) => {
    const result = await waitlistService.addToWaitlist({
      email,
      referral_source: 'chat',
      metadata: { page: location.pathname, conversation_length: messages.length },
    });
    if (!result.success) {
      if (result.error?.includes('already')) {
        setCapturedEmail(email);
        setVisitorEmail(email);
        throw new Error(result.error);
      }
      throw new Error(result.error || 'Failed');
    }
    setCapturedEmail(email);
    setVisitorEmail(email);
    Analytics.chatEmailCaptured(email, messages.length);
  }, [location.pathname, messages.length]);

  const [highlightSelector, setHighlightSelector] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Conversation tracking refs ──
  const conversationIdRef = useRef<string | null>(null);
  const conversationStartRef = useRef<string | null>(null);
  const conversationPageRef = useRef<string>(location.pathname);
  const bookingClickedRef = useRef<boolean>(false);

  const buildConversationPayload = useCallback(() => ({
    id: conversationIdRef.current || undefined,
    visitor_id: getVisitorId(),
    started_at: conversationStartRef.current || new Date().toISOString(),
    page: conversationPageRef.current,
    message_count: messages.filter(m => m.role === 'user').length,
    email_captured: !!capturedEmail,
    booking_clicked: bookingClickedRef.current,
    messages: messages.map(m => ({ role: m.role, text: m.text })),
    metadata: { userAgent: navigator.userAgent, referrer: document.referrer, screenWidth: window.innerWidth, referralSource: getReferralSource(), leadScore: calculateLeadScore() },
  }), [messages, capturedEmail]);

  // Save conversation on tab close via sendBeacon
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (messages.filter(m => m.role === 'user').length === 0) return;
      navigator.sendBeacon('/api/conversations', JSON.stringify(buildConversationPayload()));
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [messages, buildConversationPayload]);

  // ── Text selection "Explain" button ──
  const [selectionPopup, setSelectionPopup] = useState<{ text: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const handleMouseUp = () => {
      // Small delay to let the selection stabilize
      setTimeout(() => {
        const sel = window.getSelection();
        const text = sel?.toString().trim();
        if (!text || text.length < 3) { setSelectionPopup(null); return; }

        // Don't show if selection is inside the chat panel
        const range = sel!.getRangeAt(0);
        const container = range.commonAncestorContainer;
        const el = container instanceof Element ? container : container.parentElement;
        if (el?.closest('[data-chat-panel]')) { setSelectionPopup(null); return; }

        const rect = range.getBoundingClientRect();
        setSelectionPopup({
          text: text.slice(0, 300),
          x: rect.left + rect.width / 2,
          y: rect.top,
        });
      }, 10);
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('[data-explain-btn]')) setSelectionPopup(null);
    };

    const handleScroll = () => setSelectionPopup(null);

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  const toggle = (next?: boolean) => {
    const value = next ?? !isOpen;
    setIsOpen(value);
    onToggle?.(value);
    if (value) {
      setShowProactive(false);
      setShowExitIntent(false);
      dismissedRoutesRef.current.add(location.pathname);
      exitDismissedRef.current.add(location.pathname);
      persistDismissed();
      persistExitDismissed();
    } else if (messages.filter(m => m.role === 'user').length > 0) {
      // Save conversation on close (fire-and-forget)
      fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildConversationPayload()),
        keepalive: true,
      }).catch(() => { /* silent fail — analytics, not critical */ });
    }
  };

  // Proactive suggestion: timer + optional scroll-depth trigger
  useEffect(() => {
    setShowProactive(false);
    if (proactiveTimerRef.current) clearTimeout(proactiveTimerRef.current);

    const path = location.pathname;
    const suggestion = PAGE_SUGGESTIONS[path];
    if (isOpen || dismissedRoutesRef.current.has(path) || !suggestion) return;

    // Adjust delay based on referral source — paid traffic gets faster triggers
    const baseDelay = suggestion.delay ?? DEFAULT_PROACTIVE_DELAY_MS;
    const source = getReferralSource();
    const delay = source === 'paid' ? Math.round(baseDelay * 0.6)   // 40% faster for ads
                : source === 'direct' ? Math.round(baseDelay * 0.8) // 20% faster for direct
                : baseDelay;
    const pageEnteredAt = Date.now();
    let triggered = false;

    const trigger = () => {
      if (triggered) return;
      const elapsed = Date.now() - pageEnteredAt;
      if (elapsed < MIN_TIME_ON_PAGE_MS) {
        setTimeout(() => { if (!triggered) { triggered = true; setShowProactive(true); } }, MIN_TIME_ON_PAGE_MS - elapsed);
        return;
      }
      triggered = true;
      setShowProactive(true);
    };

    // Timer trigger
    proactiveTimerRef.current = setTimeout(trigger, delay);

    // Scroll-depth trigger (if configured)
    let scrollCleanup: (() => void) | undefined;
    if (suggestion.scrollTrigger != null) {
      const threshold = suggestion.scrollTrigger;
      const handleScroll = () => {
        if (triggered) return;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollHeight <= 0) return;
        const depth = window.scrollY / scrollHeight;
        if (depth >= threshold) trigger();
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      scrollCleanup = () => window.removeEventListener('scroll', handleScroll);
    }

    return () => {
      if (proactiveTimerRef.current) clearTimeout(proactiveTimerRef.current);
      scrollCleanup?.();
    };
  }, [location.pathname, isOpen]);

  // Exit-intent detection — desktop only, fires when mouse leaves viewport top
  useEffect(() => {
    setShowExitIntent(false);
    pageEnteredAtRef.current = Date.now();

    const path = location.pathname;
    const suggestion = PAGE_SUGGESTIONS[path];
    if (!suggestion?.exitMessage) return;

    // Desktop only
    if (!window.matchMedia('(min-width: 768px)').matches) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY > 0) return;
      if (isOpen || showProactive) return;
      if (exitDismissedRef.current.has(path)) return;
      if (Date.now() - pageEnteredAtRef.current < MIN_TIME_ON_PAGE_MS) return;
      setShowExitIntent(true);
      Analytics.exitIntentTriggered(path);
    };

    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    return () => document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
  }, [location.pathname, isOpen, showProactive]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 350);
  }, [isOpen]);

  // Push page content left when chat opens — desktop only (smooth transition)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const apply = () => {
      document.body.style.transition = 'padding-right 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      if (isOpen && mq.matches) {
        document.body.style.paddingRight = `${PANEL_WIDTH + 32}px`;
      } else {
        document.body.style.paddingRight = '0px';
      }
    };
    apply();
    mq.addEventListener('change', apply);
    return () => {
      document.body.style.transition = 'padding-right 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      document.body.style.paddingRight = '0px';
      mq.removeEventListener('change', apply);
    };
  }, [isOpen]);

  const clearHighlight = useCallback(() => setHighlightSelector(null), []);

  const executeAction = useCallback((action: ChatAction) => {
    switch (action.type) {
      case 'navigate':
        navigate(action.target);
        break;
      case 'highlight':
        setHighlightSelector(action.target);
        break;
      case 'scroll': {
        const el = document.querySelector(action.target);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      }
      case 'book_meeting':
        bookingClickedRef.current = true;
        Analytics.chatMeetingBookingClicked(action.target);
        openCalendlyPopup(action.target);
        break;
      case 'email_capture':
        break; // handled inline in render
    }
  }, [navigate]);

  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamingMsgIdRef = useRef<number | null>(null);

  const handleSend = async (overrideText?: string) => {
    const trimmed = (overrideText ?? input).trim();
    if (!trimmed || isLoading) return;

    // Track conversation start on first user message
    if (!conversationIdRef.current) {
      conversationIdRef.current = crypto.randomUUID();
      conversationStartRef.current = new Date().toISOString();
      conversationPageRef.current = location.pathname;
    }

    const userMsgId = Date.now();
    const assistantMsgId = userMsgId + 1;

    setMessages((prev) => [...prev, { id: userMsgId, role: 'user', text: trimmed }]);
    setInput('');
    setIsLoading(true);

    const history = messages.slice(-30).map((m) => ({ role: m.role, text: m.text }));
    let currentMsgId = assistantMsgId;
    const allBubbleIds: number[] = [assistantMsgId];

    // After the first bubble, subsequent bubbles are buffered so we can
    // calculate a "typing" delay proportional to the UPCOMING bubble's length.
    let buffering = false;
    let pendingText = '';

    // Helper: reveal a buffered bubble with a delay based on its own length
    const revealPending = async (actions?: ChatAction[]) => {
      if (!pendingText.trim()) return;
      const delay = Math.min(800 + pendingText.length * 18, 3500);
      setIsStreaming(false);
      setIsLoading(true);
      await new Promise((r) => setTimeout(r, delay));
      setIsLoading(false);

      const newId = Date.now() + Math.floor(Math.random() * 1000);
      currentMsgId = newId;
      allBubbleIds.push(newId);
      streamingMsgIdRef.current = newId;
      setMessages((prev) => [...prev, {
        id: newId,
        role: 'assistant' as const,
        text: pendingText,
        ...(actions ? { actions } : {}),
      }]);
      pendingText = '';
    };

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history,
          currentPage: location.pathname,
          emailCaptured: !!capturedEmail,
          returningVisitor: isReturningVisitor() ? {
            visitCount: getVisitorProfile()?.visitCount ?? 1,
            lastPages: getVisitorProfile()?.lastPages ?? [],
          } : undefined,
          referralSource: getReferralSource(),
          leadScore: calculateLeadScore(),
        }),
      });

      if (!res.ok) throw new Error('API error');
      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let sseBuffer = '';
      let receivedFirstDelta = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });

        // Process complete SSE events (double-newline delimited)
        const parts = sseBuffer.split('\n\n');
        sseBuffer = parts.pop()!;

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith('data: ')) continue;

          let data: { type: string; text?: string; actions?: ChatAction[] };
          try { data = JSON.parse(line.substring(6)); }
          catch { continue; }

          if (data.type === 'delta' && data.text) {
            // Buffer all bubbles — reveal them whole after a natural pause
            pendingText += data.text;
          } else if (data.type === 'break') {
            // Reveal the buffered bubble with a length-based delay
            if (pendingText.trim()) {
              if (!receivedFirstDelta) {
                // First bubble — reveal with delay, no streaming
                receivedFirstDelta = true;
                const delay = Math.min(800 + pendingText.length * 18, 3500);
                await new Promise((r) => setTimeout(r, delay));
                setIsLoading(false);
                streamingMsgIdRef.current = currentMsgId;
                setMessages((prev) => [...prev, {
                  id: currentMsgId,
                  role: 'assistant' as const,
                  text: pendingText,
                }]);
              } else {
                await revealPending();
              }
            }
            pendingText = '';
          } else if (data.type === 'done') {
            // Reveal any remaining buffered bubble
            if (pendingText.trim()) {
              if (!receivedFirstDelta) {
                receivedFirstDelta = true;
                const delay = Math.min(800 + pendingText.length * 18, 3500);
                await new Promise((r) => setTimeout(r, delay));
                setIsLoading(false);
                setMessages((prev) => [...prev, {
                  id: currentMsgId,
                  role: 'assistant' as const,
                  text: pendingText,
                  actions: data.actions || [],
                }]);
              } else {
                await revealPending(data.actions || []);
              }
            }
            setIsStreaming(false);
            streamingMsgIdRef.current = null;
            const bubbleCount = allBubbleIds.filter((id) => id !== assistantMsgId || receivedFirstDelta).length;
            if (!receivedFirstDelta) {
              setMessages((prev) => [...prev, {
                id: assistantMsgId,
                role: 'assistant' as const,
                text: "I'm not sure how to help with that. Try asking about a specific feature!",
                actions: data.actions || [],
                _debugBubbleCount: 1,
              }]);
            } else {
              // Attach actions + debug count to last bubble, remove empty bubbles
              setMessages((prev) => prev
                .filter((m) => m.text.trim() !== '' || !allBubbleIds.includes(m.id))
                .map((m) => m.id === currentMsgId ? { ...m, actions: data.actions || [], _debugBubbleCount: bubbleCount } : m)
              );
            }
          } else if (data.type === 'error') {
            throw new Error(data.text || 'Stream error');
          }
        }
      }

      if (!receivedFirstDelta) {
        setMessages((prev) => [...prev, {
          id: assistantMsgId,
          role: 'assistant' as const,
          text: "I'm not sure how to help with that. Try asking about a specific feature!",
          _debugBubbleCount: 1,
        }]);
      }
    } catch {
      setIsStreaming(false);
      streamingMsgIdRef.current = null;
      // Fallback to local intent matching — remove any partial bubbles
      const intent = matchIntent(trimmed);
      setMessages((prev) => {
        const without = prev.filter((m) => !allBubbleIds.includes(m.id));
        return [...without, {
          id: assistantMsgId,
          role: 'assistant' as const,
          text: intent?.reply || "I can help you navigate HABOS features. Try asking about email, calendar, tasks, CRM, voice notes, or pricing!",
          actions: intent?.actions || [],
          _debugBubbleCount: 1,
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const navContext: ChatNavContextValue = {
    navigateTo: (path) => navigate(path),
    highlightElement: (sel) => setHighlightSelector(sel),
    clearHighlight,
    scrollToElement: (sel) => document.querySelector(sel)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
  };

  return (
    <ChatNavContext.Provider value={navContext}>
      {/* Highlight overlay */}
      <AnimatePresence>
        {highlightSelector && (
          <HighlightOverlay selector={highlightSelector} onClear={clearHighlight} />
        )}
      </AnimatePresence>

      {/* "Explain" button on text selection */}
      <AnimatePresence>
        {selectionPopup && (
          <motion.button
            data-explain-btn
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            onClick={() => {
              const text = selectionPopup.text;
              setSelectionPopup(null);
              window.getSelection()?.removeAllRanges();
              toggle(true);
              handleSend(`Explain this: "${text}"`);
            }}
            className="fixed z-[100] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-900 text-white text-xs font-medium shadow-lg hover:bg-gray-800 transition-colors"
            style={{
              left: selectionPopup.x,
              top: selectionPopup.y,
              transform: 'translate(-50%, calc(-100% - 8px))',
            }}
          >
            <MessageCircle size={12} />
            Explain
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating trigger button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => toggle(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg hover:bg-gray-800 transition-colors"
            aria-label={t('openChatAriaLabel')}
          >
            <MessageCircle size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Proactive suggestion bubble — appears above the chat button */}
      <AnimatePresence>
        {showProactive && !isOpen && currentSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="fixed bottom-[5.5rem] right-6 z-50 max-w-[260px]"
          >
            <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 p-3.5">
              <button
                onClick={() => {
                  setShowProactive(false);
                  dismissedRoutesRef.current.add(location.pathname);
                  persistDismissed();
                }}
                className="absolute top-2 right-2 text-gray-300 hover:text-gray-500 transition-colors"
                aria-label="Dismiss suggestion"
              >
                <X size={12} />
              </button>
              <p className="text-[13px] text-gray-600 mb-2.5 pr-4">
                {currentSuggestion.message}
              </p>
              <button
                onClick={() => {
                  const text = currentSuggestion.suggestion;
                  setShowProactive(false);
                  dismissedRoutesRef.current.add(location.pathname);
                  persistDismissed();
                  toggle(true);
                  handleSend(text);
                }}
                className="text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full px-3 py-1.5 font-medium transition-colors border border-blue-100"
              >
                {currentSuggestion.suggestion}
              </button>
              {/* Arrow tail pointing toward chat button */}
              <div className="absolute -bottom-1.5 right-7 w-3 h-3 bg-white border-b border-r border-gray-100 transform rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit-intent suggestion bubble — desktop only, same UI, different text */}
      <AnimatePresence>
        {showExitIntent && !isOpen && !showProactive && currentSuggestion?.exitMessage && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="fixed bottom-[5.5rem] right-6 z-50 max-w-[260px]"
          >
            <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 p-3.5">
              <button
                onClick={() => {
                  setShowExitIntent(false);
                  exitDismissedRef.current.add(location.pathname);
                  persistExitDismissed();
                  Analytics.exitIntentDismissed(location.pathname);
                }}
                className="absolute top-2 right-2 text-gray-300 hover:text-gray-500 transition-colors"
                aria-label="Dismiss suggestion"
              >
                <X size={12} />
              </button>
              <p className="text-[13px] text-gray-600 mb-2.5 pr-4">
                {currentSuggestion.exitMessage}
              </p>
              <button
                onClick={() => {
                  const text = currentSuggestion.exitSuggestion!;
                  setShowExitIntent(false);
                  exitDismissedRef.current.add(location.pathname);
                  persistExitDismissed();
                  Analytics.exitIntentClicked(location.pathname, text);
                  toggle(true);
                  handleSend(text);
                }}
                className="text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full px-3 py-1.5 font-medium transition-colors border border-blue-100"
              >
                {currentSuggestion.exitSuggestion}
              </button>
              <div className="absolute -bottom-1.5 right-7 w-3 h-3 bg-white border-b border-r border-gray-100 transform rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop — flipped background behind chat panel, only in the reflow gap */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed top-0 right-0 bottom-0 z-[5] pointer-events-none overflow-hidden hidden md:block"
            style={{ width: PANEL_WIDTH + 32 }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'url("/work-bg.jpg")',
                backgroundSize: '100vw auto',
                backgroundPosition: 'right top',
                backgroundRepeat: 'no-repeat',
                transform: 'scaleX(-1)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            data-chat-panel
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0, right: 0.3 }}
            onDragEnd={(_, info) => {
              if (info.offset.x > 80 || info.velocity.x > 500) toggle(false);
            }}
            className="fixed flex flex-col bg-white/90 backdrop-blur-sm shadow-2xl border border-slate-200/40 overflow-hidden
              inset-0 rounded-none z-[51]
              md:inset-auto md:rounded-2xl md:right-4 md:bottom-4 md:top-[100px] md:w-[380px] md:z-40"
          >
            {/* Swipe handle — mobile only */}
            <div className="flex justify-center pt-2 pb-1 md:hidden">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 md:py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white">
                  <MessageCircle size={16} />
                </div>
                <span className="text-sm font-semibold text-gray-900">{t('header')}</span>
              </div>
              <button
                onClick={() => toggle(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label={t('closeChatAriaLabel')}
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gray-900 text-white rounded-br-md'
                          : 'bg-gray-50 text-gray-800 rounded-bl-md'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <>
                          <Markdown
                            allowedElements={['p', 'strong', 'em', 'ul', 'ol', 'li', 'br']}
                            unwrapDisallowed
                            components={{
                              p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc list-inside ml-1 space-y-0.5 mb-1 last:mb-0">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal list-inside ml-1 space-y-0.5 mb-1 last:mb-0">{children}</ol>,
                            }}
                          >
                            {msg.text}
                          </Markdown>
                          {isStreaming && streamingMsgIdRef.current === msg.id && (
                            <motion.span
                              animate={{ opacity: [1, 0] }}
                              transition={{ duration: 0.5, repeat: Infinity }}
                              className="inline-block w-0.5 h-4 bg-gray-800 ml-0.5 align-middle"
                            />
                          )}
                        </>
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                  {/* Debug: bubble count */}
                  {msg._debugBubbleCount != null && (
                    <div className="text-[10px] text-gray-400 mt-1 ml-1 font-mono">
                      [{msg._debugBubbleCount} bubble{msg._debugBubbleCount !== 1 ? 's' : ''}]
                    </div>
                  )}
                  {/* Action chips + special action types */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-2 ml-1 space-y-2">
                      {/* Email capture — inline form */}
                      {msg.actions.some((a) => a.type === 'email_capture') && (
                        <InlineEmailCapture
                          onSubmit={handleEmailSubmit}
                          isSubmitted={!!capturedEmail}
                          t={t}
                          currentPage={location.pathname}
                        />
                      )}

                      {/* Meeting booking — styled button */}
                      {msg.actions
                        .filter((a) => a.type === 'book_meeting')
                        .map((action, i) => (
                          <button
                            key={`meeting-${i}`}
                            onClick={() => executeAction(action)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
                          >
                            <Calendar size={14} />
                            {action.label || t('bookDemo')}
                          </button>
                        ))}

                      {/* Standard navigation/scroll/highlight chips */}
                      {msg.actions.some((a) => a.type !== 'email_capture' && a.type !== 'book_meeting') && (
                        <div className="flex flex-wrap gap-1.5">
                          {msg.actions
                            .filter((a) => a.type !== 'email_capture' && a.type !== 'book_meeting')
                            .map((action, i) => (
                              <button
                                key={i}
                                onClick={() => executeAction(action)}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors border border-blue-100"
                              >
                                <ExternalLink size={10} />
                                {action.label || action.target}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-50 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 focus-within:border-gray-400 transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('placeholder')}
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label={t('sendMessageAriaLabel')}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>

            {/* Talk to our team link */}
            <div className="px-4 pb-3 pt-1 flex justify-center">
              <button
                onClick={() => navigate('/support')}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                <LifeBuoy size={12} />
                {t('talkToTeam')}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </ChatNavContext.Provider>
  );
}
