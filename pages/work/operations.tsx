import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mic, MessageSquare, FileText, ClipboardList, AlertTriangle, TrendingDown, Zap } from 'lucide-react';
import { Navbar } from '../../components/Navbar';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

const Sparkline = ({ bars, color }: { bars: number[]; color: string }) => (
  <div className="flex items-end gap-[3px] h-6">
    {bars.map((h, i) => (
      <div
        key={i}
        className="w-[4px] rounded-sm"
        style={{ height: `${h}%`, backgroundColor: color }}
      />
    ))}
  </div>
);

const StatusDot = ({ color }: { color: string }) => (
  <span className="relative flex h-3 w-3 shrink-0">
    <span
      className="absolute inline-flex h-full w-full rounded-full opacity-40 animate-ping"
      style={{ backgroundColor: color }}
    />
    <span
      className="relative inline-flex h-3 w-3 rounded-full"
      style={{ backgroundColor: color }}
    />
  </span>
);

const Operations: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ─── Content ─── */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ━━━ 1. Hero ━━━ */}
          <motion.section {...fadeUp()} className="max-w-3xl mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 text-teal-700 rounded-full text-sm font-medium mb-6">
              <Zap size={14} />
              Operations Intelligence
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-[1.1]">
              Problems Surface Before Anyone Notices.
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-2xl">
              Define your business cadences. Team members report by voice. AI scores health
              automatically and flags anomalies with corrective actions.
            </p>
          </motion.section>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mb-16"><p className="text-lg text-slate-600 leading-relaxed">The Operations module doesn't wait for someone to notice problems — it detects them automatically. Admin configures rules per operation: 'if completion rate drops below 90%, flag yellow; below 70%, flag red.' When team members submit reports via voice, dictation, chat, or form, the system evaluates every rule, calculates compliance scores, produces health status, and immediately surfaces results on the dashboard. Across multiple report runs, it tracks trends and alerts on anomalies before they become crises.</p></motion.div>

          {/* ━━━ 2. Mock health dashboard ━━━ */}
          <motion.section {...fadeUp(0.15)} className="mb-20">
            <div className="bg-teal-50/50 rounded-3xl p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 mb-5">
                Live Health Dashboard
              </p>

              {/* Green — Daily Revenue Report */}
              <div className="bg-white rounded-xl p-4 mb-3 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <StatusDot color="#22c55e" />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">Daily Revenue Report</p>
                    <span className="text-xs text-slate-400">Sales</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-green-600">94%</span>
                  <Sparkline
                    bars={[50, 55, 60, 65, 75, 85, 95]}
                    color="#22c55e"
                  />
                </div>
              </div>

              {/* Yellow — Weekly Safety Audit */}
              <div className="bg-white rounded-xl p-4 mb-3 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <StatusDot color="#eab308" />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">Weekly Safety Audit</p>
                    <span className="text-xs text-slate-400">Field Ops</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-yellow-600">67%</span>
                  <Sparkline
                    bars={[80, 75, 70, 68, 60, 55, 50]}
                    color="#eab308"
                  />
                </div>
              </div>

              {/* Red — Monthly Equipment Check */}
              <div className="bg-white rounded-xl p-4 mb-3 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <StatusDot color="#ef4444" />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">Monthly Equipment Check</p>
                    <span className="text-xs text-slate-400">Maintenance</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-red-600">41%</span>
                  <Sparkline
                    bars={[90, 80, 65, 55, 48, 44, 40]}
                    color="#ef4444"
                  />
                </div>
              </div>

              {/* AI alert card */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5 flex items-start gap-3">
                <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-800 leading-relaxed">
                  <span className="font-semibold">AI Action:</span> Equipment check completion dropped
                  from 95% to 41% this month. Recommend: schedule mandatory training + reassign to
                  senior technician.
                </p>
              </div>

              <p className="text-xs text-slate-400 text-center">
                Health scores update automatically when reports are submitted. No manual tracking.
              </p>
            </div>
          </motion.section>

          {/* ━━━ 3. Three benefit cards ━━━ */}
          <motion.section {...fadeUp(0.25)} className="mb-20">
            <div className="grid md:grid-cols-3 gap-6">
              {/* 4 ways to report */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Mic size={18} className="text-teal-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">4 ways to report</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Voice interview, dictation, chat, or traditional form. Field workers fill reports
                  by talking on the drive back. No clipboards.
                </p>
              </div>

              {/* Rules catch problems */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center">
                    <TrendingDown size={18} className="text-teal-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Rules catch problems</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Configure thresholds: &ldquo;if daily_revenue &lt; $5K, flag RED.&rdquo; Compliance
                  scoring tracks timeliness. Late = proportionally lower score.
                </p>
              </div>

              {/* AI corrective actions */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Zap size={18} className="text-teal-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">AI corrective actions</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  When health drops, AI generates 3-5 specific actions with urgency levels. Not vague
                  advice — concrete next steps routed to the right people.
                </p>
              </div>
            </div>
          </motion.section>

          {/* ━━━ 4. Before / After ━━━ */}
          <motion.section {...fadeUp(0.35)} className="mb-20">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Without HABOS */}
              <div className="bg-slate-100 rounded-2xl p-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
                  Without HABOS
                </p>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Friday: &ldquo;How&rsquo;s the safety audit going?&rdquo; &ldquo;Uh, let me
                  check.&rdquo; Monday: &ldquo;Turns out 3 sites skipped it.&rdquo; Wednesday:
                  incident report.
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  Problem discovered: 5 days late
                </p>
              </div>

              {/* With HABOS */}
              <div className="bg-teal-50 rounded-2xl p-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 mb-4">
                  With HABOS
                </p>
                <p className="text-teal-800 leading-relaxed mb-6">
                  Tuesday: Auto-alert — &ldquo;Safety audit completion at 67%, 3 sites overdue.
                  Suggested: reassign to backup inspectors.&rdquo; Action taken same day.
                </p>
                <p className="text-sm font-semibold text-teal-900">
                  Problem flagged: day of
                </p>
              </div>
            </div>
          </motion.section>

          {/* ━━━ 5. Tech strip ━━━ */}
          <motion.section {...fadeUp(0.45)} className="mb-20">
            <div className="bg-slate-950 rounded-2xl py-5 px-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
              <span>BPMN-style flow diagrams</span>
              <span className="text-slate-600">&middot;</span>
              <span>Rule-based health scoring</span>
              <span className="text-slate-600">&middot;</span>
              <span>7-day trend sparklines</span>
              <span className="text-slate-600">&middot;</span>
              <span>AI corrective actions</span>
              <span className="text-slate-600">&middot;</span>
              <span>4 report fill modes</span>
            </div>
          </motion.section>

          {/* ━━━ 6. Closing CTA ━━━ */}
          <motion.section {...fadeUp(0.55)} className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-slate-900 mb-5 leading-tight">
              Other tools track what happened.<br />
              HABOS catches what&rsquo;s about to go wrong.
            </h2>
            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 px-8 py-3.5 bg-teal-600 text-white rounded-full font-medium text-sm shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition-colors"
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

export default Operations;
