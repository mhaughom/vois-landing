import React, { useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, Play, Check,
  Mic, Brain, Calendar, ListTodo, Zap,
  BarChart3, FileText,
  Clock, AlertTriangle, CheckCircle2,
  Headphones, Bot,
  Mail, Monitor, Search, Users,
  FileBarChart, Puzzle, Sparkles,
  Volume2, VolumeX,
  Phone, BookOpen, MapPin, ShoppingCart,
  Watch, FolderOpen, UserCog,
  ShieldCheck, ChevronLeft, ChevronRight, Server, Wifi, WifiOff,
} from 'lucide-react';
import { Analytics } from '../lib/analytics';
import { WorkHero3D, AnimPhase } from '../components/WorkHero3D';
import { Navbar } from '../components/Navbar';
import { HeroBusinessCarousel } from '../components/HeroBusinessCarousel';

import FeatureSection from './work/features/FeatureSection';
import VoiceNotesDemo from './work/features/VoiceNotesDemo';
import CalendarDemo from './work/features/CalendarDemo';
import TasksDemo from './work/features/TasksDemo';
import MeetingNotesDemo from './work/features/MeetingNotesDemo';
import MailDemo from './work/features/MailDemo';
import ProjectsDemo from './work/features/ProjectsDemo';
import DocumentsDemo from './work/features/DocumentsDemo';
import ReportsDemo from './work/features/ReportsDemo';
import ResearchDemo from './work/features/ResearchDemo';
import AgentsDemo from './work/features/AgentsDemo';
import TeamViewDemo from './work/features/TeamViewDemo';
import LiveViewDemo from './work/features/LiveViewDemo';
import CustomAppsDemo from './work/features/CustomAppsDemo';

// ── Animation variants ──────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1 },
};

// ── Per-face theme colors ──────────────────────────────────────────────────
const LABEL_COLORS: Record<string, string> = {
  'Your Assistant': '#6366f1',
  'Your Super-Assistant': '#8b5cf6',
  'Your Day': '#3b82f6',
  'Meetings': '#14b8a6',
  'Projects': '#f59e0b',
  'Operations': '#ef4444',
  'Clients': '#06b6d4',
  'Documents': '#a855f7',
  'Finance': '#10b981',
  'Website': '#ec4899',
  'AI Agents': '#0ea5e9',
  'Reports': '#f97316',
  'Your Team': '#059669',
  'Playbooks': '#65a30d',
  'Field to Office': '#d97706',
  'The Airlock': '#475569',
  'Your Memory': '#7c3aed',
  'Growth Engine': '#ea580c',
};

// ── Compact airlock card data for carousel ─────────────────────────────────

const compactCards = [
  {
    type: 'task' as const,
    gradient: 'linear-gradient(135deg, rgba(236,252,241,0.98), rgba(209,250,223,0.98), rgba(167,243,208,0.98))',
    shadow: '0 12px 40px rgba(0,0,0,0.1), 0 4px 12px rgba(34,197,94,0.08)',
    dateBadge: { color: 'text-green-700 bg-white/80', label: 'Thu, Feb 6' },
    categoryBadge: { color: 'from-blue-500 to-blue-600', label: 'Work' },
    emoji: '💼',
    title: 'Follow up with Sarah about Q1 budget',
    detail: '15 min',
    detailIcon: 'clock' as const,
    body: 'Sarah mentioned needing the revised budget projections. Send the updated spreadsheet and schedule a quick call.',
    addColor: 'from-green-500 to-emerald-500',
  },
  {
    type: 'person' as const,
    gradient: 'linear-gradient(135deg, rgba(224,231,255,0.98), rgba(199,210,254,0.98), rgba(165,180,252,0.98))',
    shadow: '0 12px 40px rgba(0,0,0,0.1), 0 4px 12px rgba(99,102,241,0.08)',
    dateBadge: { color: 'text-indigo-700 bg-white/80', label: 'New person' },
    categoryBadge: { color: 'from-cyan-400 to-cyan-500', label: 'Professional' },
    emoji: '',
    title: 'Deborah J. Trouw',
    detail: 'Financial advisor',
    detailIcon: 'user' as const,
    body: 'Name on business card. Mentioned during voice note about Q1 planning.',
    addColor: 'from-indigo-500 to-indigo-600',
    initials: 'DJ',
  },
  {
    type: 'event' as const,
    gradient: 'linear-gradient(135deg, rgba(254,243,199,0.98), rgba(253,230,138,0.98), rgba(252,211,77,0.98))',
    shadow: '0 12px 40px rgba(0,0,0,0.1), 0 4px 12px rgba(245,158,11,0.08)',
    dateBadge: { color: 'text-amber-700 bg-white/80', label: 'Mon, Feb 9' },
    categoryBadge: { color: 'from-blue-500 to-blue-600', label: 'Work' },
    emoji: '📅',
    title: 'Team Strategy Meeting',
    detail: '10:00 AM · 1 hr',
    detailIcon: 'clock' as const,
    body: 'Quarterly planning and team alignment.',
    addColor: 'from-amber-500 to-amber-600',
  },
];

