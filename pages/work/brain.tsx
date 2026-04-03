import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, X, Check, Search, ArrowRight } from 'lucide-react';
import { Navbar } from '../../components/Navbar';

const sources = [
  'Voice recordings', 'Documents', 'Emails', 'Contacts', 'Chat messages',
  'Playbooks', 'Products', 'Orders', 'Bookings', 'CRM records',
  'Tickets', 'Form submissions', 'Jobs & visits', 'Routes', 'Websites',
  'Social posts', 'Presentations', 'Project notes', 'Meeting transcripts',
];

const painPoints = [
  'Search Gmail... nothing',
  'Check Slack... maybe?',
  'Open CRM... scroll scroll scroll',
  'Ask a colleague... they\'re in a meeting',
  'Give up and wing it',
];

const scenarios = [
  {
    question: 'Where are we with the Henderson deal?',
    answer: 'CRM pipeline, 3 email threads, last meeting notes',
  },
  {
    question: 'What did Sarah say about the budget?',
    answer: 'Voice recording transcript, project comment, Slack message',
  },
  {
    question: 'Find everything about permit delays',
    answer: '2 project notes, 1 email chain, 1 form submission, 1 job log',
  },
];

const techStats = [
  '512-dim embeddings',
  'HNSW vector indexes',
  'Hybrid semantic + keyword',
  '11 search functions',
];

const VoisBrain: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-2 bg-cyan-500/10 text-cyan-700 rounded-full text-sm font-medium mb-6">
              Core Feature
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6">
              One Question. Nineteen Sources.<br />One Second.
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Ask anything about your business and get a cited answer before you finish your coffee.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto text-center mb-16">
              When you ask &lsquo;what did we discuss about the Johnson project?&rsquo; &mdash; HABOS doesn&rsquo;t search one app. It searches meeting transcripts, project notes, email threads, CRM timeline, task comments, and chat messages simultaneously. A company using separate tools for each of these &mdash; Notion, HubSpot, Gmail, Slack, Asana &mdash; would need to search five products and mentally synthesize the results. HABOS returns a ranked, citation-backed answer in under a second.
            </p>
          </motion.div>

          {/* Source Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-20"
          >
            <div className="bg-gradient-to-br from-cyan-50 to-slate-50 rounded-3xl p-8">
              <p className="text-xs uppercase tracking-widest text-cyan-600 text-center mb-6">
                All searched simultaneously
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {sources.map((source, i) => (
                  <motion.span
                    key={source}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 + i * 0.03 }}
                    className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 shadow-sm"
                  >
                    {source}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Before / After Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="grid md:grid-cols-2 gap-6 mb-20"
          >
            {/* Without */}
            <div className="bg-slate-100 border border-slate-200 rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-5">Without VOIS Brain</h3>
              <ul className="space-y-3 mb-6">
                {painPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <X size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">{point}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm font-medium text-slate-400">~20 minutes. Partial answer.</p>
            </div>

            {/* With */}
            <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-5">With VOIS Brain</h3>
              <div className="flex items-start gap-3 mb-5">
                <Check size={18} className="text-cyan-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700 italic">
                  &ldquo;What did we discuss about the Johnson project?&rdquo;
                </span>
              </div>
              <div className="bg-white/70 border border-cyan-100 rounded-xl p-4 mb-6">
                <p className="text-xs text-cyan-600 font-medium mb-2">Found across 4 sources:</p>
                <p className="text-xs text-slate-500 mb-2">
                  meeting transcript (Mar 12) &middot; email thread (Mar 15) &middot; CRM note (Mar 18) &middot; project update (Mar 20)
                </p>
                <p className="text-sm text-slate-700">
                  The Johnson kitchen renovation is on track with permits approved...
                </p>
              </div>
              <p className="text-sm font-medium text-cyan-700">0.8 seconds. Full picture.</p>
            </div>
          </motion.div>

          {/* Technical Strip */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-20"
          >
            <div className="bg-slate-900 text-white rounded-2xl px-8 py-5 flex flex-wrap items-center justify-center gap-x-0 gap-y-2">
              {techStats.map((stat, i) => (
                <React.Fragment key={stat}>
                  <span className="text-sm font-mono tracking-tight text-slate-300 px-4">
                    {stat}
                  </span>
                  {i < techStats.length - 1 && (
                    <span className="text-slate-600 hidden md:inline">|</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          {/* Example Scenarios */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid md:grid-cols-3 gap-5 mb-20"
          >
            {scenarios.map((s) => (
              <div key={s.question} className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="flex items-start gap-2 mb-3">
                  <Search size={15} className="text-cyan-500 flex-shrink-0 mt-0.5" />
                  <p className="font-medium text-slate-900 text-sm leading-snug">{s.question}</p>
                </div>
                <div className="flex items-start gap-2">
                  <ArrowRight size={14} className="text-slate-300 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-500 leading-snug">{s.answer}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Closing */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-center"
          >
            <p className="text-lg text-slate-400 italic mb-8">
              Other platforms search one app at a time. VOIS searches your entire business at once.
            </p>
            <a href="/work#waitlist">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-slate-900 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                Join Waitlist
              </motion.button>
            </a>
          </motion.div>

        </div>
      </main>
    </div>
  );
};

export default VoisBrain;
