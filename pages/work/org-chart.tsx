import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Network, Users, Sparkles, Bot } from 'lucide-react';

const OrgChart: React.FC = () => {
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
              Org Chart & AI Agents
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-8">
              Assign specialized AI agents to team members. Keep humans in the loop longer by
              making them supervisors of AI, not replacements.
            </p>
          </motion.div>

          {/* The Problem */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-8 mb-16"
          >
            <h3 className="text-xl font-semibold text-amber-900 mb-3 text-center">The Challenge</h3>
            <p className="text-amber-800 leading-relaxed text-center">
              Most people don't use AI effectively—not because they're opposed to it, but because
              they <strong>can't think of when to use it</strong>. They need AI to suggest itself
              at the right moments, in the right context.
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
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
                <Network size={24} className="text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Interactive Org Chart</h3>
              <p className="text-slate-600 leading-relaxed">
                Leaders create a visual org chart and assign AI agents to specific team members.
                A marketing specialist might have 3 AI agents: Content Writer, SEO Analyzer,
                and Campaign Optimizer.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
                <Bot size={24} className="text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Proactive AI Suggestions</h3>
              <p className="text-slate-600 leading-relaxed">
                During meetings and while reading emails, VOIS listens and suggests relevant agent
                actions: "Should the SEO Analyzer review this landing page?" or "Want the Content
                Writer to draft that blog post?"
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
                <Users size={24} className="text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Humans as Supervisors</h3>
              <p className="text-slate-600 leading-relaxed">
                Instead of replacing workers, this system elevates them. Your marketing specialist
                becomes a supervisor managing AI agents. They review AI work, approve actions,
                and maintain control.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
                <Sparkles size={24} className="text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Third-Party Agent Integration</h3>
              <p className="text-slate-600 leading-relaxed">
                We don't build every agent ourselves. Org Chart integrates with specialized third-party
                AI agents for different fields—legal, design, engineering, finance. Best-in-class tools
                for each specialty.
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
            <h2 className="text-3xl font-serif mb-6 text-center">How It Works</h2>
            <div className="space-y-4 text-slate-300 text-lg leading-relaxed">
              <p>
                <strong className="text-white">Setup:</strong> Your manager assigns you three AI agents
                in the org chart—matched to your role and responsibilities.
              </p>
              <p>
                <strong className="text-white">Meeting:</strong> During a team discussion, someone mentions
                a new marketing campaign. VOIS, listening in, pops up an action card: "Should the Campaign
                Optimizer analyze this strategy?"
              </p>
              <p>
                <strong className="text-white">One tap:</strong> You approve. The agent starts working in
                the background.
              </p>
              <p>
                <strong className="text-white">Email:</strong> Later, you receive a draft email that needs
                polishing. Another action card appears: "Want the Content Writer to refine this?"
              </p>
              <p>
                <strong className="text-white">The result:</strong> You work faster, accomplish more, and
                stay in control. The AI doesn't replace you—it amplifies you.
              </p>
            </div>
          </motion.div>

          {/* The Vision */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-indigo-50 border border-indigo-200 rounded-2xl p-10 mb-20"
          >
            <h3 className="text-2xl font-serif text-indigo-900 mb-4 text-center">
              Job Security Through AI Supervision
            </h3>
            <p className="text-indigo-800 leading-relaxed">
              Many people fear AI will replace them. Org Chart & AI Agents does the opposite—it
              positions humans as managers of AI teams. You become more valuable, not less.
              Companies get AI productivity gains while keeping experienced humans in decision-making
              roles. Everyone wins.
            </p>
          </motion.div>

          {/* Status */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="text-center bg-slate-50 rounded-2xl p-10"
          >
            <h3 className="text-2xl font-serif text-slate-900 mb-4">
              Currently in Development
            </h3>
            <p className="text-slate-600 mb-2">
              Org Chart & AI Agents is built in our development environment. We're finalizing third-party
              agent integrations and enterprise security features.
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

export default OrgChart;