// ── Replacement comparison data ─────────────────────────────────────────────

const replacements = [
  { tool: 'Otter.ai / Fireflies', category: 'Meeting Notes', vois: 'Auto-generated briefs before, live transcription during, action items extracted and routed after', icon: Headphones, group: 'Productivity' },
  { tool: 'Todoist / Trello', category: 'Task Management', vois: '7-factor AI priority scoring, voice extraction, focus block scheduling, automatic meeting-to-task pipeline', icon: ListTodo, group: 'Productivity' },
  { tool: 'Motion / Reclaim', category: 'AI Scheduling', vois: 'Auto-fill focus blocks with affinity filtering, dependency ordering, voice-driven with preview/approval', icon: Calendar, group: 'Productivity' },
  { tool: 'Asana / Jira / Monday.com', category: 'Project Tracking', vois: 'AI health scoring, stall detection, critical path analysis, dependency graphs, proactive alerts', icon: BarChart3, group: 'Productivity' },
  { tool: 'Google Docs / Notion', category: 'Documents', vois: 'Talk it out, get a document back — AI pulls context from your projects and data automatically', icon: FileText, group: 'Productivity' },
  { tool: 'Trainual / Process Street', category: 'Playbooks & SOPs', vois: 'Living workflows that monitor compliance, guide team members step-by-step, flag deviations', icon: BookOpen, group: 'Productivity' },

  { tool: 'HubSpot / Salesforce', category: 'CRM & Sales', vois: 'Auto-built from conversations, sentiment trends, AI strategy across 5 dimensions, opportunity routing', icon: Users, group: 'Commerce & Customers' },
  { tool: 'Shopify / WooCommerce', category: 'Products & Orders', vois: 'Variants, pricing models, inventory tracking, bookable services — all connected to your AI and website', icon: ShoppingCart, group: 'Commerce & Customers' },
  { tool: 'Calendly / Acuity', category: 'Bookings', vois: 'Availability engine with auto-order creation, CRM linking, and Stripe payments in one transaction', icon: Calendar, group: 'Commerce & Customers' },
  { tool: 'Mailchimp / ActiveCampaign', category: 'Marketing & Funnels', vois: 'AI campaigns, broadcasts, email/SMS automation with triggers, segments, and GTM analysis', icon: Zap, group: 'Commerce & Customers' },
  { tool: 'Later / Hootsuite', category: 'Social Media', vois: 'Instagram management, AI captions, metrics tracking, content deployment from Creative Studio', icon: Monitor, group: 'Commerce & Customers' },
  { tool: 'Canva / Adobe Express', category: 'Creative Studio', vois: 'AI content generation from business context, deployment tracking, opportunity-driven creative briefs', icon: Sparkles, group: 'Commerce & Customers' },

  { tool: 'Superhuman / Spark', category: 'AI Email', vois: 'Voice email sessions, 3-tone AI reply drafts, SLA timers, unified with chat and CRM timeline', icon: Mail, group: 'Communication & Content' },
  { tool: 'Gmail / Outlook / Slack', category: 'Unified Messaging', vois: 'Every channel merged per-person — email, chat, SMS in one stream with AI reply drafts and snooze', icon: Mail, group: 'Communication & Content' },
  { tool: 'Squarespace / Wix', category: 'Website Builder', vois: 'AI-generated from your business data, clone competitor sites, auto-connected commerce and bookings', icon: Monitor, group: 'Communication & Content' },
  { tool: 'PowerPoint / Google Slides', category: 'Presentations', vois: 'AI decks with live business data binding, 12 layouts, brand-aware image generation', icon: Monitor, group: 'Communication & Content' },

  { tool: 'Zapier / Make', category: 'Process Automation', vois: 'Trigger-based workflows across all 87 modules — no external tools, no webhook delays, unified data layer', icon: Zap, group: 'Operations & Field' },
  { tool: 'ClickUp / Monday.com', category: 'Operations', vois: 'Cadence-based health scoring, AI corrective actions, pattern anomaly detection, leadership dashboard', icon: Zap, group: 'Operations & Field' },
  { tool: 'Zendesk / Freshdesk', category: 'Support Tickets', vois: 'SLA timers, priority escalation, auto-created from forms or email, linked to CRM and conversations', icon: AlertTriangle, group: 'Operations & Field' },
  { tool: 'ServiceTitan / Jobber', category: 'Field Operations', vois: 'Jobs, dispatch, routes, team GPS, driving logs, time tracking — field to office with zero data entry', icon: MapPin, group: 'Operations & Field' },
  { tool: 'Routific / Circuit', category: 'Route Planning', vois: 'Mapbox geocoding, intelligent stop ordering, Google Maps deep links, integrated with dispatch and team map', icon: MapPin, group: 'Operations & Field' },
  { tool: 'Google Forms / SurveyMonkey', category: 'Reports', vois: 'Fill by voice in 90 seconds — AI interviews you field by field, pre-fills from context, feeds health scoring', icon: FileBarChart, group: 'Operations & Field' },

  { tool: 'QuickBooks / Xero', category: 'Finance', vois: 'Voice expense capture, unified receivables/payables, real-time P&L, Stripe Connect to your bank', icon: BarChart3, group: 'Finance & Admin' },
  { tool: 'Procurify / Coupa', category: 'Purchasing & Suppliers', vois: 'Purchase orders, supplier management, stock adjustments, bill tracking with partial payments', icon: ShoppingCart, group: 'Finance & Admin' },
  { tool: 'Toggl / Clockify', category: 'Time Tracking', vois: 'Clock in/out from mobile, billable hours per job/project, overtime rates, links to payroll and dispatch', icon: Clock, group: 'Finance & Admin' },
  { tool: 'BambooHR / Gusto', category: 'Team & Org Chart', vois: 'Interactive drag-and-drop org chart, 3-tier access control, draft reorgs, per-member AI budgets', icon: UserCog, group: 'Finance & Admin' },
  { tool: 'Typeform / JotForm', category: 'Forms', vois: '20+ field types, conditional routing to CRM leads or tickets with SLA timers, auto-reply', icon: FileText, group: 'Finance & Admin' },
  { tool: 'Confluence / Guru', category: 'Knowledge Search', vois: '19-source semantic search — voice, email, docs, CRM, meetings, chat — one answer in under a second', icon: Search, group: 'Finance & Admin' },
  { tool: 'Google Drive / Dropbox', category: 'Files & Media', vois: 'Unified media library with AI tagging, website intelligence scraping, text-to-speech reader', icon: FolderOpen, group: 'Finance & Admin' },

  { tool: 'A real executive assistant', category: 'Your Super-Assistant', vois: 'Knows your entire business, anticipates needs, acts on your behalf across every tool — voice, watch, phone, inbox', icon: Brain, group: 'AI & Voice' },
  { tool: 'ChatGPT / Copilot', category: 'AI Chat', vois: 'Full workspace context across 19 data sources, proactive suggestions, tool execution with approval gates', icon: Sparkles, group: 'AI & Voice' },
  { tool: 'Custom dev / Agency', category: 'AI Agents', vois: 'Autonomous agents with planning, approval gates, budget tracking, delegation, and 8 master tools', icon: Bot, group: 'AI & Voice' },
  { tool: 'Perplexity / SearchGPT', category: 'AI Research', vois: 'Deep web research with source attribution, delegated to specialized reasoning LLMs, integrated with Brain', icon: Search, group: 'AI & Voice' },
  { tool: 'McKinsey / consulting', category: 'AI Business Strategy', vois: 'Analyzes revenue, CRM, products, competitors across 5 dimensions — generates actionable opportunities with routing', icon: Sparkles, group: 'AI & Voice' },
  { tool: 'Siri / Google Assistant', category: 'Voice Intelligence', vois: 'One voice note becomes tasks, events, inventory updates, and messages — routed to 11 intent types automatically', icon: Mic, group: 'AI & Voice' },
  { tool: 'Apple Watch apps', category: 'Watch Assistant', vois: 'Full AI assistant on your wrist — real-time voice, tool execution, suggestion cards, sub-300ms latency', icon: Watch, group: 'AI & Voice' },
  { tool: 'Answering service', category: 'AI Phone & SMS', vois: 'Real phone number answered by your AI with full tool access — calendar, tasks, email, all by voice or text', icon: Phone, group: 'AI & Voice' },
];

