import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Navbar } from '../../components/Navbar';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const AINative: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">Philosophy</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              The End of Data Entry
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed mb-16">
              Every business tool you use today was designed before AI existed. HABOS was not. You'll feel the difference on day one — the forms, the fields, the copy-paste between apps — it's over.
            </p>
          </motion.div>

          {/* Hero image placeholder */}
          <motion.div
            initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6, delay: 0.15 }}
            className="w-full aspect-[2/1] rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200/60 flex items-center justify-center mb-16"
          >
            <span className="text-sm text-slate-400 font-medium">Hero illustration</span>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-slate prose-lg max-w-none"
          >
            <h2 className="text-2xl font-serif text-slate-900 mt-0">The bolt-on problem</h2>
            <p>
              Most software companies took products built over two decades and added an AI chatbot in the corner. The chatbot can answer questions about data it was never designed to access, suggest actions it has no authority to take, and search across systems that were never meant to share context.
            </p>
            <p>
              The result is a veneer of intelligence on top of fundamentally unintelligent architecture. The AI sits beside the software. It doesn't <em>live inside</em> it.
            </p>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">Built with intelligence at the foundation</h2>
            <p>
              HABOS was designed from day one with AI as a structural element, not a feature. The three core systems that power the platform — the Smart Router, the Brain, and the Agent Orchestrator — are all AI-native. They don't wrap existing software in a chatbot. They <em>are</em> the software.
            </p>

            <div className="not-prose my-12 grid gap-6">
              {[
                {
                  title: 'The Smart Router',
                  desc: 'A voice intent classification engine that takes a single 30-second recording and extracts multiple structured business actions — tasks, calendar events, CRM updates, inventory adjustments — all at once. Not speech-to-text. Speech-to-understanding.',
                },
                {
                  title: 'The Brain',
                  desc: 'A unified semantic search layer across 19 data sources, queried in parallel. When you ask a question, HABOS searches your meetings, emails, CRM, projects, voice notes, documents, and playbooks simultaneously — and understands meaning, not just keywords.',
                },
                {
                  title: 'The Agent Orchestrator',
                  desc: 'An autonomous planning-and-execution engine that can break complex tasks into steps, execute tools, pause for your approval on anything high-risk, and resume — even after server restarts. Not a chatbot with plugins. A full state machine with budget tracking and fault recovery.',
                },
              ].map((item) => (
                <div key={item.title} className="bg-slate-50 rounded-2xl p-6 md:p-8 border border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-base">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Mid-content image placeholder */}
            <div className="not-prose w-full aspect-[16/9] rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/60 flex items-center justify-center my-12">
              <span className="text-sm text-blue-300 font-medium">Architecture diagram</span>
            </div>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">What AI-native actually means in practice</h2>
            <p>
              It means a plumber finishes a job, speaks for 30 seconds into his phone, and the system creates the job record, updates inventory, generates the invoice, notifies the office, and logs the time. That entire chain works because every module shares one AI-powered brain — not because someone wired 6 APIs together.
            </p>
            <p>
              It means when the AI prepares you for a meeting, it pulls from your CRM, order history, meeting transcripts, voice notes, emails, playbooks, and open tickets — in one pass. Not because it searched 7 separate apps. Because all that data lives in one place and was designed to be reasoned over.
            </p>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">The compound effect</h2>
            <p>
              An AI-native platform gets smarter the longer you use it. After six months, the system knows which clients reorder on predictable cycles, which operations consistently drift, which team members are overutilized, and what the average time-to-close is for different deal types.
            </p>
            <p>
              That accumulated organizational intelligence is the moat. The data can be exported. The understanding cannot.
            </p>

            <blockquote className="border-l-4 border-slate-900 pl-6 my-12 text-xl font-serif italic text-slate-700">
              "AI shouldn't be something you go to. It should be something that's already there — woven into the way the software thinks, acts, and anticipates."
            </blockquote>
          </motion.div>

          {/* Next philosophy link */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-20 pt-12 border-t border-slate-100"
          >
            <div className="flex justify-between w-full">
              <a href="/philosophy/human-control" className="group flex items-center gap-3">
                <ArrowLeft size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                <div>
                  <p className="text-sm text-slate-400 mb-1">Previous</p>
                  <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">The Airlock</p>
                </div>
              </a>
              <a href="/philosophy/one-brain" className="group flex items-center gap-3 text-right">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Next</p>
                  <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">One Brain</p>
                </div>
                <ArrowRight size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              </a>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AINative;
