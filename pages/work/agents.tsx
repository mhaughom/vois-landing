import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar';
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  MessageSquare,
  FileText,
  Play,
  ShieldCheck,
  CheckCircle,
  Search,
  Package,
  TrendingDown,
  PenLine,
  Pause,
  Send,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] as const },
});

const pipelineIcons = [MessageSquare, FileText, Play, ShieldCheck, CheckCircle];
const timelineIcons = [Search, Package, TrendingDown, PenLine, Pause, Send];
const timelineHighlight = [false, false, false, false, true, false];

const Agents: React.FC = () => {
  const { t } = useTranslation('work-agents');
  const pipelineSteps = t('pipeline.steps', { returnObjects: true }) as Array<{ label: string }>;
  const timelineSteps = t('scenario.steps', { returnObjects: true }) as Array<{ text: string }>;
  const stats = t('stats.items', { returnObjects: true }) as Array<{ big: string; desc: string }>;
  const trustSignals = t('trustSignals', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ── 1. Hero ─────────────────────────────────────────────── */}
          <motion.section {...fadeUp(0)} className="mb-20 max-w-3xl">
            <div className="inline-block px-4 py-2 bg-rose-500/10 text-rose-700 rounded-full text-sm font-medium mb-6">
              {t('badge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-2xl">
              {t('hero.description')}
            </p>
          </motion.section>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mb-16">
              {t('intro')}
            </p>
          </motion.div>

          {/* ── 2. Pipeline flow ─────────────────────────────────────── */}
          <motion.section {...fadeUp(0.15)} className="mb-20">
            {/* Desktop: horizontal */}
            <div className="hidden md:flex items-center justify-center gap-3">
              {pipelineSteps.map((step, i) => {
                const Icon = pipelineIcons[i];
                return (
                  <React.Fragment key={step.label}>
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-28 h-28 bg-rose-50 rounded-2xl border border-rose-100 flex flex-col items-center justify-center gap-2 shadow-sm">
                        <Icon size={28} className="text-rose-600" />
                        <span className="text-sm font-semibold text-slate-700">{step.label}</span>
                      </div>
                    </div>
                    {i < pipelineSteps.length - 1 && (
                      <ArrowRight size={20} className="text-slate-300 flex-shrink-0" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Mobile: vertical */}
            <div className="flex md:hidden flex-col items-center gap-2">
              {pipelineSteps.map((step, i) => {
                const Icon = pipelineIcons[i];
                return (
                  <React.Fragment key={step.label}>
                    <div className="w-full max-w-xs bg-rose-50 rounded-2xl border border-rose-100 flex items-center gap-4 px-5 py-4 shadow-sm">
                      <Icon size={24} className="text-rose-600 flex-shrink-0" />
                      <span className="text-sm font-semibold text-slate-700">{step.label}</span>
                    </div>
                    {i < pipelineSteps.length - 1 && (
                      <ArrowDown size={18} className="text-slate-300" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <p className="text-center text-sm text-slate-400 mt-6 max-w-lg mx-auto">
              {t('pipeline.footer')}
            </p>
          </motion.section>

          {/* ── 3. Real example scenario ─────────────────────────────── */}
          <motion.section {...fadeUp(0.25)} className="mb-20">
            <div className="bg-slate-50 rounded-3xl p-6 md:p-10">
              <h2 className="text-2xl font-serif font-medium text-slate-900 mb-8">
                {t('scenario.title')}
              </h2>

              {/* User instruction bubble */}
              <div className="mb-8">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                  {t('scenario.instructionLabel')}
                </p>
                <div className="bg-rose-600 text-white rounded-2xl rounded-tl-sm px-6 py-5 text-base md:text-lg leading-relaxed max-w-2xl shadow-md">
                  {t('scenario.instruction')}
                </div>
              </div>

              {/* Agent timeline */}
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                {t('scenario.agentLabel')}
              </p>
              <div className="rounded-2xl overflow-hidden border border-slate-200">
                {timelineSteps.map((step, i) => {
                  const Icon = timelineIcons[i];
                  const highlight = timelineHighlight[i];
                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-4 px-5 py-4 ${
                        highlight
                          ? 'bg-rose-50 border-l-4 border-rose-400'
                          : i % 2 === 0
                          ? 'bg-white'
                          : 'bg-slate-50/60'
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            highlight
                              ? 'bg-rose-100'
                              : 'bg-slate-100'
                          }`}
                        >
                          <Icon
                            size={16}
                            className={highlight ? 'text-rose-600' : 'text-slate-500'}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 min-h-[2rem]">
                        <span className="text-xs font-bold text-slate-300 tabular-nums w-4">
                          {i + 1}
                        </span>
                        <p
                          className={`text-sm leading-relaxed ${
                            highlight
                              ? 'font-semibold text-rose-700'
                              : 'text-slate-600'
                          }`}
                        >
                          {step.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.section>

          {/* ── 4. Stats ─────────────────────────────────────────────── */}
          <motion.section {...fadeUp(0.35)} className="mb-20">
            <h2 className="text-2xl font-serif font-medium text-slate-900 mb-8 text-center">
              {t('stats.title')}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {stats.map((s) => (
                <div
                  key={s.big}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
                >
                  <p className="text-2xl font-bold text-rose-600 mb-2">{s.big}</p>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ── 5. Trust strip ───────────────────────────────────────── */}
          <motion.section {...fadeUp(0.45)} className="mb-20">
            <div className="bg-slate-900 text-white rounded-2xl px-8 py-5">
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
                {trustSignals.map((sig, i) => (
                  <React.Fragment key={sig}>
                    <span className="text-slate-300">{sig}</span>
                    {i < trustSignals.length - 1 && (
                      <span className="hidden sm:inline text-slate-600">&middot;</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </motion.section>

          {/* ── 6. Closing ───────────────────────────────────────────── */}
          <motion.section {...fadeUp(0.55)} className="text-center">
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

export default Agents;
