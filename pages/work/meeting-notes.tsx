import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Zap, Watch, Monitor, Sparkles } from 'lucide-react';
import MeetingNotesDemo from './features/MeetingNotesDemo';
import { Navbar } from '../../components/Navbar';

const MeetingNotes: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

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

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mx-auto mb-16 text-center">
            <p className="text-lg text-slate-600 leading-relaxed">
              Live transcription with action cards that appear as people speak. When someone says &lsquo;we need to schedule a follow-up&rsquo; or &lsquo;John, can you handle this?&rsquo; — action items surface inline in the document. HABOS identifies when tasks are assigned to you and highlights them in your personal view. Share meeting notes via a secure link — recipients see the full transcript and brief without creating an account. That shared link is also a growth engine: it captures leads, demos the product, and converts with targeted offers.
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
