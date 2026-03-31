import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Zap, Watch, Monitor, Sparkles } from 'lucide-react';
import MeetingNotesDemo from './features/MeetingNotesDemo';

const MeetingNotes: React.FC = () => {
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
              Available Now via VOIS for Work Plan
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6">
              Meeting Notes
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-8">
              Live transcription with action cards that appear as people speak.
              Watch your meeting turn into structured notes in real-time.
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
              <MeetingNotesDemo />
            </div>
          </motion.div>

          {/* Key Features */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <Zap size={24} className="text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Live Action Cards</h3>
              <p className="text-slate-600 leading-relaxed">
                When someone says "we need to schedule a follow-up" or "John, can you handle this?",
                action cards appear inline in the document. Assign tasks, set reminders, or save items
                directly from the live transcript.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <Watch size={24} className="text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Watch to Computer Handoff</h3>
              <p className="text-slate-600 leading-relaxed">
                Start recording on your Apple Watch, then seamlessly hand off to your Mac when you
                want to see the live document. The transcription continues without interruption,
                picking up exactly where you left off.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle2 size={24} className="text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Personal Action Items</h3>
              <p className="text-slate-600 leading-relaxed">
                VOIS identifies when tasks are assigned to you and highlights them in your personal view.
                Tap to add them directly to your task list or edit them on the spot. It's magical
                watching your to-dos populate automatically during the meeting.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <Monitor size={24} className="text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Word-of-Mouth Design</h3>
              <p className="text-slate-600 leading-relaxed">
                When colleagues see action items appearing in real-time on your screen during meetings,
                they'll want it too. This feature is designed to spread organically—from individual
                professionals to small teams to entire enterprises.
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
            <h2 className="text-3xl font-serif mb-8 text-center">How It Works</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Start Recording</h4>
                  <p className="text-slate-300">
                    Tap the record button on your watch or open VOIS on your Mac.
                    Transcription begins immediately.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Watch the Magic</h4>
                  <p className="text-slate-300">
                    As people speak, words appear on screen. When action items are mentioned,
                    AI-generated cards pop up inline suggesting next steps.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Act on Items</h4>
                  <p className="text-slate-300">
                    Tap cards to add tasks to your list, schedule follow-ups, or save important
                    information. Your personal items are automatically highlighted.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center font-semibold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Share & Export</h4>
                  <p className="text-slate-300">
                    Meeting over? Export the full transcript with action items, or share specific
                    sections with your team.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center"
          >
            <h3 className="text-2xl font-serif text-slate-900 mb-4">
              Ready to transform your meetings?
            </h3>
            <p className="text-slate-600 mb-8">
              Meeting Notes is included in the VOIS for Work plan.
            </p>
            <a href="/#pricing">
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

export default MeetingNotes;
