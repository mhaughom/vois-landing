import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Navbar } from '../../components/Navbar';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const CaptureYourBrain: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Full-bleed hero image */}
      <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
        <img
          src="/philosophy/capture-your-brain.jpg"
          alt="Capture Your Brain"
          className="w-full h-[60vh] object-cover"
        />
      </motion.div>

      <main className="pt-16 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6, delay: 0.1 }}>
            <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">Philosophy</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              Capture Your Brain
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed mb-16">
              Your best ideas happen between meetings. We catch them.
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
              It&rsquo;s Monday morning. You know you had important thoughts over the weekend &mdash; you can feel them, just out of reach. Your sticky notes fell off the monitor. The &ldquo;email myself&rdquo; trick is buried under 40 messages. You have 47 unlabeled voice memos and no time to listen to any of them. Creative potential evaporates every day, not because people lack ideas, but because the capture tool was too far away.
            </p>

            <p>
              A plumber finishes at the Johnson house and talks to VOIS during the drive home. Thirty seconds: &ldquo;Water heater needs replacing, not repair. Quote them for a Bosch 27i, 18,000 kroner. Remind me to order the part tomorrow.&rdquo; By the time he parks, the job report is updated, the CRM reflects the change, a quote is drafted, and a reminder is set for 9 AM. Hands never left the steering wheel.
            </p>

            {/* The stat */}
            <div className="not-prose my-12 bg-slate-50 rounded-2xl p-8 border border-slate-100">
              <div className="grid grid-cols-2 gap-8 text-center">
                <div>
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Without capture</p>
                  <p className="text-3xl font-bold text-red-500">23 ideas</p>
                  <p className="text-sm text-slate-500 mt-1">3 acted on</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">With capture</p>
                  <p className="text-3xl font-bold text-emerald-600">23 captured</p>
                  <p className="text-sm text-slate-500 mt-1">14 completed by Friday</p>
                </div>
              </div>
            </div>

            <blockquote className="border-l-4 border-slate-900 pl-6 my-12 text-xl font-serif italic text-slate-700">
              &ldquo;Your brain was never the bottleneck. Your capture tool was.&rdquo;
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
            <a href="/philosophy/two-interfaces" className="group flex items-center gap-3">
              <ArrowLeft size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              <div>
                <p className="text-sm text-slate-400 mb-1">Previous</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">Two Interfaces, One System</p>
              </div>
            </a>
            <a href="/philosophy/speed-of-thought" className="group flex items-center gap-3 text-right">
              <div>
                <p className="text-sm text-slate-400 mb-1">Next</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">Speed of Thought</p>
              </div>
              <ArrowRight size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default CaptureYourBrain;
