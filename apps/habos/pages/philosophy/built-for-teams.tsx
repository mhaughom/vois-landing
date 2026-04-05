import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Navbar } from '@li/shared/components/Navbar';
import { useTranslation } from 'react-i18next';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const roleColors = ['bg-blue-500', 'bg-amber-500', 'bg-emerald-500'];

const BuiltForTeams: React.FC = () => {
  const { t } = useTranslation('philosophy-built-for-teams');
  const roles = t('roles', { returnObjects: true }) as Array<{ name: string; desc: string }>;

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">{t('category')}</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              {t('title')}
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed mb-12">
              {t('tagline')}
            </p>
          </motion.div>

          {/* Hero image — full width */}
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6, delay: 0.15 }}>
            <img
              src="/philosophy/built-for-teams.jpg"
              alt={t('heroAlt')}
              className="w-full rounded-2xl mb-16"
            />
          </motion.div>

          {/* Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-slate prose-lg max-w-none"
          >
            <p>{t('body1')}</p>

            {/* Role-based views — 3 clean lines */}
            <div className="not-prose my-12 bg-slate-50 rounded-2xl border border-slate-100 p-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">{t('rolesLabel')}</p>
              <div className="space-y-3">
                {roles.map((role, i) => (
                  <div key={role.name} className="flex items-baseline gap-3">
                    <span className={`w-2 h-2 rounded-full ${roleColors[i]} flex-shrink-0 mt-1.5`} />
                    <p className="text-sm text-slate-700"><strong className="text-slate-900">{role.name}</strong> — {role.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <p>{t('body2')}</p>

            <blockquote className="border-l-4 border-slate-900 pl-6 my-12 text-xl font-serif italic text-slate-700">
              {t('quote')}
            </blockquote>
          </motion.div>

          {/* Prev / Next */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-20 pt-12 border-t border-slate-100 flex justify-between"
          >
            <a href="/philosophy/one-assistant" className="group flex items-center gap-3">
              <ArrowLeft size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              <div>
                <p className="text-sm text-slate-400 mb-1">{t('nav.prevLabel')}</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">{t('nav.prevTitle')}</p>
              </div>
            </a>
            <a href="/philosophy/suggestions-not-menus" className="group flex items-center gap-3 text-right">
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

export default BuiltForTeams;