// ── Pricing features ────────────────────────────────────────────────────────

const pricingFeatures = [
  { feature: 'Voice capture & Smart Router', personal: true, work: true },
  { feature: 'AI chat assistant', personal: true, work: true },
  { feature: 'Task management with AI scoring', personal: true, work: true },
  { feature: 'Calendar with AI scheduling', personal: true, work: true },
  { feature: 'Custom apps & marketplace', personal: true, work: true },
  { feature: 'Life areas & automations', personal: true, work: true },
  { feature: 'Live meeting transcription', personal: false, work: true },
  { feature: 'Meeting briefs & prep', personal: false, work: true },
  { feature: 'Private AI notes per attendee', personal: false, work: true },
  { feature: 'Projects & monitoring', personal: false, work: true },
  { feature: 'Reports & work reviews', personal: false, work: true },
  { feature: 'AI agents & research', personal: false, work: true },
  { feature: 'Email integration', personal: false, work: true },
  { feature: 'Desktop app (Live Guide)', personal: false, work: true },
];

// ── Section wrapper ─────────────────────────────────────────────────────────

const Section: React.FC<{
  children: React.ReactNode;
  className?: string;
  id?: string;
  dark?: boolean;
}> = ({ children, className = '', id, dark }) => (
  <section
    id={id}
    className={`relative ${dark ? 'bg-slate-950 text-white' : ''} ${className}`}
  >
    {children}
  </section>
);

