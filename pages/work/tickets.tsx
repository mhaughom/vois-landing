import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar';
import {
  ArrowLeft,
  ArrowRight,
  Timer,
  AlertTriangle,
  CheckCircle2,
  Mail,
  Phone,
  Globe,
  Mic,
  Code2,
  Layers,
  ClipboardList,
  BarChart3,
  Star,
  Zap,
  MessageSquare,
  Sparkles,
  Send,
  UserPlus,
} from 'lucide-react';

/* ── animation helpers ─────────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.10 } },
};

const pulseEase = [0.4, 0, 0.6, 1] as const;

/* ── ticket data ───────────────────────────────────────────────────────── */

interface TicketData {
  priority: 'urgent' | 'high' | 'normal';
  title: string;
  assignee: string;
  sla: string;
  resolved?: boolean;
}

const tickets: TicketData[] = [
  {
    priority: 'urgent',
    title: 'Emergency: Johnson pipe burst',
    assignee: 'Mike T.',
    sla: '23 min remaining',
  },
  {
    priority: 'high',
    title: 'HVAC not cooling — Baker office',
    assignee: 'Sarah L.',
    sla: '2h 15min remaining',
  },
  {
    priority: 'normal',
    title: 'Quote request: bathroom renovation',
    assignee: 'Unassigned',
    sla: '7h remaining',
  },
  {
    priority: 'normal',
    title: 'Schedule annual inspection',
    assignee: 'Auto-assigned',
    sla: 'Resolved in 1h 20min',
    resolved: true,
  },
];

const priorityMeta: Record<
  string,
  { bg: string; text: string; dot: string; label: string }
> = {
  urgent: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    dot: 'bg-red-500',
    label: 'Urgent',
  },
  high: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    label: 'High',
  },
  normal: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    dot: 'bg-green-500',
    label: 'Normal',
  },
};

/* ── SLA timer component ───────────────────────────────────────────────── */

