import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChatPanel from '@li/shared/components/ChatPanel';
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
        <ChatPanel />
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
);
