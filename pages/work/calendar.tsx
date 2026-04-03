import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, Layers, GitBranch } from 'lucide-react';
import CalendarDemo from './features/CalendarDemo';
import { Navbar } from '../../components/Navbar';

const scheduleBlocks = [
  {
    time: '9:00 – 10:30',
    borderColor: 'border-blue-400',
    type: 'Deep Work',
    tasks: 'Henderson proposal (critical path) + Review contract draft',
  },
  {
    time: '10:30 – 11:00',
    borderColor: 'border-amber-400',
    type: 'Admin',
    tasks: 'Reply to 3 flagged emails + Approve invoice',
  },
  {
    time: '11:00 – 12:00',
    borderColor: 'border-red-400',
    type: 'Meeting',
    tasks: 'Team sync (brief auto-generated)',
  },
  {
    time: '1:00 – 2:30',
    borderColor: 'border-green-400',
    type: 'Project',
    tasks: 'Kitchen renovation — tile selection + vendor calls',
  },
  {
    time: '2:30 – 3:00',
    borderColor: 'border-purple-400',
    type: 'Operations',
    tasks: 'Review daily reports + flag anomalies',
  },
];

const benefits = [
  {
    icon: Brain,
    title: '7-factor priority',
    description:
      'Manual rank, priority label, AI importance, AI urgency, due date, calendar fit, creation date. Tasks aren\'t just sorted — they\'re understood.',
  },
  {
    icon: Layers,
    title: 'Focus blocks',
    description:
      'Deep work, admin, project, personal — each block has an affinity filter. Critical path tasks always slot first.',
  },
  {
    icon: GitBranch,
    title: 'Dependency-aware',
    description:
      'Topological sort ensures predecessors are scheduled before dependents. The calendar respects your project\'s logic.',
  },
];

const techItems = [
  'Greedy auto-fill algorithm',
  'Topological dependency sort',
  'BroadcastChannel sync',
  'Google + Outlook + iOS calendars',
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const CalendarPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-2 bg-amber-500/10 text-amber-700 rounded-full text-sm font-medium mb-6">
              AI Scheduling
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6">
              Say &lsquo;Plan My Day.&rsquo;
              <br />
              Watch It Fill.
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              HABOS analyzes your tasks, priorities, and deadlines &mdash; then proposes a full
              schedule. You approve before anything moves.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto text-center mb-16">
              The calendar doesn&rsquo;t just display your schedule &mdash; it&rsquo;s an intelligent scheduling engine that auto-places tasks into focus blocks. Each block has an affinity filter: a project focus block only fills with tasks from that project. The auto-fill engine uses a greedy algorithm that respects dependency order through topological sort, so predecessor tasks are always scheduled before their dependents. Critical path items from your projects slot in first, automatically.
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
              <CalendarDemo />
            </div>
          </motion.div>

          {/* Mock Schedule */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-amber-50/50 rounded-3xl p-6 md:p-8 mb-16"
          >
            <h2 className="font-semibold text-slate-900 text-lg mb-6">Wednesday, March 26</h2>

            <div className="space-y-2">
              {scheduleBlocks.map((block, i) => (
                <motion.div
                  key={block.type}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                  className={`bg-white rounded-xl p-4 border-l-4 ${block.borderColor}`}
                >
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="font-mono text-sm text-slate-400">{block.time}</span>
                    <span className="font-medium text-slate-900">{block.type}</span>
                  </div>
                  <p className="text-sm text-slate-500">{block.tasks}</p>
                </motion.div>
              ))}
            </div>

            <p className="text-center text-sm text-slate-400 mt-6">
              Generated in 2 seconds. Every task placed by AI priority score.
            </p>
          </motion.div>

          {/* Benefits */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid md:grid-cols-3 gap-4 mb-20"
          >
            {benefits.map((b) => (
              <div
                key={b.title}
                className="bg-white border border-slate-200 rounded-2xl p-5"
              >
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
                  <b.icon size={20} className="text-amber-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{b.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{b.description}</p>
              </div>
            ))}
          </motion.div>

          {/* Before / After */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid md:grid-cols-2 gap-4 mb-20"
          >
            <div className="bg-slate-100 rounded-2xl p-6 md:p-8">
              <h3 className="font-semibold text-slate-900 mb-3">Without HABOS</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                Sunday night: stare at empty calendar. Try to remember what&rsquo;s urgent. Manually
                block time for each task. Get interrupted. Reschedule everything.
              </p>
              <p className="text-sm font-medium text-slate-400">~45 min of planning</p>
            </div>

            <div className="bg-amber-50 rounded-2xl p-6 md:p-8">
              <h3 className="font-semibold text-slate-900 mb-3">With HABOS</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                &ldquo;Plan my day.&rdquo; Review the proposed schedule. Drag one block to adjust.
                Approve.
              </p>
              <p className="text-sm font-medium text-amber-600">~30 seconds</p>
            </div>
          </motion.div>

          {/* Tech Strip */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-slate-950 rounded-2xl px-6 py-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-300 mb-20"
          >
            {techItems.map((item, i) => (
              <React.Fragment key={item}>
                {i > 0 && <span className="text-slate-600">&middot;</span>}
                <span>{item}</span>
              </React.Fragment>
            ))}
          </motion.div>

          {/* Closing */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center"
          >
            <p className="text-lg text-slate-400 italic mb-8">
              Motion auto-schedules without asking. HABOS proposes &mdash; you decide.
            </p>
            <a href="/#waitlist">
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

export default CalendarPage;
