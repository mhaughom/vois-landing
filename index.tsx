import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
const Work = React.lazy(() => import('./pages/Work'));
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
const Setup = React.lazy(() => import('./pages/Setup'));

// Work feature pages
const VoiceNotes = React.lazy(() => import('./pages/work/voice-notes'));
const MeetingNotes = React.lazy(() => import('./pages/work/meeting-notes'));
const Projects = React.lazy(() => import('./pages/work/projects'));
const Email = React.lazy(() => import('./pages/work/email'));
const Operations = React.lazy(() => import('./pages/work/operations'));
const OrgChart = React.lazy(() => import('./pages/work/org-chart'));
const Reports = React.lazy(() => import('./pages/work/reports'));
const Tasks = React.lazy(() => import('./pages/work/tasks'));
const CalendarPage = React.lazy(() => import('./pages/work/calendar'));
const Assistant = React.lazy(() => import('./pages/work/assistant'));
const BrainPage = React.lazy(() => import('./pages/work/brain'));
const Briefs = React.lazy(() => import('./pages/work/briefs'));
const Agents = React.lazy(() => import('./pages/work/agents'));
const WatchAssistant = React.lazy(() => import('./pages/work/watch'));
const Slides = React.lazy(() => import('./pages/work/slides'));
const Research = React.lazy(() => import('./pages/work/research'));
const Dispatch = React.lazy(() => import('./pages/work/dispatch'));
const RoutesPage = React.lazy(() => import('./pages/work/routes'));
const TimeTracking = React.lazy(() => import('./pages/work/time-tracking'));
const TeamMap = React.lazy(() => import('./pages/work/team-map'));
const CRM = React.lazy(() => import('./pages/work/crm'));
const Products = React.lazy(() => import('./pages/work/products'));
const Bookings = React.lazy(() => import('./pages/work/bookings'));
const Finance = React.lazy(() => import('./pages/work/finance'));
const Payments = React.lazy(() => import('./pages/work/payments'));
const SchedulingLinks = React.lazy(() => import('./pages/work/scheduling-links'));
const WebsiteBuilder = React.lazy(() => import('./pages/work/website-builder'));
const Marketing = React.lazy(() => import('./pages/work/marketing'));
const CreativeStudio = React.lazy(() => import('./pages/work/creative-studio'));
const Funnels = React.lazy(() => import('./pages/work/funnels'));
const Domains = React.lazy(() => import('./pages/work/domains'));
const Scraper = React.lazy(() => import('./pages/work/scraper'));
const Messenger = React.lazy(() => import('./pages/work/messenger'));
const Telephony = React.lazy(() => import('./pages/work/telephony'));
const Tickets = React.lazy(() => import('./pages/work/tickets'));
const Forms = React.lazy(() => import('./pages/work/forms'));
const Playbooks = React.lazy(() => import('./pages/work/playbooks'));
const Files = React.lazy(() => import('./pages/work/files'));
const People = React.lazy(() => import('./pages/work/people'));

// Wrapper components for direct Privacy/Terms routes
const PrivacyPage = () => <Legal defaultSection="privacy" />;
const TermsPage = () => <Legal defaultSection="terms" />;

// Domain-aware root: habos.ai serves Work page at /, everything else serves personal App
const isHabosDomain = typeof window !== 'undefined' && window.location.hostname.includes('habos');
const RootPage = isHabosDomain ? Work : App;

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
          <Route path="/" element={<RootPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/Privacy" element={<PrivacyPage />} />
          <Route path="/Terms" element={<TermsPage />} />
          <Route path="/work" element={<Work />} />
          <Route path="/work/voice-notes" element={<VoiceNotes />} />
          <Route path="/work/meeting-notes" element={<MeetingNotes />} />
          <Route path="/work/projects" element={<Projects />} />
          <Route path="/work/email" element={<Email />} />
          <Route path="/work/operations" element={<Operations />} />
          <Route path="/work/org-chart" element={<OrgChart />} />
          <Route path="/work/reports" element={<Reports />} />
          <Route path="/work/tasks" element={<Tasks />} />
          <Route path="/work/calendar" element={<CalendarPage />} />
          <Route path="/work/assistant" element={<Assistant />} />
          <Route path="/work/brain" element={<BrainPage />} />
          <Route path="/work/briefs" element={<Briefs />} />
          <Route path="/work/agents" element={<Agents />} />
          <Route path="/work/watch" element={<WatchAssistant />} />
          <Route path="/work/slides" element={<Slides />} />
          <Route path="/work/research" element={<Research />} />
          <Route path="/work/dispatch" element={<Dispatch />} />
          <Route path="/work/routes" element={<RoutesPage />} />
          <Route path="/work/time-tracking" element={<TimeTracking />} />
          <Route path="/work/team-map" element={<TeamMap />} />
          <Route path="/work/crm" element={<CRM />} />
          <Route path="/work/products" element={<Products />} />
          <Route path="/work/bookings" element={<Bookings />} />
          <Route path="/work/finance" element={<Finance />} />
          <Route path="/work/payments" element={<Payments />} />
          <Route path="/work/scheduling-links" element={<SchedulingLinks />} />
          <Route path="/work/website-builder" element={<WebsiteBuilder />} />
          <Route path="/work/marketing" element={<Marketing />} />
          <Route path="/work/creative-studio" element={<CreativeStudio />} />
          <Route path="/work/funnels" element={<Funnels />} />
          <Route path="/work/domains" element={<Domains />} />
          <Route path="/work/scraper" element={<Scraper />} />
          <Route path="/work/messenger" element={<Messenger />} />
          <Route path="/work/telephony" element={<Telephony />} />
          <Route path="/work/tickets" element={<Tickets />} />
          <Route path="/work/forms" element={<Forms />} />
          <Route path="/work/playbooks" element={<Playbooks />} />
          <Route path="/work/files" element={<Files />} />
          <Route path="/work/people" element={<People />} />
          <Route path="/support" element={<Support />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/success" element={<Success />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
);
