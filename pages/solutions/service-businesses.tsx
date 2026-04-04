import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar';
import { ArrowRight } from 'lucide-react';

const fade = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

/*
  FORMAT: Day-in-the-life narrative.
  No section headers. No feature grids. Just Lars's day, told as a story,
  weaving HABOS in naturally. Tradespeople think in "my day," not feature lists.
*/

const ServiceBusinesses: React.FC = () => {
  const { t } = useTranslation('solutions-service-businesses');

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">

          {/* Hero */}
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold text-amber-600 tracking-widest uppercase mb-4">{t('hero.category')}</p>
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

          {/* The story */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-slate-700 leading-relaxed [&>p]:mb-6 [&>h2]:mt-16 [&>h2]:mb-4 [&>h3]:mt-12 [&>h3]:mb-3 [&>hr]:my-16"
          >
            <p className="text-sm font-semibold text-slate-400 tracking-widest uppercase">{t('story.dayLabel')}</p>
            <h2 className="text-2xl font-serif text-slate-900 mt-2">{t('story.section1.heading')}</h2>
            <p>
              {t('story.section1.p1')}
            </p>

            <h2 className="text-2xl font-serif text-slate-900">{t('story.section2.heading')}</h2>
            <p>
              {t('story.section2.p1')}
            </p>

            <div className="not-prose my-8">
              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                <p className="text-base text-slate-800 font-medium italic leading-relaxed mb-3">
                  {t('story.section2.voiceNote')}
                </p>
                <p className="text-sm text-amber-700">
                  {t('story.section2.voiceResult')}
                </p>
              </div>
            </div>

            <p>
              {t('story.section2.p2')}
            </p>

            <h2 className="text-2xl font-serif text-slate-900">{t('story.section3.heading')}</h2>
            <p>
              {t('story.section3.p1')}
            </p>
            <p>
              {t('story.section3.p2')}
            </p>

            <h2 className="text-2xl font-serif text-slate-900">{t('story.section4.heading')}</h2>
            <p>
              {t('story.section4.p1')}
            </p>
            <p>
              {t('story.section4.p2')}
            </p>
            <p>
              {t('story.section4.p3')}
            </p>

            {/* Transition to the practical details */}
            <hr className="my-16 border-slate-200" />

            <h2 className="text-2xl font-serif text-slate-900 mt-0">{t('story.section5.heading')}</h2>
            <p>
              {t('story.section5.p1')}
            </p>
            <p>
              {t('story.section5.p2')}
            </p>

            <h2 className="text-2xl font-serif text-slate-900">{t('story.section6.heading')}</h2>
            <p>
              {t('story.section6.p1')}
            </p>
            <p>
              {t('story.section6.p2')}
            </p>

            {/* Testimonial */}
            <blockquote className="border-l-4 border-amber-400 pl-6 my-12 not-prose">
              <p className="text-xl font-serif italic text-slate-700 leading-relaxed mb-4">
                {t('story.testimonial.quote')}
              </p>
              <p className="text-sm text-slate-500">
                {t('story.testimonial.attribution')}
              </p>
            </blockquote>

            {/* CTA */}
            <div className="not-prose text-center py-12">
              <p className="text-2xl md:text-3xl font-serif text-slate-900 mb-6 leading-tight">
                {t('story.cta.heading')}
              </p>
              <a
                href="/#waitlist"
                className="inline-flex items-center gap-2 bg-slate-900 text-white rounded-full px-8 py-4 text-base font-medium hover:bg-slate-800 transition-colors"
              >
                {t('story.cta.button')} <ArrowRight size={16} />
              </a>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ServiceBusinesses;
