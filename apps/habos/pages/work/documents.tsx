import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@li/shared/components/Navbar';
import { FileText, Search, Layout, ArrowRight, Pen, FolderOpen } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

const benefitCardIcons = [Layout, FolderOpen, Search] as const;

const Documents: React.FC = () => {
  const { t } = useTranslation('work-documents');

  const searchResults = t('demoSection.results', { returnObjects: true }) as Array<{
    title: string;
    snippet: string;
  }>;

  const benefitCards = (t('benefitCards', { returnObjects: true }) as Array<{
    title: string;
    desc: string;
  }>).map((card, i) => ({ ...card, icon: benefitCardIcons[i] }));

  const techItems = t('techItems', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* 1. Hero */}
          <motion.div {...fadeUp(0)} className="text-center mb-20">
            <div className="inline-block px-4 py-2 bg-cyan-500/10 text-cyan-700 rounded-full text-sm font-medium mb-6">
              {t('badge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-tight">
              {t('hero.title_part1')}{' '}
              <span className="relative inline-block">
                <span className="relative z-10">{t('hero.title_part2')}</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.6, ease: 'circOut' }}
                  className="absolute bottom-2 left-0 right-0 h-3 bg-cyan-300/40 origin-left -z-0 rounded-sm"
                />
              </span>
              .
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              {t('hero.description')}
            </p>
          </motion.div>

          {/* 2. Mock demo — document editor + search */}
          <motion.div {...fadeUp(0.2)} className="mb-20">
            <h2 className="text-2xl font-serif text-slate-900 text-center mb-6">
              {t('demoSection.heading')}
            </h2>

            {/* Editor mockup */}
            <div className="bg-white border border-cyan-200 rounded-2xl p-6 md:p-8 shadow-lg max-w-2xl mx-auto mb-6">
              {/* Title */}
              <div className="text-lg font-semibold text-slate-900 mb-4">
                {t('demoSection.editorTitle')}
              </div>

              {/* Toolbar */}
              <div className="flex items-center gap-1 border border-slate-200 rounded-lg px-3 py-2 mb-5 bg-slate-50 text-sm text-slate-500 overflow-x-auto">
                <span className="font-bold px-2 py-0.5 hover:bg-slate-200 rounded cursor-default">B</span>
                <span className="italic px-2 py-0.5 hover:bg-slate-200 rounded cursor-default">I</span>
                <span className="underline px-2 py-0.5 hover:bg-slate-200 rounded cursor-default">U</span>
                <span className="border-l border-slate-300 mx-1 h-4" />
                <span className="px-2 py-0.5 hover:bg-slate-200 rounded cursor-default text-xs font-semibold">H1</span>
                <span className="px-2 py-0.5 hover:bg-slate-200 rounded cursor-default text-xs font-semibold">H2</span>
                <span className="border-l border-slate-300 mx-1 h-4" />
                <span className="px-2 py-0.5 hover:bg-slate-200 rounded cursor-default">&#8226;</span>
                <span className="px-2 py-0.5 hover:bg-slate-200 rounded cursor-default">1.</span>
              </div>

              {/* Paragraph placeholder blocks */}
              <div className="space-y-3 mb-5">
                <div className="h-3 bg-slate-200 rounded-full w-full" />
                <div className="h-3 bg-slate-200 rounded-full w-5/6" />
                <div className="h-3 bg-slate-100 rounded-full w-full" />
                <div className="h-3 bg-slate-100 rounded-full w-4/6" />
                <div className="h-3 bg-slate-200 rounded-full w-full" />
                <div className="h-3 bg-slate-200 rounded-full w-3/4" />
              </div>

              {/* AI assist pill */}
              <div className="flex justify-end">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-full text-xs font-medium border border-cyan-200">
                  <Pen size={12} />
                  {t('demoSection.aiAssist')}
                </span>
              </div>
            </div>

            {/* Search bar + results */}
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-3 bg-white shadow-sm mb-4">
                <Search size={18} className="text-slate-400 flex-shrink-0" />
                <span className="text-slate-700 text-sm">{t('demoSection.searchQuery')}</span>
                <span className="ml-auto text-xs text-slate-400">{t('demoSection.searchResults')}</span>
              </div>

              <div className="space-y-3">
                {searchResults.map((result, i) => (
                  <div key={i} className="border border-slate-100 rounded-lg px-4 py-3 bg-slate-50">
                    <p className="text-sm font-medium text-slate-800">{result.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{result.snippet}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 3. Three benefit cards */}
          <motion.div {...fadeUp(0.3)} className="grid md:grid-cols-3 gap-5 mb-20">
            {benefitCards.map((card) => (
              <div key={card.title} className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center mb-4">
                  <card.icon size={20} className="text-cyan-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{card.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* 4. Scenario callout */}
          <motion.div
            {...fadeUp(0.4)}
            className="bg-slate-900 text-white rounded-3xl p-8 md:p-10 mb-20"
          >
            <p className="text-lg md:text-xl leading-relaxed text-slate-200">
              {t('scenario.body')}
            </p>
            <p className="text-lg md:text-xl font-semibold text-white mt-6">
              {t('scenario.closing')}
            </p>
          </motion.div>

          {/* 5. Tech strip */}
          <motion.div {...fadeUp(0.5)} className="mb-20">
            <div className="flex flex-wrap justify-center gap-3">
              {techItems.map((label) => (
                <span
                  key={label}
                  className="px-4 py-2 bg-cyan-50 text-cyan-700 rounded-full text-sm font-medium border border-cyan-200"
                >
                  {label}
                </span>
              ))}
            </div>
          </motion.div>

          {/* 6. CTA */}
          <motion.div {...fadeUp(0.6)} className="text-center">
            <p className="text-xl md:text-2xl font-serif italic text-slate-700 mb-8">
              {t('cta.tagline')}
            </p>
            <a href="/#pricing">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-slate-900 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                {t('cta.button')}
              </motion.button>
            </a>
          </motion.div>

        </div>
      </main>
    </div>
  );
};

export default Documents;
