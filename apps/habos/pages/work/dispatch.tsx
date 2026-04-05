import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@li/shared/components/Navbar';
import {
  ArrowLeft,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Truck,
  Repeat,
  Zap,
  ArrowRight,
  Layers,
  Camera,
  FileText,
  Route,
  Ticket,
  GripVertical,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

/* ── animation helpers ─────────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.10 } },
};

/* ── types ─────────────────────────────────────────────────────────────── */

interface JobCard {
  id: string;
  title: string;
  time?: string;
  status: 'completed' | 'in-progress' | 'planned' | 'emergency';
  priority?: string;
}

interface CrewLane {
  name: string;
  statusLabel: string;
  statusColor: string; // tailwind color token
  jobs: JobCard[];
}

/* ── sub-components ────────────────────────────────────────────────────── */

const StatusBadge: React.FC<{ color: string; label: string }> = ({ color, label }) => {
  if (!label) return null;
  const map: Record<string, string> = {
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
    gray:  'bg-slate-100 text-slate-500',
  };
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${map[color] ?? map.gray}`}>
      {label}
    </span>
  );
};

const JobCardUI: React.FC<{ job: JobCard; draggable?: boolean; statusLabels: Record<string, string> }> = ({ job, draggable, statusLabels }) => {
  const statusMeta: Record<string, { border: string; icon: React.ReactNode; label: string }> = {
    completed:    { border: 'border-l-green-500',  icon: <CheckCircle2 size={14} className="text-green-600" />, label: statusLabels.completed ?? 'completed' },
    'in-progress':{ border: 'border-l-blue-500',   icon: <span className="text-blue-600 text-xs">&#x1F535;</span>, label: statusLabels.inProgress ?? 'in progress' },
    planned:      { border: 'border-l-slate-300',   icon: <Clock size={14} className="text-slate-400" />, label: statusLabels.planned ?? 'planned' },
    emergency:    { border: 'border-l-red-500',     icon: <AlertTriangle size={14} className="text-red-500" />, label: '' },
  };
  const meta = statusMeta[job.status];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white rounded-lg p-3 mb-2 border-l-4 ${meta.border} shadow-sm flex items-start gap-2 group`}
    >
      {draggable && (
        <GripVertical size={14} className="text-slate-300 mt-0.5 shrink-0 group-hover:text-slate-500 transition-colors" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 leading-snug">{job.title}</p>
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
          {job.time && <span>{job.time}</span>}
          {meta.icon}
          {meta.label && <span>{meta.label}</span>}
          {job.priority && (
            <span className="text-red-600 font-semibold">{statusLabels.priority ?? 'Priority:'} {job.priority}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ── page component ────────────────────────────────────────────────────── */

const Dispatch: React.FC = () => {
  const { t } = useTranslation('work-dispatch');

  const techItems = t('techStrip.items', { returnObjects: true }) as string[];
  const statusLabels = {
    completed: t('statusLabels.completed'),
    inProgress: t('statusLabels.inProgress'),
    planned: t('statusLabels.planned'),
    priority: t('statusLabels.priority'),
  };

  const initialLanes: CrewLane[] = [
    {
      name: t('lanes.mikeName'),
      statusLabel: t('lanes.mikeStatus'),
      statusColor: 'green',
      jobs: [
        { id: 'j1', title: t('jobs.hendersonWaterHeater'), time: '9:00 AM', status: 'completed' },
        { id: 'j2', title: t('jobs.bakerHvac'), time: '11:30 AM', status: 'in-progress' },
      ],
    },
    {
      name: t('lanes.sarahName'),
      statusLabel: t('lanes.sarahStatus'),
      statusColor: 'amber',
      jobs: [
        { id: 'j3', title: t('jobs.wilsonPlumbing'), time: '10:00 AM', status: 'completed' },
        { id: 'j4', title: t('jobs.garciaElectrical'), time: '1:00 PM', status: 'planned' },
      ],
    },
    {
      name: t('lanes.unscheduledName'),
      statusLabel: '',
      statusColor: 'gray',
      jobs: [
        { id: 'j5', title: t('jobs.emergencyJohnson'), status: 'emergency', priority: 'HIGH' },
      ],
    },
  ];

  /* simple interactive state: allow "assigning" the emergency to Mike */
  const [lanes, setLanes] = useState(initialLanes);
  const [assigned, setAssigned] = useState(false);

  const handleAssign = () => {
    if (assigned) return;
    setAssigned(true);
    const emergency = lanes[2].jobs[0];
    setLanes((prev) => [
      { ...prev[0], jobs: [...prev[0].jobs, { ...emergency, status: 'planned', time: '12:00 PM' }] },
      prev[1],
      { ...prev[2], jobs: [] },
    ]);
  };

  const benefitCards = [
    {
      icon: <Layers size={22} className="text-blue-600" />,
      title: t('benefits.statusFlow.title'),
      body: t('benefits.statusFlow.description'),
      accent: 'bg-blue-50 border-blue-100',
    },
    {
      icon: <Zap size={22} className="text-amber-600" />,
      title: t('benefits.autoGenerated.title'),
      body: t('benefits.autoGenerated.description'),
      accent: 'bg-amber-50 border-amber-100',
    },
    {
      icon: <Repeat size={22} className="text-emerald-600" />,
      title: t('benefits.recurrence.title'),
      body: t('benefits.recurrence.description'),
      accent: 'bg-emerald-50 border-emerald-100',
    },
  ];

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
              <span className="inline-block px-4 py-1.5 bg-blue-500/10 text-blue-700 rounded-full text-sm font-medium mb-6">
                {t('badge')}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-[1.1]"
            >
              {t('hero.title')}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-lg md:text-xl text-slate-500 max-w-2xl leading-relaxed"
            >
              {t('hero.description')}
            </motion.p>
          </motion.section>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mb-16"><p className="text-lg text-slate-600 leading-relaxed">{t('body')}</p></motion.div>

          {/* ── 2. Mock Dispatch Board ────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mb-20"
          >
            <div className="bg-blue-50/50 rounded-3xl p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {lanes.map((lane) => (
                  <div key={lane.name} className="bg-white/60 rounded-2xl p-4 border border-slate-100">
                    {/* Lane header */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm font-semibold text-slate-800">{lane.name}</span>
                      <StatusBadge color={lane.statusColor} label={lane.statusLabel} />
                    </div>

                    {/* Job cards */}
                    <AnimatePresence mode="popLayout">
                      {lane.jobs.map((job) => (
                        <JobCardUI key={job.id} job={job} draggable={job.status === 'emergency' && !assigned} statusLabels={statusLabels} />
                      ))}
                    </AnimatePresence>

                    {lane.name === t('lanes.unscheduledName') && lane.jobs.length === 0 && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-slate-400 text-center py-4"
                      >
                        {t('board.noUnscheduled')}
                      </motion.p>
                    )}
                  </div>
                ))}
              </div>

              {/* Interactive prompt */}
              <div className="mt-6 text-center">
                {!assigned ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAssign}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-full shadow-sm hover:bg-blue-700 transition-colors"
                  >
                    <Truck size={16} />
                    {t('board.assignButton')}
                    <ArrowRight size={14} />
                  </motion.button>
                ) : (
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-blue-700 font-medium"
                  >
                    {t('board.assignedConfirmation')}
                  </motion.p>
                )}
              </div>
            </div>
          </motion.section>

          {/* ── 3. Three Benefit Cards ────────────────────────────────── */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20"
          >
            {benefitCards.map((card) => (
              <motion.div
                key={card.title}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className={`rounded-2xl border p-6 ${card.accent}`}
              >
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm mb-4">
                  {card.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{card.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{card.body}</p>
              </motion.div>
            ))}
          </motion.section>

          {/* ── 4. Scenario Callout ───────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
            className="mb-20"
          >
            <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12">
              <p className="text-lg md:text-xl leading-relaxed text-slate-200">
                {t('scenario')}
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
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 px-6 py-5 bg-slate-50 rounded-2xl">
              {techItems.map((item, i) => {
                const icons = [<Zap size={14} />, <Camera size={14} />, <FileText size={14} />, <Route size={14} />, <Ticket size={14} />];
                return (
                  <span key={item} className="flex items-center gap-1.5 text-sm text-slate-600">
                    <span className="text-slate-400">{icons[i]}</span>
                    {item}
                  </span>
                );
              })}
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
              {t('cta.heading')}
            </h2>

            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="mt-6 inline-flex items-center gap-2 px-8 py-3 bg-slate-900 text-white text-sm font-medium rounded-full shadow-md hover:bg-slate-800 transition-colors"
              >
                {t('cta.button')}
                <ArrowRight size={16} />
              </motion.button>
            </a>
          </motion.section>
        </div>
      </main>
    </div>
  );
};

export default Dispatch;
