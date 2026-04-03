import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Navbar } from '../../components/Navbar';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const TwoInterfaces: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        {/* Narrow centered column — editorial feel */}
        <div className="max-w-2xl mx-auto">
          {/* Hero */}
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">Philosophy</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              Two Interfaces, One System
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed mb-12">
              Humans get screens. Agents get APIs. Same tools, same data.
            </p>
          </motion.div>

          {/* Full-width image */}
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6, delay: 0.15 }}>
            <img
              src="/philosophy/two-interfaces.jpg"
              alt="Dual interfaces — visual dashboards and structured APIs"
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
              Most "AI-powered" products fall into one of two traps. First: bolt a chatbot onto existing UI and make the AI click buttons, navigate menus, read screens. It burns 15,000 tokens to do what a function call handles in 200. When the UI changes, the agent breaks. Second: build AI-only with no human interface. The agent is fast — but it's a black box. It "handled" your email, but you can't see what it sent.
            </p>

            {/* Side-by-side: Human vs Agent interface */}
            <div className="not-prose my-12 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm font-semibold text-slate-700">Human interface</span>
                </div>
                <p className="text-sm text-slate-600">Visual week view. Color-coded events. Drag to reschedule. Spatial reasoning about your time.</p>
              </div>
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-semibold text-slate-700">Agent interface</span>
                </div>
                <p className="text-sm text-slate-600 font-mono text-xs leading-relaxed">manage_calendar(action='create', date='Thu', time='14:00')</p>
                <p className="text-sm text-slate-500 mt-2">Same calendar. Same event. Same permissions.</p>
              </div>
            </div>

            <p className="not-prose text-center text-lg font-medium text-slate-700 bg-slate-50 rounded-2xl border border-slate-100 py-5 px-6 my-12">
              Agent through web UI: <span className="text-red-500">15,000 tokens.</span> Agent via function call: <span className="text-emerald-600">200 tokens.</span> <strong>75x.</strong>
            </p>

            <blockquote className="border-l-4 border-slate-900 pl-6 my-12 text-xl font-serif italic text-slate-700">
              "Making AI click buttons is like making a pilot walk. Give each intelligence the interface it deserves."
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
            <a href="/philosophy/suggestions-not-menus" className="group flex items-center gap-3">
              <ArrowLeft size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              <div>
                <p className="text-sm text-slate-400 mb-1">Previous</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">Suggestions, Not Menus</p>
              </div>
            </a>
            <a href="/philosophy/capture-your-brain" className="group flex items-center gap-3 text-right">
              <div>
                <p className="text-sm text-slate-400 mb-1">Next</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">Capture Your Brain</p>
              </div>
              <ArrowRight size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default TwoInterfaces;
