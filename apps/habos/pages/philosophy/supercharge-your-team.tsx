import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@li/shared/components/Navbar';
import { useTranslation } from 'react-i18next';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const SuperchargeYourTeam: React.FC = () => {
  const { t } = useTranslation('philosophy-supercharge-your-team');
  const roles = t('roles', { returnObjects: true }) as Array<{ role: string; before: string; after: string }>;

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
            <p>
              {t('section1.body2')}
            </p>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">{t('section2.heading')}</h2>
            <p>{t('section2.body1')}</p>
            <p>{t('section2.body2')}</p>

            {/* Role cards */}
            <div className="not-prose my-12 grid gap-4">
              {roles.map((item) => (
                <div key={item.role} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">{item.role}</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-base">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 tracking-widest uppercase mb-1">{t('beforeLabel')}</p>
                      <p className="text-slate-500">{item.before}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-green-600 tracking-widest uppercase mb-1">{t('withHabosLabel')}</p>
                      <p className="text-slate-700">{item.after}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mid-content image placeholder */}
            <div className="not-prose w-full aspect-[16/9] rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100/60 flex items-center justify-center my-12">
              <span className="text-sm text-rose-300 font-medium">{t('teamVisualPlaceholder')}</span>
            </div>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">{t('section3.heading')}</h2>
            <p>
              {t('section3.body1')}
            </p>
            <p>{t('section3.body2')}</p>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">{t('section4.heading')}</h2>
            <p>{t('section4.body1')}</p>
            <p>{t('section4.body2')}</p>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">{t('section5.heading')}</h2>
            <p>{t('section5.body1')}</p>
            <p>{t('section5.body2')}</p>

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
            <a href="/philosophy/small-team-leverage" className="group flex items-center gap-3">
              <ArrowLeft size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              <div>
                <p className="text-sm text-slate-400 mb-1">{t('nav.prevLabel')}</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">{t('nav.prevTitle')}</p>
              </div>
            </a>
            <a href="/work" className="group flex items-center gap-3 text-right">
              <div>
                <p className="text-sm text-slate-400 mb-1">{t('nav.backLabel')}</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">{t('nav.backTitle')}</p>
              </div>
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SuperchargeYourTeam;
