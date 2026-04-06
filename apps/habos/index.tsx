import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChatPanel from '@li/shared/components/ChatPanel';
import { CookieConsent } from '@li/shared/components/CookieConsent';
import './index.css';
import '@li/shared/lib/i18n';
import { configureConsent, bootConsent, isPostHogReady } from '@li/shared/lib/consent';
import { initAnalytics } from '@li/shared/lib/analytics';
import { configureWaitlist } from '@li/shared/lib/supabase';
import { configureVisitorProfile } from '@li/shared/lib/visitorProfile';

// Configure shared services for HABOS
configureConsent('habos_cookie_consent');
initAnalytics(isPostHogReady);
configureWaitlist('habos');
configureVisitorProfile('habos-visitor-profile', ['/work/crm', '/work/dispatch', '/work/finance', '/work/operations']);
bootConsent();

const habosChat = {
  pageNames: {
    '/': 'Home',
    '/work': 'Work',
    '/support': 'Support',
    '/legal': 'Legal',
    '/setup': 'Setup',
    '/success': 'Success',
    '/login': 'Login',
    '/work/voice-notes': 'Voice Notes',
    '/work/meeting-notes': 'Meeting Notes',
    '/work/projects': 'Projects',
    '/work/email': 'Email',
    '/work/operations': 'Operations',
    '/work/org-chart': 'Org Chart',
    '/work/reports': 'Reports',
    '/work/tasks': 'Tasks',
    '/work/calendar': 'Calendar',
    '/work/assistant': 'Assistant',
    '/work/brain': 'Brain',
    '/work/briefs': 'Briefs',
    '/work/agents': 'Agents',
    '/work/watch': 'Watch Assistant',
    '/work/slides': 'Slides',
    '/work/research': 'Research',
    '/work/dispatch': 'Dispatch',
    '/work/routes': 'Routes',
    '/work/time-tracking': 'Time Tracking',
    '/work/team-map': 'Team Map',
    '/work/crm': 'CRM',
    '/work/products': 'Products',
    '/work/bookings': 'Bookings',
    '/work/finance': 'Finance',
    '/work/payments': 'Payments',
    '/work/scheduling-links': 'Scheduling Links',
    '/work/website-builder': 'Website Builder',
    '/work/marketing': 'Marketing',
    '/work/ads': 'Ads',
    '/work/creative-studio': 'Creative Studio',
    '/work/funnels': 'Funnels',
    '/work/domains': 'Domains',
    '/work/scraper': 'Scraper',
    '/work/messenger': 'Messenger',
    '/work/telephony': 'Telephony',
    '/work/tickets': 'Tickets',
    '/work/forms': 'Forms',
    '/work/playbooks': 'Playbooks',
    '/work/files': 'Files',
    '/work/people': 'People',
    '/work/communication': 'Communication',
    '/work/scheduling': 'Scheduling',
    '/work/jobs-operations': 'Jobs & Operations',
    '/work/sales-payments': 'Sales & Payments',
    '/work/voice-ai': 'Voice AI',
    '/work/website-marketing': 'Website & Marketing',
    '/solutions/service-businesses': 'Service Businesses',
    '/solutions/product-businesses': 'Product Businesses',
    '/solutions/creative-businesses': 'Creative Businesses',
    '/solutions/field-operations': 'Field Operations',
    '/solutions/teams-startups': 'Teams & Startups',
    '/solutions/solo-founders': 'Solo Founders',
    '/philosophy/the-airlock': 'The Airlock',
    '/philosophy/one-assistant': 'One Assistant',
    '/philosophy/capture-your-brain': 'Capture Your Brain',
    '/philosophy/always-within-reach': 'Always Within Reach',
    '/philosophy/suggestions-not-menus': 'Suggestions Not Menus',
    '/philosophy/two-interfaces': 'Two Interfaces',
    '/philosophy/speed-of-thought': 'Speed of Thought',
    '/philosophy/everything-in-one-place': 'Everything in One Place',
    '/philosophy/built-for-teams': 'Built for Teams',
    '/philosophy/your-software-your-way': 'Your Software Your Way',
    '/philosophy/advisors-that-disagree': 'Advisors That Disagree',
    '/philosophy/ai-native': 'AI Native',
    '/philosophy/human-control': 'Human Control',
    '/philosophy/memory-that-compounds': 'Memory That Compounds',
    '/philosophy/one-brain': 'One Brain',
    '/philosophy/small-team-leverage': 'Small Team Leverage',
    '/philosophy/supercharge-your-team': 'Supercharge Your Team',
    '/philosophy/voice-first': 'Voice First',
  },
};

// Lazy-load pages
const Work = React.lazy(() => import('./pages/Work'));
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
const Ads = React.lazy(() => import('./pages/work/ads'));
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

// Category landing pages
const CommunicationPage = React.lazy(() => import('./pages/work/communication'));
const SchedulingPage = React.lazy(() => import('./pages/work/scheduling'));
const JobsOperationsPage = React.lazy(() => import('./pages/work/jobs-operations'));
const SalesPaymentsPage = React.lazy(() => import('./pages/work/sales-payments'));
const VoiceAIPage = React.lazy(() => import('./pages/work/voice-ai'));
const WebsiteMarketingPage = React.lazy(() => import('./pages/work/website-marketing'));

