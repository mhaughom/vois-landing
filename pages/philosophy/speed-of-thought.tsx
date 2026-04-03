import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Navbar } from '../../components/Navbar';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const SpeedOfThought: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">Philosophy</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              Speed of Thought
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed mb-16">
              Your fastest input is your voice. Your fastest output is a tap.
            </p>
          </motion.div>

          {/* Big typography bandwidth numbers */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="my-16 space-y-2"
          >
            <p className="text-2xl md:text-4xl font-bold text-red-400 tracking-tight">Typing: 40 WPM.</p>
            <p className="text-3xl md:text-5xl font-bold text-blue-500 tracking-tight">Speaking: 150 WPM.</p>
            <p className="text-4xl md:text-6xl font-bold text-violet-600 tracking-tight">Reading: 250 WPM.</p>
            <p className="text-5xl md:text-7xl font-bold text-emerald-600 tracking-tight">Tapping: instant.</p>
          </motion.div>

          {/* Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="prose prose-slate prose-lg max-w-none"
          >
            <p>
              A 30-minute meeting produces ten decisions. Then someone spends 45 minutes typing those decisions into a project management tool. The brain operates at the speed of thought. Software operates at the speed of typing. That mismatch costs hours every day.
            </p>

            {/* Mid-content image */}
            <div className="not-prose my-12">
              <img
                src="/philosophy/speed-of-thought.jpg"
                alt="Speed of Thought"
                className="w-full rounded-2xl"
              />
            </div>

            <p>
              Consider an email reply. Reading three AI-generated variants: 10 seconds. Tapping send on the right one: 0.1 seconds. Total: 10.1 seconds. Writing from scratch: 3&ndash;5 minutes. That&rsquo;s 20x faster. Over 20 emails a day, it&rsquo;s the difference between an hour and four minutes.
            </p>

            <blockquote className="border-l-4 border-slate-900 pl-6 my-12 text-xl font-serif italic text-slate-700">
              &ldquo;We didn&rsquo;t speed up typing. We eliminated the need for it.&rdquo;
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
            <a href="/philosophy/capture-your-brain" className="group flex items-center gap-3">
              <ArrowLeft size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              <div>
                <p className="text-sm text-slate-400 mb-1">Previous</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">Capture Your Brain</p>
              </div>
            </a>
            <a href="/philosophy/always-within-reach" className="group flex items-center gap-3 text-right">
              <div>
                <p className="text-sm text-slate-400 mb-1">Next</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">Always Within Reach</p>
              </div>
              <ArrowRight size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SpeedOfThought;
