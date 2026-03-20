import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, Play, Check,
  Mic, Brain, Calendar, ListTodo, Zap,
  BarChart3, FileText,
  Clock, AlertTriangle, CheckCircle2,
  Headphones, Bot,
  Mail, Monitor, Search, Users,
  FileBarChart, Puzzle, Sparkles,
} from 'lucide-react';
import { Analytics } from '../lib/analytics';

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
      {/* Single full-height gradient background — no tiling, no seams */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 35% at 15% 8%, rgba(100,160,245,0.28) 0%, transparent 60%),
            radial-gradient(ellipse 70% 25% at 70% 15%, rgba(130,200,220,0.24) 0%, transparent 60%),
            radial-gradient(ellipse 60% 20% at 25% 25%, rgba(160,130,230,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 80% 25% at 60% 35%, rgba(80,190,210,0.22) 0%, transparent 60%),
            radial-gradient(ellipse 70% 20% at 35% 45%, rgba(100,150,240,0.22) 0%, transparent 60%),
            radial-gradient(ellipse 60% 18% at 75% 52%, rgba(240,175,130,0.14) 0%, transparent 60%),
            radial-gradient(ellipse 80% 25% at 20% 60%, rgba(130,200,220,0.24) 0%, transparent 60%),
            radial-gradient(ellipse 70% 22% at 65% 68%, rgba(100,160,245,0.22) 0%, transparent 60%),
            radial-gradient(ellipse 60% 20% at 40% 78%, rgba(160,130,230,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 80% 25% at 80% 85%, rgba(80,190,210,0.20) 0%, transparent 60%),
            radial-gradient(ellipse 70% 22% at 30% 92%, rgba(100,150,240,0.22) 0%, transparent 60%),
            radial-gradient(ellipse 60% 18% at 55% 98%, rgba(240,175,130,0.12) 0%, transparent 60%)`,
        }}
      />
      {/* Grain texture — on background only, not on text/elements */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          opacity: 0.38,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
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
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-5 md:px-12"
        style={{ paddingTop: 'calc(1.25rem + env(safe-area-inset-top, 0px))' }}
      >
        <a href="/">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2.5 bg-white/80 backdrop-blur-xl px-4 py-2 rounded-full border border-slate-200/60 shadow-sm"
          >
            <ArrowLeft size={15} className="text-slate-500" />
            <span className="font-medium text-sm text-slate-500">Home</span>
          </motion.div>
        </a>

        <div className="absolute left-1/2 -translate-x-1/2">
          <a href="/work">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2.5 bg-white/80 backdrop-blur-xl px-4 py-2 rounded-full border border-slate-200/60 shadow-sm"
            >
              <img src="/Logo/vois-logo.svg" alt="Vois" className="h-7 w-7" />
              <span className="font-semibold text-sm tracking-tight text-slate-900">VOIS</span>
              <span className="text-slate-400 text-sm font-medium">for Work</span>
            </motion.div>
          </a>
        </div>

        <motion.button
          onClick={() => scrollToSection('pricing')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-slate-900/90 backdrop-blur-md text-white px-5 py-2 rounded-full text-sm font-semibold border border-slate-700 shadow-lg hover:bg-slate-900 transition-colors"
        >
          Try Free
        </motion.button>
      </motion.nav>

      {/* All content sits above the gradient + grain layers */}
      <div className="relative z-10">

      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      <Section className="pt-36 md:pt-44 pb-20 md:pb-28 px-6 md:px-12 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="mb-6">
              <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium border border-indigo-100">
                <Zap size={14} />
                Voice-First AI Productivity
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-slate-900 mb-6 leading-[1.08] tracking-tight"
            >
              Your AI-powered workday,
              <br />
              <span className="italic">driven by voice.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              VOIS replaces your meeting tool, scheduler, task manager, and project tracker
              with one voice-first assistant — where everything shares one brain.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
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

            {/* Video placeholder */}
            <motion.div
              variants={scaleIn}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative max-w-4xl mx-auto"
            >
              <div className="relative aspect-video rounded-2xl md:rounded-3xl overflow-hidden bg-slate-900 shadow-2xl shadow-slate-900/30 border border-slate-800">
                <video
                  className="w-full h-full object-cover"
                  poster="/videos/situations-poster.jpg"
                  playsInline
                  controls
                  loop
                >
                  <source src="/videos/Situations-with-cards.mp4" type="video/mp4" />
                </video>
                {/* Gradient overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
                  <span className="text-white/70 text-xs font-medium">Voice note to organized workday — 30 seconds</span>
                </div>
              </div>

              {/* Decorative glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-400/20 via-purple-400/20 to-pink-400/20 rounded-[2rem] blur-3xl -z-10" />
            </motion.div>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          FEATURE SECTIONS
          ═══════════════════════════════════════════════════════════════════ */}

      {/* 1. Voice Notes — Smart Router */}
      <FeatureSection
        id="voice-notes"
        index={0}
        badge="Voice Notes"
        badgeIcon={<Mic size={22} />}
        badgeColor="#7c6ef5"
        headline={<>Speak once. <span className="italic">Create everything.</span></>}
        body="Record a 30-second voice note about your day and watch VOIS split it apart. The Smart Router detects every intent in a single recording — two tasks, a calendar event, a project update, a person mention — and routes each one to the right place automatically. No tagging, no sorting, no opening five apps. Just talk."
        closingLine="Other apps let you record voice memos. VOIS understands them."
        demo={<VoiceNotesDemo />}
      />

      {/* 2. Calendar — AI Scheduling */}
      <FeatureSection
        id="calendar"
        index={1}
        badge="Calendar"
        badgeIcon={<Calendar size={22} />}
        badgeColor="#e8a04e"
        headline={<>Say &ldquo;plan my day.&rdquo; <span className="italic">Mean it.</span></>}
        body="Tell VOIS what you need to get done. The AI looks at your tasks, priorities, deadlines, and existing calendar — then proposes a full schedule with themed time blocks like Deep Work, Admin, and Meetings. You preview everything before it commits. Drag a block and see exactly how it ripples through the rest of your day."
        closingLine="Motion auto-schedules without asking. VOIS proposes, you decide."
        demo={<CalendarDemo />}
      />

      {/* 3. Tasks — AI-Scored Task Management */}
      <FeatureSection
        id="tasks"
        index={2}
        badge="Tasks"
        badgeIcon={<ListTodo size={22} />}
        badgeColor="#5bb98c"
        headline={<>Every task scored. <span className="italic">Nothing falls through.</span></>}
        body="Create tasks by voice, from meeting transcripts, or from AI agent output. Every task gets an AI-calculated importance and urgency score that feeds directly into how your day gets scheduled. The scoring engine weighs deadlines, project context, dependencies, and domain to surface what actually matters."
        closingLine="You capture. VOIS prioritizes."
        demo={<TasksDemo />}
      />

      {/* 4. Meeting Notes — Live Transcription & Prep */}
      <FeatureSection
        id="meeting-notes"
        index={3}
        badge="Meeting Notes"
        badgeIcon={<Headphones size={22} />}
        badgeColor="#8b8af8"
        headline={<>Prepared before. Transcribed during. <span className="italic">Organized after.</span></>}
        body="VOIS generates personalized briefings before every meeting — with talking points pulled from your projects, notes, and past interactions. During the meeting, live transcription with speaker diarization captures everything. After the call, action items are extracted and flow directly into your task manager."
        closingLine="Otter transcribes your meetings. VOIS prepares you for them, captures them, and turns them into action."
        demo={<MeetingNotesDemo />}
      />

      {/* 5. Mail — AI-Powered Inbox */}
      <FeatureSection
        id="mail"
        index={4}
        badge="Mail"
        badgeIcon={<Mail size={22} />}
        badgeColor="#5db5e0"
        headline={<>Your inbox, <span className="italic">understood.</span></>}
        body="Connect Gmail or Outlook and VOIS reads, categorizes, scores, and summarizes every email automatically. Important threads surface first. Action items are extracted and linked to your tasks. Reply suggestions match your writing style in three tones: direct, warm, or executive."
        closingLine="Superhuman makes email fast. VOIS makes email part of your system."
        demo={<MailDemo />}
      />

      {/* 6. Projects — Health Monitoring */}
      <FeatureSection
        id="projects"
        index={5}
        badge="Projects"
        badgeIcon={<BarChart3 size={22} />}
        badgeColor="#e07850"
        headline={<>Know which projects need you <span className="italic">before they stall.</span></>}
        body="VOIS doesn't just track projects — it watches them. AI health scoring monitors task completion, activity patterns, and timeline progress. When a project goes quiet for too long, it flags it proactively and suggests breaking the next milestone into smaller tasks."
        closingLine="Project dashboards show you what happened. VOIS tells you what to do about it."
        demo={<ProjectsDemo />}
      />

      {/* 7. Documents — Speak a Document */}
      <FeatureSection
        id="documents"
        index={6}
        badge="Documents"
        badgeIcon={<FileText size={22} />}
        badgeColor="#b48cf2"
        headline={<>Talk it out. <span className="italic">Get a document back.</span></>}
        body="Describe what you need — a project brief, a client proposal, a weekly update — and VOIS generates a structured document from your voice. The AI pulls context from your projects, tasks, meetings, and notes to fill in the details you'd otherwise spend an hour writing."
        closingLine="Stop staring at blank pages. Start talking."
        demo={<DocumentsDemo />}
      />

      {/* 8. Reports — Voice-Filled */}
      <FeatureSection
        id="reports"
        index={7}
        badge="Reports"
        badgeIcon={<FileBarChart size={22} />}
        badgeColor="#f27eb0"
        headline={<>Reports that <span className="italic">fill themselves.</span></>}
        body="Upload a PDF, image, or Word template and VOIS extracts every field. Then fill the entire report by voice — the AI interviews you one field at a time, validates sensitive entries, and pre-fills what it already knows from your projects and profile."
        closingLine="The report you hate filling out? VOIS asks you 10 questions and it's done."
        demo={<ReportsDemo />}
      />

      {/* 9. Research — Semantic Search & Web */}
      <FeatureSection
        id="research"
        index={8}
        badge="Research"
        badgeIcon={<Search size={22} />}
        badgeColor="#4ec5a8"
        headline={<>Search everything you know. <span className="italic">And everything you don't.</span></>}
        body="Query your entire VOIS brain — recordings, documents, emails, meeting transcripts, chat history, people notes — with semantic search powered by vector embeddings. When your personal knowledge isn't enough, VOIS searches the web with citations."
        closingLine="Your second brain, with perfect recall."
        demo={<ResearchDemo />}
      />

      {/* 10. Team View — Your AI Org Chart */}
      <FeatureSection
        id="team-view"
        index={9}
        badge="Team View"
        badgeIcon={<Users size={22} />}
        badgeColor="#d4a054"
        headline={<>Hire AI agents <span className="italic">like you hire people.</span></>}
        body="Build your AI team in an org chart. Assign agents to roles — a researcher who monitors your competitors, a writer who drafts your weekly updates, a strategist who reviews project health. Each agent has defined responsibilities, tools, budgets, and reporting lines."
        closingLine="Your first ten hires don't need salaries."
        demo={<TeamViewDemo />}
      />

      {/* 11. AI Agents — Mission Control */}
      <FeatureSection
        id="agents"
        index={10}
        badge="AI Agents"
        badgeIcon={<Bot size={22} />}
        badgeColor="#6b9af7"
        headline={<>Delegate to AI. <span className="italic">Stay in control.</span></>}
        body="Launch AI agents that research, write, analyze, and build — autonomously but never unsupervised. Every agent plans before acting, asks clarifying questions, respects budget limits, and pauses for your approval before any sensitive action."
        closingLine="ChatGPT answers questions. VOIS agents complete missions."
        demo={<AgentsDemo />}
      />

      {/* 12. Live View — Desktop Guide with Skills */}
      <FeatureSection
        id="live-view"
        index={11}
        badge="Live View"
        badgeIcon={<Monitor size={22} />}
        badgeColor="#c882f0"
        headline={<>AI that sees your screen <span className="italic">and helps in real time.</span></>}
        body="The macOS desktop app sits in your menu bar, captures your screen context, and provides intelligent guidance for whatever you're working on. Skills extend Live View to work with specific apps — presentation coaching while you're in Keynote, writing assistance in Google Docs, code review in your IDE."
        closingLine="Your AI assistant shouldn't live in a chat window. It should live where you work."
        demo={<LiveViewDemo />}
      />

      {/* 13. Custom Apps — Build Anything by Voice */}
      <FeatureSection
        id="custom-apps"
        index={12}
        badge="Custom Apps"
        badgeIcon={<Puzzle size={22} />}
        badgeColor="#e86878"
        headline={<>Describe it. <span className="italic">VOIS builds it.</span></>}
        body='Say "I want an app to track wines I taste" and VOIS generates a complete mini-app — with data fields, AI-powered enrichment, dashboard visualizations, and automatic routing from your voice notes. Future recordings mentioning wine automatically populate your app with structured data.'
        closingLine="Every productivity tool started as someone's spreadsheet. VOIS lets you skip the spreadsheet."
        demo={<CustomAppsDemo />}
      />

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
      </div>{/* end content z-10 wrapper */}
    </div>
  );
};

export default Work;
