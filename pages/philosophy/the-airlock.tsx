import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Navbar } from '../../components/Navbar';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const comparison = [
  { action: 'Email sending', auto: 'Sent immediately. CEO finds a typo after 200 people read it.', airlock: 'Draft appears as a card. You fix the typo, tap send.' },
  { action: 'Calendar changes', auto: 'Double-booked Tuesday — didn\u2019t check your personal calendar.', airlock: 'Preview shows the conflict. You pick the right slot.' },
  { action: 'Task creation', auto: '14 tasks from one meeting. 6 are duplicates.', airlock: 'Proposed list. You merge two, delete one, approve the rest.' },
  { action: 'Customer comms', auto: 'Replied with a coupon you don\u2019t offer anymore.', airlock: 'Reply appears as preview. You adjust the offer, then send.' },
];

const TheAirlock: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Full-width cinematic hero image */}
      <motion.img
        src="/philosophy/the-airlock.jpg"
        alt="The Airlock — AI proposes, you decide"
        className="w-full h-[50vh] object-cover"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />

      <main className="pt-16 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          {/* Hero text */}
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">Philosophy</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-4 leading-tight">
              The Airlock
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed mb-16">
              AI proposes. You decide.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-slate prose-lg max-w-none"
          >
            <h2 className="text-2xl font-serif text-slate-900 mt-0">The problem nobody talks about</h2>
            <p>
              The most dangerous thing about AI is not that it gets things wrong. It&rsquo;s that it acts before you can check. A sales bot offers a 40% discount that violates margin policy. A booking system double-schedules because it optimized for density without understanding drive time. These aren&rsquo;t hypotheticals.
            </p>
            <p>
              Only 6% of enterprises say they fully trust autonomous AI agents. The other 94% are right to be cautious. We built the opposite: every action the AI takes passes through what we call the Airlock &mdash; a mandatory preview where you see exactly what&rsquo;s about to happen before it happens.
            </p>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">The comparison</h2>

            {/* Comparison table */}
            <div className="not-prose my-10">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 pr-4 font-semibold text-slate-900">Action</th>
                      <th className="text-left py-3 px-4 font-semibold text-red-600">Fully Autonomous</th>
                      <th className="text-left py-3 pl-4 font-semibold text-emerald-600">The Airlock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((row) => (
                      <tr key={row.action} className="border-b border-slate-100">
                        <td className="py-4 pr-4 font-medium text-slate-900 align-top whitespace-nowrap">{row.action}</td>
                        <td className="py-4 px-4 text-slate-500 align-top">{row.auto}</td>
                        <td className="py-4 pl-4 text-slate-700 align-top">{row.airlock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <h2 className="text-2xl font-serif text-slate-900 mt-14 mb-3">Not a UI pattern. A security protocol.</h2>
            <p>
              Every write action generates an HMAC-SHA256 signed confirmation token binding the user, the exact action, and the precise arguments &mdash; down to individual characters in an email draft. Tokens expire in 10 minutes. If anything changes between preview and confirmation, the token invalidates. The AI cannot modify the action after showing it to you. What you approved is exactly what gets executed.
            </p>

            <blockquote className="border-l-4 border-slate-900 pl-6 my-12 text-xl font-serif italic text-slate-700">
              &ldquo;The pause is not a limitation. It&rsquo;s the reason you&rsquo;ll trust this with your business.&rdquo;
            </blockquote>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-20 pt-12 border-t border-slate-100 flex justify-end"
          >
            <a href="/philosophy/everything-in-one-place" className="group flex items-center gap-3 text-right">
              <div>
                <p className="text-sm text-slate-400 mb-1">Next</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">Everything in One Place</p>
              </div>
              <ArrowRight size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default TheAirlock;
