import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { useTranslation } from 'react-i18next';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const tierColors = ['#22c55e', '#f59e0b', '#ef4444'];

const HumanControl: React.FC = () => {
  const { t } = useTranslation('philosophy-human-control');
  const tiers = t('tiers', { returnObjects: true }) as Array<{ tier: string; desc: string; rule: string }>;
  const policies = t('section4.policies', { returnObjects: true }) as string[];

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

            <div className="not-prose my-12 grid gap-4">
              {tiers.map((item, i) => (
                <div key={item.tier} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tierColors[i] }} />
                    <h3 className="text-lg font-semibold text-slate-900">{item.tier}</h3>
                  </div>
                  <p className="text-slate-600 text-base mb-2">{item.desc}</p>
                  <p className="text-sm font-medium text-slate-500">{item.rule}</p>
                </div>
              ))}
            </div>

            {/* Mid-content image placeholder */}
            <div className="not-prose w-full aspect-[16/9] rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100/60 flex items-center justify-center my-12">
              <span className="text-sm text-emerald-300 font-medium">{t('approvalFlowPlaceholder')}</span>
            </div>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">{t('section3.heading')}</h2>
            <p>{t('section3.body')}</p>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">{t('section4.heading')}</h2>
            <p>{t('section4.intro')}</p>
            <ul>
              {policies.map((policy) => (
                <li key={policy}>{policy}</li>
              ))}
            </ul>
            <p>{t('section4.outro')}</p>

            {/* Mid-content image placeholder */}
            <div className="not-prose w-full aspect-[16/9] rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100/60 flex items-center justify-center my-12">
              <span className="text-sm text-amber-300 font-medium">{t('approvalFlowScreenshotPlaceholder')}</span>
            </div>

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
            <div />
            <a href="/philosophy/ai-native" className="group flex items-center gap-3 text-right">
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

export default HumanControl;
