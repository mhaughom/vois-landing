import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Mic, Sparkles, Zap } from 'lucide-react';

const Email: React.FC = () => {
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
            <div className="inline-block px-4 py-2 bg-slate-200 text-slate-700 rounded-full text-sm font-medium mb-6">
              Coming Soon
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6">
              Email by Voice
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-8">
              "Read my inbox" while driving. Dictate replies in your voice. AI suggests responses
              based on your writing style.
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
              <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
                <Mic size={24} className="text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Voice Email Agent</h3>
              <p className="text-slate-600 leading-relaxed">
                Have a real-time voice conversation with your AI assistant. It reads your most
                important emails aloud, you dictate responses, and it handles the rest. Perfect
                for commutes or when you can't look at a screen.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
                <Sparkles size={24} className="text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">AI Reply Suggestions</h3>
              <p className="text-slate-600 leading-relaxed">
                VOIS learns your writing style and suggests contextually appropriate replies.
                You review, adjust if needed, and send—all without typing a single word.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
                <Zap size={24} className="text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Inline Action Cards</h3>
              <p className="text-slate-600 leading-relaxed">
                Just like in Meeting Notes, action cards appear in your email threads. "Schedule this,"
                "Add to project," "Create task"—AI suggests actions based on email context.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
                <Mail size={24} className="text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Gmail & Outlook Integration</h3>
              <p className="text-slate-600 leading-relaxed">
                Works with your existing email. Connect Gmail or Outlook, and VOIS becomes your
                intelligent email assistant without changing your workflow.
              </p>
            </motion.div>
          </div>

          {/* Use Case */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-slate-950 rounded-3xl p-10 md:p-14 text-white mb-20"
          >
            <h2 className="text-3xl font-serif mb-6 text-center">Picture This</h2>
            <div className="space-y-4 text-slate-300 text-lg leading-relaxed">
              <p>
                You're driving to a client meeting. You ask VOIS: "What's in my inbox?"
              </p>
              <p>
                It summarizes your 5 most important emails. One requires a quick response.
              </p>
              <p>
                "Reply to Sarah," you say. VOIS suggests a response based on how you usually
                write. You tweak it slightly by voice, confirm, and it sends.
              </p>
              <p>
                Another email mentions a deadline. "Add that to my tasks," you say. Done.
                An action card appears, tagged with the relevant project.
              </p>
              <p className="text-white font-semibold pt-4">
                You've cleared your inbox without touching your phone.
              </p>
            </div>
          </motion.div>

          {/* Status */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center bg-slate-50 rounded-2xl p-10"
          >
            <h3 className="text-2xl font-serif text-slate-900 mb-4">
              Currently in Development
            </h3>
            <p className="text-slate-600 mb-2">
              Email by Voice is built and working in our development environment. We're finalizing
              Gmail and Outlook integrations before launch.
            </p>
            <p className="text-slate-500 text-sm">
              Expected to be available within 6 months for VOIS for Work subscribers.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Email;
