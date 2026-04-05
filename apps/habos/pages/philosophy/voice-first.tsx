import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Navbar } from '@li/shared/components/Navbar';
import { useTranslation } from 'react-i18next';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const actionColors = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'];

const VoiceFirst: React.FC = () => {
  const { t } = useTranslation('philosophy-voice-first');
  const voiceNoteActions = t('voiceNoteActions', { returnObjects: true }) as Array<{ label: string; text: string }>;
  const listItems = t('section3.items', { returnObjects: true }) as Array<{ label: string; body: string }>;

  return (
    <div className="min-h-screen">
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
            <p>{t('section2.body1')}</p>
            <p>{t('section2.body2')}</p>

            {/* Example scenario */}
            <div className="not-prose my-12 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs font-medium text-slate-500">{t('voiceNoteLabel')}</span>
              </div>
              <div className="p-6 md:p-8">
                <p className="text-slate-600 italic leading-relaxed text-base mb-6">
                  {t('voiceNoteText')}
                </p>
                <div className="grid gap-3">
                  {voiceNoteActions.map((item, i) => (
                    <div key={item.label} className="flex items-start gap-3 bg-white rounded-xl px-4 py-3 border border-slate-100">
                      <span className="mt-0.5 w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: actionColors[i] }} />
                      <div>
                        <span className="text-sm font-semibold text-slate-900">{item.label}</span>
                        <span className="text-sm text-slate-500 ml-2">{item.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-400 mt-4">{t('voiceNoteFooter')}</p>
              </div>
            </div>

            {/* Mid-content image placeholder */}
            <div className="not-prose w-full aspect-[16/9] rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100/60 flex items-center justify-center my-12">
              <span className="text-sm text-amber-300 font-medium">{t('voiceSurfacesPlaceholder')}</span>
            </div>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">{t('section3.heading')}</h2>
            <p>{t('section3.intro')}</p>
            <ul>
              {listItems.map((item) => (
                <li key={item.label}><strong>{item.label}</strong> — {item.body}</li>
              ))}
            </ul>

            {/* Mid-content image placeholder */}
            <div className="not-prose w-full aspect-[16/9] rounded-2xl bg-gradient-to-br from-indigo-50 to-sky-50 border border-indigo-100/60 flex items-center justify-center my-12">
              <span className="text-sm text-indigo-300 font-medium">{t('voiceFlowPlaceholder')}</span>
            </div>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">{t('section4.heading')}</h2>
            <p>{t('section4.body1')}</p>
            <p>{t('section4.body2')}</p>

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
            <a href="/philosophy/one-brain" className="group flex items-center gap-3">
              <ArrowLeft size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              <div>
                <p className="text-sm text-slate-400 mb-1">{t('nav.prevLabel')}</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">{t('nav.prevTitle')}</p>
              </div>
            </a>
            <a href="/philosophy/advisors-that-disagree" className="group flex items-center gap-3 text-right">
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

export default VoiceFirst;
