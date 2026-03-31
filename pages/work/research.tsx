import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mic, Brain, FolderOpen, Search, BookOpen, MessageSquare, Sparkles, Check } from 'lucide-react';
import ResearchDemo from './features/ResearchDemo';

const Research: React.FC = () => {
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
              <img src="/Logo/habos-icon.svg" alt="HABOS" className="h-8 w-8" />
              <span className="font-semibold text-sm tracking-tight text-slate-900">HABOS</span>
            </motion.div>
          </a>
        </div>

        <div className="w-32" />
      </motion.nav>

      {/* Main Content */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">

          {/* 1. Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-2 bg-purple-500/10 text-purple-700 rounded-full text-sm font-medium mb-6">
              AI Research
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6">
              Ask a Question.<br />Get a Cited Report.
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              HABOS delegates deep research to Perplexity AI, refines the question with clarifying prompts, and delivers a structured executive summary — then embeds everything into your Brain for future retrieval.
            </p>
          </motion.div>

          {/* 2. Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-20 rounded-3xl border border-slate-200 overflow-hidden shadow-lg bg-white"
          >
            <div className="p-2 md:p-4">
              <ResearchDemo />
            </div>
          </motion.div>

          {/* 3. Mock Research Flow */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-purple-50/50 rounded-3xl p-6 md:p-8 mb-20"
          >
            <h3 className="text-sm font-medium text-purple-600 uppercase tracking-wider mb-6 text-center">How it works</h3>

            {/* User question — right aligned */}
            <div className="flex justify-end mb-4">
              <div className="max-w-sm bg-purple-600 text-white rounded-2xl rounded-br-md px-5 py-3 text-sm leading-relaxed shadow-sm">
                What's the competitive landscape for AI scheduling tools in field service?
              </div>
            </div>

            {/* AI clarification — left aligned */}
            <div className="flex justify-start mb-2">
              <div className="max-w-md bg-white border border-slate-200 rounded-2xl rounded-bl-md px-5 py-4 text-sm text-slate-700 leading-relaxed shadow-sm">
                <p className="mb-3">Before I research, two quick questions:</p>
                <p className="mb-1"><span className="font-semibold">1)</span> Are you focused on US market or global?</p>
                <p><span className="font-semibold">2)</span> Company size: SMB or enterprise?</p>
              </div>
            </div>

            {/* Answer pills */}
            <div className="flex justify-start gap-2 mb-6 ml-2">
              <div className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200 cursor-pointer hover:bg-purple-200 transition-colors flex items-center gap-1.5">
                <Check size={12} /> US market
              </div>
              <div className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200 cursor-pointer hover:bg-purple-200 transition-colors flex items-center gap-1.5">
                <Check size={12} /> SMB
              </div>
            </div>

            {/* Result card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 mt-4 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-purple-600 font-medium uppercase tracking-wider mb-1">Executive Summary</p>
                  <h4 className="text-base font-semibold text-slate-900">Competitive Landscape: AI Scheduling in Field Service</h4>
                </div>
                <Sparkles size={18} className="text-purple-500 mt-1 flex-shrink-0" />
              </div>

              <ul className="space-y-2.5 mb-4">
                <li className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-purple-500 mt-0.5 flex-shrink-0">1.</span>
                  <span><strong className="text-slate-800">ServiceTitan dominates enterprise</strong> with 42% market share, but their SMB offering is limited and overpriced at $89/user/mo.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-purple-500 mt-0.5 flex-shrink-0">2.</span>
                  <span><strong className="text-slate-800">Jobber and Housecall Pro compete on simplicity</strong> for SMB, but neither offers AI-native scheduling — both bolt on basic automation.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-purple-500 mt-0.5 flex-shrink-0">3.</span>
                  <span><strong className="text-slate-800">AI-first entrants (FieldPulse, Zuper) are gaining</strong>, growing 3x YoY in the $10-30/user range, signaling strong SMB demand for intelligent scheduling.</span>
                </li>
              </ul>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium flex items-center gap-1">
                  <BookOpen size={11} /> 12 citations
                </span>
                <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
                  <Brain size={11} /> Embedded in Brain
                </span>
              </div>
            </div>
          </motion.div>

          {/* 4. Three Benefit Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.0 }}
              className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm"
            >
              <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Mic size={20} className="text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Voice to research</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Say "research competitor pricing in our space" during a voice note. HABOS detects the research intent and kicks off the analysis automatically.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm"
            >
              <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Brain size={20} className="text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Always in your Brain</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Completed research is chunked, embedded (512-dim vectors), and searchable forever. Ask about it months later — the Brain remembers.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm"
            >
              <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <FolderOpen size={20} className="text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Project-linked context</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Link research to projects. Future research on the same topic pulls in prior findings for richer, non-repetitive analysis.
              </p>
            </motion.div>
          </div>

          {/* 5. Tech Strip */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-slate-950 rounded-2xl px-6 py-5 mb-20 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          >
            {[
              'Perplexity sonar-pro',
              'AI clarifying questions',
              'RAG-embedded results',
              'Cross-project context',
              'Persistent chat follow-ups',
            ].map((label) => (
              <span key={label} className="text-sm text-slate-300 font-medium whitespace-nowrap">
                {label}
              </span>
            ))}
          </motion.div>

          {/* 6. Closing */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-slate-900 mb-4">
              Other tools give you a search bar.<br />HABOS gives you a research team.
            </h2>
            <a
              href="/#waitlist"
              className="inline-flex items-center gap-2 mt-6 px-8 py-3.5 bg-purple-600 text-white rounded-full font-medium text-sm hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20"
            >
              Join Waitlist
            </a>
          </motion.div>

        </div>
      </main>
    </div>
  );
};

export default Research;
