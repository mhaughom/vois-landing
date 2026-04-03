import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Navbar } from '../../components/Navbar';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

const items = [
  { title: 'Website Builder', desc: 'Describe your business, get a website — AI writes the copy, connects payments and booking.', href: '/work/website-builder' },
  { title: 'Creative Studio', desc: 'Generate marketing content that matches your brand from your business context.', href: '/work/creative-studio' },
  { title: 'Marketing', desc: 'Email and SMS campaigns with AI-written copy and smart audience segments.', href: '/work/marketing' },
];

const WebsiteMarketing: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <Navbar variant="habos" />
    <main className="pt-36 md:pt-44 pb-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <motion.p {...fadeUp(0)} className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">Website & Marketing</motion.p>
        <motion.h1 {...fadeUp(0.05)} className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">Your Brand, Amplified by AI</motion.h1>
        <motion.p {...fadeUp(0.1)} className="text-xl text-slate-500 max-w-2xl leading-relaxed mb-16">Build websites, create content, and run campaigns — all powered by your business data, not generic templates.</motion.p>

        <div className="grid md:grid-cols-2 gap-4">
          {items.map((item, i) => (
            <motion.a key={item.href} href={item.href} {...fadeUp(0.15 + i * 0.05)} className="group bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition-all">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </motion.a>
          ))}
        </div>
      </div>
    </main>
  </div>
);

export default WebsiteMarketing;
