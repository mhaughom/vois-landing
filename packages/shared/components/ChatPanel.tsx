import React, { useState, useRef, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, ExternalLink, HelpCircle, Mail, Phone, Check, Loader2, Calendar } from 'lucide-react';
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

    // Re-measure on scroll/resize — throttled via rAF to avoid layout thrashing
    let rafId = 0;
    const throttledUpdate = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => { update(); rafId = 0; });
    };
    window.addEventListener('scroll', throttledUpdate, { passive: true });
    window.addEventListener('resize', throttledUpdate);
    // Auto-clear after 4s
    const timer = setTimeout(onClear, 4000);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', throttledUpdate);
      window.removeEventListener('resize', throttledUpdate);
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

function matchIntent(text: string, patterns: typeof INTENT_PATTERNS): IntentMatch | null {
  for (const { patterns: pats, match } of patterns) {
    if (pats.some((p) => p.test(text))) return match;
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

// Conversion-oriented CTAs — rotated into the pill alongside page suggestions
// English fallback; overridden by translated ctaSuggestions from chat-panel namespace
const CTA_SUGGESTIONS_FALLBACK = [
  'Book a free intro call',
  'Schedule a quick demo',
  'Get a personalized walkthrough',
  'Talk to our team',
  'See it in action — book a demo',
];

// ═══════════════════════════════════════════════════════════════════
// Inline Contact Capture — rendered inside chat when AI triggers email_capture
// ═══════════════════════════════════════════════════════════════════

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface InlineEmailCaptureProps {
  onSubmit: (email: string, phone?: string) => Promise<void>;
  isSubmitted: boolean;
  t: (key: string) => string;
  currentPage: string;
}

const InlineEmailCapture: React.FC<InlineEmailCaptureProps> = ({ onSubmit, isSubmitted, t, currentPage }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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
      await onSubmit(trimmed, phone.trim() || undefined);
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
      </div>
      <div className="flex items-center gap-1.5 rounded-xl bg-white border border-gray-200 px-2.5 py-1.5 focus-within:border-blue-400 transition-colors">
        <Phone size={14} className="text-gray-400 shrink-0" />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t('phonePlaceholder')}
          className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none min-w-0"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !email.trim()}
        className="w-full px-3 py-1.5 text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : t('emailSubmit')}
      </button>
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

/** Product-specific configuration for ChatPanel. Pass from each app's entry point. */
export interface ChatPanelConfig {
  /** Product name used in UI copy (e.g. "HABOS" or "VOIS") */
  productName: string;
  /** Prefix for localStorage keys (e.g. "habos" → "habos-chat-messages") */
  storagePrefix: string;
  /** Intent patterns for local matching when API is unavailable */
  intentPatterns?: typeof INTENT_PATTERNS;
  /** Page-specific proactive suggestions */
  pageSuggestions?: Record<string, PageSuggestion>;
  /** Map of route paths to human-readable page names */
  pageNames?: Record<string, string>;
  /** Fallback message when API fails and no intent matches */
  fallbackMessage?: string;
}

interface ChatPanelProps {
  onToggle?: (isOpen: boolean) => void;
  config?: ChatPanelConfig;
}

const MAX_PERSISTED_MESSAGES = 50;

function loadPersistedMessages(storageKey: string): ChatMessageData[] | null {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw) as ChatMessageData[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(-MAX_PERSISTED_MESSAGES);
    }
  } catch { /* ignore */ }
  return null;
}

/** Map route paths to readable page names for return visitor greetings */
function pageNameFromPath(path: string, pageNames: Record<string, string>): string {
  return pageNames[path] || path.replace(/^\/[^/]+\//, '').replace(/-/g, ' ');
}

function loadDismissedRoutes(storageKey: string): Set<string> {
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* ignore */ }
  return new Set();
}

function loadExitDismissedRoutes(storageKey: string): Set<string> {
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* ignore */ }
  return new Set();
}

