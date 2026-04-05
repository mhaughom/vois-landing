import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@li/shared/components/Navbar';
import { useTranslation } from 'react-i18next';
import { Footer } from '../../components/Footer';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const WatchAssistant: React.FC = () => {
  const { t } = useTranslation('work-watch');
  const stats = t('stats', { returnObjects: true }) as Array<{ number: string; label: string }>;
  const timelineEntries = t('timeline.entries', { returnObjects: true }) as Array<{ time: string; text: string }>;
  const techPills = t('techPills', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* Hero */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <div className="inline-block px-4 py-2 bg-emerald-500/10 text-emerald-700 rounded-full text-sm font-medium mb-6">
              {t('badge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-5 leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              {t('hero.description')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto text-center mb-16">
              {t('intro')}
            </p>
          </motion.div>

          {/* Stat Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.number}
                {...fadeUp}
                transition={{ duration: 0.5, delay: 0.15 * i }}
                className="bg-emerald-50 rounded-2xl p-8 text-center"
              >
                <div className="text-5xl font-bold text-emerald-600 mb-4">
                  {stat.number}
                </div>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Day in the Life */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-slate-50 rounded-3xl p-8 md:p-12 mb-20"
          >
            <h2 className="text-2xl md:text-3xl font-serif font-medium text-slate-900 mb-10 text-center">
              {t('timeline.title')}
            </h2>

            <div className="max-w-3xl mx-auto relative">
              {/* Connecting line */}
              <div className="absolute left-[4.5rem] md:left-[5.5rem] top-2 bottom-2 w-px bg-emerald-200" />

              <div className="space-y-8">
                {timelineEntries.map((entry, i) => (
                  <motion.div
                    key={entry.time}
                    {...fadeUp}
                    transition={{ duration: 0.4, delay: 0.3 + 0.1 * i }}
                    className="flex gap-6 items-start relative"
                  >
                    <div className="flex-shrink-0 w-[4.5rem] md:w-[5.5rem] text-right">
                      <span className="font-mono font-semibold text-emerald-600 text-sm">
                        {entry.time}
                      </span>
                    </div>
                    <div className="relative flex-shrink-0 w-2.5 h-2.5 mt-1.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                    <p className="text-slate-700 leading-relaxed text-[15px] flex-1">
                      {entry.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Two-Column Feature Block */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-2 gap-12 md:gap-16 mb-20 max-w-4xl mx-auto"
          >
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {t('features.suggestionCards.title')}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {t('features.suggestionCards.description')}
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {t('features.seamlessHandoff.title')}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {t('features.seamlessHandoff.description')}
              </p>
            </div>
          </motion.div>

          {/* Technical Credibility Strip */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-slate-900 text-white rounded-2xl px-8 py-5 mb-20"
          >
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm">
              {techPills.map((pill, i) => (
                <React.Fragment key={pill}>
                  {i > 0 && (
                    <span className="text-slate-500 select-none">&middot;</span>
                  )}
                  <span className="text-slate-300 font-medium">{pill}</span>
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          {/* Closing */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center"
          >
            <p className="text-lg text-slate-400 italic mb-8">
              {t('closing.tagline')}
            </p>
            <a href="/work#waitlist">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-slate-900 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                {t('closing.cta')}
              </motion.button>
            </a>
          </motion.div>

        </div>
      </main>
    <Footer />
    </div>
  );
};

export default WatchAssistant;
