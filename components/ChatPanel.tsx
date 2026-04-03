import React, { useState, useRef, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ═══════════════════════════════════════════════════════════════════
// Chat Navigation Context — lets the AI navigate pages & highlight elements
// ═══════════════════════════════════════════════════════════════════

export interface ChatAction {
  type: 'navigate' | 'highlight' | 'scroll';
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
      reply: "Voice Notes capture your thoughts instantly — just speak and VOIS structures it.",
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
// Chat Panel Component
// ═══════════════════════════════════════════════════════════════════

const PANEL_WIDTH = 380;

interface ChatPanelProps {
  onToggle?: (isOpen: boolean) => void;
}

export default function ChatPanel({ onToggle }: ChatPanelProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageData[]>([
    { id: 1, role: 'assistant', text: "Hi! I can help you explore HABOS. Ask about any feature — email, CRM, tasks, calendar — and I'll take you there." },
  ]);
  const [input, setInput] = useState('');
  const [highlightSelector, setHighlightSelector] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggle = (next?: boolean) => {
    const value = next ?? !isOpen;
    setIsOpen(value);
    onToggle?.(value);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 350);
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
    }
  }, [navigate]);

  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text: trimmed }]);
    setInput('');
    setIsLoading(true);

    // Build history for context (last 6 messages)
    const history = messages.slice(-6).map((m) => ({ role: m.role, text: m.text }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history }),
      });

      if (!res.ok) throw new Error('API error');

      const data = await res.json();
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: data.text || "I'm not sure how to help with that. Try asking about a specific feature!",
        actions: data.actions || [],
      }]);
    } catch {
      // Fallback to local intent matching if API is unavailable
      const intent = matchIntent(trimmed);
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: intent?.reply || "I can help you navigate VOIS features. Try asking about email, calendar, tasks, CRM, voice notes, or pricing!",
        actions: intent?.actions || [],
      }]);
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
            aria-label="Open chat"
          >
            <MessageCircle size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: PANEL_WIDTH, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: PANEL_WIDTH, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ width: PANEL_WIDTH, top: 120, right: 16, bottom: 16 }}
            className="fixed z-40 flex flex-col bg-transparent overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-white rounded-2xl mb-2 shadow-sm border border-slate-200/40">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white">
                  <MessageCircle size={16} />
                </div>
                <span className="text-sm font-semibold text-gray-900">HABOS Chat</span>
              </div>
              <button
                onClick={() => toggle(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-white rounded-2xl mb-2 shadow-sm border border-slate-200/40">
              {messages.map((msg) => (
                <div key={msg.id}>
                  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gray-900 text-white rounded-br-md'
                          : 'bg-white/80 text-gray-800 rounded-bl-md border border-gray-100'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                  {/* Action chips */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 ml-1">
                      {msg.actions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => executeAction(action)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50/80 hover:bg-blue-100 rounded-full transition-colors border border-blue-100"
                        >
                          <ExternalLink size={10} />
                          {action.label || action.target}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/80 border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 bg-white rounded-2xl shadow-sm border border-slate-200/40">
              <div className="flex items-center gap-2 rounded-xl bg-white/60 border border-gray-200/60 px-3 py-2 focus-within:border-gray-400 transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about any feature..."
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </ChatNavContext.Provider>
  );
}
