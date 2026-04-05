import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@li/shared/components/Navbar';
import { Puzzle, Mic, Sparkles, ArrowRight, LayoutGrid, Zap } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

const benefitCardIcons = [
  <Mic size={22} className="text-purple-600" />,
  <Sparkles size={22} className="text-purple-600" />,
  <LayoutGrid size={22} className="text-purple-600" />,
];

const entryColors = ['bg-emerald-500', 'bg-amber-400', 'bg-red-400'] as const;
const legendColors = ['bg-emerald-500', 'bg-amber-400', 'bg-red-400'] as const;

const CustomApps: React.FC = () => {
  const { t } = useTranslation('work-custom-apps');

  const heroPills = t('heroPills', { returnObjects: true }) as string[];
  const techItems = t('techItems', { returnObjects: true }) as string[];

  const demoSteps = t('demo.steps', { returnObjects: true }) as [
    { label: string; prompt: string },
    { label: string; fields: Array<{ field: string; type: string }> },
    { label: string; entries: Array<{ equip: string; status: string }>; legend: string[] }
  ];

  const benefitCards = (t('benefitCards', { returnObjects: true }) as Array<{
    title: string;
    body: string;
  }>).map((card, i) => ({ ...card, icon: benefitCardIcons[i] }));

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Main ── */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ── 1. Hero ── */}
          <motion.section {...fadeUp(0)} className="mb-20">
            <div className="inline-block px-4 py-1.5 bg-purple-500/10 text-purple-700 rounded-full text-sm font-medium mb-6">
              {t('badge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-5 leading-tight">
              {t('hero.title').split('\n').map((line, i, arr) => (
                <React.Fragment key={i}>{line}{i < arr.length - 1 && <br />}</React.Fragment>
              ))}
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mb-8">
              {t('hero.description')}
            </p>
            <div className="flex flex-wrap gap-3">
              {heroPills.map((label) => (
                <span
                  key={label}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium"
                >
                  {label}
                </span>
              ))}
            </div>
          </motion.section>

          {/* ── 2. Mock Demo — 3-step creation flow ── */}
          <motion.section {...fadeUp(0.15)} className="mb-20">
            <div className="bg-purple-50/50 rounded-3xl p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Step 1: Speech bubble */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-700">
                      1
                    </div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{demoSteps[0].label}</span>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                    <div className="flex items-start gap-2">
                      <Mic size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-slate-700 italic leading-relaxed">
                        {demoSteps[0].prompt}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 2: AI-generated schema */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-700">
                      2
                    </div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{demoSteps[1].label}</span>
                  </div>
                  <div className="space-y-2">
                    {demoSteps[1].fields.map((row) => (
                      <div key={row.field} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-1.5">
                        <span className="text-sm text-slate-800">{row.field}</span>
                        <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded">
                          {row.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 3: Mini dashboard */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-700">
                      3
                    </div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{demoSteps[2].label}</span>
                  </div>

                  {/* Mini entries */}
                  <div className="space-y-2 mb-4">
                    {demoSteps[2].entries.map((entry, i) => (
                      <div key={entry.equip} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-1.5">
                        <span className="text-xs text-slate-700 truncate">{entry.equip}</span>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${entryColors[i]}`} />
                          <span className="text-xs text-slate-500">{entry.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Donut chart mock */}
                  <div className="flex items-center justify-center gap-4">
                    <svg width="56" height="56" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="22" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                      <circle
                        cx="28" cy="28" r="22" fill="none" stroke="#10b981" strokeWidth="8"
                        strokeDasharray="46 92" strokeDashoffset="0" transform="rotate(-90 28 28)"
                      />
                      <circle
                        cx="28" cy="28" r="22" fill="none" stroke="#fbbf24" strokeWidth="8"
                        strokeDasharray="46 92" strokeDashoffset="-46" transform="rotate(-90 28 28)"
                      />
                      <circle
                        cx="28" cy="28" r="22" fill="none" stroke="#f87171" strokeWidth="8"
                        strokeDasharray="46 92" strokeDashoffset="-92" transform="rotate(-90 28 28)"
                      />
                    </svg>
                    <div className="text-xs text-slate-500 space-y-1">
                      {demoSteps[2].legend.map((label, i) => (
                        <div key={label} className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${legendColors[i]}`} />
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-center text-sm text-slate-500 mt-6">
                {t('demo.annotation')}
              </p>
            </div>
          </motion.section>

          {/* ── 3. Benefit Cards ── */}
          <motion.section {...fadeUp(0.25)} className="mb-20">
            <div className="grid md:grid-cols-3 gap-6">
              {benefitCards.map((card) => (
                <div
                  key={card.title}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    {card.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{card.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{card.body}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ── 4. Scenario Callout ── */}
          <motion.section {...fadeUp(0.35)} className="mb-20">
            <div className="bg-slate-950 rounded-2xl p-8 md:p-10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Zap size={20} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">{t('scenario.heading')}</h3>
                  <p className="text-slate-400 leading-relaxed">
                    {t('scenario.body')}
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* ── 5. Tech Strip ── */}
          <motion.section {...fadeUp(0.42)} className="mb-20">
            <div className="bg-slate-950 rounded-2xl px-6 py-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
              {techItems.map((item, i) => (
                <React.Fragment key={item}>
                  {i > 0 && <span className="hidden md:inline text-slate-700">&middot;</span>}
                  <span>{item}</span>
                </React.Fragment>
              ))}
            </div>
          </motion.section>

          {/* ── 6. CTA ── */}
          <motion.section {...fadeUp(0.5)} className="text-center">
            <p className="text-lg text-slate-400 italic mb-8">
              {t('cta.tagline')}
            </p>
            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-slate-900 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
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

export default CustomApps;