// ── Agent Philosophy Section ───────────────────────────────────────────────

const AgentPhilosophySection: React.FC = () => (
  <Section className="py-24 md:py-32 px-6 md:px-12">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
      >
        {/* ── Headline ─────────────────────────────────────────── */}
        <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="text-center mb-6">
          <span className="inline-block text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">
            Agent Philosophy
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-900 mb-4">
            Every employee gets a <span className="italic">super-agent.</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Not a chatbot. An autonomous AI partner with access to the same data, the same context,
            and the same permissions as the person it serves — but it never acts without approval.
          </p>
        </motion.div>

        {/* ── Three principles ──────────────────────────────────── */}
        <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="grid md:grid-cols-3 gap-5 mb-8 max-w-3xl mx-auto">
          <div className="text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-3">
              <Brain size={22} className="text-indigo-600" />
            </div>
            <h4 className="font-semibold text-slate-900 text-sm mb-1">Same data, same brain</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your agent sees your projects, emails, calendar, CRM, and conversations. It reasons across all of them at once.
            </p>
          </div>
          <div className="text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck size={22} className="text-emerald-600" />
            </div>
            <h4 className="font-semibold text-slate-900 text-sm mb-1">Airlock, not autopilot</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every action passes through an approval gate. The agent drafts — you decide. Nothing leaves the system without your say.
            </p>
          </div>
          <div className="text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-3">
              <Users size={22} className="text-amber-600" />
            </div>
            <h4 className="font-semibold text-slate-900 text-sm mb-1">Serves, never competes</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              The agent's job is to make you more effective — surface the right info, draft the reply, flag the risk. The human always leads.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>

    {/* ── Real Action Cards — the airlock in action ─────────── */}
    <ActionCardsComponent />

    <div className="max-w-5xl mx-auto">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center text-slate-400 text-sm mt-6"
      >
        AI power, human control. Every draft reviewed. Every action approved. Every decision yours.
      </motion.p>
    </div>
  </Section>
);

