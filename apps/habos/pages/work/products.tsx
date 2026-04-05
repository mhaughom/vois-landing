import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@li/shared/components/Navbar';
import {
  ArrowLeft,
  Package,
  Box,
  Layers,
  RefreshCw,
  ShieldCheck,
  CreditCard,
  ArrowRightLeft,
  ArrowRight,
} from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

const productTypeIcons = [Package, Box, Layers, RefreshCw];
const benefitIcons = [ShieldCheck, CreditCard, ArrowRightLeft];

const activeStep = 3; // "In Progress"

const Products: React.FC = () => {
  const { t } = useTranslation('work-products');

  const productTypes = t('productTypes', { returnObjects: true }) as Array<{
    label: string;
    desc: string;
  }>;

  const orderSteps = t('orderSteps', { returnObjects: true }) as string[];

  const lineItems = t('order.lineItems', { returnObjects: true }) as Array<{
    product: string;
    qty: string;
    unit: string;
    total: string;
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
          <motion.section {...fadeUp()} className="max-w-3xl mx-auto text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-700 rounded-full text-sm font-medium mb-6">
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

          {/* ━━━ 2. Product type showcase ━━━ */}
          <motion.section {...fadeUp(0.1)} className="mb-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {productTypes.map((pt, i) => {
                const Icon = productTypeIcons[i];
                return (
                  <div
                    key={pt.label}
                    className="bg-white border border-slate-200 rounded-xl p-4 text-center"
                  >
                    <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Icon size={20} className="text-emerald-600" />
                    </div>
                    <p className="font-semibold text-sm text-slate-900 mb-1">{pt.label}</p>
                    <p className="text-xs text-slate-500">{pt.desc}</p>
                  </div>
                );
              })}
            </div>
            <p className="text-sm text-slate-500 text-center max-w-xl mx-auto leading-relaxed">
              {t('catalogCaption')}
            </p>
          </motion.section>

          {/* ━━━ 3. Mock order card ━━━ */}
          <motion.section {...fadeUp(0.2)} className="mb-20">
            <div className="bg-emerald-50/50 rounded-3xl p-6 md:p-8">
              {/* Header */}
              <h2 className="text-lg font-semibold text-slate-900 mb-5">
                {t('order.heading')}
              </h2>

              {/* Status flow */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {orderSteps.map((step, i) => (
                  <React.Fragment key={step}>
                    {i > 0 && (
                      <span className="text-slate-300 text-xs select-none">&rarr;</span>
                    )}
                    <span
                      className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                        i === activeStep
                          ? 'bg-emerald-600 text-white'
                          : i < activeStep
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {step}
                    </span>
                  </React.Fragment>
                ))}
              </div>

              {/* Line items table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-4">
                {/* Table header */}
                <div className="hidden sm:grid grid-cols-[1fr_60px_90px_90px] gap-2 px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <span>{t('order.tableHeaders.product')}</span>
                  <span className="text-right">{t('order.tableHeaders.qty')}</span>
                  <span className="text-right">{t('order.tableHeaders.unit')}</span>
                  <span className="text-right">{t('order.tableHeaders.total')}</span>
                </div>
                {lineItems.map((item, i) => (
                  <div
                    key={i}
                    className={`grid sm:grid-cols-[1fr_60px_90px_90px] gap-1 sm:gap-2 px-4 py-3 text-sm ${
                      i < lineItems.length - 1 ? 'border-b border-slate-50' : ''
                    }`}
                  >
                    <span className="font-medium text-slate-900">{item.product}</span>
                    <span className="text-slate-500 sm:text-right">{item.qty}</span>
                    <span className="text-slate-500 sm:text-right">{item.unit}</span>
                    <span className="font-medium text-slate-900 sm:text-right">{item.total}</span>
                  </div>
                ))}
              </div>

              {/* Totals row */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <span className="font-semibold text-slate-900">{t('order.subtotal')}</span>
                <span className="text-emerald-700 font-medium">
                  {t('order.paymentConfirmed')}
                </span>
                <span className="text-slate-500">{t('order.deposit')}</span>
              </div>
            </div>

            {/* Annotation below card */}
            <p className="text-sm text-slate-500 text-center max-w-2xl mx-auto mt-5 leading-relaxed">
              {t('orderCaption')}
            </p>
          </motion.section>

          {/* ━━━ 4. Three benefit cards ━━━ */}
          <motion.section {...fadeUp(0.3)} className="mb-20">
            <div className="grid md:grid-cols-3 gap-5">
              {benefits.map((b, i) => {
                const Icon = benefitIcons[i];
                return (
                  <div
                    key={b.title}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
                  >
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                      <Icon size={20} className="text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-3">{b.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
                  </div>
                );
              })}
            </div>
          </motion.section>

          {/* ━━━ 5. Tech strip ━━━ */}
          <motion.section {...fadeUp(0.4)} className="mb-20">
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
          <motion.section {...fadeUp(0.5)} className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-slate-900 mb-5 leading-tight">
              {t('cta.heading')}
            </h2>
            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-full font-medium text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
              >
                {t('cta.button')}
                <ArrowRight size={18} />
              </motion.button>
            </a>
          </motion.section>

        </div>
      </main>
    </div>
  );
};

export default Products;
