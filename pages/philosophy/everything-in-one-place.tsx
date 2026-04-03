import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Navbar } from '../../components/Navbar';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const EverythingInOnePlace: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">Philosophy</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-4 leading-tight">
              Everything in One Place
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed mb-16">
              One login. Every tool. Shared context.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-slate prose-lg max-w-none"
          >
            <h2 className="text-2xl font-serif text-slate-900 mt-0">The SaaS tax</h2>
            <p>
              The average small business uses 8 to 12 software tools. Each with its own login, data model, billing cycle, and learning curve. None of them talk to each other natively. The business owner becomes the integration layer &mdash; manually copying data between apps and paying a third tool to make two others pretend to cooperate.
            </p>
            <p>
              The subscription cost isn&rsquo;t even the real tax. It&rsquo;s the cognitive tax. The context switching. The &ldquo;which tool has the latest version?&rdquo; question. The onboarding tax when every new hire needs 10 accounts. The Zapier workflow that breaks silently on a Saturday.
            </p>
          </motion.div>

          {/* Image between problem and solution */}
          <motion.img
            src="/philosophy/everything-in-one-place.jpg"
            alt="Everything in one place — unified business platform"
            className="w-full rounded-2xl my-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          />

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="prose prose-slate prose-lg max-w-none"
          >
            <h2 className="text-2xl font-serif text-slate-900 mt-0">One voice note, six updates</h2>
            <p className="italic text-slate-500 mb-6">
              &ldquo;Henderson kitchen remodel is done. Took 4 hours, used the remaining tile from inventory. Client was happy &mdash; wants a quote for the bathroom next.&rdquo;
            </p>
            <p>From that single voice note, VOIS updates:</p>
            <ol>
              <li>Project status &rarr; completed</li>
              <li>Time tracking &rarr; 4 hours logged and closed</li>
              <li>Invoice &rarr; draft generated from project scope</li>
              <li>Client notification &rarr; completion email queued</li>
              <li>CRM timeline &rarr; updated with completion + new interest</li>
              <li>New opportunity &rarr; bathroom quote added to pipeline</li>
            </ol>
            <p>
              Six &ldquo;modules&rdquo; updated from one input &mdash; because they share the same database, not six APIs stitched together with hope.
            </p>

            {/* Cost comparison — dark vs light cards */}
            <div className="not-prose grid sm:grid-cols-2 gap-4 my-12">
              <div className="bg-slate-900 rounded-2xl p-6 text-white">
                <p className="text-sm font-semibold text-red-400 mb-3 uppercase tracking-wider">10 Separate Tools</p>
                <p className="text-3xl font-bold mb-1">$350+<span className="text-base font-normal text-slate-400">/mo</span></p>
                <p className="text-sm text-slate-400 mt-3">10 logins &middot; 5+ Zapier workflows</p>
                <p className="text-sm text-slate-400">~3 hours to onboard a new hire</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <p className="text-sm font-semibold text-emerald-600 mb-3 uppercase tracking-wider">VOIS</p>
                <p className="text-3xl font-bold text-slate-900 mb-1">$35<span className="text-base font-normal text-slate-400">/mo</span></p>
                <p className="text-sm text-slate-500 mt-3">1 login &middot; 0 integrations to maintain</p>
                <p className="text-sm text-slate-500">~5 minutes to onboard a new hire</p>
              </div>
            </div>

            <blockquote className="border-l-4 border-slate-900 pl-6 my-12 text-xl font-serif italic text-slate-700">
              &ldquo;Integration is an admission that your tools don&rsquo;t work together. We built one tool that does.&rdquo;
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
            <a href="/philosophy/the-airlock" className="group flex items-center gap-3">
              <ArrowLeft size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              <div>
                <p className="text-sm text-slate-400 mb-1">Previous</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">The Airlock</p>
              </div>
            </a>
            <a href="/philosophy/one-assistant" className="group flex items-center gap-3 text-right">
              <div>
                <p className="text-sm text-slate-400 mb-1">Next</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">One Assistant</p>
              </div>
              <ArrowRight size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default EverythingInOnePlace;
