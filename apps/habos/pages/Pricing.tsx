import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Navbar } from '@li/shared/components/Navbar';
import { Footer } from '../components/Footer';
import { WaitlistModal } from '@li/shared/components/WaitlistModal';
import { Analytics } from '@li/shared/lib/analytics';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const Pricing = () => {
  const { t, i18n } = useTranslation('work-home');
  const [annualBilling, setAnnualBilling] = useState(true);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistSource, setWaitlistSource] = useState('pricing');

  const pricingFeaturesData = useMemo(() => t('pricingFeatures', { returnObjects: true }) as Array<{ feature: string }>, [i18n.language]);

  const pricingFeatures = useMemo(() => [
    { feature: pricingFeaturesData[0]?.feature,  personal: true,  work: true },
    { feature: pricingFeaturesData[1]?.feature,  personal: true,  work: true },
    { feature: pricingFeaturesData[2]?.feature,  personal: true,  work: true },
    { feature: pricingFeaturesData[3]?.feature,  personal: true,  work: true },
    { feature: pricingFeaturesData[4]?.feature,  personal: true,  work: true },
    { feature: pricingFeaturesData[5]?.feature,  personal: true,  work: true },
    { feature: pricingFeaturesData[6]?.feature,  personal: false, work: true },
    { feature: pricingFeaturesData[7]?.feature,  personal: false, work: true },
    { feature: pricingFeaturesData[8]?.feature,  personal: false, work: true },
    { feature: pricingFeaturesData[9]?.feature,  personal: false, work: true },
    { feature: pricingFeaturesData[10]?.feature, personal: false, work: true },
    { feature: pricingFeaturesData[11]?.feature, personal: false, work: true },
    { feature: pricingFeaturesData[12]?.feature, personal: false, work: true },
    { feature: pricingFeaturesData[13]?.feature, personal: false, work: true },
  ], [pricingFeaturesData]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-900 mb-4">
            {t('pricing.heading')}
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            {t('pricing.description')}
          </p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="flex items-center justify-center gap-4 mb-12"
        >
          <span className={`text-sm font-medium transition-colors ${!annualBilling ? 'text-slate-900' : 'text-slate-400'}`}>{t('pricing.billingMonthly')}</span>
          <button
            onClick={() => setAnnualBilling(!annualBilling)}
            className="relative w-12 h-6 rounded-full bg-slate-200 transition-colors"
            style={annualBilling ? { backgroundColor: '#0f172a' } : undefined}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${annualBilling ? 'translate-x-[26px]' : 'translate-x-0.5'}`} />
          </button>
          <span className={`text-sm font-medium transition-colors ${annualBilling ? 'text-slate-900' : 'text-slate-400'}`}>{t('pricing.billingAnnual')}</span>
          {annualBilling && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              {t('pricing.saveLabel')}
            </span>
          )}
        </motion.div>

        {/* Pricing cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="grid md:grid-cols-2 gap-6 mb-12"
        >
          {/* Personal */}
          <div className="bg-white rounded-2xl md:rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">{t('pricing.personal.name')}</h3>
            <p className="text-sm text-slate-500 mb-5">{t('pricing.personal.description')}</p>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-4xl font-bold text-slate-900 tracking-tight">
                {annualBilling ? t('pricing.personal.priceAnnual') : t('pricing.personal.priceMonthly')}
              </span>
              <span className="text-slate-400 text-sm">{t('pricing.personal.perMonth')}</span>
            </div>
            <button
              onClick={() => {
                Analytics.waitlistModalOpened('pricing_personal');
                setWaitlistSource('pricing_personal');
                setShowWaitlistModal(true);
              }}
              className="w-full bg-slate-100 text-slate-900 py-3.5 rounded-full text-base font-semibold hover:bg-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98] mb-6"
            >
              {t('pricing.personal.cta')}
            </button>
            <p className="text-xs text-slate-400 text-center">{t('pricing.personal.guarantee')}</p>
          </div>

          {/* Work */}
          <div className="bg-slate-950 rounded-2xl md:rounded-3xl p-8 shadow-2xl flex flex-col relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/20">
                {t('pricing.work.badge')}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{t('pricing.work.name')}</h3>
            <p className="text-sm text-slate-400 mb-5">{t('pricing.work.description')}</p>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-4xl font-bold text-white tracking-tight">
                {annualBilling ? t('pricing.work.priceAnnual') : t('pricing.work.priceMonthly')}
              </span>
              <span className="text-slate-500 text-sm">{t('pricing.work.perMonth')}</span>
            </div>
            <button
              onClick={() => {
                Analytics.waitlistModalOpened('pricing_work');
                setWaitlistSource('pricing_work');
                setShowWaitlistModal(true);
              }}
              className="w-full bg-white text-slate-950 py-3.5 rounded-full text-base font-semibold hover:bg-slate-100 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg mb-6"
            >
              {t('pricing.work.cta')}
            </button>
            <p className="text-xs text-slate-500 text-center">{t('pricing.work.guarantee')}</p>
          </div>
        </motion.div>

        {/* Feature comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.22 }}
          className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="grid grid-cols-[1fr_4rem_4rem] md:grid-cols-12 gap-2 md:gap-4 px-4 md:px-6 py-4 border-b border-slate-100 bg-slate-50/80">
            <div className="md:col-span-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('pricing.featureColHeader')}</div>
            <div className="md:col-span-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">{t('pricing.personalColHeader')}</div>
            <div className="md:col-span-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">{t('pricing.workColHeader')}</div>
          </div>
          {pricingFeatures.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-[1fr_4rem_4rem] md:grid-cols-12 gap-2 md:gap-4 px-4 md:px-6 py-3.5 items-center ${i < pricingFeatures.length - 1 ? 'border-b border-slate-50' : ''}`}
            >
              <div className="md:col-span-6 text-sm text-slate-600">{row.feature}</div>
              <div className="md:col-span-3 text-center">
                {row.personal ? (
                  <Check size={16} className="text-emerald-500 mx-auto" />
                ) : (
                  <span className="text-slate-300">—</span>
                )}
              </div>
              <div className="md:col-span-3 text-center">
                {row.work ? (
                  <Check size={16} className="text-emerald-500 mx-auto" />
                ) : (
                  <span className="text-slate-300">—</span>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <Footer />

      {showWaitlistModal && (
        <WaitlistModal
          source={waitlistSource}
          onClose={() => setShowWaitlistModal(false)}
        />
      )}
    </div>
  );
};

export default Pricing;
