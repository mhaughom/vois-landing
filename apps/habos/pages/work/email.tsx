import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, MessageSquare, Zap, Layers } from 'lucide-react';
import MailDemo from './features/MailDemo';
import { Navbar } from '@li/shared/components/Navbar';
import { Footer } from '../../components/Footer';

const Email: React.FC = () => {
  const { t } = useTranslation('work-email');

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-2 bg-sky-100 text-sky-700 rounded-full text-sm font-medium mb-6">
              {t('badge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              {t('hero.description')}
            </p>
          </motion.div>

          {/* Differentiator Callout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative mb-16 rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-sky-50/60 p-8 md:p-10 shadow-sm overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-sky-500 to-sky-400" />
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-sky-600/10 flex items-center justify-center">
                <Layers size={18} className="text-sky-700" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-700">
                {t('differentiator.eyebrow')}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-medium text-slate-900 mb-4 leading-tight">
              {t('differentiator.headline')}
            </h2>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl mb-6">
              {t('differentiator.subline')}
            </p>
            <div className="flex flex-wrap gap-2">
              {['classify', 'denoise', 'prioritize', 'draft', 'surface'].map((key, i) => (
                <React.Fragment key={key}>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white border border-sky-200 text-sm font-medium text-sky-700">
                    <span className="text-xs text-sky-400 mr-1.5">{i + 1}</span>
                    {t(`differentiator.pills.${key}`)}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mx-auto mb-16"><p className="text-lg text-slate-600 leading-relaxed">{t('body')}</p></motion.div>

          {/* Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-20 rounded-3xl border border-slate-200 overflow-hidden shadow-lg bg-white"
          >
            <div className="p-2 md:p-4">
              <MailDemo />
            </div>
          </motion.div>

          {/* Mock Voice Email Session */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-sky-50/50 rounded-3xl p-8 mb-16"
          >
            <div className="max-w-xl mx-auto space-y-4">
              {/* User bubble */}
              <div className="flex justify-end">
                <div className="bg-sky-600 text-white rounded-2xl px-5 py-3 max-w-sm">
                  <p className="text-sm">{t('conversation.userAsk')}</p>
                </div>
              </div>

              {/* AI bubble */}
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 max-w-sm">
                  <p className="text-sm text-slate-700">
                    {t('conversation.aiSummary')}
                  </p>
                </div>
              </div>

              {/* User bubble */}
              <div className="flex justify-end">
                <div className="bg-sky-600 text-white rounded-2xl px-5 py-3 max-w-sm">
                  <p className="text-sm">{t('conversation.userReply')}</p>
                </div>
              </div>

              {/* AI bubble with draft cards */}
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 max-w-sm">
                  <p className="text-sm text-slate-700 mb-3">{t('conversation.aiDraftsIntro')}</p>
                  <div className="space-y-2">
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-slate-500 mb-1">{t('conversation.draft1.label')}</p>
                      <p className="text-sm text-slate-700">
                        {t('conversation.draft1.text')}
                      </p>
                    </div>
                    <div className="bg-white border border-sky-300 rounded-lg p-3 ring-1 ring-sky-200">
                      <p className="text-xs font-semibold text-sky-600 mb-1">{t('conversation.draft2.label')}</p>
                      <p className="text-sm text-slate-700">
                        {t('conversation.draft2.text')}
                      </p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-slate-500 mb-1">{t('conversation.draft3.label')}</p>
                      <p className="text-sm text-slate-700">
                        {t('conversation.draft3.text')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* User bubble */}
              <div className="flex justify-end">
                <div className="bg-sky-600 text-white rounded-2xl px-5 py-3 max-w-sm">
                  <p className="text-sm">{t('conversation.userSend')}</p>
                </div>
              </div>

              {/* Confirmation text */}
              <p className="text-center text-sm text-slate-400 pt-2">
                {t('conversation.confirmation')}
              </p>
            </div>
          </motion.div>

          {/* Three Benefit Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white border border-slate-200 rounded-2xl p-5"
            >
              <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
                <Clock size={20} className="text-sky-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {t('benefits.time.title')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('benefits.time.description')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white border border-slate-200 rounded-2xl p-5"
            >
              <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
                <MessageSquare size={20} className="text-sky-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {t('benefits.tone.title')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('benefits.tone.description')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white border border-slate-200 rounded-2xl p-5"
            >
              <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
                <Zap size={20} className="text-sky-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {t('benefits.actions.title')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('benefits.actions.description')}
              </p>
            </motion.div>
          </div>

          {/* Scenario Callout */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-slate-900 text-white rounded-3xl p-8 mb-16"
          >
            <p className="text-lg md:text-xl leading-relaxed text-slate-200">
              {t('scenario')}
            </p>
          </motion.div>

          {/* Integration Strip */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-sky-50 border border-sky-200 rounded-2xl px-8 py-4 mb-16"
          >
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <span className="text-sm font-medium text-sky-700">{t('integrations.gmail')}</span>
              <span className="text-sky-300">&middot;</span>
              <span className="text-sm font-medium text-sky-700">{t('integrations.outlook')}</span>
              <span className="text-sky-300">&middot;</span>
              <span className="text-sm font-medium text-sky-700">{t('integrations.workspace')}</span>
              <span className="text-sky-300">&middot;</span>
              <span className="text-sm font-medium text-sky-700">{t('integrations.unified')}</span>
              <span className="text-sky-300">&middot;</span>
              <span className="text-sm font-medium text-sky-700">{t('integrations.actions')}</span>
            </div>
          </motion.div>

          {/* Closing */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center"
          >
            <p className="text-xl md:text-2xl font-serif text-slate-900 mb-8 max-w-2xl mx-auto">
              {t('closing.tagline')}
            </p>
            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-slate-900 text-white rounded-full font-medium text-base shadow-lg hover:bg-slate-800 transition-colors"
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

export default Email;
