import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { Navbar } from '@li/shared/components/Navbar';
import { useTranslation } from 'react-i18next';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const Assistant: React.FC = () => {
  const { t } = useTranslation('work-assistant');
  const capabilities = t('capabilities', { returnObjects: true }) as string[];
  const contextItems = t('context.items', { returnObjects: true }) as string[];
  const heroPills = t('heroPills', { returnObjects: true }) as string[];
  const savingsItems = t('savings.items', { returnObjects: true }) as Array<{ stat: string; text: string }>;

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">

          {/* ── 1. Hero ── */}
          <motion.section {...fadeUp} className="mb-20">
            <div className="inline-block px-4 py-2 bg-violet-500/10 text-violet-700 rounded-full text-sm font-medium mb-6">
              {t('badge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-5 max-w-xl">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mb-8">
              {t('hero.description')}
            </p>
            <div className="flex flex-wrap gap-3">
              {heroPills.map((label) => (
                <span
                  key={label}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm font-medium"
                >
                  {label}
                </span>
              ))}
            </div>
          </motion.section>

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

          {/* ── 2. Mock Conversation ── */}
          <motion.section
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-slate-50 rounded-3xl p-6 md:p-8 mb-20"
          >
            <div className="space-y-4">
              {/* User bubble */}
              <div className="flex justify-end">
                <div className="bg-violet-600 text-white rounded-2xl px-5 py-3 max-w-md text-[15px] leading-relaxed">
                  {t('mockConversation.userMessage')}
                </div>
              </div>

              {/* Assistant bubble */}
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 max-w-md text-[15px] leading-relaxed text-slate-700">
                  {t('mockConversation.assistantMessage')}
                </div>
              </div>

              {/* Email draft card */}
              <div className="ml-4 md:ml-12">
                <div className="bg-white border border-violet-200 rounded-xl p-4 max-w-sm">
                  <div className="text-xs text-slate-400 mb-1">{t('mockConversation.emailTo')}</div>
                  <div className="text-sm font-semibold text-slate-800 mb-2">
                    {t('mockConversation.emailSubject')}
                  </div>
                  <div className="text-sm text-slate-500 leading-relaxed">
                    {t('mockConversation.emailBody')}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-slate-400 mt-6">
              {t('mockConversation.footer')}
            </p>
          </motion.section>

          {/* ── 3. What This Saves You ── */}
          <motion.section
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-20 space-y-4"
          >
            <h2 className="text-2xl font-serif font-medium text-slate-900 mb-6">
              {t('savings.title')}
            </h2>

            {savingsItems.map(({ stat, text }) => (
              <div
                key={stat}
                className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 bg-white border border-slate-200 rounded-2xl p-6"
              >
                <div className="text-3xl md:text-4xl font-serif font-medium text-violet-600 whitespace-nowrap md:w-48 flex-shrink-0">
                  {stat}
                </div>
                <div className="text-slate-600 leading-relaxed">{text}</div>
              </div>
            ))}
          </motion.section>

          {/* ── 4. Capabilities Strip ── */}
          <motion.section
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-20"
          >
            <div className="flex flex-wrap gap-3 justify-center">
              {capabilities.map((cap) => (
                <span
                  key={cap}
                  className="bg-violet-50 text-violet-700 rounded-full px-4 py-2 text-sm"
                >
                  {cap}
                </span>
              ))}
            </div>
          </motion.section>

          {/* ── 5. Always Knows Your Context ── */}
          <motion.section
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mb-24 grid md:grid-cols-2 gap-10 items-start"
          >
            <div>
              <h2 className="text-2xl font-serif font-medium text-slate-900 mb-4">
                {t('context.title')}
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {t('context.description')}
              </p>
            </div>

            <ul className="space-y-3">
              {contextItems.map((item) => (
                <li key={item} className="flex items-center gap-3 text-slate-700">
                  <Check size={18} className="text-violet-600 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.section>

          {/* ── 6. Closing ── */}
          <motion.section
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center"
          >
            <p className="text-lg text-slate-400 italic mb-8">
              {t('closing.tagline')}
            </p>
            <a href="/work#pricing">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-slate-900 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                {t('closing.cta')}
              </motion.button>
            </a>
          </motion.section>

        </div>
      </main>
    </div>
  );
};

export default Assistant;
