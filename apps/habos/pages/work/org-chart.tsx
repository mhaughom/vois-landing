import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@li/shared/components/Navbar';
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
import { useTranslation } from 'react-i18next';

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

/* ── benefit icon components ───────────────────────────────────────────── */

const benefitIcons = [Shield, ClipboardList, GitBranch];
const benefitColors = ['indigo', 'violet', 'sky'] as const;

const colorMap: Record<string, { iconBg: string; iconText: string }> = {
  indigo: { iconBg: 'bg-indigo-100', iconText: 'text-indigo-600' },
  violet: { iconBg: 'bg-violet-100', iconText: 'text-violet-600' },
  sky:    { iconBg: 'bg-sky-100',    iconText: 'text-sky-600' },
};

/* ── page component ────────────────────────────────────────────────────── */

const OrgChart: React.FC = () => {
  const { t } = useTranslation('work-org-chart');

  const techItems = t('techStrip.items', { returnObjects: true }) as string[];

  const ceoNode = t('orgNodes.ceo', { returnObjects: true }) as { name: string; role: string };
  const vpOpsNode = t('orgNodes.vpOps', { returnObjects: true }) as { name: string; role: string };
  const vpSalesNode = t('orgNodes.vpSales', { returnObjects: true }) as { name: string; role: string };
  const fieldOpsLeadNode = t('orgNodes.fieldOpsLead', { returnObjects: true }) as { name: string; role: string; draft: string };
  const logisticsCoordNode = t('orgNodes.logisticsCoord', { returnObjects: true }) as { name: string; role: string };
  const accountExecNode = t('orgNodes.accountExec', { returnObjects: true }) as { name: string; role: string };
  const salesRepNode = t('orgNodes.salesRep', { returnObjects: true }) as { name: string; role: string };

  const ceo: OrgNode = { ...ceoNode, bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-900' };
  const heads: OrgNode[] = [
    { ...vpOpsNode, bg: 'bg-indigo-600', text: 'text-white', border: 'border-indigo-600' },
    { ...vpSalesNode, bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-600' },
  ];
  const members: OrgNode[] = [
    { ...fieldOpsLeadNode, bg: 'bg-white', text: 'text-slate-900', border: 'border-indigo-300' },
    { ...logisticsCoordNode, bg: 'bg-white', text: 'text-slate-900', border: 'border-indigo-200' },
    { ...accountExecNode, bg: 'bg-white', text: 'text-slate-900', border: 'border-emerald-200' },
    { ...salesRepNode, bg: 'bg-white', text: 'text-slate-900', border: 'border-emerald-200' },
  ];

  const benefitKeys = ['permissions', 'raci', 'dual'] as const;

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
              <span className="inline-block px-4 py-1.5 bg-indigo-500/10 text-indigo-700 rounded-full text-sm font-medium mb-6">
                {t('badge')}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6, ease: EASE_OUT }}
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-5 leading-[1.1]"
            >
              {t('hero.title')}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5, ease: EASE_OUT }}
              className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl"
            >
              {t('hero.description')}
            </motion.p>
          </motion.section>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mb-16">
            <p className="text-lg text-slate-600 leading-relaxed">
              {t('body')}
            </p>
          </motion.div>

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
                {t('orgChart.caption')}
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
            {benefitKeys.map((key, i) => {
              const color = benefitColors[i] ?? 'indigo';
              const c = colorMap[color];
              const Icon = benefitIcons[i];
              return (
                <motion.div
                  key={key}
                  variants={fadeUp}
                  transition={{ duration: 0.5, ease: EASE_OUT }}
                  className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm"
                >
                  <div className={`w-11 h-11 ${c.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon size={22} className={c.iconText} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{t(`benefits.${key}.title`)}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{t(`benefits.${key}.description`)}</p>
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
                <span className="text-white font-medium">{t('scenario.intro')}</span>{' '}
                {t('scenario.narrative')}{' '}
                <span className="text-white font-medium">{t('scenario.highlight')}</span>
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
              {t('cta.heading')}
            </h2>

            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="mt-8 inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-full font-semibold text-base shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
              >
                {t('cta.button')}
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
