import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Navbar } from '@li/shared/components/Navbar';
import { useTranslation } from 'react-i18next';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const EverythingInOnePlace: React.FC = () => {
  const { t } = useTranslation('philosophy-everything-in-one-place');
  const updates = t('section2.updates', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">{t('category')}</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-4 leading-tight">
              {t('title')}
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed mb-16">
              {t('tagline')}
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-slate prose-lg max-w-none"
          >
            <h2 className="text-2xl font-serif text-slate-900 mt-0">{t('section1.heading')}</h2>
            <p>{t('section1.body1')}</p>
            <p>{t('section1.body2')}</p>
          </motion.div>

          {/* Image between problem and solution */}
          <motion.img
            src="/philosophy/everything-in-one-place.jpg"
            alt={t('heroAlt')}
            className="w-full rounded-2xl my-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          />

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="prose prose-slate prose-lg max-w-none"
          >
            <h2 className="text-2xl font-serif text-slate-900 mt-0">{t('section2.heading')}</h2>
            <p className="italic text-slate-500 mb-6">
              {t('section2.quote')}
            </p>
            <p>{t('section2.intro')}</p>
            <ol>
              {updates.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            <p>{t('section2.outro')}</p>

            {/* Cost comparison — dark vs light cards */}
            <div className="not-prose grid sm:grid-cols-2 gap-4 my-12">
              <div className="bg-slate-900 rounded-2xl p-6 text-white">
                <p className="text-sm font-semibold text-red-400 mb-3 uppercase tracking-wider">{t('costComparison.separateTitle')}</p>
                <p className="text-3xl font-bold mb-1">{t('costComparison.separatePrice')}<span className="text-base font-normal text-slate-400">{t('costComparison.separatePricePer')}</span></p>
                <p className="text-sm text-slate-400 mt-3">{t('costComparison.separateDetail1')}</p>
                <p className="text-sm text-slate-400">{t('costComparison.separateDetail2')}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <p className="text-sm font-semibold text-emerald-600 mb-3 uppercase tracking-wider">{t('costComparison.voisTitle')}</p>
                <p className="text-3xl font-bold text-slate-900 mb-1">{t('costComparison.voisPrice')}<span className="text-base font-normal text-slate-400">{t('costComparison.voisPricePer')}</span></p>
                <p className="text-sm text-slate-500 mt-3">{t('costComparison.voisDetail1')}</p>
                <p className="text-sm text-slate-500">{t('costComparison.voisDetail2')}</p>
              </div>
            </div>

            <blockquote className="border-l-4 border-slate-900 pl-6 my-12 text-xl font-serif italic text-slate-700">
              {t('quote')}
            </blockquote>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-20 pt-12 border-t border-slate-100 flex justify-between"
          >
            <a href="/philosophy/the-airlock" className="group flex items-center gap-3">
              <ArrowLeft size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              <div>
                <p className="text-sm text-slate-400 mb-1">{t('nav.prevLabel')}</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">{t('nav.prevTitle')}</p>
              </div>
            </a>
            <a href="/philosophy/one-assistant" className="group flex items-center gap-3 text-right">
              <div>
                <p className="text-sm text-slate-400 mb-1">{t('nav.nextLabel')}</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">{t('nav.nextTitle')}</p>
              </div>
              <ArrowRight size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default EverythingInOnePlace;
