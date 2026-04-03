import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Navbar } from '../../components/Navbar';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const AdvisorsThatDisagree: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">Philosophy</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              Advisors That Disagree
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed mb-16">
              Every other AI product promises consensus. HABOS promises productive conflict. Because the best decisions come from hearing the argument you didn't want to hear.
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
            <h2 className="text-2xl font-serif text-slate-900 mt-0">The yes-machine problem</h2>
            <p>
              Most AI assistants are sycophants. Ask a bad question, get an enthusiastic answer. Propose a flawed strategy, get supportive bullet points. The AI agrees with you because it's optimized to be helpful, and helpfulness has been confused with agreement.
            </p>
            <p>
              That's fine for writing emails. It's dangerous for making business decisions. A founder who only hears "great idea" is a founder who walks into walls.
            </p>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">The Strategic Council</h2>
            <p>
              HABOS doesn't give you one AI perspective. It gives you several — each with a different mandate, a different risk tolerance, and a different set of priorities. We call it the Strategic Council.
            </p>

            <div className="not-prose my-12 grid gap-4">
              {[
                {
                  name: 'The Operator',
                  color: '#3b82f6',
                  desc: 'Focused on execution, timelines, and resource constraints. Asks: "Can we actually do this with what we have?"',
                },
                {
                  name: 'The Strategist',
                  color: '#8b5cf6',
                  desc: 'Focused on long-term positioning, market dynamics, and competitive advantage. Asks: "Should we do this at all?"',
                },
                {
                  name: 'The Contrarian',
                  color: '#ef4444',
                  desc: 'Deliberately argues the opposite position. Stress-tests assumptions. Asks: "What if you\'re wrong about this?"',
                },
                {
                  name: 'The Customer Voice',
                  color: '#22c55e',
                  desc: 'Represents your clients\' perspective based on CRM data, feedback, and conversation history. Asks: "What would your customers actually want?"',
                },
              ].map((item) => (
                <div key={item.name} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
                  </div>
                  <p className="text-slate-600 text-base">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Mid-content image placeholder */}
            <div className="not-prose w-full aspect-[16/9] rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100/60 flex items-center justify-center my-12">
              <span className="text-sm text-violet-300 font-medium">Council debate visualization</span>
            </div>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">Structured disagreement</h2>
            <p>
              When you bring a decision to the Council — "Should we expand into the Bergen market?" or "Should we hire a second technician?" — you don't get one answer. You get a structured debate. Each advisor presents their case, responds to the others, and surfaces risks the others didn't mention.
            </p>
            <p>
              The output isn't a recommendation. It's a decision brief: the strongest arguments for and against, the key uncertainties, the data points that matter most, and the questions you should answer before committing. You make the call. The Council makes sure you've heard everything first.
            </p>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">Why this is harder than it sounds</h2>
            <p>
              Building AI that argues with itself is genuinely difficult. It requires giving each advisor a distinct reasoning framework, preventing them from collapsing into agreement, grounding their arguments in your actual business data, and presenting the disagreement in a way that's useful rather than confusing.
            </p>
            <p>
              Most AI companies won't attempt it because consensus is easier to ship and easier to market. But consensus is also less valuable. The whole point of having advisors is that they see things you don't — including things you don't want to see.
            </p>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">Calibrated to your business</h2>
            <p>
              The Council isn't generic. The Operator knows your team's actual capacity because it reads your resource data. The Strategist knows your competitive landscape because it reads your market research. The Customer Voice knows your clients' real concerns because it reads your CRM and support tickets.
            </p>
            <p>
              After six months, the Council's arguments are grounded in patterns from your specific business — not theoretical MBA frameworks.
            </p>

            <blockquote className="border-l-4 border-slate-900 pl-6 my-12 text-xl font-serif italic text-slate-700">
              "The most dangerous thing an AI can do is tell you what you want to hear. The most valuable thing it can do is tell you what you need to hear."
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
            <a href="/philosophy/voice-first" className="group flex items-center gap-3">
              <ArrowLeft size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              <div>
                <p className="text-sm text-slate-400 mb-1">Previous</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">Your Voice, Not Ours</p>
              </div>
            </a>
            <a href="/philosophy/memory-that-compounds" className="group flex items-center gap-3 text-right">
              <div>
                <p className="text-sm text-slate-400 mb-1">Next</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">Memory That Compounds</p>
              </div>
              <ArrowRight size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AdvisorsThatDisagree;
