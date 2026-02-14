import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Mic, Clock, CheckSquare } from 'lucide-react';

const Reports: React.FC = () => {
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
              Voice Reports
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-8">
              Talk reports into existence. Walk through a site inspection speaking your observations—
              AI generates a formatted PDF instantly.
            </p>
          </motion.div>

          {/* The Problem */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-8 mb-16"
          >
            <h3 className="text-xl font-semibold text-amber-900 mb-3 text-center">The Report Writing Problem</h3>
            <p className="text-amber-800 leading-relaxed text-center">
              For field workers, nurses, inspectors, and many professionals, writing reports on touchscreens
              or computers is a <strong>massive time sink</strong>. It's slow, tedious, and people often
              leave out details because typing is too cumbersome. Voice Reports changes everything.
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
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                <Mic size={24} className="text-violet-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Just Talk</h3>
              <p className="text-slate-600 leading-relaxed">
                Open VOIS, tap record, and talk through your observations. No typing, no forms,
                no checkboxes. AI listens, structures, and formats everything automatically.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                <FileText size={24} className="text-violet-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Instant Formatting</h3>
              <p className="text-slate-600 leading-relaxed">
                AI generates a properly formatted report—headings, sections, bullet points, summaries.
                Export as PDF, Word, or any format you need. It's ready to submit immediately.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                <Clock size={24} className="text-violet-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">10x Faster</h3>
              <p className="text-slate-600 leading-relaxed">
                People talk 3-4x faster than they type. Add in AI formatting and you're looking at
                10x time savings. What used to take 30 minutes now takes 3.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                <CheckSquare size={24} className="text-violet-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Richer Information</h3>
              <p className="text-slate-600 leading-relaxed">
                When reporting is this easy, people include more detail. You get better data,
                more context, and clearer communication—all because talking is effortless.
              </p>
            </motion.div>
          </div>

          {/* Use Cases */}
          <div className="mb-20">
            <h2 className="text-3xl font-serif text-slate-900 mb-8 text-center">Perfect For</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="bg-slate-50 rounded-xl p-6 text-center"
              >
                <h4 className="font-semibold text-slate-900 mb-2">Field Workers</h4>
                <p className="text-sm text-slate-600">
                  Site inspections, safety reports, maintenance logs
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="bg-slate-50 rounded-xl p-6 text-center"
              >
                <h4 className="font-semibold text-slate-900 mb-2">Healthcare</h4>
                <p className="text-sm text-slate-600">
                  Nurse notes, patient observations, shift handoffs
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="bg-slate-50 rounded-xl p-6 text-center"
              >
                <h4 className="font-semibold text-slate-900 mb-2">Sales & Service</h4>
                <p className="text-sm text-slate-600">
                  Client meetings, service calls, follow-up notes
                </p>
              </motion.div>
            </div>
          </div>

          {/* Example Workflow */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="bg-slate-950 rounded-3xl p-10 md:p-14 text-white mb-20"
          >
            <h2 className="text-3xl font-serif mb-6 text-center">Example: Construction Site Inspection</h2>
            <div className="space-y-4 text-slate-300 text-lg leading-relaxed">
              <p>
                You arrive at the site with your phone or watch. Tap record in VOIS.
              </p>
              <p>
                "Site inspection, Building 3, March 15th. Weather conditions: clear, 65 degrees.
                Foundation looks solid—no cracks visible. Electrical rough-in is 80% complete,
                on schedule. Plumbing issue in Unit 204—leak under the sink, needs repair before
                inspection. HVAC ducts installed, awaiting final connections..."
              </p>
              <p>
                You walk and talk for 5 minutes, covering everything you see.
              </p>
              <p>
                Stop recording. AI generates a formatted inspection report with sections,
                bullet points, and a summary. The plumbing issue is flagged as urgent.
              </p>
              <p className="text-white font-semibold pt-4">
                Export PDF. Email to project manager. Done. Total time: 6 minutes.
              </p>
            </div>
          </motion.div>

          {/* Integration */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="bg-indigo-50 border border-indigo-200 rounded-2xl p-10 mb-20"
          >
            <h3 className="text-2xl font-serif text-indigo-900 mb-4 text-center">
              Powers Operations AI
            </h3>
            <p className="text-indigo-800 leading-relaxed text-center">
              Voice Reports isn't just about saving time—it feeds critical data into Operations AI.
              When your team submits detailed voice reports, Operations AI can identify patterns,
              spot bottlenecks, and alert you to problems before they escalate. It's the foundation
              of intelligent operations management.
            </p>
          </motion.div>

          {/* Status */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="text-center bg-slate-50 rounded-2xl p-10"
          >
            <h3 className="text-2xl font-serif text-slate-900 mb-4">
              Currently in Development
            </h3>
            <p className="text-slate-600 mb-2">
              Voice Reports is built and working in our development environment. We're refining
              formatting templates and export options for different industries.
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

export default Reports;
