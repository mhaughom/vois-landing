import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Navbar } from '../../components/Navbar';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const MemoryThatCompounds: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">Philosophy</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              Memory That Compounds
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed mb-16">
              Every conversation makes the next one smarter. The longer you use HABOS, the more it understands your business — and the harder that understanding is to replicate anywhere else.
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
            <h2 className="text-2xl font-serif text-slate-900 mt-0">Day one vs. day 180</h2>
            <p>
              On day one, HABOS is a capable tool. It processes your voice notes, manages your tasks, handles your email. It's fast and it works. But it doesn't know you yet.
            </p>
            <p>
              By day 180, the system knows which clients reorder on predictable cycles. It knows that your Wednesday afternoon meetings always run long. It knows that when you mention "the Bergen project" you mean the Fjordview Hotel account. It knows your writing style, your decision patterns, your operational rhythms.
            </p>
            <p>
              That accumulated understanding isn't a feature you can install. It's intelligence that was earned — conversation by conversation, decision by decision.
            </p>

            <h2 className="text-2xl font-serif text-slate-900">What compounds</h2>

            <div className="not-prose my-12 grid gap-4">
              {[
                {
                  period: 'Week 1',
                  color: '#94a3b8',
                  items: [
                    'Basic voice routing works',
                    'Email drafts are generic but functional',
                    'Brain search covers what you\'ve entered',
                  ],
                },
                {
                  period: 'Month 1',
                  color: '#64748b',
                  items: [
                    'Writing style is calibrated to each team member',
                    'Meeting briefs pull relevant history',
                    'Smart Router accuracy improves from your corrections',
                  ],
                },
                {
                  period: 'Month 3',
                  color: '#475569',
                  items: [
                    'Proactive alerts based on patterns it\'s observed',
                    'Strategic Council grounded in your actual business data',
                    'Cross-source connections humans would miss',
                  ],
                },
                {
                  period: 'Month 6+',
                  color: '#1e293b',
                  items: [
                    'Predicts reorder timing, deal-stage durations, seasonal patterns',
                    'Catches operational drift before it becomes a problem',
                    'Institutional knowledge that survives employee turnover',
                  ],
                },
              ].map((item) => (
                <div key={item.period} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <h3 className="text-lg font-semibold text-slate-900">{item.period}</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {item.items.map((line) => (
                      <li key={line} className="text-slate-600 text-base">{line}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Mid-content image placeholder */}
            <div className="not-prose w-full aspect-[16/9] rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/60 flex items-center justify-center my-12">
              <span className="text-sm text-emerald-300 font-medium">Compounding intelligence curve</span>
            </div>

            <h2 className="text-2xl font-serif text-slate-900">The moat you build by using it</h2>
            <p>
              Most software has zero switching cost beyond the data export. Your project management tool doesn't get smarter the longer you use it. Your CRM doesn't learn your sales patterns. Your calendar doesn't anticipate your scheduling preferences.
            </p>
            <p>
              HABOS is different because the intelligence layer compounds. After six months, the system's understanding of your business is genuinely unique — built from your conversations, your decisions, your patterns, your corrections. That understanding can't be exported as a CSV. It's not in any single database table. It's distributed across embeddings, style profiles, routing models, and behavioral patterns.
            </p>

            <h2 className="text-2xl font-serif text-slate-900">Institutional memory that doesn't quit</h2>
            <p>
              When a key employee leaves, they take their knowledge with them. The client preferences they memorized, the processes they invented, the relationships they built — all gone.
            </p>
            <p>
              HABOS captures that institutional knowledge as it happens. Every voice note, every meeting, every client interaction feeds the Brain. When someone new joins, they inherit not just the data but the understanding — the AI can brief them on client history, explain why certain decisions were made, and surface the playbooks that the previous person developed.
            </p>

            <h2 className="text-2xl font-serif text-slate-900">A benefit, not a trap</h2>
            <p>
              We're not building lock-in through data hostage-taking. Your data is always exportable. You own it. But the intelligence — the patterns, the predictions, the contextual understanding — that's the compound interest on the time you've invested. It makes every month more valuable than the last.
            </p>
            <p>
              The question for a prospect isn't "what does HABOS cost per month?" It's "what is six months of compounded business intelligence worth?"
            </p>

            <blockquote className="border-l-4 border-slate-900 pl-6 my-12 text-xl font-serif italic text-slate-700">
              "Your data can be copied. Your understanding can't. Every day you use HABOS, the gap between the two widens."
            </blockquote>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-20 pt-12 border-t border-slate-100 flex justify-between"
          >
            <a href="/philosophy/advisors-that-disagree" className="group flex items-center gap-3">
              <ArrowLeft size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              <div>
                <p className="text-sm text-slate-400 mb-1">Previous</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">Advisors That Disagree</p>
              </div>
            </a>
            <a href="/philosophy/small-team-leverage" className="group flex items-center gap-3 text-right">
              <div>
                <p className="text-sm text-slate-400 mb-1">Next</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">Small Team Leverage</p>
              </div>
              <ArrowRight size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default MemoryThatCompounds;
