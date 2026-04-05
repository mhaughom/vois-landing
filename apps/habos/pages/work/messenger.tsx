import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Navbar } from '@li/shared/components/Navbar';
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

// ── Component ───────────────────────────────────────────────────────────────

const Messenger: React.FC = () => {
  const { t } = useTranslation('work-messenger');

  interface TimelineMessage {
    channel: ChannelKey;
    subject?: string;
    time: string;
    preview: string;
  }

  const timelineMessages = t('timeline.messages', { returnObjects: true }) as TimelineMessage[];

  const benefitCards = [
    {
      icon: Sparkles,
      title: t('benefits.classification.title'),
      body: t('benefits.classification.body'),
      delay: 0.3,
    },
    {
      icon: PenTool,
      title: t('benefits.replies.title'),
      body: t('benefits.replies.body'),
      delay: 0.4,
    },
    {
      icon: Users,
      title: t('benefits.mailboxes.title'),
      body: t('benefits.mailboxes.body'),
      delay: 0.5,
    },
  ];

  const techStrip = t('techStrip', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

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
              {t('badge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
              {t('hero.description')}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mx-auto mb-16 text-center">
            <p className="text-lg text-slate-600 leading-relaxed">
              {t('body')}
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
                <h3 className="text-lg font-semibold text-slate-900">{t('timeline.contactName')}</h3>
                <p className="text-sm text-slate-500">{t('timeline.channelsActive')}</p>
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
              {t('timeline.caption')}
            </p>
          </motion.div>

          {/* ── 3. Three Benefit Cards ───────────────────────────────── */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {benefitCards.map((card) => (
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
                {t('beforeAfter.beforeLabel')}
              </span>
              <p className="text-slate-700 leading-relaxed mb-4">
                {t('beforeAfter.beforeText')}
              </p>
              <p className="text-2xl font-semibold text-slate-900">{t('beforeAfter.beforeStat')}</p>
            </div>

            {/* After */}
            <div className="bg-violet-50 border border-violet-200 rounded-2xl p-6">
              <span className="inline-block px-3 py-1 bg-violet-200 rounded-full text-xs font-semibold text-violet-700 mb-4 uppercase tracking-wider">
                {t('beforeAfter.afterLabel')}
              </span>
              <p className="text-slate-700 leading-relaxed mb-4">
                {t('beforeAfter.afterText')}
              </p>
              <p className="text-2xl font-semibold text-violet-700">{t('beforeAfter.afterStat')}</p>
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
              {techStrip.map((item, i, arr) => (
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
              {t('closing.tagline')}
            </p>
            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-slate-900 text-white rounded-full font-medium text-base shadow-lg hover:bg-slate-800 transition-colors"
              >
                {t('closing.cta')}
              </motion.button>
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Messenger;
