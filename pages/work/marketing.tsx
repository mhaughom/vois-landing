import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../../components/Navbar';
import {
  ArrowLeft,
  Megaphone,
  Radar,
  MousePointerClick,
  Tags,
} from 'lucide-react';

/* ── animation helpers ─────────────────────────────────────────────────── */

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

const benefitIcons = [Radar, MousePointerClick, Tags];

/* ── component ─────────────────────────────────────────────────────────── */

const Marketing: React.FC = () => {
  const { t } = useTranslation('work-marketing');

  const benefits = t('benefits', { returnObjects: true }) as Array<{
    title: string;
    desc: string;
  }>;

  const techItems = t('techItems', { returnObjects: true }) as string[];

  const activeCampaigns = t('dashboard.activeCampaigns.campaigns', { returnObjects: true }) as string[];

  const opportunityItems = t('dashboard.opportunities.items', { returnObjects: true }) as Array<{
    tag: string;
    text: string;
  }>;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ─── Content ─── */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ━━━ 1. Hero ━━━ */}
          <motion.section {...fadeUp()} className="max-w-3xl mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-700 rounded-full text-sm font-medium mb-6">
              <Megaphone size={14} />
              {t('badge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-[1.1]">
              {t('hero.title')}
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

          {/* ━━━ 2. Mock dashboard ━━━ */}
          <motion.section {...fadeUp(0.15)} className="mb-20">
            <div className="bg-rose-50/50 rounded-3xl p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Top-left: Active Campaigns */}
                <div className="bg-white rounded-2xl p-5 border border-rose-100/60">
                  <p className="text-xs font-semibold uppercase tracking-widest text-rose-600 mb-3">
                    {t('dashboard.activeCampaigns.label')}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mb-3">{t('dashboard.activeCampaigns.count')}</p>
                  <div className="space-y-1.5">
                    {activeCampaigns.map((name) => (
                      <div
                        key={name}
                        className="flex items-center gap-2 text-sm text-slate-600"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        {name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top-right: Pipeline Attribution */}
                <div className="bg-white rounded-2xl p-5 border border-rose-100/60">
                  <p className="text-xs font-semibold uppercase tracking-widest text-rose-600 mb-3">
                    {t('dashboard.attribution.label')}
                  </p>
                  <p className="text-lg font-bold text-slate-900 mb-3">{t('dashboard.attribution.revenue')}</p>
                  <div className="w-full h-3 rounded-full overflow-hidden flex">
                    <div className="bg-rose-500 h-full" style={{ width: '45%' }} />
                    <div className="bg-rose-300 h-full" style={{ width: '30%' }} />
                    <div className="bg-rose-200 h-full" style={{ width: '25%' }} />
                  </div>
                  <div className="flex justify-between mt-2 text-[11px] text-slate-500">
                    <span>{t('dashboard.attribution.channels.0.name')}</span>
                    <span>{t('dashboard.attribution.channels.1.name')}</span>
                    <span>{t('dashboard.attribution.channels.2.name')}</span>
                  </div>
                </div>

                {/* Bottom-left: AI Opportunities */}
                <div className="bg-white rounded-2xl p-5 border border-rose-100/60">
                  <p className="text-xs font-semibold uppercase tracking-widest text-rose-600 mb-3">
                    {t('dashboard.opportunities.label')}
                  </p>
                  <div className="space-y-3">
                    {opportunityItems.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className={`shrink-0 mt-0.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-full ${
                          i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {item.tag}
                        </span>
                        <p className="text-sm text-slate-700 leading-snug">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom-right: Creative Pipeline */}
                <div className="bg-white rounded-2xl p-5 border border-rose-100/60">
                  <p className="text-xs font-semibold uppercase tracking-widest text-rose-600 mb-3">
                    {t('dashboard.creative.label')}
                  </p>
                  <p className="text-lg font-bold text-slate-900 mb-3">{t('dashboard.creative.summary')}</p>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      {t('dashboard.creative.approved')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      {t('dashboard.creative.pending')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      {t('dashboard.creative.revision')}
                    </span>
                  </div>
                </div>

              </div>

              <p className="text-sm text-slate-500 mt-6 leading-relaxed">
                {t('dashboard.caption')}
              </p>
            </div>
          </motion.section>

          {/* ━━━ 3. Three benefit cards ━━━ */}
          <motion.section {...fadeUp(0.25)} className="mb-20">
            <div className="grid md:grid-cols-3 gap-4">
              {benefits.map((b, i) => {
                const Icon = benefitIcons[i];
                return (
                  <div
                    key={b.title}
                    className="bg-white border border-slate-200 rounded-2xl p-5"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-9 h-9 bg-rose-100 rounded-lg flex items-center justify-center">
                        <Icon size={18} className="text-rose-600" />
                      </div>
                      <h3 className="font-semibold text-slate-900">{b.title}</h3>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
                  </div>
                );
              })}
            </div>
          </motion.section>

          {/* ━━━ 4. Scenario callout ━━━ */}
          <motion.section {...fadeUp(0.35)} className="mb-20">
            <div className="bg-slate-900 rounded-3xl p-8 text-white">
              <p className="text-lg md:text-xl leading-relaxed text-slate-200">
                {t('scenario')}
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
              {t('cta.heading')}
            </h2>
            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 px-8 py-3.5 bg-rose-600 text-white rounded-full font-medium text-sm shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-colors"
              >
                {t('cta.button')}
              </motion.button>
            </a>
          </motion.section>

        </div>
      </main>
    </div>
  );
};

export default Marketing;