// Solution pages
const ServiceBusinesses = React.lazy(() => import('./pages/solutions/service-businesses'));
const ProductBusinesses = React.lazy(() => import('./pages/solutions/product-businesses'));
const CreativeBusinesses = React.lazy(() => import('./pages/solutions/creative-businesses'));
const FieldOperations = React.lazy(() => import('./pages/solutions/field-operations'));
const TeamsStartups = React.lazy(() => import('./pages/solutions/teams-startups'));
const SoloFounders = React.lazy(() => import('./pages/solutions/solo-founders'));

// Philosophy pages
const TheAirlock = React.lazy(() => import('./pages/philosophy/the-airlock'));
const OneAssistant = React.lazy(() => import('./pages/philosophy/one-assistant'));
const CaptureYourBrain = React.lazy(() => import('./pages/philosophy/capture-your-brain'));
const AlwaysWithinReach = React.lazy(() => import('./pages/philosophy/always-within-reach'));
const SuggestionsNotMenus = React.lazy(() => import('./pages/philosophy/suggestions-not-menus'));
const TwoInterfaces = React.lazy(() => import('./pages/philosophy/two-interfaces'));
const SpeedOfThought = React.lazy(() => import('./pages/philosophy/speed-of-thought'));
const EverythingInOnePlace = React.lazy(() => import('./pages/philosophy/everything-in-one-place'));
const BuiltForTeams = React.lazy(() => import('./pages/philosophy/built-for-teams'));
const YourSoftwareYourWay = React.lazy(() => import('./pages/philosophy/your-software-your-way'));
const AdvisorsThatDisagree = React.lazy(() => import('./pages/philosophy/advisors-that-disagree'));
const AiNative = React.lazy(() => import('./pages/philosophy/ai-native'));
const HumanControl = React.lazy(() => import('./pages/philosophy/human-control'));
const MemoryThatCompounds = React.lazy(() => import('./pages/philosophy/memory-that-compounds'));
const OneBrain = React.lazy(() => import('./pages/philosophy/one-brain'));
const SmallTeamLeverage = React.lazy(() => import('./pages/philosophy/small-team-leverage'));
const SuperchargeYourTeam = React.lazy(() => import('./pages/philosophy/supercharge-your-team'));
const VoiceFirst = React.lazy(() => import('./pages/philosophy/voice-first'));

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
          <Route path="/" element={<Work />} />
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
          <Route path="/work/ads" element={<Ads />} />
          <Route path="/work/communication" element={<CommunicationPage />} />
          <Route path="/work/scheduling" element={<SchedulingPage />} />
          <Route path="/work/jobs-operations" element={<JobsOperationsPage />} />
          <Route path="/work/sales-payments" element={<SalesPaymentsPage />} />
          <Route path="/work/voice-ai" element={<VoiceAIPage />} />
          <Route path="/work/website-marketing" element={<WebsiteMarketingPage />} />
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
          <Route path="/solutions/service-businesses" element={<ServiceBusinesses />} />
          <Route path="/solutions/product-businesses" element={<ProductBusinesses />} />
          <Route path="/solutions/creative-businesses" element={<CreativeBusinesses />} />
          <Route path="/solutions/field-operations" element={<FieldOperations />} />
          <Route path="/solutions/teams-startups" element={<TeamsStartups />} />
          <Route path="/solutions/solo-founders" element={<SoloFounders />} />
          <Route path="/philosophy/the-airlock" element={<TheAirlock />} />
          <Route path="/philosophy/one-assistant" element={<OneAssistant />} />
          <Route path="/philosophy/capture-your-brain" element={<CaptureYourBrain />} />
          <Route path="/philosophy/always-within-reach" element={<AlwaysWithinReach />} />
          <Route path="/philosophy/suggestions-not-menus" element={<SuggestionsNotMenus />} />
          <Route path="/philosophy/two-interfaces" element={<TwoInterfaces />} />
          <Route path="/philosophy/speed-of-thought" element={<SpeedOfThought />} />
          <Route path="/philosophy/everything-in-one-place" element={<EverythingInOnePlace />} />
          <Route path="/philosophy/built-for-teams" element={<BuiltForTeams />} />
          <Route path="/philosophy/your-software-your-way" element={<YourSoftwareYourWay />} />
          <Route path="/philosophy/advisors-that-disagree" element={<AdvisorsThatDisagree />} />
          <Route path="/philosophy/ai-native" element={<AiNative />} />
          <Route path="/philosophy/human-control" element={<HumanControl />} />
          <Route path="/philosophy/memory-that-compounds" element={<MemoryThatCompounds />} />
          <Route path="/philosophy/one-brain" element={<OneBrain />} />
          <Route path="/philosophy/small-team-leverage" element={<SmallTeamLeverage />} />
          <Route path="/philosophy/supercharge-your-team" element={<SuperchargeYourTeam />} />
          <Route path="/philosophy/voice-first" element={<VoiceFirst />} />
          <Route path="/support" element={<Support />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/success" element={<Success />} />
        </Routes>
        {/* Top white gradient fade — softer entry from the top, shared across all pages */}
        <div
          className="fixed top-0 left-0 right-0 pointer-events-none z-30"
          style={{
            height: 'calc(env(safe-area-inset-top, 0px) + 160px)',
            background: 'linear-gradient(to bottom, rgba(248,249,250,0.95) 0%, rgba(248,249,250,0.6) 40%, transparent 100%)',
          }}
        />
        <ChatPanel config={habosChat} />
        <CookieConsent />
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
);
