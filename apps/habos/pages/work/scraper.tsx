import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@li/shared/components/Navbar';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Layers,
  Paintbrush,
  KeyRound,
} from 'lucide-react';
import { Footer } from '../../components/Footer';

/* ── animation helpers ─────────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.10 } },
};

const staggerFast = {
  visible: { transition: { staggerChildren: 0.06 } },
};

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const benefitIcons = [Layers, Paintbrush, KeyRound];

/* ── page component ───────────────────────────────────────────────────── */

const Scraper: React.FC = () => {
  const { t } = useTranslation('work-scraper');

  const extractionRows = t('extraction.rows', { returnObjects: true }) as Array<{
    label: string;
    detail: string;
  }>;

  const benefits = t('benefits', { returnObjects: true }) as Array<{
    title: string;
    desc: string;
  }>;

  const techItems = t('techItems', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── Main ──────────────────────────────────────────────────────── */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ── 1. Hero ───────────────────────────────────────────────── */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="mb-20 max-w-3xl"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <span className="inline-block px-4 py-1.5 bg-orange-500/10 text-orange-700 rounded-full text-sm font-medium mb-6">
                {t('badge')}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6, ease: easeOutExpo }}
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-[1.1]"
            >
              {t('hero.title')}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-lg md:text-xl text-slate-500 max-w-2xl leading-relaxed"
            >
              {t('hero.description')}
            </motion.p>
          </motion.section>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mb-16">
            <p className="text-lg text-slate-600 leading-relaxed">
              {t('body')}
            </p>
          </motion.div>

          {/* ── 2. Mock Extraction Flow ───────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: easeOutExpo }}
            className="mb-20"
          >
            <div className="bg-orange-50/50 rounded-3xl p-6 md:p-8">
              {/* URL input bar */}
              <div className="bg-white rounded-xl border border-slate-200 px-5 py-3 flex items-center gap-3 mb-4 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-orange-400" />
                <span className="text-sm font-mono text-slate-700">{t('extraction.urlPlaceholder')}</span>
                <div className="ml-auto">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-full"
                  >
                    {t('extraction.extractingLabel')}
                  </motion.div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center my-3">
                <ChevronDown size={20} className="text-orange-400" />
              </div>

              {/* Extraction result rows */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerFast}
                className="space-y-1"
              >
                {extractionRows.map((row) => (
                  <motion.div
                    key={row.label}
                    variants={fadeUp}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-lg p-3 border border-slate-100 flex items-start gap-3"
                  >
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mt-0.5">
                      <Check size={12} className="text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-slate-800">{row.label}</span>
                      <span className="text-sm text-slate-500 ml-2">&mdash; {row.detail}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Confidence note */}
              <p className="mt-5 text-sm text-slate-500 leading-relaxed px-1">
                {t('extraction.confidenceNote')}
              </p>
            </div>
          </motion.section>

          {/* ── 3. Benefit Cards ──────────────────────────────────────── */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="mb-20"
          >
            <div className="grid md:grid-cols-3 gap-5">
              {benefits.map((b, i) => {
                const Icon = benefitIcons[i];
                return (
                  <motion.div
                    key={b.title}
                    variants={fadeUp}
                    transition={{ duration: 0.5, ease: easeOutExpo }}
                    className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-orange-200 hover:shadow-md transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-4">
                      <Icon size={18} className="text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{b.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* ── 4. Scenario Callout ───────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
            className="mb-20"
          >
            <div className="bg-slate-900 rounded-3xl p-8 md:p-10">
              <p className="text-lg md:text-xl text-slate-200 leading-relaxed">
                {t('scenario').replace(t('scenarioHighlight'), '')}{' '}
                <span className="text-white font-medium">{t('scenarioHighlight')}</span>
              </p>
            </div>
          </motion.section>

          {/* ── 5. Tech Strip ─────────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-20"
          >
            <div className="bg-slate-900 rounded-2xl px-6 py-5">
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                {techItems.map((item, i) => (
                  <span key={item} className="flex items-center gap-1.5 text-sm text-slate-300">
                    {i > 0 && <span className="text-slate-600 mr-1">&middot;</span>}
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </motion.section>

          {/* ── 6. Closing ────────────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-serif font-medium text-slate-900 mb-4">
              {t('cta.heading')}
            </h2>

            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="mt-6 inline-flex items-center gap-2 px-8 py-3 bg-slate-900 text-white text-sm font-medium rounded-full shadow-md hover:bg-slate-800 transition-colors"
              >
                {t('cta.button')}
                <ArrowRight size={16} />
              </motion.button>
            </a>
          </motion.section>
        </div>
      </main>
    <Footer />
    </div>
  );
};

export default Scraper;
