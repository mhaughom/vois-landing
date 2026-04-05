import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Navbar } from '@li/shared/components/Navbar';
import { useTranslation } from 'react-i18next';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const SuggestionsNotMenus: React.FC = () => {
  const { t } = useTranslation('philosophy-suggestions-not-menus');

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">{t('category')}</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              {t('title')}
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed mb-12">
              {t('tagline')}
            </p>
          </motion.div>

          {/* Image left + content right on desktop, stacked on mobile */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col md:flex-row gap-10 mb-16"
          >
            <img
              src="/philosophy/suggestions-not-menus.jpg"
              alt={t('heroAlt')}
              className="w-full md:w-[45%] rounded-2xl object-cover flex-shrink-0"
            />

            <div className="prose prose-slate prose-lg max-w-none">
              <p>{t('body1')}</p>

              <p>
                <strong>{t('body2Prefix')}</strong> {t('body2Body')}
              </p>

              <p>
                <strong>{t('body3Prefix')}</strong> {t('body3Body')}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="prose prose-slate prose-lg max-w-none"
          >
            <p className="not-prose text-center text-lg font-medium text-slate-700 bg-slate-50 rounded-2xl border border-slate-100 py-5 px-6 my-12">
              {t('comparisonTraditional')} <span className="text-red-500">{t('comparisonTraditionalStat')}</span> {t('comparisonSuggestions')} <span className="text-emerald-600">{t('comparisonSuggestionsStat')}</span> {t('comparisonResult')} <strong>{t('comparisonResultStat')}</strong>
            </p>

            <blockquote className="border-l-4 border-slate-900 pl-6 my-12 text-xl font-serif italic text-slate-700">
              {t('quote')}
            </blockquote>
          </motion.div>

          {/* Prev / Next */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-20 pt-12 border-t border-slate-100 flex justify-between"
          >
            <a href="/philosophy/built-for-teams" className="group flex items-center gap-3">
              <ArrowLeft size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              <div>
                <p className="text-sm text-slate-400 mb-1">{t('nav.prevLabel')}</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">{t('nav.prevTitle')}</p>
              </div>
            </a>
            <a href="/philosophy/two-interfaces" className="group flex items-center gap-3 text-right">
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

export default SuggestionsNotMenus;
