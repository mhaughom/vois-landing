import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ContextualChat } from '../components/ContextualChat';
import { ActionCards as ActionCardsComponent } from '../components/ActionCards';
import ChatPanel from '../components/ChatPanel';
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
  ShieldCheck, ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import { Analytics } from '../lib/analytics';
import { WorkHero3D, AnimPhase } from '../components/WorkHero3D';
import { Navbar } from '../components/Navbar';
import { HeroBusinessCarousel } from '../components/HeroBusinessCarousel';
import { BoxAnimation } from '../components/BoxAnimation';
import { AppGridBox } from '../components/AppGridBox';

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

// ── Chroma key video — renders video to canvas, replacing white with transparency ──

const ChromaKeyVideo: React.FC<{
  videoRef: React.RefObject<HTMLVideoElement | null>;
  src: string;
  loopSrc?: string;
  keyStrength: number;
  className?: string;
  onVideoTime?: (totalElapsed: number) => void;
}> = ({ videoRef, src, loopSrc, keyStrength, className, onVideoTime }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const introVideoRef = useRef<HTMLVideoElement | null>(null);
  const loopVideoRef = useRef<HTMLVideoElement | null>(null);
  const useLoopRef = useRef(false);
  const introEndTimeRef = useRef(0);
  const startWallTime = useRef(0);
  const isVisibleRef = useRef(true);

  // Expose the intro video to parent
  useEffect(() => {
    if (videoRef && 'current' in videoRef) {
      (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = introVideoRef.current;
    }
  }, [videoRef]);

  // Pause videos when off-screen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting;
      const intro = introVideoRef.current;
      const loop = loopVideoRef.current;
      if (entry.isIntersecting) {
        const active = useLoopRef.current ? loop : intro;
        active?.play().catch(() => {});
      } else {
        intro?.pause();
        loop?.pause();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Preload loop video and switch when intro ends
  useEffect(() => {
    const intro = introVideoRef.current;
    const loop = loopVideoRef.current;
    if (!intro || !loop || !loopSrc) return;
    // Preload loop video so it's ready instantly
    loop.src = loopSrc;
    loop.load();
    const onEnded = () => {
      if (useLoopRef.current) return;
      introEndTimeRef.current = intro.duration || 39;
      useLoopRef.current = true;
      loop.currentTime = 0;
      loop.play().catch(() => {});
    };
    intro.addEventListener('ended', onEnded);
    return () => intro.removeEventListener('ended', onEnded);
  }, [loopSrc]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let running = true;
    const draw = () => {
      if (!running) return;
      // Skip draw when off-screen
      if (!isVisibleRef.current) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }
      const video = useLoopRef.current ? loopVideoRef.current : introVideoRef.current;
      if (video && video.readyState >= 2 && video.videoWidth > 0) {
        // Render at half resolution during chroma key for performance
        const scale = keyStrength > 0.01 ? 0.5 : 1;
        const tw = Math.round(video.videoWidth * scale);
        const th = Math.round(video.videoHeight * scale);
        if (canvas.width !== tw || canvas.height !== th) {
          canvas.width = tw;
          canvas.height = th;
        }
        ctx.drawImage(video, 0, 0, tw, th);
        if (keyStrength > 0.01) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const d = imageData.data;
          const threshold = 220;
          for (let i = 0; i < d.length; i += 4) {
            const r = d[i], g = d[i + 1], b = d[i + 2];
            if (r > threshold && g > threshold && b > threshold) {
              const whiteness = Math.min(1, (Math.min(r, g, b) - threshold) / (255 - threshold));
              d[i + 3] = Math.round(255 * (1 - whiteness * keyStrength));
            }
          }
          ctx.putImageData(imageData, 0, 0);
        }
        // Report total elapsed video time
        if (onVideoTime) {
          const elapsed = useLoopRef.current
            ? introEndTimeRef.current + (loopVideoRef.current?.currentTime || 0)
            : video.currentTime;
          onVideoTime(elapsed);
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => { running = false; cancelAnimationFrame(rafRef.current); };
  }, [keyStrength, onVideoTime]);

  return (
    <div ref={containerRef} className={className}>
      <video ref={introVideoRef} src={src} muted playsInline preload="auto" style={{ display: 'none' }} />
      <video ref={loopVideoRef} muted playsInline loop preload="auto" style={{ display: 'none' }} />
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  );
};

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

// ── Agent demo panel labels ────────────────────────────────────────────────

// ── Mobile hero video with synced business labels ──────────────────────────
const HERO_BUSINESSES = [
  'Creative Agencies', 'Plumbers', 'Dental Practices', 'Consulting Firms',
  'Salons & Spas', 'Construction Companies', 'Real Estate Agents',
  'Restaurants', 'Cleaning Companies', 'Online Stores', 'Property Managers',
];
const CLIP_DURATION = 3.04;

const MobileHeroVideo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState(HERO_BUSINESSES[0]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let raf: number;
    // Switch label slightly before midpoint so it feels snappy — matches desktop carousel
    const offset = CLIP_DURATION * 0.6;
    const sync = () => {
      const t = video.currentTime;
      const idx = Math.min(
        Math.floor((t + offset) / CLIP_DURATION),
        HERO_BUSINESSES.length - 1,
      );
      setLabel(HERO_BUSINESSES[idx]);
      raf = requestAnimationFrame(sync);
    };
    raf = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Pause video when off-screen
  useEffect(() => {
    const el = containerRef.current;
    const video = videoRef.current;
    if (!el || !video) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={containerRef} className="rounded-2xl overflow-hidden shadow-lg border border-slate-200/60">
        <video
          ref={videoRef}
          src="/videos/hero-businesses.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full"
        />
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="text-center text-sm text-slate-500 mt-2.5 font-medium"
        >
          {label}
        </motion.p>
      </AnimatePresence>
    </>
  );
};

// ── Glow text — word-by-word glow effect, cycles every 15s ────────────────
const GLOW_TOTAL_WORDS = 6;
const GLOW_WORD_MS = 500;
const GLOW_PAUSE_MS = 15000;

let glowTick = -1;
let glowListeners: Array<(t: number) => void> = [];
let glowTimeout: ReturnType<typeof setTimeout> | null = null;

function runGlowCycle() {
  let i = 0;
  const step = () => {
    glowTick = i;
    glowListeners.forEach(fn => fn(i));
    i++;
    if (i < GLOW_TOTAL_WORDS) {
      glowTimeout = setTimeout(step, GLOW_WORD_MS);
    } else {
      glowTimeout = setTimeout(() => {
        glowTick = -1;
        glowListeners.forEach(fn => fn(-1));
        glowTimeout = setTimeout(runGlowCycle, GLOW_PAUSE_MS);
      }, GLOW_WORD_MS);
    }
  };
  step();
}

function startGlow() {
  if (glowTimeout) return;
  glowTimeout = setTimeout(runGlowCycle, 1500);
}

function stopGlow() {
  if (glowTimeout) { clearTimeout(glowTimeout); glowTimeout = null; }
  glowTick = -1;
  glowListeners.forEach(fn => fn(-1));
}

const GlowText: React.FC<{
  text: string;
  active: boolean;
  globalOffset: number;
  totalWords: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ text, active, globalOffset, totalWords, className = '', style }) => {
  const words = text.split(' ');
  const [tick, setTick] = useState(-1);

  useEffect(() => {
    if (!active) { setTick(-1); return; }
    const listener = (t: number) => setTick(t);
    glowListeners.push(listener);
    startGlow();
    return () => {
      glowListeners = glowListeners.filter(l => l !== listener);
      if (glowListeners.length === 0) stopGlow();
    };
  }, [active]);

  return (
    <span className={className} style={style}>
      {words.map((word, idx) => {
        const globalIdx = globalOffset + idx;
        const isGlowing = tick >= 0 && globalIdx === tick;
        return (
          <span
            key={idx}
            className="transition-all duration-500 ease-in-out"
            style={{
              textShadow: active && isGlowing
                ? '0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.3), 0 0 60px rgba(59, 130, 246, 0.15)'
                : '0 0 0px transparent',
            }}
          >
            {word}{idx < words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </span>
  );
};

const agentPanels = [
  { label: 'AI Assistant', desc: 'Chat with full business context' },
  { label: 'Smart Router', desc: 'Voice → structured actions' },
  { label: 'Meeting Notes', desc: 'Live transcription → action items' },
];

// ── Smart Router panel — transcription with highlighting + real action cards ─

const transcript = "Remind me to follow up with Sarah about the kitchen renovation quote, and schedule a site visit next Tuesday at 2pm.";
const segments = [
  { text: "Remind me to follow up with Sarah about the kitchen renovation quote", color: '#22c55e', type: 'Task' },
  { text: ", and ", color: '', type: '' },
  { text: "schedule a site visit next Tuesday at 2pm", color: '#3b82f6', type: 'Event' },
  { text: ".", color: '', type: '' },
];

const SmartRouterPanel: React.FC = () => {
  const [phase, setPhase] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const t: ReturnType<typeof setTimeout>[] = [];
    t.push(setTimeout(() => setPhase(1), 600));   // Show transcript
    t.push(setTimeout(() => setPhase(2), 2200));  // Highlight segment 1
    t.push(setTimeout(() => setPhase(3), 3200));  // Highlight segment 2
    t.push(setTimeout(() => setPhase(4), 4000));  // Show task card
    t.push(setTimeout(() => setPhase(5), 5000));  // Show event card
    t.push(setTimeout(() => { setPhase(0); setCycle(c => c + 1); }, 9000));
    return () => t.forEach(clearTimeout);
  }, [cycle]);

  return (
    <div className="bg-white h-full flex flex-col rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" style={{ opacity: phase >= 1 && phase < 4 ? 1 : 0 }} />
        <span className="text-xs font-medium text-slate-500">
          {phase >= 4 ? 'Smart Router — 2 intents detected' : phase >= 1 ? 'Recording...' : 'Ready'}
        </span>
      </div>

      {/* Transcript */}
      <div className="px-5 py-4 border-b border-slate-50">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Transcript</p>
        <p className="text-sm leading-relaxed text-slate-600">
          {phase >= 1 ? segments.map((seg, i) => (
            seg.color ? (
              <span
                key={i}
                className="transition-all duration-500 rounded px-0.5"
                style={{
                  backgroundColor: (phase >= 2 && seg.type === 'Task') || (phase >= 3 && seg.type === 'Event')
                    ? seg.color + '18' : 'transparent',
                  color: (phase >= 2 && seg.type === 'Task') || (phase >= 3 && seg.type === 'Event')
                    ? seg.color : undefined,
                  fontWeight: (phase >= 2 && seg.type === 'Task') || (phase >= 3 && seg.type === 'Event')
                    ? 600 : 400,
                  borderBottom: (phase >= 2 && seg.type === 'Task') || (phase >= 3 && seg.type === 'Event')
                    ? `2px solid ${seg.color}` : '2px solid transparent',
                }}
              >
                {seg.text}
              </span>
            ) : <span key={i}>{seg.text}</span>
          )) : <span className="text-slate-300 italic">Listening...</span>}
        </p>
      </div>

      {/* Real Action Cards (mini) */}
      <motion.div
        className="flex-1 px-2 py-2 overflow-hidden"
        animate={{ opacity: phase >= 4 ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      >
        <ActionCardsComponent compact />
      </motion.div>
    </div>
  );
};

// ── Meeting Notes panel — transcript + action items on white bg ──────────

const meetingLines = [
  { speaker: 'You', text: "Let's start with the Q1 numbers. Revenue was up 12%.", isAI: false, time: '0:15' },
  { speaker: 'Sarah', text: 'The pipeline looks strong but delivery timelines concern me.', isAI: false, time: '0:42' },
  { speaker: 'You', text: 'Fair point. What if we add a buffer week to each milestone?', isAI: false, time: '1:08' },
  { speaker: 'AI', text: 'Suggested: "What\'s the contingency if Q2 targets slip?"', isAI: true, time: '1:15' },
];

const meetingActions = [
  { text: 'Send updated timeline to Sarah by Friday', done: false },
  { text: 'Schedule follow-up with engineering lead', done: false },
  { text: 'Prepare risk assessment for Q2 board meeting', done: false },
];

const MeetingNotesPanel: React.FC = () => {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showActions, setShowActions] = useState(false);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const t: ReturnType<typeof setTimeout>[] = [];
    t.push(setTimeout(() => setVisibleLines(1), 800));
    t.push(setTimeout(() => setVisibleLines(2), 2200));
    t.push(setTimeout(() => setVisibleLines(3), 3800));
    t.push(setTimeout(() => setVisibleLines(4), 5000));
    t.push(setTimeout(() => setShowActions(true), 6000));
    t.push(setTimeout(() => { setVisibleLines(0); setShowActions(false); setCycle(c => c + 1); }, 10000));
    return () => t.forEach(clearTimeout);
  }, [cycle]);

  return (
    <div className="bg-white h-full flex flex-col rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" style={{ opacity: visibleLines > 0 && !showActions ? 1 : 0 }} />
          <span className="text-xs font-medium text-slate-500">
            {showActions ? 'Meeting ended — 3 action items' : visibleLines > 0 ? 'Recording — Team Strategy Meeting' : 'Ready'}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">{visibleLines > 0 ? meetingLines[Math.min(visibleLines - 1, meetingLines.length - 1)].time : '0:00'}</span>
      </div>

      {/* Live transcript */}
      <div className="flex-1 px-5 py-4 space-y-3 overflow-hidden">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Live Transcript</p>

        {meetingLines.slice(0, visibleLines).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={`flex gap-3 ${line.isAI ? 'pl-4 border-l-2 border-indigo-200' : ''}`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${
              line.isAI ? 'bg-indigo-100 text-indigo-600' : line.speaker === 'You' ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {line.isAI ? 'AI' : line.speaker[0]}
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500">{line.speaker}</span>
              <p className={`text-sm leading-relaxed ${line.isAI ? 'text-indigo-600 italic' : 'text-slate-700'}`}>{line.text}</p>
            </div>
          </motion.div>
        ))}

        {visibleLines > 0 && !showActions && (
          <div className="flex gap-1 pl-9">
            {[0, 1, 2].map(i => (
              <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
            ))}
          </div>
        )}
      </div>

      {/* Action items — always full height, content fades in */}
      <div className="border-t border-slate-100 px-5 py-4">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Action Items Extracted</p>
        <div className="space-y-2">
          {meetingActions.map((action, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: showActions ? 1 : 0 }}
              transition={{ duration: 0.3, delay: i * 0.15 }}
              className="flex items-start gap-2 rounded-xl p-2 bg-emerald-50 border border-emerald-100"
            >
              <div className="w-4 h-4 rounded border-2 border-emerald-400 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-slate-700">{action.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Replacement comparison data ─────────────────────────────────────────────

const replacements = [
  { tool: 'Otter.ai / Fireflies', category: 'Meeting Notes', vois: 'Briefings before every meeting, live transcription during, action items extracted and sent to the right people after', icon: Headphones, group: 'Productivity' },
  { tool: 'Todoist / Trello', category: 'Task Management', vois: 'Your most important tasks always surface first — created from voice, meetings, or email with smart scheduling built in', icon: ListTodo, group: 'Productivity' },
  { tool: 'Motion / Reclaim', category: 'AI Scheduling', vois: 'Your calendar fills itself with focused work blocks, ordered by priority and deadline — just approve and go', icon: Calendar, group: 'Productivity' },
  { tool: 'Asana / Jira / Monday.com', category: 'Project Tracking', vois: 'See which projects are healthy and which need attention — stalled work and missed deadlines flagged before they escalate', icon: BarChart3, group: 'Productivity' },
  { tool: 'Google Docs / Notion', category: 'Documents', vois: 'Talk it out, get a document back — AI pulls context from your projects and data automatically', icon: FileText, group: 'Productivity' },
  { tool: 'Trainual / Process Street', category: 'Playbooks & SOPs', vois: 'Living workflows that guide your team step-by-step and alert you when something is done wrong', icon: BookOpen, group: 'Productivity' },

  { tool: 'HubSpot / Salesforce', category: 'CRM & Sales', vois: 'Client profiles built automatically from every conversation, email, and meeting — with AI-suggested next steps', icon: Users, group: 'Commerce & Customers' },
  { tool: 'Shopify / WooCommerce', category: 'Products & Orders', vois: 'Products, pricing, inventory, and bookable services — all connected to your website and AI assistant', icon: ShoppingCart, group: 'Commerce & Customers' },
  { tool: 'Calendly / Acuity', category: 'Bookings', vois: 'Clients book online, orders are created automatically, payment is collected — one step, no manual work', icon: Calendar, group: 'Commerce & Customers' },
  { tool: 'Mailchimp / ActiveCampaign', category: 'Marketing & Funnels', vois: 'Email and SMS campaigns with AI-written copy, smart audience segments, and automated follow-up sequences', icon: Zap, group: 'Commerce & Customers' },
  { tool: 'Later / Hootsuite', category: 'Social Media', vois: 'Schedule posts, get AI-written captions, and track what performs — connected to your brand and content library', icon: Monitor, group: 'Commerce & Customers' },
  { tool: 'Canva / Adobe Express', category: 'Creative Studio', vois: 'Generate marketing content from your business context — social posts, ads, and visuals that match your brand', icon: Sparkles, group: 'Commerce & Customers' },

  { tool: 'Superhuman / Spark', category: 'AI Email', vois: 'Answer your inbox by voice, get three reply options that sound like you, and never lose track of follow-ups', icon: Mail, group: 'Communication & Content' },
  { tool: 'Gmail / Outlook / Slack', category: 'Unified Messaging', vois: 'Every conversation with a person — email, chat, SMS — in one timeline with AI-drafted replies', icon: Mail, group: 'Communication & Content' },
  { tool: 'Squarespace / Wix', category: 'Website Builder', vois: 'Describe your business and get a website — AI writes the copy, connects your booking and payments automatically', icon: Monitor, group: 'Communication & Content' },
  { tool: 'PowerPoint / Google Slides', category: 'Presentations', vois: 'AI-generated slide decks that pull real numbers from your business — ready to present, not just pretty templates', icon: Monitor, group: 'Communication & Content' },

  { tool: 'Zapier / Make', category: 'Process Automation', vois: 'Workflows that trigger across everything — no third-party tools, no delays, because it all lives in one system', icon: Zap, group: 'Operations & Field' },
  { tool: 'ClickUp / Monday.com', category: 'Operations', vois: 'Get alerted when a process is falling behind before it becomes a problem — with suggested fixes, not just warnings', icon: Zap, group: 'Operations & Field' },
  { tool: 'Zendesk / Freshdesk', category: 'Support Tickets', vois: 'Tickets created automatically from forms or email, with priority levels, timers, and escalation to the right person', icon: AlertTriangle, group: 'Operations & Field' },
  { tool: 'ServiceTitan / Jobber', category: 'Field Operations', vois: 'Jobs, dispatch, routes, team GPS, time tracking — a 30-second voice note from the van replaces all the paperwork', icon: MapPin, group: 'Operations & Field' },
  { tool: 'Routific / Circuit', category: 'Route Planning', vois: 'Drag-and-drop route planning with smart stop ordering and Google Maps links for your team in the field', icon: MapPin, group: 'Operations & Field' },
  { tool: 'Google Forms / SurveyMonkey', category: 'Reports', vois: 'Fill any report by voice in 90 seconds — the AI asks the questions, you answer, and the report is filed', icon: FileBarChart, group: 'Operations & Field' },

  { tool: 'QuickBooks / Xero', category: 'Finance', vois: 'Log expenses by voice, track invoices and payments, see your profit in real time — connected to Stripe', icon: BarChart3, group: 'Finance & Admin' },
  { tool: 'Procurify / Coupa', category: 'Purchasing & Suppliers', vois: 'Purchase orders, supplier tracking, and stock management with partial payment support and bill matching', icon: ShoppingCart, group: 'Finance & Admin' },
  { tool: 'Toggl / Clockify', category: 'Time Tracking', vois: 'Clock in and out from your phone, track billable hours per job, and link time entries to dispatch and payroll', icon: Clock, group: 'Finance & Admin' },
  { tool: 'BambooHR / Gusto', category: 'Team & Org Chart', vois: 'See your whole team structure, manage roles and access, and plan changes — all drag-and-drop', icon: UserCog, group: 'Finance & Admin' },
  { tool: 'Typeform / JotForm', category: 'Forms', vois: 'Build any form, route submissions to CRM or tickets automatically, and send instant confirmation replies', icon: FileText, group: 'Finance & Admin' },
  { tool: 'Confluence / Guru', category: 'Knowledge Search', vois: 'Ask a question and get the answer from across your entire business — voice notes, emails, docs, meetings, everything', icon: Search, group: 'Finance & Admin' },
  { tool: 'Google Drive / Dropbox', category: 'Files & Media', vois: 'One place for all your files with AI tagging, full-text search, and a reader that speaks documents aloud', icon: FolderOpen, group: 'Finance & Admin' },

  { tool: 'Virtual executive assistant', category: 'Your AI Assistant', vois: 'Knows your entire business, anticipates what you need, and acts across every tool — by voice, watch, phone, or inbox', icon: Brain, group: 'AI & Voice' },
  { tool: 'ChatGPT / Copilot', category: 'AI Chat', vois: 'An AI that knows your actual business data — not just the internet — and can take action with your approval', icon: Sparkles, group: 'AI & Voice' },
  { tool: 'Custom dev / Agency', category: 'AI Agents', vois: 'AI workers that plan multi-step tasks, use your tools, and pause for your approval before doing anything important', icon: Bot, group: 'AI & Voice' },
  { tool: 'Perplexity / SearchGPT', category: 'AI Research', vois: 'Deep web research with sources cited — delegated to specialized AI and saved to your knowledge base', icon: Search, group: 'AI & Voice' },
  { tool: 'Business consultants', category: 'Strategy Analysis', vois: 'Analyzes your revenue, clients, products, and competitors — surfaces opportunities you would have missed', icon: Sparkles, group: 'AI & Voice' },
  { tool: 'Siri / Google Assistant', category: 'Voice Intelligence', vois: 'One voice note creates tasks, events, inventory updates, and messages — routed to the right place automatically', icon: Mic, group: 'AI & Voice' },
  { tool: 'Apple Watch apps', category: 'Watch Assistant', vois: 'Full AI assistant on your wrist — talk, get answers, approve actions, all without pulling out your phone', icon: Watch, group: 'AI & Voice' },
  { tool: 'Answering service', category: 'AI Phone & SMS', vois: 'A real phone number answered by your AI — books appointments, answers questions, and handles messages 24/7', icon: Phone, group: 'AI & Voice' },
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

const cardSlideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0, scale: 0.95 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0, scale: 0.95 }),
};

const AgentPhilosophySection: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { icon: Brain, bg: 'bg-indigo-100', fg: 'text-indigo-600', title: 'AI Assistant', desc: 'Chat with full business context. Your agent reasons across projects, emails, calendar, CRM, and conversations simultaneously — pulling from every database you have access to.' },
    { icon: ShieldCheck, bg: 'bg-emerald-100', fg: 'text-emerald-600', title: 'Smart Router', desc: 'Speak naturally — the agent parses your voice into structured actions. Follow-ups become tasks, meetings land on your calendar, and every intent is routed to the right place.' },
    { icon: Users, bg: 'bg-amber-100', fg: 'text-amber-600', title: 'Meeting Notes', desc: 'Live transcription that captures decisions, action items, and follow-ups as they happen. Every meeting produces a structured summary — no manual note-taking required.' },
  ];

  return (
    <Section className="py-24 md:py-32 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
        >
          {/* ── Headline ─────────────────────────────────────────── */}
          <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="text-center mb-10">
            <span className="inline-block text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">
              Agent Philosophy
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-900 mb-4">
              Every employee gets a <span className="italic">super-agent.</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              An autonomous AI partner with access to the same data, context, and permissions as the person it serves.
              It surfaces the most valuable information, drafts replies, proposes schedules, and flags risks — but never acts alone.
            </p>
          </motion.div>

          {/* ── Tabs ─────────────────────────────────────────────── */}
          <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
            {/* Tab buttons */}
            <div className="flex gap-2 mb-6 border-b border-slate-200">
              {tabs.map((tab, i) => {
                const Icon = tab.icon;
                const isActive = i === activeTab;
                return (
                  <button
                    key={tab.title}
                    onClick={() => setActiveTab(i)}
                    className={`flex items-center gap-2.5 px-5 py-3 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
                      isActive
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg ${tab.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={14} className={tab.fg} />
                    </div>
                    {tab.title}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Left: description */}
              <div className="py-4">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="text-base text-slate-500 leading-relaxed"
                  >
                    {tabs[activeTab].desc}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Right: demo panel */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm min-h-[360px] md:min-h-[460px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    {activeTab === 0 && <ContextualChat compact />}
                    {activeTab === 1 && <SmartRouterPanel />}
                    {activeTab === 2 && <MeetingNotesPanel />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="text-center text-slate-400 text-sm mt-10">
            AI power, human control. Every draft reviewed. Every action approved. Every decision yours.
          </motion.p>
        </motion.div>
      </div>
    </Section>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// WORK PAGE
// ═══════════════════════════════════════════════════════════════════════════

const Work: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [annualBilling, setAnnualBilling] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [animPhase, setAnimPhase] = useState<AnimPhase>('dot');
  const [focusLabel, setFocusLabel] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [geoVisible, setGeoVisible] = useState(false);
  const [geoPaused, setGeoPaused] = useState(false);
  const geoSectionRef = useRef<HTMLDivElement>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [heroHeadlineIdx, setHeroHeadlineIdx] = useState(0);
  const [boxTime, setBoxTime] = useState(0);
  const [videoElapsed, setVideoElapsed] = useState(0);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const introVideoRef = useRef<HTMLVideoElement>(null);
  const introStartedRef = useRef(false);
  const unfocusRef = React.useRef<(() => void) | null>(null);

  // Start intro video when box animation reaches crossfade point
  useEffect(() => {
    if (boxTime >= 32 && !introStartedRef.current && introVideoRef.current) {
      introStartedRef.current = true;
      introVideoRef.current.currentTime = 0;
      introVideoRef.current.play().catch(() => {});
    }
  }, [boxTime]);

  // Parallax: gradient scrolls at ~70% of content speed (lags 30% behind)
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, (v) => v * 0.3);

  useEffect(() => {
    Analytics.workPageViewed();
  }, []);

  // Pause hex 3D videos when section scrolls off-screen
  useEffect(() => {
    const el = geoSectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setGeoPaused(!entry.isIntersecting);
    }, { rootMargin: '100px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Play/pause hero video based on showVideo state
  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;
    if (showVideo) {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [showVideo]);

  // Rotating hero headlines — cycle every 12s once final phase is reached
  const heroHeadlines = [
    { label: "World's First", bold: 'Human-to-Agent', light: 'Business Operating\nSystem' },
    { label: 'Business in a Box', bold: 'Business in a Box', light: 'Everything You Need' },
    { label: 'All-in-One Platform', bold: 'All Your Software', light: 'One Platform' },
    { label: 'One Login, Every Tool', bold: 'Every Tool You Need', light: 'Behind One Login' },
    { label: 'Replace Your Stack', bold: 'One System', light: 'Instead of Dozens' },
    { label: 'Software That Thinks', bold: 'AI-Native Software', light: 'Built From Scratch' },
  ];

  useEffect(() => {
    const isFinalPhase = boxTime >= 34 && !showVideo;
    if (!isFinalPhase) return;
    const interval = setInterval(() => {
      setHeroHeadlineIdx(prev => (prev + 1) % heroHeadlines.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [boxTime >= 34, showVideo]);

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
    <div className="min-h-screen relative overflow-x-hidden" style={{ backgroundColor: '#F8F9FA', marginRight: chatOpen ? 412 : 0, transition: 'margin-right 0.4s ease' }}>
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
      <Section className="h-screen min-h-screen pt-28 md:pt-44 pb-12 md:pb-28 px-6 md:px-12 flex items-center relative" style={{ overflow: 'visible' }}>
        {/* Shared anchor for 3D box + intro video — desktop only, hidden on narrow screens */}
        {/* Box Animation — smooth crossfade out */}
        <div
          className="hidden lg:flex absolute inset-0 z-0 items-center justify-center pointer-events-none"
          style={{
            opacity: showVideo ? 0 : Math.max(0, Math.min(1, 1 - (boxTime - 32) / 0.5)),
            transition: showVideo ? 'opacity 700ms ease-in-out' : undefined,
            left: '40%',
          }}
        >
          <BoxAnimation style={{ width: '100%', height: '100%' }} onTimeUpdate={(t) => {
            if (Math.abs(t - boxTime) > 0.1) setBoxTime(t);
          }} />
        </div>
        {/* Intro video — smooth crossfade in */}
        {(() => {
          const videoFadeIn = Math.max(0, Math.min(1, (boxTime - 32) / 0.5));
          const videoAge = Math.max(0, boxTime - 32);
          const bgFade = Math.min(1, Math.max(0, (videoAge - 3) / 3));
          return (
            <div
              className="hidden lg:flex absolute inset-0 z-0 items-center justify-center pointer-events-none"
              style={{
                opacity: showVideo ? 0 : videoFadeIn,
                transition: showVideo ? 'opacity 700ms ease-in-out' : undefined,
                left: '40%',
              }}
            >
              <div className="flex flex-col items-center">
                {(() => {
                  const VIDEO_BUSINESSES = [
                    'Creative Agencies', 'Plumbers', 'Dental Practices',
                    'Consulting Firms', 'Salons & Spas', 'Construction Companies',
                    'Real Estate Agents', 'Restaurants', 'Cleaning Companies',
                    'Online Stores', 'Property Managers',
                  ];
                  // Offset by -0.5s to compensate for state propagation delay
                  const vt = videoElapsed - 0.5;
                  const lipsVisible = vt >= 5.5;
                  const lipsOpacity = Math.min(1, Math.max(0, (vt - 5) / 1));
                  // Each scene is ~3s. Use modulo to wrap around for loop video
                  const sceneTime = Math.max(0, vt - 4.5);
                  const sceneIdx = Math.floor(sceneTime / 3) % VIDEO_BUSINESSES.length;
                  return (
                    <>
                      {/* "Made for..." top lip */}
                      <p
                        className="text-sm font-medium text-slate-400 tracking-wide mb-3 transition-opacity duration-500"
                        style={{ opacity: lipsOpacity }}
                      >
                        Made for all types of companies.
                      </p>
                      <div
                        className="relative"
                        style={{
                          width: 'min(340px, 38vh)',
                          height: 'min(340px, 38vh)',
                        }}
                      >
                        {/* White background + frame that fades in */}
                        <div
                          className="absolute inset-0 rounded-2xl bg-white border border-slate-200/60 shadow-2xl"
                          style={{ opacity: bgFade }}
                        />
                        {/* Canvas-keyed video */}
                        <ChromaKeyVideo
                          videoRef={introVideoRef}
                          src="/videos/Intro-trimmed.mp4"
                          loopSrc="/videos/Intro-loop.mp4"
                          keyStrength={1 - bgFade}
                          className="absolute inset-0 rounded-2xl overflow-hidden"
                          onVideoTime={(t) => {
                            if (Math.abs(t - videoElapsed) > 0.05) setVideoElapsed(t);
                          }}
                        />
                      </div>
                      {/* Company name bottom lip */}
                      <div
                        className="mt-4 transition-opacity duration-500"
                        style={{ opacity: lipsOpacity, minHeight: 40 }}
                      >
                        <AnimatePresence mode="wait">
                          {lipsVisible && (
                            <motion.h3
                              key={VIDEO_BUSINESSES[sceneIdx]}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              transition={{ duration: 0.3 }}
                              className="text-2xl font-semibold text-slate-900 tracking-tight text-center"
                            >
                              {VIDEO_BUSINESSES[sceneIdx]}
                            </motion.h3>
                          )}
                        </AnimatePresence>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          );
        })()}
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
            {/* Left: Text content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="text-center lg:text-left lg:flex-shrink-0 transition-all duration-700 ease-in-out relative w-full lg:max-w-[50%]"
              style={{ width: showVideo ? '20%' : undefined, minHeight: 'clamp(320px, 45vh, 500px)' }}
            >
              {/* Animated story headline — synced to box animation */}
              {(() => {
                // Story phases synced to the V5 box animation timeline
                const stories: { at: number; label: string; headline: string }[] = [
                  { at: 0,  label: "The Problem",        headline: "Your company's data is fragmented\nacross dozens of tools." },
                  { at: 5,  label: "The Cost",           headline: "Employees spend their days\nmoving data — not creating value." },
                  { at: 11, label: "The Breaking Point",  headline: "The faster you grow,\nthe harder it falls apart." },
                  { at: 17, label: "The Solution",        headline: "So we built one platform\nfor everything." },
                  { at: 24, label: "HABOS",               headline: "Your tools. Your data.\nAll working as one." },
                  { at: 34, label: "final",               headline: "" },
                ];
                const active = [...stories].reverse().find(s => boxTime >= s.at) || stories[0];
                const isFinal = active.label === 'final';

                // Consistent font size class for ALL phases
                const headlineSizeClass = 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl';

                return (
                  <>
                    <motion.p variants={fadeUp} transition={{ duration: 0.4 }} className="mb-1" style={{ minHeight: '1.5em' }}>
                      {showVideo ? (
                        <GlowText
                          text="World's First"
                          active={showVideo}
                          globalOffset={0}
                          totalWords={6}
                          className="font-semibold tracking-[0.2em] uppercase inline-block origin-left transition-all duration-700 ease-in-out text-xs sm:text-sm"
                          style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1rem)', color: '#1e293b' }}
                        />
                      ) : (
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={isFinal ? `final-label-${heroHeadlineIdx}` : active.label}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                            className="font-semibold tracking-[0.2em] uppercase inline-block text-xs sm:text-sm"
                            style={{ color: '#2563eb' }}
                          >
                            {isFinal ? heroHeadlines[heroHeadlineIdx].label : active.label}
                          </motion.span>
                        </AnimatePresence>
                      )}
                    </motion.p>
                    {/* Fixed-height headline container prevents layout shift */}
                    <motion.h1 variants={fadeUp} transition={{ duration: 0.5 }} className="mb-3 md:mb-5"
                      style={{ minHeight: 'clamp(120px, 18vh, 240px)' }}
                    >
                      {showVideo ? (
                        <>
                          <GlowText text={heroHeadlines[heroHeadlineIdx].bold} active={showVideo} globalOffset={2} totalWords={6}
                            className={`font-bold tracking-tight leading-[1.08] inline-block origin-left transition-all duration-700 ease-in-out ${headlineSizeClass} whitespace-nowrap`}
                            style={{ fontSize: 'clamp(1rem, 1.8vw, 1.35rem)', color: '#0f172a' }} />
                          <br />
                          <GlowText text={heroHeadlines[heroHeadlineIdx].light.replace('\n', ' ')} active={showVideo} globalOffset={3} totalWords={6}
                            className={`font-normal tracking-tight leading-[1.08] inline-block origin-left transition-all duration-700 ease-in-out ${headlineSizeClass} whitespace-nowrap`}
                            style={{ fontSize: 'clamp(1rem, 1.8vw, 1.35rem)', color: '#334155' }} />
                        </>
                      ) : (
                        <AnimatePresence mode="wait">
                          {isFinal ? (
                            <motion.span
                              key={`final-headline-${heroHeadlineIdx}`}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -12 }}
                              transition={{ duration: 0.5, ease: 'easeInOut' }}
                              className={`block tracking-tight leading-[1.08] ${headlineSizeClass}`}
                            >
                              <span className="font-bold" style={{ color: '#0f172a' }}>{heroHeadlines[heroHeadlineIdx].bold}</span>
                              {heroHeadlines[heroHeadlineIdx].light.split('\n').map((line, i) => (
                                <React.Fragment key={i}>
                                  <br />
                                  <span className="font-normal whitespace-nowrap" style={{ color: 'rgba(30, 58, 138, 0.5)' }}>{line}</span>
                                </React.Fragment>
                              ))}
                            </motion.span>
                          ) : (
                            <motion.span
                              key={active.at}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -12 }}
                              transition={{ duration: 0.5, ease: 'easeInOut' }}
                              className={`block tracking-tight leading-[1.08] ${headlineSizeClass}`}
                              style={{ whiteSpace: 'pre-line' }}
                            >
                              {active.headline.split('\n').map((line, i) => (
                                <span key={i} className={i === 0 ? 'font-bold' : 'font-normal'} style={{ color: i === 0 ? '#0f172a' : 'rgba(30, 58, 138, 0.5)' }}>
                                  {line}{i < active.headline.split('\n').length - 1 && <br />}
                                </span>
                              ))}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      )}
                    </motion.h1>
                  </>
                );
              })()}

              {/* Subtitle + buttons — pinned position, fades in smoothly */}
              <div
                style={{
                  opacity: showVideo || boxTime < 34 ? 0 : 1,
                  transform: showVideo || boxTime < 34 ? 'translateY(12px)' : 'translateY(0)',
                  transition: 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out',
                  pointerEvents: showVideo || boxTime < 34 ? 'none' : 'auto',
                }}
              >
                <p className="text-base md:text-xl text-slate-600 mb-6 md:mb-10 leading-relaxed max-w-2xl mt-3 md:mt-5">
                  All your software, one platform.
                  <br />
                  Supercharge your employees with the AI assistance we were always promised but never got.
                </p>

                <div className="flex flex-row items-center justify-center lg:justify-start gap-3">
                  <motion.button
                    onClick={() => scrollToSection('pricing')}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-2.5 sm:px-8 sm:py-3.5 bg-slate-900 text-white rounded-full text-sm sm:text-base font-semibold shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-2"
                  >
                    Join Waitlist
                    <ArrowRight size={16} />
                  </motion.button>
                  <motion.button
                    onClick={() => setShowVideo(true)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-2.5 sm:px-8 sm:py-3.5 bg-white text-slate-700 rounded-full text-sm sm:text-base font-semibold shadow-lg border border-slate-200 hover:border-slate-300 transition-all flex items-center gap-2"
                  >
                    <Play size={14} className="fill-current" />
                    Play Video
                  </motion.button>
                </div>
              </div>

              {/* Back button — fades in when video is playing */}
              <div
                className="transition-all duration-500 ease-in-out overflow-hidden"
                style={{
                  maxHeight: showVideo ? 60 : 0,
                  opacity: showVideo ? 1 : 0,
                }}
              >
                <button
                  onClick={() => setShowVideo(false)}
                  className="mt-4 px-5 py-2.5 bg-white text-slate-600 rounded-full text-sm font-medium border border-slate-200 hover:border-slate-300 transition-all flex items-center gap-2 mx-auto lg:mx-0"
                >
                  <ArrowLeft size={14} />
                  Back
                </button>
              </div>

              {/* Mobile: hero video on loop with synced label */}
              <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="lg:hidden mt-6 w-full max-w-sm mx-auto">
                <MobileHeroVideo />
              </motion.div>
            </motion.div>

            {/* Right: Video player */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="hidden lg:flex items-center justify-center relative transition-all duration-700 ease-in-out flex-1"
            >
              {/* Video — fades in and grows */}
              <div
                className="w-full transition-all duration-700 ease-in-out"
                style={{
                  opacity: showVideo ? 1 : 0,
                  transform: showVideo ? 'scale(1)' : 'scale(0.9)',
                  pointerEvents: showVideo ? 'auto' : 'none',
                }}
              >
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200/60 bg-black">
                  <video
                    ref={heroVideoRef}
                    src="/videos/Situations.mp4"
                    loop
                    controls
                    playsInline
                    className="w-full"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          APP GRID BOX — Every app in an Excel-like grid with absorb animation
          ═══════════════════════════════════════════════════════════════════ */}
      <AppGridBox />

      {/* ═══════════════════════════════════════════════════════════════════
          INTERACTIVE 3D SECTION — No container, floats on page background
          ═══════════════════════════════════════════════════════════════════ */}
      <div ref={geoSectionRef} id="explore" className="relative h-screen min-h-screen flex flex-col justify-center">
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
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            onViewportEnter={() => setGeoVisible(true)}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative w-full mx-auto"
            style={{ maxWidth: 'min(42rem, 62vh)' }}
          >
            {geoVisible && <WorkHero3D onPhaseChange={setAnimPhase} onFocusChange={setFocusLabel} unfocusRef={unfocusRef} muted={muted} paused={geoPaused} onToggleMute={() => setMuted(m => !m)} />}

            {/* Story text + sound button — positioned above the 3D geometry */}
            <div className="absolute left-0 right-0 -top-[16%] md:-top-[22%] z-20 px-4 md:px-6 flex justify-center items-center gap-3">
              {/* White cloud behind text — only in focused/zoomed state */}
              <div
                className="absolute pointer-events-none transition-opacity duration-700 ease-in-out"
                style={{
                  opacity: focusLabel ? 1 : 0,
                  inset: '-220% -30%',
                  background: 'radial-gradient(ellipse 60% 70% at center, rgba(248,249,250,0.97) 0%, rgba(248,249,250,0.8) 30%, rgba(248,249,250,0.4) 55%, transparent 80%)',
                }}
              />
              <motion.p
                key={focusLabel || animPhase}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative text-lg sm:text-2xl md:text-4xl lg:text-5xl font-serif italic text-slate-950 max-w-2xl leading-snug text-center pointer-events-none"
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
                {/* Table header — hidden on mobile, shown as grid on md+ */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50/80">
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
                      {/* Desktop: 3-column row */}
                      <div
                        className={`hidden md:grid grid-cols-12 gap-4 px-6 py-5 items-start ${i < replacements.length - 1 && replacements[i + 1].group === row.group ? 'border-b border-slate-100' : ''}`}
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
                      {/* Mobile: stacked card */}
                      <div className={`md:hidden px-5 py-4 space-y-2 ${i < replacements.length - 1 && replacements[i + 1].group === row.group ? 'border-b border-slate-100' : ''}`}>
                        <div className="flex items-center gap-2.5">
                          <row.icon size={16} className="text-slate-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-slate-900">{row.category}</span>
                        </div>
                        <p className="text-xs text-slate-400">Replaces <span className="text-slate-500">{row.tool}</span></p>
                        <p className="text-sm text-slate-600">{row.vois}</p>
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
              <div className="grid grid-cols-[1fr_4rem_4rem] md:grid-cols-12 gap-2 md:gap-4 px-4 md:px-6 py-4 border-b border-slate-100 bg-slate-50/80">
                <div className="md:col-span-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Feature</div>
                <div className="md:col-span-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Personal</div>
                <div className="md:col-span-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Work</div>
              </div>
              {pricingFeatures.map((row, i) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-[1fr_4rem_4rem] md:grid-cols-12 gap-2 md:gap-4 px-4 md:px-6 py-3.5 items-center ${i < pricingFeatures.length - 1 ? 'border-b border-slate-50' : ''}`}
                >
                  <div className="md:col-span-6 text-sm text-slate-600">{row.feature}</div>
                  <div className="md:col-span-3 text-center">
                    {row.personal ? (
                      <Check size={16} className="text-emerald-500 mx-auto" />
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </div>
                  <div className="md:col-span-3 text-center">
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
                <img src="/Logo/vois-logo.svg" alt="HABOS" className="h-8 w-8" />
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
                  <button onClick={() => scrollToSection('pricing')} className="text-slate-500 text-sm hover:text-slate-900 transition-colors">Pricing</button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('explore')} className="text-slate-500 text-sm hover:text-slate-900 transition-colors">Platform</button>
                </li>
                <li>
                  <Link to="/" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">VOIS Personal</Link>
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
                  <a href="mailto:hello@tryvois.com" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">Contact Sales</a>
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

      {/* Video modal removed — video now plays inline in hero */}
      <ChatPanel onToggle={setChatOpen} />
    </div>
  );
};

export default Work;
