import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
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
} from 'lucide-react';
import { Analytics } from '../lib/analytics';
import { WorkHero3D, AnimPhase } from '../components/WorkHero3D';

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

// ── Proactive notification examples ─────────────────────────────────────────

const notifications = [
  {
    icon: FileText,
    title: 'Meeting prep ready',
    body: 'Your 2pm with Investor X — I\'ve prepared a briefing based on your last 3 interactions and their latest portfolio moves.',
    time: '1:53 PM',
    color: '#6366f1',
  },
  {
    icon: AlertTriangle,
    title: 'Project stall detected',
    body: 'Q1 Report hasn\'t had activity in 5 days. Should I break the next milestone into smaller tasks?',
    time: '9:15 AM',
    color: '#f59e0b',
  },
  {
    icon: Clock,
    title: 'Unstructured time found',
    body: 'You have 90 free minutes this afternoon. I\'ve packed your two highest-priority tasks. Here\'s a proposed schedule.',
    time: '11:30 AM',
    color: '#10b981',
  },
  {
    icon: CheckCircle2,
    title: 'Action items extracted',
    body: 'Your meeting just ended. I found 4 action items — want to review and assign them to projects?',
    time: '3:02 PM',
    color: '#0ea5e9',
  },
];

// ── Replacement comparison data ─────────────────────────────────────────────

