import React from 'react';
import { motion } from 'framer-motion';
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

/* ── benefit cards data ────────────────────────────────────────────────── */

const benefits = [
  {
    icon: Radar,
    title: 'AI opportunity discovery',
    desc: 'The system analyzes your market, competitors, and performance data to surface opportunities \u2014 trend shifts, competitor gaps, and reuse angles you\u2019d otherwise miss.',
  },
  {
    icon: MousePointerClick,
    title: 'Multi-touch attribution',
    desc: 'Anonymous visitor sessions tracked from first click through conversion. See which creative, campaign, and channel drove every lead, booking, and order.',
  },
  {
    icon: Tags,
    title: 'Offer orchestration',
    desc: 'Link products to campaigns with dynamic pricing \u2014 percent off, fixed price, bundles. Control where and when offers appear across all your marketing surfaces.',
  },
];

/* ── tech strip items ──────────────────────────────────────────────────── */

const techItems = [
  'Strategy anchoring',
  '9-dashboard command center',
  'Multi-touch attribution',
  'AI opportunity scoring',
  'Closed-loop revenue',
];

/* ── component ─────────────────────────────────────────────────────────── */

const Marketing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* ─── Navigation ─── */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'circOut' }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-5 md:px-12 bg-white/80 backdrop-blur-xl border-b border-slate-100"
        style={{ paddingTop: 'calc(1.25rem + env(safe-area-inset-top, 0px))' }}
      >
        <a href="/work">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 px-4 py-2 rounded-full border border-slate-100 shadow-sm"
          >
            <ArrowLeft size={16} className="text-slate-600" />
            <span className="font-medium text-sm text-slate-600">Back to Work</span>
          </motion.div>
        </a>

        <div className="absolute left-1/2 -translate-x-1/2">
          <a href="/">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 px-4 py-2 rounded-full border border-slate-100 shadow-sm"
            >
              <img src="/Logo/habos-icon.svg" alt="HABOS" className="h-8 w-8" />
              <span className="font-semibold text-sm tracking-tight text-slate-900">HABOS</span>
            </motion.div>
          </a>
        </div>

        <div className="w-32" />
      </motion.nav>

      {/* ─── Content ─── */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ━━━ 1. Hero ━━━ */}
          <motion.section {...fadeUp()} className="max-w-3xl mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-700 rounded-full text-sm font-medium mb-6">
              <Megaphone size={14} />
              Marketing Hub
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-[1.1]">
              From Strategy to Revenue.<br />
              One Platform.
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-2xl">
              Define your brand voice and positioning once. Every campaign, creative, and
              opportunity anchors to your strategy automatically. Track attribution from
              first click to closed deal.
            </p>
          </motion.section>

          {/* ━━━ 2. Mock dashboard ━━━ */}
          <motion.section {...fadeUp(0.15)} className="mb-20">
            <div className="bg-rose-50/50 rounded-3xl p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Top-left: Active Campaigns */}
                <div className="bg-white rounded-2xl p-5 border border-rose-100/60">
                  <p className="text-xs font-semibold uppercase tracking-widest text-rose-600 mb-3">
                    Active Campaigns
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mb-3">3</p>
                  <div className="space-y-1.5">
                    {['Spring HVAC Promo', 'Emergency Services', 'Referral Program'].map((name) => (
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
                    Pipeline Attribution
                  </p>
                  <p className="text-lg font-bold text-slate-900 mb-3">$127K revenue tracked</p>
                  <div className="w-full h-3 rounded-full overflow-hidden flex">
                    <div className="bg-rose-500 h-full" style={{ width: '45%' }} />
                    <div className="bg-rose-300 h-full" style={{ width: '30%' }} />
                    <div className="bg-rose-200 h-full" style={{ width: '25%' }} />
                  </div>
                  <div className="flex justify-between mt-2 text-[11px] text-slate-500">
                    <span>Website 45%</span>
                    <span>Email 30%</span>
                    <span>Social 25%</span>
                  </div>
                </div>

                {/* Bottom-left: AI Opportunities */}
                <div className="bg-white rounded-2xl p-5 border border-rose-100/60">
                  <p className="text-xs font-semibold uppercase tracking-widest text-rose-600 mb-3">
                    AI Opportunities
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="shrink-0 mt-0.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-amber-100 text-amber-700 rounded-full">
                        Gap
                      </span>
                      <p className="text-sm text-slate-700 leading-snug">
                        Competitor gap: emergency response positioning
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="shrink-0 mt-0.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-emerald-100 text-emerald-700 rounded-full">
                        Trend
                      </span>
                      <p className="text-sm text-slate-700 leading-snug">
                        Smart home integration demand +40%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom-right: Creative Pipeline */}
                <div className="bg-white rounded-2xl p-5 border border-rose-100/60">
                  <p className="text-xs font-semibold uppercase tracking-widest text-rose-600 mb-3">
                    Creative Pipeline
                  </p>
                  <p className="text-lg font-bold text-slate-900 mb-3">12 assets in review</p>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      8 approved
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      3 pending
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      1 revision
                    </span>
                  </div>
                </div>

              </div>

              <p className="text-sm text-slate-500 mt-6 leading-relaxed">
                9 dashboards in one: strategy, campaigns, broadcasts, funnels, proof assets,
                creative, calendar, and ROI analytics.
              </p>
            </div>
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
                    <div className="w-9 h-9 bg-rose-100 rounded-lg flex items-center justify-center">
                      <b.icon size={18} className="text-rose-600" />
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
            <div className="bg-slate-900 rounded-3xl p-8 text-white">
              <p className="text-lg md:text-xl leading-relaxed text-slate-200">
                Your competitor just raised prices on emergency plumbing. HABOS surfaces an
                AI opportunity: &ldquo;Emergency service pricing gap&nbsp;&mdash; competitors
                average $195/call, you&rsquo;re at $150. Recommend: increase to $175 and run
                a &lsquo;24/7 Emergency&rsquo; campaign.&rdquo; You click &ldquo;Create
                Campaign&rdquo;&nbsp;&mdash; it&rsquo;s pre-populated with the opportunity
                data, linked to your emergency service product, and ready to publish.
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
              Other marketing tools track campaigns.<br />
              HABOS connects campaigns to revenue.
            </h2>
            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 px-8 py-3.5 bg-rose-600 text-white rounded-full font-medium text-sm shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-colors"
              >
                Join Waitlist
              </motion.button>
            </a>
          </motion.section>

        </div>
      </main>
    </div>
  );
};

export default Marketing;
