import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ContextualChat } from '@li/shared/components/ContextualChat';
import { ActionCards as ActionCardsComponent } from '@li/shared/components/ActionCards';
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
import { Analytics } from '@li/shared/lib/analytics';
import { WorkHero3D, AnimPhase } from '../components/WorkHero3D';
import { Navbar } from '@li/shared/components/Navbar';
import { AnimatedHabosIcon } from '../components/AnimatedHabosIcon';
import { HeroBusinessCarousel } from '../components/HeroBusinessCarousel';
import { BoxAnimation } from '@li/shared/components/BoxAnimation';
import { AppGridBox } from '@li/shared/components/AppGridBox';
import { WaitlistModal } from '@li/shared/components/WaitlistModal';

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

// ── Hero intro video — plain video playback with intro->loop swap ─────────

const HeroIntroVideo: React.FC<{
  src: string;
  loopSrc?: string;
  active?: boolean;
  className?: string;
  onVideoTime?: (totalElapsed: number) => void;
}> = ({ src, loopSrc, active = true, className, onVideoTime }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalVideoRef = useRef<HTMLVideoElement | null>(null);
  const reportRafRef = useRef<number>(0);
  const useLoopRef = useRef(false);
  const introEndTimeRef = useRef(0);
  const isVisibleRef = useRef(true);

  // Pause videos when off-screen
  useEffect(() => {
    const video = internalVideoRef.current;
    if (!active) {
      video?.pause();
      return;
    }
    const el = containerRef.current;
    if (!el || !video) return;
    const observer = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting;
      if (!active || !entry.isIntersecting) video.pause();
      else video.play().catch(() => {});
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [active]);

  // Preload loop video so the handoff is ready.
  useEffect(() => {
    if (!loopSrc) return;
    const preloadVideo = document.createElement('video');
    preloadVideo.preload = 'auto';
    preloadVideo.src = loopSrc;
    preloadVideo.load();
  }, [loopSrc]);

  useEffect(() => {
    const video = internalVideoRef.current;
    if (!video) return;
    const onEnded = () => {
      if (useLoopRef.current || !loopSrc) return;
      introEndTimeRef.current = video.duration || 39;
      useLoopRef.current = true;
      video.src = loopSrc;
      video.loop = true;
      video.currentTime = 0;
      video.play().catch(() => {});
    };
    video.addEventListener('ended', onEnded);
    return () => video.removeEventListener('ended', onEnded);
  }, [loopSrc]);

  useEffect(() => {
    const video = internalVideoRef.current;
    if (!video) return;
    if (!active) {
      video.pause();
      return;
    }
    useLoopRef.current = false;
    introEndTimeRef.current = 0;
    video.loop = false;
    if (video.src !== new URL(src, window.location.href).href) {
      video.src = src;
      video.load();
    }
    video.currentTime = 0;
    video.play().catch(() => {});
  }, [active, src]);

  useEffect(() => {
    if (!active) return;
    const video = internalVideoRef.current;
    if (!video || !onVideoTime) return;
    let running = true;
    const report = () => {
      if (!running) return;
      if (isVisibleRef.current) {
        const elapsed = useLoopRef.current
          ? introEndTimeRef.current + video.currentTime
          : video.currentTime;
        onVideoTime(elapsed);
      }
      reportRafRef.current = requestAnimationFrame(report);
    };
    reportRafRef.current = requestAnimationFrame(report);
    return () => {
      running = false;
      cancelAnimationFrame(reportRafRef.current);
    };
  }, [active, onVideoTime]);

  useEffect(() => {
    const video = internalVideoRef.current;
    if (!video) return;
    if (!active) {
      video.pause();
      return;
    }
    video.play().catch(() => {});
  }, [active]);

  return (
    <div ref={containerRef} className={className}>
      <video
        ref={internalVideoRef}
        src={src}
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
      />
    </div>
  );
};

const HeroIntroStage: React.FC<{ active: boolean }> = ({ active }) => {
  const { t, i18n } = useTranslation('work-home');
  const [videoElapsed, setVideoElapsed] = useState(0);
  const businesses = useMemo(
    () => t('heroBusinesses', { returnObjects: true }) as string[],
    [i18n.language, t],
  );

  useEffect(() => {
    if (!active) setVideoElapsed(0);
  }, [active]);

  const vt = videoElapsed - 0.5;
  const lipsVisible = vt >= 5.5;
  const lipsOpacity = Math.min(1, Math.max(0, (vt - 5) / 1));
  const sceneTime = Math.max(0, vt - 4.5);
  const sceneIdx = Math.floor(sceneTime / 3) % businesses.length;
  const edgeGradientOpacity = Math.max(0, 1 - videoElapsed / 2.2);

  return (
    <div className="flex flex-col items-center">
      <p
        className="text-sm font-medium text-slate-400 tracking-wide mb-3 transition-opacity duration-500"
        style={{ opacity: lipsOpacity }}
      >
        {t('heroVideo.madeFor')}
      </p>
      <div
        className="relative"
        style={{
          width: 'min(340px, 38vh)',
          height: 'min(340px, 38vh)',
        }}
      >
        <div className="absolute inset-0 rounded-2xl bg-white border border-slate-200/60 shadow-2xl" />
        <HeroIntroVideo
          src="/videos/Intro-trimmed.mp4"
          loopSrc="/videos/Intro-loop.mp4"
          active={active}
          className="absolute inset-0 rounded-2xl overflow-hidden"
          onVideoTime={(t) => {
            setVideoElapsed((prev) => (Math.abs(t - prev) > 0.05 ? t : prev));
          }}
        />
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            opacity: edgeGradientOpacity,
            background: [
              'linear-gradient(to right, rgba(248,249,250,0.36), rgba(248,249,250,0) 18%, rgba(248,249,250,0) 82%, rgba(248,249,250,0.36))',
              'linear-gradient(to bottom, rgba(248,249,250,0.28), rgba(248,249,250,0) 16%, rgba(248,249,250,0) 84%, rgba(248,249,250,0.28))',
              'radial-gradient(circle at center, rgba(248,249,250,0) 58%, rgba(248,249,250,0.18) 100%)',
            ].join(', '),
            transition: 'opacity 180ms linear',
          }}
        />
      </div>
      <div
        className="mt-4 transition-opacity duration-500"
        style={{ opacity: lipsOpacity, minHeight: 40 }}
      >
        <AnimatePresence mode="wait">
          {lipsVisible && (
            <motion.h3
              key={businesses[sceneIdx]}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-semibold text-slate-900 tracking-tight text-center"
            >
              {businesses[sceneIdx]}
            </motion.h3>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ── Animation variants ──────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
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
const CLIP_DURATION = 3.04;

const MobileHeroVideo: React.FC = () => {
  const { t } = useTranslation('work-home');
  const heroBusinesses = t('heroBusinesses', { returnObjects: true }) as string[];
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState(heroBusinesses[0]);

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
        heroBusinesses.length - 1,
      );
      setLabel(heroBusinesses[idx]);
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

// ── Smart Router panel — transcription with highlighting + real action cards ─

const transcript = "Remind me to follow up with Sarah about the kitchen renovation quote, and schedule a site visit next Tuesday at 2pm.";
const segments = [
  { text: "Remind me to follow up with Sarah about the kitchen renovation quote", color: '#22c55e', type: 'Task' },
  { text: ", and ", color: '', type: '' },
  { text: "schedule a site visit next Tuesday at 2pm", color: '#3b82f6', type: 'Event' },
  { text: ".", color: '', type: '' },
];

const SmartRouterPanel: React.FC = () => {
  const { t } = useTranslation('work-home');
  const [phase, setPhase] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase(1), 600));   // Show transcript
    timers.push(setTimeout(() => setPhase(2), 2200));  // Highlight segment 1
    timers.push(setTimeout(() => setPhase(3), 3200));  // Highlight segment 2
    timers.push(setTimeout(() => setPhase(4), 4000));  // Show task card
    timers.push(setTimeout(() => setPhase(5), 5000));  // Show event card
    timers.push(setTimeout(() => { setPhase(0); setCycle(c => c + 1); }, 9000));
    return () => timers.forEach(clearTimeout);
  }, [cycle]);

  return (
    <div className="bg-white h-full flex flex-col rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" style={{ opacity: phase >= 1 && phase < 4 ? 1 : 0 }} />
        <span className="text-xs font-medium text-slate-500">
          {phase >= 4 ? t('smartRouter.statusDetected') : phase >= 1 ? t('smartRouter.statusRecording') : t('smartRouter.statusReady')}
        </span>
      </div>

      {/* Transcript */}
      <div className="px-5 py-4 border-b border-slate-50">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">{t('smartRouter.transcriptLabel')}</p>
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
          )) : <span className="text-slate-300 italic">{t('smartRouter.listening')}</span>}
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

