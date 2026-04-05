import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@li/shared/components/Navbar';
import {
  ArrowLeft, ArrowRight, ArrowDown, CreditCard,
} from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

/* ─── Flow node style data (non-text) ─── */
const flowNodeStyles = [
  { className: 'bg-white rounded-xl p-4 border border-slate-200' },
  { className: 'bg-purple-50 rounded-xl p-4 border border-purple-200' },
  { className: 'bg-slate-100 rounded-xl p-3 border border-slate-200 text-sm' },
  { className: 'bg-green-50 rounded-xl p-4 border border-green-300 ring-1 ring-green-200' },
];

const Payments: React.FC = () => {
  const { t } = useTranslation('work-payments');

  const benefits = t('benefits', { returnObjects: true }) as Array<{
    title: string;
    desc: string;
  }>;

  const pricingTiers = t('pricing.tiers', { returnObjects: true }) as Array<{
    name: string;
    credits: string;
    price: string;
  }>;

  const techItems = t('techItems', { returnObjects: true }) as string[];

  const flowNodes = t('flowNodes', { returnObjects: true }) as Array<{ label: string }>;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ─── Content ─── */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ━━━ 1. Hero ━━━ */}
          <motion.section {...fadeUp()} className="max-w-3xl mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-500/10 text-slate-700 rounded-full text-sm font-medium mb-6">
              <CreditCard size={14} />
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

          {/* ━━━ 2. Payment flow visualization ━━━ */}
          <motion.section {...fadeUp(0.15)} className="mb-20">
            <div className="bg-slate-50 rounded-3xl p-8">

              {/* Desktop: horizontal flow */}
              <div className="hidden md:flex items-center justify-between gap-3">
                {flowNodes.map((node, i) => (
                  <React.Fragment key={node.label}>
                    <div className={`flex-1 text-center font-medium text-slate-900 ${flowNodeStyles[i].className}`}>
                      {node.label}
                    </div>
                    {i < flowNodes.length - 1 && (
                      <ArrowRight size={20} className="text-slate-400 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Mobile: vertical flow */}
              <div className="flex md:hidden flex-col items-center gap-3">
                {flowNodes.map((node, i) => (
                  <React.Fragment key={node.label}>
                    <div className={`w-full text-center font-medium text-slate-900 ${flowNodeStyles[i].className}`}>
                      {node.label}
                    </div>
                    {i < flowNodes.length - 1 && (
                      <ArrowDown size={20} className="text-slate-400" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              <p className="text-sm text-slate-500 mt-6 leading-relaxed text-center">
                {t('flowCaption')}
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

          {/* ━━━ 4. Pricing model callout ━━━ */}
          <motion.section {...fadeUp(0.35)} className="mb-20">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <h2 className="font-semibold text-slate-900 text-lg mb-5">{t('pricing.heading')}</h2>

              <div className="grid sm:grid-cols-3 gap-4 mb-5">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className="bg-white rounded-xl p-4 border border-green-100 text-center"
                  >
                    <p className="font-semibold text-slate-900 mb-1">{tier.name}</p>
                    <p className="text-sm text-slate-500 mb-2">{tier.credits}</p>
                    <p className="text-lg font-bold text-green-700">{tier.price}</p>
                  </div>
                ))}
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                {t('pricing.topUps')}
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
                className="mt-4 px-8 py-3.5 bg-slate-900 text-white rounded-full font-medium text-sm shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-colors"
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

export default Payments;
