import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@li/shared/components/Navbar';
import { Footer } from '../../components/Footer';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

const itemHrefs = ['/work/email', '/work/messenger', '/work/telephony', '/work/tickets'];

const Communication: React.FC = () => {
  const { t } = useTranslation('work-communication');
  const items = (t('items', { returnObjects: true }) as Array<{ title: string; desc: string }>).map(
    (item, i) => ({ ...item, href: itemHrefs[i] })
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar variant="habos" />
      <main className="pt-36 md:pt-44 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <motion.p {...fadeUp(0)} className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">{t('eyebrow')}</motion.p>
          <motion.h1 {...fadeUp(0.05)} className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">{t('hero.title')}</motion.h1>
          <motion.p {...fadeUp(0.1)} className="text-xl text-slate-500 max-w-2xl leading-relaxed mb-10">{t('hero.description')}</motion.p>

          {/* Differentiator Callout */}
          <motion.div
            {...fadeUp(0.15)}
            className="relative mb-16 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50/60 to-white p-8 md:p-10 shadow-sm overflow-hidden"
          >
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
            <div className="relative flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-200 flex items-center justify-center">
                <Users size={22} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="inline-block px-3 py-1 bg-blue-600/10 text-blue-700 rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
                  {t('differentiator.badge')}
                </div>
                <h2 className="text-2xl md:text-3xl font-serif text-slate-900 mb-3 leading-snug">
                  {t('differentiator.title')}
                </h2>
                <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl">
                  {t('differentiator.description')}
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {items.map((item, i) => (
              <motion.a key={item.href} href={item.href} {...fadeUp(0.15 + i * 0.05)} className="group bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </main>
    <Footer />
    </div>
  );
};

export default Communication;
