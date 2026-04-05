import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Navbar } from '@li/shared/components/Navbar';
import { useTranslation } from 'react-i18next';
import { Footer } from '../../components/Footer';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const SmallTeamLeverage: React.FC = () => {
  const { t } = useTranslation('philosophy-small-team-leverage');
  const withoutItems = t('withoutItems', { returnObjects: true }) as string[];
  const withItems = t('withItems', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">{t('category')}</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              {t('title')}
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed mb-16">
              {t('tagline')}
            </p>
          </motion.div>

          {/* Hero image placeholder */}
          <motion.div
            initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6, delay: 0.15 }}
            className="w-full aspect-[2/1] rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200/60 flex items-center justify-center mb-16"
          >
            <span className="text-sm text-slate-400 font-medium">{t('heroPlaceholder')}</span>
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

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">{t('section2.heading')}</h2>
            <p>{t('section2.body1')}</p>
            <p>{t('section2.body2')}</p>

            {/* Before / After comparison */}
            <div className="not-prose my-12 grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <p className="text-sm font-semibold text-slate-400 tracking-widest uppercase mb-4">{t('withoutLabel')}</p>
                <ul className="space-y-3 text-base text-slate-600">
                  {withoutItems.map((item) => (
                    <li key={item} className="flex items-start gap-2"><span className="text-red-400 mt-0.5 flex-shrink-0">-</span>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-slate-900 rounded-2xl p-6 text-white">
                <p className="text-sm font-semibold text-slate-400 tracking-widest uppercase mb-4">{t('withLabel')}</p>
                <ul className="space-y-3 text-base text-slate-300">
                  {withItems.map((item) => (
                    <li key={item} className="flex items-start gap-2"><span className="text-green-400 mt-0.5 flex-shrink-0">+</span>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Mid-content image placeholder */}
            <div className="not-prose w-full aspect-[16/9] rounded-2xl bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-100/60 flex items-center justify-center my-12">
              <span className="text-sm text-sky-300 font-medium">{t('platformPlaceholder')}</span>
            </div>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">{t('section3.heading')}</h2>
            <p>{t('section3.body1')}</p>
            <p>{t('section3.body2')}</p>
            <p>{t('section3.body3')}</p>

            {/* Mid-content image placeholder */}
            <div className="not-prose w-full aspect-[16/9] rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/60 flex items-center justify-center my-12">
              <span className="text-sm text-emerald-300 font-medium">{t('dashboardPlaceholder')}</span>
            </div>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">{t('section4.heading')}</h2>
            <p>{t('section4.body1')}</p>
            <p>{t('section4.body2')}</p>
            <p>{t('section4.body3')}</p>

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
            <a href="/philosophy/memory-that-compounds" className="group flex items-center gap-3">
              <ArrowLeft size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              <div>
                <p className="text-sm text-slate-400 mb-1">{t('nav.prevLabel')}</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">{t('nav.prevTitle')}</p>
              </div>
            </a>
            <a href="/philosophy/supercharge-your-team" className="group flex items-center gap-3 text-right">
              <div>
                <p className="text-sm text-slate-400 mb-1">{t('nav.nextLabel')}</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">{t('nav.nextTitle')}</p>
              </div>
              <ArrowRight size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            </a>
          </motion.div>
        </div>
      </main>
    <Footer />
    </div>
  );
};

export default SmallTeamLeverage;
