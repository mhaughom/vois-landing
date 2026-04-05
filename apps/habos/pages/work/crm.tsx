import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@li/shared/components/Navbar';
import {
  ArrowLeft,
  UserCheck,
  Eye,
  RefreshCw,
  BrainCircuit,
  CheckCircle2,
  GripVertical,
  ArrowRight,
} from 'lucide-react';

/* ── animation helpers ─────────────────────────────────────────────────── */

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

/* ── benefit icons map ─────────────────────────────────────────────────── */

const benefitIcons = [Eye, RefreshCw, BrainCircuit];

/* ── component ─────────────────────────────────────────────────────────── */

const CRM: React.FC = () => {
  const { t } = useTranslation('work-crm');

  const columns = t('columns', { returnObjects: true }) as Array<{
    stage: string;
    deals: Array<{ company: string; value: string; highlight?: boolean; won?: boolean }>;
  }>;

  const benefits = t('benefits', { returnObjects: true }) as Array<{
    title: string;
    desc: string;
  }>;

  const techItems = t('techItems', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ─── Content ─── */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ━━━ 1. Hero ━━━ */}
          <motion.section {...fadeUp()} className="max-w-3xl mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-700 rounded-full text-sm font-medium mb-6">
              <UserCheck size={14} />
              {t('badge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-[1.1]">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-2xl">
              {t('hero.description')}
            </p>
          </motion.section>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mb-16">
            <p className="text-lg text-slate-600 leading-relaxed">
              {t('body')}
            </p>
          </motion.div>

          {/* ━━━ 2. Mock pipeline (Kanban) ━━━ */}
          <motion.section {...fadeUp(0.15)} className="mb-20">
            <div className="bg-indigo-50/50 rounded-3xl p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-5">
                {t('pipeline.label')}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {columns.map((col) => (
                  <div key={col.stage}>
                    {/* Column header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-slate-700">{col.stage}</span>
                      <span className="text-[11px] font-medium bg-white text-slate-500 px-2 py-0.5 rounded-full">
                        {col.deals.length}
                      </span>
                    </div>

                    {/* Deal cards */}
                    <div className="space-y-2">
                      {col.deals.map((deal) => (
                        <motion.div
                          key={deal.company}
                          whileHover={{ scale: 1.02 }}
                          className={`bg-white rounded-lg p-3 shadow-sm text-sm cursor-grab active:cursor-grabbing ${
                            deal.highlight
                              ? 'border-2 border-indigo-400'
                              : 'border border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-medium text-slate-800 truncate">{deal.company}</p>
                              <p className="text-slate-500 mt-0.5">{deal.value}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {deal.won && (
                                <CheckCircle2 size={14} className="text-green-500" />
                              )}
                              <GripVertical size={14} className="text-slate-300" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-sm text-slate-500 mt-6 leading-relaxed">
                {t('pipeline.caption')}
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
                      <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Icon size={18} className="text-indigo-600" />
                      </div>
                      <h3 className="font-semibold text-slate-900">{b.title}</h3>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
                  </div>
                );
              })}
            </div>
          </motion.section>

          {/* ━━━ 4. Scenario callout ━━━ */}
          <motion.section {...fadeUp(0.35)} className="mb-20">
            <div className="bg-slate-900 rounded-3xl p-8 text-white">
              <p className="text-lg md:text-xl leading-relaxed text-slate-200">
                {t('scenario')}
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
                className="mt-4 px-8 py-3.5 bg-indigo-600 text-white rounded-full font-medium text-sm shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-colors"
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

export default CRM;
