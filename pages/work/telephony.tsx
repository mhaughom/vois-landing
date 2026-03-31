import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Phone,
  PhoneIncoming,
  MessageSquare,
  FileAudio,
  ShieldCheck,
  ChevronDown,
  Calendar,
  Ticket,
  Bell,
  Send,
  Search,
  Lock,
  Cpu,
  Zap,
  Radio,
} from 'lucide-react';

/* ── animation helpers ─────────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.10 } },
};

const stepStagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

/* ── call flow data ───────────────────────────────────────────────────── */

interface CallStep {
  icon: React.ReactNode;
  label: string;
  speaker?: 'system' | 'ai' | 'caller';
}

const callSteps: CallStep[] = [
  {
    icon: <PhoneIncoming size={15} className="text-emerald-600" />,
    label: 'Incoming call: (555) 234-5678',
    speaker: 'system',
  },
  {
    icon: <Cpu size={15} className="text-emerald-600" />,
    label: "AI answers: 'Henderson Plumbing, how can I help you?'",
    speaker: 'ai',
  },
  {
    icon: <Phone size={15} className="text-slate-500" />,
    label: "Caller: 'I have a leaking pipe, can someone come today?'",
    speaker: 'caller',
  },
  {
    icon: <Calendar size={15} className="text-emerald-600" />,
    label: 'AI checks calendar \u2192 finds 2:00 PM slot available',
    speaker: 'ai',
  },
  {
    icon: <Cpu size={15} className="text-emerald-600" />,
    label: "AI: 'I can schedule a technician at 2:00 PM today. Would that work?'",
    speaker: 'ai',
  },
];

/* ── page component ────────────────────────────────────────────────────── */

const Telephony: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Nav ───────────────────────────────────────────────────────── */}
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
              <img src="/Logo/habos-icon.svg" alt="HABOS" className="h-8 w-8" />
              <span className="font-semibold text-sm tracking-tight text-slate-900">HABOS</span>
            </motion.div>
          </a>
        </div>

        <div className="w-32" />
      </motion.nav>

      {/* ── Main ──────────────────────────────────────────────────────── */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ── 1. Hero ───────────────────────────────────────────────── */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="mb-20 max-w-3xl"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <span className="inline-block px-4 py-1.5 bg-emerald-500/10 text-emerald-700 rounded-full text-sm font-medium mb-6">
                AI Telephony
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6, ease: easeOutExpo }}
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-[1.1]"
            >
              An AI Receptionist.<br />
              A Real Phone Number.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6, ease: easeOutExpo }}
              className="text-lg md:text-xl text-slate-500 max-w-2xl leading-relaxed"
            >
              HABOS provisions a dedicated phone number for your business. AI answers
              calls, books meetings, creates tasks, and triages to the right person — 24/7.
            </motion.p>
          </motion.section>

          {/* ── 2. Mock Call Flow ─────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: easeOutExpo }}
            className="mb-20"
          >
            <div className="bg-emerald-50/50 rounded-3xl p-6 md:p-8">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={stepStagger}
                className="space-y-1"
              >
                {callSteps.map((step, i) => (
                  <React.Fragment key={i}>
                    <motion.div
                      variants={fadeUp}
                      transition={{ duration: 0.45, ease: easeOutExpo }}
                      className="bg-white rounded-lg p-3 border border-slate-100 flex items-start gap-3"
                    >
                      <div className="flex-shrink-0 mt-0.5">{step.icon}</div>
                      <p className="text-sm text-slate-700 leading-snug">{step.label}</p>
                    </motion.div>
                    {i < callSteps.length - 1 && (
                      <div className="flex justify-center py-0.5">
                        <ChevronDown size={14} className="text-emerald-400" />
                      </div>
                    )}
                  </React.Fragment>
                ))}

                {/* Arrow into result */}
                <div className="flex justify-center py-0.5">
                  <ChevronDown size={14} className="text-emerald-400" />
                </div>

                {/* Result card */}
                <motion.div
                  variants={fadeUp}
                  transition={{ duration: 0.5, ease: easeOutExpo }}
                  className="bg-emerald-600 text-white rounded-lg p-4 border border-emerald-700"
                >
                  <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} /> Booking created
                    </span>
                    <span className="text-emerald-300">&middot;</span>
                    <span className="flex items-center gap-1.5">
                      <Ticket size={14} /> Ticket opened
                    </span>
                    <span className="text-emerald-300">&middot;</span>
                    <span className="flex items-center gap-1.5">
                      <Bell size={14} /> Mike notified
                    </span>
                    <span className="text-emerald-300">&middot;</span>
                    <span className="flex items-center gap-1.5">
                      <Send size={14} /> SMS confirmation sent
                    </span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Explanation */}
              <p className="text-sm text-slate-500 mt-6 leading-relaxed text-center max-w-xl mx-auto">
                The AI has full tool access — calendar, CRM, tickets, bookings. It's not an IVR menu. It's an actual assistant.
              </p>
            </div>
          </motion.section>

          {/* ── 3. Three Benefit Cards ────────────────────────────────── */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20"
          >
            {[
              {
                icon: <MessageSquare size={22} className="text-emerald-600" />,
                title: 'SMS assistant',
                body: 'Inbound texts trigger conversational AI that can check schedules, create tasks, and respond — all without a human lifting a finger.',
                accent: 'bg-emerald-50 border-emerald-100',
              },
              {
                icon: <FileAudio size={22} className="text-blue-600" />,
                title: 'Call recording + transcription',
                body: 'Every call stored with a full transcript, searchable by speaker and keyword. Never lose a detail from a customer conversation.',
                accent: 'bg-blue-50 border-blue-100',
              },
              {
                icon: <ShieldCheck size={22} className="text-amber-600" />,
                title: '4-digit approval',
                body: 'High-risk actions like bookings and payments use SMS-based confirmation codes. AI can act, but humans stay in control.',
                accent: 'bg-amber-50 border-amber-100',
              },
            ].map((card) => (
              <motion.div
                key={card.title}
                variants={fadeUp}
                transition={{ duration: 0.5, ease: easeOutExpo }}
                className={`rounded-2xl border p-6 ${card.accent}`}
              >
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm mb-4">
                  {card.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{card.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{card.body}</p>
              </motion.div>
            ))}
          </motion.section>

          {/* ── 4. Scenario Callout ───────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: easeOutExpo }}
            className="mb-20"
          >
            <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12">
              <p className="text-lg md:text-xl leading-relaxed text-slate-200">
                It's Sunday. A pipe bursts. The homeowner calls your business number.
                AI answers, understands "emergency leak," checks your on-call schedule,
                and books the nearest available tech. The homeowner gets an SMS confirmation
                with the tech's name and ETA. You didn't touch your phone.
              </p>
            </div>
          </motion.section>

          {/* ── 5. Tech Strip ─────────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
            className="mb-20"
          >
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 px-6 py-5 bg-slate-50 rounded-2xl">
              {[
                { icon: <Radio size={14} />, label: 'Telnyx + Twilio' },
                { icon: <Zap size={14} />, label: 'OpenAI Realtime V2' },
                { icon: <Cpu size={14} />, label: 'Full tool access' },
                { icon: <Lock size={14} />, label: 'SMS-based approval' },
                { icon: <Search size={14} />, label: 'Custom IVR routing' },
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
            transition={{ duration: 0.6, ease: easeOutExpo }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-serif font-medium text-slate-900 mb-4">
              Other phone systems play hold music.<br />
              HABOS solves problems.
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

export default Telephony;
