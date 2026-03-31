import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  MessageSquare,
  FileText,
  Play,
  ShieldCheck,
  CheckCircle,
  Search,
  Package,
  TrendingDown,
  PenLine,
  Pause,
  Send,
} from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] as const },
});

const pipelineSteps = [
  { icon: MessageSquare, label: 'Describe' },
  { icon: FileText, label: 'Plan' },
  { icon: Play, label: 'Execute' },
  { icon: ShieldCheck, label: 'Approve' },
  { icon: CheckCircle, label: 'Done' },
];

const timelineSteps = [
  { icon: Search, text: 'Queries Finance module for Q1 revenue by product', highlight: false },
  { icon: Package, text: 'Cross-references Product catalog for context', highlight: false },
  { icon: TrendingDown, text: 'Identifies bottom 3: Widget Pro (-23%), Basic Plan (-18%), Starter Kit (-12%)', highlight: false },
  { icon: PenLine, text: 'Drafts summary email with charts', highlight: false },
  { icon: Pause, text: 'Pauses \u2014 shows you the email draft for approval', highlight: true },
  { icon: Send, text: 'You approve \u2192 Email sent to leadership', highlight: false },
];

const stats = [
  {
    big: 'Hours \u2192 Minutes',
    desc: 'Tasks that took a morning now take a single sentence.',
  },
  {
    big: '8 Master Tools',
    desc: 'Search, schedule, email, finance, bookings, research, tasks, reports \u2014 all at the agent\u2019s disposal.',
  },
  {
    big: '3-Level Delegation',
    desc: 'Agents can spawn child agents with budget caps. Complex work, fully tracked.',
  },
];

const trustSignals = [
  'Cryptographic approval tokens',
  'Per-run budget tracking',
  'Full execution trace',
  'Survives server restarts',
];

