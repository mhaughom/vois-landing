import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@li/shared/components/Navbar';
import {
  ArrowLeft,
  ArrowRight,
  Image,
  Layers,
  Sparkles,
  LayoutGrid,
  ShieldCheck,
} from 'lucide-react';

/* ── animation helpers ─────────────────────────────────────────────────── */

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

/* ── pipeline stage colors ─────────────────────────────────────────────── */

const pipelineStageColors = [
  'bg-fuchsia-100 text-fuchsia-700',
  'bg-fuchsia-100 text-fuchsia-700',
  'bg-fuchsia-100 text-fuchsia-700',
  'bg-fuchsia-200 text-fuchsia-800',
];

/* ── mock creative card visual styles ──────────────────────────────────── */

const creativeCardStyles = [
  { color: 'bg-blue-200', best: false },
  { color: 'bg-gradient-to-br from-pink-200 to-amber-100', best: true },
  { color: 'bg-emerald-200', best: false },
  { color: 'bg-amber-200', best: false },
];

/* ── benefit icons ─────────────────────────────────────────────────────── */

const benefitIcons = [Image, LayoutGrid, Layers];

/* ── component ─────────────────────────────────────────────────────────── */

const CreativeStudio: React.FC = () => {
  const { t } = useTranslation('work-creative-studio');

  const pipelineStages = t('pipelineStages', { returnObjects: true }) as Array<{
    label: string;
    count: string;
  }>;

  const creativeCards = t('creativeCards', { returnObjects: true }) as Array<{
    channel: string;
    score: string;
  }>;

  const benefits = t('benefits', { returnObjects: true }) as Array<{
    title: string;
    desc: string;
  }>;

  const scoringDimensions = t('scoring.dimensions', { returnObjects: true }) as string[];
  const techItems = t('techItems', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ─── Content ─── */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ━━━ 1. Hero ━━━ */}
          <motion.section {...fadeUp()} className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-fuchsia-500/10 text-fuchsia-700 rounded-full text-sm font-medium mb-6">
              <Sparkles size={14} />
              {t('badge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-[1.1]">
              {t('hero.titlePart1')}{' '}
              <span className="relative inline-block">
                <span className="relative z-10">{t('hero.titlePart2')}</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.6, ease: 'circOut' }}
                  className="absolute bottom-2 left-0 right-0 h-3 bg-fuchsia-300/40 origin-left -z-0 rounded-sm"
                />
              </span>
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
              {t('hero.description')}
            </p>
          </motion.section>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mx-auto mb-16 text-center">
            <p className="text-lg text-slate-600 leading-relaxed">
              {t('body')}
            </p>
          </motion.div>

          {/* ━━━ 2. Mock creative pipeline ━━━ */}
          <motion.section {...fadeUp(0.15)} className="mb-20">
            <div className="bg-fuchsia-50/50 rounded-3xl p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-fuchsia-600 mb-5">
                {t('pipelineLabel')}
              </p>

              {/* Pipeline stages */}
              <div className="flex items-center justify-between gap-2 md:gap-3 mb-8">
                {pipelineStages.map((stage, i) => (
                  <React.Fragment key={stage.label}>
                    <div className="flex-1">
                      <div className="bg-white rounded-xl p-3 md:p-4 border border-slate-200 shadow-sm text-center">
                        <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-2 ${pipelineStageColors[i]}`}>
                          {stage.count}
                        </span>
                        <p className="text-sm font-semibold text-slate-800">{stage.label}</p>
                      </div>
                    </div>
                    {i < pipelineStages.length - 1 && (
                      <ArrowRight size={16} className="text-fuchsia-400 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Mock creative cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                {creativeCards.map((card, i) => {
                  const style = creativeCardStyles[i];
                  return (
                    <div
                      key={card.channel}
                      className={`bg-white rounded-xl p-3 border shadow-sm ${
                        style.best ? 'border-fuchsia-400 border-2' : 'border-slate-200'
                      }`}
                    >
                      {/* Placeholder image */}
                      <div className={`${style.color} rounded-lg aspect-[4/3] mb-3`} />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">{card.channel}</span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            style.best
                              ? 'bg-fuchsia-100 text-fuchsia-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {card.score}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-sm text-slate-500 leading-relaxed">
                {t('scoringCaption')}
              </p>
            </div>
          </motion.section>

          {/* ━━━ 3. Three benefit cards ━━━ */}
          <motion.section {...fadeUp(0.25)} className="mb-20">
            <div className="grid md:grid-cols-3 gap-4">
              {benefits.map((b, i) => {
                const Icon = benefitIcons[i];
                return (
                  <div
                    key={b.title}
                    className="bg-white border border-slate-200 rounded-2xl p-5"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-9 h-9 bg-fuchsia-100 rounded-lg flex items-center justify-center">
                        <Icon size={18} className="text-fuchsia-600" />
                      </div>
                      <h3 className="font-semibold text-slate-900">{b.title}</h3>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
                  </div>
                );
              })}
            </div>
          </motion.section>

          {/* ━━━ 4. Scoring breakdown ━━━ */}
          <motion.section {...fadeUp(0.3)} className="mb-20">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={18} className="text-fuchsia-600" />
                <h3 className="font-semibold text-slate-900">{t('scoring.heading')}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {scoringDimensions.map((dim) => (
                  <span
                    key={dim}
                    className="bg-fuchsia-50 text-fuchsia-700 rounded-full px-3 py-1 text-xs font-medium"
                  >
                    {dim}
                  </span>
                ))}
              </div>
            </div>
          </motion.section>

          {/* ━━━ 5. Scenario callout ━━━ */}
          <motion.section {...fadeUp(0.35)} className="mb-20">
            <div className="bg-slate-900 rounded-3xl p-8 text-white">
              <p className="text-lg md:text-xl leading-relaxed text-slate-200">
                {t('scenario')}
              </p>
            </div>
          </motion.section>

          {/* ━━━ 6. Tech strip ━━━ */}
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

          {/* ━━━ 7. Closing CTA ━━━ */}
          <motion.section {...fadeUp(0.55)} className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-slate-900 mb-5 leading-tight">
              {t('cta.heading')}
            </h2>
            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 px-8 py-3.5 bg-fuchsia-600 text-white rounded-full font-medium text-sm shadow-lg shadow-fuchsia-600/20 hover:bg-fuchsia-700 transition-colors"
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

export default CreativeStudio;
