import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../../components/Navbar';
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  Check,
  Shield,
  Mail,
  Lock,
} from 'lucide-react';

/* -- animation helpers --------------------------------------------------- */

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

const benefitIcons = [Lock, Mail, Shield];

/* -- component ----------------------------------------------------------- */

const Domains: React.FC = () => {
  const { t } = useTranslation('work-domains');

  const benefits = t('benefits', { returnObjects: true }) as Array<{
    title: string;
    desc: string;
  }>;

  const techItems = t('techItems', { returnObjects: true }) as string[];

  const domainRows = t('mockCard.rows', { returnObjects: true }) as Array<{
    label: string;
    value: string;
  }>;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* --- Content --- */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* 1. Hero */}
          <motion.section {...fadeUp()} className="max-w-3xl mx-auto text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-500/10 text-slate-700 rounded-full text-sm font-medium mb-6">
              <Globe size={14} />
              {t('badge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-[1.1]">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
              {t('hero.description')}
            </p>
          </motion.section>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mx-auto mb-16 text-center">
            <p className="text-lg text-slate-600 leading-relaxed">
              {t('body')}
            </p>
          </motion.div>

          {/* 2. Mock domain setup card */}
          <motion.section {...fadeUp(0.1)} className="mb-20">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl max-w-lg mx-auto">
              {/* Domain name */}
              <p className="font-mono text-lg text-slate-900 font-semibold mb-5">
                {t('mockCard.domain')}
              </p>

              {/* Status badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-200">
                  {t('mockCard.badges.domain')} <Check size={12} /> {t('mockCard.badges.connected')}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-200">
                  {t('mockCard.badges.ssl')} <Check size={12} /> {t('mockCard.badges.sslActive')}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-200">
                  {t('mockCard.badges.email')} <Check size={12} /> {t('mockCard.badges.emailConfigured')}
                </span>
              </div>

              {/* Configuration list */}
              <div className="space-y-3 mb-6">
                {domainRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-green-600" />
                    </div>
                    <span className="text-slate-400 w-16 flex-shrink-0">{row.label}</span>
                    <span className="text-slate-400">&rarr;</span>
                    <span className="font-mono text-slate-700">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-100 mb-4" />

              {/* Annotation */}
              <p className="text-xs text-slate-400 leading-relaxed">
                {t('mockCard.annotation')}
              </p>
            </div>
          </motion.section>

          {/* 3. Three benefit cards */}
          <motion.section {...fadeUp(0.2)} className="mb-20">
            <div className="grid md:grid-cols-3 gap-5">
              {benefits.map((b, i) => {
                const Icon = benefitIcons[i];
                return (
                  <div
                    key={b.title}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
                  >
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-4 border border-slate-100">
                      <Icon size={20} className="text-slate-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-3">{b.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
                  </div>
                );
              })}
            </div>
          </motion.section>

          {/* 4. Before / After */}
          <motion.section {...fadeUp(0.3)} className="mb-20">
            <div className="grid md:grid-cols-2 gap-5">
              {/* Without HABOS */}
              <div className="bg-slate-100 rounded-2xl p-6 md:p-8">
                <h3 className="font-semibold text-slate-700 mb-4">{t('comparison.without.heading')}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  {t('comparison.without.text')}
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-200 text-slate-600 rounded-full text-xs font-semibold">
                  {t('comparison.without.badge')}
                </div>
              </div>

              {/* With HABOS */}
              <div className="bg-slate-50 rounded-2xl p-6 md:p-8 border border-slate-300">
                <h3 className="font-semibold text-slate-900 mb-4">{t('comparison.with.heading')}</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {t('comparison.with.text')}
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-200/60 text-slate-700 rounded-full text-xs font-semibold">
                  {t('comparison.with.badge')}
                </div>
              </div>
            </div>
          </motion.section>

          {/* 5. Tech strip */}
          <motion.section {...fadeUp(0.4)} className="mb-20">
            <div className="bg-slate-100 border border-slate-200 rounded-2xl px-8 py-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-700">
              {techItems.map((item, i) => (
                <React.Fragment key={item}>
                  {i > 0 && <span className="text-slate-300">&middot;</span>}
                  <span>{item}</span>
                </React.Fragment>
              ))}
            </div>
          </motion.section>

          {/* 6. Closing CTA */}
          <motion.section {...fadeUp(0.5)} className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-slate-900 mb-5 leading-tight">
              {t('cta.heading')}
            </h2>
            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-full font-medium text-sm shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-colors"
              >
                {t('cta.button')}
                <ArrowRight size={18} />
              </motion.button>
            </a>
          </motion.section>

        </div>
      </main>
    </div>
  );
};

export default Domains;
