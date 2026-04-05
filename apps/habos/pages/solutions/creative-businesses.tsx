import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Navbar } from '@li/shared/components/Navbar';
import { ArrowRight } from 'lucide-react';
import { Footer } from '../../components/Footer';

const fade = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

/*
  FORMAT: Case study.
  Creatives respond to stories and portfolios — not feature lists.
  Tell Marte's story as if it's a real case study.
*/

const CreativeBusinesses: React.FC = () => {
  const { t } = useTranslation('solutions-creative-businesses');
  const stats = t('body.section5.stats', { returnObjects: true }) as string[][];

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">

          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold text-pink-600 tracking-widest uppercase mb-4">{t('hero.category')}</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              {t('hero.title')}<br className="hidden md:block" />
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
            <p className="text-sm font-semibold text-slate-400 tracking-widest uppercase">{t('body.caseStudyLabel')}</p>
            <h2 className="text-2xl font-serif text-slate-900 mt-2">{t('body.section1.heading')}</h2>

            <p>
              {t('body.section1.p1')}
            </p>

            <h3 className="text-xl font-serif text-slate-900">{t('body.section2.heading')}</h3>
            <p>
              {t('body.section2.p1')}
            </p>
            <p>
              {t('body.section2.p2')}
            </p>
            <p>
              {t('body.section2.p3')}
            </p>
            <p>
              {t('body.section2.p4')}
            </p>

            <h3 className="text-xl font-serif text-slate-900">{t('body.section3.heading')}</h3>
            <p>
              {t('body.section3.p1')}
            </p>
            <p>
              {t('body.section3.p2')}
            </p>

            <div className="not-prose my-8">
              <div className="bg-pink-50 rounded-2xl p-6 border border-pink-100">
                <p className="text-sm font-semibold text-pink-700 uppercase tracking-wider mb-3">{t('body.section3.highlight.label')}</p>
                <p className="text-base text-slate-800 font-medium italic leading-relaxed mb-3">
                  {t('body.section3.highlight.voiceNote')}
                </p>
                <p className="text-sm text-pink-700">
                  {t('body.section3.highlight.result')}
                </p>
              </div>
            </div>

            <h3 className="text-xl font-serif text-slate-900">{t('body.section4.heading')}</h3>
            <p>
              {t('body.section4.p1')}
            </p>
            <p>
              {t('body.section4.p2')}
            </p>
            <p>
              {t('body.section4.p3')}
            </p>
            <p>
              {t('body.section4.p4')}
            </p>

            <h3 className="text-xl font-serif text-slate-900">{t('body.section5.heading')}</h3>
            <div className="not-prose my-10">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map(([value, label]) => (
                  <div key={label} className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-slate-900">{value}</p>
                    <p className="text-xs text-slate-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <blockquote className="border-l-4 border-pink-400 pl-6 my-12 not-prose">
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
    <Footer />
    </div>
  );
};

export default CreativeBusinesses;
