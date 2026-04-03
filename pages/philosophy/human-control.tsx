import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Navbar } from '../../components/Navbar';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const HumanControl: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">Philosophy</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              The Airlock
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed mb-16">
              Every competitor goes fully autonomous or fully manual. HABOS is the only platform that makes the pause a feature. AI proposes. You approve. Every action passes through the Airlock — enforced by code, not by the AI's good judgment.
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
            <h2 className="text-2xl font-serif text-slate-900 mt-0">The iron rule</h2>
            <p>
              The AI cannot write to the database without the user seeing a preview and explicitly approving. This is not a suggestion. Not a best practice. Not an AI instruction that can be jailbroken. It's a hard gate in the tool router that cannot be bypassed — not by the AI, not by a plugin, not by anyone without changing the source code.
            </p>
            <p>
              When you say "send an email to Lars," the AI drafts it, shows it to you, and waits. When you say "create a task," the AI shows you the task card and waits. When an agent completes a ten-step research mission and wants to save the results — it shows you the artifact and waits. Always.
            </p>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">Three tiers of trust</h2>

            <div className="not-prose my-12 grid gap-4">
              {[
                {
                  tier: 'Read',
                  color: '#22c55e',
                  desc: 'Searching, listing, looking up information. The AI can freely gather context to give you better answers.',
                  rule: 'Execute immediately. No approval needed.',
                },
                {
                  tier: 'Write',
                  color: '#f59e0b',
                  desc: 'Creating tasks, scheduling events, updating records. Anything that changes state in your business.',
                  rule: 'Preview first. You see exactly what would happen. Approve or dismiss.',
                },
                {
                  tier: 'High-risk',
                  color: '#ef4444',
                  desc: 'Sending emails, posting to Slack, financial changes. Actions visible to people outside the system.',
                  rule: 'Preview + additional approval. Durable audit record. Survives server crashes.',
                },
              ].map((item) => (
                <div key={item.tier} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <h3 className="text-lg font-semibold text-slate-900">{item.tier}</h3>
                  </div>
                  <p className="text-slate-600 text-base mb-2">{item.desc}</p>
                  <p className="text-sm font-medium text-slate-500">{item.rule}</p>
                </div>
              ))}
            </div>

            {/* Mid-content image placeholder */}
            <div className="not-prose w-full aspect-[16/9] rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100/60 flex items-center justify-center my-12">
              <span className="text-sm text-emerald-300 font-medium">Approval flow diagram</span>
            </div>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">Cryptographic confirmation</h2>
            <p>
              Every write action generates a confirmation token — cryptographic, with a 10-minute expiry, bound to the specific user and the exact arguments. If anything changes between preview and confirmation, a new token is required. The AI can't modify the action after showing you the preview. What you saw is what gets executed.
            </p>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">Workspace-level policy</h2>
            <p>
              Admins have additional controls that override everything else:
            </p>
            <ul>
              <li>Block specific tools entirely — no AI email sending for this workspace</li>
              <li>Require additional approval for specific action types</li>
              <li>Restrict which AI models are used</li>
              <li>Cap per-run budgets — an agent can't spend more than you've authorized</li>
            </ul>
            <p>
              All enforced by code. Not by prompting the AI to behave. Not by hoping it follows instructions. By gates in the execution layer that the AI has no ability to circumvent.
            </p>

            {/* Mid-content image placeholder */}
            <div className="not-prose w-full aspect-[16/9] rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100/60 flex items-center justify-center my-12">
              <span className="text-sm text-amber-300 font-medium">Approval flow screenshot</span>
            </div>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">Why this matters</h2>
            <p>
              The AI industry is racing toward autonomy. Fully autonomous agents that act on your behalf without asking. We believe this is backwards for business software.
            </p>
            <p>
              A business owner needs to trust their tools the way they trust their team: with clear delegation, visible actions, and the ability to say no. HABOS gives you superpowers — and keeps your hands on the steering wheel.
            </p>

            <blockquote className="border-l-4 border-slate-900 pl-6 my-12 text-xl font-serif italic text-slate-700">
              "The best AI doesn't make decisions for you. It makes you faster at making decisions yourself."
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
            <div />
            <a href="/philosophy/ai-native" className="group flex items-center gap-3 text-right">
              <div>
                <p className="text-sm text-slate-400 mb-1">Next</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">The End of Data Entry</p>
              </div>
              <ArrowRight size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default HumanControl;
