import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, TrendingUp, BarChart3, AlertCircle } from 'lucide-react';

const Operations: React.FC = () => {
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
              Operations
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-8">
              AI for ongoing processes. Identify bottlenecks in real-time. Keep the
              engines running smoothly.
            </p>
          </motion.div>

          {/* Distinction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 mb-16 text-center"
          >
            <h3 className="text-xl font-semibold text-emerald-900 mb-3">Projects vs. Operations</h3>
            <p className="text-emerald-800 leading-relaxed">
              <strong>Projects</strong> have a start and an end. <strong>Operations</strong> are continuous
              processes that fuel your company—customer support, manufacturing, supply chain, sales pipeline.
              They never stop, and VOIS helps you keep them optimized.
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
                <RefreshCw size={24} className="text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Continuous Monitoring</h3>
              <p className="text-slate-600 leading-relaxed">
                Operations AI watches your ongoing processes 24/7. It learns normal patterns and
                alerts you when something deviates—before it becomes a crisis.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <AlertCircle size={24} className="text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Bottleneck Detection</h3>
              <p className="text-slate-600 leading-relaxed">
                What's slowing things down right now? Operations AI searches through massive amounts
                of data—emails, reports, meeting notes—to pinpoint exactly where the friction is.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 size={24} className="text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Voice Reports Integration</h3>
              <p className="text-slate-600 leading-relaxed">
                Team members submit operational reports by voice (see Voice Reports). Operations AI
                aggregates this information to build a real-time understanding of what's happening
                on the ground.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp size={24} className="text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Continuous Improvement</h3>
              <p className="text-slate-600 leading-relaxed">
                Over time, Operations AI identifies recurring issues and suggests process improvements.
                It learns from your data to make your operations more efficient.
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
            <h2 className="text-3xl font-serif mb-6 text-center">Example: Manufacturing Floor</h2>
            <div className="space-y-4 text-slate-300 text-lg leading-relaxed">
              <p>
                Your factory runs three shifts. Supervisors submit voice reports at the end of each
                shift—equipment status, production numbers, any issues encountered.
              </p>
              <p>
                Operations AI ingests these reports and notices a pattern: Machine #7 has had minor
                issues three shifts in a row. It's not broken, but it's trending toward failure.
              </p>
              <p>
                You get an alert: "Machine #7 showing signs of degradation. Recommend maintenance
                before it impacts production."
              </p>
              <p>
                You schedule preventive maintenance. Crisis averted. No downtime.
              </p>
              <p className="text-white font-semibold pt-4">
                Operations AI finds problems you didn't know you had.
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
              Operations is built and functional in our development environment. We're refining
              the critical path algorithms and integrations before enterprise launch.
            </p>
            <p className="text-slate-500 text-sm">
              Expected to be available as part of the enterprise offering within 6-12 months.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Operations;
