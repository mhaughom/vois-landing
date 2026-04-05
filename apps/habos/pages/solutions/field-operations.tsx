import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Navbar } from '@li/shared/components/Navbar';
import { ArrowRight } from 'lucide-react';

const fade = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

/*
  FORMAT: Problem → Solution pairs.
  Field ops people want direct answers. No storytelling fluff.
  State the problem. State the fix. Move on.
*/

const FieldOperations: React.FC = () => {
  const { t } = useTranslation('solutions-field-operations');
  const stats = t('body.stats', { returnObjects: true }) as string[][];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">

          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold text-red-600 tracking-widest uppercase mb-4">{t('hero.category')}</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed mb-4">
              {t('hero.subtitle')}
            </p>
            <p className="text-base text-slate-400 mb-16">
              {t('hero.description')}
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-slate-700 leading-relaxed [&>p]:mb-6 [&>h2]:mt-16 [&>h2]:mb-4 [&>h3]:mt-12 [&>h3]:mb-3 [&>hr]:my-16"
          >
            <h2 className="text-2xl font-serif text-slate-900 mt-0">{t('body.section1.heading')}</h2>

            {/* Problem 1 */}
            <div className="not-prose my-8 border-l-4 border-red-200 pl-6">
              <p className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-1">{t('body.labels.problem')}</p>
              <p className="text-base text-slate-700 leading-relaxed">
                {t('body.section1.problem1.problem')}
              </p>
            </div>
            <div className="not-prose my-8 border-l-4 border-emerald-200 pl-6">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-1">{t('body.labels.fix')}</p>
              <p className="text-base text-slate-700 leading-relaxed">
                {t('body.section1.problem1.fix')}
              </p>
            </div>

            {/* Problem 2 */}
            <div className="not-prose my-8 border-l-4 border-red-200 pl-6">
              <p className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-1">{t('body.labels.problem')}</p>
              <p className="text-base text-slate-700 leading-relaxed">
                {t('body.section1.problem2.problem')}
              </p>
            </div>
            <div className="not-prose my-8 border-l-4 border-emerald-200 pl-6">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-1">{t('body.labels.fix')}</p>
              <p className="text-base text-slate-700 leading-relaxed mb-3">
                {t('body.section1.problem2.fixIntro')}
              </p>
              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <p className="text-sm text-slate-800 italic leading-relaxed">
                  {t('body.section1.problem2.voiceNote')}
                </p>
              </div>
              <p className="text-sm text-slate-500 mt-3">
                {t('body.section1.problem2.fixResult')}
              </p>
            </div>

            {/* Problem 3 */}
            <div className="not-prose my-8 border-l-4 border-red-200 pl-6">
              <p className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-1">{t('body.labels.problem')}</p>
              <p className="text-base text-slate-700 leading-relaxed">
                {t('body.section1.problem3.problem')}
              </p>
            </div>
            <div className="not-prose my-8 border-l-4 border-emerald-200 pl-6">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-1">{t('body.labels.fix')}</p>
              <p className="text-base text-slate-700 leading-relaxed">
                {t('body.section1.problem3.fix')}
              </p>
            </div>

            {/* Problem 4 */}
            <div className="not-prose my-8 border-l-4 border-red-200 pl-6">
              <p className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-1">{t('body.labels.problem')}</p>
              <p className="text-base text-slate-700 leading-relaxed">
                {t('body.section1.problem4.problem')}
              </p>
            </div>
            <div className="not-prose my-8 border-l-4 border-emerald-200 pl-6">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-1">{t('body.labels.fix')}</p>
              <p className="text-base text-slate-700 leading-relaxed">
                {t('body.section1.problem4.fix')}
              </p>
            </div>

            {/* Problem 5 */}
            <div className="not-prose my-8 border-l-4 border-red-200 pl-6">
              <p className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-1">{t('body.labels.problem')}</p>
              <p className="text-base text-slate-700 leading-relaxed">
                {t('body.section1.problem5.problem')}
              </p>
            </div>
            <div className="not-prose my-8 border-l-4 border-emerald-200 pl-6">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-1">{t('body.labels.fix')}</p>
              <p className="text-base text-slate-700 leading-relaxed">
                {t('body.section1.problem5.fix')}
              </p>
            </div>

            {/* Problem 6 */}
            <div className="not-prose my-8 border-l-4 border-red-200 pl-6">
              <p className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-1">{t('body.labels.problem')}</p>
              <p className="text-base text-slate-700 leading-relaxed">
                {t('body.section1.problem6.problem')}
              </p>
            </div>
            <div className="not-prose my-8 border-l-4 border-emerald-200 pl-6">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-1">{t('body.labels.fix')}</p>
              <p className="text-base text-slate-700 leading-relaxed">
                {t('body.section1.problem6.fix')}
              </p>
            </div>

            <hr className="my-16 border-slate-200" />

            <h2 className="text-2xl font-serif text-slate-900">{t('body.section2.heading')}</h2>
            <p>
              {t('body.section2.p1')}
            </p>
            <p>
              {t('body.section2.p2')}
            </p>

            <div className="not-prose my-10">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map(([value, label]) => (
                  <div key={label} className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{value}</p>
                    <p className="text-xs text-slate-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <blockquote className="border-l-4 border-red-400 pl-6 my-12 not-prose">
              <p className="text-xl font-serif italic text-slate-700 leading-relaxed mb-4">
                {t('body.testimonial.quote')}
              </p>
              <p className="text-sm text-slate-500">
                {t('body.testimonial.attribution')}
              </p>
            </blockquote>

            <div className="not-prose text-center py-12">
              <p className="text-2xl md:text-3xl font-serif text-slate-900 mb-6 leading-tight">
                {t('body.cta.heading')}
              </p>
              <a
                href="/#waitlist"
                className="inline-flex items-center gap-2 bg-slate-900 text-white rounded-full px-8 py-4 text-base font-medium hover:bg-slate-800 transition-colors"
              >
                {t('body.cta.button')} <ArrowRight size={16} />
              </a>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default FieldOperations;