// ═══════════════════════════════════════════════════════════════════════════
// WORK PAGE
// ═══════════════════════════════════════════════════════════════════════════

const Work: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [annualBilling, setAnnualBilling] = useState(true);
  const [animPhase, setAnimPhase] = useState<AnimPhase>('dot');
  const [focusLabel, setFocusLabel] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);
  const [geoVisible, setGeoVisible] = useState(false);
  const unfocusRef = React.useRef<(() => void) | null>(null);

  // Parallax: gradient scrolls at ~70% of content speed (lags 30% behind)
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, (v) => v * 0.3);

  useEffect(() => {
    Analytics.workPageViewed();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      Analytics.workBetaSubmitted();
      setSubmitted(true);
    }
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#F8F9FA' }}>
      {/* Background image — gradient + grain baked into one JPEG, tiles vertically, parallax */}
      <motion.div
        className="absolute inset-x-0 top-0 pointer-events-none z-0"
        style={{
          y: backgroundY,
          height: '130%',
          backgroundImage: 'url("/work-bg.jpg")',
          backgroundSize: '100% auto',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Top white gradient fade — softer entry from the top */}
      <div
        className="fixed top-0 left-0 right-0 pointer-events-none z-30"
        style={{
          height: 'calc(env(safe-area-inset-top, 0px) + 160px)',
          background: 'linear-gradient(to bottom, rgba(248,249,250,0.95) 0%, rgba(248,249,250,0.6) 40%, transparent 100%)',
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          NAVIGATION — outside content wrapper so z-50 stacks above overlay
          ═══════════════════════════════════════════════════════════════════ */}
      <Navbar onOpenWaitlist={() => scrollToSection('pricing')} />

      {/* All content sits above the gradient + grain layers */}
      <div className="relative z-10">

      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION — Traditional headline + CTA
          ═══════════════════════════════════════════════════════════════════ */}
      <Section className="min-h-screen pt-36 md:pt-44 pb-20 md:pb-28 px-6 md:px-12 flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left: Text content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="flex-1 text-center lg:text-left"
            >
              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.4 }}
                className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-blue-600 mb-5"
              >
                World's First
              </motion.p>

              <motion.h1
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-5 leading-[1.08]"
              >
                Human-to-Agent
                <br />
                <span className="font-normal text-blue-900/50">Business Operating System</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.6 }}
                className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl"
              >
                All your software, one platform.
                <br />
                Supercharge your employees with the AI assistance we were always promised but never got.
              </motion.p>

              <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <motion.button
                  onClick={() => scrollToSection('pricing')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3.5 bg-slate-900 text-white rounded-full text-base font-semibold shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                  Try Free
                  <ArrowRight size={18} />
                </motion.button>
                <motion.button
                  onClick={() => scrollToSection('explore')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3.5 bg-white text-slate-700 rounded-full text-base font-semibold shadow-lg border border-slate-200 hover:border-slate-300 transition-all flex items-center gap-2"
                >
                  <Play size={16} className="fill-current" />
                  Explore the Platform
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Right: Business carousel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex-1 hidden lg:flex items-center justify-center w-full max-w-md"
            >
              <HeroBusinessCarousel />
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          INTERACTIVE 3D SECTION — No container, floats on page background
          ═══════════════════════════════════════════════════════════════════ */}
      <div id="explore" className="relative pt-16 md:pt-24 pb-0">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="text-center mb-4 px-6"
          style={{ display: 'none' }}
        >
          <motion.h2
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-2xl md:text-3xl lg:text-4xl font-serif text-slate-900 mb-3"
          >
            One platform. <span className="italic">Every tool.</span>
          </motion.h2>
          <motion.p variants={fadeUp} transition={{ duration: 0.6 }} className="text-slate-500 max-w-lg mx-auto">
            Click any face to explore what HABOS can do for your business.
          </motion.p>
        </motion.div>

        <div className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            onViewportEnter={() => setGeoVisible(true)}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative w-full mx-auto"
            style={{ maxWidth: 'min(42rem, 62vh)' }}
          >
            {geoVisible && <WorkHero3D onPhaseChange={setAnimPhase} onFocusChange={setFocusLabel} unfocusRef={unfocusRef} muted={muted} onToggleMute={() => setMuted(m => !m)} />}

            {/* Story text + sound button — positioned above the 3D geometry */}
            <div className="absolute left-0 right-0 -top-[30%] z-20 px-6 flex justify-center items-center gap-3">
              <motion.p
                key={focusLabel || animPhase}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="text-2xl md:text-4xl lg:text-5xl font-serif italic text-slate-950 max-w-2xl leading-snug text-center pointer-events-none"
              >
                {focusLabel
                  ? focusLabel
                  : <>
                      {animPhase === 'dot' && 'One mind that learns your entire business.'}
                      {animPhase === 'split' && 'It connects everything you do.'}
                      {animPhase === 'cube' && 'Structure forms around you — not the other way around.'}
                      {animPhase === 'hex-morph' && 'Every surface, a workspace. Every action, anticipated.'}
                      {animPhase === 'idle' && 'Click any face to explore.'}
                    </>
                }
              </motion.p>
              {focusLabel && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setMuted(m => !m)}
                  className="flex-shrink-0 flex items-center justify-center w-9 h-9 bg-white/70 backdrop-blur-xl rounded-full border border-slate-200/50 shadow-sm hover:bg-white/90 transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
                    {muted ? (
                      <>
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <line x1="23" y1="9" x2="17" y2="15" />
                        <line x1="17" y1="9" x2="23" y2="15" />
                      </>
                    ) : (
                      <>
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                      </>
                    )}
                  </svg>
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </div>


      {/* Feature sections removed — content now lives in the 3D hexcube panels */}

      {/* ═══════════════════════════════════════════════════════════════════
          AGENT PHILOSOPHY — ONE AGENT PER EMPLOYEE
          ═══════════════════════════════════════════════════════════════════ */}
      <AgentPhilosophySection />

      {/* ═══════════════════════════════════════════════════════════════════
          WHAT HABOS REPLACES
          ═══════════════════════════════════════════════════════════════════ */}
      <Section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-900 mb-4">
                What HABOS <span className="italic">replaces.</span>
              </h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Shared context makes every capability smarter than any standalone tool.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
              <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50/80">
                  <div className="col-span-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</div>
                  <div className="col-span-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Replaces</div>
                  <div className="col-span-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">HABOS Advantage</div>
                </div>

                {/* Table rows with group headers */}
                {replacements.map((row, i) => {
                  const showGroupHeader = i === 0 || row.group !== replacements[i - 1].group;
                  return (
                    <React.Fragment key={row.category}>
                      {showGroupHeader && (
                        <div className={`px-6 py-3 bg-slate-50/60 ${i > 0 ? 'border-t border-slate-200' : ''}`}>
                          <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">{row.group}</span>
                        </div>
                      )}
                      <div
                        className={`grid grid-cols-12 gap-4 px-6 py-5 items-start ${i < replacements.length - 1 && replacements[i + 1].group === row.group ? 'border-b border-slate-100' : ''}`}
                      >
                        <div className="col-span-3 flex items-center gap-2.5">
                          <row.icon size={16} className="text-slate-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-slate-900">{row.category}</span>
                        </div>
                        <div className="col-span-3">
                          <span className="text-sm text-slate-500">{row.tool}</span>
                        </div>
                        <div className="col-span-6">
                          <span className="text-sm text-slate-600">{row.vois}</span>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          PRICING
          ═══════════════════════════════════════════════════════════════════ */}
      <Section id="pricing" className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-900 mb-4">
                Simple, transparent <span className="italic">pricing.</span>
              </h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Personal gets the full voice-to-action loop. Work adds the three professional pillars.
              </p>
            </motion.div>

            {/* Billing toggle */}
            <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="flex items-center justify-center gap-3 mb-12">
              <span className={`text-sm font-medium transition-colors ${!annualBilling ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
              <button
                onClick={() => setAnnualBilling(!annualBilling)}
                className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${annualBilling ? 'bg-slate-900' : 'bg-slate-300'}`}
              >
                <motion.div
                  className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm"
                  animate={{ left: annualBilling ? 22 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
              <span className={`text-sm font-medium transition-colors ${annualBilling ? 'text-slate-900' : 'text-slate-400'}`}>Annual</span>
              {annualBilling && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full"
                >
                  Save up to 40%
                </motion.span>
              )}
            </motion.div>

            {/* Pricing cards */}
            <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="grid md:grid-cols-2 gap-6">
              {/* Personal */}
              <div className="bg-white rounded-2xl md:rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Personal</h3>
                <p className="text-sm text-slate-500 mb-5">For everyday life organization</p>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-4xl font-bold text-slate-900 tracking-tight">
                    {annualBilling ? '$6.67' : '$14.99'}
                  </span>
                  <span className="text-slate-400 text-sm">/month</span>
                </div>
                <button
                  onClick={() => {
                    Analytics.waitlistModalOpened('work_pricing_personal');
                  }}
                  className="w-full bg-slate-100 text-slate-900 py-3.5 rounded-full text-base font-semibold hover:bg-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98] mb-6"
                >
                  Start Free Trial
                </button>
                <p className="text-xs text-slate-400 text-center mb-6">30-day money-back guarantee</p>
              </div>

              {/* Work */}
              <div className="bg-slate-950 rounded-2xl md:rounded-3xl p-8 shadow-2xl flex flex-col relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/20">
                    Recommended
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">Work</h3>
                <p className="text-sm text-slate-400 mb-5">For professionals & teams</p>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-4xl font-bold text-white tracking-tight">
                    {annualBilling ? '$29' : '$39'}
                  </span>
                  <span className="text-slate-500 text-sm">/month</span>
                </div>
                <button
                  onClick={() => {
                    Analytics.waitlistModalOpened('work_pricing_work');
                  }}
                  className="w-full bg-white text-slate-950 py-3.5 rounded-full text-base font-semibold hover:bg-slate-100 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg mb-6"
                >
                  Start Free Trial
                </button>
                <p className="text-xs text-slate-500 text-center mb-6">30-day money-back guarantee</p>
              </div>
            </motion.div>

            {/* Feature comparison table */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="mt-10 bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50/80">
                <div className="col-span-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Feature</div>
                <div className="col-span-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Personal</div>
                <div className="col-span-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Work</div>
              </div>
              {pricingFeatures.map((row, i) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-12 gap-4 px-6 py-3.5 items-center ${i < pricingFeatures.length - 1 ? 'border-b border-slate-50' : ''}`}
                >
                  <div className="col-span-6 text-sm text-slate-600">{row.feature}</div>
                  <div className="col-span-3 text-center">
                    {row.personal ? (
                      <Check size={16} className="text-emerald-500 mx-auto" />
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </div>
                  <div className="col-span-3 text-center">
                    {row.work ? (
                      <Check size={16} className="text-emerald-500 mx-auto" />
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════════════════════════════════ */}
      <Section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center"
          >
            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-900 mb-5"
            >
              Start talking to <span className="italic">your workday.</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-lg text-slate-500 mb-10"
            >
              One voice. One brain. Everything connected.
            </motion.p>

            <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
              <div className="bg-slate-950 rounded-3xl p-8 md:p-12 shadow-2xl">
                {!submitted ? (
                  <>
                    <p className="text-slate-400 text-sm mb-6">
                      Join the waitlist for early access to HABOS for Work.
                    </p>
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your work email"
                        className="flex-1 px-5 py-3.5 rounded-full bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:border-white/40 transition-colors text-sm"
                        required
                      />
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-8 py-3.5 bg-white text-slate-900 rounded-full font-semibold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        Get Early Access
                        <ArrowRight size={16} />
                      </motion.button>
                    </form>
                    <p className="text-slate-600 text-xs mt-5">
                      No spam. No credit card. Just updates on HABOS for Work.
                    </p>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-4 px-6 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl"
                  >
                    <p className="text-emerald-400 font-medium">
                      You're on the list! We'll be in touch soon.
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          FOOTER (matches homepage)
          ═══════════════════════════════════════════════════════════════════ */}
      <footer className="py-16 px-6 md:px-16" style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">

            {/* Col 1: Logo & Tagline */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src="/Logo/vois-logo.svg" alt="Vois" className="h-8 w-8" />
                <span className="font-semibold text-sm tracking-tight text-slate-900">HABOS</span>
              </div>
              <p className="text-slate-500 text-sm">Your AI workday.</p>
            </div>

            {/* Col 2: Product */}
            <div>
              <h4 className="text-slate-900 font-medium text-sm mb-4">Product</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/login" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">Login</Link>
                </li>
                <li>
                  <a href="https://apps.apple.com/app/vois" target="_blank" rel="noopener noreferrer" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">Download for iPhone</a>
                </li>
                <li>
                  <a href="https://apps.apple.com/app/vois" target="_blank" rel="noopener noreferrer" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">Download for Watch</a>
                </li>
                <li>
                  <a href="https://apps.apple.com/app/vois" target="_blank" rel="noopener noreferrer" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">Download for Mac</a>
                </li>
              </ul>
            </div>

            {/* Col 3: Support */}
            <div>
              <h4 className="text-slate-900 font-medium text-sm mb-4">Support</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/support" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">Help & FAQ</Link>
                </li>
                <li>
                  <a href="mailto:hello@tryvois.com" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">Contact Us</a>
                </li>
                <li>
                  <Link to="/setup" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">Setup Guide</Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Legal */}
            <div>
              <h4 className="text-slate-900 font-medium text-sm mb-4">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/Privacy" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/Terms" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">Terms of Service</Link>
                </li>
                <li>
                  <Link to="/legal#refund" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">Refund Policy</Link>
                </li>
              </ul>
            </div>

            {/* Col 5: Social */}
            <div>
              <h4 className="text-slate-900 font-medium text-sm mb-4">Social</h4>
              <ul className="space-y-3">
                <li>
                  <a href="https://x.com/voisaiapp" target="_blank" rel="noopener noreferrer" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">X / Twitter</a>
                </li>
                <li>
                  <a href="https://www.instagram.com/usevois" target="_blank" rel="noopener noreferrer" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">Instagram</a>
                </li>
                <li>
                  <a href="https://www.tiktok.com/@getvois" target="_blank" rel="noopener noreferrer" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">TikTok</a>
                </li>
                <li>
                  <a href="https://www.facebook.com/tryvois" target="_blank" rel="noopener noreferrer" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">Facebook</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-xs">
              &copy; {new Date().getFullYear()} Vois AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Original hero content — parked below footer for safekeeping */}
      <Section className="pb-20 md:pb-28 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center"
          >
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-slate-900 mb-6 leading-[1.08] tracking-tight"
            >
              Your AI-powered workday,
              <br />
              <span className="italic">driven by voice.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              HABOS replaces your meeting tool, scheduler, task manager, and project tracker
              with one voice-first assistant — where everything shares one brain.
            </motion.p>

            <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                onClick={() => scrollToSection('pricing')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3.5 bg-slate-900 text-white rounded-full text-base font-semibold shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                Try Free
                <ArrowRight size={18} />
              </motion.button>
              <motion.button
                onClick={() => scrollToSection('voice-notes')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3.5 bg-white text-slate-700 rounded-full text-base font-semibold shadow-lg border border-slate-200 hover:border-slate-300 transition-all flex items-center gap-2"
              >
                <Play size={16} className="fill-current" />
                See How It Works
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </Section>

      </div>{/* end content z-10 wrapper */}
    </div>
  );
};

export default Work;
