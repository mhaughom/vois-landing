import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Work from './pages/Work';
import './index.css';
import { bootConsent } from './lib/consent';

// Boot consent: reads stored preference and starts PostHog only if user opted in.
// If no consent is stored yet, PostHog stays off and the cookie banner will show.
bootConsent();

// Lazy-load heavy pages so navigating to /work isn't blocked by Three.js teardown
const App = React.lazy(() => import('./App'));
const Login = React.lazy(() => import('./pages/Login'));
const Legal = React.lazy(() => import('./pages/Legal'));
const Success = React.lazy(() => import('./pages/Success'));
const Support = React.lazy(() => import('./pages/Support'));

// Work feature pages
const MeetingNotes = React.lazy(() => import('./pages/work/meeting-notes'));
const Projects = React.lazy(() => import('./pages/work/projects'));
const Email = React.lazy(() => import('./pages/work/email'));
const Operations = React.lazy(() => import('./pages/work/operations'));
const OrgChart = React.lazy(() => import('./pages/work/org-chart'));
const Reports = React.lazy(() => import('./pages/work/reports'));

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
          <Route path="/work" element={<Work />} />
          <Route path="/work/meeting-notes" element={<MeetingNotes />} />
          <Route path="/work/projects" element={<Projects />} />
          <Route path="/work/email" element={<Email />} />
          <Route path="/work/operations" element={<Operations />} />
          <Route path="/work/org-chart" element={<OrgChart />} />
          <Route path="/work/reports" element={<Reports />} />
          <Route path="/support" element={<Support />} />
          <Route path="/success" element={<Success />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
);
