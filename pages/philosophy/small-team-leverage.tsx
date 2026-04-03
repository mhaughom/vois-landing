import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Navbar } from '../../components/Navbar';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const SmallTeamLeverage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">Philosophy</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              Small Team Leverage
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed mb-16">
              You shouldn't need 50 employees to operate like a serious company. HABOS gives small teams the operational infrastructure that used to require entire departments.
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
            <h2 className="text-2xl font-serif text-slate-900 mt-0">The enterprise gap</h2>
            <p>
              Enterprise software was built for enterprises. CRM platforms assume you have a sales ops team to configure them. Project management tools assume you have a PMO. Operations platforms assume you have process engineers. Even "simple" tools like scheduling software assume someone has time to set it up and maintain it.
            </p>
            <p>
              Small businesses — the plumber with 5 technicians, the consulting firm with 3 partners, the dental practice with 8 staff — don't have those people. They have everyone wearing four hats, context-switching all day, and losing information in the gaps between their 12 different apps.
            </p>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">One platform. No departments required.</h2>
            <p>
              HABOS replaces the entire stack. CRM, project management, task tracking, calendar, email, documents, invoicing, bookings, operations monitoring, team management, marketing, and analytics — all in one platform, all sharing one brain, all accessible by voice.
            </p>
            <p>
              But it's not just about consolidation. It's about the things that become possible when everything is connected and AI fills the gaps where you don't have people.
            </p>

            {/* Before / After comparison */}
            <div className="not-prose my-12 grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <p className="text-sm font-semibold text-slate-400 tracking-widest uppercase mb-4">Without HABOS</p>
                <ul className="space-y-3 text-base text-slate-600">
                  <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5 flex-shrink-0">-</span>Field tech finishes job, drives to office to fill paperwork</li>
                  <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5 flex-shrink-0">-</span>Owner checks 5 apps to prepare for a client call</li>
                  <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5 flex-shrink-0">-</span>Missed inspection discovered when the auditor arrives</li>
                  <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5 flex-shrink-0">-</span>Contract renewal forgotten until client calls to cancel</li>
                  <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5 flex-shrink-0">-</span>20 minutes of admin per job completed</li>
                </ul>
              </div>
              <div className="bg-slate-900 rounded-2xl p-6 text-white">
                <p className="text-sm font-semibold text-slate-400 tracking-widest uppercase mb-4">With HABOS</p>
                <ul className="space-y-3 text-base text-slate-300">
                  <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5 flex-shrink-0">+</span>30-second voice note from the van creates all records</li>
                  <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5 flex-shrink-0">+</span>AI briefing appears 7 minutes before every meeting</li>
                  <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5 flex-shrink-0">+</span>Watchdog alerts on the second missed inspection</li>
                  <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5 flex-shrink-0">+</span>Proactive reminder 3 weeks before contract expires</li>
                  <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5 flex-shrink-0">+</span>40 seconds of admin per job completed</li>
                </ul>
              </div>
            </div>

            {/* Mid-content image placeholder */}
            <div className="not-prose w-full aspect-[16/9] rounded-2xl bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-100/60 flex items-center justify-center my-12">
              <span className="text-sm text-sky-300 font-medium">Platform overview screenshot</span>
            </div>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">The morning briefing</h2>
            <p>
              Every morning, HABOS summarizes what needs your attention. Not a dashboard you have to interpret. A concise briefing: three things that matter today, why they matter, what the playbook says to do, and a one-tap action to approve the suggested response.
            </p>
            <p>
              Operations health dropped from green to yellow? You know before your team does. A contract is expiring and no one has started the renewal? The system tells you, links the CRM record, and offers to trigger the renewal workflow. Two new bookings are in the same neighborhood? It suggests pairing them as a route to save travel time.
            </p>
            <p>
              These are things that an operations manager would catch — if you had one. HABOS gives you the operations manager without the headcount.
            </p>

            {/* Mid-content image placeholder */}
            <div className="not-prose w-full aspect-[16/9] rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/60 flex items-center justify-center my-12">
              <span className="text-sm text-emerald-300 font-medium">Dashboard screenshot</span>
            </div>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">Grow the business, not the overhead</h2>
            <p>
              The traditional growth path for a small business is: get more work, hire more people to handle the work, hire more people to manage the people. Each employee adds operational complexity — more coordination, more handoffs, more things falling through cracks.
            </p>
            <p>
              HABOS changes the equation. Instead of hiring an admin to handle scheduling, let the AI do it. Instead of hiring a marketing coordinator, let the platform run your campaigns. Instead of hiring an operations manager to track compliance, let the Watchdog monitor it 24/7.
            </p>
            <p>
              The result: a 5-person company that operates with the sophistication and reliability of one 10 times its size.
            </p>

            <blockquote className="border-l-4 border-slate-900 pl-6 my-12 text-xl font-serif italic text-slate-700">
              "For the plumber in Bergen, success means: he talks into his phone for 30 seconds and the right things happen across six systems. He walks into meetings prepared without doing any prep. Problems find him before he finds them."
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
            <a href="/philosophy/memory-that-compounds" className="group flex items-center gap-3">
              <ArrowLeft size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              <div>
                <p className="text-sm text-slate-400 mb-1">Previous</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">Memory That Compounds</p>
              </div>
            </a>
            <a href="/philosophy/supercharge-your-team" className="group flex items-center gap-3 text-right">
              <div>
                <p className="text-sm text-slate-400 mb-1">Next</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">Supercharge Your Team</p>
              </div>
              <ArrowRight size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SmallTeamLeverage;
