import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, AlertTriangle, Clock, Zap, Shield, Link2, ArrowRight } from 'lucide-react';
import ProjectsDemo from './features/ProjectsDemo';
import { Navbar } from '../../components/Navbar';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const Projects: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="inline-block px-4 py-2 bg-orange-500/10 text-orange-700 rounded-full text-sm font-medium mb-6">
              AI Project Intelligence
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6">
              Always Know What's<br />Blocking Progress.
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mb-8">
              HABOS continuously analyzes every task, dependency, and deadline to surface the critical path.
              You see bottlenecks before they become problems.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mb-16"><p className="text-lg text-slate-600 leading-relaxed">The project system uses AI analysis to continuously identify the critical path. GPT-4o examines all plan items, dependencies, and current status, then identifies bottlenecks and blocking chains. Critical path items automatically receive higher priority in the scheduling engine — when focus blocks fill, critical path tasks slot in first. Dependencies enforce topological ordering, so predecessor tasks are always scheduled before their dependents.</p></motion.div>

          {/* Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-20 rounded-3xl border border-slate-200 overflow-hidden shadow-lg bg-white"
          >
            <div className="p-2 md:p-4">
              <ProjectsDemo />
            </div>
          </motion.div>

          {/* Mock Critical Path */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-orange-50/50 rounded-3xl p-6 md:p-8 mb-20"
          >
            <h2 className="text-lg font-semibold text-slate-900 mb-5">
              Henderson Kitchen Renovation — Critical Path
            </h2>

            <div className="relative pl-6">
              {/* Vertical connector line */}
              <div className="absolute left-[11px] top-3 bottom-3 w-px bg-slate-200" />

              {/* Item 1 — Completed */}
              <div className="relative bg-white rounded-xl p-3 mb-1 border border-slate-200">
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                </div>
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="text-sm font-medium text-slate-900">Permits approved</span>
                  <span className="text-xs text-slate-400">Completed Mar 20</span>
                </div>
              </div>

              {/* Item 2 — Completed */}
              <div className="relative bg-white rounded-xl p-3 mb-1 border border-slate-200">
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                </div>
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="text-sm font-medium text-slate-900">Plumbing rough-in</span>
                  <span className="text-xs text-slate-400">Completed Mar 23</span>
                </div>
              </div>

              {/* Item 3 — BLOCKING (highlighted) */}
              <div className="relative bg-orange-50 rounded-xl p-3 mb-1 border border-orange-300">
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full">
                  <AlertTriangle size={18} className="text-amber-500" />
                </div>
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="text-sm font-semibold text-orange-900">Tile selection</span>
                  <span className="text-xs font-medium text-orange-700">
                    BLOCKING — waiting on sample delivery (due Mar 28)
                  </span>
                </div>
              </div>

              {/* Item 4 — Blocked */}
              <div className="relative bg-white rounded-xl p-3 mb-1 border border-slate-200">
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full">
                  <Clock size={18} className="text-slate-400" />
                </div>
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="text-sm font-medium text-slate-900">Tile installation</span>
                  <span className="text-xs text-slate-400">Blocked by: Tile selection</span>
                </div>
              </div>

              {/* Item 5 — Blocked */}
              <div className="relative bg-white rounded-xl p-3 border border-slate-200">
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full">
                  <Clock size={18} className="text-slate-400" />
                </div>
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="text-sm font-medium text-slate-900">Final inspection</span>
                  <span className="text-xs text-slate-400">Blocked by: Tile installation</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-600 mt-5 leading-relaxed">
              AI identified "Tile selection" as the bottleneck 3 days before the team noticed.
              Critical path items are auto-promoted to highest priority in your schedule.
            </p>
          </motion.div>

          {/* Three Benefit Blocks */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="grid md:grid-cols-3 gap-5 mb-20"
          >
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Zap size={20} className="text-orange-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Bottlenecks found automatically
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                AI examines all plan items, dependencies, and status. It sets critical_rank on items that form
                the blocking chain — and your calendar prioritizes them immediately.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Shield size={20} className="text-orange-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Dependencies enforced
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                If a predecessor isn't complete, the dependent task is marked blocked and can't be started.
                No more working on the wrong thing.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Link2 size={20} className="text-orange-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Every source connected
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Emails, meetings, voice notes, and documents are auto-tagged to projects. Ask "why is this
                behind?" and get a real answer.
              </p>
            </div>
          </motion.div>

          {/* Before / After */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="grid md:grid-cols-2 gap-5 mb-20"
          >
            {/* Without HABOS */}
            <div className="bg-slate-100 rounded-2xl p-6 md:p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Without HABOS</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Monday standup: "Any blockers?" Silence. Thursday: "Why isn't the tile installed?"
                "Oh, the samples never arrived." Three days lost.
              </p>
              <div className="inline-block px-3 py-1.5 bg-slate-200 text-slate-700 rounded-full text-xs font-medium">
                Bottleneck discovered: 3 days late
              </div>
            </div>

            {/* With HABOS */}
            <div className="bg-orange-50 rounded-2xl p-6 md:p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">With HABOS</h3>
              <p className="text-sm text-slate-700 leading-relaxed mb-6">
                Tuesday morning: notification — "Tile selection is now the critical path bottleneck.
                Sample delivery is 2 days out. Recommend: escalate with supplier." Action taken same day.
              </p>
              <div className="inline-block px-3 py-1.5 bg-orange-200 text-orange-800 rounded-full text-xs font-medium">
                Bottleneck flagged: 3 days early
              </div>
            </div>
          </motion.div>

          {/* Tech Strip */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="bg-slate-950 rounded-2xl px-6 py-4 mb-20 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400"
          >
            <span>GPT-4o critical path analysis</span>
            <span className="hidden sm:inline text-slate-700">&middot;</span>
            <span>Topological dependency sort</span>
            <span className="hidden sm:inline text-slate-700">&middot;</span>
            <span>Auto-priority elevation</span>
            <span className="hidden sm:inline text-slate-700">&middot;</span>
            <span>Cross-module data tagging</span>
          </motion.div>

          {/* Closing CTA */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="text-center"
          >
            <h3 className="text-2xl md:text-3xl font-serif text-slate-900 mb-4">
              Other project tools show you tasks.<br />HABOS shows you what matters.
            </h3>
            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 inline-flex items-center gap-2 px-8 py-4 bg-orange-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                Join Waitlist
                <ArrowRight size={18} />
              </motion.button>
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Projects;
