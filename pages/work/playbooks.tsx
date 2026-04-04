import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar';
import {
  ArrowLeft,
  FolderOpen,
  FileText,
  Upload,
  Brain,
  Shield,
  X,
  Check,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// ── Animation config ────────────────────────────────────────────────────────

const ease = [0.23, 1, 0.32, 1] as const;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease },
});

// ── Static data ─────────────────────────────────────────────────────────────

const folderStatusColors = [
  'bg-emerald-50 text-emerald-700 border-emerald-200',
  'bg-blue-50 text-blue-700 border-blue-200',
  'bg-amber-50 text-amber-700 border-amber-200',
  'bg-purple-50 text-purple-700 border-purple-200',
  'bg-indigo-50 text-indigo-700 border-indigo-200',
] as const;

const benefitIcons = [Upload, Brain, Shield];

// ── Component ───────────────────────────────────────────────────────────────

const PlaybooksPage: React.FC = () => {
  const { t } = useTranslation('work-playbooks');
  const folders = t('library.folders', { returnObjects: true }) as Array<{ name: string; meta: string; status: string }>;
  const benefits = t('benefits', { returnObjects: true }) as Array<{ title: string; description: string }>;
  const techItems = t('techStrip', { returnObjects: true }) as string[];
  const beforeItems = t('comparison.before.items', { returnObjects: true }) as string[];
  const afterItems = t('comparison.after.items', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          {/* ── 1. Hero ──────────────────────────────────────────────────── */}
          <motion.div {...fadeUp(0)} className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-teal-500/10 text-teal-700 rounded-full text-sm font-medium mb-6">
              {t('badge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
              {t('hero.description')}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mx-auto mb-16 text-center">
            <p className="text-lg text-slate-600 leading-relaxed">
              {t('intro')}
            </p>
          </motion.div>

          {/* ── 2. Mock Playbook Library ─────────────────────────────────── */}
          <motion.div {...fadeUp(0.15)} className="mb-20">
            <div className="bg-teal-50/50 rounded-3xl p-6 md:p-8">
              <div className="space-y-2">
                {folders.map((folder, i) => (
                  <motion.div
                    key={folder.name}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.06, ease }}
                    className="bg-white rounded-lg p-4 border border-slate-200 flex items-center gap-4"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center">
                      <FolderOpen size={18} className="text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm">{folder.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{folder.meta}</p>
                    </div>
                    <span
                      className={`flex-shrink-0 text-xs font-medium px-3 py-1 rounded-full border ${folderStatusColors[i]}`}
                    >
                      {folder.status}
                    </span>
                  </motion.div>
                ))}
              </div>
              <p className="text-sm text-slate-500 text-center mt-6 max-w-lg mx-auto leading-relaxed">
                {t('library.footer')}
              </p>
            </div>
          </motion.div>

          {/* ── 3. Benefit Cards ─────────────────────────────────────────── */}
          <motion.div {...fadeUp(0.3)} className="grid md:grid-cols-3 gap-5 mb-20">
            {benefits.map((b, i) => {
              const Icon = benefitIcons[i];
              return (
                <div
                  key={b.title}
                  className="bg-white border border-slate-200 rounded-2xl p-6"
                >
                  <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center mb-4">
                    <Icon size={18} className="text-teal-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{b.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{b.description}</p>
                </div>
              );
            })}
          </motion.div>

          {/* ── 4. Before / After ────────────────────────────────────────── */}
          <motion.div {...fadeUp(0.4)} className="grid md:grid-cols-2 gap-6 mb-20">
            {/* Before */}
            <div className="bg-slate-100 border border-slate-200 rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-5">{t('comparison.before.title')}</h3>
              <div className="space-y-3 mb-6">
                {beforeItems.map((line) => (
                  <div key={line} className="flex items-start gap-3">
                    <X size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">{line}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                <FileText size={14} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-400">{t('comparison.before.footer')}</span>
              </div>
            </div>

            {/* After */}
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-5">{t('comparison.after.title')}</h3>
              <div className="space-y-3 mb-6">
                {afterItems.map((line) => (
                  <div key={line} className="flex items-start gap-3">
                    <Check size={16} className="text-teal-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{line}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-teal-200">
                <Brain size={14} className="text-teal-600" />
                <span className="text-sm font-medium text-teal-700">{t('comparison.after.footer')}</span>
              </div>
            </div>
          </motion.div>

          {/* ── 5. Tech Strip ────────────────────────────────────────────── */}
          <motion.div {...fadeUp(0.5)} className="mb-20">
            <div className="bg-slate-900 text-white rounded-2xl px-8 py-5 flex flex-wrap items-center justify-center gap-x-0 gap-y-2">
              {techItems.map((item, i) => (
                <React.Fragment key={item}>
                  <span className="text-sm font-mono tracking-tight text-slate-300 px-4">
                    {item}
                  </span>
                  {i < techItems.length - 1 && (
                    <span className="text-slate-600 hidden md:inline">|</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          {/* ── 6. Closing ───────────────────────────────────────────────── */}
          <motion.div {...fadeUp(0.6)} className="text-center">
            <p className="text-lg text-slate-400 italic mb-8">
              {t('closing.tagline')}
            </p>
            <a href="/work#waitlist">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-slate-900 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                {t('closing.cta')}
              </motion.button>
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default PlaybooksPage;
