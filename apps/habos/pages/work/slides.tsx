import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Zap, Database, Palette } from 'lucide-react';
import { Navbar } from '@li/shared/components/Navbar';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const benefitCardIcons = [Zap, Database, Palette] as const;

const Slides: React.FC = () => {
  const { t } = useTranslation('work-slides');

  const layouts = t('layouts.items', { returnObjects: true }) as string[];
  const techItems = t('techItems', { returnObjects: true }) as string[];
  const benefitCards = (t('benefitCards', { returnObjects: true }) as Array<{
    title: string;
    desc: string;
  }>).map((card, i) => ({ ...card, icon: benefitCardIcons[i] }));

  const slideMetrics = t('slidePreview.metrics', { returnObjects: true }) as Array<{
    change: string;
    value: string;
    label: string;
  }>;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Content */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">

          {/* 1. Hero */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <div className="inline-block px-4 py-2 bg-fuchsia-500/10 text-fuchsia-700 rounded-full text-sm font-medium mb-6">
              {t('badge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-tight">
              {t('hero.title_part1')}{' '}
              <span className="relative inline-block">
                <span className="relative z-10">{t('hero.title_part2')}</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.6, ease: "circOut" }}
                  className="absolute bottom-2 left-0 right-0 h-3 bg-fuchsia-300/40 origin-left -z-0 rounded-sm"
                />
              </span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              {t('hero.description')}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mx-auto mb-16"><p className="text-lg text-slate-600 leading-relaxed">{t('intro')}</p></motion.div>

          {/* 2. Mock slide preview */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-slate-900 rounded-3xl p-2 shadow-2xl max-w-3xl mx-auto">
              <div className="aspect-video bg-white rounded-2xl relative overflow-hidden p-6 md:p-10 flex flex-col">
                {/* Brand accent bar */}
                <div className="absolute top-0 left-0 w-24 h-1.5 bg-fuchsia-500 rounded-br-full" />

                {/* Slide title */}
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-2 mb-5">
                  {t('slidePreview.title')}
                </h2>

                {/* Metric cards row */}
                <div className="flex gap-3 md:gap-4 mb-5">
                  {slideMetrics.map((metric, i) => (
                    <div key={i} className="flex-1 bg-slate-50 rounded-xl p-3 md:p-4">
                      <div className="flex items-center gap-1.5 mb-1">
                        {i < 2 ? (
                          <ArrowUpRight size={14} className="text-emerald-500" />
                        ) : (
                          <ArrowDownRight size={14} className="text-red-500" />
                        )}
                        <span className={`text-[10px] md:text-xs font-medium ${i < 2 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {metric.change}
                        </span>
                      </div>
                      <div className="text-lg md:text-xl font-bold text-slate-900">{metric.value}</div>
                      <div className="text-[10px] md:text-xs text-slate-400">{metric.label}</div>
                    </div>
                  ))}
                </div>

                {/* Simplified bar chart */}
                <div className="flex-1 flex items-end gap-2 md:gap-3 px-2">
                  <div className="flex-1 bg-fuchsia-400 rounded-t-md" style={{ height: '45%' }} />
                  <div className="flex-1 bg-fuchsia-400 rounded-t-md" style={{ height: '62%' }} />
                  <div className="flex-1 bg-fuchsia-400 rounded-t-md" style={{ height: '38%' }} />
                  <div className="flex-1 bg-fuchsia-400 rounded-t-md" style={{ height: '78%' }} />
                  <div className="flex-1 bg-fuchsia-400 rounded-t-md" style={{ height: '55%' }} />
                  <div className="flex-1 bg-fuchsia-500 rounded-t-md" style={{ height: '90%' }} />
                  <div className="flex-1 bg-fuchsia-400 rounded-t-md" style={{ height: '70%' }} />
                  <div className="flex-1 bg-fuchsia-300 rounded-t-md" style={{ height: '52%' }} />
                  <div className="flex-1 bg-fuchsia-300 rounded-t-md" style={{ height: '48%' }} />
                  <div className="flex-1 bg-fuchsia-200 rounded-t-md" style={{ height: '35%' }} />
                  <div className="flex-1 bg-fuchsia-200 rounded-t-md" style={{ height: '42%' }} />
                  <div className="flex-1 bg-fuchsia-200 rounded-t-md" style={{ height: '30%' }} />
                </div>

                {/* Slide number */}
                <div className="absolute bottom-4 right-6 text-[10px] text-slate-300 font-medium">
                  {t('slidePreview.slideNumber')}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Caption below slide */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mb-20 max-w-2xl mx-auto"
          >
            <p className="text-sm text-slate-500 leading-relaxed">
              <span className="text-slate-700 font-medium">{t('caption.prefix')}</span>{' '}
              {t('caption.prompt')}{' '}
              {t('caption.suffix')}
            </p>
          </motion.div>

          {/* 3. Three benefit cards */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="grid md:grid-cols-3 gap-5 mb-20"
          >
            {benefitCards.map((card) => (
              <div key={card.title} className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="w-10 h-10 bg-fuchsia-100 rounded-xl flex items-center justify-center mb-4">
                  <card.icon size={20} className="text-fuchsia-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{card.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* 4. Layout showcase */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mb-20"
          >
            <p className="text-sm font-medium text-slate-500 mb-4">
              {t('layouts.heading')}
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
              {layouts.map((layout) => (
                <span
                  key={layout}
                  className="bg-fuchsia-50 text-fuchsia-700 rounded-lg px-3 py-1.5 text-xs font-medium"
                >
                  {layout}
                </span>
              ))}
            </div>
          </motion.div>

          {/* 5. Scenario callout */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="bg-slate-900 text-white rounded-3xl p-8 md:p-10 mb-20"
          >
            <p className="text-lg md:text-xl leading-relaxed text-slate-200">
              {t('scenario.part1')}{' '}
              <span className="text-white font-medium italic">{t('scenario.prompt')}</span>
            </p>
            <p className="text-lg md:text-xl leading-relaxed text-slate-200 mt-4">
              {t('scenario.part2')}
            </p>
            <p className="text-lg md:text-xl font-semibold text-white mt-6">
              {t('scenario.closing')}
            </p>
          </motion.div>

          {/* 6. Tech strip */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-20"
          >
            <div className="bg-fuchsia-50 border border-fuchsia-200 rounded-2xl px-8 py-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs md:text-sm font-medium text-fuchsia-700">
              {techItems.map((item, i) => (
                <React.Fragment key={item}>
                  {i > 0 && <span className="text-fuchsia-300">&middot;</span>}
                  <span>{item}</span>
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          {/* 7. Closing */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="text-center"
          >
            <p className="text-xl md:text-2xl font-serif italic text-slate-700 mb-8">
              {t('cta.tagline')}
            </p>
            <a href="/#pricing">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-slate-900 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                {t('cta.button')}
              </motion.button>
            </a>
          </motion.div>

        </div>
      </main>
    </div>
  );
};

export default Slides;
