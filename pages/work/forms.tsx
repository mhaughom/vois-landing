import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar';
import {
  ArrowLeft,
  FormInput,
  Keyboard,
  MessageSquare,
  Mic,
  Users,
  GitBranch,
  Globe,
  ChevronDown,
} from 'lucide-react';

/* ── animation helpers ─────────────────────────────────────────────────── */

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

/* ── component ─────────────────────────────────────────────────────────── */

const Forms: React.FC = () => {
  const { t } = useTranslation('work-forms');

  const benefits = [
    {
      icon: Users,
      title: t('benefits.crm.title'),
      desc: t('benefits.crm.desc'),
    },
    {
      icon: GitBranch,
      title: t('benefits.routing.title'),
      desc: t('benefits.routing.desc'),
    },
    {
      icon: Globe,
      title: t('benefits.embed.title'),
      desc: t('benefits.embed.desc'),
    },
  ];

  const techItems = t('techStrip', { returnObjects: true }) as string[];
  const serviceOptions = t('mockForm.serviceOptions', { returnObjects: true }) as string[];
  const budgetOptions = t('mockForm.budgetOptions', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ─── Content ─── */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ━━━ 1. Hero ━━━ */}
          <motion.section {...fadeUp()} className="max-w-3xl mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-700 rounded-full text-sm font-medium mb-6">
              <FormInput size={14} />
              {t('badge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-[1.1]">
              {t('hero.title').split('\n').map((line, i, arr) => (
                <React.Fragment key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </React.Fragment>
              ))}
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-2xl">
              {t('hero.description')}
            </p>
          </motion.section>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mb-16">
            <p className="text-lg text-slate-600 leading-relaxed">
              {t('body')}
            </p>
          </motion.div>

          {/* ━━━ 2. Mock form ━━━ */}
          <motion.section {...fadeUp(0.15)} className="mb-20">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl max-w-xl mx-auto">
              {/* Form header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">{t('mockForm.title')}</h2>
                <span className="px-3 py-1 bg-cyan-500/10 text-cyan-700 rounded-full text-xs font-medium">
                  {t('mockForm.badge')}
                </span>
              </div>

              {/* Fields */}
              <div className="space-y-4 mb-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('mockForm.fields.fullName')}</label>
                  <div className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 flex items-center">
                    <span className="text-sm text-slate-400">{t('mockForm.fields.fullNamePlaceholder')}</span>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('mockForm.fields.email')}</label>
                  <div className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 flex items-center">
                    <span className="text-sm text-slate-400">{t('mockForm.fields.emailPlaceholder')}</span>
                  </div>
                </div>

                {/* Service Needed — Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('mockForm.fields.serviceNeeded')}</label>
                  <div className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 flex items-center justify-between">
                    <span className="text-sm text-slate-400">{t('mockForm.fields.servicePlaceholder')}</span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </div>
                  <div className="flex gap-1.5 mt-1.5">
                    {serviceOptions.map((opt) => (
                      <span key={opt} className="text-[10px] text-slate-400 bg-slate-100 rounded px-1.5 py-0.5">
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Budget Range — Select */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('mockForm.fields.budgetRange')}</label>
                  <div className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 flex items-center justify-between">
                    <span className="text-sm text-slate-400">{t('mockForm.fields.budgetPlaceholder')}</span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </div>
                  <div className="flex gap-1.5 mt-1.5">
                    {budgetOptions.map((opt) => (
                      <span key={opt} className="text-[10px] text-slate-400 bg-slate-100 rounded px-1.5 py-0.5">
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Describe your project — Textarea */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('mockForm.fields.projectDescription')}</label>
                  <div className="w-full h-24 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                    <span className="text-sm text-slate-400">{t('mockForm.fields.projectPlaceholder')}</span>
                  </div>
                </div>
              </div>

              {/* Submit + mode icons */}
              <div className="flex items-center justify-between">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2.5 bg-cyan-600 text-white rounded-full text-sm font-semibold shadow-lg shadow-cyan-600/20 hover:bg-cyan-700 transition-colors"
                >
                  {t('mockForm.submit')}
                </motion.button>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center" title="Form mode">
                      <Keyboard size={13} />
                    </div>
                    <span className="text-[10px] font-medium">{t('mockForm.modes.form')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center" title="Chat mode">
                      <MessageSquare size={13} />
                    </div>
                    <span className="text-[10px] font-medium">{t('mockForm.modes.chat')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center" title="Voice mode">
                      <Mic size={13} />
                    </div>
                    <span className="text-[10px] font-medium">{t('mockForm.modes.voice')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Caption below form */}
            <p className="text-sm text-slate-500 mt-6 leading-relaxed text-center max-w-lg mx-auto">
              {t('mockForm.caption')}
            </p>
          </motion.section>

          {/* ━━━ 3. Three benefit cards ━━━ */}
          <motion.section {...fadeUp(0.25)} className="mb-20">
            <div className="grid md:grid-cols-3 gap-4">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="bg-white border border-slate-200 rounded-2xl p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <b.icon size={18} className="text-cyan-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">{b.title}</h3>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ━━━ 4. Scenario callout ━━━ */}
          <motion.section {...fadeUp(0.35)} className="mb-20">
            <div className="bg-slate-950 rounded-3xl p-6 md:p-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-4">
                {t('scenario.label')}
              </p>
              <p className="text-slate-300 leading-relaxed text-base md:text-lg">
                {t('scenario.text')}
              </p>
            </div>
          </motion.section>

          {/* ━━━ 5. Tech strip ━━━ */}
          <motion.section {...fadeUp(0.45)} className="mb-20">
            <div className="bg-slate-950 rounded-2xl py-5 px-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
              {techItems.map((item, i) => (
                <React.Fragment key={item}>
                  {i > 0 && <span className="text-slate-600">&middot;</span>}
                  <span>{item}</span>
                </React.Fragment>
              ))}
            </div>
          </motion.section>

          {/* ━━━ 6. Closing CTA ━━━ */}
          <motion.section {...fadeUp(0.55)} className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-slate-900 mb-5 leading-tight">
              {t('closing.title').split('\n').map((line, i, arr) => (
                <React.Fragment key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </React.Fragment>
              ))}
            </h2>
            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 px-8 py-3.5 bg-cyan-600 text-white rounded-full font-medium text-sm shadow-lg shadow-cyan-600/20 hover:bg-cyan-700 transition-colors"
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

export default Forms;
