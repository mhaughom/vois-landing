import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Navbar } from '../../components/Navbar';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const YourSoftwareYourWay: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">Philosophy</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              Your Software, Your Way
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed mb-12">
              No two businesses are the same. Your operating system shouldn't pretend they are.
            </p>
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
              Most software asks you to adapt to it. You learn its menu structure, memorize its shortcuts, and build workarounds for the things it almost does but doesn't quite. Over time, you stop noticing how much of your process is shaped by the tool's limitations rather than your actual needs.
            </p>

            <p>
              We're building VOIS to bend the other way.
            </p>

            <blockquote className="border-l-4 border-slate-900 pl-6 my-12 text-xl font-serif italic text-slate-700">
              "The best tool is the one that fits the hand that holds it."
            </blockquote>

            <h2 className="text-2xl font-serif text-slate-900 mt-12 mb-4">Dedicated hours, dedicated to you</h2>

            <p>
              As VOIS grows, we're committing to something rare: dedicated employee hours for your business. Not a generic support queue. Not a chatbot. Real people on our team, allocated to understand your workflows and make the software work harder for you. Whether that's adjusting how a feature behaves, building a custom view, or wiring up an integration that only makes sense for your industry — we'll do the work.
            </p>

            {/* What flexibility looks like */}
            <div className="not-prose my-12 bg-slate-50 rounded-2xl border border-slate-100 p-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">What this looks like in practice</p>
              <div className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                  <p className="text-sm text-slate-700"><strong className="text-slate-900">Custom apps</strong> — Build or request apps that live inside VOIS, tailored to how your team actually works.</p>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                  <p className="text-sm text-slate-700"><strong className="text-slate-900">Paid customization</strong> — Commission features, workflows, or integrations built specifically for your business.</p>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                  <p className="text-sm text-slate-700"><strong className="text-slate-900">Feature suggestions</strong> — Propose functionality that only applies to you — and see it built into your instance.</p>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0 mt-1.5" />
                  <p className="text-sm text-slate-700"><strong className="text-slate-900">Open platform</strong> — As we mature, we'll open up the system so you can extend it yourself or bring in your own developers.</p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-serif text-slate-900 mt-12 mb-4">Software that grows with you</h2>

            <p>
              The typical SaaS playbook is to build one product and sell it to everyone the same way. That works for simple tools. But VOIS isn't a simple tool — it's your operating system. And an operating system should reflect the business it runs, not the other way around.
            </p>

            <p>
              A landscaping company doesn't need the same dashboard as a design agency. A solo consultant doesn't need the same workflows as a 40-person field team. Instead of forcing everyone through the same funnel, we'd rather give you the building blocks and the support to assemble something that's genuinely yours.
            </p>

            <blockquote className="border-l-4 border-slate-900 pl-6 my-12 text-xl font-serif italic text-slate-700">
              "We don't want to be the software you settle for. We want to be the software you'd build yourself — if you had the time."
            </blockquote>

            <p>
              This is a long-term commitment, not a launch-day promise. We're building the foundation now so that when we open it up, every business on VOIS can make it truly theirs.
            </p>
          </motion.div>

          {/* Prev / Next */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-20 pt-12 border-t border-slate-100 flex justify-between"
          >
            <a href="/philosophy/always-within-reach" className="group flex items-center gap-3">
              <ArrowLeft size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              <div>
                <p className="text-sm text-slate-400 mb-1">Previous</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">Always Within Reach</p>
              </div>
            </a>
            <a href="/philosophy/the-airlock" className="group flex items-center gap-3 text-right">
              <div>
                <p className="text-sm text-slate-400 mb-1">Next</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">The Airlock</p>
              </div>
              <ArrowRight size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default YourSoftwareYourWay;
