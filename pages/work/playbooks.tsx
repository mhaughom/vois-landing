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

// ── Animation config ────────────────────────────────────────────────────────

const ease = [0.23, 1, 0.32, 1] as const;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease },
});

// ── Data ────────────────────────────────────────────────────────────────────

const folders = [
  {
    name: 'Company Handbook',
    meta: '12 documents \u00b7 Updated 2 days ago',
    status: 'Active',
    statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    name: 'Onboarding Guide',
    meta: '8 documents \u00b7 Field Ops dept',
    status: 'Department',
    statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    name: 'Safety Procedures',
    meta: '15 documents \u00b7 All teams',
    status: 'Required',
    statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    name: 'API Documentation',
    meta: '6 documents \u00b7 Engineering',
    status: 'Technical',
    statusColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    name: 'Customer Playbooks',
    meta: '9 documents \u00b7 Sales + Support',
    status: 'Shared',
    statusColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
] as const;

const benefits = [
  {
    icon: Upload,
    title: 'AI document import',
    description:
      'Upload PDF, Word, or Markdown. GPT-4o cleans, structures, and extracts metadata automatically. No formatting, no tagging, no busywork.',
  },
  {
    icon: Brain,
    title: 'Brain-indexed',
    description:
      'Every playbook chunked into 512-dim vectors. Ask the Brain months later \u2014 it finds the answer with citations.',
  },
  {
    icon: Shield,
    title: 'Permission inheritance',
    description:
      'Editors and viewers inherit folder access to sub-folders. Managers stay explicit. Granular control without complexity.',
  },
] as const;

const techItems = [
  'GPT-4o document processing',
  '512-dim vector embeddings',
  '6 permission models',
  'Drag-to-assign',
  '17 preset folders',
] as const;

// ── Component ───────────────────────────────────────────────────────────────

const PlaybooksPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          {/* ── 1. Hero ──────────────────────────────────────────────────── */}
          <motion.div {...fadeUp(0)} className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-teal-500/10 text-teal-700 rounded-full text-sm font-medium mb-6">
              Knowledge Management
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6">
              Upload Once. Searchable Forever.
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Drop a PDF, Word doc, or URL. AI cleans, structures, and embeds it in the Brain.
              Drag folders to departments &mdash; everyone who needs it gets access automatically.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mx-auto mb-16 text-center">
            <p className="text-lg text-slate-600 leading-relaxed">
              Upload a PDF, Word document, or URL — GPT-4o cleans, structures, and extracts metadata automatically. Every playbook is chunked into 512-dimensional vector embeddings and indexed in the Brain. Ask about a procedure months later and the Brain finds it with citations. Six permission models handle access: department auto-sync, org-level grouping, project linking, operation linking, custom teams, and manual folders. Drag a folder to a department and matching team members get access instantly.
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
                      className={`flex-shrink-0 text-xs font-medium px-3 py-1 rounded-full border ${folder.statusColor}`}
                    >
                      {folder.status}
                    </span>
                  </motion.div>
                ))}
              </div>
              <p className="text-sm text-slate-500 text-center mt-6 max-w-lg mx-auto leading-relaxed">
                17 preset folders auto-created on setup. Drag any folder to a department, project,
                or operation &mdash; matching team members get access instantly.
              </p>
            </div>
          </motion.div>

          {/* ── 3. Benefit Cards ─────────────────────────────────────────── */}
          <motion.div {...fadeUp(0.3)} className="grid md:grid-cols-3 gap-5 mb-20">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="bg-white border border-slate-200 rounded-2xl p-6"
              >
                <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center mb-4">
                  <b.icon size={18} className="text-teal-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{b.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{b.description}</p>
              </div>
            ))}
          </motion.div>

          {/* ── 4. Before / After ────────────────────────────────────────── */}
          <motion.div {...fadeUp(0.4)} className="grid md:grid-cols-2 gap-6 mb-20">
            {/* Before */}
            <div className="bg-slate-100 border border-slate-200 rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-5">Before Playbooks</h3>
              <div className="space-y-3 mb-6">
                {[
                  'SOPs live in Google Drive.',
                  'Nobody knows which version is current.',
                  'New hires can\u2019t find anything.',
                  'Knowledge leaves when people leave.',
                ].map((line) => (
                  <div key={line} className="flex items-start gap-3">
                    <X size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">{line}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                <FileText size={14} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-400">30 min searching / week</span>
              </div>
            </div>

            {/* After */}
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-5">With Playbooks</h3>
              <div className="space-y-3 mb-6">
                {[
                  'SOPs live in Playbooks.',
                  'AI-indexed, semantically searchable, auto-assigned by department.',
                  'Ask the Brain: \u201cWhat\u2019s our emergency response procedure?\u201d',
                  'Instant answer.',
                ].map((line) => (
                  <div key={line} className="flex items-start gap-3">
                    <Check size={16} className="text-teal-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{line}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-teal-200">
                <Brain size={14} className="text-teal-600" />
                <span className="text-sm font-medium text-teal-700">30 seconds</span>
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
              Other knowledge bases collect dust. HABOS knowledge bases answer questions.
            </p>
            <a href="/work#waitlist">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-slate-900 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                Join Waitlist
              </motion.button>
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default PlaybooksPage;
