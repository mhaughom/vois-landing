import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar';
import { ArrowRight } from 'lucide-react';

const fade = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

/*
  FORMAT: A letter.
  "Dear solo founder," — personal and intimate.
  This isn't a product page. It's written by someone who understands.
*/

const SoloFounders: React.FC = () => {
  const { t } = useTranslation('solutions-solo-founders');
  const stats = t('body.stats', { returnObjects: true }) as string[][];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">

          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold text-purple-600 tracking-widest uppercase mb-4">{t('hero.category')}</p>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif text-slate-900 mb-6 leading-[1.1]">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed mb-16">
              {t('hero.subtitle')}
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-slate-700 leading-relaxed [&>p]:mb-6 [&>h2]:mt-16 [&>h2]:mb-4 [&>h3]:mt-12 [&>h3]:mb-3 [&>hr]:my-16"
          >
            <p className="text-2xl font-serif text-slate-900 mt-0 mb-8">{t('body.salutation')}</p>

            <p>
              {t('body.p1')}
            </p>
            <p>
              {t('body.p2')}
            </p>
            <p>
              {t('body.p3')}
            </p>
            <p>
              {t('body.p4')}
            </p>

            <hr className="my-16 border-slate-200" />

            <p className="text-2xl font-serif text-slate-900 mb-8">{t('body.divider')}</p>

            <div className="not-prose my-8">
              <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                <p className="text-sm font-semibold text-purple-700 uppercase tracking-wider mb-3">{t('body.briefing.label')}</p>
                <p className="text-base text-slate-800 italic leading-relaxed">
                  {t('body.briefing.text')}
                </p>
                <p className="text-sm text-purple-700 mt-3">{t('body.briefing.note')}</p>
              </div>
            </div>

            <p>
              {t('body.p5')}
            </p>
            <p>
              {t('body.p6')}
            </p>
            <p>
              {t('body.p7')}
            </p>
            <p>
              {t('body.p8')}
            </p>
            <p>
              {t('body.p9')}
            </p>

            {/* Emotional section */}
            <div className="not-prose my-16 bg-slate-900 rounded-2xl px-8 py-12 md:px-12 md:py-16 text-center">
              <p className="text-xl md:text-2xl font-serif text-white leading-relaxed mb-6">
                {t('body.emotional.line1')}
              </p>
              <p className="text-lg md:text-xl font-serif text-slate-300 leading-relaxed">
                {t('body.emotional.line2')}
              </p>
            </div>

            <h2 className="text-2xl font-serif text-slate-900">{t('body.section2.heading')}</h2>
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

            <p>{t('body.section2.p5')}</p>

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

            <blockquote className="border-l-4 border-purple-400 pl-6 my-12 not-prose">
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

export default SoloFounders;
