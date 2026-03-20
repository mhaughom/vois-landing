import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ListTodo, Mic, BarChart3, Mail } from 'lucide-react';

const Tasks: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-6 md:px-12 bg-white/80 backdrop-blur-xl border-b border-slate-100"
        style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}
      >
        <a href="/work">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 px-4 py-2 rounded-full border border-slate-100 shadow-sm"
          >
            <ArrowLeft size={16} className="text-slate-600" />
            <span className="font-medium text-sm text-slate-600">Back to Work</span>
          </motion.div>
        </a>

        <div className="absolute left-1/2 -translate-x-1/2">
          <a href="/">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 px-4 py-2 rounded-full border border-slate-100 shadow-sm"
            >
              <img src="/Logo/vois-logo.svg" alt="Vois" className="h-8 w-8" />
              <span className="font-semibold text-sm tracking-tight text-slate-900">VOIS</span>
            </motion.div>
          </a>
        </div>

        <div className="w-32" />
      </motion.nav>

      {/* Hero Section */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-2 bg-emerald-500/10 text-emerald-700 rounded-full text-sm font-medium mb-6">
              AI-Scored Task Management
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6">
              Tasks &mdash; AI-Scored
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-8">
              Create tasks by voice, from meeting transcripts, or from AI agent output.
              Every task gets an AI-calculated importance and urgency score that feeds directly into how your day gets scheduled.
            </p>
          </motion.div>

          {/* Key Features */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <Mic size={24} className="text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Voice to Structured Task</h3>
              <p className="text-slate-600 leading-relaxed">
                Speak naturally and VOIS creates a structured task with title, due date,
                priority, and project assignment. No forms, no typing.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 size={24} className="text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">AI Importance &amp; Urgency Scoring</h3>
              <p className="text-slate-600 leading-relaxed">
                The scoring engine weighs deadlines, project context, dependencies, and domain
                to surface what actually matters &mdash; not just what's loudest.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <ListTodo size={24} className="text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Meeting-to-Task Pipeline</h3>
              <p className="text-slate-600 leading-relaxed">
                Action items extracted from meeting transcripts flow in automatically.
                No more manually reviewing notes to find what you committed to.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <Mail size={24} className="text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Email-to-Task</h3>
              <p className="text-slate-600 leading-relaxed">
                Action items from your inbox become tasks with a source link. Tasks feed the
                scheduling AI &mdash; highest scores get scheduled first.
              </p>
            </motion.div>
          </div>

          {/* How Scoring Works */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-slate-950 rounded-3xl p-10 md:p-14 text-white mb-20"
          >
            <h2 className="text-3xl font-serif mb-6 text-center">How AI Scoring Works</h2>
            <div className="space-y-4 text-slate-300 text-lg leading-relaxed">
              <p>
                Every task receives two scores: <strong className="text-white">Importance</strong> (how
                much it matters to your goals) and <strong className="text-white">Urgency</strong> (how
                time-sensitive it is).
              </p>
              <p>
                The AI weighs deadlines, project health, dependencies, domain context, and your
                personal patterns to calculate these scores automatically.
              </p>
              <p>
                High-scoring tasks get scheduled first when the AI plans your day. Low-scoring
                noise stays out of your focus time.
              </p>
              <p className="text-white font-semibold pt-4">
                You capture. VOIS prioritizes.
              </p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center"
          >
            <a href="/work#pricing">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-slate-900 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                See Pricing
              </motion.button>
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Tasks;
