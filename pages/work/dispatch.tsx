import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

/* ── data ──────────────────────────────────────────────────────────────── */

const initialLanes: CrewLane[] = [
  {
    name: 'Mike T.',
    statusLabel: 'On site',
    statusColor: 'green',
    jobs: [
      { id: 'j1', title: 'Henderson Water Heater', time: '9:00 AM', status: 'completed' },
      { id: 'j2', title: 'Baker HVAC Repair', time: '11:30 AM', status: 'in-progress' },
    ],
  },
  {
    name: 'Sarah L.',
    statusLabel: 'En route',
    statusColor: 'amber',
    jobs: [
      { id: 'j3', title: 'Wilson Plumbing', time: '10:00 AM', status: 'completed' },
      { id: 'j4', title: 'Garcia Electrical', time: '1:00 PM', status: 'planned' },
    ],
  },
  {
    name: 'Unscheduled',
    statusLabel: '',
    statusColor: 'gray',
    jobs: [
      { id: 'j5', title: 'Emergency: Johnson Leak', status: 'emergency', priority: 'HIGH' },
    ],
  },
];

const statusMeta: Record<string, { border: string; icon: React.ReactNode; label: string }> = {
  completed:    { border: 'border-l-green-500',  icon: <CheckCircle2 size={14} className="text-green-600" />, label: 'completed' },
  'in-progress':{ border: 'border-l-blue-500',   icon: <span className="text-blue-600 text-xs">&#x1F535;</span>, label: 'in progress' },
  planned:      { border: 'border-l-slate-300',   icon: <Clock size={14} className="text-slate-400" />, label: 'planned' },
  emergency:    { border: 'border-l-red-500',     icon: <AlertTriangle size={14} className="text-red-500" />, label: '' },
};

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

const JobCardUI: React.FC<{ job: JobCard; draggable?: boolean }> = ({ job, draggable }) => {
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
            <span className="text-red-600 font-semibold">Priority: {job.priority}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ── page component ────────────────────────────────────────────────────── */

const Dispatch: React.FC = () => {
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
              <span className="inline-block px-4 py-1.5 bg-blue-500/10 text-blue-700 rounded-full text-sm font-medium mb-6">
                Field Operations
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-[1.1]"
            >
              Dispatch Board.<br />
              Every Job. Every Tech.<br />
              One View.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-lg md:text-xl text-slate-500 max-w-2xl leading-relaxed"
            >
              See who's where, what's next, and what's running behind — all on a single
              day-of board with real-time status updates from the field.
            </motion.p>
          </motion.section>

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
                        <JobCardUI key={job.id} job={job} draggable={job.status === 'emergency' && !assigned} />
                      ))}
                    </AnimatePresence>

                    {lane.name === 'Unscheduled' && lane.jobs.length === 0 && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-slate-400 text-center py-4"
                      >
                        No unscheduled jobs
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
                    Drag the emergency job to Mike's queue
                    <ArrowRight size={14} />
                  </motion.button>
                ) : (
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-blue-700 font-medium"
                  >
                    Mike's phone buzzes with the new job, address, and instructions. Board updates in real-time.
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
            {[
              {
                icon: <Layers size={22} className="text-blue-600" />,
                title: '7-step status flow',
                body: 'Planned \u2192 dispatched \u2192 en route \u2192 arrived \u2192 in progress \u2192 completed \u2192 invoiced. Every transition logged with timestamp and location.',
                accent: 'bg-blue-50 border-blue-100',
              },
              {
                icon: <Zap size={22} className="text-amber-600" />,
                title: 'Auto-generated everything',
                body: 'Create a job type once \u2014 new jobs inherit duration, instructions, line items, and report templates. Orders and routes generate automatically.',
                accent: 'bg-amber-50 border-amber-100',
              },
              {
                icon: <Repeat size={22} className="text-emerald-600" />,
                title: 'Recurrence engine',
                body: 'Weekly cleanings, monthly inspections, yearly maintenance. Jobs auto-generate up to 90 days out. Never manually re-create repeating work.',
                accent: 'bg-emerald-50 border-emerald-100',
              },
            ].map((card) => (
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
                It's 10:15 AM. An emergency call comes in — pipe burst at the Johnson property.
                You open the dispatch board, see Mike finishes his current job at 11:30, and drag the
                emergency to his queue. Mike's phone buzzes with the new job, address, and instructions.
                He marks "en route" and the board updates in real-time. The office, the client, and the
                field are all on the same page — without a single phone call.
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
              {[
                { icon: <Zap size={14} />, label: 'Real-time Supabase sync' },
                { icon: <Camera size={14} />, label: 'Photo + signature capture' },
                { icon: <FileText size={14} />, label: 'Job type templates' },
                { icon: <Route size={14} />, label: 'Auto-order generation' },
                { icon: <Ticket size={14} />, label: 'Ticket \u2192 job escalation' },
              ].map((item) => (
                <span key={item.label} className="flex items-center gap-1.5 text-sm text-slate-600">
                  <span className="text-slate-400">{item.icon}</span>
                  {item.label}
                </span>
              ))}
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
              Other dispatch tools are a spreadsheet with a map.<br />
              HABOS is a command center.
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

export default Dispatch;
