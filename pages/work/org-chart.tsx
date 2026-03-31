import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Network,
  Shield,
  Users,
  GitBranch,
  CheckCircle2,
  ClipboardList,
} from 'lucide-react';

/* ── animation helpers ─────────────────────────────────────────────────── */

const EASE_OUT = [0, 0, 0.2, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.10 } },
};

/* ── org-chart mock data ───────────────────────────────────────────────── */

interface OrgNode {
  name: string;
  role: string;
  bg: string;
  text: string;
  border: string;
  draft?: string;
}

const ceo: OrgNode = {
  name: 'Elena Park',
  role: 'CEO',
  bg: 'bg-slate-900',
  text: 'text-white',
  border: 'border-slate-900',
};

const heads: OrgNode[] = [
  { name: 'James Okoro', role: 'VP Operations', bg: 'bg-indigo-600', text: 'text-white', border: 'border-indigo-600' },
  { name: 'Lisa Chen', role: 'VP Sales', bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-600' },
];

const members: OrgNode[] = [
  { name: 'Mike R.', role: 'Field Ops Lead', bg: 'bg-white', text: 'text-slate-900', border: 'border-indigo-300', draft: 'Draft: moved from Sales' },
  { name: 'Sara T.', role: 'Logistics Coord.', bg: 'bg-white', text: 'text-slate-900', border: 'border-indigo-200' },
  { name: 'David K.', role: 'Account Exec', bg: 'bg-white', text: 'text-slate-900', border: 'border-emerald-200' },
  { name: 'Amy J.', role: 'Sales Rep', bg: 'bg-white', text: 'text-slate-900', border: 'border-emerald-200' },
];

/* ── node renderer ─────────────────────────────────────────────────────── */

const NodeCard: React.FC<{ node: OrgNode; className?: string }> = ({ node, className = '' }) => (
  <div
    className={`relative rounded-xl px-4 py-3 border-2 ${node.bg} ${node.text} ${node.border} shadow-sm text-center min-w-[130px] ${
      node.draft ? 'border-dashed !border-amber-500' : ''
    } ${className}`}
  >
    <p className="text-sm font-semibold leading-tight">{node.name}</p>
    <p className={`text-xs mt-0.5 ${node.text === 'text-white' ? 'text-white/70' : 'text-slate-500'}`}>{node.role}</p>
    {node.draft && (
      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
        ({node.draft})
      </span>
    )}
  </div>
);

/* ── connector lines (pure CSS) ────────────────────────────────────────── */

const Connector: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`w-px bg-slate-300 ${className}`} />
);

const HLine: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`h-px bg-slate-300 ${className}`} />
);

/* ── benefit cards data ────────────────────────────────────────────────── */

const benefits = [
  {
    icon: Shield,
    title: '37-app permissions',
    desc: 'Auto-scoped by department and org level. When someone moves, their permissions update instantly across every connected tool.',
    color: 'indigo',
  },
  {
    icon: ClipboardList,
    title: 'RACI tracking',
    desc: 'Define who owns, approves, consults, and gets informed for every process. Never wonder "who signs off on this?" again.',
    color: 'violet',
  },
  {
    icon: GitBranch,
    title: 'Dual reporting',
    desc: 'Matrix structures with primary and secondary managers. Dotted-line relationships are first-class citizens, not afterthoughts.',
    color: 'sky',
  },
] as const;

const colorMap: Record<string, { iconBg: string; iconText: string }> = {
  indigo: { iconBg: 'bg-indigo-100', iconText: 'text-indigo-600' },
  violet: { iconBg: 'bg-violet-100', iconText: 'text-violet-600' },
  sky:    { iconBg: 'bg-sky-100',    iconText: 'text-sky-600' },
};

/* ── tech strip items ──────────────────────────────────────────────────── */

const techItems = [
  'ReactFlow visualization',
  'Sandbox drafts',
  'Atomic apply',
  '37-app permission matrix',
  'RACI responsibility',
] as const;

/* ── page component ────────────────────────────────────────────────────── */