const Agents: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'circOut' }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-6 md:px-12 bg-white/80 backdrop-blur-xl border-b border-slate-100"
        style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}
      >
        <a href="/work">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 px-4 py-2 rounded-full border border-slate-100 shadow-sm"
          >
            <ArrowLeft size={16} className="text-slate-600" />
            <span className="font-medium text-sm text-slate-600">Back to Work</span>
          </motion.div>
        </a>

        <div className="absolute left-1/2 -translate-x-1/2">
          <a href="/">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 px-4 py-2 rounded-full border border-slate-100 shadow-sm"
            >
              <img src="/Logo/vois-logo.svg" alt="Vois" className="h-8 w-8" />
              <span className="font-semibold text-sm tracking-tight text-slate-900">VOIS</span>
            </motion.div>
          </a>
        </div>

        <div className="w-32" />
      </motion.nav>

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ── 1. Hero ─────────────────────────────────────────────── */}
          <motion.section {...fadeUp(0)} className="mb-20 max-w-3xl">
            <div className="inline-block px-4 py-2 bg-rose-500/10 text-rose-700 rounded-full text-sm font-medium mb-6">
              Core Feature
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-tight">
              Describe It. The Agent Does the Rest.
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-2xl">
              Give a complex instruction in plain language. An autonomous agent plans it,
              executes across your business, and asks permission before anything risky.
            </p>
          </motion.section>

          {/* ── 2. Pipeline flow ─────────────────────────────────────── */}
          <motion.section {...fadeUp(0.15)} className="mb-20">
            {/* Desktop: horizontal */}
            <div className="hidden md:flex items-center justify-center gap-3">
              {pipelineSteps.map((step, i) => (
                <React.Fragment key={step.label}>
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-28 h-28 bg-rose-50 rounded-2xl border border-rose-100 flex flex-col items-center justify-center gap-2 shadow-sm">
                      <step.icon size={28} className="text-rose-600" />
                      <span className="text-sm font-semibold text-slate-700">{step.label}</span>
                    </div>
                  </div>
                  {i < pipelineSteps.length - 1 && (
                    <ArrowRight size={20} className="text-slate-300 flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Mobile: vertical */}
            <div className="flex md:hidden flex-col items-center gap-2">
              {pipelineSteps.map((step, i) => (
                <React.Fragment key={step.label}>
                  <div className="w-full max-w-xs bg-rose-50 rounded-2xl border border-rose-100 flex items-center gap-4 px-5 py-4 shadow-sm">
                    <step.icon size={24} className="text-rose-600 flex-shrink-0" />
                    <span className="text-sm font-semibold text-slate-700">{step.label}</span>
                  </div>
                  {i < pipelineSteps.length - 1 && (
                    <ArrowDown size={18} className="text-slate-300" />
                  )}
                </React.Fragment>
              ))}
            </div>

            <p className="text-center text-sm text-slate-400 mt-6 max-w-lg mx-auto">
              The agent pauses at &ldquo;Approve&rdquo; for anything high-risk. You always have final say.
            </p>
          </motion.section>

          {/* ── 3. Real example scenario ─────────────────────────────── */}
          <motion.section {...fadeUp(0.25)} className="mb-20">
            <div className="bg-slate-50 rounded-3xl p-6 md:p-10">
              <h2 className="text-2xl font-serif font-medium text-slate-900 mb-8">
                See it in action
              </h2>

              {/* User instruction bubble */}
              <div className="mb-8">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                  Your instruction
                </p>
                <div className="bg-rose-600 text-white rounded-2xl rounded-tl-sm px-6 py-5 text-base md:text-lg leading-relaxed max-w-2xl shadow-md">
                  &ldquo;Analyze our Q1 revenue, find the 3 worst-performing products, and email the leadership team a summary.&rdquo;
                </div>
              </div>

              {/* Agent timeline */}
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                What the agent does
              </p>
              <div className="rounded-2xl overflow-hidden border border-slate-200">
                {timelineSteps.map((step, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-4 px-5 py-4 ${
                      step.highlight
                        ? 'bg-rose-50 border-l-4 border-rose-400'
                        : i % 2 === 0
                        ? 'bg-white'
                        : 'bg-slate-50/60'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          step.highlight
                            ? 'bg-rose-100'
                            : 'bg-slate-100'
                        }`}
                      >
                        <step.icon
                          size={16}
                          className={step.highlight ? 'text-rose-600' : 'text-slate-500'}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 min-h-[2rem]">
                      <span className="text-xs font-bold text-slate-300 tabular-nums w-4">
                        {i + 1}
                      </span>
                      <p
                        className={`text-sm leading-relaxed ${
                          step.highlight
                            ? 'font-semibold text-rose-700'
                            : 'text-slate-600'
                        }`}
                      >
                        {step.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* ── 4. Stats ─────────────────────────────────────────────── */}
          <motion.section {...fadeUp(0.35)} className="mb-20">
            <h2 className="text-2xl font-serif font-medium text-slate-900 mb-8 text-center">
              What this means for you
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {stats.map((s) => (
                <div
                  key={s.big}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
                >
                  <p className="text-2xl font-bold text-rose-600 mb-2">{s.big}</p>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ── 5. Trust strip ───────────────────────────────────────── */}
          <motion.section {...fadeUp(0.45)} className="mb-20">
            <div className="bg-slate-900 text-white rounded-2xl px-8 py-5">
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
                {trustSignals.map((sig, i) => (
                  <React.Fragment key={sig}>
                    <span className="text-slate-300">{sig}</span>
                    {i < trustSignals.length - 1 && (
                      <span className="hidden sm:inline text-slate-600">&middot;</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </motion.section>

          {/* ── 6. Closing ───────────────────────────────────────────── */}
          <motion.section {...fadeUp(0.55)} className="text-center">
            <p className="text-lg text-slate-400 italic mb-8">
              Other platforms automate simple triggers. VOIS agents think, plan, and execute.
            </p>
            <a href="/work#pricing">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-slate-900 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                Join Waitlist
              </motion.button>
            </a>
          </motion.section>
        </div>
      </main>
    </div>
  );
};

export default Agents;
