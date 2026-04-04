import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { useTranslation } from 'react-i18next';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const AlwaysWithinReach: React.FC = () => {
  const { t } = useTranslation('philosophy-always-within-reach');
  const surfaces = t('surfaces', { returnObjects: true }) as Array<{ name: string; detail: string }>;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">{t('category')}</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              {t('title')}
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed mb-16">
              {t('tagline')}
            </p>
          </motion.div>

          {/* Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-slate prose-lg max-w-none"
          >
            <p>{t('body')}</p>

            {/* Four surfaces grid */}
            <div className="not-prose my-12 grid grid-cols-2 gap-4">
              {surfaces.map((s) => (
                <div key={s.name} className="border border-slate-150 rounded-xl p-5">
                  <p className="text-base font-semibold text-slate-900 mb-1">{s.name}</p>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.detail}</p>
                </div>
              ))}
            </div>

            <p className="text-base text-slate-600">
              {t('funnelNote')}
            </p>

            {/* Banner image */}
            <div className="not-prose my-12">
              <img
                src="/philosophy/always-within-reach.jpg"
                alt={t('heroAlt')}
                className="w-full rounded-2xl object-cover"
                style={{ aspectRatio: '3/1' }}
              />
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
            <a href="/philosophy/speed-of-thought" className="group flex items-center gap-3">
              <ArrowLeft size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              <div>
                <p className="text-sm text-slate-400 mb-1">{t('nav.prevLabel')}</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">{t('nav.prevTitle')}</p>
              </div>
            </a>
            <a href="/work" className="group flex items-center gap-3 text-right">
              <div>
                <p className="text-sm text-slate-400 mb-1">{t('nav.nextLabel')}</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">{t('nav.nextTitle')}</p>
              </div>
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AlwaysWithinReach;
