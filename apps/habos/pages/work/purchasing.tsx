import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@li/shared/components/Navbar';
import {
  Truck,
  Package,
  FileText,
  ArrowRight,
  ClipboardCheck,
  ReceiptText,
} from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

const benefitIcons = [Truck, FileText, ClipboardCheck] as const;

const Purchasing: React.FC = () => {
  const { t } = useTranslation('work-purchasing');

  const poLineItems = t('mockPO.lineItems', { returnObjects: true }) as Array<{
    product: string;
    qty: number;
    unit: string;
    total: string;
  }>;

  const receivedItems = t('mockPO.received.items', { returnObjects: true }) as Array<{
    product: string;
    checked: boolean;
  }>;

  const benefits = (t('benefits', { returnObjects: true }) as Array<{
    title: string;
    desc: string;
  }>).map((b, i) => ({ ...b, icon: benefitIcons[i] }));

  const techItems = t('techItems', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ─── Content ─── */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ━━━ 1. Hero ━━━ */}
          <motion.section {...fadeUp()} className="max-w-3xl mx-auto text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600/10 text-amber-700 rounded-full text-sm font-medium mb-6">
              {t('badge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-[1.1]">
              {t('hero.title').split('\n').map((line, i, arr) => (
                <React.Fragment key={i}>{line}{i < arr.length - 1 && <br />}</React.Fragment>
              ))}
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
              {t('hero.description')}
            </p>
          </motion.section>

          {/* ━━━ 2. Mock purchase order card ━━━ */}
          <motion.section {...fadeUp(0.1)} className="mb-20">
            <div className="bg-amber-50/50 rounded-3xl p-6 md:p-8">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <h2 className="text-lg font-semibold text-slate-900">
                  {t('mockPO.title')}
                </h2>
                <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-amber-600 text-white">
                  {t('mockPO.status')}
                </span>
              </div>

              {/* Line items table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-4">
                {/* Table header */}
                <div className="hidden sm:grid grid-cols-[1fr_60px_90px_90px] gap-2 px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <span>{t('mockPO.tableHeaders.item')}</span>
                  <span className="text-right">{t('mockPO.tableHeaders.qty')}</span>
                  <span className="text-right">{t('mockPO.tableHeaders.unit')}</span>
                  <span className="text-right">{t('mockPO.tableHeaders.total')}</span>
                </div>
                {poLineItems.map((item, i) => (
                  <div
                    key={i}
                    className={`grid sm:grid-cols-[1fr_60px_90px_90px] gap-1 sm:gap-2 px-4 py-3 text-sm ${
                      i < poLineItems.length - 1 ? 'border-b border-slate-50' : ''
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
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm mb-6">
                <span className="font-semibold text-slate-900">{t('mockPO.totalsRow.total')}</span>
                <span className="text-amber-700 font-medium">{t('mockPO.totalsRow.lineCount')}</span>
              </div>

              {/* Received section */}
              <div className="border-t border-amber-200/60 pt-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">{t('mockPO.received.heading')}</h3>
                <div className="space-y-2">
                  {receivedItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center ${
                          item.checked
                            ? 'bg-amber-600 text-white'
                            : 'border-2 border-slate-300'
                        }`}
                      >
                        {item.checked && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className={item.checked ? 'text-slate-900' : 'text-slate-400'}>
                        {item.product}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Annotation below card */}
            <p className="text-sm text-slate-500 text-center max-w-2xl mx-auto mt-5 leading-relaxed">
              {t('mockPO.annotation')}
            </p>
          </motion.section>

          {/* ━━━ 3. Three benefit cards ━━━ */}
          <motion.section {...fadeUp(0.2)} className="mb-20">
            <div className="grid md:grid-cols-3 gap-5">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
                >
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
                    <b.icon size={20} className="text-amber-700" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-3">{b.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ━━━ 4. Scenario callout ━━━ */}
          <motion.section {...fadeUp(0.3)} className="mb-20">
            <div className="bg-slate-950 rounded-2xl p-8 md:p-10">
              <p className="text-base md:text-lg text-slate-300 leading-relaxed">
                {t('scenario')}
              </p>
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
              {t('cta.title').split('\n').map((line, i, arr) => (
                <React.Fragment key={i}>{line}{i < arr.length - 1 && <br />}</React.Fragment>
              ))}
            </h2>
            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 inline-flex items-center gap-2 px-8 py-3.5 bg-amber-700 text-white rounded-full font-medium text-sm shadow-lg shadow-amber-700/20 hover:bg-amber-800 transition-colors"
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

export default Purchasing;