const OrgChart: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Nav ───────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'circOut' }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-6 md:px-12 bg-white/80 backdrop-blur-xl border-b border-slate-100"
        style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}
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
              <span className="inline-block px-4 py-1.5 bg-indigo-500/10 text-indigo-700 rounded-full text-sm font-medium mb-6">
                Team Management
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6, ease: EASE_OUT }}
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-5 leading-[1.1]"
            >
              Drag. Drop.<br />Reorganize.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5, ease: EASE_OUT }}
              className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl"
            >
              Interactive org chart with sandbox drafts — model reorganizations, diff against
              current state, and apply atomically. Plus a 37-app permission matrix that
              auto-scopes by department and seniority.
            </motion.p>
          </motion.section>

          {/* ── 2. Mock Org Chart ─────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: EASE_OUT }}
            className="mb-20"
          >
            <div className="bg-indigo-50/50 rounded-3xl p-6 md:p-8 overflow-hidden">
              {/* Tree visualization */}
              <div className="flex flex-col items-center gap-0">
                {/* CEO */}
                <NodeCard node={ceo} />
                <Connector className="h-6" />

                {/* Horizontal connector between heads */}
                <div className="relative w-full max-w-md">
                  <HLine className="absolute top-0 left-1/4 right-1/4" />
                  {/* vertical taps down from h-line */}
                  <div className="flex justify-between px-[25%]">
                    <Connector className="h-6" />
                    <Connector className="h-6" />
                  </div>
                </div>

                {/* Department Heads */}
                <div className="flex gap-8 md:gap-16 justify-center">
                  {heads.map((h) => (
                    <NodeCard key={h.name} node={h} />
                  ))}
                </div>

                {/* Connectors to team members */}
                <div className="flex gap-8 md:gap-16 justify-center w-full">
                  {/* Ops side */}
                  <div className="flex flex-col items-center">
                    <Connector className="h-6" />
                    <div className="relative">
                      <HLine className="w-32 md:w-40" />
                      <div className="flex justify-between">
                        <Connector className="h-5" />
                        <Connector className="h-5" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <NodeCard node={members[0]} className="mb-8" />
                      <NodeCard node={members[1]} />
                    </div>
                  </div>

                  {/* Sales side */}
                  <div className="flex flex-col items-center">
                    <Connector className="h-6" />
                    <div className="relative">
                      <HLine className="w-32 md:w-40" />
                      <div className="flex justify-between">
                        <Connector className="h-5" />
                        <Connector className="h-5" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <NodeCard node={members[2]} />
                      <NodeCard node={members[3]} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Caption */}
              <p className="text-center text-sm text-slate-500 mt-10 max-w-lg mx-auto leading-relaxed">
                Create a draft, model the reorg, preview the diff, and apply when ready.
                No one sees changes until you publish.
              </p>
            </div>
          </motion.section>

          {/* ── 3. Three Benefit Cards ────────────────────────────────── */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6 mb-20"
          >
            {benefits.map((b) => {
              const c = colorMap[b.color];
              return (
                <motion.div
                  key={b.title}
                  variants={fadeUp}
                  transition={{ duration: 0.5, ease: EASE_OUT }}
                  className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm"
                >
                  <div className={`w-11 h-11 ${c.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                    <b.icon size={22} className={c.iconText} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{b.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{b.desc}</p>
                </motion.div>
              );
            })}
          </motion.section>

          {/* ── 4. Scenario Callout ───────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
            className="mb-20"
          >
            <div className="bg-slate-950 rounded-3xl p-8 md:p-12 text-white">
              <p className="text-lg md:text-xl leading-relaxed text-slate-300">
                <span className="text-white font-medium">You're restructuring the field ops team.</span>{' '}
                Instead of making live changes and confusing everyone, you create a draft. Drag Mike
                from Sales to Operations, add a new team lead position, and preview the diff.
                Three people moved, two reporting lines changed. You review, approve, and publish —{' '}
                <span className="text-white font-medium">the entire org updates atomically.</span>
              </p>
            </div>
          </motion.section>

          {/* ── 5. Tech Strip ─────────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            className="mb-20"
          >
            <div className="flex flex-wrap justify-center gap-3">
              {techItems.map((item) => (
                <span
                  key={item}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm font-medium"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.section>

          {/* ── 6. Closing ────────────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-slate-900 mb-4 leading-tight max-w-2xl mx-auto">
              Other org charts are a static PDF.<br />
              HABOS org charts are a live command center.
            </h2>

            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="mt-8 inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-full font-semibold text-base shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
              >
                Join Waitlist
                <ArrowRight size={18} />
              </motion.button>
            </a>
          </motion.section>

        </div>
      </main>
    </div>
  );
};

export default OrgChart;
