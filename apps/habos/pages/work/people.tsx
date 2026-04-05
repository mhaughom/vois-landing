import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@li/shared/components/Navbar';
import {
  ArrowLeft,
  Mail,
  Phone,
  MessageSquare,
  Users,
  Mic,
  TrendingUp,
  Link2,
  RefreshCcw,
  Clock,
  CheckCircle2,
  Calendar,
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

// ── Source channel styling ──────────────────────────────────────────────────

const SOURCE = {
  email: { color: 'bg-blue-500', label: 'Email', icon: Mail },
  phone: { color: 'bg-emerald-500', label: 'Voice Call', icon: Phone },
  chat: { color: 'bg-purple-500', label: 'Slack', icon: MessageSquare },
  meeting: { color: 'bg-amber-500', label: 'Meeting', icon: Calendar },
  voice: { color: 'bg-rose-500', label: 'Voice Note', icon: Mic },
} as const;

type SourceKey = keyof typeof SOURCE;

const timelineSources: SourceKey[] = ['email', 'phone', 'chat', 'meeting', 'voice'];

const benefitCardIcons = [Mic, Link2, RefreshCcw] as const;
const benefitCardDelays = [0.3, 0.4, 0.5];

// ── Component ───────────────────────────────────────────────────────────────

const People: React.FC = () => {
  const { t } = useTranslation('work-people');

  const timelineItems = (t('timeline', { returnObjects: true }) as Array<{
    title: string;
    detail: string;
  }>).map((item, i) => ({ ...item, source: timelineSources[i] }));

  const benefitCards = (t('benefitCards', { returnObjects: true }) as Array<{
    title: string;
    body: string;
  }>).map((card, i) => ({ ...card, icon: benefitCardIcons[i], delay: benefitCardDelays[i] }));

  const techItems = t('techItems', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen">
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
            <div className="inline-block px-4 py-2 bg-sky-500/10 text-sky-700 rounded-full text-sm font-medium mb-6">
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
              {t('intro')}
            </p>
          </motion.div>

          {/* ── 2. Mock Person Profile ───────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-sky-50/50 rounded-3xl p-6 md:p-8 mb-16"
          >
            {/* Profile header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                SH
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-semibold text-slate-900">{t('profile.name')}</h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    <TrendingUp size={11} />
                    {t('profile.sentiment')}
                  </span>
                </div>
                <p className="text-sm text-slate-500">{t('profile.role')}</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6 text-sm text-slate-600">
              <span className="flex items-center gap-1.5">
                <Users size={14} className="text-sky-500" />
                <span className="font-medium">{t('profile.interactions')}</span>
              </span>
              <span className="text-slate-300">&middot;</span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-sky-500" />
                {t('profile.lastContact')}
              </span>
              <span className="text-slate-300">&middot;</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-sky-500" />
                {t('profile.actionItems')}
              </span>
            </div>

            {/* Timeline */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-2"
            >
              {timelineItems.map((item, i) => {
                const src = SOURCE[item.source];
                const Icon = src.icon;
                return (
                  <motion.div
                    key={i}
                    variants={staggerItem}
                    className="bg-white rounded-lg p-3 flex items-center gap-3"
                  >
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${src.color} text-white flex-shrink-0`}
                    >
                      <Icon size={14} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-slate-700">{item.title}</span>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{item.detail}</span>
                  </motion.div>
                );
              })}
            </motion.div>

            <p className="text-center text-sm text-slate-400 mt-6">
              {t('profile.annotation')}
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
                <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
                  <card.icon size={20} className="text-sky-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{card.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{card.body}</p>
              </motion.div>
            ))}
          </div>

          {/* ── 4. Scenario Callout ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 mb-16"
          >
            <p className="text-base md:text-lg leading-relaxed text-slate-200">
              {t('scenario')}
            </p>
          </motion.div>

          {/* ── 5. Tech Strip ────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="bg-sky-50 border border-sky-200 rounded-2xl px-8 py-4 mb-16"
          >
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {techItems.map((item, i, arr) => (
                <React.Fragment key={item}>
                  <span className="text-sm font-medium text-sky-700">{item}</span>
                  {i < arr.length - 1 && <span className="text-sky-300">&middot;</span>}
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
              {t('cta.tagline')}
            </p>
            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-slate-900 text-white rounded-full font-medium text-base shadow-lg hover:bg-slate-800 transition-colors"
              >
                {t('cta.button')}
              </motion.button>
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default People;
