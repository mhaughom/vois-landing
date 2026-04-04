import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { useTranslation } from 'react-i18next';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const OneAssistant: React.FC = () => {
  const { t } = useTranslation('philosophy-one-assistant');

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">{t('category')}</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-4 leading-tight">
              {t('title')}
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed mb-16">
              {t('tagline')}
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-slate prose-lg max-w-none"
          >
            {/* Image floated right on desktop, full width on mobile */}
            <motion.img
              src="/philosophy/one-assistant.jpg"
              alt={t('heroAlt')}
              className="w-full md:w-[40%] md:float-right md:ml-8 md:mb-4 rounded-2xl not-prose mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            />

            <h2 className="text-2xl font-serif text-slate-900 mt-0">{t('section1.heading')}</h2>
            <p>{t('section1.body')}</p>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">{t('section2.heading')}</h2>
            <p>
              <strong>&ldquo;What&rsquo;s my history with Acme Corp?&rdquo;</strong> &mdash; VOIS searches emails, meeting transcripts, voice recordings, CRM notes, invoices, and project files. In two seconds, a unified timeline appears. 14 emails, 3 meetings with transcripts, last invoice paid Feb 12, active project at 68%. Try doing that across five separate apps.
            </p>
            <p>
              <strong>&ldquo;Reply to Sarah and tell her Thursday works.&rdquo;</strong> &mdash; One sentence in. VOIS knows who Sarah is (CRM), what she asked about (inbox), that Thursday is open (calendar), and how the plumber usually writes (sent history). A complete, personalized email appears as a preview card. Nothing sends without the Airlock.
            </p>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">{t('section3.heading')}</h2>
            <p>{t('section3.body')}</p>

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
            <a href="/philosophy/everything-in-one-place" className="group flex items-center gap-3">
              <ArrowLeft size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              <div>
                <p className="text-sm text-slate-400 mb-1">{t('nav.prevLabel')}</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">{t('nav.prevTitle')}</p>
              </div>
            </a>
            <a href="/philosophy/built-for-teams" className="group flex items-center gap-3 text-right">
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

export default OneAssistant;
