import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Zap, Database, Palette } from 'lucide-react';
import { Navbar } from '../../components/Navbar';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const layouts = [
  'Title', 'Text + Image', 'Metric Grid', 'Chart Focus', 'Comparison',
  'Timeline', 'Quote', '3-Column', 'Bullet Highlight', 'Product Grid',
  'Team Roster', 'CTA',
];

const Slides: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Content */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">

          {/* 1. Hero */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <div className="inline-block px-4 py-2 bg-fuchsia-500/10 text-fuchsia-700 rounded-full text-sm font-medium mb-6">
              AI Presentations
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-tight">
              Describe Your Deck.{' '}
              <span className="relative inline-block">
                <span className="relative z-10">It Builds Itself.</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.6, ease: "circOut" }}
                  className="absolute bottom-2 left-0 right-0 h-3 bg-fuchsia-300/40 origin-left -z-0 rounded-sm"
                />
              </span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Tell HABOS what you need to present. AI generates a complete deck using your brand,
              your data, and your products — with live charts that update automatically.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mx-auto mb-16"><p className="text-lg text-slate-600 leading-relaxed">The presentation generator creates decks from your workspace context with live data binding. First it generates an outline by analyzing your prompt, searching the Brain, and pulling from project context, product catalog, and brand guide. Then it builds each slide in parallel — up to five concurrent — with layout-specific blocks: metrics, charts, tables, and images. Revenue numbers pull from Finance. Product grids pull from your catalog. When the underlying data changes, the presentation reflects it.</p></motion.div>

          {/* 2. Mock slide preview */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-slate-900 rounded-3xl p-2 shadow-2xl max-w-3xl mx-auto">
              <div className="aspect-video bg-white rounded-2xl relative overflow-hidden p-6 md:p-10 flex flex-col">
                {/* Brand accent bar */}
                <div className="absolute top-0 left-0 w-24 h-1.5 bg-fuchsia-500 rounded-br-full" />

                {/* Slide title */}
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-2 mb-5">
                  Q1 Revenue Summary
                </h2>

                {/* Metric cards row */}
                <div className="flex gap-3 md:gap-4 mb-5">
                  <div className="flex-1 bg-slate-50 rounded-xl p-3 md:p-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <ArrowUpRight size={14} className="text-emerald-500" />
                      <span className="text-[10px] md:text-xs text-emerald-600 font-medium">+18%</span>
                    </div>
                    <div className="text-lg md:text-xl font-bold text-slate-900">$127K</div>
                    <div className="text-[10px] md:text-xs text-slate-400">Revenue</div>
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-xl p-3 md:p-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <ArrowUpRight size={14} className="text-emerald-500" />
                      <span className="text-[10px] md:text-xs text-emerald-600 font-medium">+12%</span>
                    </div>
                    <div className="text-lg md:text-xl font-bold text-slate-900">89</div>
                    <div className="text-[10px] md:text-xs text-slate-400">Orders</div>
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-xl p-3 md:p-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <ArrowDownRight size={14} className="text-red-500" />
                      <span className="text-[10px] md:text-xs text-red-600 font-medium">-4%</span>
                    </div>
                    <div className="text-lg md:text-xl font-bold text-slate-900">$1,428</div>
                    <div className="text-[10px] md:text-xs text-slate-400">Avg Order</div>
                  </div>
                </div>

                {/* Simplified bar chart */}
                <div className="flex-1 flex items-end gap-2 md:gap-3 px-2">
                  <div className="flex-1 bg-fuchsia-400 rounded-t-md" style={{ height: '45%' }} />
                  <div className="flex-1 bg-fuchsia-400 rounded-t-md" style={{ height: '62%' }} />
                  <div className="flex-1 bg-fuchsia-400 rounded-t-md" style={{ height: '38%' }} />
                  <div className="flex-1 bg-fuchsia-400 rounded-t-md" style={{ height: '78%' }} />
                  <div className="flex-1 bg-fuchsia-400 rounded-t-md" style={{ height: '55%' }} />
                  <div className="flex-1 bg-fuchsia-500 rounded-t-md" style={{ height: '90%' }} />
                  <div className="flex-1 bg-fuchsia-400 rounded-t-md" style={{ height: '70%' }} />
                  <div className="flex-1 bg-fuchsia-300 rounded-t-md" style={{ height: '52%' }} />
                  <div className="flex-1 bg-fuchsia-300 rounded-t-md" style={{ height: '48%' }} />
                  <div className="flex-1 bg-fuchsia-200 rounded-t-md" style={{ height: '35%' }} />
                  <div className="flex-1 bg-fuchsia-200 rounded-t-md" style={{ height: '42%' }} />
                  <div className="flex-1 bg-fuchsia-200 rounded-t-md" style={{ height: '30%' }} />
                </div>

                {/* Slide number */}
                <div className="absolute bottom-4 right-6 text-[10px] text-slate-300 font-medium">
                  Slide 3 of 12
                </div>
              </div>
            </div>
          </motion.div>

          {/* Caption below slide */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mb-20 max-w-2xl mx-auto"
          >
            <p className="text-sm text-slate-500 leading-relaxed">
              <span className="text-slate-700 font-medium">Generated from:</span>{' '}
              "Build a Q1 investor update with revenue trends and top products."{' '}
              The revenue numbers are live — they update when your data changes.
            </p>
          </motion.div>

          {/* 3. Three benefit cards */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="grid md:grid-cols-3 gap-5 mb-20"
          >
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="w-10 h-10 bg-fuchsia-100 rounded-xl flex items-center justify-center mb-4">
                <Zap size={20} className="text-fuchsia-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Prompt &rarr; deck in 60 seconds</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Describe what you need. AI generates an outline, then builds every slide in parallel.
                12 card layouts, brand-aware colors, real photography from Unsplash.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="w-10 h-10 bg-fuchsia-100 rounded-xl flex items-center justify-center mb-4">
                <Database size={20} className="text-fuchsia-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Live data binding</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Revenue metrics pull from Finance. Product grids pull from your catalog.
                When the underlying data changes, the presentation updates. No manual chart recreation.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="w-10 h-10 bg-fuchsia-100 rounded-xl flex items-center justify-center mb-4">
                <Palette size={20} className="text-fuchsia-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Your brand, automatically</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Theme colors, fonts, and logo are pulled from your workspace brand settings.
                Every deck looks like yours, not like a template.
              </p>
            </div>
          </motion.div>

          {/* 4. Layout showcase */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mb-20"
          >
            <p className="text-sm font-medium text-slate-500 mb-4">
              12 card layouts, intelligently mixed
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
              {layouts.map((layout) => (
                <span
                  key={layout}
                  className="bg-fuchsia-50 text-fuchsia-700 rounded-lg px-3 py-1.5 text-xs font-medium"
                >
                  {layout}
                </span>
              ))}
            </div>
          </motion.div>

          {/* 5. Scenario callout */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="bg-slate-900 text-white rounded-3xl p-8 md:p-10 mb-20"
          >
            <p className="text-lg md:text-xl leading-relaxed text-slate-200">
              Your investor meeting is in 2 hours. Instead of spending 90 minutes building slides,
              you type: <span className="text-white font-medium italic">"Q1 investor update — revenue trends,
              top products, customer growth, and next quarter roadmap."</span>
            </p>
            <p className="text-lg md:text-xl leading-relaxed text-slate-200 mt-4">
              HABOS pulls live numbers from Finance, products from your catalog, and growth data
              from CRM. You have a polished, on-brand deck in 60 seconds.
            </p>
            <p className="text-lg md:text-xl font-semibold text-white mt-6">
              The revenue chart will still be accurate when you present it.
            </p>
          </motion.div>

          {/* 6. Tech strip */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-20"
          >
            <div className="bg-fuchsia-50 border border-fuchsia-200 rounded-2xl px-8 py-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs md:text-sm font-medium text-fuchsia-700">
              <span>GPT-4o outline + parallel build</span>
              <span className="text-fuchsia-300">&middot;</span>
              <span>Unsplash + Gemini image gen</span>
              <span className="text-fuchsia-300">&middot;</span>
              <span>12 enforced layouts</span>
              <span className="text-fuchsia-300">&middot;</span>
              <span>Live data binding</span>
              <span className="text-fuchsia-300">&middot;</span>
              <span>Brand-aware theming</span>
            </div>
          </motion.div>

          {/* 7. Closing */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="text-center"
          >
            <p className="text-xl md:text-2xl font-serif italic text-slate-700 mb-8">
              Other slide tools give you templates. HABOS gives you a finished deck.
            </p>
            <a href="/#pricing">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-slate-900 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                Join Waitlist
              </motion.button>
            </a>
          </motion.div>

        </div>
      </main>
    </div>
  );
};

export default Slides;