// Default storage keys (overridden by config.storagePrefix)
const DEFAULT_STORAGE_PREFIX = 'chat';

export default function ChatPanel({ onToggle, config }: ChatPanelProps) {
  const storagePrefix = config?.storagePrefix || DEFAULT_STORAGE_PREFIX;
  const STORAGE_KEY_MESSAGES = `${storagePrefix}-chat-messages`;
  const STORAGE_KEY_DISMISSED = `${storagePrefix}-chat-dismissed-routes`;
  const STORAGE_KEY_EXIT_DISMISSED = `${storagePrefix}-chat-exit-dismissed-routes`;
  const STORAGE_KEY_CAPTURED_EMAIL = `${storagePrefix}-chat-captured-email`;
  const activeIntentPatterns = config?.intentPatterns || INTENT_PATTERNS;
  const activePageNames = config?.pageNames || {};
  const productName = config?.productName || 'our';
  const fallbackMessage = config?.fallbackMessage || "I can help you explore our features. Try asking about what interests you!";
  const { t, i18n } = useTranslation('chat-panel');
  const translatedPageSuggestions = t('pageSuggestions', { returnObjects: true, defaultValue: PAGE_SUGGESTIONS }) as Record<string, PageSuggestion>;
  const ctaSuggestions = t('ctaSuggestions', { returnObjects: true, defaultValue: CTA_SUGGESTIONS_FALLBACK }) as string[];
  const activePageSuggestions = config?.pageSuggestions || translatedPageSuggestions;
  const navigate = useNavigate();
  const location = useLocation();
  const currentSuggestion = activePageSuggestions[location.pathname] || null;
  const [isOpen, setIsOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showProactive, setShowProactive] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const [ctaIndex, setCtaIndex] = useState(0);
  const dismissedRoutesRef = useRef<Set<string>>(loadDismissedRoutes(STORAGE_KEY_DISMISSED));
  const proactiveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessageData[]>(() => {
    // Try loading persisted messages from localStorage
    const persisted = loadPersistedMessages(STORAGE_KEY_MESSAGES);
    if (persisted) return persisted;

    // Initialize visitor profile (creates on first visit, updates visitCount on return)
    initVisitorProfile();

    // Personalized greeting for returning visitors
    if (isReturningVisitor()) {
      const profile = getVisitorProfile();
      // Only mention substantive pages — skip generic navigation pages
      const genericPages = new Set(['/', '/work', '/support', '/legal', '/login', '/setup', '/success']);
      const pages = (profile?.lastPages || [])
        .filter(p => !genericPages.has(p))
        .slice(-3)
        .map(p => pageNameFromPath(p, activePageNames));
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

  // Close help popup on outside click
  const helpRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showHelp) return;
    const handleClick = (e: MouseEvent) => {
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) setShowHelp(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showHelp]);

  // Exit-intent state
  const exitDismissedRef = useRef<Set<string>>(loadExitDismissedRoutes(STORAGE_KEY_EXIT_DISMISSED));
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

  const handleEmailSubmit = useCallback(async (email: string, phone?: string) => {
    const result = await waitlistService.addToWaitlist({
      email,
      referral_source: 'chat',
      metadata: { page: location.pathname, conversation_length: messages.length, ...(phone ? { phone } : {}) },
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
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('scroll', handleScroll);
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
    const suggestion = activePageSuggestions[path];
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

  // CTA rotation — alternate between page suggestion and conversion CTA every ~10s
  useEffect(() => {
    if (!showProactive) { setShowCta(false); return; }
    // Show page suggestion first, then start rotating after 10s
    const interval = setInterval(() => {
      setShowCta(prev => {
        if (!prev) {
          // Picking a new random CTA each time we switch to CTA
          setCtaIndex(Math.floor(Math.random() * ctaSuggestions.length));
        }
        return !prev;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [showProactive]);

  // Exit-intent detection — desktop only, fires when mouse leaves viewport top
  useEffect(() => {
    setShowExitIntent(false);
    pageEnteredAtRef.current = Date.now();

    const path = location.pathname;
    const suggestion = activePageSuggestions[path];
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

  // Scroll to bottom when messages change or chat opens
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      // Wait for the panel spring animation to finish, then scroll + focus
      setTimeout(() => {
        scrollToBottom('instant');
        inputRef.current?.focus();
      }, 350);
    }
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

  // ── Suggested questions derived from user context ──
  const suggestedQuestions = React.useMemo(() => {
    const alreadyAsked = new Set(
      messages.filter(m => m.role === 'user').map(m => m.text.toLowerCase().trim())
    );
    const candidates: string[] = [];

    // 1. Current page suggestion
    const current = activePageSuggestions[location.pathname];
    if (current?.suggestion) candidates.push(current.suggestion);

    // 2. Suggestions from previously visited pages
    const profile = getVisitorProfile();
    const visitedPages = profile?.lastPages || [];
    for (const page of visitedPages) {
      if (page === location.pathname) continue;
      const s = activePageSuggestions[page];
      if (s?.suggestion) candidates.push(s.suggestion);
    }

    // 3. General fallback questions
    candidates.push(
      t('fallbackQ1', 'What can HABOS do for my business?'),
      t('fallbackQ2', 'How is HABOS different from other tools?'),
      t('fallbackQ3', 'What does pricing look like?'),
    );

    // Deduplicate and filter out already-asked questions
    const seen = new Set<string>();
    return candidates.filter(q => {
      const key = q.toLowerCase().trim();
      if (seen.has(key) || alreadyAsked.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 3);
  }, [messages, location.pathname, activePageSuggestions]);

  // Active suggestion text for the pill extension on the chat button
  const activeSuggestionText = showProactive && currentSuggestion
    ? (showCta ? ctaSuggestions[ctaIndex] : currentSuggestion.suggestion)
    : showExitIntent && currentSuggestion?.exitSuggestion
      ? currentSuggestion.exitSuggestion
      : null;

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

    // Helper: reveal a buffered bubble with a short pause between bubbles
    const revealPending = async (actions?: ChatAction[]) => {
      if (!pendingText.trim()) return;
      const delay = Math.min(50 + pendingText.length * 0.7, 135);
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
          language: i18n.language,
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
                // First bubble — reveal quickly
                receivedFirstDelta = true;
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
                const delay = Math.min(100 + pendingText.length * 1.7, 270);
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
      const intent = matchIntent(trimmed, activeIntentPatterns);
      setMessages((prev) => {
        const without = prev.filter((m) => !allBubbleIds.includes(m.id));
        return [...without, {
          id: assistantMsgId,
          role: 'assistant' as const,
          text: intent?.reply || fallbackMessage,
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
              handleSend(`${t('explainPrefix', 'Explain this')}: "${text}"`);
            }}
            className="fixed z-[100] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-900 text-white text-xs font-medium shadow-lg hover:bg-gray-800 transition-colors"
            style={{
              left: selectionPopup.x,
              top: selectionPopup.y,
              transform: 'translate(-50%, calc(-100% - 8px))',
            }}
          >
            <MessageCircle size={12} />
            {t('explainButton', 'Explain')}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating trigger button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-0 group/chat"
          >
            <button
              onClick={() => {
                if (activeSuggestionText) {
                  const text = activeSuggestionText;
                  setShowProactive(false);
                  setShowExitIntent(false);
                  if (currentSuggestion) {
                    dismissedRoutesRef.current.add(location.pathname);
                    persistDismissed();
                  }
                  toggle(true);
                  handleSend(text);
                } else {
                  toggle(true);
                }
              }}
              className="flex h-14 items-center rounded-full shadow-lg transition-transform duration-300 group-hover/chat:scale-105"
              style={{ backgroundColor: '#C8DCED', borderColor: '#b4cfe0', borderWidth: 1, borderStyle: 'solid' }}
              aria-label={t('openChatAriaLabel')}
            >
              <AnimatePresence mode="wait">
                {activeSuggestionText && (
                  <motion.span
                    key={activeSuggestionText}
                    initial={{ width: 0, opacity: 0, paddingLeft: 0, paddingRight: 0 }}
                    animate={{ width: 'auto', opacity: 1, paddingLeft: 20, paddingRight: 4 }}
                    exit={{ width: 0, opacity: 0, paddingLeft: 0, paddingRight: 0 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden whitespace-nowrap text-[13px] font-medium text-gray-700"
                  >
                    {activeSuggestionText}
                  </motion.span>
                )}
              </AnimatePresence>
              <div className="flex h-14 w-14 items-center justify-center shrink-0">
                <MessageCircle size={24} className="text-gray-700 transition-transform duration-500 group-hover/chat:rotate-[360deg]" />
              </div>
            </button>
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
              md:inset-auto md:rounded-2xl md:right-8 md:bottom-4 md:top-[100px] md:w-[380px] md:z-40
              md:bg-transparent md:backdrop-blur-none md:border-0 md:shadow-xl"
          >
            {/* Swipe handle — mobile only */}
            <div className="flex justify-center pt-2 pb-1 md:hidden">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-5 pt-3 pb-1 md:py-4 bg-white md:rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white">
                  <MessageCircle size={16} />
                </div>
                <span className="text-sm font-semibold text-gray-900">{t('header')}</span>
              </div>
              <div className="flex items-center gap-1">
                <div ref={helpRef} className="relative">
                  <button
                    onClick={() => setShowHelp(prev => !prev)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${showHelp ? 'bg-gray-100 text-gray-600' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                    aria-label={t('helpTitle', 'About this chat')}
                    aria-expanded={showHelp}
                  >
                    <HelpCircle size={16} />
                  </button>
                  <AnimatePresence>
                    {showHelp && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-1 w-72 rounded-xl bg-white shadow-lg border border-gray-100 p-4 z-50"
                      >
                        <p className="text-xs font-semibold text-gray-800 mb-1.5">{t('helpTitle', 'About this chat')}</p>
                        <p className="text-[11px] text-gray-500 mb-2">{t('helpDescription', 'This is an AI assistant that knows HABOS inside and out. It can:')}</p>
                        <ul className="text-[11px] text-gray-600 space-y-1 mb-2.5 pl-3">
                          <li className="relative before:content-['·'] before:absolute before:-left-2.5 before:text-gray-400">{t('helpFeature1', 'Explain any feature in detail')}</li>
                          <li className="relative before:content-['·'] before:absolute before:-left-2.5 before:text-gray-400">{t('helpFeature2', 'Help you find what you need')}</li>
                          <li className="relative before:content-['·'] before:absolute before:-left-2.5 before:text-gray-400">{t('helpFeature3', 'Answer questions about pricing, setup & integrations')}</li>
                          <li className="relative before:content-['·'] before:absolute before:-left-2.5 before:text-gray-400">{t('helpFeature4', 'Navigate you to the right page')}</li>
                        </ul>
                        {suggestedQuestions.length > 0 && (
                          <div className="border-t border-gray-100 pt-2.5 mb-2.5">
                            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-2">{t('helpSuggestedLabel', 'Try asking')}</p>
                            <div className="flex flex-col gap-1.5">
                              {suggestedQuestions.map((q) => (
                                <button
                                  key={q}
                                  onClick={() => {
                                    setShowHelp(false);
                                    handleSend(q);
                                  }}
                                  className="text-left text-[11px] text-blue-600 bg-blue-50/60 hover:bg-blue-100 rounded-lg px-2.5 py-1.5 transition-colors border border-blue-100/60"
                                >
                                  {q}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <p className="text-[10px] text-gray-400 mb-2.5">{t('helpNote', 'Your conversations stay private and are not shared with anyone.')}</p>
                        <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] text-gray-400 mb-1">{t('helpHumanLabel', 'Prefer a human?')}</p>
                            <button
                              onClick={() => { setShowHelp(false); navigate('/support'); }}
                              className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              {t('talkToTeam')}
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              setMessages([]);
                              try { localStorage.removeItem(STORAGE_KEY_MESSAGES); } catch {}
                              conversationIdRef.current = null;
                              setShowHelp(false);
                            }}
                            className="text-[10px] text-gray-400 hover:text-red-500 transition-colors"
                          >
                            {t('resetChat', 'Reset chat')}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  onClick={() => toggle(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  aria-label={t('closeChatAriaLabel')}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages + floating input wrapper */}
            <div className="flex-1 relative overflow-hidden">
            {/* Quick action pills */}
            <div className="relative z-[6] flex justify-center gap-1.5 px-4 pt-0 pb-1.5 overflow-x-auto scrollbar-hide bg-white">
              <button
                onClick={() => {
                  executeAction({ type: 'book_meeting', target: 'https://calendly.com/hello-tryvois/30min', label: t('quickPillDemo', 'Book a demo') });
                }}
                className="shrink-0 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200 transition-colors"
              >
                {t('quickPillDemo', 'Book a demo')}
              </button>
              <button
                onClick={() => handleSend(t('quickPillWaitlistMsg', 'I want to join the waitlist'))}
                className="shrink-0 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200 transition-colors"
              >
                {t('quickPillWaitlist', 'Join waitlist')}
              </button>
              <button
                onClick={() => handleSend(t('quickPillPricingMsg', 'What does pricing look like?'))}
                className="shrink-0 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200 transition-colors"
              >
                {t('quickPillPricing', 'See pricing')}
              </button>
            </div>
            {/* Messages */}
            <div className="absolute inset-0 overflow-y-auto overscroll-contain px-5 pt-10 pb-20 space-y-4 md:bg-white/60 md:backdrop-blur-sm">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-md ${
                        msg.role === 'user'
                          ? 'text-gray-900 rounded-br-md'
                          : 'bg-white/80 text-gray-800 rounded-bl-md'
                      }`}
                      style={msg.role === 'user' ? { backgroundColor: '#C8DCED' } : undefined}
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
                  {/* Non-email action chips */}
                  {msg.actions && msg.actions.some((a) => a.type !== 'email_capture') && (
                    <div className="mt-2 ml-1 space-y-2">
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
                  {/* Email capture — separate bubble below the message */}
                  {msg.actions && msg.actions.some((a) => a.type === 'email_capture') && (
                    <div className="flex justify-start mt-3">
                      <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white/80 shadow-md px-4 py-3">
                        <p className="text-sm text-gray-700 mb-2">{t('emailCapturePrompt')}</p>
                        <InlineEmailCapture
                          onSubmit={handleEmailSubmit}
                          isSubmitted={!!capturedEmail}
                          t={t}
                          currentPage={location.pathname}
                        />
                      </div>
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

            {/* Bottom gradient + floating input — overlays the messages */}
            <div className="absolute bottom-0 left-0 right-0 z-[6] pointer-events-none md:rounded-b-2xl">
              {/* Floating input row — gradient starts from bottom, fades out halfway through the pill */}
              <div className="pointer-events-auto flex items-center gap-2 px-4 pb-3 pt-4" style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.95) 50%, transparent 100%)' }}>
                <div className="flex-1 flex items-center rounded-full bg-white/90 border border-gray-200 px-4 py-3 shadow-sm backdrop-blur-sm focus-within:border-gray-400 transition-colors">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('placeholder')}
                    className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
                  />
                </div>
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="group flex h-11 w-11 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors shrink-0"
                  aria-label={t('sendMessageAriaLabel')}
                >
                  <Send size={16} className="transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:-translate-x-0.5 group-hover:rotate-[-12deg] group-disabled:transform-none" />
                </button>
              </div>
            </div>
            </div>

          </motion.aside>
        )}
      </AnimatePresence>
    </ChatNavContext.Provider>
  );
}
