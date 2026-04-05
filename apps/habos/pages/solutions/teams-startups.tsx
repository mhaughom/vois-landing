import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Navbar } from '@li/shared/components/Navbar';
import { ArrowRight } from 'lucide-react';

const fade = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

/*
  FORMAT: The app graveyard.
  Startup founders feel the SaaS bloat pain viscerally.
  Start with the pile of subscriptions. Make them feel the weight. Then lift it.
*/

const TeamsStartups: React.FC = () => {
  const { t } = useTranslation('solutions-teams-startups');
  const apps = t('body.appTable.apps', { returnObjects: true }) as Array<{ name: string; cost: string; replaces: string }>;
  const stats = t('body.stats', { returnObjects: true }) as string[][];

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">

          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">{t('hero.category')}</p>
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
            <p>
              {t('body.section1.p1')}
            </p>
            <p>
              {t('body.section1.p2')}
            </p>

            {/* The app list */}
            <div className="not-prose my-10">
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-slate-100 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <div className="col-span-4">{t('body.appTable.colApp')}</div>
                  <div className="col-span-3">{t('body.appTable.colCost')}</div>
                  <div className="col-span-5">{t('body.appTable.colReplaces')}</div>
                </div>
                {apps.map((app, i) => (
                  <div
                    key={app.name}
                    className={`grid grid-cols-12 gap-2 px-5 py-3 text-sm ${i < apps.length - 1 ? 'border-b border-slate-100' : ''}`}
                  >
                    <div className="col-span-4 text-slate-400 line-through">{app.name}</div>
                    <div className="col-span-3 text-slate-400">{app.cost}</div>
                    <div className="col-span-5 text-blue-700 font-medium">{app.replaces}</div>
                  </div>
                ))}
                <div className="px-5 py-4 bg-blue-50 border-t border-blue-100 flex justify-between items-center">
                  <span className="text-sm text-slate-600">{t('body.appTable.footerLabel')}</span>
                  <span className="text-lg font-bold text-slate-900">{t('body.appTable.footerPrice')}<span className="text-sm font-normal text-slate-400">{t('body.appTable.footerPriceSuffix')}</span></span>
                </div>
              </div>
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

            <h2 className="text-2xl font-serif text-slate-900">{t('body.section3.heading')}</h2>

            <div className="not-prose my-8">
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <p className="text-sm font-semibold text-blue-700 uppercase tracking-wider mb-3">{t('body.section3.briefingLabel')}</p>
                <p className="text-base text-slate-800 italic leading-relaxed">
                  {t('body.section3.briefing')}
                </p>
                <p className="text-sm text-blue-700 mt-3">{t('body.section3.briefingNote')}</p>
              </div>
            </div>

            <p>
              {t('body.section3.p1')}
            </p>
            <p>
              {t('body.section3.p2')}
            </p>
            <p>
              {t('body.section3.p3')}
            </p>
            <p>
              {t('body.section3.p4')}
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

            <blockquote className="border-l-4 border-blue-400 pl-6 my-12 not-prose">
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

export default TeamsStartups;
