import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Layers,
  Paintbrush,
  KeyRound,
} from 'lucide-react';

/* ── animation helpers ─────────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.10 } },
};

const staggerFast = {
  visible: { transition: { staggerChildren: 0.06 } },
};

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

/* ── extraction row data ──────────────────────────────────────────────── */

const extractionRows = [
  { label: 'Brand tokens', detail: 'Colors: #1E40AF, #F59E0B \u00b7 Font: Inter \u00b7 Logo detected' },
  { label: 'Products', detail: '8 services found (Emergency Repair, Water Heater, etc.)' },
  { label: 'Team', detail: '4 team members identified from About page' },
  { label: 'Social profiles', detail: 'Instagram, Facebook, Google Business linked' },
  { label: 'Reviews', detail: '47 Google reviews imported (4.8\u2605 average)' },
  { label: 'Competitors', detail: '3 local competitors identified via Perplexity' },
  { label: 'Contact info', detail: 'Phone, email, 2 addresses geocoded' },
];

/* ── benefit cards data ───────────────────────────────────────────────── */

const benefits = [
  {
    icon: Layers,
    title: '14 domains seeded',
    desc: 'Projects, tasks, leads, campaigns, products, operations, team structure \u2014 all generated from your company intelligence. Your workspace is productive from day one.',
  },
  {
    icon: Paintbrush,
    title: 'Brand injection',
    desc: 'Extracted colors, fonts, and design tokens automatically inject into any website you build in HABOS. Your sites look like yours, not a template.',
  },
  {
    icon: KeyRound,
    title: 'Pre-signup scraping',
    desc: 'Visitors can start before creating an account. Results are cached and claimed via secure token after signup. See value before committing.',
  },
];

/* ── tech strip data ──────────────────────────────────────────────────── */

const techItems = [
  'Confidence-scored extraction',
  'Multi-platform detection',
  '7-step intelligence workflow',
  'Social profile expansion',
  'Deterministic workspace seeding',
];

/* ── page component ───────────────────────────────────────────────────── */

const Scraper: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Main ──────────────────────────────────────────────────────── */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ── 1. Hero ───────────────────────────────────────────────── */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="mb-20 max-w-3xl"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <span className="inline-block px-4 py-1.5 bg-orange-500/10 text-orange-700 rounded-full text-sm font-medium mb-6">
                Company Intelligence
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6, ease: easeOutExpo }}
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-[1.1]"
            >
              One URL. Your Entire<br />
              Business, Extracted.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-lg md:text-xl text-slate-500 max-w-2xl leading-relaxed"
            >
              Enter your website. HABOS crawls it, extracts your brand identity, products,
              team, and social profiles &mdash; then seeds your entire workspace with real data.
              Ready to work in minutes.
            </motion.p>
          </motion.section>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mb-16">
            <p className="text-lg text-slate-600 leading-relaxed">
              Enter your company website URL and HABOS runs a seven-step intelligence workflow: identity resolution, human review, internal source analysis, external research via Perplexity, financial data gathering, social profile expansion, and final approval. Every data point carries a confidence score — Shopify API data scores 1.0, structured data 0.94, markdown extraction 0.58. The system then generates fourteen domains of workspace data from your company intelligence, so you walk into a working system, not an empty shell.
            </p>
          </motion.div>

          {/* ── 2. Mock Extraction Flow ───────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: easeOutExpo }}
            className="mb-20"
          >
            <div className="bg-orange-50/50 rounded-3xl p-6 md:p-8">
              {/* URL input bar */}
              <div className="bg-white rounded-xl border border-slate-200 px-5 py-3 flex items-center gap-3 mb-4 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-orange-400" />
                <span className="text-sm font-mono text-slate-700">hendersonplumbing.com</span>
                <div className="ml-auto">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-full"
                  >
                    Extracting...
                  </motion.div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center my-3">
                <ChevronDown size={20} className="text-orange-400" />
              </div>

              {/* Extraction result rows */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerFast}
                className="space-y-1"
              >
                {extractionRows.map((row) => (
                  <motion.div
                    key={row.label}
                    variants={fadeUp}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-lg p-3 border border-slate-100 flex items-start gap-3"
                  >
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mt-0.5">
                      <Check size={12} className="text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-slate-800">{row.label}</span>
                      <span className="text-sm text-slate-500 ml-2">&mdash; {row.detail}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Confidence note */}
              <p className="mt-5 text-sm text-slate-500 leading-relaxed px-1">
                Every data point carries a confidence score. Shopify API data: <span className="font-mono text-slate-700">1.0</span>.
                Structured data: <span className="font-mono text-slate-700">0.94</span>.
                Markdown extraction: <span className="font-mono text-slate-700">0.58</span>.
                You review the high-confidence items first.
              </p>
            </div>
          </motion.section>

          {/* ── 3. Benefit Cards ──────────────────────────────────────── */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="mb-20"
          >
            <div className="grid md:grid-cols-3 gap-5">
              {benefits.map((b) => (
                <motion.div
                  key={b.title}
                  variants={fadeUp}
                  transition={{ duration: 0.5, ease: easeOutExpo }}
                  className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-orange-200 hover:shadow-md transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-4">
                    <b.icon size={18} className="text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{b.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ── 4. Scenario Callout ───────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
            className="mb-20"
          >
            <div className="bg-slate-900 rounded-3xl p-8 md:p-10">
              <p className="text-lg md:text-xl text-slate-200 leading-relaxed">
                A new plumber signs up and enters <span className="text-orange-400 font-mono text-base">hendersonplumbing.com</span>.
                In 90 seconds, HABOS extracts their brand, 8 services, team photos, Google reviews,
                and social profiles. When they land in their workspace, it&rsquo;s already populated &mdash;
                projects for active jobs, products for their services, leads from their contact form,
                and a branded website draft. They didn&rsquo;t configure anything.{' '}
                <span className="text-white font-medium">The software configured itself.</span>
              </p>
            </div>
          </motion.section>

          {/* ── 5. Tech Strip ─────────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-20"
          >
            <div className="bg-slate-900 rounded-2xl px-6 py-5">
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                {techItems.map((item, i) => (
                  <span key={item} className="flex items-center gap-1.5 text-sm text-slate-300">
                    {i > 0 && <span className="text-slate-600 mr-1">&middot;</span>}
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </motion.section>

          {/* ── 6. Closing ────────────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-serif font-medium text-slate-900 mb-4">
              Other platforms start empty.<br />
              HABOS starts with your business already inside.
            </h2>

            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="mt-6 inline-flex items-center gap-2 px-8 py-3 bg-slate-900 text-white text-sm font-medium rounded-full shadow-md hover:bg-slate-800 transition-colors"
              >
                Join Waitlist
                <ArrowRight size={16} />
              </motion.button>
            </a>
          </motion.section>
        </div>
      </main>
    </div>
  );
};

export default Scraper;
