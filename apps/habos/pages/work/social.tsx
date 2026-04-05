import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@li/shared/components/Navbar';
import { Camera, Sparkles, CalendarClock, ArrowRight, BarChart3, Image } from 'lucide-react';

/* ── animation helpers ─────────────────────────────────────────────────── */

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

const postColors = ['bg-rose-200', 'bg-amber-200', 'bg-sky-200'] as const;
const benefitIcons = [Sparkles, CalendarClock, BarChart3] as const;

/* ── component ─────────────────────────────────────────────────────────── */

const Social: React.FC = () => {
  const { t } = useTranslation('work-social');

  const postCards = (t('feedManager.postCards', { returnObjects: true }) as Array<{
    day: string;
    time: string;
    caption: string;
    aiGenerated: boolean;
  }>).map((post, i) => ({ ...post, color: postColors[i] }));

  const metrics = t('feedManager.metrics', { returnObjects: true }) as Array<{
    label: string;
    value: string;
  }>;

  const benefits = (t('benefits', { returnObjects: true }) as Array<{
    title: string;
    desc: string;
  }>).map((b, i) => ({ ...b, icon: benefitIcons[i] }));

  const techItems = t('techItems', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ─── Content ─── */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ━━━ 1. Hero ━━━ */}
          <motion.section {...fadeUp()} className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-700 rounded-full text-sm font-medium mb-6">
              <Camera size={14} />
              {t('badge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-[1.1]">
              {t('hero.title_part1')}{' '}
              <span className="relative inline-block">
                <span className="relative z-10">{t('hero.title_part2')}</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.6, ease: 'circOut' }}
                  className="absolute bottom-2 left-0 right-0 h-3 bg-rose-300/40 origin-left -z-0 rounded-sm"
                />
              </span>
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
              {t('hero.description')}
            </p>
          </motion.section>

          {/* ━━━ 2. Mock social feed manager ━━━ */}
          <motion.section {...fadeUp(0.15)} className="mb-20">
            <div className="bg-rose-50/50 rounded-3xl p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-rose-600 mb-5">
                {t('feedManager.label')}
              </p>

              {/* Post cards */}
              <div className="grid md:grid-cols-3 gap-3 md:gap-4 mb-6">
                {postCards.map((post) => (
                  <div
                    key={post.day}
                    className={`bg-white rounded-xl p-3 border shadow-sm ${
                      post.aiGenerated ? 'border-rose-400 border-2' : 'border-slate-200'
                    }`}
                  >
                    {/* Placeholder image */}
                    <div className={`${post.color} rounded-lg aspect-square mb-3 relative`}>
                      {post.aiGenerated && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <Sparkles size={12} className="text-rose-500" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-2">
                      {post.caption}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-400">
                        {post.day} {post.time}
                      </span>
                      {post.aiGenerated && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                          {t('feedManager.aiCaptionBadge')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Metrics bar */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-center gap-6 md:gap-10">
                {metrics.map((m, i) => (
                  <React.Fragment key={m.label}>
                    {i > 0 && <div className="w-px h-8 bg-slate-200" />}
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-900">{m.value}</p>
                      <p className="text-xs text-slate-400">{m.label}</p>
                    </div>
                  </React.Fragment>
                ))}
              </div>
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
              {t('cta.title').split('\n').map((line, i, arr) => (
                <React.Fragment key={i}>{line}{i < arr.length - 1 && <br />}</React.Fragment>
              ))}
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

export default Social;
