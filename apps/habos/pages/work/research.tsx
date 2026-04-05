import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mic, Brain, FolderOpen, Search, BookOpen, MessageSquare, Sparkles, Check } from 'lucide-react';
import ResearchDemo from './features/ResearchDemo';
import { Navbar } from '@li/shared/components/Navbar';
import { useTranslation } from 'react-i18next';
import { Footer } from '../../components/Footer';

const benefitCardIcons = [
  <Mic size={20} className="text-purple-600" />,
  <Brain size={20} className="text-purple-600" />,
  <FolderOpen size={20} className="text-purple-600" />,
];

const Research: React.FC = () => {
  const { t } = useTranslation('work-research');
  const answerPills = t('flow.answerPills', { returnObjects: true }) as string[];
  const findings = t('flow.result.findings', { returnObjects: true }) as string[];
  const benefitCards = t('benefitCards', { returnObjects: true }) as Array<{ title: string; body: string }>;
  const techStrip = t('techStrip', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Main Content */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">

          {/* 1. Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-2 bg-purple-500/10 text-purple-700 rounded-full text-sm font-medium mb-6">
              {t('badge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              {t('hero.description')}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mx-auto mb-16"><p className="text-lg text-slate-600 leading-relaxed">{t('intro')}</p></motion.div>

          {/* 2. Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-20 rounded-3xl border border-slate-200 overflow-hidden shadow-lg bg-white"
          >
            <div className="p-2 md:p-4">
              <ResearchDemo />
            </div>
          </motion.div>

          {/* 3. Mock Research Flow */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-purple-50/50 rounded-3xl p-6 md:p-8 mb-20"
          >
            <h3 className="text-sm font-medium text-purple-600 uppercase tracking-wider mb-6 text-center">{t('flow.label')}</h3>

            {/* User question — right aligned */}
            <div className="flex justify-end mb-4">
              <div className="max-w-sm bg-purple-600 text-white rounded-2xl rounded-br-md px-5 py-3 text-sm leading-relaxed shadow-sm">
                {t('flow.userQuestion')}
              </div>
            </div>

            {/* AI clarification — left aligned */}
            <div className="flex justify-start mb-2">
              <div className="max-w-md bg-white border border-slate-200 rounded-2xl rounded-bl-md px-5 py-4 text-sm text-slate-700 leading-relaxed shadow-sm">
                <p className="mb-3">{t('flow.clarifyIntro')}</p>
                <p className="mb-1"><span className="font-semibold">1)</span> {t('flow.clarifyQ1')}</p>
                <p><span className="font-semibold">2)</span> {t('flow.clarifyQ2')}</p>
              </div>
            </div>

            {/* Answer pills */}
            <div className="flex justify-start gap-2 mb-6 ml-2">
              {answerPills.map((pill) => (
                <div key={pill} className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200 cursor-pointer hover:bg-purple-200 transition-colors flex items-center gap-1.5">
                  <Check size={12} /> {pill}
                </div>
              ))}
            </div>

            {/* Result card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 mt-4 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-purple-600 font-medium uppercase tracking-wider mb-1">{t('flow.result.label')}</p>
                  <h4 className="text-base font-semibold text-slate-900">{t('flow.result.title')}</h4>
                </div>
                <Sparkles size={18} className="text-purple-500 mt-1 flex-shrink-0" />
              </div>

              <ul className="space-y-2.5 mb-4">
                {findings.map((finding, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-purple-500 mt-0.5 flex-shrink-0">{i + 1}.</span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium flex items-center gap-1">
                  <BookOpen size={11} /> {t('flow.result.citations')}
                </span>
                <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
                  <Brain size={11} /> {t('flow.result.embeddedLabel')}
                </span>
              </div>
            </div>
          </motion.div>

          {/* 4. Three Benefit Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {benefitCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm"
              >
                <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  {benefitCardIcons[i]}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{card.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {card.body}
                </p>
              </motion.div>
            ))}
          </div>

          {/* 5. Tech Strip */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-slate-950 rounded-2xl px-6 py-5 mb-20 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          >
            {techStrip.map((label) => (
              <span key={label} className="text-sm text-slate-300 font-medium whitespace-nowrap">
                {label}
              </span>
            ))}
          </motion.div>

          {/* 6. Closing */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-slate-900 mb-4">
              {t('closing.title')}
            </h2>
            <a
              href="/#waitlist"
              className="inline-flex items-center gap-2 mt-6 px-8 py-3.5 bg-purple-600 text-white rounded-full font-medium text-sm hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20"
            >
              {t('closing.cta')}
            </a>
          </motion.div>

        </div>
      </main>
    <Footer />
    </div>
  );
};

export default Research;
