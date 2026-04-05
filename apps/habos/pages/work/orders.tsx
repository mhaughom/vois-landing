import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@li/shared/components/Navbar';
import {
  ShoppingCart,
  Package,
  CreditCard,
  ArrowRight,
  Truck,
  ClipboardList,
} from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

const orderStatusConfig: { statusColor: string; statusBg: string }[] = [
  { statusColor: 'text-green-700', statusBg: 'bg-green-50' },
  { statusColor: 'text-amber-700', statusBg: 'bg-amber-50' },
  { statusColor: 'text-red-700', statusBg: 'bg-red-50' },
];

const benefitCardIcons = [ClipboardList, Package, CreditCard] as const;

const Orders: React.FC = () => {
  const { t } = useTranslation('work-orders');

  const orders = (t('orders', { returnObjects: true }) as Array<{
    id: string;
    client: string;
    amount: string;
    status: string;
  }>).map((order, i) => ({ ...order, ...orderStatusConfig[i] }));

  const lineItemsData = t('lineItems.items', { returnObjects: true }) as Array<{
    item: string;
    qty: number;
    unit: string;
    total: string;
  }>;

  const techItems = t('techItems', { returnObjects: true }) as string[];

  const benefitCards = (t('benefitCards', { returnObjects: true }) as Array<{
    title: string;
    desc: string;
  }>).map((card, i) => ({ ...card, icon: benefitCardIcons[i] }));

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* --- Content --- */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* 1. Hero */}
          <motion.section {...fadeUp()} className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 text-orange-700 rounded-full text-sm font-medium mb-6">
              <ShoppingCart size={14} />
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
              {t('intro')}
            </p>
          </motion.div>

          {/* 2. Mock order table */}
          <motion.section {...fadeUp(0.15)} className="mb-20">
            <div className="bg-orange-50/50 rounded-3xl p-6 md:p-8">

              {/* Order rows */}
              <div className="space-y-1.5 mb-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-lg p-3 border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-sm font-mono font-semibold text-slate-400">{order.id}</span>
                      <span className="text-sm text-slate-700 truncate">{order.client}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-medium text-slate-900">{order.amount}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${order.statusColor} ${order.statusBg}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Line item breakdown for first order */}
              <div className="bg-white rounded-xl border border-orange-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  {t('lineItems.heading')}
                </p>
                <div className="space-y-1">
                  {lineItemsData.map((li) => (
                    <div
                      key={li.item}
                      className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100 last:border-0"
                    >
                      <span className="text-slate-700 truncate">{li.item}</span>
                      <div className="flex items-center gap-4 shrink-0 text-slate-500">
                        <span>{li.qty} &times; {li.unit}</span>
                        <span className="font-medium text-slate-900 w-20 text-right">{li.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-3 pt-2 border-t border-slate-200">
                  <span className="text-sm font-semibold text-slate-900">{t('lineItems.total')}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 text-center mt-4">
                {t('lineItems.annotation')}
              </p>
            </div>
          </motion.section>

          {/* 3. Three benefit cards */}
          <motion.section {...fadeUp(0.25)} className="mb-20">
            <div className="grid md:grid-cols-3 gap-6">
              {benefitCards.map((card) => (
                <div key={card.title} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
                      <card.icon size={18} className="text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">{card.title}</h3>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
                </div>
              ))}
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
              {t('cta.title').split('\n').map((line, i, arr) => (
                <React.Fragment key={i}>{line}{i < arr.length - 1 && <br />}</React.Fragment>
              ))}
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

export default Orders;