const SlaTimer: React.FC<{ ticket: TicketData }> = ({ ticket }) => {
  const isUrgent = ticket.priority === 'urgent';
  const isResolved = ticket.resolved;

  if (isResolved) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
        <CheckCircle2 size={14} />
        <span>&#10003; {ticket.sla}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm font-medium ${
        isUrgent ? 'text-red-600' : ticket.priority === 'high' ? 'text-amber-600' : 'text-slate-500'
      }`}
    >
      {isUrgent ? (
        <motion.span
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: pulseEase }}
          className="inline-flex items-center gap-1.5"
        >
          <Timer size={14} />
          <span>{ticket.sla}</span>
        </motion.span>
      ) : (
        <>
          <Timer size={14} />
          <span>{ticket.sla}</span>
        </>
      )}
    </span>
  );
};

/* ── benefit cards data ────────────────────────────────────────────────── */

const benefits = [
  {
    icon: Layers,
    title: 'Multi-source creation',
    desc: 'From forms, emails, voice calls, API, or manual. Auto-dedup related requests.',
  },
  {
    icon: ClipboardList,
    title: 'Ticket \u2192 action pipeline',
    desc: 'Link to projects, field jobs, and tasks. One ticket can spawn entire workflows.',
  },
  {
    icon: Star,
    title: 'CSAT collection',
    desc: 'Auto-survey post-resolution for satisfaction scoring and trend tracking.',
  },
];

/* ── source icons for multi-source visual ──────────────────────────────── */

const sourceIcons = [
  { icon: Mail, label: 'Email' },
  { icon: Phone, label: 'Voice' },
  { icon: Globe, label: 'Web form' },
  { icon: Mic, label: 'Voice note' },
  { icon: Code2, label: 'API' },
];

/* ── page component ────────────────────────────────────────────────────── */

const Tickets: React.FC = () => {
  /* live countdown for the urgent ticket */
  const [urgentSeconds, setUrgentSeconds] = useState(23 * 60);

  useEffect(() => {
    const interval = setInterval(() => {
      setUrgentSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')} remaining`;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Main ──────────────────────────────────────────────────────── */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ── 1. Hero ───────────────────────────────────────────────── */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="mb-20 text-center max-w-3xl mx-auto"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <span className="inline-block px-4 py-1.5 bg-red-500/10 text-red-700 rounded-full text-sm font-medium mb-6">
                Support &amp; Tickets
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-[1.1]"
            >
              SLA Timers. Auto-Escalation.<br />
              Zero Breaches.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
            >
              Every ticket gets an SLA countdown. Breach warning fires 30 minutes
              before deadline. If it breaches, auto-reassign to the next available agent.
            </motion.p>
          </motion.section>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mx-auto mb-16 text-center">
            <p className="text-lg text-slate-600 leading-relaxed">
              Every ticket gets an SLA countdown with configurable first-response and resolution targets by priority. Visual timers warn 30 minutes before breach. If a ticket breaches its SLA, auto-escalation kicks in — reassigning to the next available agent. Tickets can be created from forms, emails, voice calls, API, or manual entry with automatic deduplication. Customer emails appear as conversation threads with internal notes visible only to agents, and AI suggests responses based on context.
            </p>
          </motion.div>

          {/* ── 2. Mock ticket queue ──────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mb-20"
          >
            <div className="bg-red-50/50 rounded-3xl p-6 md:p-8">
              {/* Header bar */}
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Active Queue
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {tickets.length} tickets &middot; 1 breach warning
                </span>
              </div>

              {/* Ticket cards */}
              <div className="space-y-2">
                {tickets.map((ticket, i) => {
                  const meta = priorityMeta[ticket.priority];
                  const isUrgent = ticket.priority === 'urgent';
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                      className={`bg-white rounded-xl p-4 border ${
                        isUrgent ? 'border-red-200 shadow-sm shadow-red-100/50' : 'border-slate-100'
                      } flex flex-col sm:flex-row sm:items-center gap-3`}
                    >
                      {/* Priority badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.bg} ${meta.text} shrink-0 w-fit`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>

                      {/* Title */}
                      <span className="flex-1 text-sm font-medium text-slate-800 min-w-0 truncate">
                        {ticket.title}
                      </span>

                      {/* Assignee */}
                      <span className="text-sm text-slate-400 shrink-0 flex items-center gap-1.5">
                        <UserPlus size={13} className="text-slate-300" />
                        {ticket.assignee}
                      </span>

                      {/* SLA timer */}
                      <div className="shrink-0">
                        {isUrgent ? (
                          <motion.span
                            animate={{ opacity: [1, 0.4, 1] }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: pulseEase,
                            }}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600"
                          >
                            <Timer size={14} />
                            {formatCountdown(urgentSeconds)}
                          </motion.span>
                        ) : (
                          <SlaTimer ticket={ticket} />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Automation summary */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.6 }}
                className="mt-6 bg-white/70 rounded-xl p-4 border border-red-100/60"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-slate-600">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={15} className="text-amber-500 mt-0.5 shrink-0" />
                    <span>
                      <strong className="text-slate-700">30 minutes before breach</strong> &rarr; warning notification
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Zap size={15} className="text-red-500 mt-0.5 shrink-0" />
                    <span>
                      <strong className="text-slate-700">On breach</strong> &rarr; auto-reassign to next available
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Send size={15} className="text-green-500 mt-0.5 shrink-0" />
                    <span>
                      <strong className="text-slate-700">Post-resolution</strong> &rarr; CSAT survey sent automatically
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* ── 3. Benefit cards ──────────────────────────────────────── */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="mb-20"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {benefits.map((b, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  transition={{ duration: 0.5 }}
                  className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-lg hover:border-slate-200 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
                    <b.icon size={18} className="text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{b.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>

                  {/* visual accent for multi-source card */}
                  {i === 0 && (
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                      {sourceIcons.map((src) => (
                        <div
                          key={src.label}
                          className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center"
                          title={src.label}
                        >
                          <src.icon size={13} className="text-slate-400" />
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ── 4. Before / After ─────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-20"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Before */}
              <div className="bg-slate-50 rounded-2xl p-6 md:p-8 border border-slate-100">
                <span className="inline-block px-3 py-1 bg-slate-200/60 text-slate-600 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
                  Before
                </span>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Customer emails. You see it 3 hours later. Assign it. Track it in a
                  spreadsheet. Hope no one drops it. SLA? What SLA?
                </p>
                <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-slate-100">
                  <BarChart3 size={16} className="text-red-400" />
                  <span className="text-sm font-medium text-red-600">
                    Average response: 3+ hours
                  </span>
                </div>
              </div>

              {/* After */}
              <div className="bg-green-50/60 rounded-2xl p-6 md:p-8 border border-green-100/60">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
                  After
                </span>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Customer emails. Ticket created automatically. SLA timer starts. Warning
                  at 30 min. Auto-escalation on breach. CSAT survey post-resolution.
                </p>
                <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-green-100">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <span className="text-sm font-medium text-green-700">
                    Average response: under SLA, always
                  </span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* ── 5. Tech strip ─────────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-20"
          >
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 px-6 py-5 bg-slate-50 rounded-2xl">
              {[
                { icon: <Timer size={14} />, label: 'SLA enforcement' },
                { icon: <Zap size={14} />, label: 'Auto-escalation' },
                { icon: <MessageSquare size={14} />, label: 'Email threading' },
                { icon: <Sparkles size={14} />, label: 'AI reply suggestions' },
                { icon: <Star size={14} />, label: 'CSAT surveys' },
              ].map((item) => (
                <span key={item.label} className="flex items-center gap-1.5 text-sm text-slate-600">
                  <span className="text-slate-400">{item.icon}</span>
                  {item.label}
                </span>
              ))}
            </div>
          </motion.section>

          {/* ── 6. Closing ────────────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-serif font-medium text-slate-900 mb-4">
              Other ticketing tools track issues.<br />
              HABOS resolves them.
            </h2>

            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="mt-6 inline-flex items-center gap-2 px-8 py-3 bg-slate-900 text-white text-sm font-medium rounded-full shadow-md hover:bg-slate-800 transition-colors"
              >
                Join Waitlist
                <ArrowRight size={16} />
              </motion.button>
            </a>
          </motion.section>
        </div>
      </main>
    </div>
  );
};

export default Tickets;
