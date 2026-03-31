import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FormInput,
  Keyboard,
  MessageSquare,
  Mic,
  Users,
  GitBranch,
  Globe,
  ChevronDown,
} from 'lucide-react';

/* ── animation helpers ─────────────────────────────────────────────────── */

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

/* ── benefit cards data ────────────────────────────────────────────────── */

const benefits = [
  {
    icon: Users,
    title: 'Auto-CRM + tickets',
    desc: 'Submissions auto-upsert CRM contacts (deduped by email) and create tickets with smart field mapping and routing rules.',
  },
  {
    icon: GitBranch,
    title: 'Conditional routing',
    desc: 'If budget > $5K \u2192 create ticket priority: high. If service = HVAC \u2192 assign to Sarah. Rules run automatically on every submission.',
  },
  {
    icon: Globe,
    title: 'Website embedding',
    desc: 'Embed on your HABOS site with transparent background and auto-height. Cross-origin resize messaging keeps it seamless.',
  },
];

/* ── tech strip items ─────────────────────────────────────────────────── */

const techItems = [
  '21 field types',
  '3 fill modes',
  'Conditional routing',
  'Auto-CRM upsert',
  'View + conversion analytics',
];

/* ── mock form field data ─────────────────────────────────────────────── */

const serviceOptions = ['Plumbing', 'HVAC', 'Electrical'];
const budgetOptions = ['< $1K', '$1\u20135K', '$5K+'];

/* ── component ─────────────────────────────────────────────────────────── */

const Forms: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* ─── Navigation ─── */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'circOut' }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-5 md:px-12 bg-white/80 backdrop-blur-xl border-b border-slate-100"
        style={{ paddingTop: 'calc(1.25rem + env(safe-area-inset-top, 0px))' }}
      >
        <a href="/work">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 px-4 py-2 rounded-full border border-slate-100 shadow-sm"
          >
            <ArrowLeft size={16} className="text-slate-600" />
            <span className="font-medium text-sm text-slate-600">Back to Work</span>
          </motion.div>
        </a>

        <div className="absolute left-1/2 -translate-x-1/2">
          <a href="/">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 px-4 py-2 rounded-full border border-slate-100 shadow-sm"
            >
              <img src="/Logo/habos-icon.svg" alt="HABOS" className="h-8 w-8" />
              <span className="font-semibold text-sm tracking-tight text-slate-900">HABOS</span>
            </motion.div>
          </a>
        </div>

        <div className="w-32" />
      </motion.nav>

      {/* ─── Content ─── */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ━━━ 1. Hero ━━━ */}
          <motion.section {...fadeUp()} className="max-w-3xl mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-700 rounded-full text-sm font-medium mb-6">
              <FormInput size={14} />
              Form Builder
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-[1.1]">
              Build a Form.<br />
              It Does the Rest.
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-2xl">
              21 field types, drag-and-drop builder, and routing rules that auto-create tickets, CRM leads, and funnel enrollments on submission.
            </p>
          </motion.section>

          {/* ━━━ 2. Mock form ━━━ */}
          <motion.section {...fadeUp(0.15)} className="mb-20">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl max-w-xl mx-auto">
              {/* Form header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Request a Quote</h2>
                <span className="px-3 py-1 bg-cyan-500/10 text-cyan-700 rounded-full text-xs font-medium">
                  3 fill modes
                </span>
              </div>

              {/* Fields */}
              <div className="space-y-4 mb-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                  <div className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 flex items-center">
                    <span className="text-sm text-slate-400">John Henderson</span>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <div className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 flex items-center">
                    <span className="text-sm text-slate-400">john@example.com</span>
                  </div>
                </div>

                {/* Service Needed — Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Service Needed</label>
                  <div className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 flex items-center justify-between">
                    <span className="text-sm text-slate-400">Plumbing</span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </div>
                  <div className="flex gap-1.5 mt-1.5">
                    {serviceOptions.map((opt) => (
                      <span key={opt} className="text-[10px] text-slate-400 bg-slate-100 rounded px-1.5 py-0.5">
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Budget Range — Select */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Budget Range</label>
                  <div className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 flex items-center justify-between">
                    <span className="text-sm text-slate-400">$5K+</span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </div>
                  <div className="flex gap-1.5 mt-1.5">
                    {budgetOptions.map((opt) => (
                      <span key={opt} className="text-[10px] text-slate-400 bg-slate-100 rounded px-1.5 py-0.5">
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Describe your project — Textarea */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Describe your project</label>
                  <div className="w-full h-24 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                    <span className="text-sm text-slate-400">Bathroom renovation, full tear-out and rebuild...</span>
                  </div>
                </div>
              </div>

              {/* Submit + mode icons */}
              <div className="flex items-center justify-between">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2.5 bg-cyan-600 text-white rounded-full text-sm font-semibold shadow-lg shadow-cyan-600/20 hover:bg-cyan-700 transition-colors"
                >
                  Submit
                </motion.button>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center" title="Form mode">
                      <Keyboard size={13} />
                    </div>
                    <span className="text-[10px] font-medium">Form</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center" title="Chat mode">
                      <MessageSquare size={13} />
                    </div>
                    <span className="text-[10px] font-medium">Chat</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center" title="Voice mode">
                      <Mic size={13} />
                    </div>
                    <span className="text-[10px] font-medium">Voice</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Caption below form */}
            <p className="text-sm text-slate-500 mt-6 leading-relaxed text-center max-w-lg mx-auto">
              Customers can fill traditionally, talk to an AI chatbot, or speak their answers. Same form, three input modes.
            </p>
          </motion.section>

          {/* ━━━ 3. Three benefit cards ━━━ */}
          <motion.section {...fadeUp(0.25)} className="mb-20">
            <div className="grid md:grid-cols-3 gap-4">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="bg-white border border-slate-200 rounded-2xl p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <b.icon size={18} className="text-cyan-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">{b.title}</h3>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ━━━ 4. Scenario callout ━━━ */}
          <motion.section {...fadeUp(0.35)} className="mb-20">
            <div className="bg-slate-950 rounded-3xl p-6 md:p-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-4">
                Real scenario
              </p>
              <p className="text-slate-300 leading-relaxed text-base md:text-lg">
                A homeowner visits your website and fills out a quote request for a $8K bathroom renovation.
                HABOS creates a high-priority ticket (budget &gt; $5K rule), upserts them in CRM, enrolls
                them in the &ldquo;warm lead&rdquo; funnel, and sends a confirmation email &mdash; all before
                you see the notification. When you open the ticket, their full CRM profile, project context,
                and suggested response are already there.
              </p>
            </div>
          </motion.section>

          {/* ━━━ 5. Tech strip ━━━ */}
          <motion.section {...fadeUp(0.45)} className="mb-20">
            <div className="bg-slate-950 rounded-2xl py-5 px-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
              {techItems.map((item, i) => (
                <React.Fragment key={item}>
                  {i > 0 && <span className="text-slate-600">&middot;</span>}
                  <span>{item}</span>
                </React.Fragment>
              ))}
            </div>
          </motion.section>

          {/* ━━━ 6. Closing CTA ━━━ */}
          <motion.section {...fadeUp(0.55)} className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-slate-900 mb-5 leading-tight">
              Other form tools collect data.<br />
              HABOS acts on it.
            </h2>
            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 px-8 py-3.5 bg-cyan-600 text-white rounded-full font-medium text-sm shadow-lg shadow-cyan-600/20 hover:bg-cyan-700 transition-colors"
              >
                Join Waitlist
              </motion.button>
            </a>
          </motion.section>

        </div>
      </main>
    </div>
  );
};

export default Forms;
