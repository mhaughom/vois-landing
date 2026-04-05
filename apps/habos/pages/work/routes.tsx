import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Route, CheckCircle, Clock, MapPin, Navigation } from 'lucide-react';
import { Navbar } from '@li/shared/components/Navbar';
import { useTranslation } from 'react-i18next';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

type Stop = {
  name: string;
  time: string;
  task: string;
  status: 'completed' | 'in-progress' | 'pending';
  statusLabel: string;
};

const StopIndicator = ({ status }: { status: Stop['status'] }) => {
  if (status === 'completed') {
    return (
      <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shrink-0">
        <CheckCircle size={10} className="text-white" />
      </div>
    );
  }
  if (status === 'in-progress') {
    return (
      <span className="relative flex h-4 w-4 shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-40 animate-ping" />
        <span className="relative inline-flex h-4 w-4 rounded-full bg-blue-500" />
      </span>
    );
  }
  return <div className="w-4 h-4 rounded-full bg-slate-300 shrink-0" />;
};

const StatusBadge = ({ status, label }: { status: Stop['status']; label: string }) => {
  const styles = {
    completed: 'text-green-700 bg-green-50',
    'in-progress': 'text-blue-700 bg-blue-50',
    pending: 'text-slate-500 bg-slate-50',
  };
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${styles[status]}`}>
      {status === 'completed' && '\u2713 '}{label}
    </span>
  );
};

const Routes: React.FC = () => {
  const { t } = useTranslation('work-routes');

  const stopsData = t('stops', { returnObjects: true }) as Array<{
    name: string;
    time: string;
    task: string;
    statusLabel: string;
  }>;

  const stopStatuses: Stop['status'][] = ['completed', 'completed', 'in-progress', 'pending', 'pending'];

  const stops: Stop[] = stopsData.map((s, i) => ({
    name: s.name,
    time: s.time,
    task: s.task,
    statusLabel: s.statusLabel,
    status: stopStatuses[i] ?? 'pending',
  }));

  const benefits = t('benefits', { returnObjects: true }) as Array<{ title: string; desc: string }>;
  const techItems = t('techStrip.items', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ─── Content ─── */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ━━━ 1. Hero ━━━ */}
          <motion.section {...fadeUp()} className="max-w-3xl mx-auto text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-lime-500/10 text-lime-700 rounded-full text-sm font-medium mb-6">
              <Route size={14} />
              {t('badge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-[1.1]">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
              {t('hero.description')}
            </p>
          </motion.section>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mx-auto mb-16"><p className="text-lg text-slate-600 leading-relaxed">{t('body')}</p></motion.div>

          {/* ━━━ 2. Mock route card ━━━ */}
          <motion.section {...fadeUp(0.15)} className="mb-20">
            <div className="bg-lime-50/50 rounded-3xl p-6 md:p-8">
              {/* Card header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {t('routeCard.heading')}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {t('routeCard.subheading')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation size={14} className="text-lime-600" />
                  <span className="text-sm font-medium text-lime-700">{t('routeCard.navigate')}</span>
                </div>
              </div>

              {/* Stop list with connecting line */}
              <div className="relative">
                {/* Vertical connecting line */}
                <div
                  className="absolute left-[7px] top-4 bottom-4 w-[2px] bg-slate-200"
                  aria-hidden
                />

                <div className="space-y-1">
                  {stops.map((stop, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg p-3 relative flex items-start gap-3"
                    >
                      <div className="mt-1 z-10">
                        <StopIndicator status={stop.status} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <p className="font-medium text-sm text-slate-900">{stop.name}</p>
                          <StatusBadge status={stop.status} label={stop.statusLabel} />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {stop.time} &mdash; {stop.task}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer note */}
              <p className="text-xs text-slate-400 mt-5 leading-relaxed">
                {t('routeCard.footnote')}
              </p>
            </div>
          </motion.section>

          {/* ━━━ 3. Three benefit cards ━━━ */}
          <motion.section {...fadeUp(0.25)} className="mb-20">
            <div className="grid md:grid-cols-3 gap-5">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
                >
                  <h3 className="font-semibold text-slate-900 mb-3">{b.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ━━━ 4. Before / After ━━━ */}
          <motion.section {...fadeUp(0.35)} className="mb-20">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Without HABOS */}
              <div className="bg-slate-100 rounded-2xl p-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
                  {t('comparison.without.label')}
                </p>
                <p className="text-slate-600 leading-relaxed mb-6">
                  {t('comparison.without.description')}
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {t('comparison.without.outcome')}
                </p>
              </div>

              {/* With HABOS */}
              <div className="bg-lime-50 rounded-2xl p-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-lime-600 mb-4">
                  {t('comparison.with.label')}
                </p>
                <p className="text-lime-800 leading-relaxed mb-6">
                  {t('comparison.with.description')}
                </p>
                <p className="text-sm font-semibold text-lime-900">
                  {t('comparison.with.outcome')}
                </p>
              </div>
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
                className="mt-4 px-8 py-3.5 bg-lime-600 text-white rounded-full font-medium text-sm shadow-lg shadow-lime-600/20 hover:bg-lime-700 transition-colors"
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

export default Routes;
