import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, MapPin, Pause, Bell, Shield, Timer } from 'lucide-react';
import { Navbar } from '@li/shared/components/Navbar';
import { useTranslation } from 'react-i18next';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

const dayBadgeColors = [
  'bg-green-100 text-green-700',
  'bg-amber-100 text-amber-700',
  'bg-amber-100 text-amber-700',
  'bg-green-100 text-green-700',
  'bg-blue-100 text-blue-700',
];

const TimeTracking: React.FC = () => {
  const { t } = useTranslation('work-time-tracking');

  const days = t('timecard.days', { returnObjects: true }) as Array<{
    day: string;
    range: string;
    hours: string;
    badge: string;
  }>;

  const techItems = t('techStrip.items', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ─── Content ─── */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ━━━ 1. Hero ━━━ */}
          <motion.section {...fadeUp()} className="max-w-3xl mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 text-orange-700 rounded-full text-sm font-medium mb-6">
              <Clock size={14} />
              {t('badge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-[1.1]">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-2xl">
              {t('hero.description')}
            </p>
          </motion.section>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mb-16"><p className="text-lg text-slate-600 leading-relaxed">{t('body')}</p></motion.div>

          {/* ━━━ 2. Mock timecard ━━━ */}
          <motion.section {...fadeUp(0.15)} className="mb-20">
            <div className="bg-orange-50/50 rounded-3xl p-6 md:p-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
                <p className="font-semibold text-slate-900">{t('timecard.heading')}</p>
                <p className="text-sm text-slate-500">
                  {t('timecard.summary')}
                </p>
              </div>

              {/* Day rows */}
              <div className="space-y-1 mb-4">
                {days.map((d, i) => (
                  <div
                    key={d.day}
                    className="bg-white rounded-lg p-3 border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 w-8 shrink-0">
                        {d.day}
                      </span>
                      <span className="text-sm text-slate-700">{d.range}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-medium text-slate-900">{d.hours}</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${dayBadgeColors[i] ?? 'bg-slate-100 text-slate-700'}`}>
                        {d.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary row */}
              <div className="bg-orange-100 rounded-lg p-3">
                <p className="text-sm text-orange-900 font-medium leading-relaxed">
                  {t('timecard.totalLine')}
                </p>
              </div>

              <p className="text-xs text-slate-400 text-center mt-4">
                {t('timecard.footnote')}
              </p>
            </div>
          </motion.section>

          {/* ━━━ 3. Three benefit cards ━━━ */}
          <motion.section {...fadeUp(0.25)} className="mb-20">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Privacy-first GPS */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Shield size={18} className="text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">{t('benefits.gps.title')}</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {t('benefits.gps.description')}
                </p>
              </div>

              {/* Pause/resume */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Pause size={18} className="text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">{t('benefits.pause.title')}</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {t('benefits.pause.description')}
                </p>
              </div>

              {/* Manager alerts */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Bell size={18} className="text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">{t('benefits.alerts.title')}</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {t('benefits.alerts.description')}
                </p>
              </div>
            </div>
          </motion.section>

          {/* ━━━ 4. Scenario callout ━━━ */}
          <motion.section {...fadeUp(0.35)} className="mb-20">
            <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-10">
              <p className="text-lg md:text-xl leading-relaxed text-slate-200">
                {t('scenario')}{' '}
                <span className="text-white font-semibold">
                  {t('scenarioHighlight')}
                </span>
              </p>
            </div>
          </motion.section>

          {/* ━━━ 5. Tech strip ━━━ */}
          <motion.section {...fadeUp(0.45)} className="mb-20">
            <div className="bg-slate-950 rounded-2xl py-5 px-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
              {techItems.map((item, i) => (
                <React.Fragment key={item}>
                  {i > 0 && <span className="text-slate-600">&middot;</span>}
                  <span>{item}</span>
                </React.Fragment>
              ))}
            </div>
          </motion.section>

          {/* ━━━ 6. Closing CTA ━━━ */}
          <motion.section {...fadeUp(0.55)} className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-slate-900 mb-5 leading-tight">
              {t('cta.heading')}
            </h2>
            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 px-8 py-3.5 bg-orange-600 text-white rounded-full font-medium text-sm shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-colors"
              >
                {t('cta.button')}
              </motion.button>
            </a>
          </motion.section>

        </div>
      </main>
    </div>
  );
};

export default TimeTracking;
