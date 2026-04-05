import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChatPanel, { type ChatPanelConfig } from '@li/shared/components/ChatPanel';
import './index.css';
import '@li/shared/lib/i18n';
import { configureConsent, bootConsent, isPostHogReady } from '@li/shared/lib/consent';
import { initAnalytics } from '@li/shared/lib/analytics';
import { configureWaitlist } from '@li/shared/lib/supabase';
import { configureVisitorProfile } from '@li/shared/lib/visitorProfile';

// Configure shared services for VOIS
configureConsent('vois_cookie_consent');
initAnalytics(isPostHogReady);
configureWaitlist('vois');
configureVisitorProfile('vois-visitor-profile');
bootConsent();

// VOIS chat configuration
const voisChatConfig: ChatPanelConfig = {
  productName: 'VOIS',
  storagePrefix: 'vois',
  intentPatterns: [
    {
      patterns: [/voice/i, /record/i, /capture/i, /speak/i, /dictate/i],
      match: {
        reply: "VOIS captures your thoughts by voice — just speak and it turns your words into tasks, events, and notes automatically.",
        actions: [{ type: 'scroll', target: '#retrieve', label: 'See how it works' }],
      },
    },
    {
      patterns: [/watch/i, /wrist/i, /apple watch/i, /wearable/i],
      match: {
        reply: "Capture thoughts from your wrist — tap, speak, done. Perfect for ideas that hit while you're on the move.",
        actions: [{ type: 'scroll', target: '#retrieve', label: 'See the Watch' }],
      },
    },
    {
      patterns: [/task/i, /todo/i, /organize/i, /list/i],
      match: {
        reply: "VOIS automatically sorts your voice into tasks, events, ideas, and notes. No manual categorization needed.",
        actions: [{ type: 'scroll', target: '#retrieve', label: 'See how it organizes' }],
      },
    },
    {
      patterns: [/calendar/i, /schedule/i, /event/i, /meeting/i],
      match: {
        reply: "Say 'lunch with Sarah Thursday' and it appears on your calendar. VOIS understands dates, times, and people.",
        actions: [{ type: 'scroll', target: '#retrieve', label: 'See Calendar' }],
      },
    },
    {
      patterns: [/brain/i, /memory/i, /remember/i, /search/i, /find/i],
      match: {
        reply: "Every thought you capture builds your personal knowledge base. Search across everything you've ever told VOIS.",
        actions: [{ type: 'scroll', target: '#retrieve', label: 'See the Second Brain' }],
      },
    },
    {
      patterns: [/pric/i, /cost/i, /plan/i, /how much/i, /free/i, /waitlist/i],
      match: {
        reply: "VOIS is in early access. Join the waitlist for launch-day access and founding member pricing.",
        actions: [{ type: 'scroll', target: '#pricing', label: 'View Pricing' }],
      },
    },
    {
      patterns: [/privac/i, /data/i, /secure/i, /safe/i],
      match: {
        reply: "Your thoughts are yours. VOIS encrypts everything and never sells your data.",
        actions: [{ type: 'navigate', target: '/legal', label: 'Privacy Policy' }],
      },
    },
    {
      patterns: [/help/i, /support/i, /contact/i],
      match: {
        reply: "Happy to help! You can also reach our team directly.",
        actions: [{ type: 'navigate', target: '/support', label: 'Contact Support' }],
      },
    },
  ],
  pageSuggestions: {
    '/': {
      message: 'Hey! Welcome to VOIS.',
      suggestion: 'What is VOIS?',
      delay: 25000,
      exitMessage: 'Got any questions before you go?',
      exitSuggestion: 'How does voice capture work?',
    },
    '/support': {
      message: 'Need help with something?',
      suggestion: 'How do I get started?',
      delay: 15000,
    },
    '/legal': {
      message: 'Looking for our policies?',
      suggestion: 'How does VOIS handle my data?',
      delay: 30000,
    },
  },
  pageNames: {
    '/': 'Home',
    '/support': 'Support',
    '/legal': 'Legal',
    '/setup': 'Setup',
    '/success': 'Success',
    '/login': 'Login',
  },
  fallbackMessage: "I can help you learn about VOIS — try asking about voice capture, organization, the Apple Watch, or pricing!",
};

// Lazy-load pages
const App = React.lazy(() => import('./App'));
const Login = React.lazy(() => import('./pages/Login'));
const Legal = React.lazy(() => import('./pages/Legal'));
const Success = React.lazy(() => import('./pages/Success'));
const Support = React.lazy(() => import('./pages/Support'));
const Setup = React.lazy(() => import('./pages/Setup'));

// Wrapper components for direct Privacy/Terms routes
const PrivacyPage = () => <Legal defaultSection="privacy" />;
const TermsPage = () => <Legal defaultSection="terms" />;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen bg-white" />}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/Privacy" element={<PrivacyPage />} />
          <Route path="/Terms" element={<TermsPage />} />
          <Route path="/support" element={<Support />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/success" element={<Success />} />
        </Routes>
        <ChatPanel config={voisChatConfig} />
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
);
