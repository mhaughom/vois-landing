import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Navbar } from '../../components/Navbar';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const BuiltForTeams: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">Philosophy</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              Built for Teams, Not Just You
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed mb-12">
              Everyone sees what matters to them. Everyone shares the same truth.
            </p>
          </motion.div>

          {/* Hero image — full width */}
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6, delay: 0.15 }}>
            <img
              src="/philosophy/built-for-teams.jpg"
              alt="Team coordination through shared intelligence"
              className="w-full rounded-2xl mb-16"
            />
          </motion.div>

          {/* Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-slate prose-lg max-w-none"
          >
            <p>
              A project stalls for 4 days because someone missed a question buried in a Slack thread. The CEO asks "what's the status of the Henderson project?" and gets three different answers — because everyone keeps their own version of the truth. Personal AI doesn't fix any of this. Team infrastructure does.
            </p>

            {/* Role-based views — 3 clean lines */}
            <div className="not-prose my-12 bg-slate-50 rounded-2xl border border-slate-100 p-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Same data, three lenses</p>
              <div className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                  <p className="text-sm text-slate-700"><strong className="text-slate-900">Dispatcher</strong> — Routes, crew locations, unassigned jobs. Drag-to-assign board.</p>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                  <p className="text-sm text-slate-700"><strong className="text-slate-900">Field worker</strong> — Next job with directions, client history, one-tap completion.</p>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                  <p className="text-sm text-slate-700"><strong className="text-slate-900">CEO</strong> — Revenue, active projects, flagged issues. Weekly AI summary.</p>
                </div>
              </div>
            </div>

            <p>
              The biggest tax on small businesses isn't labor cost. It's communication latency. A 5-minute decision takes 4 days because of email chains, missed messages, and "I'll get to it when I'm back at my desk." Every feature in VOIS is designed to collapse the time between "someone needs a decision" and "the decision is made."
            </p>

            <blockquote className="border-l-4 border-slate-900 pl-6 my-12 text-xl font-serif italic text-slate-700">
              "A company doesn't move at the speed of its fastest person. It moves at the speed of its slowest handoff."
            </blockquote>
          </motion.div>

          {/* Prev / Next */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-20 pt-12 border-t border-slate-100 flex justify-between"
          >
            <a href="/philosophy/one-assistant" className="group flex items-center gap-3">
              <ArrowLeft size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              <div>
                <p className="text-sm text-slate-400 mb-1">Previous</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">One Assistant</p>
              </div>
            </a>
            <a href="/philosophy/suggestions-not-menus" className="group flex items-center gap-3 text-right">
              <div>
                <p className="text-sm text-slate-400 mb-1">Next</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">Suggestions, Not Menus</p>
              </div>
              <ArrowRight size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default BuiltForTeams;
