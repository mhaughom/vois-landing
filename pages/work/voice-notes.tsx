import React from 'react';
import { motion } from 'framer-motion';
import VoiceNotesDemo from './features/VoiceNotesDemo';
import { Navbar } from '../../components/Navbar';
import {
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Package,
  MessageSquare,
  Timer,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: 'easeOut' as const },
});

const cardIcons = [
  <CheckCircle2 size={18} className="text-indigo-600" />,
  <Calendar size={18} className="text-indigo-600" />,
  <Package size={18} className="text-indigo-600" />,
  <MessageSquare size={18} className="text-indigo-600" />,
];

const benefitIcons = [
  <Timer size={22} className="text-indigo-600" />,
  <ShieldCheck size={22} className="text-indigo-600" />,
  <Smartphone size={22} className="text-indigo-600" />,
];

const confidenceColors = ['bg-emerald-500', 'bg-amber-400', 'bg-slate-300'];

const VoiceNotes: React.FC = () => {
  const { t } = useTranslation('work-voice-notes');
  const heroPills = t('heroPills', { returnObjects: true }) as string[];
  const demoCards = t('demo.cards', { returnObjects: true }) as Array<{ label: string; detail: string }>;
  const benefitCards = t('benefitCards', { returnObjects: true }) as Array<{ title: string; body: string }>;
  const confidenceRows = t('confidence.rows', { returnObjects: true }) as Array<{ range: string; label: string; detail: string }>;
  const techStrip = t('techStrip', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Main ── */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">

          {/* ── 1. Hero ── */}
          <motion.section {...fade(0)} className="mb-20">
            <div className="inline-block px-4 py-1.5 bg-indigo-500/10 text-indigo-700 rounded-full text-sm font-medium mb-6">
              {t('badge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-5 leading-tight">
              {t('hero.title')}
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

          {/* Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-20 rounded-3xl border border-slate-200 overflow-hidden shadow-lg bg-white"
          >
            <div className="p-2 md:p-4">
              <VoiceNotesDemo />
            </div>
          </motion.div>

          {/* ── 2. Visual Split Demo ── */}
          <motion.section {...fade(0.15)} className="mb-20">
            <div className="bg-indigo-50/50 rounded-3xl p-6 md:p-8">
              {/* Transcript quote */}
              <p className="text-slate-600 italic text-sm md:text-base leading-relaxed mb-5 max-w-3xl">
                {t('demo.transcript')}
              </p>

              {/* Mock waveform bar */}
              <div className="bg-indigo-200 rounded-full h-2 w-full mb-8 flex items-center gap-px overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '18%' }} />
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: '8%' }} />
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '22%' }} />
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: '12%' }} />
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '16%' }} />
                <div className="bg-indigo-400 h-full rounded-full" style={{ width: '10%' }} />
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '14%' }} />
              </div>

              {/* 2x2 output cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {demoCards.map((card, i) => (
                  <div
                    key={card.label}
                    className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-start gap-3"
                  >
                    <div className="mt-0.5">{cardIcons[i]}</div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        {card.label}
                      </p>
                      <p className="text-sm text-slate-800">{card.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-center text-sm text-slate-500">
                {t('demo.footer')}
              </p>
            </div>
          </motion.section>

          {/* ── 3. Benefit Cards ── */}
          <motion.section {...fade(0.25)} className="mb-20">
            <div className="grid md:grid-cols-3 gap-6">
              {benefitCards.map((card, i) => (
                <div
                  key={card.title}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
                >
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    {benefitIcons[i]}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{card.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{card.body}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ── 4. How Confidence Works ── */}
          <motion.section {...fade(0.35)} className="mb-20">
            <h2 className="text-2xl md:text-3xl font-serif font-medium text-slate-900 mb-8">
              {t('confidence.title')}
            </h2>
            <div className="space-y-5">
              {confidenceRows.map((row, i) => (
                <div key={row.label} className="flex items-center gap-5">
                  <div className="flex items-center gap-3 w-32 flex-shrink-0">
                    <div className={`${confidenceColors[i]} h-3 w-16 rounded-full`} />
                    <span className="text-xs font-medium text-slate-500">{row.range}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-900">{row.label}</span>
                    <span className="text-sm text-slate-500 ml-2">&mdash; {row.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ── 5. Tech Strip ── */}
          <motion.section {...fade(0.42)} className="mb-20">
            <div className="bg-slate-950 rounded-2xl px-6 py-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
              {techStrip.map((item, i) => (
                <React.Fragment key={item}>
                  {i > 0 && <span className="hidden md:inline text-slate-700">&middot;</span>}
                  <span>{item}</span>
                </React.Fragment>
              ))}
            </div>
          </motion.section>

          {/* ── 6. Closing ── */}
          <motion.section {...fade(0.5)} className="text-center">
            <p className="text-lg text-slate-400 italic mb-8">
              {t('closing.tagline')}
            </p>
            <a href="/#waitlist">
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

export default VoiceNotes;
