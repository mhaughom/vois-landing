import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { useTranslation } from 'react-i18next';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const TwoInterfaces: React.FC = () => {
  const { t } = useTranslation('philosophy-two-interfaces');

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        {/* Narrow centered column — editorial feel */}
        <div className="max-w-2xl mx-auto">
          {/* Hero */}
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">{t('category')}</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              {t('title')}
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed mb-12">
              {t('tagline')}
            </p>
          </motion.div>

          {/* Full-width image */}
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6, delay: 0.15 }}>
            <img
              src="/philosophy/two-interfaces.jpg"
              alt={t('heroAlt')}
              className="w-full rounded-2xl mb-16"
            />
          </motion.div>

          {/* Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-slate prose-lg max-w-none"
          >
            <p>{t('body1')}</p>

            {/* Side-by-side: Human vs Agent interface */}
            <div className="not-prose my-12 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm font-semibold text-slate-700">{t('humanInterface.label')}</span>
                </div>
                <p className="text-sm text-slate-600">{t('humanInterface.body')}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-semibold text-slate-700">{t('agentInterface.label')}</span>
                </div>
                <p className="text-sm text-slate-600 font-mono text-xs leading-relaxed">{t('agentInterface.code')}</p>
                <p className="text-sm text-slate-500 mt-2">{t('agentInterface.body')}</p>
              </div>
            </div>

            <p className="not-prose text-center text-lg font-medium text-slate-700 bg-slate-50 rounded-2xl border border-slate-100 py-5 px-6 my-12">
              {t('comparisonWebUI')} <span className="text-red-500">{t('comparisonWebUIStat')}</span> {t('comparisonFunctionCall')} <span className="text-emerald-600">{t('comparisonFunctionCallStat')}</span> <strong>{t('comparisonMultiplier')}</strong>
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
            <a href="/philosophy/suggestions-not-menus" className="group flex items-center gap-3">
              <ArrowLeft size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              <div>
                <p className="text-sm text-slate-400 mb-1">{t('nav.prevLabel')}</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">{t('nav.prevTitle')}</p>
              </div>
            </a>
            <a href="/philosophy/capture-your-brain" className="group flex items-center gap-3 text-right">
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

export default TwoInterfaces;
