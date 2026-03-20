import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mic, Split, Globe, Sparkles } from 'lucide-react';

const VoiceNotes: React.FC = () => {
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
            <div className="inline-block px-4 py-2 bg-indigo-500/10 text-indigo-700 rounded-full text-sm font-medium mb-6">
              Core Feature
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6">
              Voice Notes &mdash; Smart Router
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-8">
              Record a 30-second voice note about your day and watch VOIS split it apart.
              The Smart Router detects every intent in a single recording and routes each one to the right place automatically.
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
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <Split size={24} className="text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Single Recording, Multiple Outputs</h3>
              <p className="text-slate-600 leading-relaxed">
                One audio waveform splits into a task card, calendar event, note, and person mention.
                "Mentioned Sarah needs the report by Friday" becomes a task created, assigned to Sarah,
                due Friday, linked to your project.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <Globe size={24} className="text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Multi-Language Transcription</h3>
              <p className="text-slate-600 leading-relaxed">
                Powered by Deepgram Nova-3, VOIS transcribes your voice in multiple languages
                with industry-leading accuracy. Speak naturally and let AI handle the rest.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <Sparkles size={24} className="text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">AI-Generated Highlights</h3>
              <p className="text-slate-600 leading-relaxed">
                Highlights are generated automatically for quick scanning without re-listening.
                Skim the key points from any recording in seconds.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <Mic size={24} className="text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">No Tagging, No Sorting</h3>
              <p className="text-slate-600 leading-relaxed">
                No need to open five apps. Just talk. VOIS understands context, detects intents,
                and routes everything to the right place automatically.
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
            <h2 className="text-3xl font-serif mb-8 text-center">How the Smart Router Works</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center font-semibold">1</div>
                <div>
                  <h4 className="font-semibold mb-2">Record</h4>
                  <p className="text-slate-300">Tap record on your phone, watch, or Mac and talk naturally about your day.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center font-semibold">2</div>
                <div>
                  <h4 className="font-semibold mb-2">Detect</h4>
                  <p className="text-slate-300">AI detects every intent &mdash; tasks, events, updates, mentions &mdash; in a single recording.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center font-semibold">3</div>
                <div>
                  <h4 className="font-semibold mb-2">Route</h4>
                  <p className="text-slate-300">Each intent is routed to the right place: tasks, calendar, projects, people. Automatically.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center font-semibold">4</div>
                <div>
                  <h4 className="font-semibold mb-2">Review</h4>
                  <p className="text-slate-300">See everything VOIS created from your recording. Edit, approve, or dismiss &mdash; you're always in control.</p>
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
              Other apps let you record voice memos. VOIS understands them.
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

export default VoiceNotes;
