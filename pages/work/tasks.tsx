import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Mic, Video, Mail, Bot } from 'lucide-react';
import TasksDemo from './features/TasksDemo';

const tasks = [
  {
    dot: 'bg-red-500',
    title: 'Finalize Henderson proposal',
    source: 'from project',
    imp: '0.95',
    urg: '0.91',
  },
  {
    dot: 'bg-amber-500',
    title: 'Reply to Sarah\u2019s email about tile samples',
    source: 'from email',
    imp: '0.78',
    urg: '0.72',
  },
  {
    dot: 'bg-amber-500',
    title: 'Review weekly operations report',
    source: 'from meeting',
    imp: '0.71',
    urg: '0.65',
  },
  {
    dot: 'bg-emerald-500',
    title: 'Update team org chart',
    source: 'from voice note',
    imp: '0.45',
    urg: '0.30',
  },
];

const sources = [
  { label: 'Voice notes', icon: Mic },
  { label: 'Meetings', icon: Video },
  { label: 'Email', icon: Mail },
  { label: 'AI Agents', icon: Bot },
];

const factors = [
  'Manual rank',
  'Priority label',
  'AI importance',
  'AI urgency',
  'Due date',
  'Calendar fit',
  'Creation date',
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const Tasks: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
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
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-100 shadow-sm"
          >
            <ArrowLeft size={16} className="text-slate-600" />
            <span className="font-medium text-sm text-slate-600">Back to Work</span>
          </motion.div>
        </a>

        <div className="absolute left-1/2 -translate-x-1/2">
          <a href="/">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-100 shadow-sm"
            >
              <img src="/Logo/habos-icon.svg" alt="HABOS" className="h-8 w-8" />
              <span className="font-semibold text-sm tracking-tight text-slate-900">HABOS</span>
            </motion.div>
          </a>
        </div>

        <div className="w-32" />
      </motion.nav>

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">

          {/* 1. Hero */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="inline-block px-4 py-1.5 bg-emerald-500/10 text-emerald-700 rounded-full text-sm font-medium mb-6">
              AI-Scored Tasks
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-5 leading-tight">
              You Capture.<br />AI Prioritizes.
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl leading-relaxed">
              Create tasks by voice, from meetings, or from email. Every task gets an
              AI-calculated score that feeds directly into your schedule.
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
              <TasksDemo />
            </div>
          </motion.div>

          {/* 2. Mock task list */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-emerald-50/50 rounded-3xl p-6 md:p-8 mb-16"
          >
            <div className="space-y-2">
              {tasks.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-4"
                >
                  <div className={`w-3 h-3 rounded-full shrink-0 ${t.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{t.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{t.source}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap">
                      Imp: {t.imp}
                    </span>
                    <span className="bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap">
                      Urg: {t.urg}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-5 leading-relaxed">
              Tasks are scored by AI weighing deadlines, project context, dependencies, and
              your patterns. High scores &rarr; scheduled first.
            </p>
          </motion.div>

          {/* 3. Where tasks come from */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-serif font-medium text-slate-900 mb-6 text-center">
              Where tasks come from
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {sources.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700"
                >
                  <s.icon size={16} className="text-slate-500" />
                  {s.label}
                </div>
              ))}
              <ArrowRight size={20} className="text-slate-400 mx-2" />
              <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-full text-sm font-semibold shadow-sm">
                AI Priority Queue
              </div>
            </div>
          </motion.div>

          {/* 4. Three benefit blocks */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid md:grid-cols-3 gap-4 mb-16"
          >
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h3 className="text-base font-semibold text-slate-900 mb-2">30 sec to capture</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Say &ldquo;remind me to follow up with Henderson about the proposal by
                Friday.&rdquo; Done. Title, due date, project, and assignee extracted.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h3 className="text-base font-semibold text-slate-900 mb-2">0 manual sorting</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Stop spending 20 minutes every morning triaging your task list. AI scores
                update as context changes&mdash;deadlines approach, dependencies complete,
                project health shifts.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Meeting &rarr; tasks automatically
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                When someone says &ldquo;John, can you handle the tile order?&rdquo; in a
                meeting, a task appears in John&rsquo;s queue. No one has to remember to
                write it down.
              </p>
            </div>
          </motion.div>

          {/* 5. Scoring breakdown strip */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-slate-900 text-white rounded-2xl px-8 py-6 mb-20"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Scoring breakdown
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {factors.map((f, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="text-slate-600">&rarr;</span>}
                  <span className="flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="text-slate-200">{f}</span>
                  </span>
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          {/* 6. Closing */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center"
          >
            <p className="text-2xl md:text-3xl font-serif font-medium text-slate-900 mb-8">
              Other task apps make you sort.<br />HABOS sorts for you.
            </p>
            <a href="/work#pricing">
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

export default Tasks;
