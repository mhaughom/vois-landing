import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Brain, Users, ArrowRight } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { useTranslation } from 'react-i18next';

const benefitIcons = [
  <Clock size={20} className="text-amber-600" />,
  <Brain size={20} className="text-amber-600" />,
  <Users size={20} className="text-amber-600" />,
];

const Briefs: React.FC = () => {
  const { t } = useTranslation('work-briefs');
  const benefitCards = t('benefitCards', { returnObjects: true }) as Array<{ title: string; description: string }>;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Content */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">

          {/* 1. Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <div className="inline-block px-4 py-2 bg-amber-500/10 text-amber-700 rounded-full text-sm font-medium mb-6">
              {t('badge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-tight">
              {t('hero.title')}{' '}
              <span className="relative inline-block">
                <span className="relative z-10">{t('hero.titleHighlight')}</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.6, ease: "circOut" }}
                  className="absolute bottom-2 left-0 right-0 h-3 bg-amber-300/40 origin-left -z-0 rounded-sm"
                />
              </span>
              .
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

          {/* 2. Big time comparison */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-amber-50 rounded-3xl p-8 md:p-10 mb-20"
          >
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
              {/* Before */}
              <div className="text-center md:text-right flex-1">
                <div className="text-5xl md:text-6xl font-bold text-slate-300 line-through decoration-slate-300">
                  {t('timeComparison.before.value')}
                </div>
                <p className="text-sm text-slate-400 mt-3 max-w-xs mx-auto md:ml-auto md:mr-0">
                  {t('timeComparison.before.description')}
                </p>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0">
                <ArrowRight size={28} className="text-amber-400" />
              </div>

              {/* After */}
              <div className="text-center md:text-left flex-1">
                <div className="text-5xl md:text-6xl font-bold text-amber-600">
                  {t('timeComparison.after.value')}
                </div>
                <p className="text-sm text-slate-500 mt-3 max-w-xs mx-auto md:mr-auto md:ml-0">
                  {t('timeComparison.after.description')}
                </p>
              </div>
            </div>
          </motion.div>

          {/* 3. Mock brief preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-20"
          >
            <h2 className="text-2xl font-serif text-slate-900 text-center mb-6">
              {t('briefPreview.title')}
            </h2>
            <div className="bg-white border border-amber-200 rounded-2xl p-6 md:p-8 shadow-lg max-w-2xl mx-auto">
              <pre className="font-mono text-xs md:text-sm leading-relaxed text-slate-700 whitespace-pre-wrap overflow-x-auto">
{`MEETING BRIEF — Henderson Team Sync
Tuesday, March 25 · 2:00 PM
─────────────────────────────────────

`}<span className="text-amber-700 font-semibold">ATTENDEES</span>{`
• Sarah Henderson — Last contact: Mar 18 (positive sentiment)
• Mike Torres — Has 2 open action items from last meeting

`}<span className="text-amber-700 font-semibold">KEY CONTEXT</span>{`
• Permit approved Mar 20 — ready to proceed
• Budget revised upward by 12% per Sarah's email Mar 15
• Outstanding: tile selection (action item from Mar 12 meeting)

`}<span className="text-amber-700 font-semibold">SUGGESTED TALKING POINTS</span>{`
✓ Confirm revised timeline post-permit
✓ Resolve tile selection — samples arriving Thursday
✓ Review Mike's open items`}
              </pre>
            </div>
          </motion.div>

          {/* 4. Three benefit cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid md:grid-cols-3 gap-5 mb-20"
          >
            {benefitCards.map((card, i) => (
              <div key={card.title} className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                  {benefitIcons[i]}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{card.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </motion.div>

          {/* 5. Real scenario callout */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-slate-900 text-white rounded-3xl p-8 md:p-10 mb-20"
          >
            <p className="text-lg md:text-xl leading-relaxed text-slate-200">
              {t('callout.body')}
            </p>
            <p className="text-lg md:text-xl font-semibold text-white mt-6">
              {t('callout.punchline')}
            </p>
          </motion.div>

          {/* 6. Closing */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center"
          >
            <p className="text-xl md:text-2xl font-serif italic text-slate-700 mb-8">
              {t('closing.tagline')}
            </p>
            <a href="/#pricing">
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
    </div>
  );
};

export default Briefs;
