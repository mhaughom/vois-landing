import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '../../components/Navbar';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const surfaces = [
  { name: 'Watch', detail: 'Sub-300ms. Raise wrist, speak, done.' },
  { name: 'Lock screen', detail: 'One tap starts recording. No unlock.' },
  { name: 'Phone call', detail: 'Dial your VOIS number. Any phone, any network.' },
  { name: 'Notification', detail: 'Tap a reply option without opening the app.' },
];

const AlwaysWithinReach: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">Philosophy</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              Always Within Reach
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed mb-16">
              Watch. Phone. Lock screen. A phone call. Wherever you are.
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
              An electrician on a ladder. Hands holding wire. A thought fires about the next job. His phone is in his pocket. By the time he climbs down, unlocks it, opens the app, and navigates to the right screen &mdash; three minutes have passed. More likely, the thought is gone entirely. Business software was built for desks. Half the workforce doesn&rsquo;t have one.
            </p>

            {/* Four surfaces grid */}
            <div className="not-prose my-12 grid grid-cols-2 gap-4">
              {surfaces.map((s) => (
                <div key={s.name} className="border border-slate-150 rounded-xl p-5">
                  <p className="text-base font-semibold text-slate-900 mb-1">{s.name}</p>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.detail}</p>
                </div>
              ))}
            </div>

            <p className="text-base text-slate-600">
              Every additional tap is a leak in the capture funnel.
            </p>

            {/* Banner image */}
            <div className="not-prose my-12">
              <img
                src="/philosophy/always-within-reach.jpg"
                alt="Always Within Reach"
                className="w-full rounded-2xl object-cover"
                style={{ aspectRatio: '3/1' }}
              />
            </div>

            <blockquote className="border-l-4 border-slate-900 pl-6 my-12 text-xl font-serif italic text-slate-700">
              &ldquo;If you have to open an app to use it, you&rsquo;ve already lost.&rdquo;
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
            <a href="/philosophy/speed-of-thought" className="group flex items-center gap-3">
              <ArrowLeft size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              <div>
                <p className="text-sm text-slate-400 mb-1">Previous</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">Speed of Thought</p>
              </div>
            </a>
            <a href="/work" className="group flex items-center gap-3 text-right">
              <div>
                <p className="text-sm text-slate-400 mb-1">Next</p>
                <p className="text-xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors">Back to HABOS</p>
              </div>
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AlwaysWithinReach;
