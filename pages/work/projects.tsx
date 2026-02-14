import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FolderKanban, TrendingUp, AlertTriangle, Target } from 'lucide-react';

const Projects: React.FC = () => {
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
              Projects
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-8">
              Organize your work into projects. AI automatically tags conversations, meetings,
              and documents—then identifies what's blocking progress.
            </p>
          </motion.div>

          {/* Current Version Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-12 text-center"
          >
            <p className="text-amber-900">
              <strong>Current Version:</strong> Basic project categorization with voice capture and task management.
              <br />
              <strong>Coming Soon:</strong> Advanced features including critical path analysis, email integration,
              and cross-team collaboration.
            </p>
          </motion.div>

          {/* Available Now Features */}
          <div className="mb-20">
            <h2 className="text-3xl font-serif text-slate-900 mb-8 text-center">Available Now</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                  <FolderKanban size={24} className="text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Project Categories</h3>
                <p className="text-slate-600 leading-relaxed">
                  Create projects and categorize your voice notes, tasks, and calendar items.
                  Everything stays organized within your VOIS workspace.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                  <Target size={24} className="text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Voice-First Capture</h3>
                <p className="text-slate-600 leading-relaxed">
                  Speak your project updates, ideas, and tasks. AI automatically routes them to
                  the right project and creates actionable items.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Coming Soon: Enterprise Features */}
          <div className="mb-20">
            <h2 className="text-3xl font-serif text-slate-900 mb-8 text-center">Coming Soon: Enterprise Features</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-slate-50 rounded-2xl p-8 border border-slate-200"
              >
                <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center mb-4">
                  <AlertTriangle size={24} className="text-slate-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Critical Path Analysis</h3>
                <p className="text-slate-600 leading-relaxed">
                  AI continuously analyzes all project data—emails, meetings, documents—to identify
                  bottlenecks and blockers. Get alerts when something's preventing forward progress.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-slate-50 rounded-2xl p-8 border border-slate-200"
              >
                <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp size={24} className="text-slate-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Auto-Tagging & Context</h3>
                <p className="text-slate-600 leading-relaxed">
                  Email threads, meeting notes, and documents automatically get tagged with relevant
                  projects. AI builds context over time, making project management effortless.
                </p>
              </motion.div>
            </div>
          </div>

          {/* The Vision */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-slate-950 rounded-3xl p-10 md:p-14 text-white mb-20"
          >
            <h2 className="text-3xl font-serif mb-6 text-center">The Full Vision</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 text-lg leading-relaxed mb-4">
                VOIS Projects will evolve into a comprehensive project intelligence system. Imagine
                an AI that:
              </p>
              <ul className="text-slate-300 space-y-3">
                <li>
                  <strong>Watches everything:</strong> Every email, meeting, document, and conversation
                  related to a project is automatically tracked and analyzed.
                </li>
                <li>
                  <strong>Finds the bottleneck:</strong> Searches through massive amounts of data to
                  identify exactly what's preventing progress right now.
                </li>
                <li>
                  <strong>Keeps you informed:</strong> Proactively alerts project managers and team
                  members when critical issues arise.
                </li>
                <li>
                  <strong>Answers questions:</strong> "Why is this project behind schedule?" Chat with
                  your project AI to understand complex dependencies and timelines.
                </li>
              </ul>
              <p className="text-slate-300 text-lg leading-relaxed mt-6">
                We're building this incrementally—starting with solid project organization, then adding
                intelligence as we grow.
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
            <h3 className="text-2xl font-serif text-slate-900 mb-4">
              Start organizing your projects today
            </h3>
            <p className="text-slate-600 mb-8">
              Projects is included in the VOIS for Work plan.
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

export default Projects;