const MeetingNotesPanel: React.FC = () => {
  const { t } = useTranslation('work-home');
  const meetingLines = t('meetingLines', { returnObjects: true }) as Array<{ speaker: string; text: string; time: string }>;
  const meetingActions = t('meetingActions', { returnObjects: true }) as Array<{ text: string }>;

  const [visibleLines, setVisibleLines] = useState(0);
  const [showActions, setShowActions] = useState(false);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setVisibleLines(1), 800));
    timers.push(setTimeout(() => setVisibleLines(2), 2200));
    timers.push(setTimeout(() => setVisibleLines(3), 3800));
    timers.push(setTimeout(() => setVisibleLines(4), 5000));
    timers.push(setTimeout(() => setShowActions(true), 6000));
    timers.push(setTimeout(() => { setVisibleLines(0); setShowActions(false); setCycle(c => c + 1); }, 10000));
    return () => timers.forEach(clearTimeout);
  }, [cycle]);

  const isAI = (speaker: string) => speaker === 'AI';

  return (
    <div className="bg-white h-full flex flex-col rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" style={{ opacity: visibleLines > 0 && !showActions ? 1 : 0 }} />
          <span className="text-xs font-medium text-slate-500">
            {showActions ? t('meetingNotes.statusEnded') : visibleLines > 0 ? t('meetingNotes.statusRecording') : t('meetingNotes.statusReady')}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">{visibleLines > 0 ? meetingLines[Math.min(visibleLines - 1, meetingLines.length - 1)].time : '0:00'}</span>
      </div>

      {/* Live transcript */}
      <div className="flex-1 px-5 py-4 space-y-3 overflow-hidden">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">{t('meetingNotes.transcriptLabel')}</p>

        {meetingLines.slice(0, visibleLines).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={`flex gap-3 ${isAI(line.speaker) ? 'pl-4 border-l-2 border-indigo-200' : ''}`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${
              isAI(line.speaker) ? 'bg-indigo-100 text-indigo-600' : line.speaker === 'You' ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {isAI(line.speaker) ? 'AI' : line.speaker[0]}
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500">{line.speaker}</span>
              <p className={`text-sm leading-relaxed ${isAI(line.speaker) ? 'text-indigo-600 italic' : 'text-slate-700'}`}>{line.text}</p>
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
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">{t('meetingNotes.actionsLabel')}</p>
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

// ── Section wrapper ─────────────────────────────────────────────────────────

const Section: React.FC<{
  children: React.ReactNode;
  className?: string;
  id?: string;
  dark?: boolean;
  style?: React.CSSProperties;
}> = ({ children, className = '', id, dark, style }) => (
  <section
    id={id}
    style={style}
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
  const { t } = useTranslation('work-home');
  const [activeTab, setActiveTab] = useState(0);

  const agentTabsData = t('agentTabs', { returnObjects: true }) as Array<{ title: string; desc: string }>;

  const tabs = [
    { icon: Brain, bg: 'bg-indigo-100', fg: 'text-indigo-600', title: agentTabsData[0].title, desc: agentTabsData[0].desc },
    { icon: ShieldCheck, bg: 'bg-emerald-100', fg: 'text-emerald-600', title: agentTabsData[1].title, desc: agentTabsData[1].desc },
    { icon: Users, bg: 'bg-amber-100', fg: 'text-amber-600', title: agentTabsData[2].title, desc: agentTabsData[2].desc },
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
              {t('agentPhilosophy.badge')}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-900 mb-4">
              {t('agentPhilosophy.heading').split('super-agent').map((part, i, arr) =>
                i < arr.length - 1
                  ? <React.Fragment key={i}>{part}<span className="italic">super-agent.</span></React.Fragment>
                  : <React.Fragment key={i}>{part}</React.Fragment>
              )}
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              {t('agentPhilosophy.description')}
            </p>
          </motion.div>

          {/* ── Tabs ─────────────────────────────────────────────── */}
          <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
            {/* Tab pills — centered */}
            <div className="flex justify-center gap-2 mb-8">
              {tabs.map((tab, i) => {
                const Icon = tab.icon;
                const isActive = i === activeTab;
                return (
                  <button
                    key={tab.title}
                    onClick={() => setActiveTab(i)}
                    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-lg'
                        : 'bg-white text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-md ${isActive ? 'bg-white/20' : tab.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={13} className={isActive ? 'text-white' : tab.fg} />
                    </div>
                    {tab.title}
                  </button>
                );
              })}
            </div>

            {/* Description — centered above demo */}
            <div className="text-center mb-8" style={{ minHeight: 60 }}>
              <AnimatePresence mode="wait">
                <motion.p
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="text-base text-slate-500 leading-relaxed max-w-2xl mx-auto"
                >
                  {tabs[activeTab].desc}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Demo panel — centered */}
            <div className="max-w-2xl mx-auto">
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
            {t('agentPhilosophy.footer')}
          </motion.p>
        </motion.div>
      </div>
    </Section>
  );
};

// ── Icon map for replacements table ────────────────────────────────────────
const REPLACEMENT_ICONS: Record<string, React.ElementType> = {
  'Meeting Notes':         Headphones,
  'Task Management':       ListTodo,
  'AI Scheduling':         Calendar,
  'Project Tracking':      BarChart3,
  'Documents':             FileText,
  'Playbooks & SOPs':      BookOpen,
  'CRM & Sales':           Users,
  'Products & Orders':     ShoppingCart,
  'Bookings':              Calendar,
  'Marketing & Funnels':   Zap,
  'Social Media':          Monitor,
  'Creative Studio':       Sparkles,
  'AI Email':              Mail,
  'Unified Messaging':     Mail,
  'Website Builder':       Monitor,
  'Presentations':         Monitor,
  'Process Automation':    Zap,
  'Operations':            Zap,
  'Support Tickets':       AlertTriangle,
  'Field Operations':      MapPin,
  'Route Planning':        MapPin,
  'Reports':               FileBarChart,
  'Finance':               BarChart3,
  'Purchasing & Suppliers':ShoppingCart,
  'Time Tracking':         Clock,
  'Team & Org Chart':      UserCog,
  'Forms':                 FileText,
  'Knowledge Search':      Search,
  'Files & Media':         FolderOpen,
  'Your AI Assistant':     Brain,
  'AI Chat':               Sparkles,
  'AI Agents':             Bot,
  'AI Research':           Search,
  'Strategy Analysis':     Sparkles,
  'Voice Intelligence':    Mic,
  'Watch Assistant':       Watch,
  'AI Phone & SMS':        Phone,
};

// ═══════════════════════════════════════════════════════════════════════════
// WORK PAGE
// ═══════════════════════════════════════════════════════════════════════════

const Work: React.FC = () => {
  const { t, i18n } = useTranslation('work-home');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [annualBilling, setAnnualBilling] = useState(true);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistSource, setWaitlistSource] = useState('pricing');
  const [animPhase, setAnimPhase] = useState<AnimPhase>('dot');
  const [focusLabel, setFocusLabel] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [geoVisible, setGeoVisible] = useState(false);
  const [geoPaused, setGeoPaused] = useState(false);
  const geoSectionRef = useRef<HTMLDivElement>(null);
  // Inline display style avoids Tailwind CDN race condition where R3F Canvas
  // mounts inside a display:none container and never initializes its render loop.
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 1024px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  const [showVideo, setShowVideo] = useState(false);
  const [introActive, setIntroActive] = useState(false);
  const [showBoxAnimation, setShowBoxAnimation] = useState(true);
  const [heroHeadlineIdx, setHeroHeadlineIdx] = useState(0);
  const [boxTime, setBoxTime] = useState(0);
  const boxTimeRef = useRef(0);
  const introTransitionTimeoutRef = useRef<number | null>(null);
  const boxTimeCallback = useCallback((t: number) => {
    // Only trigger React re-render at story thresholds — avoids re-rendering
    // the entire Work component (1600+ DOM nodes) on every tick
    const thresholds = [0, 5, 11, 17, 24, 32, 34];
    const prev = boxTimeRef.current;
    boxTimeRef.current = t;
    const crossedThreshold = thresholds.some(th => (prev < th && t >= th) || (prev >= th && t < th));
    if (crossedThreshold) {
      setBoxTime(t);
    }
  }, []);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const introStartedRef = useRef(false);
  const unfocusRef = React.useRef<(() => void) | null>(null);

  const heroHeadlines = useMemo(() => t('heroHeadlines', { returnObjects: true }) as Array<{ label: string; bold: string; light: string }>, [i18n.language]);
  const heroStories = useMemo(() => t('heroStories', { returnObjects: true }) as Array<{ label: string; headline: string; at?: number }>, [i18n.language]);
  const replacements = useMemo(() => t('replacements', { returnObjects: true }) as Array<{ tool: string; category: string; vois: string; group: string }>, [i18n.language]);
  const pricingFeaturesData = useMemo(() => t('pricingFeatures', { returnObjects: true }) as Array<{ feature: string }>, [i18n.language]);

  // Restore original `at` timing values for story phases
  const stories = useMemo(() => [
    { at: 0,  label: heroStories[0]?.label, headline: heroStories[0]?.headline },
    { at: 5,  label: heroStories[1]?.label, headline: heroStories[1]?.headline },
    { at: 11, label: heroStories[2]?.label, headline: heroStories[2]?.headline },
    { at: 17, label: heroStories[3]?.label, headline: heroStories[3]?.headline },
    { at: 24, label: heroStories[4]?.label, headline: heroStories[4]?.headline },
    { at: 34, label: heroStories[5]?.label, headline: heroStories[5]?.headline },
  ], [heroStories]);

  // Restore original pricingFeatures shape (personal/work boolean flags)
  const pricingFeatures = useMemo(() => [
    { feature: pricingFeaturesData[0]?.feature,  personal: true,  work: true },
    { feature: pricingFeaturesData[1]?.feature,  personal: true,  work: true },
    { feature: pricingFeaturesData[2]?.feature,  personal: true,  work: true },
    { feature: pricingFeaturesData[3]?.feature,  personal: true,  work: true },
    { feature: pricingFeaturesData[4]?.feature,  personal: true,  work: true },
    { feature: pricingFeaturesData[5]?.feature,  personal: true,  work: true },
    { feature: pricingFeaturesData[6]?.feature,  personal: false, work: true },
    { feature: pricingFeaturesData[7]?.feature,  personal: false, work: true },
    { feature: pricingFeaturesData[8]?.feature,  personal: false, work: true },
    { feature: pricingFeaturesData[9]?.feature,  personal: false, work: true },
    { feature: pricingFeaturesData[10]?.feature, personal: false, work: true },
    { feature: pricingFeaturesData[11]?.feature, personal: false, work: true },
    { feature: pricingFeaturesData[12]?.feature, personal: false, work: true },
    { feature: pricingFeaturesData[13]?.feature, personal: false, work: true },
  ], [pricingFeaturesData]);

  // DEBUG: boxTime tracking
  useEffect(() => {
    console.log('[HERO DEBUG] boxTime changed:', boxTime.toFixed(1), '| showVideo:', showVideo, '| heroHeadlineIdx:', heroHeadlineIdx);
  }, [boxTime, showVideo, heroHeadlineIdx]);

  // Fallback: if boxTime stalls (WebGL dies), force final state after 8s
  // Only fires if animation truly hasn't moved (not just slow)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (boxTimeRef.current < 1) {
        console.log('[HERO DEBUG] boxTime stalled at', boxTimeRef.current.toFixed(1), '— forcing final state');
        setBoxTime(35);
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, []); // runs once on mount

  // Start intro video when box animation reaches crossfade point
  useEffect(() => {
    if (boxTime >= 32 && !introStartedRef.current) {
      console.log('[HERO DEBUG] Starting intro video at boxTime:', boxTime.toFixed(1));
      introStartedRef.current = true;
      setIntroActive(true);
      introTransitionTimeoutRef.current = window.setTimeout(() => {
        setShowBoxAnimation(false);
        setBoxTime((prev) => (prev < 34 ? 35 : prev));
      }, 700);
    }
  }, [boxTime]);

  useEffect(() => {
    return () => {
      if (introTransitionTimeoutRef.current !== null) {
        clearTimeout(introTransitionTimeoutRef.current);
      }
    };
  }, []);

  // Apply background on <html> so it scrolls with the page AND extends behind ChatPanel
  useEffect(() => {
    const html = document.documentElement;
    html.style.backgroundImage = 'url("/work-bg.jpg")';
    html.style.backgroundSize = '100% auto';
    html.style.backgroundRepeat = 'no-repeat';
    html.style.backgroundColor = '#F8F9FA';
    return () => {
      html.style.backgroundImage = '';
      html.style.backgroundSize = '';
      html.style.backgroundRepeat = '';
      html.style.backgroundColor = '';
    };
  }, []);

  useEffect(() => {
    Analytics.workPageViewed();
    console.log('[HERO DEBUG] Work component MOUNTED');
    console.log('[HERO DEBUG] Video count:', document.querySelectorAll('video').length);
    console.log('[HERO DEBUG] Canvas count:', document.querySelectorAll('canvas').length);
    // Check WebGL context
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
    console.log('[HERO DEBUG] WebGL available:', !!gl, gl ? `(${gl.getParameter(gl.RENDERER)})` : '');

    // Page-level FPS monitor — measures actual browser paint rate
    let frames = 0;
    let lastTime = performance.now();
    let rafId: number;
    const measureFPS = () => {
      frames++;
      const now = performance.now();
      if (now - lastTime >= 3000) {
        const fps = frames / ((now - lastTime) / 1000);
        console.log(`[PERF] Page FPS: ${fps.toFixed(1)} | DOM nodes: ${document.querySelectorAll('*').length} | Canvases: ${document.querySelectorAll('canvas').length}`);
        frames = 0;
        lastTime = now;
      }
      rafId = requestAnimationFrame(measureFPS);
    };
    rafId = requestAnimationFrame(measureFPS);

    return () => {
      cancelAnimationFrame(rafId);
      console.log('[HERO DEBUG] Work component UNMOUNTED');
    };
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
    <div className="min-h-screen relative overflow-x-hidden">

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
      <Navbar onOpenWaitlist={() => { setWaitlistSource('navbar'); setShowWaitlistModal(true); }} LogoComponent={AnimatedHabosIcon} />

      {/* All content sits above the gradient + grain layers */}
      <div className="relative z-10">

      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION — Traditional headline + CTA
          ═══════════════════════════════════════════════════════════════════ */}
      <Section className="h-screen min-h-screen pt-28 md:pt-44 pb-12 md:pb-28 px-6 md:px-12 flex flex-col relative" style={{ overflow: 'visible' }}>
        {/* 3D box + intro video — desktop only, absolutely positioned */}
        {/* Box Animation — smooth crossfade out */}
        <div
          className="absolute inset-0 z-0 items-center justify-center pointer-events-none"
          style={{
            display: isDesktop ? 'flex' : 'none',
            opacity: showVideo ? 0 : introActive ? 0 : 1,
            transition: 'opacity 700ms ease-in-out',
            left: '40%',
          }}
        >
          {showBoxAnimation && <BoxAnimation style={{ width: '100%', height: '100%' }} onTimeUpdate={boxTimeCallback} paused={introActive} />}
        </div>
        {/* Intro video — smooth crossfade in */}
        <div
          className="absolute inset-0 z-0 items-center justify-center pointer-events-none"
          style={{
            display: isDesktop ? 'flex' : 'none',
            opacity: showVideo ? 0 : introActive ? 1 : 0,
            transition: 'opacity 700ms ease-in-out',
            left: '40%',
          }}
        >
          <HeroIntroStage active={introActive && !showVideo} />
        </div>
        {/* my-auto centers when room, stays at top when tight — never goes above padding */}
        <div className="max-w-7xl mx-auto w-full relative z-10 my-auto">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
            {/* Left: Text content */}
            <div
              className="text-center lg:text-left lg:flex-shrink-0 transition-[width] duration-700 ease-in-out relative z-10 w-full lg:max-w-[50%]"
              style={{ width: showVideo ? '20%' : undefined, minHeight: 'clamp(320px, 45vh, 500px)' }}
            >
              {/* Animated story headline — synced to box animation */}
              {(() => {
                const active = [...stories].reverse().find(s => boxTime >= s.at) || stories[0];
                const isFinal = active.label === 'final';
                // Debug log removed — rrweb console recorder creates feedback loop

                // Consistent font size class for ALL phases
                const headlineSizeClass = '';

                return (
                  <>
                    <p className="mb-1" style={{ minHeight: '1.5em' }}>
                      {showVideo ? (
                        <GlowText
                          text={t('heroGlowLabel')}
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
                    </p>
                    {/* Fixed-height headline container prevents layout shift */}
                    <h1 className="mb-3 md:mb-5"
                      style={{ minHeight: 'clamp(80px, 18vh, 240px)', fontSize: 'clamp(1.5rem, min(5vw, 7vh), 4.5rem)' }}
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
                                  <span className="font-normal" style={{ color: 'rgba(30, 58, 138, 0.5)' }}>{line}</span>
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
                    </h1>
                  </>
                );
              })()}

              {/* Subtitle + buttons — pinned position, fades in smoothly */}
              {/* Debug log removed */}
              <div
                style={{
                  opacity: showVideo || boxTime < 34 ? 0 : 1,
                  transform: showVideo || boxTime < 34 ? 'translateY(12px)' : 'translateY(0)',
                  transition: 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out',
                  pointerEvents: showVideo || boxTime < 34 ? 'none' : 'auto',
                }}
              >
                <p className="text-base md:text-xl text-slate-600 mb-6 md:mb-10 leading-relaxed max-w-2xl mt-3 md:mt-5">
                  {t('heroSubtitle').split('\n').map((line, i, arr) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < arr.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </p>

                <div className="flex flex-row items-center justify-center lg:justify-start gap-3">
                  <motion.button
                    onClick={() => scrollToSection('pricing')}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-2.5 sm:px-8 sm:py-3.5 bg-slate-900 text-white rounded-full text-sm sm:text-base font-semibold shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-2"
                  >
                    {t('heroButtons.joinWaitlist')}
                    <ArrowRight size={16} />
                  </motion.button>
                  <motion.button
                    onClick={() => setShowVideo(true)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-2.5 sm:px-8 sm:py-3.5 bg-white text-slate-700 rounded-full text-sm sm:text-base font-semibold shadow-lg border border-slate-200 hover:border-slate-300 transition-all flex items-center gap-2"
                  >
                    <Play size={14} className="fill-current" />
                    {t('heroButtons.playVideo')}
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
                  {t('heroButtons.back')}
                </button>
              </div>

              {/* Mobile: hero video on loop with synced label */}
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.24 }} className="lg:hidden mt-6 w-full max-w-sm mx-auto">
                <MobileHeroVideo />
              </motion.div>
            </div>

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
            {t('explore.heading').split('Every tool.').map((part, i, arr) =>
              i < arr.length - 1
                ? <React.Fragment key={i}>{part}<span className="italic">Every tool.</span></React.Fragment>
                : <React.Fragment key={i}>{part}</React.Fragment>
            )}
          </motion.h2>
          <motion.p variants={fadeUp} transition={{ duration: 0.6 }} className="text-slate-500 max-w-lg mx-auto">
            {t('explore.description')}
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
                      {animPhase === 'dot' && t('animPhase.dot')}
                      {animPhase === 'split' && t('animPhase.split')}
                      {animPhase === 'cube' && t('animPhase.cube')}
                      {animPhase === 'hex-morph' && t('animPhase.hexMorph')}
                      {animPhase === 'idle' && t('animPhase.idle')}
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
                {t('replacesSection.heading').split('replaces.').map((part, i, arr) =>
                  i < arr.length - 1
                    ? <React.Fragment key={i}>{part}<span className="italic">replaces.</span></React.Fragment>
                    : <React.Fragment key={i}>{part}</React.Fragment>
                )}
              </h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                {t('replacesSection.description')}
              </p>
            </motion.div>

            <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
              <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Table header — hidden on mobile, shown as grid on md+ */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50/80">
                  <div className="col-span-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('replacesSection.colCategory')}</div>
                  <div className="col-span-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('replacesSection.colReplaces')}</div>
                  <div className="col-span-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('replacesSection.colAdvantage')}</div>
                </div>

                {/* Table rows with group headers */}
                {replacements.map((row, i) => {
                  const showGroupHeader = i === 0 || row.group !== replacements[i - 1].group;
                  const RowIcon = (REPLACEMENT_ICONS[row.category] ?? FileText) as React.FC<{ size?: number; className?: string }>;
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
                          <RowIcon size={16} className="text-slate-400 flex-shrink-0" />
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
                          <RowIcon size={16} className="text-slate-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-slate-900">{row.category}</span>
                        </div>
                        <p className="text-xs text-slate-400">{t('replacesSection.mobileReplaces')} <span className="text-slate-500">{row.tool}</span></p>
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
                {t('pricing.heading').split('pricing.').map((part, i, arr) =>
                  i < arr.length - 1
                    ? <React.Fragment key={i}>{part}<span className="italic">pricing.</span></React.Fragment>
                    : <React.Fragment key={i}>{part}</React.Fragment>
                )}
              </h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                {t('pricing.description')}
              </p>
            </motion.div>

            {/* Billing toggle */}
            <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="flex items-center justify-center gap-3 mb-12">
              <span className={`text-sm font-medium transition-colors ${!annualBilling ? 'text-slate-900' : 'text-slate-400'}`}>{t('pricing.billingMonthly')}</span>
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
              <span className={`text-sm font-medium transition-colors ${annualBilling ? 'text-slate-900' : 'text-slate-400'}`}>{t('pricing.billingAnnual')}</span>
              {annualBilling && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full"
                >
                  {t('pricing.saveLabel')}
                </motion.span>
              )}
            </motion.div>

            {/* Pricing cards */}
            <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="grid md:grid-cols-2 gap-6">
              {/* Personal */}
              <div className="bg-white rounded-2xl md:rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">{t('pricing.personal.name')}</h3>
                <p className="text-sm text-slate-500 mb-5">{t('pricing.personal.description')}</p>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-4xl font-bold text-slate-900 tracking-tight">
                    {annualBilling ? t('pricing.personal.priceAnnual') : t('pricing.personal.priceMonthly')}
                  </span>
                  <span className="text-slate-400 text-sm">{t('pricing.personal.perMonth')}</span>
                </div>
                <button
                  onClick={() => {
                    Analytics.waitlistModalOpened('work_pricing_personal');
                    setWaitlistSource('pricing_personal');
                    setShowWaitlistModal(true);
                  }}
                  className="w-full bg-slate-100 text-slate-900 py-3.5 rounded-full text-base font-semibold hover:bg-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98] mb-6"
                >
                  {t('pricing.personal.cta')}
                </button>
                <p className="text-xs text-slate-400 text-center mb-6">{t('pricing.personal.guarantee')}</p>
              </div>

              {/* Work */}
              <div className="bg-slate-950 rounded-2xl md:rounded-3xl p-8 shadow-2xl flex flex-col relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/20">
                    {t('pricing.work.badge')}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{t('pricing.work.name')}</h3>
                <p className="text-sm text-slate-400 mb-5">{t('pricing.work.description')}</p>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-4xl font-bold text-white tracking-tight">
                    {annualBilling ? t('pricing.work.priceAnnual') : t('pricing.work.priceMonthly')}
                  </span>
                  <span className="text-slate-500 text-sm">{t('pricing.work.perMonth')}</span>
                </div>
                <button
                  onClick={() => {
                    Analytics.waitlistModalOpened('work_pricing_work');
                    setWaitlistSource('pricing_work');
                    setShowWaitlistModal(true);
                  }}
                  className="w-full bg-white text-slate-950 py-3.5 rounded-full text-base font-semibold hover:bg-slate-100 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg mb-6"
                >
                  {t('pricing.work.cta')}
                </button>
                <p className="text-xs text-slate-500 text-center mb-6">{t('pricing.work.guarantee')}</p>
              </div>
            </motion.div>

            {/* Feature comparison table */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="mt-10 bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="grid grid-cols-[1fr_4rem_4rem] md:grid-cols-12 gap-2 md:gap-4 px-4 md:px-6 py-4 border-b border-slate-100 bg-slate-50/80">
                <div className="md:col-span-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('pricing.featureColHeader')}</div>
                <div className="md:col-span-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">{t('pricing.personalColHeader')}</div>
                <div className="md:col-span-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">{t('pricing.workColHeader')}</div>
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
              {t('cta.heading').split('your workday.').map((part, i, arr) =>
                i < arr.length - 1
                  ? <React.Fragment key={i}>{part}<span className="italic">your workday.</span></React.Fragment>
                  : <React.Fragment key={i}>{part}</React.Fragment>
              )}
            </motion.h2>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-lg text-slate-500 mb-10"
            >
              {t('cta.description')}
            </motion.p>

            <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
              <div className="bg-slate-950 rounded-3xl p-8 md:p-12 shadow-2xl">
                {!submitted ? (
                  <>
                    <p className="text-slate-400 text-sm mb-6">
                      {t('cta.waitlistDescription')}
                    </p>
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('cta.emailPlaceholder')}
                        className="flex-1 px-5 py-3.5 rounded-full bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:border-white/40 transition-colors text-sm"
                        required
                      />
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-8 py-3.5 bg-white text-slate-900 rounded-full font-semibold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        {t('cta.submitButton')}
                        <ArrowRight size={16} />
                      </motion.button>
                    </form>
                    <p className="text-slate-600 text-xs mt-5">
                      {t('cta.noSpam')}
                    </p>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-4 px-6 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl"
                  >
                    <p className="text-emerald-400 font-medium">
                      {t('cta.successMessage')}
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
                <img src="/Logo/habos-icon.svg" alt={t('footer.logoAlt')} className="h-8 w-8" />
                <span className="font-semibold text-sm tracking-tight text-slate-900">{t('footer.brandName')}</span>
              </div>
              <p className="text-slate-500 text-sm">{t('footer.tagline')}</p>
            </div>

            {/* Col 2: Product */}
            <div>
              <h4 className="text-slate-900 font-medium text-sm mb-4">{t('footer.product.heading')}</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/login" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">{t('footer.product.login')}</Link>
                </li>
                <li>
                  <button onClick={() => scrollToSection('pricing')} className="text-slate-500 text-sm hover:text-slate-900 transition-colors">{t('footer.product.pricing')}</button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('explore')} className="text-slate-500 text-sm hover:text-slate-900 transition-colors">{t('footer.product.platform')}</button>
                </li>
                <li>
                  <Link to="/" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">{t('footer.product.habosPersonal')}</Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Support */}
            <div>
              <h4 className="text-slate-900 font-medium text-sm mb-4">{t('footer.support.heading')}</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/support" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">{t('footer.support.helpFaq')}</Link>
                </li>
                <li>
                  <a href="mailto:hello@habos.ai" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">{t('footer.support.contactSales')}</a>
                </li>
                <li>
                  <Link to="/setup" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">{t('footer.support.setupGuide')}</Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Legal */}
            <div>
              <h4 className="text-slate-900 font-medium text-sm mb-4">{t('footer.legal.heading')}</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/Privacy" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">{t('footer.legal.privacyPolicy')}</Link>
                </li>
                <li>
                  <Link to="/Terms" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">{t('footer.legal.termsOfService')}</Link>
                </li>
                <li>
                  <Link to="/legal#refund" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">{t('footer.legal.refundPolicy')}</Link>
                </li>
              </ul>
            </div>

            {/* Col 5: Social */}
            <div>
              <h4 className="text-slate-900 font-medium text-sm mb-4">{t('footer.social.heading')}</h4>
              <ul className="space-y-3">
                <li>
                  <a href="https://x.com/habos_ai" target="_blank" rel="noopener noreferrer" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">{t('footer.social.xTwitter')}</a>
                </li>
                <li>
                  <a href="https://www.instagram.com/habos_ai" target="_blank" rel="noopener noreferrer" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">{t('footer.social.instagram')}</a>
                </li>
                <li>
                  <a href="https://www.tiktok.com/@habos_ai" target="_blank" rel="noopener noreferrer" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">{t('footer.social.tiktok')}</a>
                </li>
                <li>
                  <a href="https://www.facebook.com/habos_ai" target="_blank" rel="noopener noreferrer" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">{t('footer.social.facebook')}</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-xs">
              &copy; {new Date().getFullYear()} HABOS AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      </div>{/* end content z-10 wrapper */}

      {/* Video modal removed — video now plays inline in hero */}

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={showWaitlistModal}
        onClose={() => setShowWaitlistModal(false)}
        source={waitlistSource}
      />
    </div>
  );
};

export default Work;