const replacements = [
  { tool: 'Otter.ai / Fireflies', category: 'Meeting Notes', vois: 'Provenance tracking, personal briefs per attendee, live question suggestions', icon: Headphones },
  { tool: 'Todoist / Things', category: 'Task Management', vois: 'AI scoring, voice extraction, automatic meeting-to-task pipeline', icon: ListTodo },
  { tool: 'Motion / Reclaim', category: 'AI Scheduling', vois: 'Voice-driven with preview/approval, drag-ripple effects, life area time blocks', icon: Calendar },
  { tool: 'Notion / Jira', category: 'Project Tracking', vois: 'AI health scoring, stall detection, proactive alerts', icon: BarChart3 },
  { tool: 'ChatGPT / Copilot', category: 'AI Assistant', vois: 'Full workspace context, proactive suggestions, tool execution with confirmation', icon: Brain },
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
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'circOut' }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center px-6 py-5 md:px-12"
        style={{ paddingTop: 'calc(1.25rem + env(safe-area-inset-top, 0px))' }}
      >
        {/* Back button — only visible when focused */}
        <div
          className="absolute left-6 md:left-12 flex items-center gap-2 transition-opacity duration-400"
          style={{ opacity: focusLabel ? 1 : 0, pointerEvents: focusLabel ? 'auto' : 'none' }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => unfocusRef.current?.()}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-xl px-4 py-2.5 rounded-full border border-slate-200/60 shadow-sm"
          >
            <ArrowLeft size={15} className="text-slate-500" />
            <span className="font-medium text-sm text-slate-500">Back</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setMuted(m => !m)}
            className="flex items-center justify-center w-10 h-10 bg-white/80 backdrop-blur-xl rounded-full border border-slate-200/60 shadow-sm"
          >
            {muted ? <VolumeX size={16} className="text-slate-400" /> : <Volume2 size={16} className="text-slate-600" />}
          </motion.button>
        </div>

        {/* Center pill — HABOS or focused face title */}
        {(() => {
          const color = focusLabel ? (LABEL_COLORS[focusLabel] || '#6366f1') : undefined;
          return (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="backdrop-blur-xl rounded-full border shadow-sm"
              style={{
                padding: focusLabel ? '14px 36px' : '10px 24px',
                backgroundColor: color ? `${color}12` : 'rgba(255,255,255,0.8)',
                borderColor: color ? `${color}30` : 'rgba(226,232,240,0.6)',
                boxShadow: color
                  ? `0 1px 3px ${color}15, 0 4px 16px ${color}10`
                  : '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'padding 0.4s ease, background-color 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease',
              }}
            >
              {focusLabel ? (
                <span
                  className="font-bold text-xl md:text-2xl tracking-tight whitespace-nowrap"
                  style={{ color, transition: 'color 0.4s ease' }}
                >{focusLabel}</span>
              ) : (
                <div className="flex flex-col items-center leading-tight">
                  <span className="font-semibold text-base tracking-tight text-slate-900">HABOS</span>
                  <span className="text-[10px] text-slate-400 font-medium"><span className="text-slate-500">Human Agent Business</span> Operating System</span>
                </div>
              )}
            </motion.div>
          );
        })()}

        {/* Try Free — only visible when not focused */}
        <div
          className="absolute right-6 md:right-12 transition-opacity duration-400"
          style={{ opacity: focusLabel ? 0 : 1, pointerEvents: focusLabel ? 'none' : 'auto' }}
        >
          <motion.button
            onClick={() => scrollToSection('pricing')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-slate-900/90 backdrop-blur-md text-white px-5 py-2 rounded-full text-sm font-semibold border border-slate-700 shadow-lg hover:bg-slate-900 transition-colors"
          >
            Try Free
          </motion.button>
        </div>
      </motion.nav>

      {/* All content sits above the gradient + grain layers */}
      <div className="relative z-10">

      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION — Traditional headline + CTA
          ═══════════════════════════════════════════════════════════════════ */}
      <Section className="pt-36 md:pt-44 pb-20 md:pb-28 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="mb-6">
              <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium border border-indigo-100">
                <Zap size={14} />
                AI-Native Business Operating System
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-slate-900 mb-6 leading-[1.08] tracking-tight"
            >
              Every employee gets
              <br />
              <span className="italic">a super-assistant.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              HABOS replaces your scattered tools with one AI-powered workspace.
              Talk to your business instead of clicking through it.
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
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          INTERACTIVE 3D SECTION — No container, floats on page background
          ═══════════════════════════════════════════════════════════════════ */}
      <div id="explore" className="relative pt-4 md:pt-8 pb-0">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="text-center mb-4 px-6"
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
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative w-full mx-auto"
            style={{ maxWidth: 'min(42rem, 62vh)' }}
          >
            <WorkHero3D onPhaseChange={setAnimPhase} onFocusChange={setFocusLabel} unfocusRef={unfocusRef} muted={muted} />
          </motion.div>

          {/* Story text */}
          <div className="text-center py-4 px-6">
            <div className="h-12 flex items-center justify-center">
              <motion.p
                key={animPhase}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto leading-relaxed"
              >
                {animPhase === 'dot' && 'A single point of intelligence.'}
                {animPhase === 'split' && 'It connects. It multiplies.'}
                {animPhase === 'cube' && 'Structure emerges from simplicity.'}
                {animPhase === 'hex-morph' && 'Every surface becomes a workspace.'}
                {animPhase === 'idle' && 'Click any face to explore.'}
              </motion.p>
            </div>
          </div>
        </div>
      </div>


      {/* Feature sections removed — content now lives in the 3D hexcube panels */}

      {/* ═══════════════════════════════════════════════════════════════════
          PROACTIVE AI — KEY DIFFERENTIATOR
          ═══════════════════════════════════════════════════════════════════ */}
      <Section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="text-center mb-16">
              <span className="inline-block text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-3">Key Differentiator</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-900 mb-4">
                VOIS doesn't wait for you <span className="italic">to ask.</span>
              </h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Most AI tools are reactive — you ask, they answer. VOIS flips this model. Its AI continuously monitors
                your workspace and surfaces the right action at the right moment.
              </p>
            </motion.div>

            {/* All 4 notifications visible in a grid */}
            <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {notifications.map((notif, i) => (
                <motion.div
                  key={notif.title}
                  variants={fadeUp}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: notif.color + '15' }}
                    >
                      <notif.icon size={18} style={{ color: notif.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-slate-900">{notif.title}</span>
                        <span className="text-xs text-slate-400">{notif.time}</span>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">{notif.body}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-center text-slate-400 text-sm mt-8"
            >
              All of these happen automatically. No prompting required.
            </motion.p>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          WHAT VOIS REPLACES
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
                What VOIS <span className="italic">replaces.</span>
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
                  <div className="col-span-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">VOIS Advantage</div>
                </div>

                {/* Table rows */}
                {replacements.map((row, i) => (
                  <div
                    key={row.category}
                    className={`grid grid-cols-12 gap-4 px-6 py-5 items-start ${i < replacements.length - 1 ? 'border-b border-slate-100' : ''}`}
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
                ))}
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
                      Join the waitlist for early access to VOIS for Work.
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
                      No spam. No credit card. Just updates on VOIS for Work.
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
                <span className="font-semibold text-sm tracking-tight text-slate-900">VOIS</span>
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
              VOIS replaces your meeting tool, scheduler, task manager, and project tracker
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
