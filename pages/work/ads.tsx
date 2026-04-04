import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../../components/Navbar';
import { ArrowLeft, Megaphone, Target, BarChart3, Zap } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

const benefitIcons = [Target, Megaphone, BarChart3, Zap];

const Ads: React.FC = () => {
  const { t } = useTranslation('work-ads');

  const benefits = t('benefits', { returnObjects: true }) as Array<{
    title: string;
    desc: string;
  }>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar variant="habos" />

      <main className="pt-36 md:pt-44 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp(0)} className="mb-4">
            <a href="/work" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft size={14} /> {t('backLink')}
            </a>
          </motion.div>

          <motion.p {...fadeUp(0.05)} className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">
            {t('category')}
          </motion.p>

          <motion.h1 {...fadeUp(0.1)} className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
            {t('title')}
          </motion.h1>

          <motion.p {...fadeUp(0.15)} className="text-xl text-slate-500 max-w-2xl leading-relaxed mb-16">
            {t('description')}
          </motion.p>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((b, i) => {
              const Icon = benefitIcons[i];
              return (
                <motion.div
                  key={b.title}
                  {...fadeUp(0.2 + i * 0.08)}
                  className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                    <Icon size={20} className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{b.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{b.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Ads;
