import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@li/shared/components/Navbar';
import {
  ArrowLeft,
  Landmark,
  Mic,
  FileText,
  BarChart3,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

const metricStyles: { color: string; bg: string; border: string }[] = [
  { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
  { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
  { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
];

const moneyInStyles: { statusColor: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
  { statusColor: 'text-green-600', icon: CheckCircle2 },
  { statusColor: 'text-amber-600', icon: Clock },
  { statusColor: 'text-red-600', icon: AlertTriangle },
];

const moneyOutStyles: { statusColor: string }[] = [
  { statusColor: 'text-green-600' },
  { statusColor: 'text-blue-600' },
  { statusColor: 'text-amber-600' },
];

const benefitIcons = [Mic, FileText, BarChart3];

const Finance: React.FC = () => {
  const { t } = useTranslation('work-finance');

  const metrics = t('metrics', { returnObjects: true }) as Array<{ label: string; value: string }>;
  const moneyInRows = t('moneyIn.rows', { returnObjects: true }) as Array<{ client: string; amount: string; status: string }>;
  const moneyOutRows = t('moneyOut.rows', { returnObjects: true }) as Array<{ item: string; amount: string; status: string }>;
  const benefits = t('benefits', { returnObjects: true }) as Array<{ title: string; desc: string }>;
  const techItems = t('techItems', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* --- Content --- */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* 1. Hero */}
          <motion.section {...fadeUp()} className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-700 rounded-full text-sm font-medium mb-6">
              <Landmark size={14} />
              {t('badge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-[1.1]">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
              {t('hero.description')}
            </p>
          </motion.section>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mx-auto mb-16">
            <p className="text-lg text-slate-600 leading-relaxed text-center">
              {t('body')}
            </p>
          </motion.div>

          {/* 2. Mock finance dashboard */}
          <motion.section {...fadeUp(0.15)} className="mb-20">
            <div className="bg-green-50/50 rounded-3xl p-6 md:p-8">

              {/* Top row: 4 metric cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {metrics.map((m, i) => {
                  const style = metricStyles[i];
                  return (
                    <div
                      key={m.label}
                      className={`${style.bg} ${style.border} border rounded-xl p-4 text-center`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        {m.label}
                      </p>
                      <p className={`text-2xl md:text-3xl font-bold ${style.color}`}>{m.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* Two columns: Money In / Money Out */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                {/* Money In */}
                <div>
                  <p className="font-semibold text-slate-900 mb-3">{t('moneyIn.heading')}</p>
                  <div className="space-y-1.5">
                    {moneyInRows.map((row, i) => {
                      const style = moneyInStyles[i];
                      const Icon = style.icon;
                      return (
                        <div
                          key={row.client}
                          className="bg-white rounded-lg p-3 border border-slate-200 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon size={15} className={style.statusColor} />
                            <span className="text-sm text-slate-700 truncate">{row.client}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-sm font-medium text-slate-900">{row.amount}</span>
                            <span className={`text-xs font-semibold ${style.statusColor}`}>{row.status}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Money Out */}
                <div>
                  <p className="font-semibold text-slate-900 mb-3">{t('moneyOut.heading')}</p>
                  <div className="space-y-1.5">
                    {moneyOutRows.map((row, i) => {
                      const style = moneyOutStyles[i];
                      return (
                        <div
                          key={row.item}
                          className="bg-white rounded-lg p-3 border border-slate-200 flex items-center justify-between gap-3"
                        >
                          <span className="text-sm text-slate-700 truncate">{row.item}</span>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-sm font-medium text-slate-900">{row.amount}</span>
                            <span className={`text-xs font-semibold ${style.statusColor}`}>{row.status}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 text-center mt-4">
                {t('dashboardCaption')}
              </p>
            </div>
          </motion.section>

          {/* 3. Three benefit cards */}
          <motion.section {...fadeUp(0.25)} className="mb-20">
            <div className="grid md:grid-cols-3 gap-6">
              {benefits.map((b, i) => {
                const Icon = benefitIcons[i];
                return (
                  <div key={b.title} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                        <Icon size={18} className="text-green-600" />
                      </div>
                      <h3 className="font-semibold text-slate-900">{b.title}</h3>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {b.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.section>

          {/* 4. Scenario callout */}
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

          {/* 5. Tech strip */}
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

          {/* 6. Closing CTA */}
          <motion.section {...fadeUp(0.55)} className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-slate-900 mb-5 leading-tight">
              {t('cta.heading')}
            </h2>
            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 px-8 py-3.5 bg-green-600 text-white rounded-full font-medium text-sm shadow-lg shadow-green-600/20 hover:bg-green-700 transition-colors"
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

export default Finance;
