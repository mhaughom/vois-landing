import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  Smartphone,
  Sparkles,
  PenTool,
  Users,
} from 'lucide-react';

// ── Animation helpers ───────────────────────────────────────────────────────

const EASE_SMOOTH = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (d: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: d, ease: EASE_SMOOTH },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_SMOOTH } },
};

// ── Channel colors ──────────────────────────────────────────────────────────

const CHANNEL = {
  email: { color: 'bg-blue-500', border: 'border-l-blue-500', label: 'Email', icon: Mail },
  slack: { color: 'bg-purple-500', border: 'border-l-purple-500', label: 'Slack', icon: MessageSquare },
  sms: { color: 'bg-emerald-500', border: 'border-l-emerald-500', label: 'SMS', icon: Smartphone },
} as const;

type ChannelKey = keyof typeof CHANNEL;

// ── Timeline message data ───────────────────────────────────────────────────

const timelineMessages: {
  channel: ChannelKey;
  subject?: string;
  time: string;
  preview: string;
}[] = [
  {
    channel: 'email',
    subject: 'Re: Kitchen renovation timeline',
    time: 'Mar 18, 2:30 PM',
    preview: 'Hi Mike, confirming we\'re on track for the March 25 start date. Countertops arrive Thursday.',
  },
  {
    channel: 'slack',
    subject: '#henderson-project',
    time: 'Mar 19, 9:15 AM',
    preview: 'Quick Q — are the tile samples in? Client wants to confirm the herringbone pattern before we order.',
  },
  {
    channel: 'sms',
    time: 'Mar 20, 11:00 AM',
    preview: 'Permits approved! 🎉',
  },
  {
    channel: 'email',
    subject: 'Re: Updated timeline',
    time: 'Mar 21, 3:45 PM',
    preview: 'Attached the revised schedule with the permit delay factored in. New completion: April 12.',
  },
];

// ── Component ───────────────────────────────────────────────────────────────

const Messenger: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Navigation ─────────────────────────────────────────────────── */}
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

      {/* ── Content ────────────────────────────────────────────────────── */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">

          {/* ── 1. Hero ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-2 bg-violet-500/10 text-violet-700 rounded-full text-sm font-medium mb-6">
              Unified Messenger
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6">
              Every Channel. One Conversation.
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Email, Slack, Teams, SMS, and internal chat merged into a single person-centric
              timeline. Stop checking 5 apps to see all messages from one client.
            </p>
          </motion.div>

          {/* ── 2. Mock Conversation Timeline ────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-violet-50/50 rounded-3xl p-6 md:p-8 mb-16"
          >
            {/* Contact header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Sarah Henderson</h3>
                <p className="text-sm text-slate-500">3 channels active</p>
              </div>
              <div className="flex -space-x-1">
                {(['email', 'slack', 'sms'] as ChannelKey[]).map((ch) => (
                  <span
                    key={ch}
                    className={`w-3 h-3 rounded-full ${CHANNEL[ch].color} ring-2 ring-white`}
                  />
                ))}
              </div>
            </div>

            {/* Messages */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-2"
            >
              {timelineMessages.map((msg, i) => {
                const ch = CHANNEL[msg.channel];
                const Icon = ch.icon;
                return (
                  <motion.div
                    key={i}
                    variants={staggerItem}
                    className={`bg-white rounded-lg p-3 border-l-4 ${ch.border}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold text-white ${ch.color}`}
                      >
                        <Icon size={10} />
                        {ch.label}
                      </span>
                      {msg.subject && (
                        <span className="text-sm font-medium text-slate-700 truncate">
                          {msg.subject}
                        </span>
                      )}
                      <span className="ml-auto text-xs text-slate-400 whitespace-nowrap">
                        {msg.time}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{msg.preview}</p>
                  </motion.div>
                );
              })}
            </motion.div>

            <p className="text-center text-sm text-slate-400 mt-6">
              One person, one timeline, every channel. Reply via the same channel or switch — your choice.
            </p>
          </motion.div>

          {/* ── 3. Three Benefit Cards ───────────────────────────────── */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: Sparkles,
                title: 'AI Classification',
                body: 'Messages auto-scored by importance with action item extraction. The urgent surfaces; the noise waits.',
                delay: 0.3,
              },
              {
                icon: PenTool,
                title: 'Adaptive Replies',
                body: 'AI matches your writing style across 3 tone variants. Sound like you on email, Slack, and SMS — without rewriting.',
                delay: 0.4,
              },
              {
                icon: Users,
                title: 'Shared Mailboxes',
                body: 'Team inboxes like support@company.com with assignment, tracking, and SLA timers. Nothing falls through.',
                delay: 0.5,
              },
            ].map((card) => (
              <motion.div
                key={card.title}
                custom={card.delay}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="bg-white border border-slate-200 rounded-2xl p-5"
              >
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                  <card.icon size={20} className="text-violet-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{card.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{card.body}</p>
              </motion.div>
            ))}
          </div>

          {/* ── 4. Before / After ────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="grid md:grid-cols-2 gap-6 mb-16"
          >
            {/* Before */}
            <div className="bg-slate-100 rounded-2xl p-6">
              <span className="inline-block px-3 py-1 bg-slate-200 rounded-full text-xs font-semibold text-slate-500 mb-4 uppercase tracking-wider">
                Before
              </span>
              <p className="text-slate-700 leading-relaxed mb-4">
                Check Gmail. Check Slack. Check Teams. Check SMS. Piece together what Sarah said
                across 4 apps.
              </p>
              <p className="text-2xl font-semibold text-slate-900">~15 min/day</p>
            </div>

            {/* After */}
            <div className="bg-violet-50 border border-violet-200 rounded-2xl p-6">
              <span className="inline-block px-3 py-1 bg-violet-200 rounded-full text-xs font-semibold text-violet-700 mb-4 uppercase tracking-wider">
                After
              </span>
              <p className="text-slate-700 leading-relaxed mb-4">
                Open Sarah's conversation. Everything's there.
              </p>
              <p className="text-2xl font-semibold text-violet-700">~30 seconds</p>
            </div>
          </motion.div>

          {/* ── 5. Tech Strip ────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="bg-violet-50 border border-violet-200 rounded-2xl px-8 py-4 mb-16"
          >
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {[
                'Person-centric threading',
                'Multi-transport composition',
                'AI importance scoring',
                'Action item extraction',
                'Realtime sync',
              ].map((item, i, arr) => (
                <React.Fragment key={item}>
                  <span className="text-sm font-medium text-violet-700">{item}</span>
                  {i < arr.length - 1 && <span className="text-violet-300">&middot;</span>}
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          {/* ── 6. Closing ───────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            className="text-center"
          >
            <p className="text-xl md:text-2xl font-serif text-slate-900 mb-8 max-w-2xl mx-auto">
              Other inboxes show you messages. HABOS shows you conversations.
            </p>
            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-slate-900 text-white rounded-full font-medium text-base shadow-lg hover:bg-slate-800 transition-colors"
              >
                Join Waitlist
              </motion.button>
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Messenger;
