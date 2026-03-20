import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, GripVertical, Layers, RefreshCw } from 'lucide-react';

const CalendarPage: React.FC = () => {
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
            <div className="inline-block px-4 py-2 bg-amber-500/10 text-amber-700 rounded-full text-sm font-medium mb-6">
              AI Scheduling
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6">
              Calendar &mdash; AI Scheduling
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-8">
              Tell VOIS what you need to get done. The AI looks at your tasks, priorities, deadlines,
              and existing calendar &mdash; then proposes a full schedule you preview before it commits.
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
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <Calendar size={24} className="text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Chat to Schedule</h3>
              <p className="text-slate-600 leading-relaxed">
                Say "Plan my day" and get a visual schedule preview. Review the proposed blocks,
                make adjustments, and approve when you're ready. Nothing moves without your say-so.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <Layers size={24} className="text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Container Blocks</h3>
              <p className="text-slate-600 leading-relaxed">
                Themed time blocks &mdash; Deep Work, Admin, Creative &mdash; with tasks packed inside by priority.
                Life area time blocks (Work, Personal, Family) with strict or flexible modes.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <GripVertical size={24} className="text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Drag-Ripple Effect</h3>
              <p className="text-slate-600 leading-relaxed">
                Move one block and see the chain reaction before confirming. Understand exactly
                how rescheduling ripples through the rest of your day.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <RefreshCw size={24} className="text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Multi-Calendar Sync</h3>
              <p className="text-slate-600 leading-relaxed">
                Google Calendar, Outlook, iOS &mdash; all synced. VOIS sees your full picture across
                every calendar so scheduling decisions account for everything.
              </p>
            </motion.div>
          </div>

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-slate-950 rounded-3xl p-10 md:p-14 text-white mb-20"
          >
            <h2 className="text-3xl font-serif mb-8 text-center">How AI Scheduling Works</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center font-semibold text-slate-900">1</div>
                <div>
                  <h4 className="font-semibold mb-2">Tell VOIS Your Goals</h4>
                  <p className="text-slate-300">Say "Plan my day" or "I need to finish the proposal and prep for tomorrow's meeting."</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center font-semibold text-slate-900">2</div>
                <div>
                  <h4 className="font-semibold mb-2">AI Proposes a Schedule</h4>
                  <p className="text-slate-300">VOIS analyzes tasks, priorities, deadlines, and your calendar to create themed time blocks.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center font-semibold text-slate-900">3</div>
                <div>
                  <h4 className="font-semibold mb-2">Preview &amp; Adjust</h4>
                  <p className="text-slate-300">Drag blocks, see ripple effects, and refine until the schedule feels right.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center font-semibold text-slate-900">4</div>
                <div>
                  <h4 className="font-semibold mb-2">Approve</h4>
                  <p className="text-slate-300">One tap and your schedule is set. Events sync across all your calendars.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Closing */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center"
          >
            <p className="text-lg text-slate-400 italic mb-8">
              Motion auto-schedules without asking. VOIS proposes, you decide.
            </p>
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

export default CalendarPage;
